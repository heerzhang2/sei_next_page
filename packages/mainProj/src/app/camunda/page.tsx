'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeaderWrapper from "@/component/header-wrapper";
import ProcessInstanceView from '@/components/camunda/ProcessInstanceView'
import { withBasePath } from '@/lib/tool'

const STORAGE_KEY = 'lastProcessInstanceKey'
const DEFAULT_KEY = '2251799836240944'

export default function CamundaPage() {
    const [processInstanceKey, setProcessInstanceKey] = useState(DEFAULT_KEY)

    // 从 localStorage 读取上次保存的流程实例ID
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem(STORAGE_KEY)
            if (savedKey) {
                setProcessInstanceKey(savedKey)
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <HeaderWrapper />
            <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-transparent" asChild>
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                </Link>
            </Button>
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
                            placeholder="输入流程实例ID，例如: 2251799836240944"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            onClick={() => window.location.href = withBasePath(`/camunda/process/${processInstanceKey}`)}
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
