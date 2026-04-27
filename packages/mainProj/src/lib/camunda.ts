// Camunda 8 Orchestration Cluster API
// 使用 @camunda8/orchestration-cluster-api

import { createCamundaClient } from '@camunda8/orchestration-cluster-api';

// 单例客户端实例
let camundaClient: any = null;

/**
 * 获取 Camunda 8 客户端（使用 Orchestration Cluster API）
 */
export async function getCamundaClient() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda 客户端只能在服务端使用');
    }

    if (camundaClient) {
        return camundaClient;
    }

    console.log("Creating Camunda Orchestration Cluster API client...");

    // 创建客户端 - 自动从环境变量读取配置
    // 环境变量: CAMUNDA_REST_ADDRESS, CAMUNDA_AUTH_STRATEGY, CAMUNDA_BASIC_AUTH_USERNAME, CAMUNDA_BASIC_AUTH_PASSWORD
    const camunda = createCamundaClient();

    camundaClient = camunda;
    console.log("Camunda 客户端已创建");

    return camundaClient;
}

/**
 * 使用 Orchestration Cluster API 创建流程实例
 * 注意：Zeebe Gateway REST API 支持 processDefinitionId (字符串)
 */
export async function createProcessInstanceRest(processDefinitionId: string, variables: Record<string, any>) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        console.log(`使用 Zeebe Gateway REST API 创建流程实例: processDefinitionId="${processDefinitionId}"`);
        console.log("流程变量:", JSON.stringify(variables, null, 2));

        const client = await getCamundaClient();

        // 创建流程实例
        // Zeebe Gateway REST API 支持 processDefinitionId (字符串，如 "genRepPdf")
        const processInstance = await client.createProcessInstance({
            processDefinitionId: processDefinitionId,
            variables: variables || {}
        });

        console.log("流程实例创建成功!");
        console.log("processInstanceKey:", processInstance.processInstanceKey);

        return {
            processInstanceKey: processInstance.processInstanceKey,
            processDefinitionId: processDefinitionId
        };
    } catch (error: any) {
        console.error("创建流程实例失败:", error);
        throw new Error(`创建流程实例失败: ${error.message}`);
    }
}

/**
 * 查询流程实例
 */
export async function getProcessInstance(processInstanceKey: string): Promise<any> {
    const client = await getCamundaClient();
    return client.getProcessInstance(processInstanceKey);
}

/**
 * 获取所有流程定义列表
 */
export async function listAllProcessDefinitions(): Promise<any[]> {
    const client = await getCamundaClient();
    return client.listProcessDefinitions();
}
