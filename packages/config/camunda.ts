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
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION==="true",
    // 如果使用自托管的Zeebe，则使用以下配置
    // gatewayAddress: process.env.ZEEBE_GATEWAY_ADDRESS || 'localhost:26500',
    // useTLS: false,
}

const c8 =new Camunda8(camundaConfig)


// const restClient = c8.getCamundaRestClient() // New REST API
export const zeebe = c8.getZeebeGrpcApiClient()

// 定义Worker任务类型
export const WORKER_TASK_TYPE = "pdf-generation-task"
