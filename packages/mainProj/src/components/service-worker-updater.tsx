'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, X } from 'lucide-react'
import { useServiceWorker } from '@/hooks/use-service-worker'

export function ServiceWorkerUpdater() {
    const { hasUpdate, updateServiceWorker } = useServiceWorker()
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

    useEffect(() => {
        if (hasUpdate) {
            setShowUpdatePrompt(true)
        }
    }, [hasUpdate])

    const handleUpdate = () => {
        updateServiceWorker()
        setShowUpdatePrompt(false)
    }

    const handleDismiss = () => {
        setShowUpdatePrompt(false)
    }

    if (!showUpdatePrompt) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
            <Card className="shadow-lg border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-900">应用更新</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription className="text-blue-700">
                        发现新版本，建议立即更新以获得最佳体验
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="flex space-x-2">
                        <Button onClick={handleUpdate} className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            立即更新
                        </Button>
                        <Button variant="outline" onClick={handleDismiss}>
                            稍后
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
