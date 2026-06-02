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
 * 批量查询流程实例状态
 * POST /api/camunda/batch-sync
 * Body: { processInstanceKeys: string[] }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { processInstanceKeys } = body

        if (!Array.isArray(processInstanceKeys) || processInstanceKeys.length === 0) {
            return NextResponse.json(
                { error: 'processInstanceKeys 必须是非空数组' },
                { status: 400 }
            )
        }

        // 限制批量查询数量，防止性能问题
        const MAX_BATCH_SIZE = 50
        const keysToQuery = processInstanceKeys.slice(0, MAX_BATCH_SIZE)

        const client = getClient()
        const results: Array<{
            processInstanceKey: string
            status: 'running' | 'completed' | 'failed' | 'unknown'
            camundaState?: string
            error?: string
        }> = []

        // 并行查询所有流程实例
        const queryPromises = keysToQuery.map(async (key) => {
            try {
                const processInstance = await client.getProcessInstance(
                    { processInstanceKey: key },
                    {
                        consistency: {
                            waitUpToMs: 5000,
                            pollIntervalMs: 200,
                        }
                    }
                )

                if (!processInstance) {
                    return {
                        processInstanceKey: key,
                        status: 'unknown' as const,
                        camundaState: 'NOT_FOUND',
                        error: '流程实例不存在'
                    }
                }

                // 映射 Camunda 状态到本地状态
                // Camunda 状态: ACTIVE, COMPLETED, TERMINATED
                let status: 'running' | 'completed' | 'failed' | 'unknown'
                const camundaState = processInstance.state

                switch (camundaState) {
                    case 'ACTIVE':
                        status = 'running'
                        break
                    case 'COMPLETED':
                        status = 'completed'
                        break
                    case 'TERMINATED':
                        status = 'failed'
                        break
                    default:
                        status = 'unknown'
                }

                return {
                    processInstanceKey: key,
                    status,
                    camundaState,
                }
            } catch (error: any) {
                // 如果是 404 错误，表示流程实例不存在（可能已过期被清理）
                if (error.message?.includes('404') || error.message?.includes('not found')) {
                    return {
                        processInstanceKey: key,
                        status: 'unknown' as const,
                        camundaState: 'NOT_FOUND',
                        error: '流程实例不存在或已被清理'
                    }
                }

                return {
                    processInstanceKey: key,
                    status: 'unknown' as const,
                    error: error.message || '查询失败'
                }
            }
        })

        const queryResults = await Promise.all(queryPromises)
        results.push(...queryResults)

        // 统计信息
        const stats = {
            total: results.length,
            running: results.filter(r => r.status === 'running').length,
            completed: results.filter(r => r.status === 'completed').length,
            failed: results.filter(r => r.status === 'failed').length,
            unknown: results.filter(r => r.status === 'unknown').length,
        }

        return NextResponse.json({
            success: true,
            data: results,
            stats,
            message: `成功同步 ${results.length} 个流程实例状态`
        })

    } catch (error: any) {
        console.error('批量同步流程实例状态失败:', error)
        return NextResponse.json(
            {
                success: false,
                error: '批量同步失败',
                message: error.message
            },
            { status: 500 }
        )
    }
}
