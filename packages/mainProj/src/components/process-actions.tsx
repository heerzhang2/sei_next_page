"use client"

import React from "react"

interface ProcessActionsProps {
  processInstanceKey: string
}

export default function ProcessActions({ processInstanceKey }: ProcessActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md flex items-center justify-center"
        onClick={() => window.open(`https://operate.camunda.io/processes/${processInstanceKey}`, "_blank")}
      >
        在Operate中查看
      </button>

      <button
        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md flex items-center justify-center"
        onClick={() => alert("取消功能尚未实现")}
      >
        取消流程实例
      </button>
    </div>
  )
}
