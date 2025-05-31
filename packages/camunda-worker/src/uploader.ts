import * as Minio from 'minio';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

// 配置参数
const config = {
    minio: {
        endPoint: 'your-minio-server.com',
        port: 9000,
        useSSL: false,
        accessKey: 'YOUR_ACCESS_KEY',
        secretKey: 'YOUR_SECRET_KEY'
    },
    localDir: '/path/to/local/pdf/files/',
    bucketName: 'pdf-storage',
    chunkSize: 5 * 1024 * 1024, // 5MB 分片
    concurrency: 3 // 并发分片数
};

// 初始化 MinIO 客户端
const minioClient = new Minio.Client(config.minio);

// 文件上传队列
interface UploadTask {
    localPath: string;
    objectName: string;
    fileId: string;
    chunks: number[];
    currentChunk: number;
}
const MAX_RETRY = 3;
//整合批量上传和断点续传功能的完整 Node.js 实现方案，结合了 MinIO 分片上传 API 和进度追踪机制
class FileUploader {
    private tasks: UploadTask[] = [];
    private progressMap = new Map<string, number>();
    private completedFiles = new Set<string>();
    private readonly retryConfig = {
        maxRetries: 5,        // 最大重试次数
        baseDelay: 1000,      // 基础延迟时间（毫秒）
        maxDelay: 30000,      // 最大延迟时间（毫秒）
        jitter: true,         // 是否启用抖动
        backoffFactor: 2      // 退避倍数
    };

    constructor() {
        this.loadProgress();
    }

    // 加载已上传进度
    private loadProgress() {
        if (fs.existsSync('upload.progress')) {
            const data = fs.readFileSync('upload.progress', 'utf-8');
            this.progressMap = new Map(JSON.parse(data));
        }
    }

    // 保存上传进度
    private saveProgress() {
        fs.writeFileSync('upload.progress', JSON.stringify([...this.progressMap]));
    }

    // 扫描本地文件
    async scanLocalFiles() {
        const files = await fs.readdir(config.localDir);
        return files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    }
    // 修改后的重试逻辑
    async uploadWithRetry(localPath: string, objectId: string) {
        let retryCount = 0;
        const maxAttempts = this.retryConfig.maxRetries + 1; // 包含首次尝试

        while (retryCount < maxAttempts) {
            try {
                return await this.uploadFile(localPath, objectId);
            } catch (err) {
                retryCount++;

                if (retryCount >= maxAttempts) {
                    this.logRetryFailure(retryCount, err);
                    throw new RetryError(err, objectId, retryCount);
                }

                const delay = this.calculateRetryDelay(retryCount);
                this.logRetryAttempt(retryCount, delay);

                await this.sleep(delay);
            }
        }
    }
// 指数退避算法实现
    private calculateRetryDelay(retryCount: number): number {
        let delay = this.retryConfig.baseDelay * Math.pow(
            this.retryConfig.backoffFactor,
            retryCount - 1
        );

        // 应用最大延迟限制
        delay = Math.min(delay, this.retryConfig.maxDelay);

        // 添加随机抖动（0-100%）
        if (this.retryConfig.jitter) {
            delay *= 0.5 + Math.random();
        }

        return delay;
    }
    // 生成文件唯一标识
    private generateFileId(localPath: string) {
        const fileHash = createHash('sha256');
        const stream = fs.createReadStream(localPath);
        return new Promise<string>((resolve) => {
            stream.on('data', (chunk) => fileHash.update(chunk));
            stream.on('end', () => resolve(fileHash.digest('hex')));
        });
    }
// 辅助方法：延迟函数
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

// 日志记录方法（需自行实现）
    private logRetryAttempt(attempt: number, delay: number) {
        console.log(`[${objectId}] 尝试 ${attempt}/${this.retryConfig.maxRetries}，等待 ${delay.toFixed(0)}ms`);
    }

    private logRetryFailure(attempt: number, error: Error) {
        console.error(`[${objectId}] 已达到最大重试次数 (${attempt}/${this.retryConfig.maxRetries})，错误: ${error.message}`);
    }
    // 分片上传核心逻辑
    async uploadFile(localPath: string, objectId: string) {
        const fileId = await this.generateFileId(localPath);
        const fileSize = (await fs.stat(localPath)).size;
        const totalChunks = Math.ceil(fileSize / config.chunkSize);
        const chunks = Array.from({ length: totalChunks }, (_, i) => i);

        // 恢复上传进度
        const uploadedChunks = this.progressMap.get(fileId) || [];
        const currentChunk = uploadedChunks.length;

        if (currentChunk === totalChunks) {
            console.log(`文件 ${objectId} 已完全上传`);
            return;
        }

        // 创建分片上传
        const upload = minioClient.uploadObject({
            Bucket: config.bucketName,
            Object: objectId,
            FilePath: localPath,
            PartSize: config.chunkSize,
            Concurrent: config.concurrency,
            CheckpointDir: 'checkpoints', // 断点续传元数据目录
            Progress: (p) => {
                const uploaded = Math.floor((p.bytesTransferred / fileSize) * 100);
                this.progressMap.set(fileId, uploaded);
                this.saveProgress();
                console.log(`[${objectId}] 进度: ${uploaded.toFixed(2)}%`);
            }
        });

        try {
            await upload.done();
            console.log(`文件 ${objectId} 上传完成`);
            this.completedFiles.add(fileId);
            this.progressMap.delete(fileId);
            this.saveProgress();
        } catch (err) {
            console.error(`文件 ${objectId} 上传失败:`, err);
            throw err;
        }
    }

    // 批量上传入口
    async batchUpload() {
        try {
            await minioClient.ping();
            console.log('Connected to MinIO server');

            // 自动创建存储桶
            const bucketExists = await minioClient.bucketExists(config.bucketName);
            if (!bucketExists) {
                await minioClient.makeBucket(config.bucketName, 'us-east-1');
                console.log(`Bucket ${config.bucketName} created`);
            }

            const files = await this.scanLocalFiles();
            console.log(`发现 ${files.length} 个PDF文件待上传`);

            // 并行处理上传任务
            const uploadPromises = files.map(async (file) => {
                const objectId = `${uuidv4()}-${path.basename(file)}`;
                try {
                    await this.uploadWithRetry(
                        path.join(config.localDir, file),
                        objectId
                    );
                    return { success: true, file, objectId };
                } catch (err) {
                    console.error(`处理 ${file} 时出错:`, err);
                    return { success: false, file, error: err.message };
                }
            });

            const results = await Promise.all(uploadPromises);
            console.log('\n上传完成统计:');
            results.forEach(({ success, file, objectId, error }) => {
                console.log(`${file} [${success ? '✅ 成功' : '❌ 失败'}] ${objectId || ''} ${error || ''}`);
            });
        } catch (err) {
            console.error('批量上传失败:', err);
        }
    }
}

// 执行流程
(async () => {
    const uploader = new FileUploader();
    await uploader.batchUpload();
})();
