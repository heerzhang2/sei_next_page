// actions/camunda-actions.ts
"use server"
import { requireRole } from "@/lib/role-auth"
import { createProcessInstanceRest, listAllProcessDefinitions } from "../lib/camunda"

// 定义启动流程的参数类型
type StartProcessParams = {
    processId: string
    variables: Record<string, any>
    bpmnProcessId?: string
}

const MAX_PDF_YEAR = 30

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

    // 角色验证
    const { session, userRoles } = await requireRole(["JyUser"])

    if (!session?.user) {
        return {
            success: false,
            error: "用户未登录",
        }
    }

    try {
        variables["author"] = session?.user?.name;

        console.log("启动流程 - processId:", processId, "bpmnProcessId:", bpmnProcessId);
        // 直接使用 processDefinitionId (即 bpmnProcessId 或 processId)
        const processDefinitionId = bpmnProcessId || processId;
        console.log("使用的 processDefinitionId:", processDefinitionId);

        // 使用 REST API 创建流程实例（无需查询，直接使用 processDefinitionId）
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

/**
 * 获取流程实例状态
 * 注意：这个函数需要直接使用 REST API 调用，而不是通过 SDK
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

        const response = await fetch(
            `${camundaBaseUrl}/process-instance/${processInstanceKey}`,
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
