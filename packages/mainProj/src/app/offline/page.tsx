'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react'

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(false)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine)
        }

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        updateOnlineStatus()

        return () => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
        }
    }, [])

    const handleRetry = () => {
        setRetryCount(prev => prev + 1)
        window.location.reload()
    }

    const handleGoHome = () => {
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        {isOnline ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                            <WifiOff className="w-8 h-8 text-gray-500" />
                        )}
                    </div>
                    <CardTitle className="text-xl">
                        {isOnline ? '连接已恢复' : '当前处于离线模式'}
                    </CardTitle>
                    <CardDescription>
                        {isOnline
                            ? '网络连接已恢复，您可以继续使用所有功能'
                            : '仍可继续编辑报告；网络恢复后，我们会自动同步到服务器。'
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {!isOnline && (
                        <Alert>
                            <WifiOff className="h-4 w-4" />
                            <AlertDescription>
                                您的编辑内容会自动保存到本地，网络恢复后将自动同步到服务器。
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={handleGoHome}
                            className="w-full"
                            variant={isOnline ? "default" : "outline"}
                        >
                            {isOnline ? '返回应用' : '继续离线编辑'}
                        </Button>

                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="w-full"
                            disabled={isOnline}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            重试连接 {retryCount > 0 && `(${retryCount})`}
                        </Button>
                    </div>

                    <div className="text-sm text-gray-500 text-center">
                        <p>离线功能包括：</p>
                        <ul className="mt-2 space-y-1">
                            <li>• 继续编辑报告内容</li>
                            <li>• 本地数据自动保存</li>
                            <li>• 网络恢复后自动同步</li>
                            <li>• 已缓存的页面与静态资源仍可访问</li>
                            <li>• 编辑表单会本地保存（URQL Graphcache 持久化）</li>
                            <li>• 返回上一页或导航到编辑页可继续工作</li>
                        </ul>
                    </div>

                    {isOnline && (
                        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
                            <h1 className="text-xl font-semibold">{'离线模式'}</h1>
                            <p className="text-muted-foreground">{'您的设备当前未连接网络。您仍可继续浏览缓存内容与编辑，网络恢复后将自动同步。'}</p>
                            <a href="/" className="text-primary underline">{'返回首页'}</a>
                        </main>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
