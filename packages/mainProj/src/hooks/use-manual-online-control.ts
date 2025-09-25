"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface BackendStatus {
    isReachable: boolean
    lastChecked?: Date
}

interface ManualOnlineControlState {
    isModalOpen: boolean
    backendStatus: BackendStatus
    pendingOnlineCallback: (() => void) | null
    queueCount: number
}

export function useManualOnlineControl() {
    const [state, setState] = useState<ManualOnlineControlState>({
        isModalOpen: false,
        backendStatus: { isReachable: false },
        pendingOnlineCallback: null,
        queueCount: 0,
    })

    const [isOnlineConfirmed, setIsOnlineConfirmed] = useState(false)
    const pendingCallbackRef = useRef<(() => void) | null>(null)

    const checkingRef = useRef(false)

    // 检查后端状态
    const checkBackendStatus = useCallback(async (): Promise<BackendStatus> => {
        if (checkingRef.current) {
            return state.backendStatus
        }

        checkingRef.current = true
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: "{ __typename }" }),
                cache: "no-cache",
                signal: AbortSignal.timeout(5000), // 5秒超时
            })

            const isReachable = response.ok
            const newStatus = {
                isReachable,
                lastChecked: new Date(),
            }

            setState((prev) => ({
                ...prev,
                backendStatus: newStatus,
            }))

            return newStatus
        } catch (error) {
            console.warn("[ManualOnlineControl] 后端检查失败:", error)
            const newStatus = {
                isReachable: false,
                lastChecked: new Date(),
            }

            setState((prev) => ({
                ...prev,
                backendStatus: newStatus,
            }))

            return newStatus
        } finally {
            checkingRef.current = false
        }
    }, [state.backendStatus])

    // 获取队列数量
    const getQueueCount = useCallback(async (): Promise<number> => {
        try {
            if (typeof window === "undefined") return 0

            // 从 localStorage 获取队列信息
            const metadataInfo = localStorage.getItem("urql-metadata")
            if (metadataInfo) {
                const parsed = JSON.parse(metadataInfo)
                return parsed.length || 0
            }

            // 尝试从 IndexedDB 获取更准确的数据
            const dbName = "graphcache-v3"
            return new Promise((resolve) => {
                const request = indexedDB.open(dbName)
                request.onsuccess = () => {
                    const db = request.result
                    try {
                        const transaction = db.transaction(["metadata"], "readonly")
                        const store = transaction.objectStore("metadata")
                        const getRequest = store.get("metadata")

                        getRequest.onsuccess = () => {
                            const result = getRequest.result
                            if (result && result.value) {
                                try {
                                    const metadata = JSON.parse(result.value)
                                    resolve(Array.isArray(metadata) ? metadata.length : 0)
                                } catch {
                                    resolve(0)
                                }
                            } else {
                                resolve(0)
                            }
                        }

                        getRequest.onerror = () => resolve(0)
                    } catch {
                        resolve(0)
                    }
                }
                request.onerror = () => resolve(0)
            })
        } catch (error) {
            console.warn("[ManualOnlineControl] 获取队列数量失败:", error)
            return 0
        }
    }, [])

    // 请求在线确认
    const requestOnlineConfirmation = useCallback(
        async (onlineCallback: () => void) => {
            console.log("[ManualOnlineControl] 请求在线确认")

            pendingCallbackRef.current = onlineCallback

            // 检查后端状态和队列数量
            const [backendStatus, queueCount] = await Promise.all([checkBackendStatus(), getQueueCount()])

            setState((prev) => ({
                ...prev,
                isModalOpen: true,
                pendingOnlineCallback: onlineCallback,
                backendStatus,
                queueCount,
            }))
        },
        [checkBackendStatus, getQueueCount],
    )

    // 确认在线
    const confirmOnline = useCallback(() => {
        console.log("[ManualOnlineControl] 用户确认在线")

        setIsOnlineConfirmed(true)

        if (pendingCallbackRef.current) {
            pendingCallbackRef.current()
            pendingCallbackRef.current = null
        }

        setState((prev) => ({
            ...prev,
            isModalOpen: false,
            pendingOnlineCallback: null,
        }))
    }, [])

    // 取消在线确认
    const cancelOnline = useCallback(() => {
        console.log("[ManualOnlineControl] 用户取消在线确认，保持离线模式")

        pendingCallbackRef.current = null

        setState((prev) => ({
            ...prev,
            isModalOpen: false,
            pendingOnlineCallback: null,
        }))
    }, [])

    // 监听网络状态变化
    useEffect(() => {
        const handleOnline = () => {
            console.log("[ManualOnlineControl] 检测到网络连接")
            checkBackendStatus()
        }

        const handleOffline = () => {
            console.log("[ManualOnlineControl] 检测到网络断开")
            setState((prev) => ({
                ...prev,
                backendStatus: { isReachable: false, lastChecked: new Date() },
            }))
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [checkBackendStatus])

    return {
        isModalOpen: state.isModalOpen,
        backendStatus: state.backendStatus,
        queueCount: state.queueCount,
        isOnlineConfirmed,
        requestOnlineConfirmation,
        confirmOnline,
        cancelOnline,
        checkBackendStatus,
    }
}
