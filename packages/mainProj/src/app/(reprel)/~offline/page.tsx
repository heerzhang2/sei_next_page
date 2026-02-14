"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {WifiOff, RefreshCw, Home, Activity} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OfflinePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="space-y-6">
                <div className="text-center space-y-4">
                    <WifiOff className="w-16 h-16 mx-auto text-gray-400" />
                    <h1 className="text-3xl font-bold">您当前处于离线状态</h1>
                    <p className="text-gray-600">无法连接到服务器，但您仍可以访问已缓存的内容</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>离线功能 ~offline: 回退的PWA</CardTitle>
                        <CardDescription>以下功能在离线状态下仍然可用</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>查看已缓存的报告页面</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>编辑报告内容（本地保存）</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>浏览应用界面</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>数据将在网络恢复后自动同步</span>
                        </div>
                    </CardContent>
                </Card>

                <Alert>
                    <RefreshCw className="h-4 w-4" />
                    <AlertDescription>网络恢复后，请刷新页面以获取最新数据并同步您的更改。</AlertDescription>
                </Alert>

                <div className="flex gap-4 justify-center">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重试连接
                    </Button>
                    <Button asChild className="bg-amber-300">
                        <Link href="/offline">
                            <Activity className="w-4 h-4 mr-2" />
                            离线队列
                        </Link>
                    </Button>
                    <Button asChild className="bg-blue-300">
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            返回首页
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
