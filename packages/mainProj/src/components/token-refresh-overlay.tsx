"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function TokenRefreshOverlay() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const checkRefreshStatus = () => {
      const refreshing = sessionStorage.getItem("token_refreshing")
      if (refreshing === "true") {
        setIsRefreshing(true)
      }
    }

    checkRefreshStatus()

    const handleRefreshStart = () => {
      console.log("[TokenRefreshOverlay] Token刷新开始，显示遮罩层")
      sessionStorage.setItem("token_refreshing", "true")
      setIsRefreshing(true)
    }

    const handleRefreshComplete = () => {
      console.log("[TokenRefreshOverlay] Token刷新完成，隐藏遮罩层")
      sessionStorage.removeItem("token_refreshing")
      setIsRefreshing(false)
    }

    window.addEventListener("token:refresh-start", handleRefreshStart)
    window.addEventListener("token:refreshed", handleRefreshComplete)
    window.addEventListener("token:refresh-failed", handleRefreshComplete)

    return () => {
      window.removeEventListener("token:refresh-start", handleRefreshStart)
      window.removeEventListener("token:refreshed", handleRefreshComplete)
      window.removeEventListener("token:refresh-failed", handleRefreshComplete)
    }
  }, [])

  useEffect(() => {
    if (!isRefreshing) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "正在刷新身份验证，请勿关闭或刷新页面！"
      return e.returnValue
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isRefreshing])

  if (!isRefreshing) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-800">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">正在刷新身份验证</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">请勿刷新或关闭页面...</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">⚠️ 刷新页面可能导致认证失败</p>
        </div>
      </div>
    </div>
  )
}
