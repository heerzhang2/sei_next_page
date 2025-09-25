"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Clock, CheckCircle } from "lucide-react"

interface OnlineConfirmationModalProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    backendStatus: {
        isReachable: boolean
        lastChecked?: Date
    }
    queueCount: number
}

export function OnlineConfirmationModal({
                                            isOpen,
                                            onConfirm,
                                            onCancel,
                                            backendStatus,
                                            queueCount,
                                        }: OnlineConfirmationModalProps) {
    const [countdown, setCountdown] = useState(10)
    const [autoConfirmEnabled, setAutoConfirmEnabled] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setCountdown(10)
            setAutoConfirmEnabled(false)
            return
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (autoConfirmEnabled && backendStatus.isReachable) {
                        onConfirm()
                        return 0
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, autoConfirmEnabled, backendStatus.isReachable, onConfirm])

    const handleAutoConfirmToggle = () => {
        setAutoConfirmEnabled(!autoConfirmEnabled)
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {backendStatus.isReachable ? (
                            <Wifi className="h-5 w-5 text-green-500" />
                        ) : (
                            <WifiOff className="h-5 w-5 text-red-500" />
                        )}
                        网络连接确认
                    </DialogTitle>
                    <DialogDescription className="space-y-3">
                        <span className="flex items-center justify-between">
                            <span>Java后端状态:</span>
                            <Badge variant={backendStatus.isReachable ? "default" : "destructive"}>
                                {backendStatus.isReachable ? "可访问" : "不可访问"}
                            </Badge>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                {queueCount > 0 && (
                    <div className="flex items-center justify-between">
                        <span>离线队列:</span>
                        <Badge variant="secondary">{queueCount} 个待处理操作</Badge>
                    </div>
                )}

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <span className="text-sm text-yellow-800">
                                <strong>重要提醒:</strong> 只有在确认Java后端真正可访问时才点击"确认在线"。
                                这将触发离线队列的处理，如果后端实际不可用，可能导致队列数据丢失。
                            </span>
                </div>
                {backendStatus.lastChecked && (
                    <div className="text-xs text-muted-foreground">
                        最后检查: {backendStatus.lastChecked.toLocaleTimeString()}
                    </div>
                )}

                <div className="space-y-3">
                    {countdown > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>自动关闭倒计时: {countdown}秒</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="auto-confirm"
                            checked={autoConfirmEnabled}
                            onChange={handleAutoConfirmToggle}
                            disabled={!backendStatus.isReachable}
                            className="rounded"
                        />
                        <label htmlFor="auto-confirm" className="text-sm">
                            后端可访问时自动确认在线 ({countdown}秒后)
                        </label>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                        保持离线模式
                    </Button>
                    <Button onClick={onConfirm} disabled={!backendStatus.isReachable} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        确认在线
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
