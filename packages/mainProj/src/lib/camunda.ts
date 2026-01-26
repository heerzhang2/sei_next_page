// 动态导入模块，避免在 Edge Runtime 中加载
let OrchestrationClusterApi: any = null;
let restClient: any = null;

// 动态加载依赖的函数
const loadDependencies = async () => {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda8 Orchestration API 只能在服务端使用');
    }

    if (!OrchestrationClusterApi) {
        // 使用 Function 构造器避免静态分析
        const importOrchestration = new Function('return import("@camunda8/orchestration-cluster-api")');
        OrchestrationClusterApi = await importOrchestration();
    }
};

// Camunda 8 Orchestration Cluster API 连接配置
const getOrchestrationConfig = () => {
    // 基础配置
    return {
        baseUrl: process.env.ZEEBE_REST_ADDRESS || "http://192.168.109.66:9600",
        // TLS 配置（如果是 HTTPS）
        ...(process.env.ZEEBE_REST_ADDRESS?.startsWith('https') ? {
            tlsConfig: {
                rejectUnauthorized: process.env.CAMUNDA_SECURE_CONNECTION !== "false",
            },
        } : {}),
    };
};

// 获取 Orchestration Cluster API 客户端的函数
export async function getOrchestrationClient() {
    if (typeof window !== 'undefined') {
        throw new Error('Orchestration 客户端只能在服务端使用');
    }

    await loadDependencies();

    if (!restClient) {
        const config = getOrchestrationConfig();
        // 创建 Orchestration Cluster API 客户端（REST）
        restClient = new OrchestrationClusterApi.Camunda8OrchestrationClusterApiClient(config);
    }
    return restClient;
}

// 使用 Orchestration Cluster API 创建流程实例的辅助函数
export async function createProcessInstanceRest(bpmnProcessId: string, variables: Record<string, any>) {
    if (typeof window !== 'undefined') {
        throw new Error('此函数只能在服务端使用');
    }

    try {
        const client = await getOrchestrationClient();
        // 使用 Orchestration Cluster API 创建流程实例
        const response = await client.createProcessInstance({
            processDefinitionId: bpmnProcessId,
            variables,
        })

        return response
    } catch (error) {
        console.error("Error creating process instance via Orchestration API:", error)
        console.error("Process Definition ID:", bpmnProcessId)
        console.error("Variables:", JSON.stringify(variables, null, 2))
        console.error("Error details:", JSON.stringify(error, null, 2))
        throw error
    }
}
