"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">出错了</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">抱歉，发生了一个错误。</p>
      <div className="mt-8 space-x-4">
        <Button onClick={() => reset()}>重试</Button>
        <Button variant="outline" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
