'use client'

import { useMemo } from 'react'

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

interface FlowNodeListProps {
    flowNodes: FlowNode[]
}

export default function FlowNodeList({ flowNodes }: FlowNodeListProps) {
    // 按时间排序
    const sortedNodes = useMemo(() => {
        return [...flowNodes].sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
    }, [flowNodes])

    // 状态样式映射
    const getStateStyle = (state: string, hasIncident: boolean) => {
        if (hasIncident) {
            return 'bg-red-50 border-red-200 text-red-800'
        }
        switch (state) {
            case 'ACTIVATED':
                return 'bg-blue-50 border-blue-200 text-blue-800'
            case 'COMPLETED':
                return 'bg-green-50 border-green-200 text-green-800'
            case 'TERMINATED':
                return 'bg-gray-50 border-gray-200 text-gray-800'
            case 'FAILED':
                return 'bg-red-50 border-red-200 text-red-800'
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800'
        }
    }

    const getStateLabel = (state: string, hasIncident: boolean) => {
        if (hasIncident) return '异常'
        switch (state) {
            case 'ACTIVATED':
                return '运行中'
            case 'COMPLETED':
                return '已完成'
            case 'TERMINATED':
                return '已终止'
            case 'FAILED':
                return '失败'
            default:
                return state
        }
    }

    const formatDuration = (start: string, end: string) => {
        if (!start || !end) return '-'
        const duration = new Date(end).getTime() - new Date(start).getTime()
        if (duration < 1000) return `${duration}ms`
        if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`
        return `${(duration / 60000).toFixed(2)}min`
    }

    if (sortedNodes.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                暂无节点数据
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {/* 表头 */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-gray-500 border-b">
                <div className="col-span-1">#</div>
                <div className="col-span-2">节点名称</div>
                <div className="col-span-2">节点ID</div>
                <div className="col-span-2">状态</div>
                <div className="col-span-2">开始时间</div>
                <div className="col-span-2">结束时间</div>
                <div className="col-span-1">耗时</div>
            </div>

            {/* 节点列表 */}
            <div className="max-h-[400px] overflow-y-auto">
                {sortedNodes.map((node, index) => {
                    const stateStyle = getStateStyle(node.state, !!node.incident)

                    return (
                        <div
                            key={node.flowNodeInstanceId}
                            className="grid grid-cols-12 gap-2 px-3 py-2 text-xs border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="col-span-1 text-gray-400 font-mono">
                                {index + 1}
                            </div>
                            <div className="col-span-2 font-medium truncate" title={node.flowNodeName}>
                                {node.flowNodeName || '-'}
                            </div>
                            <div className="col-span-2 font-mono text-gray-600 truncate" title={node.flowNodeId}>
                                {node.flowNodeId}
                            </div>
                            <div className="col-span-2">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${stateStyle}`}>
                                    {getStateLabel(node.state, !!node.incident)}
                                </span>
                            </div>
                            <div className="col-span-2 text-gray-600">
                                {node.startDate ? new Date(node.startDate).toLocaleString('zh-CN') : '-'}
                            </div>
                            <div className="col-span-2 text-gray-600">
                                {node.endDate ? new Date(node.endDate).toLocaleString('zh-CN') : '-'}
                            </div>
                            <div className="col-span-1 text-gray-500 font-mono">
                                {formatDuration(node.startDate, node.endDate)}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 统计信息 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <div className="flex justify-between">
                    <span>总节点数: <strong>{sortedNodes.length}</strong></span>
                    <span>已完成: <strong>{sortedNodes.filter(n => n.state === 'COMPLETED').length}</strong></span>
                    <span>运行中: <strong>{sortedNodes.filter(n => n.state === 'ACTIVATED').length}</strong></span>
                    <span>异常: <strong>{sortedNodes.filter(n => n.incident).length}</strong></span>
                </div>
            </div>
        </div>
    )
}
