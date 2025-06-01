// import { ZBClient } from "zeebe-node"
import { Camunda8,  } from '@camunda8/sdk'
import axios from "axios"
import dotenv from "dotenv"
// import {ZBWorkerTaskHandler, ZeebeJob} from "@camunda8/sdk/dist/zeebe/lib/interfaces-1.0";
import {FileUploader} from "./uploader";
import {
    IProcessVariables,
    JobCompletionInterfaceRest,
    JSON,
    JSONDoc,
    MustReturnJobActionAcknowledgement
} from '@camunda8/sdk/dist/zeebe/types';
import {Ctor, RestJob} from "@camunda8/sdk/dist/c8/lib/C8Dto";
import {Logger} from "@camunda8/sdk/dist/c8/lib/C8Logger";
import {MaybeTimeDuration} from "typed-duration";
import type {ConfigRoot, FileTransform} from "page2pdf_server/src";


// 加载环境变量
dotenv.config()
// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
    // 如果使用自托管的Zeebe，则使用以下配置
    // gatewayAddress: process.env.ZEEBE_GATEWAY_ADDRESS || 'localhost:26500',
    // useTLS: false,
}


//[文档] https://camunda.github.io/camunda-8-js-sdk/#oauth
//https://docs.camunda.io/docs/next/self-managed/setup/deploy/local/manual/
// https://docs.camunda.io/docs/guides/getting-started-java-spring/
// 创建Zeebe客户端  https://www.npmjs.com/package/@camunda8/sdk  需要Node服务端环境运行的；
// const zbc = new ZBClient(zeebeConfig)
// const c8 = new Camunda8()
// {
//   ZEEBE_ADDRESS: 'localhost:26500',
//   ZEEBE_REST_ADDRESS: 'http://localhost:8080',
//   ZEEBE_CLIENT_ID: 'demo',
//   ZEEBE_CLIENT_SECRET: 'demo',
//   CAMUNDA_AUTH_STRATEGY: "BASIC",
//   // CAMUNDA_OAUTH_STRATEGY: 'NONE',
//   // CAMUNDA_OAUTH_URL:'http://localhost:8080/oauth/token',
//   // CAMUNDA_TASKLIST_BASE_URL: 'http://localhost:8082',
//   // CAMUNDA_OPERATE_BASE_URL: 'http://localhost:8081',
//   // CAMUNDA_OPTIMIZE_BASE_URL: 'http://localhost:8083',
//   // CAMUNDA_MODELER_BASE_URL: 'http://localhost:8070/api',
//   CAMUNDA_TENANT_ID: '', // We can override values in the env by passing an empty string value
//   CAMUNDA_SECURE_CONNECTION: false,
// }

const c8 = new Camunda8(camundaConfig as any)
console.log(`当前camundaConfig:`, camundaConfig);
const restClient = c8.getCamundaRestClient()     // 8.6.0 New REST API
// const zeebe = c8.getZeebeGrpcApiClient()
// const zeebeRest = c8.getZeebeRestClient() // Deprecated
// const operate = c8.getOperateApiClient()
// const optimize = c8.getOptimizeApiClient()
// const tasklist = c8.getTasklistApiClient()
// const modeler = c8.getModelerApiClient()
//这个报错的Error: Missing required configuration CAMUNDA_CONSOLE_BASE_URL.
// const admin = c8.getAdminApiClient()

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"


// 启动Worker
async function startWorker() {
    console.log("Starting Camunda 8 Worker...")
    // 创建一个Worker来处理特定类型的任务    不能加上tenantIds: ['<default>', 'green'],
//<
//     Variables extends LosslessDto,
//         CustomHeaders extends LosslessDto,
// >   CamundaJobWorkerConfig<Variables, CustomHeaders>
    //jobHandler: (job: RestJob<VariablesDto, CustomHeadersDto> & JobCompletionInterfaceRest<IProcessVariables>, log: Logger) => MustReturnJobActionAcknowledgement;
    // inputVariableDto?: Ctor<VariablesDto>;
    // customHeadersDto?: Ctor<CustomHeadersDto>;
   const zbWorker= restClient.createJobWorker({
        type: "pdf-generation-task",
        worker: "test-camd8",
        maxJobsToActivate: 1,
        timeout: 60000,
        jobHandler: myTaskHandler
    })


    async function myTaskHandler(job: any) {
        console.log("myTaskHandler >>",job)
    try {
      const prjob=job.variables?.documentType as  ConfigRoot<FileTransform>;
      // 发送HTTP请求到PDF服务
      console.log(`Sending request to ${PDF_SERVICE_URL}`)
      // await axios.post(PDF_SERVICE_URL, {job: job.variables?.documentType})
      const response = await axios.post(PDF_SERVICE_URL, job.variables?.documentType)
      const {message: ack, data:desc} =response.data
      const {result, dir} =desc
      //处理响应【考虑功能添加点】 转换pdf本地文件路径 +电子盖章 +然后上传到OSS 文件访问路径
      console.log("Response received:", response.data)
      //成功response=: { status: 200, message: 'OK', data: { result: 'Success',dir } }    文件预先定义的==系统安装的路径：C:\page2pdf-server\pdfs +/files【0】.out/
      const finish= result==="Success";
      if(!finish || !dir)   return  job.fail(`转换pdf失败`, 0)
      const filepath= dir+"/"+ prjob?.name +".pdf";
        //可能+步骤2： +水印,电子盖章;
        //步骤3： 然后上传到OSS 文件访问路径;
      //不经过java后端服务器做代理上传的，那样要再多一次复制。直接上传到OSS集群。
      const uploader = new FileUploader();
      await uploader.ossUpload(filepath);
      // (async () => {
      // })();
      //完成job并返回结果：
      return job.complete({
          result: true,
          ossFile: "/dfMy-sd/pdf/2211.sdfdsfWWWd",
          original: job.variables?.original,
          processedAt: new Date().toISOString(),
        })
    } catch (error) {
      console.error("Error processing job:", error)
      // 如果出错，标记job为失败
      return job.fail(`Error processing job: ${error}`, 0)
    }
    // const res = await callExternalSystem(job.variables)
  }

  console.log(`Worker启动: pdf-generation-task`)

  //job.complete({ 本地的文件OSS地址（rep /ori） ，下一个流程任务接收？。还是：这里仅仅提供配置信息，全部让Java节点机器处理打印的：或者盖章，上传OSS都需囊括一块做的，
  //【后续步骤】给java节点机：盖章，上传OSS，数据库流程保存关联数据。
}

// 处理进程退出
process.on("SIGTERM", async () => {
  console.log("Shutting down...")
  // await restClient.close()
  process.exit(0)
})

// 启动Worker
startWorker().catch((err) => {
  console.error("Failed to start worker:", err)
  process.exit(1)
})





// const variables={
//     customerId: "12345",
//         documentType: {},
//         original: false,
// };
//
// (async () => {
// // @ts-ignore
//     try {
//         const response = await startProcess({
//             processId: "genRepPdf",
//             variables: variables,
//         })
//
//
//     } catch (err: any) {
//         console.error("启动流程实例失败:", err)
//     }
// })();
