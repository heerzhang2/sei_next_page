"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Clock } from "lucide-react"

interface PageProtectionModalProps {
    isOpen: boolean
    onClose: () => void
    onForceNavigate?: () => void
    remainingTime: number
    targetUrl?: string
}

export function PageProtectionModal({
                                        isOpen,
                                        onClose,
                                        onForceNavigate,
                                        remainingTime,
                                        targetUrl,
                                    }: PageProtectionModalProps) {
    const [countdown, setCountdown] = useState(remainingTime)

    useEffect(() => {
        if (!isOpen) return

        setCountdown(remainingTime)

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onClose()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isOpen, remainingTime, onClose])

    const formatTime = (seconds: number) => {
        return `${Math.ceil(seconds / 1000)}秒`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        页面保护中
                    </DialogTitle>
                    <DialogDescription className="space-y-2">
                        <p>系统正在初始化离线缓存，为了避免数据丢失，请等待初始化完成。</p>
                        {targetUrl && (
                            <p className="text-sm text-muted-foreground">
                                目标页面: <code className="bg-muted px-1 rounded">{targetUrl}</code>
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-lg font-mono">
                        <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                        <span className="text-blue-600 font-semibold">{formatTime(countdown)}</span>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
                        继续等待
                    </Button>
                    {onForceNavigate && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onForceNavigate()
                                onClose()
                            }}
                            className="w-full sm:w-auto"
                        >
                            强制跳转 (可能丢失数据)
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
