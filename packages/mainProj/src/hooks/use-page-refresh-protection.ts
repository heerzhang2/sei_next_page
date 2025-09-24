"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * 页面刷新保护Hook
 * 防止用户快速连续操作导致的页面刷新竞态条件
 * 使用异步延迟机制，让URQL继续运转
 */
export function usePageRefreshProtection() {
    const router = useRouter()
    const lastNavigationRef = useRef(0)
    const isProtectedRef = useRef(false)
    const protectionTimeoutRef = useRef<NodeJS.Timeout>()
    const protectionStartTimeRef = useRef(0)
    const [showModal, setShowModal] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<{
        url: string
        remainingTime: number
        timer?: NodeJS.Timeout
    } | null>(null)

    const delayedNavigate = useCallback(
        (url: string, delay: number) => {
            console.log(`[PageProtection] 延迟导航 ${delay}ms 到: ${url}，让URQL继续工作`)

            const timer = setTimeout(() => {
                console.log(`[PageProtection] 延迟结束，执行导航到: ${url}`)
                isProtectedRef.current = false // 解除保护
                router.push(url)
                setPendingNavigation(null)
            }, delay)

            setPendingNavigation({ url, remainingTime: delay, timer })
            return timer
        },
        [router],
    )

    const interceptNavigation = useCallback(
        (url: string) => {
            if (!isProtectedRef.current) return false

            const now = Date.now()
            const elapsed = now - protectionStartTimeRef.current
            const remainingTime = Math.max(0, 3000 - elapsed)

            if (remainingTime > 0) {
                console.log(`[PageProtection] 拦截导航，剩余保护时间: ${remainingTime}ms`)

                delayedNavigate(url, remainingTime)
                setShowModal(true)
                return true // 表示导航被拦截
            }

            return false
        },
        [delayedNavigate],
    )

    const interceptUnload = useCallback(
        (url: string) => {
            if (!isProtectedRef.current) return false

            const now = Date.now()
            const elapsed = now - protectionStartTimeRef.current
            const remainingTime = Math.max(0, 3000 - elapsed)

            console.log(`[PageProtection] 拦截页面卸载，剩余保护时间: ${remainingTime}ms`)
            delayedNavigate(url, remainingTime)
            setShowModal(true)
            return true
        },
        [delayedNavigate],
    )

    // 保护导航，防止快速连续操作
    const protectedNavigate = useCallback(
        (href: string, delay = 1500) => {
            if (interceptNavigation(href)) {
                return false // 导航被拦截，显示模态框
            }

            const now = Date.now()
            const timeSinceLastNav = now - lastNavigationRef.current

            // 如果距离上次导航时间太短，延迟执行
            if (timeSinceLastNav < delay) {
                const remainingDelay = delay - timeSinceLastNav
                console.log(`[PageProtection] 延迟导航 ${remainingDelay}ms 到: ${href}`)

                if (protectionTimeoutRef.current) {
                    clearTimeout(protectionTimeoutRef.current)
                }

                protectionTimeoutRef.current = setTimeout(() => {
                    lastNavigationRef.current = Date.now()
                    router.push(href)
                }, remainingDelay)

                return false // 表示导航被延迟
            }

            lastNavigationRef.current = now
            router.push(href)
            return true // 表示立即导航
        },
        [router, interceptNavigation],
    )

    const forceNavigate = useCallback(() => {
        if (pendingNavigation) {
            console.log(`[PageProtection] 强制导航到: ${pendingNavigation.url}`)

            // 清除延迟定时器
            if (pendingNavigation.timer) {
                clearTimeout(pendingNavigation.timer)
            }

            isProtectedRef.current = false // 解除保护
            router.push(pendingNavigation.url)
            setPendingNavigation(null)
            setShowModal(false)
        }
    }, [router, pendingNavigation])

    const closeModal = useCallback(() => {
        if (pendingNavigation?.timer) {
            // 不清除定时器，让延迟导航继续执行
            console.log(`[PageProtection] 关闭模态框，但保持延迟导航: ${pendingNavigation.url}`)
        }
        setShowModal(false)
    }, [pendingNavigation])

    // 启用页面保护
    const enableProtection = useCallback((duration = 3000) => {
        isProtectedRef.current = true
        protectionStartTimeRef.current = Date.now()
        console.log(`[PageProtection] 启用页面保护 ${duration}ms，让URQL有时间初始化`)

        if (protectionTimeoutRef.current) {
            clearTimeout(protectionTimeoutRef.current)
        }

        protectionTimeoutRef.current = setTimeout(() => {
            isProtectedRef.current = false
            console.log("[PageProtection] 页面保护已解除，URQL应该已完成初始化")
        }, duration)
    }, [])

    // 监听页面加载，自动启用保护
    useEffect(() => {
        // 页面加载时启用3秒保护
        enableProtection(3000)

        const handleClick = (e: MouseEvent) => {
            if (!isProtectedRef.current) return

            const target = e.target as HTMLElement
            const link = target.closest("a")

            if (link && link.href) {
                const url = new URL(link.href)
                // 只拦截同域名的链接
                if (url.origin === window.location.origin) {
                    e.preventDefault()
                    e.stopPropagation()
                    interceptNavigation(url.pathname)
                }
            }
        }

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isProtectedRef.current) {
                e.preventDefault()
                e.returnValue = "页面正在初始化中，离开可能导致数据丢失！"

                // 异步处理，不阻塞主线程
                setTimeout(() => {
                    interceptUnload(window.location.pathname)
                }, 0)

                return "页面正在初始化中，离开可能导致数据丢失！"
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isProtectedRef.current) return

            // 阻止F5刷新
            if (e.key === "F5") {
                e.preventDefault()
                interceptNavigation(window.location.pathname)
                return
            }

            // 阻止Ctrl+R刷新
            if ((e.ctrlKey || e.metaKey) && e.key === "r") {
                e.preventDefault()
                interceptNavigation(window.location.pathname)
                return
            }

            // 阻止Ctrl+F5强制刷新
            if (e.ctrlKey && e.key === "F5") {
                e.preventDefault()
                interceptNavigation(window.location.pathname)
                return
            }
        }

        // 监听popstate事件，处理浏览器前进后退
        const handlePopState = () => {
            if (isProtectedRef.current) {
                console.log("[PageProtection] 浏览器导航被保护期间阻止")
                enableProtection(2000) // 重新启用保护
            }
        }

        document.addEventListener("click", handleClick, true) // 使用捕获阶段
        document.addEventListener("keydown", handleKeyDown, true) // 添加键盘事件监听
        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("popstate", handlePopState)

        return () => {
            document.removeEventListener("click", handleClick, true)
            document.removeEventListener("keydown", handleKeyDown, true)
            window.removeEventListener("beforeunload", handleBeforeUnload)
            window.removeEventListener("popstate", handlePopState)
            if (protectionTimeoutRef.current) {
                clearTimeout(protectionTimeoutRef.current)
            }
            // 清理延迟导航定时器
            if (pendingNavigation?.timer) {
                clearTimeout(pendingNavigation.timer)
            }
        }
    }, [enableProtection, interceptNavigation, pendingNavigation])

    return {
        protectedNavigate,
        enableProtection,
        isProtected: isProtectedRef.current,
        showModal,
        pendingNavigation,
        forceNavigate,
        closeModal,
    }
}
