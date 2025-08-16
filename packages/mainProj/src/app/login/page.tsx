"use client"

import SignInForm from "@/app/login/SignInForm"
import { OfflineLoginForm } from "@/components/offline-login-form"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false)
  const networkStatus = useNetworkStatus()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>正在加载登录页面...</p>
          </div>
        </div>
    )
  }

  if (!networkStatus.isNextJSServerReachable && networkStatus.isGraphQLBackendReachable) {
    // Next.js服务器离线但Java后端可达，只显示离线登录
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">服务器离线模式</h1>
              <p className="text-muted-foreground">Next.js服务器不可用，使用直连后端登录</p>
            </div>
            <OfflineLoginForm />
          </div>
        </div>
    )
  }

  if (!networkStatus.isNextJSServerReachable && !networkStatus.isGraphQLBackendReachable) {
    // 完全离线，无法登录
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">完全离线模式</h1>
            <p className="text-muted-foreground mb-4">无法连接到任何服务器，新用户无法登录。</p>
            <p className="text-sm text-muted-foreground">如果您之前已登录，请直接访问应用页面使用离线功能。</p>
          </div>
        </div>
    )
  }

  return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">标准登录</TabsTrigger>
              <TabsTrigger value="offline" disabled={!networkStatus.isGraphQLBackendReachable}>
                离线登录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-6">
              <SignInForm />
            </TabsContent>

            <TabsContent value="offline" className="mt-6">
              <OfflineLoginForm />
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div
                  className={`w-2 h-2 rounded-full ${networkStatus.isNextJSServerReachable ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span>Next.js: {networkStatus.isNextJSServerReachable ? "在线" : "离线"}</span>
              <div
                  className={`w-2 h-2 rounded-full ${networkStatus.isGraphQLBackendReachable ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span>后端: {networkStatus.isGraphQLBackendReachable ? "在线" : "离线"}</span>
            </div>
          </div>
        </div>
      </div>
  )
}
