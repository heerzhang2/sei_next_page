"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useNetworkStatusContext } from "@/contexts/network-status-context"

// 添加离线队列状态接口
export interface OfflineQueueStatus {
    hasPendingMutations: boolean
    queueLength: number
    lastUpdated: Date | null
}

export interface NetworkStatus {
    //客户端网络或浏览器的网络在线判别； 所以isClientOnline是下面两个状态判定的基本前提！
    isClientOnline: boolean
    //前端nextjs服务器是否可以连通的判定
    isOnline: boolean
    isGraphQLBackendReachable: boolean
    lastError: Error | null
    lastOnlineTime: Date | null
    lastOfflineTime: Date | null
    connectionType: string | null
    //仅限于在内部使用的状态，nextjs服务链接可用
    isNextJSServerReachable: boolean
    // 新增离线队列状态
    offlineQueue: OfflineQueueStatus
}


export function useNetworkStatus(): NetworkStatus {
    return useNetworkStatusContext()
}
