"use server"
import { requireRole } from "@/lib/role-auth"
import { restClient, createProcessInstanceRest } from "../lib/camunda"


// 定义启动流程的参数类型
type StartProcessParams = {
  processId: string
  variables: Record<string, any>
  bpmnProcessId?: string
}

const MAX_PDF_YEAR =30
/**
 * 启动一个新的流程实例 (使用 REST API)
 */
export async function startPdfCvtProcess({ processId, variables, bpmnProcessId }: StartProcessParams) {
  const expirationDate = new Date(variables?.expiration);
  const currentDate = new Date();
  const thirtyYearsLater = new Date(currentDate);
  thirtyYearsLater.setFullYear(currentDate.getFullYear() + MAX_PDF_YEAR);
  const isOver30Years = expirationDate > thirtyYearsLater;
  if(isOver30Years) return {
    success: false,
    error: `保存期最多${MAX_PDF_YEAR}年`
  }
  //角色的名字必须和后端保证一致性啊。
  const { session, userRoles } = await requireRole(["JyUser"])
 //还【需要】在server component当中，对用户进行权限认证的：
 //  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "用户未登录",
    }
  }
  //若用户有权的，继续执行： “后端转pdf”按钮：检验员才能用，其它的如企业用户不能用。
  try {
    variables["author"]=session?.user?.name;     //后端账户系统的 username;
    // 使用 REST API 创建流程实例
    const result = await createProcessInstanceRest(bpmnProcessId || processId, variables)

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
 */
export async function getProcessInstanceStatus(processInstanceKey: string) {
  try {
    // 使用 REST API 获取流程实例状态
    // 注意: 根据 @camunda8/sdk 的 REST API 实际方法进行调整 CamundaRestClient
    // @ts-ignore
    const status = await restClient.getProcessInstanceByKey(processInstanceKey)

    return {
      processInstanceKey,
      status: status.state || "UNKNOWN",
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("获取流程实例状态失败:", error)
    return {
      status: "ERROR",
    }
  }
}
