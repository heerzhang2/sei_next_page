import { Camunda8 } from "@camunda8/sdk"
import dotenv from "dotenv"

//文档： https://camunda.github.io/camunda-8-js-sdk/
//https://docs.camunda.io/docs/apis-tools/working-with-apis-tools/
// 加载环境变量
dotenv.config()

// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
    // 其他配置...
}

// @ts-ignore
const c8 = new Camunda8(camundaConfig)
//公司的：配置  CAMUNDA_AUTH_STRATEGY: 'NONE',
console.log(`当前camundaConfig:`,camundaConfig);

// 使用 REST API 客户端代替 gRPC 客户端
export const restClient = c8.getCamundaRestClient() // REST API
//export const zeebe = c8.getZeebeGrpcApiClient()  报错：无法找到必要的 Protocol Buffers 定义文件zeebe.proto，使用 gRPC 客户端

// 定义 Worker 任务类型
export const WORKER_TASK_TYPE = "pdf-generation-task"

// 使用 REST API 创建流程实例的辅助函数
export async function createProcessInstanceRest(bpmnProcessId: string, variables: Record<string, any>) {
    try {
        // 使用 REST API 创建流程实例
        const response = await restClient.createProcessInstance({
            processDefinitionId: bpmnProcessId,
            // bpmnProcessId,
            variables,
        })

        return response
    } catch (error) {
        console.error("Error creating process instance via REST:", error)
        throw error
    }
}
