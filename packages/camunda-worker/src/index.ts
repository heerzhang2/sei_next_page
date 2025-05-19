import { ZBClient } from "zeebe-node"
import axios from "axios"
import dotenv from "dotenv"

// 加载环境变量
dotenv.config()

// Camunda 8 连接配置
const zeebeConfig = {
  camundaCloud: {
    clientId: process.env.ZEEBE_CLIENT_ID || "",
    clientSecret: process.env.ZEEBE_CLIENT_SECRET || "",
    clusterId: process.env.ZEEBE_CLUSTER_ID || "",
  },
  // 如果使用自托管的Zeebe，则使用以下配置
  // gatewayAddress: process.env.ZEEBE_GATEWAY_ADDRESS || 'localhost:26500',
  // useTLS: false,
}

// 创建Zeebe客户端
const zbc = new ZBClient(zeebeConfig)

// PDF服务的URL
const PDF_SERVICE_URL = "http://localhost:9389/api/pdf"

// 定义Worker任务类型
const WORKER_TASK_TYPE = "pdf-generation-task"

// 启动Worker
async function startWorker() {
  console.log("Starting Camunda 8 Worker...")

  // 创建一个Worker来处理特定类型的任务
  zbc.createWorker({
    taskType: WORKER_TASK_TYPE,
    taskHandler: async (job) => {
      console.log(`Processing job ${job.key} of type ${job.type}`)

      try {
        // 从job变量中获取数据
        const jobVariables = job.variables
        console.log("Job variables:", jobVariables)

        // 发送HTTP请求到PDF服务
        console.log(`Sending request to ${PDF_SERVICE_URL}`)
        const response = await axios.post(PDF_SERVICE_URL, jobVariables)

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
        return job.fail(`Error processing job: ${error.message}`, 0)
      }
    },
    // 可选配置
    options: {
      maxJobsToActivate: 5,
      timeout: 60000, // 60秒超时
      requestTimeout: 65000,
      pollInterval: 1000,
    },
  })

  console.log(`Worker started and listening for jobs of type: ${WORKER_TASK_TYPE}`)
}

// 处理进程退出
process.on("SIGTERM", async () => {
  console.log("Shutting down...")
  await zbc.close()
  process.exit(0)
})

// 启动Worker
startWorker().catch((err) => {
  console.error("Failed to start worker:", err)
  process.exit(1)
})
