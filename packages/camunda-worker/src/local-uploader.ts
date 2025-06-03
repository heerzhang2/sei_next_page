import * as Minio from 'minio';
import * as fs from 'fs-extra';
import * as path from 'path';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import dotenv from "dotenv";
import {ItemBucketMetadata, Retention, RETENTION_MODES} from "minio";
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';

// 加载环境变量
dotenv.config()
// 配置参数
const config = {
    // 使用相对路径 + 进程工作目录
    localDir: path.join(process.cwd(), 'data'), // 自动解析为 ./data
    // 其他配置保持不变
    minio: {
        endPoint: process.env.MINIO_ENDPOINT!,
        port: process.env.MINIO_PORT as unknown as number,
        useSSL: false,
        accessKey: process.env.MINIO_ACCESSKEY,
        secretKey: process.env.MINIO_SECRETKEY
    },
    bucketName: process.env.MINIO_BUCKETNAME,
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

// 初始化时调用 ： 目录未用到；
ensureDir(config.localDir);

// 初始化 MinIO 客户端
const minioClient = new Minio.Client(config.minio);

interface FileUploaderOptions {
    large_file_threshold: number;
    bucketName: string ;
    lockMode: string;
}

export class FileUploader {
    private options = {} as FileUploaderOptions;
    private tasks: any[] = [];
    private progressMap = new Map();
    private completedFiles = new Set();

    constructor(options: FileUploaderOptions) {
        this.options = options || {};
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
                else throw new Error(`非可读流的`);
                return;
            } catch (err) {
                console.log('PutObject:',err)
                retryCount++;
                if (retryCount >= maxAttempts) {
                    throw new Error(`分片 ${chunkIndex}/${totalChunks} 上传失败（尝试 ${retryCount} 次）`);
                }
                const delay = this.calculateRetryDelay(retryCount);
                await this.sleep(delay);
            }
        }
    }

/*有些是存储桶的默认配置的 比如 X-Amz-Object-Lock-Mode COMPLIANCE：
X-Amz-Meta-Author herzhang
X-Amz-Meta-Rep KQcbgDF9RO21DsI92H3tTVJlcG9ydA
X-Amz-Object-Lock-Retain-Until-Date 2025-06-09T00:08:40.315Z
* */
    // 修正后的 MinIO 上传方法
    private async minioPutObject(
        objectId: string,
        stream: Readable,
        chunkIndex: number,
        totalChunks: number,
        customRetainUntilDate?: Date // 自定义保留截止日期
    ) {
        // 1. 上传文件对象（不包含保留策略）
        const metaData = {
            'Content-Type': 'application/pdf',
            'X-Amz-Meta-Chunk-Index': chunkIndex.toString(),
            'X-Amz-Meta-Total-Chunks': totalChunks.toString(),
            'X-Amz-Meta-Author': 'herzhang',
            'X-Amz-Meta-Rep': 'KQcbgDF9RO21DsI92H3tTVJlcG9ydA'
        };

        // 使用 Buffer 上传
        const buffer = await this.streamToBuffer(stream);
        await minioClient.putObject(
            config.bucketName!,
            objectId,
            buffer,
            buffer.length,
            metaData // 仅传递元数据
        );
        //# 通过 mc 命令修改存储桶锁定模式（需集群管理员权限）
        // mc lock myminio/testbucket governance 100d
        const retention = await minioClient.getObjectRetention(
            config.bucketName!,
            objectId
        );
        console.log('Lock status:', retention);
        // 2. 然后需设置对象保留期限的
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 2)
        expirationDate.setUTCHours(0, 0, 0, 0)      //Should be start of the day.(midnight)
        await minioClient.putObjectRetention(
            config.bucketName!,
            objectId,
            {
                governanceBypass: true,
                mode: 'COMPLIANCE',
                retainUntilDate: expirationDate.toISOString(),
            } as Retention
        );
    }

    private async minioPutObject3(
        objectId: string,
        stream: Readable,
        chunkIndex: number,
        totalChunks: number
    ) {
        //X-Amz-Object-Lock-Mode  COMPLIANCE
        //多出来的X-Amz-Meta-Chunk-Index X-Amz-Meta-Total-Chunks  而X-Amz-Meta-Filename缺席
        //加上没生效 前缀不一样的！  X-Amz-Meta-Lock-Retain-Until-Date 2025-06-12T11:11:40.115Z      X-Amz-Object-Lock-Retain-Until-Date
        const metaData = {
            'Content-Type': 'application/pdf',
            'X-Amz-Meta-Chunk-Index': chunkIndex.toString(),
            'X-Amz-Meta-Total-Chunks': totalChunks.toString(),
            'X-Amz-Meta-Author': 'herzhang',
            'X-Amz-Meta-Rep': 'KQcbgDF9RO21DsI92H3tTVJlcG9ydA',
            'Lock-Retain-Until-Date': '2025-06-12T11:11:40.115Z'
        } as ItemBucketMetadata;

        // 使用 Buffer 作为替代方案（解决流类型问题）
        const buffer = await this.streamToBuffer(stream);
        //分片的； 每个部分都要设置metaData
        await minioClient.putObject(
            config.bucketName!,
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
    async ossUpload(filePath:string, metaData: any) {
        try {
            await minioClient.bucketExists(config.bucketName!) ||
                                                            minioClient.makeBucket(config.bucketName!);
            const pdfFiles =[filePath];
            console.log(`发现 ${pdfFiles.length} 个PDF文件待上传`);

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                return `文件不存在: ${filePath}`
            }
            // 生成日期目录结构（格式：/yyyyMM/ddHH/）
            const dateDir = moment().format('YYYYMM/DDHH/');
            // 生成完整的 objectId（日期目录 + UUID）
            const objectId = `${dateDir}${uuidv4()}`;

            // 上传文件
            const result = await this.uploadFileToMinio({
                objectName: objectId,
                filePath,
                metaData
            })
            //                 etag: result.etag,
            //                 uploadMethod: result.method,
            console.log(`${filePath} [${result ? '✅ 成功' : '❌ 失败'}]`, result)
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
        //写入文件保存磁盘的状态：
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




// 核心上传函数
    async  uploadFileToMinio({ objectName, filePath, metaData } :any
    ) {
        const bucketName=this.options.bucketName;
        // 确保 bucket 存在
        const bucketExists = await minioClient.bucketExists(bucketName)
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName, "us-east-1")
            console.log(`创建了新的 bucket: ${bucketName}`)
        }
        const expirationDate=metaData["X-Amz-Object-Lock-Retain-Until-Date"];
        metaData["X-Amz-Object-Lock-Retain-Until-Date"] =undefined;

        const fileStats = fs.statSync(filePath)
        const fileSize = fileStats.size
        let etag
        let method
        // 根据文件大小选择上传方式
        if (fileSize > this.options.large_file_threshold) {
            // 大文件使用流式上传（MinIO 会自动分块）
            const fileStream = fs.createReadStream(filePath)
            etag = await minioClient.putObject(bucketName, objectName, fileStream, fileSize, metaData)
            method = "chunked"
        } else {
            // 小文件直接上传
            etag = await minioClient.fPutObject(bucketName, objectName, filePath, metaData)
            method = "direct"
        }

        //【增加】
        const retention = await minioClient.getObjectRetention(
            bucketName,
            objectName
        );
        console.log('Lock status:', retention);
        //设置对象保留期限的
        await minioClient.putObjectRetention(
            bucketName,
            objectName,
            {
                governanceBypass: true,
                mode: 'COMPLIANCE',
                retainUntilDate: expirationDate,
            } as Retention
        );
        return { etag, method }
    }

}

//blob:http://192.168.171.3:13501/cbc8cb2b-58bb-417f-8278-24c0fff1592a
