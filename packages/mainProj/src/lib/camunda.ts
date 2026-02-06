// Camunda 8 SDK - 使用 @camunda8/sdk
// 使用 REST API 创建流程实例

let camundaRestClient: any = null;

/**
 * 获取 Camunda 8 REST 客户端
 */
export async function getCamundaRestClient() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda 客户端只能在服务端使用');
    }

    if (camundaRestClient) {
        return camundaRestClient;
    }

    console.log("Loading @camunda8/sdk...");

    // 使用 createRequire 来从正确的位置加载模块
    const { createRequire } = await import('module');
    const path = await import('path');
    const url = await import('url');

    // 获取当前文件的真实目录
    const currentFileUrl = url.fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFileUrl);

    // 从 packages/mainProj/src/lib 向上找 3 级到 monorepo 根目录
    const workspaceRoot = path.resolve(currentDir, '../../../../');

    console.log("Current file:", currentFileUrl);
    console.log("Workspace root:", workspaceRoot);

    // 为工作区根目录创建 require 函数
    const requireForWorkspace = createRequire(workspaceRoot + '/package.json');

    let Camunda8Module;
    try {
        // 尝试使用 require 加载 @camunda8/sdk
        // @ts-ignore
        Camunda8Module = requireForWorkspace('@camunda8/sdk');
        console.log("Loaded @camunda8/sdk successfully via require");
    } catch (e) {
        console.log("Failed to load via require:", e);
        // 备用方案：直接 import
        const { Camunda8 } = await import('@camunda8/sdk');
        Camunda8Module = { Camunda8 };
        console.log("Loaded @camunda8/sdk successfully via import");
    }

    const { Camunda8 } = Camunda8Module;

    // 创建 Camunda8 客户端，使用 BASIC 认证
    // 本地 Camunda 8.9.0 集群
    // REST API: http://localhost:8080/v2/
    // gRPC API: http://localhost:26500
    const camunda8 = new Camunda8({
        CAMUNDA_AUTH_STRATEGY: 'BASIC',
        CAMUNDA_BASIC_AUTH_USERNAME: 'demo',
        CAMUNDA_BASIC_AUTH_PASSWORD: 'demo',
        ZEEBE_REST_ADDRESS: process.env.ZEEBE_REST_ADDRESS || 'http://localhost:8080',
    });

    // 使用 Camunda REST Client (8.7)
    console.log("创建 Camunda REST Client (8.7)...");
    camundaRestClient = camunda8.getCamundaRestClient();
    console.log("Camunda REST 客户端已创建");

    return camundaRestClient;
}

/**
 * 使用 REST API 创建流程实例
 */
export async function createProcessInstanceRest(bpmnProcessId: string, variables: Record<string, any>) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        console.log(`使用 Camunda8 SDK 创建流程实例: bpmnProcessId="${bpmnProcessId}"`);
        console.log("流程变量:", JSON.stringify(variables, null, 2));

        const client = await getCamundaRestClient();

        // 先查询流程定义，获取 processDefinitionKey（数字）
        console.log("查询流程定义，寻找 bpmnProcessId:", bpmnProcessId);
        
        let processDefinitionKey: string;
        let processDefinitionId: string;

        try {
            // 使用空的 filter 查询所有流程定义
            const searchResult = await client.searchProcessDefinitions({});
            
            console.log(`查询到 ${searchResult.items?.length || 0} 个流程定义`);
            
            if (!searchResult.items || searchResult.items.length === 0) {
                throw new Error(`没有找到任何流程定义`);
            }

            // 打印第一个流程定义的完整结构，用于调试
            console.log("第一个流程定义的完整结构:", JSON.stringify(searchResult.items[0], null, 2));
            console.log("所有流程定义:", searchResult.items.map((item: any) => ({
                bpmnProcessId: item.bpmnProcessId,
                processDefinitionKey: item.processDefinitionKey,
                version: item.version
            })));

            // 查找匹配的流程定义
            const matchingProcess = searchResult.items.find((item: any) => 
                item.bpmnProcessId === bpmnProcessId || item.processDefinitionId === bpmnProcessId
            );

            if (!matchingProcess) {
                console.log("所有流程定义详细信息:", JSON.stringify(searchResult.items, null, 2));
                throw new Error(`找不到流程定义: ${bpmnProcessId}`);
            }

            processDefinitionKey = String(matchingProcess.processDefinitionKey);
            processDefinitionId = matchingProcess.bpmnProcessId || matchingProcess.processDefinitionId || bpmnProcessId;

            console.log("找到流程定义:");
            console.log("  - processDefinitionId:", processDefinitionId);
            console.log("  - processDefinitionKey:", processDefinitionKey);
            console.log("  - version:", matchingProcess.version);
        } catch (error) {
            console.error("查询流程定义失败:", error);
            throw error;
        }

        // 使用 processDefinitionKey 创建实例
        console.log("使用 processDefinitionKey 创建实例...");

        // 直接使用 createProcessInstance 方法
        // 注意：processDefinitionKey 需要使用字符串格式，不能使用 Number
        const processInstance = await client.createProcessInstance({
            processDefinitionKey: processDefinitionKey,  // 使用字符串格式
            variables: variables || {}
        });

        console.log("流程实例创建成功!");
        console.log("processInstanceKey:", processInstance.processInstanceKey);

        return {
            processInstanceKey: processInstance.processInstanceKey,
            processDefinitionId: processDefinitionId,
            processDefinitionKey: processDefinitionKey,
            bpmnProcessId: bpmnProcessId
        };
    } catch (error: any) {
        console.error("创建流程实例失败:", error);
        throw new Error(`创建流程实例失败: ${error.message}`);
    }
}

/**
 * 查询所有流程定义（用于调试）
 */
export async function listAllProcessDefinitions() {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        const client = await getCamundaRestClient();

        // 查询流程定义
        const result = await client.searchProcessDefinitions({});

        console.log("查询到的流程定义数量:", result.items?.length || 0);
        console.log("所有流程定义:", JSON.stringify(result, null, 2));

        return result;
    } catch (error: any) {
        console.error("查询流程定义失败:", error);
        console.warn("注意：如果 Zeebe REST 端点未启用，此操作会失败");

        return {
            items: [],
            message: "查询流程定义失败，请确认 Zeebe REST 端点已启用"
        };
    }
}
