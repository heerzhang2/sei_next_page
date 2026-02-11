'use client'

import { useState } from 'react'
import ProcessInstanceView from '@/components/camunda/ProcessInstanceView'

export default function CamundaPage() {
    const [processInstanceKey, setProcessInstanceKey] = useState('2251799814298190')

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 输入框 */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        流程实例ID
                    </label>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={processInstanceKey}
                            onChange={(e) => setProcessInstanceKey(e.target.value)}
                            placeholder="输入流程实例ID，例如: 2251799814298190"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            onClick={() => window.location.href = `/camunda/process/${processInstanceKey}`}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            查看
                        </button>
                    </div>
                </div>

                {/* 流程实例详情 */}
                <ProcessInstanceView processInstanceKey={processInstanceKey} />
            </div>
        </div>
    )
}
