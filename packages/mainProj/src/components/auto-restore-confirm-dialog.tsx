// components/auto-restore-confirm-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, X } from "lucide-react"

interface AutoRestoreConfirmDialogProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    restoredCount: number
    repId: string
}
/**防止刷新执行没完没了的，实际上已经写入metadata，但是没刷新页面显示不一致，继续编辑保存会不一致的
* */
export function AutoRestoreConfirmDialog({
                                             isOpen,
                                             onConfirm,
                                             onCancel,
                                             restoredCount,
                                             repId
                                         }: AutoRestoreConfirmDialogProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            // 添加淡出动画
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in-zoom-in-95">
                <CardHeader className="flex flex-row items-start space-y-0 pb-4">
                    <div className="flex items-center space-x-2 flex-1">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-lg">发现未保存的变更</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCancel}
                        className="h-6 w-6"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    <CardDescription>
                        检测到 <span className="font-semibold text-foreground">{restoredCount}</span> 个未保存的变更已从备份中恢复。
                    </CardDescription>

                    <div className="bg-muted p-3 rounded-lg text-sm">
                        <p className="font-medium">报告 ID: {repId}</p>
                        <p className="text-muted-foreground mt-1">
                            这些变更需要刷新页面才能正确显示。建议立即刷新以确保数据一致性。
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>如果不刷新，页面可能显示过时的数据，继续编辑保存会丢失旧数据的！</span>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between space-x-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1"
                    >
                        稍后处理
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex-1 space-x-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>立即刷新</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}