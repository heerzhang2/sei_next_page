import { Camunda8 } from "@camunda8/sdk"
import dotenv from "dotenv"

// 加载环境变量
dotenv.config()

// Camunda 8 连接配置
const camundaConfig = {
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
}

// 只在服务端初始化 Camunda8 客户端
let c8: Camunda8 | null = null;
let restClient: any = null;

// 获取 Camunda8 实例的函数
function getCamunda8Instance() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda8 SDK 只能在服务端使用');
    }

    if (!c8) {
        c8 = new Camunda8(camundaConfig);
    }
    return c8;
}

// 获取 REST 客户端的函数
export function getRestClient() {
    if (typeof window !== 'undefined') {
        throw new Error('REST 客户端只能在服务端使用');
    }

    if (!restClient) {
        const instance = getCamunda8Instance();
        restClient = instance.getCamundaRestClient();
    }
    return restClient;
}

// 使用 REST API 创建流程实例的辅助函数
export async function createProcessInstanceRest(bpmnProcessId: string, variables: Record<string, any>) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        const client = getRestClient();
        // 使用 REST API 创建流程实例
        const response = await client.createProcessInstance({
            processDefinitionId: bpmnProcessId,
            variables,
        })

        return response
    } catch (error) {
        console.error("Error creating process instance via REST:", error)
        throw error
    }
}
