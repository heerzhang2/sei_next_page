'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import BpmnViewer from 'bpmn-js/lib/Viewer'
import type { ModdleElement } from 'bpmn-js/lib/model/Types'

interface FlowNode {
    flowNodeInstanceId: string
    flowNodeId: string
    flowNodeName: string
    type: string
    state: string
    startDate: string
    endDate: string
    incident?: any
}

interface ProcessDiagramViewerProps {
    processInstanceKey: string
    height?: string
}

interface SequenceFlow {
    sequenceFlowId: string
    elementId: string
}

export default function ProcessDiagramViewer({
    processInstanceKey,
    height = '600px'
}: ProcessDiagramViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<BpmnViewer | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProcessInstanceData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processInstanceKey])

    const renderDiagram = useCallback((bpmnXml: string, flowNodes: FlowNode[], sequenceFlows?: SequenceFlow[]) => {
        if (!containerRef.current) return

        // 如果已存在查看器，先销毁
        if (viewerRef.current) {
            viewerRef.current.destroy()
        }

        const viewer = new BpmnViewer({
            container: containerRef.current,
            height
        })

        viewerRef.current = viewer

        viewer.importXML(bpmnXml).then(() => {
            const canvas: any = viewer.get('canvas')
            const elementRegistry: any = viewer.get('elementRegistry')

            // 高亮所有节点
            flowNodes.forEach(node => {
                const element: ModdleElement | undefined = elementRegistry.get(node.flowNodeId)
                if (element) {
                    // 根据节点状态设置不同的标记
                    let marker = 'completed'

                    if (node.state === 'ACTIVE') {
                        marker = 'running'
                    } else if (node.state === 'FAILED' || node.incident) {
                        marker = 'failed'
                    }

                    canvas.addMarker(node.flowNodeId, marker)
                }
            })

            // 高亮流转连接线
            if (sequenceFlows && sequenceFlows.length > 0) {
                sequenceFlows.forEach((flow, index) => {
                    const flowElement: ModdleElement | undefined = elementRegistry.get(flow.elementId)
                    if (flowElement) {
                        canvas.addMarker(flow.elementId, 'flow-active')
                    }
                })
            }

            // 自动缩放以适应画布
            canvas.zoom('fit-viewport')

        }).catch((err: any) => {
            console.error('渲染 BPMN 流程图失败:', err)
            setError(`渲染流程图失败: ${err.message}`)
        })
    }, [height])

    const fetchProcessInstanceData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/report/api/camunda/process-instance/${processInstanceKey}`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message || '获取流程实例数据失败')
            }

            // 转换 API 返回的数据格式以适配组件
            const flowNodes = result.data.flowNodes.map((node: any) => ({
                flowNodeInstanceId: node.elementInstanceKey,
                flowNodeId: node.elementId,
                flowNodeName: node.elementName,
                type: node.type,
                state: node.state,
                startDate: node.startDate,
                endDate: node.endDate,
                incident: node.hasIncident
            }))

            const sequenceFlows = result.data.sequenceFlows?.map((flow: any) => ({
                sequenceFlowId: flow.sequenceFlowId,
                elementId: flow.elementId
            })) || []

            renderDiagram(result.data.bpmnXml, flowNodes, sequenceFlows)

        } catch (err: any) {
            setError(err.message)
            console.error('获取流程实例数据失败:', err)
        } finally {
            setLoading(false)
        }
    }, [processInstanceKey, renderDiagram])

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height }}>
                <div className="text-gray-500">加载流程图...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center bg-red-50" style={{ height }}>
                <div className="text-red-600">{error}</div>
            </div>
        )
    }

    return (
        <>
            <div ref={containerRef} className="w-full border rounded-lg" style={{ height }} />
            <style>{`
                .completed:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #10b981 !important;
                    stroke-width: 2px !important;
                }

                .running:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #3b82f6 !important;
                    stroke-width: 3px !important;
                    stroke-dasharray: 5, 5;
                    animation: dash 1s linear infinite;
                }

                .failed:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                }

                .completed.djs-connection .djs-visual > :first-child {
                    stroke: #10b981 !important;
                    stroke-width: 2px !important;
                }

                /* 流转连接线动画 */
                .flow-active.djs-connection .djs-visual > :first-child {
                    stroke: #3b82f6 !important;
                    stroke-width: 3px !important;
                    stroke-dasharray: 10, 10;
                    animation: flowDash 1.5s linear infinite;
                    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
                }

                /* 当前活动节点到下一个节点的流向动画 */
                .running:not(.djs-connection) .djs-visual > :first-child {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
                }

                @keyframes dash {
                    to {
                        stroke-dashoffset: -10;
                    }
                }

                @keyframes flowDash {
                    to {
                        stroke-dashoffset: -20;
                    }
                }
            `}</style>
        </>
    )
}
