"use client"

import { useState, useEffect } from "react"
import { getProcessInstanceStatus } from "@/actions/camunda-actions"

interface ProcessStatusProps {
  processInstanceKey: string
}

export default function ProcessStatus({ processInstanceKey }: ProcessStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await getProcessInstanceStatus(processInstanceKey)
        setStatus(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // 每10秒刷新一次状态
    const interval = setInterval(fetchStatus, 10000)

    return () => clearInterval(interval)
  }, [processInstanceKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2">加载中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
        <p>无法加载流程状态: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="font-medium mb-2">流程实例状态</h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-600">流程实例ID:</div>
        <div>{processInstanceKey}</div>

        <div className="text-gray-600">状态:</div>
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status.status === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : status.status === "ACTIVE"
                  ? "bg-blue-100 text-blue-800"
                  : status.status === "INCIDENT"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {status.status}
          </span>
        </div>

        <div className="text-gray-600">最后更新:</div>
        <div>{new Date(status.lastUpdated).toLocaleString()}</div>
      </div>
    </div>
  )
}
