// actions/camunda-actions.ts
"use server"
import { requireRole } from "@/lib/role-auth"
import { auth } from "@/app/auth"
import { createProcessInstanceRest, listAllProcessDefinitions } from "../lib/camunda"

// 定义启动流程的参数类型
type StartProcessParams = {
    processId: string
    variables: Record<string, any>
    bpmnProcessId?: string
}

const MAX_PDF_YEAR = 30

/**
 * 检查 Java GraphQL 后端是否在线
 */
async function checkGraphQLBackendOnline(): Promise<boolean> {
    try {
        const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8371/graphql"
        const response = await fetch(graphqlEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{ __typename }" }),
            signal: AbortSignal.timeout(3000),
        })
        return response.ok
    } catch {
        return false
    }
}

/**
 * 启动一个新的流程实例 (使用 REST API)
 */
export async function startPdfCvtProcess({ processId, variables, bpmnProcessId }: StartProcessParams) {
    // 检查日期逻辑
    const expirationDate = new Date(variables?.expiration);
    const currentDate = new Date();
    const thirtyYearsLater = new Date(currentDate);
    thirtyYearsLater.setFullYear(currentDate.getFullYear() + MAX_PDF_YEAR);
    const isOver30Years = expirationDate > thirtyYearsLater;

    if(isOver30Years) return {
        success: false,
        error: `保存期最多${MAX_PDF_YEAR}年`
    }

    // 首先尝试使用 requireRole 进行角色验证（会检查 Redis 缓存）
    const roleCheckResult = await requireRole(["JyUser"])
    
    // 如果角色验证通过，直接使用
    if (roleCheckResult.success) {
        const { session, userRoles } = roleCheckResult
        
        try {
            variables["author"] = session?.user?.name;

            console.log("启动流程 - processId:", processId, "bpmnProcessId:", bpmnProcessId);
            const processDefinitionId = bpmnProcessId || processId;
            console.log("使用的 processDefinitionId:", processDefinitionId);

            const result = await createProcessInstanceRest(processDefinitionId, variables)

            return {
                success: true,
                processInstanceKey: result.processInstanceKey,
                variables: variables,
                timestamp: new Date().toISOString(),
            }
        } catch (error: any) {
            console.error("启动流程实例失败:", error)
            return {
                success: false,
                error: error.message,
            }
        }
    }
    
    // 角色验证失败，检查是否是未登录错误
    if (roleCheckResult.code === "UNAUTHORIZED") {
        // 检查 Java GraphQL 后端是否在线
        const isBackendOnline = await checkGraphQLBackendOnline()
        
        if (isBackendOnline) {
            // 后端在线，但 requireRole 返回未登录，说明 session 确实有问题
            // 此时应该返回错误，保持一致性
            return {
                success: false,
                error: roleCheckResult.error,
                code: "UNAUTHORIZED",
            }
        } else {
            // 后端离线，尝试使用 next-auth 的 session（离线模式）
            const session = await auth()
            
            if (session?.user?.name) {
                console.log("[startPdfCvtProcess] GraphQL 后端离线，使用 next-auth session:", session.user.name)
                
                try {
                    variables["author"] = session.user.name;

                    console.log("启动流程（离线模式）- processId:", processId, "bpmnProcessId:", bpmnProcessId);
                    const processDefinitionId = bpmnProcessId || processId;

                    const result = await createProcessInstanceRest(processDefinitionId, variables)

                    return {
                        success: true,
                        processInstanceKey: result.processInstanceKey,
                        variables: variables,
                        timestamp: new Date().toISOString(),
                        offlineMode: true, // 标记为离线模式
                    }
                } catch (error: any) {
                    console.error("启动流程实例失败（离线模式）:", error)
                    return {
                        success: false,
                        error: error.message,
                    }
                }
            } else {
                return {
                    success: false,
                    error: "用户未登录",
                    code: "UNAUTHORIZED",
                }
            }
        }
    }
    
    // 其他错误（如权限不足）
    return {
        success: false,
        error: roleCheckResult.error,
        code: roleCheckResult.code,
    }
}

/**
 * 获取流程实例状态
 * 注意：这个函数需要直接使用 REST API 调用，而不是通过 SDK
 * 为什么 authToken 没有设置也能提取数据成功啊
 */
export async function getProcessInstanceStatus(processInstanceKey: string) {
    try {
        // 由于我们不能在客户端使用 SDK，这里需要直接调用 Camunda REST API
        // 你需要根据你的 Camunda 部署设置以下环境变量
        const camundaBaseUrl = process.env.CAMUNDA_BASE_URL;
        const authToken = process.env.CAMUNDA_AUTH_TOKEN;

        if (!camundaBaseUrl) {
            throw new Error("Camunda 基础URL未配置");
        }
        //process-instance
        const response = await fetch(
            `${camundaBaseUrl}/process-instances/${processInstanceKey}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            processInstanceKey,
            status: data.state || "UNKNOWN",
            lastUpdated: new Date().toISOString(),
        }
    } catch (error: any) {
        console.error("获取流程实例状态失败:", error)
        return {
            status: "ERROR",
            error: error.message,
        }
    }
}

/**
 * 列出所有流程定义（用于调试）
 */
export async function listProcessDefinitionsAction() {
    try {
        const result = await listAllProcessDefinitions();
        return {
            success: true,
            data: result
        };
    } catch (error: any) {
        console.error("查询流程定义失败:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
