// import { ZBClient } from "zeebe-node"
import { Camunda8, Auth, CamundaRestClient,Zeebe  } from '@camunda8/sdk'
import {ConfigRoot, FileTransform} from "page2pdf_server/src";
import axios from "axios"
import dotenv from "dotenv"


// 加载环境变量
dotenv.config()
// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_BASIC_AUTH_PASSWORD==="true",
  // 如果使用自托管的Zeebe，则使用以下配置
  // gatewayAddress: process.env.ZEEBE_GATEWAY_ADDRESS || 'localhost:26500',
  // useTLS: false,
}

const original=false
//rep?.isp?.no
const repNo='sdfsdf222234'
// const url = `${process.env.NEXT_PUBLIC_APP_WEB}` + urlPrn;
const url="dfgdfg444444222222//uiiy"
//报告No:',
//                     notext,      <span id=\"titlespan\" class=title>
const pdf_job = {
  name: (original ? "记录" : "报告") + repNo,
  singleTab: true,
  lay: {
    head: [
      '<div style=\\"position: relative; width:100%; text-align:center; border-bottom: 1pt solid #eeeeee; margin: 3.5mm 0px 10px; font-size: 10pt\\">',
      `<div style=\\"position: absolute; width:100%; text-align:left; bottom: 5px; left: 50px;\\">报告No: ${repNo}</div></div>`
    ],
    foot: [
      '<div style=\\"position: relative; width: 100%; text-align: left; border-top: 1pt solid #eeeeee; margin:  10px 0px 1.5mm; font-size: 8pt;\\">',
      '<div style=\\"position: absolute; width: 100%; text-align: center; top: 5px;\\">共<span>~pageNumber~</span>页 / 第<span>~totalPages~</span>页</div></div>'
    ],
  },
  files: [
    {
      url,
      out: `tmp-${repNo}` + (original ? "-O" : ""),
      headFrom: 3,
      frNo: 3,
    },
  ],
} as ConfigRoot<FileTransform>;


//[文档] https://camunda.github.io/camunda-8-js-sdk/#oauth
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

const c8 =new Camunda8(camundaConfig)
// const restClient = c8.getCamundaRestClient() // New REST API
const zeebe = c8.getZeebeGrpcApiClient()
// const zeebeRest = c8.getZeebeRestClient() // Deprecated
// const operate = c8.getOperateApiClient()
// const optimize = c8.getOptimizeApiClient()
// const tasklist = c8.getTasklistApiClient()
// const modeler = c8.getModelerApiClient()
//这个报错的Error: Missing required configuration CAMUNDA_CONSOLE_BASE_URL.
// const admin = c8.getAdminApiClient()

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"

// 定义Worker任务类型
const WORKER_TASK_TYPE = "pdf-generation-task"

// 启动Worker
async function startWorker() {
  console.log("Starting Camunda 8 Worker...")

  // 创建一个Worker来处理特定类型的任务    不能加上tenantIds: ['<default>', 'green'],
  const zbWorker =zeebe.createWorker({
    taskHandler: myTaskHandler,
    taskType: 'multi-tenant-work',
  });

  async function myTaskHandler(job) {
    zbWorker.log('Task variables', job.variables)

    // Task worker business logic goes here
    const updateToBrokerVariables = {
      updatedProperty: 'newValue',
    }


    try {
      // 从job变量中获取数据【】模板。rep.id/ no 记录+报告/有这个模板的但是可能并不要求生成pdf的。
      // const jobVariables = job.variables
      // console.log("Job variables:", jobVariables)

      // 发送HTTP请求到PDF服务
      console.log(`Sending request to ${PDF_SERVICE_URL}`)
      const response = await axios.post(PDF_SERVICE_URL, {job: pdf_job})

      // 处理响应
      console.log("Response received:", response.data)

      // 完成job并返回结果
      // return job.complete({
      //   result: response.data,
      //   success: true,
      //   processedAt: new Date().toISOString(),
      // })
    } catch (error) {
      console.error("Error processing job:", error)

      // 如果出错，标记job为失败
      // return job.fail(`Error processing job: ${error.message}`, 0)
    }
    try {
      // 从job变量中获取数据【】模板。rep.id/ no 记录+报告/有这个模板的但是可能并不要求生成pdf的。
      // const jobVariables = job.variables
      // console.log("Job variables:", jobVariables)

      // 发送HTTP请求到PDF服务
      console.log(`Sending request to ${PDF_SERVICE_URL}`)
      const response = await axios.post(PDF_SERVICE_URL, {job: pdf_job})

      // 处理响应
      console.log("Response received:", response.data)

      // 完成job并返回结果
      return job.complete({
        result: response.data,
        success: true,
        processedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error processing job:", error)

      // 如果出错，标记job为失败
      // return job.fail(`Error processing job: ${error.message}`, 0)
    }
    // const res = await callExternalSystem(job.variables)
  }

  console.log(`Worker started and listening for jobs of type: ${WORKER_TASK_TYPE}`)

  //job.complete({ 本地的文件OSS地址（rep /ori） ，下一个流程任务接收？。还是：这里仅仅提供配置信息，全部让Java节点机器处理打印的：或者盖章，上传OSS都需囊括一块做的，
  //【后续步骤】给java节点机：盖章，上传OSS，数据库流程保存关联数据。
}

// 处理进程退出
process.on("SIGTERM", async () => {
  console.log("Shutting down...")
  await zeebe.close()
  process.exit(0)
})

// 启动Worker
startWorker().catch((err) => {
  console.error("Failed to start worker:", err)
  process.exit(1)
})
