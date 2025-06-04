import * as Minio from 'minio';
import * as fs from 'fs-extra';
import dotenv from "dotenv";
import {Retention} from "minio";
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
const nodefs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config()
// 配置参数
const config = {
    minio: {
        endPoint: process.env.MINIO_ENDPOINT!,
        port: process.env.MINIO_PORT as unknown as number,
        useSSL: process.env.MINIO_USESSL==="true",
        accessKey: process.env.MINIO_ACCESSKEY,
        secretKey: process.env.MINIO_SECRETKEY
    }
};

// 初始化 MinIO 客户端
const minioClient = new Minio.Client(config.minio);

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
    async ossUpload(filePath:string, metaData: any) {
        try {
            await minioClient.bucketExists(this.options.bucketName!) ||
                                                 minioClient.makeBucket(this.options.bucketName!);
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
            const result = await this.uploadFileToMinio({
                objectName: objectId,
                filePath,
                metaData
            })
            console.log(`上传${filePath} [${result?.etag ? '✅ 成功' : '❌ 失败'}]`)
            //etag{ etag ,}: UploadedObjectInfo;
            if(result?.etag)    return objectId;
        } catch (err) {
            console.error('上传失败:', err);
        }
        return null
    }

    //和java后端的tus上传后接续再复制给minio的模式中的做法不一样。nextjs可能也能用。
    // 核心上传函数
    async  uploadFileToMinio({ objectName, filePath, metaData } :any
    ) {
        const bucketName=this.options.bucketName;
        // 确保 bucket 存在
        const bucketExists = await minioClient.bucketExists(bucketName)
        if (!bucketExists) {
            throw new Error(`存储桶${bucketName}未建`);
            // await minioClient.makeBucket(bucketName)
        }
        const expirationDate=metaData["X-Amz-Object-Lock-Retain-Until-Date"];
        metaData["X-Amz-Object-Lock-Retain-Until-Date"] =undefined;

        const fileStats = fs.statSync(filePath)
        const fileSize = fileStats.size
        let etag
        let method
        // 根据文件大小选择上传方式
        if (fileSize > this.options.large_file_threshold) {
            // 大文件使用流式上传（MinIO 会自动分块） ；     还必须加上：Content-Type
            const fileStream = fs.createReadStream(filePath)
            etag = await minioClient.putObject(bucketName, objectName, fileStream, fileSize, metaData)
            method = "chunked"
        } else {
            // 小文件直接上传
            etag = await minioClient.fPutObject(bucketName, objectName, filePath, metaData)
            method = "direct"
        }
        //【增加】
        // const retention = await minioClient.getObjectRetention( bucketName, objectName );
        // console.log('Lock status:', retention);
        //设置对象保留期限的
        await minioClient.putObjectRetention(
            bucketName,
            objectName,
            {
                governanceBypass: true,
                mode: this.options.lockMode,
                retainUntilDate: expirationDate,
            } as Retention
        );
        return { etag, method }
    }
}

export async function deleteDirWithRm(dirPath: string) {
    try {
        await nodefs.rm(dirPath, { recursive: true, force: true });
        console.log(`目录 ${dirPath} 删除成功`);
    } catch (err) {
        console.error(`删除失败: ${err}`);
    }
}
