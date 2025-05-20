"use server"

import { Camunda8, Auth, Zeebe } from "@camunda8/sdk"
import { zeebe } from "../../../config/camunda"

// Camunda 8 连接配置
const authConfig = {
  clientId: process.env.ZEEBE_CLIENT_ID || "",
  clientSecret: process.env.ZEEBE_CLIENT_SECRET || "",
  clusterId: process.env.ZEEBE_CLUSTER_ID || "",
  // 如果使用自托管的Zeebe，则使用以下配置
  // baseUrl: process.env.ZEEBE_BASE_URL || 'http://localhost:8080',
  // audience: process.env.ZEEBE_AUDIENCE || 'zeebe-api',
  // zeebeAddress: process.env.ZEEBE_ADDRESS || 'localhost:26500',
}

// 创建Camunda 8客户端
// const auth = new Auth(authConfig)
// const camunda8 = new Camunda8(auth)
const zeebeClient = zeebe

// 定义启动流程的参数类型
type StartProcessParams = {
  processId: string
  variables: Record<string, any>
  bpmnProcessId?: string
}

/**
 * 启动一个新的流程实例
 */
export async function startProcess({ processId, variables, bpmnProcessId }: StartProcessParams) {
  try {
    // 使用Zeebe客户端创建流程实例 processId: "pdf_generation_process",
    const result = await zeebeClient.createProcessInstance({
      bpmnProcessId: bpmnProcessId || processId,
      variables: variables,
    })

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
    // 这里需要使用Operate API或者其他方式获取流程实例状态
    // 由于@camunda8/sdk可能没有直接提供这个功能，这里只是一个示例
    // 实际实现可能需要使用CamundaRestClient或其他方式

    return {
      processInstanceKey,
      status: "ACTIVE", // 这里只是示例
      lastUpdated: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("获取流程实例状态失败:", error)
    throw new Error(`获取流程实例状态失败: ${error.message}`)
  }
}
