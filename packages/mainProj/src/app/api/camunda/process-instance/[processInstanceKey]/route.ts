import { NextResponse } from 'next/server'
import { createCamundaClient } from '@camunda8/orchestration-cluster-api'

// 创建 Camunda 客户端
function getClient() {
    return createCamundaClient({
        config: {
            CAMUNDA_REST_ADDRESS: process.env.CAMUNDA_REST_ADDRESS || 'http://192.168.171.3:8080/v2',
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
    request: Request,
    context: { params: Promise<{ processInstanceKey: string }> }
) {
    try {
        const resolvedParams = await context.params
        const processInstanceKey = resolvedParams.processInstanceKey

        if (!processInstanceKey) {
            return NextResponse.json({ error: 'processInstanceKey is missing' }, { status: 400 })
        }

        const client = getClient()

        // 1. 获取流程实例详情
        const processInstance = await client.getProcessInstance(
            { processInstanceKey: BigInt(processInstanceKey) },
            {
                consistency: {
                    waitUpToMs: 5000,
                    pollIntervalMs: 200,
                }
            }
        )

        if (!processInstance) {
            return NextResponse.json({ error: '流程实例不存在' }, { status: 404 })
        }

        // 2. 获取流程定义（包含 BPMN XML）
        const processDefinition = await client.getProcessDefinition(
            { processDefinitionKey: processInstance.processDefinitionKey },
            {
                consistency: {
                    waitUpToMs: 5000,
                    pollIntervalMs: 200,
                }
            }
        )

        // 3. 获取 BPMN XML
        let bpmnXml = processDefinition?.resource || ''

        if (!bpmnXml) {
            const processDefinitionXml = await client.getProcessDefinitionXml(
                { processDefinitionKey: processInstance.processDefinitionKey },
                {
                    consistency: {
                        waitUpToMs: 5000,
                        pollIntervalMs: 200,
                    }
                }
            )
            // getProcessDefinitionXml 直接返回 XML 字符串
            bpmnXml = processDefinitionXml || ''
        }

        // 4. 获取活动节点（element instances）
        const elementInstancesResult = await client.searchElementInstances(
            {
                filter: {
                    processInstanceKey: processInstance.processInstanceKey
                }
            },
            {
                consistency: {
                    waitUpToMs: 5000,
                    pollIntervalMs: 200,
                }
            }
        )

        // 5. 获取流转线路（sequence flows）
        const sequenceFlowsResult = await client.getProcessInstanceSequenceFlows(
            { processInstanceKey: processInstance.processInstanceKey },
            {
                consistency: {
                    waitUpToMs: 5000,
                    pollIntervalMs: 200,
                }
            }
        )

        return NextResponse.json({
            success: true,
            data: {
                processInstance,
                bpmnXml,
                flowNodes: elementInstancesResult?.items || [],
                sequenceFlows: sequenceFlowsResult?.items || [],
                variables: {}
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