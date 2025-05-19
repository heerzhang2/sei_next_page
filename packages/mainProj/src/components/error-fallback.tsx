"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link";

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
      <h2 className="text-lg font-bold">出错了</h2>
      <p>{error.message}</p>
        <div className="grid gap-8">
          <Button variant="destructive" className="mt-2" onClick={resetErrorBoundary}>
            重试
          </Button>
            <Button variant="outline" asChild>
                <Link href="/login">用户登录</Link>
            </Button>
        </div>
    </div>
  )
}
