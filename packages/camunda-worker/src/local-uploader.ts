import { S3Client, PutObjectCommand, PutObjectRetentionCommand, ObjectLockMode, ObjectLockLegalHold } from '@aws-sdk/client-s3';
import * as fs from 'fs-extra';
import dotenv from "dotenv";
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import { promises as fsPromises } from 'fs';

// 加载环境变量
dotenv.config()

// RustFS 配置
const rustfsEndpoint = process.env.RUSTFS_ENDPOINT_URL || 'http://192.168.109.66:30900';
const rustfsAccessKeyId = process.env.RUSTFS_ACCESS_KEY_ID || 'rustfsadmin';
const rustfsSecretAccessKey = process.env.RUSTFS_SECRET_ACCESS_KEY || 'rustfsadmin';

// 初始化 S3 客户端（兼容 RustFS）
const s3Client = new S3Client({
    region: "cn-east-1",
    credentials: {
        accessKeyId: rustfsAccessKeyId,
        secretAccessKey: rustfsSecretAccessKey,
    },
    endpoint: rustfsEndpoint,
    forcePathStyle: true,  // 对于非 AWS S3，通常需要设置为 true
});

interface FileUploaderOptions {
    large_file_threshold: number;
    bucketName: string ;
    lockMode: string;
}

export class FileUploader {
    private options = {} as FileUploaderOptions;
    constructor(options: FileUploaderOptions) {
        this.options = options || {};
    }

    // 批量上传入口
    async ossUpload(filePath:string, metaData: any, expirationDate?: string) {
        try {
            const pdfFiles =[filePath];
            console.log(`发现 ${pdfFiles.length} 个PDF文件待上传`);

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                console.error(`文件不存在: ${filePath}`);
                return null
            }
            // 生成日期目录结构（格式：/yyyyMM/ddHH/）
            const dateDir = moment().format('YYYYMM/DDHH/');
            // 生成完整的 objectId（日期目录 + UUID）
            const objectId = `${dateDir}${uuidv4()}`;

            // 上传文件
            const result = await this.uploadFileToRustFS({
                objectName: objectId,
                filePath,
                metaData,
                expirationDate
            })
            console.log(`上传${filePath} [${result?.etag ? '✅ 成功' : '❌ 失败'}]`)
            if(result?.etag)    return objectId;
        } catch (err) {
            console.error('上传失败:', err);
        }
        return null
    }

    // 核心上传函数 - 使用 AWS SDK v3 连接 RustFS
    async uploadFileToRustFS({ objectName, filePath, metaData, expirationDate }: any) {
        const bucketName = this.options.bucketName;

        const fileStats = fs.statSync(filePath);
        const fileSize = fileStats.size;

        // 构造上传命令
        let etag;
        let method;

        console.log(`上传参数 - bucketName: ${bucketName}, objectName: ${objectName}, expirationDate: ${expirationDate}`);
        console.log(`元数据:`, metaData);

        // 先上传文件（不设置 Object Lock）
        if (fileSize > this.options.large_file_threshold) {
            // 大文件使用流式上传
            const fileStream = fs.createReadStream(filePath);
            const putCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectName,
                Body: fileStream,
                ContentLength: fileSize,
                ContentType: 'application/pdf',
                Metadata: metaData,
            });
            const response = await s3Client.send(putCommand);
            etag = response.ETag;
            method = "chunked";
        } else {
            // 小文件直接上传（读取文件内容）
            const fileContent = await fs.readFile(filePath);
            const putCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: objectName,
                Body: fileContent,
                ContentType: 'application/pdf',
                Metadata: metaData,
            });
            const response = await s3Client.send(putCommand);
            etag = response.ETag;
            method = "direct";
        }

        // 上传成功后，使用单独的 API 设置 Object Lock
        if (expirationDate) {
            try {
                const lockMode = this.options.lockMode === 'COMPLIANCE' ? ObjectLockMode.COMPLIANCE : ObjectLockMode.GOVERNANCE;
                const retentionCommand = new PutObjectRetentionCommand({
                    Bucket: bucketName,
                    Key: objectName,
                    Retention: {
                        Mode: lockMode,
                        RetainUntilDate: new Date(expirationDate),
                    },
                });
                await s3Client.send(retentionCommand);
                console.log(`✅ Object Lock 设置成功 - Mode: ${lockMode}, RetainUntilDate: ${expirationDate}`);
            } catch (error) {
                console.warn(`⚠️ Object Lock 设置失败:`, error);
                // 不影响上传结果，只是没有设置锁定
            }
        }

        console.log(`上传完成 - etag: ${etag}, method: ${method}`);
        return { etag, method };
    }
}

export async function deleteDirWithRm(dirPath: string) {
    try {
        await fsPromises.rm(dirPath, { recursive: true, force: true });
        console.log(`目录 ${dirPath} 删除成功`);
    } catch (err) {
        console.error(`删除失败: ${err}`);
    }
}
