// 动态导入模块，避免在 Edge Runtime 中加载
let Camunda8: any = null;
let dotenv: any = null;
let c8: any = null;
let restClient: any = null;

// 动态加载依赖的函数
const loadDependencies = async () => {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda8 SDK 只能在服务端使用');
    }

    if (!Camunda8 || !dotenv) {
        // 使用 Function 构造器避免静态分析
        const importCamunda = new Function('return import("@camunda8/sdk")');
        const importDotenv = new Function('return import("dotenv")');
        
        Camunda8 = await importCamunda();
        dotenv = await importDotenv();
        
        // 加载环境变量
        dotenv.config();
    }
};

// Camunda 8 连接配置
const getCamundaConfig = () => {
    // 根据认证策略配置不同的方式
    const authStrategy = process.env.CAMUNDA_AUTH_STRATEGY || "oauth";

    if (authStrategy === "oauth") {
        // OAuth 认证方式（推荐，用于 SaaS 或带有 OAuth 的自部署）
        return {
            CamundaCloud: {
                clientId: process.env.CAMUNDA_CLIENT_ID || "",
                clientSecret: process.env.CAMUNDA_CLIENT_SECRET || "",
                clusterId: process.env.CAMUNDA_CLUSTER_ID || "",
                clusterRegion: process.env.CAMUNDA_CLUSTER_REGION || "",
            },
            // 本地部署的自定义 REST 地址
            customRestUrl: process.env.ZEEBE_REST_ADDRESS || "",
            customOperateUrl: process.env.CAMUNDA_OPERATE_URL || "",
            customTasklistUrl: process.env.CAMUNDA_TASKLIST_URL || "",
            customOptimizeUrl: process.env.CAMUNDA_OPTIMIZE_URL || "",
            // 连接配置
            TLSConfig: {
                secure: process.env.CAMUNDA_SECURE_CONNECTION === "true",
                // 如果是自签名证书，可以配置如下
                allowUnauthorizedConnection: process.env.CAMUNDA_ALLOW_UNAUTHORIZED === "true",
            },
        };
    } else {
        // Basic 认证方式（用于简单认证的自部署）
        return {
            BasicAuth: {
                username: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
                password: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
            },
            // REST 和 gRPC 地址
            zeebe: {
                gatewayAddress: process.env.ZEEBE_GATEWAY_ADDRESS || "",
                restAddress: process.env.ZEEBE_REST_ADDRESS || "",
            },
            operate: {
                baseUrl: process.env.CAMUNDA_OPERATE_URL || "",
            },
            tasklist: {
                baseUrl: process.env.CAMUNDA_TASKLIST_URL || "",
            },
            // 连接配置
            TLSConfig: {
                secure: process.env.CAMUNDA_SECURE_CONNECTION === "true",
                allowUnauthorizedConnection: process.env.CAMUNDA_ALLOW_UNAUTHORIZED === "true",
            },
        };
    }
};

// 获取 Camunda8 实例的函数
async function getCamunda8Instance() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda8 SDK 只能在服务端使用');
    }

    await loadDependencies();

    if (!c8) {
        const config = getCamundaConfig();
        c8 = new Camunda8.Camunda8(config);
    }
    return c8;
}

// 获取 Orchestration Cluster API 客户端的函数（Loose 客户端）
export async function getOrchestrationClient() {
    if (typeof window !== 'undefined') {
        throw new Error('Orchestration 客户端只能在服务端使用');
    }

    const instance = await getCamunda8Instance();

    if (!restClient) {
        // 使用 Loose 客户端，适合现有代码迁移（使用普通字符串 ID）
        restClient = instance.getOrchestrationClusterApiClientLoose();
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
        // 使用 Orchestration Cluster API Loose 客户端创建流程实例
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
