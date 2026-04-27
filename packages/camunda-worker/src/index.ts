import { createCamundaClient } from '@camunda8/orchestration-cluster-api'
import axios from "axios"
import dotenv from "dotenv"
import path from "path"
import {deleteDirWithRm, FileUploader} from "./local-uploader";
import type {ConfigRoot, FileTransform} from "page2pdf_server/src";
import { startTaskExtractionWorker } from "./task-extraction-worker";

// 加载环境变量 - 优先读取 .env.local
const envPath = path.join(__dirname, '../.env.local')
console.log('Loading env from:', envPath)
console.log('.env.local exists:', require('fs').existsSync(envPath))

if (require('fs').existsSync(envPath)) {
    // 读取 .env.local，强制覆盖已存在的环境变量
    const result = dotenv.config({ path: envPath, override: true })
    console.log('Env load result (.env.local):', result.error ? result.error.message : 'Success')
} else {
    // 回退到读取默认的 .env
    const result = dotenv.config({ path: path.join(__dirname, '../.env') })
    console.log('Env load result (.env):', result.error ? result.error.message : 'Success')
}

console.log('CAMUNDA_REST_ADDRESS:', process.env.CAMUNDA_REST_ADDRESS)

// Camunda 8 Orchestration Cluster API 配置
const CAMUNDA_REST_ADDRESS = process.env.CAMUNDA_REST_ADDRESS || 'http://192.168.109.66:30000';

const camundaClient = createCamundaClient({
    config: {
        CAMUNDA_REST_ADDRESS,
        CAMUNDA_AUTH_STRATEGY: (process.env.CAMUNDA_AUTH_STRATEGY || 'BASIC') as 'BASIC' | 'NONE' | 'OAUTH',
        CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || 'demo',
        CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || 'demo',
    }
});

console.log(`Camunda 客户端配置:`, JSON.stringify(camundaClient.getConfig(), null, 2));

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"

// 启动Worker
async function startWorker() {
   const zbWorker= camundaClient.createJobWorker({
        jobType: "pdf-generation-task",
        maxParallelJobs: 1,
        jobTimeoutMs: 20*60*1000,
        jobHandler: urlToPdfTask
    });

    async function urlToPdfTask(job: any) {
    try {
      const prjob= job.variables?.pdfJob as unknown as ConfigRoot<FileTransform>;
      // 发送HTTP请求到PDF服务
      console.log(`[新的流程] 发起转换请求${PDF_SERVICE_URL}`)
      const response = await axios.post(PDF_SERVICE_URL, prjob)
      const {message: ack, data:desc} =response.data
      const {result, dir} =desc
      //处理响应【考虑功能添加点】 转换pdf本地文件路径 +电子盖章 +然后上传到OSS 文件访问路径
      console.log("转换应答:", response.data?.data?.dir)
      //成功response=: { status: 200, message: 'OK', data: { result: 'Success',dir } }    文件预先定义的==系统安装的路径：C:\page2pdf-server\pdfs +/files【0】.out/
      const finish= result==="Success";
      if(!finish || !dir)
          return job.fail({errorMessage:`转换pdf失败: ${result}`, retries: 0});
      const filepath= dir+"/"+ prjob?.name +".pdf";
        //可能+步骤2： +水印,电子盖章;
        //步骤3： 然后上传到OSS 文件访问路径;
      //不经过java后端服务器做代理上传的，那样要再多一次复制。直接上传到RustFS集群。
      const uploader = new FileUploader({
          large_file_threshold: 10 * 1024 * 1024,            //设置大文件阈值 (10MB)，走分块上传模式
          bucketName: process.env.RUSTFS_BUCKETNAME || 'ywmast',
          lockMode: "COMPLIANCE",
      });
        // 设置元数据 - AWS SDK v3 中 Content-Type 直接设置，自定义元数据不需要 X-Amz-Meta- 前缀
        const metaData = {
            'author': job.variables?.author,
            'rep': job.variables?.repId
        } as any;
      const ossObjId= await uploader.ossUpload(filepath, metaData, job.variables?.expiration);
      //最可读的链接 http://127.0.0.1:9000/ywmast/ +ossObjId（202506/0315/xxx-）
        if(!ossObjId){
            throw new Error(`OSS上传失败,${filepath}`);
        }
      await deleteDirWithRm(dir);
      //就算上传没有实际运行，这里居然也会自动完成？ 完成job并返回结果：
      return job.complete({
          result: true,
          ossId: ossObjId,
          // processedAt: new Date().toISOString(),
        })
    } catch (error) {
      console.error("urlToPdfTask:", error)
      // 如果出错，标记job为失败
      return job.fail({errorMessage:`urlToPdfTask: ${error}`, retryBackOff: 5*60*1000});
    }
  }
  console.log(`启动Worker线程: pdf-generation-task`)
  //更多的Worker可以在这里注册：
  // 启动任务提取 Worker
  startTaskExtractionWorker(camundaClient);

}


// 处理进程退出
process.on("SIGTERM", async () => {
  console.log("Shutting down...")
  process.exit(0)
})


// 启动Worker
startWorker().catch((err) => {
  console.error("Failed to start worker:", err)
  process.exit(1)
})
