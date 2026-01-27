// Camunda 8 Orchestration Cluster API - Zero-Config 方式
// 官方文档: https://github.com/camunda/camunda-8-sdk-js?tab=readme-ov-file#quick-start-zero-config--recommended

let camundaClient: any = null;

/**
 * 获取 Camunda 8 客户端（使用程序化配置方式）
 */
export async function getCamundaClient() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda 客户端只能在服务端使用');
    }

    // 每次都创建新客户端以避免缓存问题
    // 动态导入，避免在 Edge Runtime 中加载
    const createCamundaClient = (await import('@camunda8/orchestration-cluster-api')).createCamundaClient;

    // 尝试多个可能的端点
    const possibleEndpoints = [
        'http://192.168.109.66:31000',  // Java 后端配置的 rest-address
        'http://192.168.109.66:9600',   // Java 后端 Operate 端点
        'http://192.168.109.66:26500',  // Zeebe Gateway
    ];

    // 使用程序化配置（避免环境变量问题）
    camundaClient = createCamundaClient({
        config: {
            CAMUNDA_REST_ADDRESS: process.env.CAMUNDA_REST_ADDRESS || possibleEndpoints[0],
            CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || 'BASIC',
            CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || 'demo',
            CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || 'demo',
            CAMUNDA_ALLOW_UNAUTHORIZED: process.env.CAMUNDA_ALLOW_UNAUTHORIZED === 'true' ? 'true' : 'false',
        }
    });

    console.log("Camunda 客户端配置:", JSON.stringify(camundaClient.getConfig(), null, 2));
    console.log("尝试的端点列表:", possibleEndpoints);

    return camundaClient;
}

/**
 * 使用 Orchestration Cluster API 创建流程实例
 */
export async function createProcessInstanceRest(bpmnProcessId: string, variables: Record<string, any>) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        const client = await getCamundaClient();

        console.log("创建流程实例 - bpmnProcessId:", bpmnProcessId);
        console.log("创建流程实例 - variables:", JSON.stringify(variables, null, 2));

        // 检查 createProcessInstance 方法的签名
        console.log("检查 createProcessInstance 方法签名...");
        const methodStr = (client as any).createProcessInstance.toString();
        console.log("方法字符串:", methodStr.substring(0, 500));

        // 尝试使用正确的字段名
        // Orchestration Cluster API 使用 processDefinitionKey 字段
        const response = await client.createProcessInstance({
            processDefinitionKey: bpmnProcessId,
            variables,
        });

        console.log("流程实例创建成功:", JSON.stringify(response, null, 2));
        return response;
    } catch (error: any) {
        // 如果是 404 错误，说明流程定义不存在
        if (error.status === 404) {
            throw new Error(`流程定义 "${bpmnProcessId}" 不存在。请确保流程已部署到 Camunda。可以检查 Java 后端是否已成功部署该流程。`);
        }
        console.error("Error creating process instance:", error);
        console.error("Process Definition ID:", bpmnProcessId);
        console.error("Variables:", JSON.stringify(variables, null, 2));
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
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
        const client = await getCamundaClient();
        const config = client.getConfig();

        console.log("正在尝试访问:", config.restAddress);
        console.log("完整 URL 预期:", `${config.restAddress}/process-definitions`);

        // 先尝试简单的 getTopology 测试连接
        try {
            console.log("先测试 getTopology...");
            const topology = await (client as any).getTopology();
            console.log("getTopology 成功:", JSON.stringify(topology, null, 2));
        } catch (topoError: any) {
            console.error("getTopology 失败:", topoError.status, topoError.message);
        }

        // searchProcessDefinitions 接受两个参数：
        // 第一个参数是请求体 { filter: {...} }
        // 第二个参数是 consistencyManagement 对象 { consistency: {...} }
        console.log("正在查询流程定义...");
        const result = await (client as any).searchProcessDefinitions(
            {},  // 请求体（filter 等参数，为空则返回所有）
            { consistency: { waitUpToMs: 5000 } }  // consistencyManagement 配置
        );

        console.log("查询到的流程定义数量:", result.items?.length || 0);
        if (result.items && result.items.length > 0) {
            console.log("流程定义列表:", JSON.stringify(result.items.map((d: any) => ({
                bpmnProcessId: d.bpmnProcessId,
                processDefinitionId: d.processDefinitionId,
                version: d.version,
                name: d.name
            })), null, 2));
        }

        return result;
    } catch (error: any) {
        console.error("查询流程定义失败:", error);
        console.error("错误详情:", JSON.stringify(error, null, 2));

        throw error;
    }
}

/**
 * 从 BPMN XML 字符串部署流程定义
 */
export async function deployProcessFromBpmn(bpmnContent: string, filename: string) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        const client = await getCamundaClient();

        // 创建 File 对象用于部署
        const { File } = await import('node:buffer');
        const file = new File([Buffer.from(bpmnContent)], filename, { type: 'application/xml' });

        const result = await client.createDeployment({ resources: [file] });

        return result;
    } catch (error) {
        console.error("部署流程定义失败:", error);
        throw error;
    }
}
