'use client'

import { useState, useEffect } from 'react'
import ProcessDiagramViewer from './ProcessDiagramViewer'
import FlowNodeList from './FlowNodeList'
import { RefreshCw } from 'lucide-react'

export default function ProcessInstanceView({ processInstanceKey }: { processInstanceKey: string }) {
    const [activeTab, setActiveTab] = useState<'diagram' | 'nodes'>('diagram')

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">流程实例详情</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        实例ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{processInstanceKey}</code>
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    刷新
                </button>
            </div>

            {/* 标签页 */}
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex gap-4">
                    {[
                        { id: 'diagram', label: '流程图' },
                        { id: 'nodes', label: '节点记录' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* 内容区 */}
            <div className="bg-white rounded-lg shadow">
                {activeTab === 'diagram' && (
                    <ProcessDiagramViewer
                        processInstanceKey={processInstanceKey}
                        height="700px"
                    />
                )}

                {activeTab === 'nodes' && (
                    <div className="p-4">
                        <FlowNodeListWrapper processInstanceKey={processInstanceKey} />
                    </div>
                )}
            </div>
        </div>
    )
}

// 节点列表包装器（用于获取数据）
function FlowNodeListWrapper({ processInstanceKey }: { processInstanceKey: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProcessInstanceData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processInstanceKey])

    async function fetchProcessInstanceData() {
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
            setData(flowNodes)
        } catch (err: any) {
            setError(err.message)
            console.error('获取节点列表失败:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-8 text-gray-500">加载中...</div>
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>
    }

    return <FlowNodeList flowNodes={data || []} />
}
