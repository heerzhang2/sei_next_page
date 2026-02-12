'use client'

import { useState, useEffect } from 'react'
import ProcessDiagramViewer from './ProcessDiagramViewer'
import FlowNodeList from './FlowNodeList'
import { RefreshCw } from 'lucide-react'

export default function ProcessInstanceView({ processInstanceKey }: { processInstanceKey: string }) {
    const [activeTab, setActiveTab] = useState<'diagram' | 'nodes' | 'variables'>('diagram')

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
                        { id: 'nodes', label: '节点记录' },
                        { id: 'variables', label: '流程变量' }
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

                {activeTab === 'variables' && (
                    <div className="p-4">
                        <VariablesWrapper processInstanceKey={processInstanceKey} />
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

            setData(result.data.flowNodes)
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

// 变量展示包装器
function VariablesWrapper({ processInstanceKey }: { processInstanceKey: string }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVariables()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processInstanceKey])

    async function fetchVariables() {
        try {
            const response = await fetch(`/report/api/camunda/process-instance/${processInstanceKey}`)
            const result = await response.json()
            setData(result.data?.variables)
        } catch (err: any) {
            console.error('获取变量失败:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-8 text-gray-500">加载中...</div>
    }

    if (!data || Object.keys(data).length === 0) {
        return <div className="text-center py-8 text-gray-500">暂无变量数据</div>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">变量名</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">类型</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">值</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([key, value]: [string, any]) => (
                        <tr key={key} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 font-mono text-blue-600">{key}</td>
                            <td className="py-2 px-3 text-gray-600">
                                {value === null ? 'null' : typeof value}
                            </td>
                            <td className="py-2 px-3 text-gray-700 break-all max-w-md">
                                {typeof value === 'object'
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
