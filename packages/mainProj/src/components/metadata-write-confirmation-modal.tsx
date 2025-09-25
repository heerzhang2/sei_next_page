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
import { Database, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface MetadataWriteConfirmationModalProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    queueCount: number
}

export function MetadataWriteConfirmationModal({
                                                   isOpen,
                                                   onConfirm,
                                                   onCancel,
                                                   queueCount,
                                               }: MetadataWriteConfirmationModalProps) {
    const [countdown, setCountdown] = useState(15)

    useEffect(() => {
        if (!isOpen) {
            setCountdown(15)
            return
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        缓存写入确认
                    </DialogTitle>
                    <DialogDescription className="space-y-3">
                        <span>系统需要写入离线缓存数据，请确认是否允许继续。</span>
                    </DialogDescription>
                </DialogHeader>

                {queueCount > 0 && (
                    <div className="flex items-center justify-between">
                        <span>当前队列:</span>
                        <Badge variant="secondary">{queueCount} 个待处理操作</Badge>
                    </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800">
              <strong>提示:</strong> 确认后，在当前页面会话期间将不再需要重复确认。 只有重新加载页面后才会再次要求确认。
            </span>
                    </div>
                </div>

                <div className="space-y-3">
                    {countdown > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>对话框将在 {countdown} 秒后自动关闭</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                        暂不允许
                    </Button>
                    <Button onClick={onConfirm} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        确认允许写入
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
