import { Suspense } from "react"
import Link from "next/link"
import ProcessStatus from "@/components/process-status"
import ProcessActions from "@/components/process-actions"

export default async function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: processInstanceKey } = await params

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
            <ProcessActions processInstanceKey={processInstanceKey} />
          </div>
        </div>
      </div>
    </main>
  )
}
