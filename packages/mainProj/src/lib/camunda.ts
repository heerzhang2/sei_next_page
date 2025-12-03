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
const getCamundaConfig = () => ({
    CAMUNDA_AUTH_STRATEGY: process.env.CAMUNDA_AUTH_STRATEGY || "",
    CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || "",
    CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || "",
    CAMUNDA_SECURE_CONNECTION: process.env.CAMUNDA_SECURE_CONNECTION === "true",
});

// 获取 Camunda8 实例的函数
async function getCamunda8Instance() {
    if (typeof window !== 'undefined') {
        throw new Error('Camunda8 SDK 只能在服务端使用');
    }

    await loadDependencies();

    if (!c8) {
        c8 = new Camunda8.Camunda8(getCamundaConfig());
    }
    return c8;
}

// 获取 REST 客户端的函数
export async function getRestClient() {
    if (typeof window !== 'undefined') {
        throw new Error('REST 客户端只能在服务端使用');
    }

    const instance = await getCamunda8Instance();
    
    if (!restClient) {
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
        const client = await getRestClient();
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
