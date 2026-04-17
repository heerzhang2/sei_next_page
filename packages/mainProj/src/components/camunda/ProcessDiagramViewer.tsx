'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { ModdleElement } from 'bpmn-js/lib/model/Types'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

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
    const viewerRef = useRef<any>(null)
    const animationRef = useRef<NodeJS.Timeout | null>(null)
    const flowPathRef = useRef<Array<{ type: 'node' | 'flow', id: string }>>([])
    const currentStepRef = useRef(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [bpmnViewerLoaded, setBpmnViewerLoaded] = useState(false)
    const [bpmnXmlData, setBpmnXmlData] = useState<string | null>(null)
    const [flowNodesData, setFlowNodesData] = useState<FlowNode[] | null>(null)
    const [sequenceFlowsData, setSequenceFlowsData] = useState<SequenceFlow[] | null>(null)

    // 预加载 bpmn-js
    useEffect(() => {
        let isMounted = true
        
        const loadBpmnViewer = async () => {
            try {
                const module = await import('bpmn-js/lib/NavigatedViewer')
                if (isMounted) {
                    setBpmnViewerLoaded(true)
                }
            } catch (err) {
                console.error('预加载 bpmn-js 失败:', err)
                if (isMounted) {
                    setError('加载 BPMN 查看器失败')
                }
            }
        }
        
        loadBpmnViewer()
        
        return () => {
            isMounted = false
        }
    }, [])

    // 获取数据
    useEffect(() => {
        fetchProcessInstanceData()
        return () => {
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }
            if (viewerRef.current) {
                viewerRef.current.destroy()
                viewerRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processInstanceKey])

    // 当 bpmn-js 加载完成且有数据时渲染
    useEffect(() => {
        if (bpmnViewerLoaded && bpmnXmlData && flowNodesData) {
            renderDiagram(bpmnXmlData, flowNodesData, sequenceFlowsData || undefined)
        }
    }, [bpmnViewerLoaded, bpmnXmlData, flowNodesData, sequenceFlowsData])

    const renderDiagram = useCallback(async (bpmnXml: string, flowNodes: FlowNode[], sequenceFlows?: SequenceFlow[]) => {
        if (!containerRef.current) return

        try {
            const module = await import('bpmn-js/lib/NavigatedViewer')
            const BpmnViewer = module.default

            // 如果已存在查看器，先销毁
            if (viewerRef.current) {
                viewerRef.current.destroy()
            }

            // 清理之前的动画
            if (animationRef.current) {
                clearTimeout(animationRef.current)
            }

            const viewer = new BpmnViewer({
                container: containerRef.current,
                height
            })

            viewerRef.current = viewer

            await viewer.importXML(bpmnXml)
            
            const canvas: any = viewer.get('canvas')
            const elementRegistry: any = viewer.get('elementRegistry')
            const eventBus: any = viewer.get('eventBus')

            // 禁用鼠标滚轮缩放以避免非 passive 事件警告
            eventBus.on('zoomScroll.step', function() {
                return false
            })

            // 按时间排序节点
            const sortedNodes = [...flowNodes].sort((a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )

            // 构建流转路径
            const flowPath: Array<{ type: 'node' | 'flow', id: string }> = []

            sortedNodes.forEach((node, index) => {
                flowPath.push({ type: 'node', id: node.flowNodeId })

                if (sequenceFlows && sequenceFlows.length > 0) {
                    const outgoingFlow = sequenceFlows.find(f => {
                        const flowElement = elementRegistry.get(f.elementId)
                        if (flowElement) {
                            return flowElement.source && flowElement.source.id === node.flowNodeId
                        }
                        return false
                    })
                    if (outgoingFlow) {
                        flowPath.push({ type: 'flow', id: outgoingFlow.elementId })
                    }
                }
            })

            flowPathRef.current = flowPath
            currentStepRef.current = 0

            // 设置已完成的节点为绿色
            sortedNodes.forEach(node => {
                const element: ModdleElement | undefined = elementRegistry.get(node.flowNodeId)
                if (element) {
                    if (node.state === 'ACTIVE') {
                        canvas.addMarker(node.flowNodeId, 'active')
                    } else if (node.state === 'FAILED' || node.incident) {
                        canvas.addMarker(node.flowNodeId, 'failed')
                    } else {
                        canvas.addMarker(node.flowNodeId, 'completed')
                    }
                }
            })

            // 自动缩放以适应画布
            canvas.zoom('fit-viewport')
            setZoomLevel(canvas.zoom() || 1)

            // 添加触摸手势支持
            if (containerRef.current) {
                setupTouchGestures(canvas, containerRef.current)
            }

            // 开始动画
            startAnimation(canvas, elementRegistry)

        } catch (err: any) {
            console.error('渲染 BPMN 流程图失败:', err)
            setError(`渲染流程图失败: ${err.message}`)
        }
    }, [height])

    const handleZoomIn = useCallback(() => {
        if (!viewerRef.current) return
        const canvas: any = viewerRef.current.get('canvas')
        const currentZoom = canvas.zoom() || 1
        const newZoom = Math.min(currentZoom * 1.2, 3)
        canvas.zoom(newZoom)
        setZoomLevel(newZoom)
    }, [])

    const handleZoomOut = useCallback(() => {
        if (!viewerRef.current) return
        const canvas: any = viewerRef.current.get('canvas')
        const currentZoom = canvas.zoom() || 1
        const newZoom = Math.max(currentZoom / 1.2, 0.2)
        canvas.zoom(newZoom)
        setZoomLevel(newZoom)
    }, [])

    const handleFitView = useCallback(() => {
        if (!viewerRef.current) return
        const canvas: any = viewerRef.current.get('canvas')
        canvas.zoom('fit-viewport')
        setZoomLevel(canvas.zoom() || 1)
    }, [])

    const setupTouchGestures = useCallback((canvas: any, container: HTMLElement) => {
        let initialDistance = 0
        let initialZoom = 1

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches[0], e.touches[1])
                initialZoom = canvas.zoom() || 1
                e.preventDefault()
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const currentDistance = getDistance(e.touches[0], e.touches[1])
                const scale = currentDistance / initialDistance
                const newZoom = Math.max(0.2, Math.min(3, initialZoom * scale))

                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                const centerX = (touch1.clientX + touch2.clientX) / 2
                const centerY = (touch1.clientY + touch2.clientY) / 2

                const rect = container.getBoundingClientRect()
                const viewBox = canvas.viewbox()

                const x = centerX - rect.left
                const y = centerY - rect.top

                canvas.zoom(newZoom, { x: viewBox.x + x / viewBox.scale, y: viewBox.y + y / viewBox.scale })
                setZoomLevel(newZoom)
                e.preventDefault()
            }
        }

        const getDistance = (touch1: Touch, touch2: Touch) => {
            const dx = touch1.clientX - touch2.clientX
            const dy = touch1.clientY - touch2.clientY
            return Math.sqrt(dx * dx + dy * dy)
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    const startAnimation = useCallback((canvas: any, elementRegistry: any) => {
        const flowPath = flowPathRef.current
        const animate = () => {
            const prevStep = currentStepRef.current - 1
            if (prevStep >= 0 && flowPath[prevStep]) {
                const { type, id } = flowPath[prevStep]
                const element = elementRegistry.get(id)
                if (element) {
                    if (type === 'flow') {
                        canvas.removeMarker(id, 'current-highlight')
                    } else if (type === 'node') {
                        canvas.removeMarker(id, 'node-highlight')
                    }
                }
            }

            if (currentStepRef.current >= flowPath.length) {
                const lastStep = flowPath.length - 1
                if (lastStep >= 0 && flowPath[lastStep]) {
                    const { type, id } = flowPath[lastStep]
                    const element = elementRegistry.get(id)
                    if (element) {
                        if (type === 'flow') {
                            canvas.removeMarker(id, 'current-highlight')
                        } else if (type === 'node') {
                            canvas.removeMarker(id, 'node-highlight')
                        }
                    }
                }
                animationRef.current = setTimeout(() => {
                    currentStepRef.current = 0
                    animate()
                }, 1000)
                return
            }

            const currentStepItem = flowPath[currentStepRef.current]
            if (currentStepItem) {
                const { type, id } = currentStepItem
                const element = elementRegistry.get(id)
                if (element) {
                    if (type === 'flow') {
                        canvas.addMarker(id, 'current-highlight')
                    } else if (type === 'node') {
                        canvas.addMarker(id, 'node-highlight')
                    }
                }
            }

            currentStepRef.current++
            animationRef.current = setTimeout(animate, 200)
        }

        animate()
    }, [])

    const fetchProcessInstanceData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/report/api/camunda/process-instance/${processInstanceKey}`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message || '获取流程实例数据失败')
            }

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

            // 保存数据到 state，等待 bpmn-js 加载完成后再渲染
            setBpmnXmlData(result.data.bpmnXml)
            setFlowNodesData(flowNodes)
            setSequenceFlowsData(sequenceFlows)
            setLoading(false)

        } catch (err: any) {
            setError(err.message)
            console.error('获取流程实例数据失败:', err)
            setLoading(false)
        }
    }, [processInstanceKey])

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
            <div className="relative w-full border rounded-lg bg-white" style={{ height }}>
                {/* 缩放控制工具栏 */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white rounded-lg shadow-lg border p-1">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="放大"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="缩小"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                        onClick={handleFitView}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="适应屏幕"
                    >
                        <Maximize2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="px-2 py-1 text-xs text-gray-500 font-mono">
                        {Math.round(zoomLevel * 100)}%
                    </div>
                </div>
                <div ref={containerRef} className="w-full h-full" style={{ paddingTop: '48px' }} />
            </div>
            <style>{`
                .completed:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #10b981 !important;
                    stroke-width: 2px !important;
                    fill: rgba(16, 185, 129, 0.1) !important;
                }

                .active:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #3b82f6 !important;
                    stroke-width: 3px !important;
                    fill: rgba(59, 130, 246, 0.2) !important;
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
                }

                .failed:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #ef4444 !important;
                    stroke-width: 3px !important;
                    fill: rgba(239, 68, 68, 0.2) !important;
                }

                .node-highlight:not(.djs-connection) .djs-visual > :first-child {
                    stroke: #f59e0b !important;
                    stroke-width: 4px !important;
                    fill: rgba(245, 158, 11, 0.3) !important;
                    filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.7));
                }

                .current-highlight.djs-connection .djs-visual > :first-child {
                    stroke: #f59e0b !important;
                    stroke-width: 5px !important;
                    stroke-dasharray: 0 !important;
                    animation: flowColorChange 0.8s ease-in-out infinite alternate;
                    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8));
                }

                @keyframes flowColorChange {
                    0% {
                        stroke: #f59e0b;
                        filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8));
                    }
                    100% {
                        stroke: #ef4444;
                        filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.9));
                    }
                }
            `}</style>
        </>
    )
}
