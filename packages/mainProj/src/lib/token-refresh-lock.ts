/**
 * Token刷新锁机制
 * 防止多个地方同时触发token刷新导致重复请求
 */

// 全局刷新状态
let isRefreshing = false
let refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null
let lastRefreshTime = 0
const MIN_REFRESH_INTERVAL = 10000 // 10 seconds minimum between refreshes

/**
 * 获取token刷新锁
 * 如果已经有刷新在进行中，返回现有的Promise
 * 否则执行刷新函数并返回新的Promise
 */
export async function acquireRefreshLock(
    refreshFn: () => Promise<{ accessToken: string; refreshToken: string } | null>,
): Promise<{ accessToken: string; refreshToken: string } | null> {
    // 如果已经在刷新中，等待现有的刷新完成
    if (isRefreshing && refreshPromise) {
        console.log("[TokenRefreshLock] 检测到正在进行的刷新，等待完成...")
        return refreshPromise
    }

    // 检查是否可以刷新token
    if (!canRefreshToken()) {
        console.log("[TokenRefreshLock] 刷新间隔不足，等待...")
        return null
    }

    // 开始新的刷新
    console.log("[TokenRefreshLock] 获取刷新锁，开始刷新token")
    isRefreshing = true
    markRefreshStarted()

    refreshPromise = (async () => {
        try {
            const result = await refreshFn()
            console.log("[TokenRefreshLock] Token刷新成功")
            return result
        } catch (error) {
            console.error("[TokenRefreshLock] Token刷新失败:", error)
            throw error
        } finally {
            // 延迟释放锁，确保所有监听器都能收到事件，最少间隔10秒才能再次刷新token
            setTimeout(() => {
                isRefreshing = false
                refreshPromise = null
                console.log("[TokenRefreshLock] 刷新锁已释放")
            }, MIN_REFRESH_INTERVAL)
        }
    })()

    return refreshPromise
}

/**
 * 检查是否正在刷新
 */
export function isTokenRefreshing(): boolean {
    return isRefreshing
}

/**
 * 强制释放锁（仅用于错误恢复）
 */
export function forceReleaseLock(): void {
    isRefreshing = false
    refreshPromise = null
    console.log("[TokenRefreshLock] 强制释放刷新锁")
}

/**
 * Check if enough time has passed since last refresh
 * This is server-side compatible (no browser APIs)
 */
export function canRefreshToken(): boolean {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTime
    return timeSinceLastRefresh >= MIN_REFRESH_INTERVAL
}

/**
 * Mark that a refresh has started
 */
export function markRefreshStarted(): void {
    lastRefreshTime = Date.now()
    console.log("[TokenRefreshLock] 标记刷新开始时间:", new Date(lastRefreshTime).toISOString())
}
