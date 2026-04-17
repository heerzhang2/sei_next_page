"use client"

import { useEffect, useRef } from "react"
import { indexedDBStorage } from "@/lib/indexed-db-storage"

/**
 * 全局待发送报告守卫组件
 * 当用户尝试关闭浏览器或离开页面时，如果有待发送的报告，会显示确认提示
 * 注意：内部 Link 导航不会触发此提示
 * 
 * 注意：现代浏览器（Chrome 51+、Firefox、Safari、Edge）出于安全考虑，
 * 不再显示自定义的提示消息，而是显示浏览器固定的默认消息如：
 * "系统可能不会保存您所做的更改"
 */
export function PendingReportsGuard() {
    const pendingCountRef = useRef<number>(0)

    useEffect(() => {
        // 定期检查待发送报告数量
        const checkPendingReports = async () => {
            try {
                const reports = await indexedDBStorage.getAllModified()
                pendingCountRef.current = reports.length
            } catch (error) {
                console.error("[PendingReportsGuard] 检查待发送报告失败:", error)
            }
        }

        // 初始检查
        checkPendingReports()

        // 每 5 秒检查一次（使用 ref 避免频繁更新 state）
        const intervalId = setInterval(checkPendingReports, 5000)

        // 监听 beforeunload 事件
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (pendingCountRef.current > 0) {
                // 阻止默认行为并显示确认对话框
                e.preventDefault()
                // 现代浏览器需要设置 returnValue 才能显示提示
                // 注意：现代浏览器会显示默认消息，而不是自定义消息
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            clearInterval(intervalId)
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [])

    // 这个组件不渲染任何可见内容
    return null
}
