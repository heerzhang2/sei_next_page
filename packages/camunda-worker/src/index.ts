import { Camunda8,  } from '@camunda8/sdk'
import axios from "axios"
import dotenv from "dotenv"
import {FileUploader} from "./local-uploader";
import type {ConfigRoot, FileTransform} from "page2pdf_server/src";

// 加载环境变量
dotenv.config()
// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
}

//[文档] https://camunda.github.io/camunda-8-js-sdk/#oauth
//https://docs.camunda.io/docs/next/self-managed/setup/deploy/local/manual/
// https://docs.camunda.io/docs/guides/getting-started-java-spring/
// 创建Zeebe客户端  https://www.npmjs.com/package/@camunda8/sdk  需要Node服务端环境运行的；
const c8 = new Camunda8(camundaConfig as any)
console.log(`当前camundaConfig:`, camundaConfig);
const restClient = c8.getCamundaRestClient()     // 8.6.0 New REST API

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"
// 启动Worker
async function startWorker() {
   console.log("启动Camunda 8工作线程")
   const zbWorker= restClient.createJobWorker({
        type: "pdf-generation-task",
        worker: "urlToPdfTask",
        maxJobsToActivate: 1,
        timeout: 20*60*1000,
        jobHandler: urlToPdfTask
    })

    async function urlToPdfTask(job: any) {
    try {
      const prjob=job.variables?.pdfJob as  ConfigRoot<FileTransform>;
      // 发送HTTP请求到PDF服务
      console.log(`发起转换请求${PDF_SERVICE_URL}`)
      const response = await axios.post(PDF_SERVICE_URL, prjob)
      const {message: ack, data:desc} =response.data
      const {result, dir} =desc
      //处理响应【考虑功能添加点】 转换pdf本地文件路径 +电子盖章 +然后上传到OSS 文件访问路径
      console.log("转换应答:", response.data?.data?.dir)
      //成功response=: { status: 200, message: 'OK', data: { result: 'Success',dir } }    文件预先定义的==系统安装的路径：C:\page2pdf-server\pdfs +/files【0】.out/
      const finish= result==="Success";
      if(!finish || !dir)   return  job.fail(`转换pdf失败`, 0)
      const filepath= dir+"/"+ prjob?.name +".pdf";
        //可能+步骤2： +水印,电子盖章;
        //步骤3： 然后上传到OSS 文件访问路径;
      //不经过java后端服务器做代理上传的，那样要再多一次复制。直接上传到OSS集群。
      const uploader = new FileUploader({
          large_file_threshold: 10 * 1024 * 1024,            //设置大文件阈值 (10MB)，走分块上传模式
          bucketName: process.env.MINIO_BUCKETNAME!,
          lockMode: "COMPLIANCE",
      });
        // 设置元数据
        const metaData = {
            'Content-Type': 'application/pdf',
            'X-Amz-Meta-Author': job.variables?.Author,
            'X-Amz-Meta-Rep': job.variables?.repId
        } as any;
        //【这里不能加的】 前缀会改成X-Amz-Meta-  等于无效啊。X-Amz-Meta-X-Amz-Object-Lock-Mode  X-Amz-Meta-X-Amz-Object-Lock-Retain-Until-Date
        metaData["X-Amz-Object-Lock-Retain-Until-Date"] = job.variables?.expiration;
      const ossObjId= await uploader.ossUpload(filepath, metaData);
      //最可读的链接 http://127.0.0.1:9000/ywmast/ +ossObjId（202506/0315/xxx-）
      //完成job并返回结果：
      return job.complete({
          result: true,
          ossId: ossObjId,
          // processedAt: new Date().toISOString(),
        })
    } catch (error) {
      console.error("urlToPdfTask:", error)
      // 如果出错，标记job为失败
      return job.fail(`urlToPdfTask: ${error}`, 0)
    }
  }
  console.log(`启动Worker线程: pdf-generation-task`)
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
