"use client"

import { Suspense } from "react"
import Link from "next/link"
import ProcessStatus from "@/components/process-status"

export default function ProcessPage({ params }: { params: { id: string } }) {
  const processInstanceKey = params.id

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-4xl w-full">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">流程实例详情</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Suspense fallback={<div>加载中...</div>}>
            <ProcessStatus processInstanceKey={processInstanceKey} />
          </Suspense>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">流程操作</h2>

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
          </div>
        </div>
      </div>
    </main>
  )
}
