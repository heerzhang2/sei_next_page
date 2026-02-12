'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import BpmnModeler from 'bpmn-js/lib/Modeler'
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

export default function ProcessDiagramViewer({
    processInstanceKey,
    height = '600px'
}: ProcessDiagramViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const modelerRef = useRef<BpmnModeler | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProcessInstanceData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processInstanceKey])

    const renderDiagram = useCallback((bpmnXml: string, flowNodes: FlowNode[]) => {
        if (!containerRef.current) return

        // 如果已存在模型器，先销毁
        if (modelerRef.current) {
            modelerRef.current.destroy()
        }

        const modeler = new BpmnModeler({
            container: containerRef.current,
            height,
            keyboard: {
                bindTo: window
            }
        })

        modelerRef.current = modeler

        modeler.importXML(bpmnXml).then(() => {
            const canvas: any = modeler.get('canvas')
            const elementRegistry: any = modeler.get('elementRegistry')

            // 高亮所有节点
            flowNodes.forEach(node => {
                const element: ModdleElement | undefined = elementRegistry.get(node.flowNodeId)
                if (element) {
                    // 根据节点状态设置不同的标记
                    let marker = 'completed'

                    if (node.state === 'ACTIVATED') {
                        marker = 'running'
                    } else if (node.state === 'FAILED' || node.incident) {
                        marker = 'failed'
                    }

                    canvas.addMarker(node.flowNodeId, marker)
                }
            })

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

            renderDiagram(result.data.bpmnXml, result.data.flowNodes)

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

                @keyframes dash {
                    to {
                        stroke-dashoffset: -10;
                    }
                }
            `}</style>
        </>
    )
}
