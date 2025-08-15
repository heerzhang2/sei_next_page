"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Download, Wifi, WifiOff } from "lucide-react"

interface ReportCacheManagerProps {
    repId: string
    template: string
    version: string
}

export function ReportCacheManager({ repId, template, version }: ReportCacheManagerProps) {
    const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({})
    const [isPreloading, setIsPreloading] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    // 检查网络状态
    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine)

        window.addEventListener("online", updateOnlineStatus)
        window.addEventListener("offline", updateOnlineStatus)

        return () => {
            window.removeEventListener("online", updateOnlineStatus)
            window.removeEventListener("offline", updateOnlineStatus)
        }
    }, [])

    // 检查缓存状态
    const checkCacheStatus = async () => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            const messageChannel = new MessageChannel()

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    setCacheStatus(event.data.status || {})
                    resolve(event.data.status)
                }

                navigator.serviceWorker.controller.postMessage(
                    {
                        type: "GET_REPORT_CACHE_STATUS",
                        repId,
                        template,
                        version,
                    },
                    [messageChannel.port2],
                )
            })
        }
    }

    // 预加载报告
    const preloadReport = async () => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            setIsPreloading(true)
            const messageChannel = new MessageChannel()

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    setIsPreloading(false)
                    if (event.data.success) {
                        checkCacheStatus() // 重新检查状态
                    }
                    resolve(event.data)
                }

                navigator.serviceWorker.controller.postMessage(
                    {
                        type: "PRELOAD_REPORT",
                        repId,
                        template,
                        version,
                    },
                    [messageChannel.port2],
                )
            })
        }
    }

    useEffect(() => {
        checkCacheStatus()
    }, [repId, template, version])

    const cachedCount = Object.values(cacheStatus).filter(Boolean).length
    const totalCount = Object.keys(cacheStatus).length
    const cacheProgress = totalCount > 0 ? (cachedCount / totalCount) * 100 : 0
    const isFullyCached = cachedCount === totalCount && totalCount > 0

    return (
        <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
                    <span className="font-medium">
            报告离线缓存 ({template} v{version})
          </span>
                </div>

                {isFullyCached && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>缓存进度</span>
                    <span>
            {cachedCount}/{totalCount} 页面
          </span>
                </div>
                <Progress value={cacheProgress} className="h-2" />
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={preloadReport}
                    disabled={isPreloading || !isOnline}
                    size="sm"
                    variant={isFullyCached ? "outline" : "default"}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {isPreloading ? "缓存中..." : isFullyCached ? "重新缓存" : "离线缓存"}
                </Button>

                <Button onClick={checkCacheStatus} size="sm" variant="outline">
                    检查状态
                </Button>
            </div>

            {!isOnline && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">当前离线模式，已缓存的页面可正常访问</div>
            )}
        </div>
    )
}
