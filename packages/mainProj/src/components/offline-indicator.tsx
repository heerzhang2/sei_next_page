'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface OfflineIndicatorProps {
    className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
    const [isOnline, setIsOnline] = useState(true)
    const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking')
    const [lastSync, setLastSync] = useState<Date | null>(null)
    const [pendingChanges, setPendingChanges] = useState(0)

    useEffect(() => {
        // 监听网络状态变化
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine)
            if (navigator.onLine) {
                checkServerStatus()
            } else {
                setServerStatus('offline')
            }
        }

        // 检查服务器状态
        const checkServerStatus = async () => {
            try {
                setServerStatus('checking')
                const response = await fetch('/api/health', {
                    method: 'GET',
                    cache: 'no-cache'
                })

                if (response.ok) {
                    setServerStatus('online')
                    setLastSync(new Date())
                } else {
                    setServerStatus('offline')
                }
            } catch (error) {
                setServerStatus('offline')
            }
        }

        // 初始化
        updateOnlineStatus()

        // 监听事件
        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)

        // 定期检查服务器状态
        const interval = setInterval(() => {
            if (navigator.onLine) {
                checkServerStatus()
            }
        }, 30000) // 每30秒检查一次

        // 监听本地存储变化（模拟待同步更改）
        const handleStorageChange = () => {
            // 这里可以检查本地存储中的待同步数据
            const stored = localStorage.getItem('pendingChanges')
            setPendingChanges(stored ? JSON.parse(stored).length : 0)
        }

        window.addEventListener('storage', handleStorageChange)
        handleStorageChange() // 初始检查

        return () => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [])

    const getStatusInfo = () => {
        if (!isOnline) {
            return {
                icon: WifiOff,
                text: '离线模式',
                variant: 'secondary' as const,
                description: '您的更改将保存到本地，网络恢复后自动同步'
            }
        }

        if (serverStatus === 'checking') {
            return {
                icon: Clock,
                text: '检查中...',
                variant: 'outline' as const,
                description: '正在检查服务器连接状态'
            }
        }

        if (serverStatus === 'offline') {
            return {
                icon: AlertTriangle,
                text: '服务器离线',
                variant: 'destructive' as const,
                description: '无法连接到服务器，您可以继续离线编辑'
            }
        }

        return {
            icon: serverStatus === 'online' ? CheckCircle : Wifi,
            text: '在线',
            variant: 'default' as const,
            description: lastSync ? `最后同步: ${lastSync.toLocaleTimeString()}` : '已连接到服务器'
        }
    }

    const statusInfo = getStatusInfo()
    const StatusIcon = statusInfo.icon

    return (
        <div className={className}>
            <div className="flex items-center space-x-2">
                <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusInfo.text}</span>
                </Badge>

                {pendingChanges > 0 && (
                    <Badge variant="outline" className="text-xs">
                        {pendingChanges} 待同步
                    </Badge>
                )}
            </div>

            {(!isOnline || serverStatus === 'offline') && (
                <Alert className="mt-2">
                    <StatusIcon className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {statusInfo.description}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
