"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "sonner"

// 用户信息接口
interface UserInfo {
    role?: string
    unitId?: string
    userId?: string
}

// SSE消息接口
interface SSEMessage {
    type: string
    data: any
    filters?: {
        userRoles?: string[]
        unitIds?: string[]
        excludeUserIds?: string[]
        includeUserIds?: string[]
    }
    timestamp: number
    fromServer: string
}

export function VersionChecker() {
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')

    // 使用 ref 存储用户信息，避免状态更新循环
    const userInfoRef = useRef<UserInfo>({})
    const [displayUserInfo, setDisplayUserInfo] = useState<UserInfo>({})

    // 使用 ref 来存储稳定的 disconnect 函数
    const disconnectRef = useRef(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }
        setConnectionStatus('disconnected')
        console.log('[SSE] 连接已手动断开')
    })

    // 获取用户信息（根据你的实际应用调整）
    const getUserInfo = useCallback((): UserInfo => {
        try {
            const userData = localStorage.getItem('user-info')
            if (userData) {
                return JSON.parse(userData)
            }
        } catch (error) {
            console.warn('无法获取用户信息:', error)
        }

        return {
            role: 'user',
            unitId: 'default',
            userId: 'anonymous'
        }
    }, [])

    // 检查消息是否应该被当前用户接收
    const shouldReceiveMessage = useCallback((message: SSEMessage): boolean => {
        if (!message.filters) return true

        const { userRoles, unitIds, excludeUserIds, includeUserIds } = message.filters
        const currentUserInfo = userInfoRef.current

        // 按用户角色过滤
        if (userRoles && userRoles.length > 0) {
            if (!currentUserInfo.role || !userRoles.includes(currentUserInfo.role)) {
                return false
            }
        }

        // 按单位ID过滤
        if (unitIds && unitIds.length > 0) {
            if (!currentUserInfo.unitId || !unitIds.includes(currentUserInfo.unitId)) {
                return false
            }
        }

        // 排除特定用户
        if (excludeUserIds && excludeUserIds.length > 0) {
            if (currentUserInfo.userId && excludeUserIds.includes(currentUserInfo.userId)) {
                return false
            }
        }

        // 只包含特定用户
        if (includeUserIds && includeUserIds.length > 0) {
            if (!currentUserInfo.userId || !includeUserIds.includes(currentUserInfo.userId)) {
                return false
            }
        }

        return true
    }, [])

    const handleSSEMessage = useCallback((message: SSEMessage) => {
        console.log(`[SSE] 收到 ${message.type} 类型消息:`, message.data)

        // 检查消息过滤条件
        if (!shouldReceiveMessage(message)) {
            console.log(`[SSE] 消息 ${message.type} 被过滤，不显示给当前用户`)
            return
        }

        switch (message.type) {
            case 'connected':
                handleConnectedMessage(message.data)
                break
            case 'version':
                handleVersionMessage(message.data)
                break
            case 'system-notification':
                handleSystemNotification(message.data)
                break
            case 'report-completed':
                handleReportCompleted(message.data)
                break
            case 'admin-alert':
                handleAdminAlert(message.data)
                break
            case 'unit-announcement':
                handleUnitAnnouncement(message.data)
                break
            case 'heartbeat':
                break
            default:
                console.log(`[SSE] 未知消息类型: ${message.type}`, message.data)
                handleUnknownMessage(message)
        }
    }, [shouldReceiveMessage])

    const handleConnectedMessage = (data: any) => {
        console.log('[SSE] 连接已建立:', data)
        setConnectionStatus('connected')

        if (process.env.NODE_ENV === 'development') {
            toast.success('实时连接已建立', {
                description: '可以接收服务器推送消息',
                duration: 3000
            })
        }
    }

    const handleVersionMessage = (data: any) => {
        if (data.version) {
            const lastCacheWarmup = localStorage.getItem("last-cache-warmup")

            if (!lastCacheWarmup || data.version !== lastCacheWarmup) {
                console.log('[SSE] 检测到新版本:', data.version)

                const offlineReports = localStorage.getItem("offline-reports")
                if (offlineReports && window.location.pathname !== "/pwa") {
                    toast.info("前端版本已更新", {
                        description: "建议访问 PWA 页面重新缓存以确保离线功能正常",
                        duration: 10000,
                        action: {
                            label: "前往缓存",
                            onClick: () => window.location.href = "/pwa",
                        },
                    })
                }

                localStorage.setItem("last-cache-warmup", data.version)
            }
        }
    }

    const handleSystemNotification = (data: any) => {
        const toastConfig: any = {
            description: data.message,
            duration: data.duration || 8000,
        }

        switch (data.level) {
            case 'error':
                toast.error(data.title, toastConfig)
                break
            case 'warning':
                toast.warning(data.title, toastConfig)
                break
            case 'success':
                toast.success(data.title, toastConfig)
                break
            default:
                toast.info(data.title, toastConfig)
        }

        if (data.action) {
            toastConfig.action = {
                label: data.action.label,
                onClick: () => {
                    if (data.action.url) {
                        window.location.href = data.action.url
                    } else if (data.action.callback) {
                        try {
                            eval(data.action.callback)
                        } catch (error) {
                            console.error('执行回调失败:', error)
                        }
                    }
                }
            }
        }
    }

    const handleReportCompleted = (data: any) => {
        toast.success('报表生成完成', {
            description: `报表 "${data.reportName}" 已生成完成`,
            duration: 6000,
            action: data.downloadUrl ? {
                label: '下载',
                onClick: () => {
                    window.open(data.downloadUrl, '_blank')
                },
            } : undefined,
        })
    }

    const handleAdminAlert = (data: any) => {
        toast.warning('管理员告警', {
            description: data.message,
            duration: 10000,
            action: data.actionUrl ? {
                label: '查看',
                onClick: () => {
                    window.location.href = data.actionUrl
                },
            } : undefined,
        })
    }

    const handleUnitAnnouncement = (data: any) => {
        toast.info(data.title || '单位公告', {
            description: data.content,
            duration: 8000,
            action: data.link ? {
                label: '详情',
                onClick: () => {
                    window.location.href = data.link
                },
            } : undefined,
        })
    }

    const handleUnknownMessage = (message: SSEMessage) => {
        toast.info('系统消息', {
            description: `收到新消息: ${message.type}`,
            duration: 5000,
        })
    }

    const buildSSEUrl = useCallback(() => {
        const params = new URLSearchParams()
        const currentUserInfo = userInfoRef.current

        if (currentUserInfo.role) {
            params.append('role', currentUserInfo.role)
        }
        if (currentUserInfo.unitId) {
            params.append('unitId', currentUserInfo.unitId)
        }
        if (currentUserInfo.userId) {
            params.append('userId', currentUserInfo.userId)
        }

        params.append('client', 'web')
        params.append('version', '1.0')

        const queryString = params.toString()
        return `/api/sse${queryString ? `?${queryString}` : ''}`
    }, [])

    const connectSSE = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        // 获取最新的用户信息并更新 ref
        const currentUserInfo = getUserInfo()
        userInfoRef.current = currentUserInfo
        setDisplayUserInfo(currentUserInfo)

        try {
            const sseUrl = buildSSEUrl()
            console.log(`[SSE] 连接服务器: ${sseUrl}`)

            const eventSource = new EventSource(sseUrl)
            eventSourceRef.current = eventSource
            setConnectionStatus('connecting')

            eventSource.onopen = () => {
                console.log('[SSE] 连接已建立')
                setConnectionStatus('connected')
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current)
                }
            }

            eventSource.onmessage = (event) => {
                try {
                    const message: SSEMessage = JSON.parse(event.data)
                    handleSSEMessage(message)
                } catch (error) {
                    console.error('[SSE] 解析消息失败:', error, event.data)
                }
            }

            eventSource.onerror = (error) => {
                console.error('[SSE] 连接错误:', error)
                setConnectionStatus('error')
                eventSource.close()

                const delay = Math.min(30000, 1000 * Math.pow(2, 3))
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('[SSE] 尝试重新连接...')
                    connectSSE()
                }, delay)
            }

        } catch (error) {
            console.error('[SSE] 创建连接失败:', error)
            setConnectionStatus('error')
            reconnectTimeoutRef.current = setTimeout(() => {
                connectSSE()
            }, 10000)
        }
    }, [getUserInfo, buildSSEUrl, handleSSEMessage])

    // 监听用户信息变化，重新连接
    useEffect(() => {
        const checkUserInfoChange = () => {
            const newUserInfo = getUserInfo()
            if (JSON.stringify(newUserInfo) !== JSON.stringify(userInfoRef.current)) {
                console.log('[SSE] 用户信息变化，重新连接')
                connectSSE()
            }
        }

        const interval = setInterval(checkUserInfoChange, 10000)
        return () => clearInterval(interval)
    }, [getUserInfo, connectSSE])

    useEffect(() => {
        // 初始连接
        connectSSE()

        // 监听页面可见性变化
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && connectionStatus !== 'connected') {
                console.log('[SSE] 页面可见，重新连接')
                connectSSE()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            disconnectRef.current()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, []) // 空依赖数组，只在组件挂载和卸载时执行

    // 开发模式下显示连接状态
    if (process.env.NODE_ENV === 'development') {
        return (
            <div style={{
                position: 'fixed',
                bottom: 10,
                right: 10,
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor:
                    connectionStatus === 'connected' ? '#10b981' :
                        connectionStatus === 'connecting' ? '#f59e0b' :
                            connectionStatus === 'error' ? '#ef4444' : '#6b7280',
                color: 'white',
                borderRadius: '4px',
                zIndex: 9999,
                opacity: 0.8
            }}>
                SSE: {connectionStatus}
                {displayUserInfo.role && ` | ${displayUserInfo.role}`}
                {displayUserInfo.unitId && ` | ${displayUserInfo.unitId}`}
            </div>
        )
    }

    return null
}