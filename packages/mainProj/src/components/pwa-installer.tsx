'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // 检查是否已经安装
        const checkIfInstalled = () => {
            if (window.matchMedia('(display-mode: standalone)').matches) {
                setIsInstalled(true)
                return
            }

            // 检查是否在 iOS Safari 中以全屏模式运行
            if ((window.navigator as any).standalone === true) {
                setIsInstalled(true)
                return
            }
        }

        checkIfInstalled()

        // 监听安装提示事件
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // 延迟显示安装提示，给用户一些时间体验应用
            setTimeout(() => {
                if (!isInstalled) {
                    setShowInstallPrompt(true)
                }
            }, 30000) // 30秒后显示
        }

        // 监听应用安装事件
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            console.log('PWA 已安装')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [isInstalled])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                console.log('用户接受了安装提示')
            } else {
                console.log('用户拒绝了安装提示')
            }

            setDeferredPrompt(null)
            setShowInstallPrompt(false)
        } catch (error) {
            console.error('安装过程中出错:', error)
        }
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        // 24小时后再次显示
        setTimeout(() => {
            if (!isInstalled && deferredPrompt) {
                setShowInstallPrompt(true)
            }
        }, 24 * 60 * 60 * 1000)
    }

    // 如果已安装或没有安装提示，不显示组件
    if (isInstalled || !showInstallPrompt || !deferredPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
            <Card className="shadow-lg border-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">安装应用</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        将报告系统安装到您的设备上，享受更好的离线体验
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                            <p>安装后您可以：</p>
                            <ul className="mt-1 space-y-1 text-xs">
                                <li>• 快速访问应用</li>
                                <li>• 完整的离线编辑功能</li>
                                <li>• 更好的性能体验</li>
                            </ul>
                        </div>

                        <div className="flex space-x-2">
                            <Button onClick={handleInstallClick} className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                安装
                            </Button>
                            <Button variant="outline" onClick={handleDismiss}>
                                稍后
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
