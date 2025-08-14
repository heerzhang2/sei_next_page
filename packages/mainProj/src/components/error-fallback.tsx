"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Error Boundary Caught:", error)
    }, [error])
  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle className="text-red-600">{"出错了！"}</CardTitle>
                  <CardDescription>{"抱歉，应用程序发生了一个意外错误。"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <p className="font-mono text-sm text-gray-700">
                      <strong>{"错误信息:"}</strong> {error.message}
                  </p>
                  {error.digest && (
                      <p className="font-mono text-xs text-gray-500">
                          <strong>{"摘要:"}</strong> {error.digest}
                      </p>
                  )}
                  <details className="text-sm text-gray-600">
                      <summary className="cursor-pointer font-semibold">{"查看详情"}</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-all rounded-md bg-gray-50 p-3 text-xs text-gray-800">
              {error.stack}
            </pre>
                  </details>
              </CardContent>
              <CardFooter className="flex justify-end">
                  <Button variant="destructive" className="mt-2" onClick={resetErrorBoundary}>
                      重试
                  </Button>
                  <Button variant="outline" asChild>
                      <Link href="/login">用户登录</Link>
                  </Button>
              </CardFooter>
          </Card>
      </div>
  )
}
