"use server"

import { restClient, createProcessInstanceRest } from "../../../config/camunda"

// 定义启动流程的参数类型
type StartProcessParams = {
  processId: string
  variables: Record<string, any>
  bpmnProcessId?: string
}

/**
 * 启动一个新的流程实例 (使用 REST API)
 */
export async function startProcess({ processId, variables, bpmnProcessId }: StartProcessParams) {
  try {
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
    throw new Error(`启动流程实例失败: ${error.message}`)
  }
}

/**
 * 获取流程实例状态
 */
export async function getProcessInstanceStatus(processInstanceKey: string) {
  try {
    // 使用 REST API 获取流程实例状态
    // 注意: 根据 @camunda8/sdk 的 REST API 实际方法进行调整 CamundaRestClient
    const status = await restClient.getProcessInstanceStatus(processInstanceKey)

    return {
      processInstanceKey,
      status: status.state || "UNKNOWN",
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("获取流程实例状态失败:", error)
    throw new Error(`获取流程实例状态失败: ${error.message}`)
  }
}
