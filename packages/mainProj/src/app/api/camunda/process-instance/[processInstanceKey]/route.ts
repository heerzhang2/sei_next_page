import { NextResponse } from 'next/server'
import { createCamundaClient } from '@camunda8/orchestration-cluster-api'

// 创建 Camunda 客户端
function getClient() {
    return createCamundaClient({
        config: {
            CAMUNDA_REST_ADDRESS: process.env.CAMUNDA_REST_ADDRESS || 'http://192.168.171.3:8080',
            CAMUNDA_AUTH_STRATEGY: (process.env.CAMUNDA_AUTH_STRATEGY || 'BASIC') as 'BASIC' | 'NONE' | 'OAUTH',
            CAMUNDA_BASIC_AUTH_USERNAME: process.env.CAMUNDA_BASIC_AUTH_USERNAME || 'demo',
            CAMUNDA_BASIC_AUTH_PASSWORD: process.env.CAMUNDA_BASIC_AUTH_PASSWORD || 'demo',
        }
    })
}

/**
 * 获取流程实例完整信息
 * 包含：流程定义(BPMN XML)、流程实例详情、活动节点历史
 */
export async function GET(
    { params }: { params: { processInstanceKey: string } }
) {
    try {
        const { processInstanceKey } = params
        const client = getClient()

        // 1. 获取流程实例详情
        const processInstance = await client.getProcessInstance({
            processInstanceKey: BigInt(processInstanceKey)
        })

        if (!processInstance) {
            return NextResponse.json({ error: '流程实例不存在' }, { status: 404 })
        }

        // 2. 获取流程定义（包含 BPMN XML）
        const processDefinition = await client.getProcessDefinition({
            processDefinitionKey: processInstance.processDefinitionKey
        })

        // 3. 获取活动节点历史（流程扭转经过的节点）
        // 注意：使用 Operate API 获取 FlowNodeInstances
        const flowNodes = await client.operate.searchFlowNodeInstances({
            filter: {
                processInstanceKey: BigInt(processInstanceKey)
            },
            size: 100 // 获取最多100条历史记录
        })

        // 4. 获取流程变量
        const variables = await client.operate.getProcessInstanceVariables({
            processInstanceKey: BigInt(processInstanceKey)
        })

        // 整理数据
        const flowNodesList = flowNodes?.items?.map((node: any) => ({
            flowNodeInstanceId: node.flowNodeInstanceId?.toString(),
            flowNodeId: node.flowNodeId,
            flowNodeName: node.flowNodeName,
            type: node.type,
            state: node.state, // ACTIVATED, COMPLETED, TERMINATED, FAILED
            startDate: node.startDate,
            endDate: node.endDate,
            incident: node.incident
        })) || []

        return NextResponse.json({
            success: true,
            data: {
                processInstance: {
                    processInstanceKey: processInstance.processInstanceKey?.toString(),
                    processDefinitionKey: processInstance.processDefinitionKey?.toString(),
                    processDefinitionId: processInstance.processDefinitionId,
                    bpmnProcessId: processInstance.bpmnProcessId,
                    state: processInstance.state,
                    startDate: processInstance.startDate,
                    endDate: processInstance.endDate
                },
                bpmnXml: processDefinition?.resource || '',
                flowNodes: flowNodesList,
                variables: variables
            }
        })

    } catch (error: any) {
        console.error('获取流程实例失败:', error)
        return NextResponse.json({
            error: '获取流程实例失败',
            message: error.message
        }, { status: 500 })
    }
}