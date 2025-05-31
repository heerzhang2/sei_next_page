import * as Minio from 'minio';
import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { Readable } from 'stream';

// 配置参数
const config = {
    // 使用相对路径 + 进程工作目录
    localDir: path.join(process.cwd(), 'data/pdf_files'), // 自动解析为 ./data/pdf_files
    // 其他配置保持不变
    minio: {
        endPoint: 'your-minio-server.com',
        port: 9000,
        useSSL: false,
        accessKey: 'YOUR_ACCESS_KEY',
        secretKey: 'YOUR_SECRET_KEY'
    },
    bucketName: 'pdf-storage',
    chunkSize: 5 * 1024 * 1024,
    concurrency: 3,
    maxRetries: 5
};

// 验证目录存在
const ensureDir = async (dirPath: string) => {
    try {
        await fs.ensureDir(dirPath);
        console.log(`目录已准备: ${dirPath}`);
    } catch (err) {
        console.error(`创建目录失败: ${err}`);
        process.exit(1);
    }
};

// 初始化时调用
ensureDir(config.localDir);

// 初始化 MinIO 客户端
const minioClient = new Minio.Client(config.minio);

export class FileUploader {
    private tasks: any[] = [];
    private progressMap = new Map();
    private completedFiles = new Set();

    constructor() {
        this.loadProgress();
    }
    // ...其他属性保持不变
    // private generateFileStream(localPath: string): Readable;
    // 实现文件流生成方法
    private generateFileStream(localPath: string): Readable {
        const stream = fs.createReadStream(localPath);
        // 手动设置类型（解决 TS 类型推断问题）
        return stream as unknown as Readable;
    }


    // 分片上传核心逻辑
    async uploadFileWithRetry(localPath: string, objectId: string) {
        const fileId = await this.generateFileId(localPath);
        const fileSize = (await fs.stat(localPath)).size;
        const totalChunks = Math.ceil(fileSize / config.chunkSize);

        // 恢复上传进度
        const uploadedChunks = this.progressMap.get(fileId) || [];
        const currentChunk = uploadedChunks.length;

        if (currentChunk === totalChunks) {
            console.log(`文件 ${objectId} 已完全上传`);
            return;
        }

        // 创建分片上传流
        const uploadStream = fs.createReadStream(localPath, {
            start: currentChunk * config.chunkSize,
            end: Math.min((currentChunk + 1) * config.chunkSize - 1, fileSize - 1)
        });

        try {
            await this.uploadStreamWithRetry(
                uploadStream,
                objectId,
                currentChunk,
                totalChunks
            );
            this.completedFiles.add(fileId);
            this.progressMap.delete(fileId);
            this.saveProgress();
        } catch (err) {
            console.error(`文件 ${objectId} 上传失败:`, err);
            throw err;
        }
    }

    // 带重试的分片上传
    private async uploadStreamWithRetry(
        stream: NodeJS.ReadableStream,
        objectId: string,
        chunkIndex: number,
        totalChunks: number
    ) {
        let retryCount = 0;
        const maxAttempts = config.maxRetries + 1;

        while (retryCount < maxAttempts) {
            try {
                // 修正参数类型
                if (stream instanceof Readable) {
                    await this.minioPutObject(
                        objectId,
                        stream,
                        chunkIndex,
                        totalChunks
                    );
                }
                return;
            } catch (err) {
                retryCount++;
                if (retryCount >= maxAttempts) {
                    throw new Error(`分片 ${chunkIndex}/${totalChunks} 上传失败（尝试 ${retryCount} 次）`);
                }
                const delay = this.calculateRetryDelay(retryCount);
                await this.sleep(delay);
            }
        }
    }

// 修正后的 MinIO 上传方法
    private async minioPutObject(
        objectId: string,
        stream: Readable,
        chunkIndex: number,
        totalChunks: number
    ) {
        const fileSize = (await fs.stat(objectId)).size;
        const metaData = {
            'Content-Type': 'application/pdf',
            'X-Amz-Meta-Chunk-Index': chunkIndex.toString(),
            'X-Amz-Meta-Total-Chunks': totalChunks.toString()
        };

        // 使用 Buffer 作为替代方案（解决流类型问题）
        const buffer = await this.streamToBuffer(stream);

        await minioClient.putObject(
            config.bucketName,
            objectId,
            buffer,
            buffer.length,
            metaData
        );
    }

// 流转 Buffer 工具方法
    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    // 批量上传入口
    async batchUpload() {
        try {
            await minioClient.bucketExists(config.bucketName) ||
            minioClient.makeBucket(config.bucketName, 'us-east-1');

            const files = await fs.readdir(config.localDir);
            const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

            console.log(`发现 ${pdfFiles.length} 个PDF文件待上传`);

            const uploadPromises = pdfFiles.map(async (file) => {
                const objectId = `${uuidv4()}-${path.basename(file)}`;
                try {
                    await this.uploadFileWithRetry(
                        path.join(config.localDir, file),
                        objectId
                    );
                    return { status: 'success', file, objectId };
                } catch (err) {
                    return { status: 'failed', file, objectId, error: err };
                }
            });

            const results = await Promise.all(uploadPromises);
            this.printSummary(results);
        } catch (err) {
            console.error('批量上传失败:', err);
        }
    }

    // 辅助方法
    private generateFileId(localPath: string) {
        const fileHash = createHash('sha256');
        const stream = fs.createReadStream(localPath);
        return new Promise((resolve) => {
            stream.on('data', (chunk) => fileHash.update(chunk));
            stream.on('end', () => resolve(fileHash.digest('hex')));
        });
    }

    private calculateRetryDelay(retryCount: number): number {
        const baseDelay = 1000;
        const maxDelay = 30000;
        const jitter = 0.5 + Math.random();
        return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay) * jitter;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private loadProgress() {
        if (fs.existsSync('upload.progress')) {
            // @ts-ignore
            this.progressMap = new Map(JSON.parse(fs.readFileSync('upload.progress')));
        }
    }

    private saveProgress() {
        fs.writeFileSync('upload.progress', JSON.stringify([...this.progressMap]));
    }

    private printSummary(results: any[]) {
        console.log('\n上传完成统计:');
        results.forEach(({ status, file, objectId, error }) => {
            console.log(`${file} [${status === 'success' ? '✅ 成功' : '❌ 失败'}] 
` +
                `对象ID: ${objectId || ''}\n` +
                `错误信息: ${error || ''}\n`);
        });
    }
}
