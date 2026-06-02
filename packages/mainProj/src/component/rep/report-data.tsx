"use client"

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useQuery, gql } from "@urql/next"
import { useStorage } from "@/report/StorageContext"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import { indexedDBStorage } from "@/lib/indexed-db-storage"
import { fileOperationsQueue } from "@/lib/file-operations-queue"

export interface ReportParams {
    repId: string
    action?: string
}

export const ReportQuery = gql`
  query pagegetReportQuery($id: ID!) {
    getReport(id: $id) {
      id
      version
      data
      snapshot
      modeltype
      modelversion
      isp {
        id
        no
      }
      ...pageReportIsp
    }
  }
  fragment pageReportIsp on Report {
    id
    modeltype
    modelversion
    tzFields
    link {
      rep
      ori
    }
    # 直接获取当前报告的 stm 字段
    stm {
      id
      sta
      authr {
        id
        username
        person {
          id
          name
        }
      }
      reviewer {
        id
        username
        person {
          id
          name
        }
      }
      master {
        id
        username
        person {
          id
          name
        }
      }
      approver {
        id
        username
        person {
          id
          name
        }
      }
    }
    isp {
      id
      no
      report {
        id
      }
      dev {
        id
        cod
      }
      bsType
      reps {
        edges {
          node {
            id
            modeltype
            data
            version
            # 子报告的 stm（如需要）
            stm {
              id
              sta
            }
          }
        }
      }
      ispMen {
        id
        username
        person {
          id
          name
        }
      }
      checkMen {
        id
        username
        person {
          id
          name
        }
      }
      servu {id name }
      ispu {
        id
        agency {
          id
          apno
          bjtel
          bjurl
        }
        name
      }
      bus {
        id
        pipus {
          id
          crDate
          code
          rno
          name
          start
          stop
          nxtd1
          nxtd2
          leng
          level
          lay
          safe
          pa
        }
      }
    }
  }
`

export const ReportSubQuery = gql`
  query pagegetReportQuery($id: ID!) {
    getReport(id: $id) {
      id
      version
      data
      modeltype
    }
  }
`

// PWA 预缓存专用查询 - 包含完整的子报告数据（包括 snapshot）
export const ReportQueryWithSubReports = gql`
  query pagegetReportWithSubReportsQuery($id: ID!) {
    getReport(id: $id) {
      id
      version
      data
      snapshot
      modeltype
      modelversion
      isp {
        id
        no
        report {
          id
        }
        dev {
          id
          cod
        }
        bsType
        reps {
          edges {
            node {
              id
              modeltype
              data
              version
              stm {
                id
                sta
                authr {
                  id
                  username
                  person {
                    id
                    name
                  }
                }
                reviewer {
                  id
                  username
                  person {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

function getDataSource(result: any) {
    const cacheOutcome = result?.operation?.context?.meta?.cacheOutcome
    if (cacheOutcome === "hit") return "cache"
    if (cacheOutcome === "miss") return "network"
    if (cacheOutcome === "partial") return "partial"
    if (result?.stale) return "stale-cache"
    if (result?.fetching && !result?.data) return "network-loading"
    if (result?.data && !result?.fetching) return "cache-or-network"
    return "unknown"
}

const REPORT_DATA_SESSION_KEY_PREFIX = 'reportDataSession_'
const REPORT_DATA_SESSION_KEEP_COUNT = 5
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

function markReportSessionActive(repId: string, subrid?: string) {
    // 构建会话键，使用报告ID和预设的前缀组合，如果有subrid则添加
    const sessionKey = subrid ? `${REPORT_DATA_SESSION_KEY_PREFIX}${repId}_${subrid}` : `${REPORT_DATA_SESSION_KEY_PREFIX}${repId}`
    // 获取当前时间戳并转换为字符串
    const timestamp = Date.now().toString()
    localStorage.setItem(sessionKey, timestamp)
    return sessionKey
}

function cleanupOldReportSessions(currentSessionKey: string) {
    const sessions = Object.keys(localStorage)
        .filter((key) => key.startsWith(REPORT_DATA_SESSION_KEY_PREFIX))
        .map((key) => {
            const txt = localStorage.getItem(key)
            const ts = Number(txt)
            return {
                key,
                timestamp: Number.isFinite(ts) ? ts : 0,
            }
        })
        .sort((a, b) => b.timestamp - a.timestamp)

    const keysToKeep = new Set(sessions.slice(0, REPORT_DATA_SESSION_KEEP_COUNT).map((item) => item.key))
    sessions.forEach(({ key }) => {
        if (key !== currentSessionKey && !keysToKeep.has(key)) {
            localStorage.removeItem(key)
        }
    })
}

function isNetworkError(error: any) {
    if (!error) return false
    if (error.isNetworkError) return true
    const errorMessage = error.message?.toLowerCase() || ""
    const networkErrorKeywords = [
        "network error",
        "fetch failed",
        "connection refused",
        "timeout",
        "network request failed",
        "failed to fetch",
        "err_connection_refused",
        "err_network",
        "err_internet_disconnected",
    ]
    return (
        networkErrorKeywords.some((k) => errorMessage.includes(k)) ||
        (error.name === "TypeError" && errorMessage.includes("fetch"))
    )
}

function CommonReportData({ repId, children }: { repId: string; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [queryEnabled, setQueryEnabled] = useState(true)
    const queryCountRef = useRef(0)
    const lastQueryTimeRef = useRef(0)
    const pausedUntilRef = useRef(0)

    const [isClient, setIsClient] = useState(false)
    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [hasUppyUnsavedStates, setHasUppyUnsavedStates] = useState(false)
    const searchParams = useSearchParams()
    const isPrintMode = searchParams?.get("print") === "1"
    
    // 追踪是否已经从缓存加载过数据（用于决定是否需要发起网络请求）
    // 使用函数初始化，在组件首次渲染时就检测 SPA 导航
    const [hasCacheData, setHasCacheData] = useState<boolean | null>(() => {
        if (typeof window === 'undefined') return null

        // 直接使用 props 传入的 repId，而不是从 window.location 提取
        const isDocumentComplete = document.readyState === 'complete'
        const currentSessionKey = repId ? `reportDataSession_${repId}` : null
        const existingSession = currentSessionKey ? 
            localStorage.getItem(currentSessionKey) : null
        const hasCurrentReportSession = existingSession !== null

        console.log('[ReportData] useState初始化检测:', {
            readyState: document.readyState,
            isDocumentComplete,
            repId,
            currentSessionKey,
            hasCurrentReportSession,
            willReturnCacheData: isDocumentComplete && hasCurrentReportSession
        })

        // 优先检查 session 是否存在（无论是否过期）
        // 如果存在 session，直接使用缓存，不发出请求
        // 过期检查由 useEffect 处理（弹出提示并设置 waitingForRefreshConfirm）
        if (isDocumentComplete && hasCurrentReportSession && existingSession) {
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            
            if (timeDiff <= SESSION_TIMEOUT_MS) {
                // Session 存在且未过期，使用缓存
                console.log('[ReportData] useState初始化: 检测到有效 session（未过期），使用缓存，不发出请求')
                return true
            } else {
                // Session 存在但已过期，仍然使用缓存，但 useEffect 会处理超时提示
                console.log('[ReportData] useState初始化: 检测到 session 已过期，使用缓存，等待 useEffect 处理提示')
                return true // 返回 true 使用 cache-only，不发出请求
            }
        }

        // 检测是否是页面刷新（使用现代 Performance Navigation API + SPA 导航标记）
        const navigationEntries = performance.getEntriesByType('navigation')
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined
        const navigationType = navigationEntry ? navigationEntry.type : undefined
        
        // 检查 sessionStorage 中是否有 SPA 导航标记
        // 主报告没有 subrid，使用 'main' 作为默认值
        const spaNavigationFlag = sessionStorage.getItem(`spa_nav_${repId}_main`)
        const isFromSpaNav = spaNavigationFlag === 'true'
        
        // 只有在不是 SPA 导航且 navigationType 为 reload 时才认为是页面刷新
        const isPageRefresh = navigationType === 'reload' && !isFromSpaNav

        if (isPageRefresh) {
            console.log('[ReportData] useState初始化: 检测到页面刷新且无有效 session，需要重新获取数据')
            return false // 页面刷新时返回 false，触发网络请求
        }

        console.log('[ReportData] useState初始化: 非同一报告的 SPA 导航或首次加载')
        return null
    })
    // 追踪是否需要网络请求（只在缓存没有数据时才需要）
    const [needsNetworkFetch, setNeedsNetworkFetch] = useState(false)
    // SPA 导航缓存未命中计数：连续未命中时强制切换到网络查询
    const [spaCacheMissCount, setSpaCacheMissCount] = useState(0)
    // 等待用户确认刷新（session 过期时暂停查询）
    const [waitingForRefreshConfirm, setWaitingForRefreshConfirm] = useState(false)
    
    // 使用 ref 来追踪 SPA 导航状态（用于其他地方引用）
    const isSpaNavigationRef = useRef(hasCacheData === true)

    // 获取当前 pathname 用于检测 SPA 子页面切换
    const pathname = usePathname()

    // 使用 ref 追踪上一次的 pathname，用于检测 SPA 导航
    const prevPathnameRef = useRef<string>('')

    useEffect(() => {
        setIsClient(true)
        setMounted(true)

        // 清理本组件的刷新标记（页面加载完成后）
        const refreshKey = `refreshing_${repId}`
        if (sessionStorage.getItem(refreshKey)) {
            sessionStorage.removeItem(refreshKey)
            console.log('[ReportData] 清理刷新标记:', refreshKey)
        }

        const sessionKey = 'reportDataSession_' + repId
        const existingSession = localStorage.getItem(sessionKey)

        // 检测是否是页面刷新 vs SPA 导航
        // 方法：检查 PerformanceNavigation API，但只在组件首次挂载时检查
        // 如果 pathname 变化了，说明是 SPA 导航
        const isFirstMount = prevPathnameRef.current === ''
        const isPathnameChanged = prevPathnameRef.current !== '' && prevPathnameRef.current !== pathname
        const isSpaNavigation = !isFirstMount && isPathnameChanged

        // 检测页面刷新：使用 PerformanceNavigation API + sessionStorage 标记
        // 注意：子报告组件首次挂载时，如果是从父报告通过 Link 导航过来的，
        // 虽然 PerformanceNavigation API 可能显示 'reload'，但实际上是 SPA 导航
        let isPageRefresh = false
        if (isFirstMount) {
            const navigationEntries = performance.getEntriesByType('navigation')
            const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined
            const navigationType = navigationEntry ? navigationEntry.type : undefined
            
            // 检查 sessionStorage 中是否有导航标记
            // 如果是 SPA 导航（Link 点击），父页面会设置这个标记
            // 主报告没有 subrid，使用 'main' 作为默认值
            const spaNavigationFlag = sessionStorage.getItem(`spa_nav_${repId}_main`)
            const isFromSpaNav = spaNavigationFlag === 'true'
            
            // 只有在不是 SPA 导航且 navigationType 为 reload 时才认为是页面刷新
            isPageRefresh = navigationType === 'reload' && !isFromSpaNav
            
            // 清除标记
            if (spaNavigationFlag) {
                sessionStorage.removeItem(`spa_nav_${repId}_main`)
            }
        }

        console.log('[ReportData] useEffect 执行:', {
            repId,
            pathname,
            prevPathname: prevPathnameRef.current,
            isFirstMount,
            isPathnameChanged,
            isSpaNavigation,
            isPageRefresh,
            hasExistingSession: !!existingSession
        })

        // 更新 prevPathname
        prevPathnameRef.current = pathname

        if (isPageRefresh) {
            console.log('[ReportData] useEffect: 检测到页面刷新，需要重新获取数据, repId:', repId)
            // 只在值真正变化时才更新状态，避免不必要的重新渲染
            if (hasCacheData !== false) {
                setHasCacheData(false)
            }
        } else if (isSpaNavigation && existingSession) {
            // SPA 导航且存在 session - 检查超时
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            console.log('[ReportData] useEffect: SPA导航检测到会话，检查超时:', {
                repId,
                pathname,
                timestamp,
                now,
                timeDiff,
                timeoutMs: SESSION_TIMEOUT_MS,
                isExpired: timeDiff > SESSION_TIMEOUT_MS
            })
            if (timeDiff > SESSION_TIMEOUT_MS) {
                // 暂停查询，等待用户确认
                setWaitingForRefreshConfirm(true)
                setHasCacheData(false)
                toast.warning("报告数据可能已过期", {
                    description: "最后查询时间超过30分钟，建议刷新数据",
                    action: {
                        label: "确认刷新",
                        onClick: () => {
                            const refreshKey = `refreshing_${repId}`
                            if (sessionStorage.getItem(refreshKey)) {
                                console.log('[ReportData] 刷新已在进行中，忽略重复点击')
                                return
                            }
                            sessionStorage.setItem(refreshKey, 'true')
                            console.log('[ReportData] 用户点击确认刷新，执行页面重载')
                            window.location.reload()
                        }
                    },
                    cancel: {
                        label: "取消",
                        onClick: () => {
                            console.log('[ReportData] 用户取消刷新')
                        }
                    },
                    duration: 120000
                })
                localStorage.removeItem(sessionKey)
            } else {
                console.log('[ReportData] useEffect: SPA导航，使用缓存, repId:', repId)
                setHasCacheData(true)
                setNeedsNetworkFetch(false)
            }
        } else if (existingSession) {
            // 首次挂载且存在 session（可能是直接访问或页面刷新后的首次渲染）
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            console.log('[ReportData] useEffect: 首次挂载检测到会话，检查超时:', {
                repId,
                pathname,
                timestamp,
                now,
                timeDiff,
                isExpired: timeDiff > SESSION_TIMEOUT_MS
            })
            if (timeDiff > SESSION_TIMEOUT_MS) {
                // 暂停查询，等待用户确认
                setWaitingForRefreshConfirm(true)
                setHasCacheData(false)
                toast.warning("报告数据可能已过期", {
                    description: "最后查询时间超过30分钟，建议刷新数据",
                    action: {
                        label: "确认刷新",
                        onClick: () => {
                            const refreshKey = `refreshing_${repId}`
                            if (sessionStorage.getItem(refreshKey)) {
                                console.log('[ReportData] 刷新已在进行中，忽略重复点击')
                                return
                            }
                            sessionStorage.setItem(refreshKey, 'true')
                            console.log('[ReportData] 用户点击确认刷新，执行页面重载')
                            window.location.reload()
                        }
                    },
                    cancel: {
                        label: "取消",
                        onClick: () => {
                            console.log('[ReportData] 用户取消刷新')
                        }
                    },
                    duration: 120000
                })
                localStorage.removeItem(sessionKey)
            } else {
                console.log('[ReportData] useEffect: 首次挂载，使用缓存, repId:', repId)
                // 只在值真正变化时才更新状态
                if (hasCacheData !== true) {
                    setHasCacheData(true)
                }
                setNeedsNetworkFetch(false)
            }
        } else {
            console.log('[ReportData] useEffect: 新报告，需要检查缓存, repId:', repId)
            // 注意：不要在这里调用 setHasCacheData(null)，因为 useState 初始化已经返回 null
            // 调用 setHasCacheData(null) 会导致不必要的重新渲染，可能取消正在进行的查询
        }

        const handleBeforeUnload = () => {
            // 不清理 session key，让它在导航时保留
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [repId, pathname])

    // 检查IndexedDB中是否有未清除的uppyState数据
    useEffect(() => {
        const checkUppyStates = async () => {
            try {
                const allGroups = await fileOperationsQueue.getGroupedUppyStates()

                const relatedGroups = allGroups.filter((group) => group.repId === repId)
                const hasAnyUppyStates = relatedGroups.some((group) => group.count > 0)
                setHasUppyUnsavedStates(hasAnyUppyStates)
            } catch (error) {
                console.error('[ReportData] Failed to check uppy states:', error)
                setHasUppyUnsavedStates(false)
            }
        }

        checkUppyStates()
    }, [repId])

    // 使用 ref 来追踪是否是页面刷新（导航时为 false，刷新时为 true）
    const isPageRefreshRef = useRef(false)

    const queryVariables = useMemo(() => ({ id: repId }), [repId])
    // 判断是否应该暂停查询：
    // 1. repId 为空时暂停
    // 2. 等待用户确认刷新时暂停（避免在 session 过期时自动发送请求）
    const shouldPauseQuery = !repId || waitingForRefreshConfirm

    const requestPolicy = useMemo(() => {
        // 特殊情况：Next.js 离线但 GraphQL 在线时
        if (!isNextJSServerReachable && isGraphQLBackendReachable) {
            // 如果是 SPA 导航（有缓存），使用 cache-only
            if (hasCacheData === true) {
                console.log('[ReportData] requestPolicy=cache-only (Next.js 离线，GraphQL 在线，SPA 导航)')
                return "cache-only"
            }
            // 否则（首次访问/刷新），发送 cache-and-network，保证会发起网络请求，并且优先缓存返回
            console.log('[ReportData] requestPolicy=cache-and-network (Next.js 离线，GraphQL 在线，首次访问或刷新)')
            return "cache-and-network"
        }

        // SPA 导航时（hasCacheData === true），始终使用 cache-only，不发起网络请求
        if (hasCacheData === true) {
            console.log('[ReportData] requestPolicy=cache-only (SPA 导航，有缓存)')
            return "cache-only"
        }

        // 优先使用缓存的场景：
        // 1. 客户端离线
        // 2. GraphQL后端离线
        if (!isClientOnline || !isGraphQLBackendReachable) {
            console.log('[ReportData] requestPolicy=cache-only (离线: isClientOnline=' + isClientOnline + ', isGraphQLBackendReachable=' + isGraphQLBackendReachable + ')')
            return "cache-only"
        }

        // 首次访问时（hasCacheData === null），强制发送网络请求
        if (hasCacheData === null) {
            console.log('[ReportData] requestPolicy=network-only (新报告，强制网络请求)')
            return "cache-and-network"
        }

        // Next.js 离线但 GraphQL 在线时：
        // - 页面刷新/首次访问 (hasCacheData === false/null)：发送请求获取数据
        // - SPA 导航 (hasCacheData === true)：上面已处理，使用缓存
        if (!isNextJSServerReachable) {
            if (hasCacheData === false || hasCacheData === null) {
                // 首次访问或页面刷新，需要获取数据
                console.log('[ReportData] requestPolicy=cache-first (Next.js 离线，首次/刷新，获取数据)')
                return "cache-first"
            }
            // SPA 导航情况已在上面处理
            console.log('[ReportData] requestPolicy=cache-only (Next.js 离线，SPA导航)')
            return "cache-only"
        }

        // 页面刷新时（hasCacheData === false）且服务器在线：需要重新获取数据
        if (hasCacheData === false) {
            console.log('[ReportData] requestPolicy=cache-and-network (页面刷新，服务器在线，重新获取数据)')
            return "cache-and-network"
        }

        // 新策略：默认使用 cache-only
        // 只有在明确需要网络请求时（缓存没有数据）才使用 cache-first
        if (needsNetworkFetch) {
            console.log('[ReportData] requestPolicy=cache-first (缓存无数据，需要网络请求)')
            return "cache-first"
        }

        // 默认使用 cache-only，不主动发起网络请求
        console.log('[ReportData] requestPolicy=cache-only (默认，hasCacheData=' + hasCacheData + ', needsNetworkFetch=' + needsNetworkFetch + ')')
        return "cache-only"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable, needsNetworkFetch, hasCacheData])

    // 检测是否是页面刷新（而非 Next.js Link 导航）
    useEffect(() => {
        // Performance Navigation API 的 type 属性：
        // - 'navigate': 页面首次加载或 Link 导航
        // - 'reload': 页面刷新
        // - 'back_forward': 浏览器前进/后退
        const navigationEntries = performance.getEntriesByType('navigation')
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined

        if (navigationEntry) {
            const navigationType = navigationEntry.type
            isPageRefreshRef.current = navigationType === 'reload'

            console.log('[ReportData] 页面加载类型:', navigationType, '是否刷新:', isPageRefreshRef.current)
        }
    }, [])

    // 当后端不可达时始终暂停查询，不依赖 mounted
    // 注意：useQuery 必须在所有使用其结果（data, fetching, error）的 useEffect 之前调用
    const [result, reexecuteQuery] = useQuery({
        query: ReportQuery,
        variables: queryVariables,
        requestPolicy,
        pause: shouldPauseQuery,
    })

    const { data, fetching, error } = result

    // 使用 ref 来跟踪是否已经执行过缓存检查，避免重复执行
    const cacheCheckDoneRef = useRef(false)
    const spaCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // 监听 URQL 查询状态变化，当查询完成时立即检查缓存状态
    useEffect(() => {
        // 只有在查询完成（fetching 为 false）时才执行
        if (fetching) {
            return
        }

        // 如果已经有定时器在运行，不要重复创建
        if (spaCheckIntervalRef.current) {
            return
        }

        // 执行缓存检查逻辑
        if (hasCacheData === true) {
            if (!data && !error) {
                // SPA 导航时缓存未命中
                // 注意：SPA 导航时不应该发出网络请求，即使没有缓存数据
                // 这是为了避免在子页面跳转时产生不必要的请求
                const SPA_CACHE_MISS_MAX = 10
                if (spaCacheMissCount >= SPA_CACHE_MISS_MAX) {
                    console.log('[ReportData] SPA导航缓存连续未命中超过阈值，请手动刷新或等待')
                    setSpaCacheMissCount(SPA_CACHE_MISS_MAX)
                } else {
                    console.log('[ReportData] SPA导航缓存未命中 #', spaCacheMissCount + 1, '，继续等待缓存（不发起网络请求）')
                    setSpaCacheMissCount((prev) => prev + 1)
                }

                // 创建定时器，每 300ms 检查一次缓存，最多 10 次（约 3 秒）
                if (!spaCheckIntervalRef.current && spaCacheMissCount < SPA_CACHE_MISS_MAX) {
                    spaCheckIntervalRef.current = setInterval(() => {
                        // 通过触发 reexecuteQuery 来检查缓存
                        reexecuteQuery({ requestPolicy: 'cache-only' })
                    }, 300)
                }
            } else if (data) {
                console.log('[ReportData] SPA 导航缓存命中，数据可用')
                setSpaCacheMissCount(0)
                setHasCacheData(true)
                setNeedsNetworkFetch(false)
                // 清除定时器
                if (spaCheckIntervalRef.current) {
                    clearInterval(spaCheckIntervalRef.current)
                    spaCheckIntervalRef.current = null
                }
            }
        } else {
            if (!data && !error) {
                // 缓存中没有数据，需要发起网络请求
                console.log('[ReportData] 缓存中没有报告数据，需要发起网络请求')
                // 只在值真正变化时才更新状态
                if (hasCacheData !== false) {
                    setHasCacheData(false)
                }
                setNeedsNetworkFetch(true)
            } else if (data) {
                // 缓存中有数据
                // 注意：首次加载或页面刷新时 (hasCacheData === null 或 false) 不要改成 cache-only
                // 让正在进行的网络请求完成，避免请求被取消
                if (hasCacheData === null || hasCacheData === false) {
                    console.log('[ReportData] 缓存中有数据，但首次加载或页面刷新，让网络请求继续完成')
                    // 保持 hasCacheData 不变，不改变 requestPolicy
                } else {
                    console.log('[ReportData] 缓存中已有报告数据，无需发起网络请求')
                    // 只在值真正变化时才更新状态
                    if (hasCacheData !== true) {
                        setHasCacheData(true)
                    }
                    setNeedsNetworkFetch(false)
                }
            }
        }
    }, [data, fetching, error, hasCacheData, spaCacheMissCount, isNextJSServerReachable, isGraphQLBackendReachable, reexecuteQuery, requestPolicy])

    // 当 repId 变化时，重置缓存检查标记和定时器
    useEffect(() => {
        cacheCheckDoneRef.current = false
        if (spaCheckIntervalRef.current) {
            clearInterval(spaCheckIntervalRef.current)
            spaCheckIntervalRef.current = null
        }
    }, [repId])

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (spaCheckIntervalRef.current) {
                clearInterval(spaCheckIntervalRef.current)
                spaCheckIntervalRef.current = null
            }
        }
    }, [])

    // 在data为空时，每隔150毫秒查询一次，最多20次
    useEffect(() => {
        if ((!isClientOnline || !isGraphQLBackendReachable) && mounted && !data) {
            let count = 0
            const maxRetries = 20
            const interval = setInterval(() => {
                count++
                if (count >= maxRetries || data) {
                    clearInterval(interval)
                    return
                }
                reexecuteQuery({ requestPolicy })
            }, 150)
            return () => clearInterval(interval)
        }
    }, [mounted, data, reexecuteQuery, requestPolicy, isClientOnline, isGraphQLBackendReachable])

    // 监听网络状态从离线恢复为在线时，自动重新获取数据
    const prevServerReachableRef = useRef(isNextJSServerReachable)
    useEffect(() => {
        const wasOffline = prevServerReachableRef.current === false
        const isOnline = isNextJSServerReachable === true

        if (wasOffline && isOnline) {
            console.log('[ReportData] Next.js 服务器从离线恢复为在线，自动重新获取数据')
            setHasCacheData(null)
            setNeedsNetworkFetch(false)
            reexecuteQuery({ requestPolicy: 'cache-first' })
        }

        prevServerReachableRef.current = isNextJSServerReachable
    }, [isNextJSServerReachable, reexecuteQuery])

    // 监听手动刷新报告数据的事件
    useEffect(() => {
        const handleRefreshReport = () => {
            console.log('[ReportData] 收到刷新报告数据的请求，使用 network-only 策略')
            queryCountRef.current = 0
            lastQueryTimeRef.current = 0
            pausedUntilRef.current = 0
            setQueryEnabled(true)
            reexecuteQuery({ requestPolicy: 'network-only' })
        }

        window.addEventListener('refresh-report-data', handleRefreshReport as EventListener)
        return () => {
            window.removeEventListener('refresh-report-data', handleRefreshReport as EventListener)
        }
    }, [reexecuteQuery])

    const report = data && data.getReport
    useEffect(() => {
        if (!report) return
        if (requestPolicy === 'cache-only') {
            console.log('[ReportData] 不在 cache-only 情况下才标记会话: 当前 requestPolicy=', requestPolicy)
            return
        }

        const touchedSessionKey = markReportSessionActive(repId)
        cleanupOldReportSessions(touchedSessionKey)
    }, [repId, report, requestPolicy])
    const { setStorage, setSubrType, setOffline, storage, modified, setModeltype, setModelversion } = useStorage()

    useEffect(() => {
        if (report) {
            setModeltype?.(report.modeltype)
            setModelversion?.(report.modelversion)
        }
    }, [report, setModeltype, setModelversion])

    useEffect(() => {
        const checkUnsavedChanges = async () => {
            if (!report) return

            const mainReportData = await indexedDBStorage.load(repId)
            if (modified || mainReportData?.metadata?.modified) {
                setHasUnsavedChanges(true)
                return
            }

            const subReports = report.isp?.reps?.edges || []
            for (const { node } of subReports) {
                const subReportData = await indexedDBStorage.load(repId, node.id)
                if (subReportData?.metadata?.modified) {
                    setHasUnsavedChanges(true)
                    return
                }
            }

            setHasUnsavedChanges(false)
        }

        checkUnsavedChanges()
    }, [report, repId, modified])

    const refreshData = useCallback(() => {
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) {
            const reasons = []
            if (!isClientOnline) reasons.push("终端断网中")
            if (!isGraphQLBackendReachable) reasons.push("Java后端服务断了")
            if (!isNextJSServerReachable) reasons.push("Next.js前端服务断了")
            toast.error(`离线状态下无法刷新数据`, {
                description: (
                    <>
                        {reasons.map((r, i) => (
                            <React.Fragment key={i}>
                                {r}
                                {i < reasons.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </>
                ),
            })
            return
        }
        console.log("手动刷新报告数据")
        queryCountRef.current = 0
        lastQueryTimeRef.current = 0
        pausedUntilRef.current = 0
        setQueryEnabled(true)
        reexecuteQuery({ requestPolicy: "cache-and-network" })
    }, [reexecuteQuery, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    useEffect(() => {
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) return

        if (fetching) {
            const now = Date.now()

            if (now < pausedUntilRef.current) {
                return
            }

            queryCountRef.current++

            if (now - lastQueryTimeRef.current < 5000 && queryCountRef.current > 5) {
                console.warn(`检测到查询死循环，暂停查询2分钟。查询次数: ${queryCountRef.current}`)
                setQueryEnabled(false)
                pausedUntilRef.current = now + 120000

                setTimeout(() => {
                    console.log("查询死循环暂停期结束，重新启用查询")
                    queryCountRef.current = 0
                    setQueryEnabled(true)
                    pausedUntilRef.current = 0
                }, 120000)
            } else if (now - lastQueryTimeRef.current > 15000) {
                queryCountRef.current = 1
                lastQueryTimeRef.current = now
            }
        }
    }, [fetching, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    const prevDataRef = useRef<any>(null)
    useEffect(() => {
        if (!report) return
        
        // 数据已加载，重置网络请求标志
        if (needsNetworkFetch) {
            console.log('[ReportData] 数据已加载，重置 needsNetworkFetch')
            setNeedsNetworkFetch(false)
            setHasCacheData(true)
        }
        
        // 只在版本变化时才重新解析数据
        if (prevDataRef.current?._version === report.version) {
            return
        }
        
        try {
            const snap = report.snapshot ? JSON.parse(report.snapshot) : undefined
            const dat = report.data ? JSON.parse(report.data) : {}
            const newData = dat ? { ...dat, ...snap, _version: report.version } : { ...(snap || {}), _version: report.version }

            const currentStorageVersion = storage?._version
            const isNewerVersion = !currentStorageVersion || report.version > currentStorageVersion
            
            if (modified) {
                console.log("[v0] Skipping storage update - user has unsaved modifications")
                return
            }

            if (Object.keys(storage).length > 1 && !isNewerVersion) {
                console.log("[v0] Skipping storage update - local data exists and is not older", {
                    networkVersion: report.version,
                    localVersion: currentStorageVersion,
                    localKeys: Object.keys(storage).length,
                })
                return
            }

            console.log("[v0] Updating storage with network data", {
                version: report.version,
                currentVersion: currentStorageVersion,
                isNewer: isNewerVersion,
            })
            setStorage(newData)
            setSubrType(undefined)
            prevDataRef.current = newData
        } catch (error) {
            console.error("[ReportData] Error parsing report data:", error)
        }
    }, [report, storage, setStorage, setSubrType, modified, needsNetworkFetch])

    useEffect(() => {
        const hasNetworkError = isNetworkError(error)
        const shouldBeOffline = hasNetworkError || !isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable
        setOffline(shouldBeOffline)
    }, [error, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable, setOffline])
    if (!isClient || !mounted) {
        return <div className="p-4 text-sm text-muted-foreground">正在准备编辑环境...</div>
    }
    if (fetching && !data && Date.now() < pausedUntilRef.current) {
        return <div className="p-4 text-sm text-muted-foreground">查询已暂停，请稍后...</div>
    }
    if (fetching && !data) return <div>加载中...</div>
    if (error) {
        if (isNetworkError(error)) {
            return report && data && children
        } else {
            return <div>报告取数据错: {error.message}</div>
        }
    }
    // 网络不可达且没有缓存数据时的提示
    const isNetworkUnavailable = !isClientOnline || !isGraphQLBackendReachable

    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>
    if (!report) {
        // SPA 导航时，如果缓存还没有准备好，显示加载状态而不是错误提示
        if (hasCacheData === true && spaCacheMissCount < 10) {
            return (
                <div className="content-center text-center h-screen w-screen flex flex-col items-center justify-center gap-4">
                    <div className="text-gray-600 mb-4">正在从缓存加载报告数据...</div>
                    <div className="text-sm text-gray-400">尝试 {spaCacheMissCount + 1}/10</div>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                        onClick={() => window.location.reload()}
                    >
                        刷新页面
                    </button>
                </div>
            )
        }

        // 当网络不可用时，显示不同的提示
        if (isNetworkUnavailable) {
            return (
                <div className="content-center text-center h-screen w-screen">
                    <div className="text-gray-600 mb-4">当前网络不可用，无法加载报告数据</div>
                    <span
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => window.location.href = '/report/'}
                    >
                        返回首页
                    </span>
                    <button
                        className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => window.location.reload()}
                    >
                        刷新页面
                    </button>
                </div>
            )
        }
        return (
            <div className="content-center text-center h-screen w-screen flex flex-col items-center justify-center gap-4">
                <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => window.location.href = '/report/'}
                >
                    没有找到该份报告，返回首页
                </span>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={() => window.location.reload()}
                >
                    刷新页面
                </button>
            </div>
        )
    }

    return (
        <>
            {(hasUnsavedChanges || hasUppyUnsavedStates) && (
                <div
                    className="fixed top-3 z-50 px-2 py-1 rounded-md shadow-lg print:border-8 print:border-black print:bg-white print:shadow-none"
                    style={{
                        right: "calc(1rem + var(--scrollbar-width, 0px))",
                        backgroundColor: isPrintMode ? "rgba(220, 38, 38, 1)" : "rgba(108,101,39,0.9)",
                        color: "white",
                    }}
                >
                    <div className="flex items-center gap-0 print:gap-2">
                        <AlertTriangle className="h-1.5 w-1.5 md:h-2.5 md:w-2.5 print:text-black print:h-4 print:w-4" />
                    </div>
                </div>
            )}
            {children}
        </>
    )
}

function CommonReportDataSub({
                                 repId,
                                 subrid,
                                 children,
                             }: { repId: string; subrid: string; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [queryEnabled, setQueryEnabled] = useState(true)
    const queryCountRef = useRef(0)
    const lastQueryTimeRef = useRef(0)
    const pausedUntilRef = useRef(0)

    const [isClient, setIsClient] = useState(false)
    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [hasUppyUnsavedStates, setHasUppyUnsavedStates] = useState(false)
    const searchParams = useSearchParams()
    const isPrintMode = searchParams?.get("print") === "1"
    
    // 追踪是否已经从缓存加载过数据（用于决定是否需要发起网络请求）
    // 使用函数初始化，在组件首次渲染时就检测 SPA 导航
    const [hasCacheData, setHasCacheData] = useState<boolean | null>(() => {
        if (typeof window === 'undefined') return null

        // 直接使用 props 传入的 repId 和 subrid
        const isDocumentComplete = document.readyState === 'complete'
        const currentSessionKey = repId && subrid ? `reportDataSession_${repId}_${subrid}` : null
        const existingSession = currentSessionKey ? 
            localStorage.getItem(currentSessionKey) : null
        const hasCurrentReportSession = existingSession !== null

        console.log('[ReportData Sub] useState初始化检测:', {
            readyState: document.readyState,
            isDocumentComplete,
            repId,
            subrid,
            currentSessionKey,
            hasCurrentReportSession,
            willReturnCacheData: isDocumentComplete && hasCurrentReportSession
        })

        // 优先检查 session 是否存在（无论是否过期）
        // 如果存在 session，直接使用缓存，不发出请求
        // 过期检查由 useEffect 处理（弹出提示并设置 waitingForRefreshConfirm）
        if (isDocumentComplete && hasCurrentReportSession && existingSession) {
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            
            if (timeDiff <= SESSION_TIMEOUT_MS) {
                // Session 存在且未过期，使用缓存
                console.log('[ReportData Sub] useState初始化: 检测到有效 session（未过期），使用缓存，不发出请求')
                return true
            } else {
                // Session 存在但已过期，仍然使用缓存，但 useEffect 会处理超时提示
                console.log('[ReportData Sub] useState初始化: 检测到 session 已过期，使用缓存，等待 useEffect 处理提示')
                return true // 返回 true 使用 cache-only，不发出请求
            }
        }

        // 检测是否是页面刷新（使用现代 Performance Navigation API + SPA 导航标记）
        const navigationEntries = performance.getEntriesByType('navigation')
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined
        const navigationType = navigationEntry ? navigationEntry.type : undefined
        
        // 检查 sessionStorage 中是否有 SPA 导航标记
        const subridKey = subrid || 'main'
        const spaNavigationFlag = sessionStorage.getItem(`spa_nav_${repId}_${subridKey}`)
        const isFromSpaNav = spaNavigationFlag === 'true'
        
        // 只有在不是 SPA 导航且 navigationType 为 reload 时才认为是页面刷新
        const isPageRefresh = navigationType === 'reload' && !isFromSpaNav

        if (isPageRefresh) {
            console.log('[ReportData Sub] useState初始化: 检测到页面刷新且无有效 session，需要重新获取数据')
            return false // 页面刷新时返回 false，触发网络请求
        }

        console.log('[ReportData Sub] useState初始化: 非同一报告的 SPA 导航或首次加载')
        return null
    })
    // 追踪是否需要网络请求（只在缓存没有数据时才需要）
    const [needsNetworkFetch, setNeedsNetworkFetch] = useState(false)
    // SPA 导航缓存未命中计数：连续未命中时强制切换到网络查询
    const [spaCacheMissCount, setSpaCacheMissCount] = useState(0)
    // 等待用户确认刷新（session 过期时暂停查询）
    const [waitingForRefreshConfirm, setWaitingForRefreshConfirm] = useState(false)
    
    // 使用 ref 来追踪 SPA 导航状态（用于其他地方引用）
    const isSpaNavigationRef = useRef(hasCacheData === true)

    // 获取当前 pathname 用于检测 SPA 子页面切换
    const pathname = usePathname()

    // 使用 ref 追踪上一次的 pathname，用于检测 SPA 导航
    const prevPathnameRef = useRef<string>('')

    useEffect(() => {
        setIsClient(true)
        setMounted(true)

        // 清理本组件的刷新标记（页面加载完成后）
        const refreshKey = `refreshing_${repId}_${subrid}`
        if (sessionStorage.getItem(refreshKey)) {
            sessionStorage.removeItem(refreshKey)
            console.log('[ReportData Sub] 清理刷新标记:', refreshKey)
        }

        const sessionKey = `reportDataSession_${repId}_${subrid}`
        const existingSession = localStorage.getItem(sessionKey)

        // 检测是否是页面刷新 vs SPA 导航
        // 方法：检查 PerformanceNavigation API，但只在组件首次挂载时检查
        // 如果 pathname 变化了，说明是 SPA 导航
        const isFirstMount = prevPathnameRef.current === ''
        const isPathnameChanged = prevPathnameRef.current !== '' && prevPathnameRef.current !== pathname
        const isSpaNavigation = !isFirstMount && isPathnameChanged

        // 检测页面刷新：使用 PerformanceNavigation API + sessionStorage 标记
        // 注意：子报告组件首次挂载时，如果是从父报告通过 Link 导航过来的，
        // 虽然 PerformanceNavigation API 可能显示 'reload'，但实际上是 SPA 导航
        let isPageRefresh = false
        if (isFirstMount) {
            const navigationEntries = performance.getEntriesByType('navigation')
            const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined
            const navigationType = navigationEntry ? navigationEntry.type : undefined
            
            // 检查 sessionStorage 中是否有导航标记
            // 如果是 SPA 导航（Link 点击），父页面会设置这个标记
            // 子报告使用实际的 subrid
            const spaNavigationFlag = sessionStorage.getItem(`spa_nav_${repId}_${subrid}`)
            const isFromSpaNav = spaNavigationFlag === 'true'
            
            // 只有在不是 SPA 导航且 navigationType 为 reload 时才认为是页面刷新
            isPageRefresh = navigationType === 'reload' && !isFromSpaNav
            
            // 清除标记
            if (spaNavigationFlag) {
                sessionStorage.removeItem(`spa_nav_${repId}_${subrid}`)
            }
        }

        console.log('[ReportData Sub] useEffect 执行:', {
            repId,
            subrid,
            pathname,
            prevPathname: prevPathnameRef.current,
            isFirstMount,
            isPathnameChanged,
            isSpaNavigation,
            isPageRefresh,
            hasExistingSession: !!existingSession
        })

        // 更新 prevPathname
        prevPathnameRef.current = pathname

        if (isPageRefresh) {
            console.log('[ReportData Sub] useEffect: 检测到页面刷新，需要重新获取数据, repId:', repId)
            // 只在值真正变化时才更新状态，避免不必要的重新渲染
            if (hasCacheData !== false) {
                setHasCacheData(false)
            }
        } else if (isSpaNavigation && existingSession) {
            // SPA 导航且存在 session - 检查超时
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            console.log('[ReportData Sub] useEffect: SPA导航检测到会话，检查超时:', {
                repId,
                subrid,
                pathname,
                timestamp,
                now,
                timeDiff,
                timeoutMs: SESSION_TIMEOUT_MS,
                isExpired: timeDiff > SESSION_TIMEOUT_MS
            })
            if (timeDiff > SESSION_TIMEOUT_MS) {
                // 暂停查询，等待用户确认
                setWaitingForRefreshConfirm(true)
                setHasCacheData(false)
                toast.warning("报告数据可能已过期", {
                    description: "最后查询时间超过30分钟，建议刷新数据",
                    action: {
                        label: "确认刷新",
                        onClick: () => {
                            const refreshKey = `refreshing_${repId}_${subrid}`
                            if (sessionStorage.getItem(refreshKey)) {
                                console.log('[ReportData Sub] 刷新已在进行中，忽略重复点击')
                                return
                            }
                            sessionStorage.setItem(refreshKey, 'true')
                            console.log('[ReportData Sub] 用户点击确认刷新，执行页面重载')
                            window.location.reload()
                        }
                    },
                    cancel: {
                        label: "取消",
                        onClick: () => {
                            console.log('[ReportData Sub] 用户取消刷新')
                        }
                    },
                    duration: 120000
                })
                localStorage.removeItem(sessionKey)
            } else {
                console.log('[ReportData Sub] useEffect: SPA导航，使用缓存, repId:', repId)
                setHasCacheData(true)
                setNeedsNetworkFetch(false)
            }
        } else if (existingSession) {
            // 首次挂载且存在 session（可能是直接访问或页面刷新后的首次渲染）
            const timestamp = Number.parseInt(existingSession, 10)
            const now = Date.now()
            const timeDiff = now - timestamp
            console.log('[ReportData Sub] useEffect: 首次挂载检测到会话，检查超时:', {
                repId,
                subrid,
                pathname,
                timestamp,
                now,
                timeDiff,
                isExpired: timeDiff > SESSION_TIMEOUT_MS
            })
            if (timeDiff > SESSION_TIMEOUT_MS) {
                // 暂停查询，等待用户确认
                setWaitingForRefreshConfirm(true)
                setHasCacheData(false)
                toast.warning("报告数据可能已过期", {
                    description: "最后查询时间超过30分钟，建议刷新数据",
                    action: {
                        label: "确认刷新",
                        onClick: () => {
                            const refreshKey = `refreshing_${repId}_${subrid}`
                            if (sessionStorage.getItem(refreshKey)) {
                                console.log('[ReportData Sub] 刷新已在进行中，忽略重复点击')
                                return
                            }
                            sessionStorage.setItem(refreshKey, 'true')
                            console.log('[ReportData Sub] 用户点击确认刷新，执行页面重载')
                            window.location.reload()
                        }
                    },
                    cancel: {
                        label: "取消",
                        onClick: () => {
                            console.log('[ReportData Sub] 用户取消刷新')
                        }
                    },
                    duration: 120000
                })
                localStorage.removeItem(sessionKey)
            } else {
                console.log('[ReportData Sub] useEffect: 首次挂载，使用缓存, repId:', repId)
                // 只在值真正变化时才更新状态
                if (hasCacheData !== true) {
                    setHasCacheData(true)
                }
                setNeedsNetworkFetch(false)
            }
        } else {
            console.log('[ReportData Sub] useEffect: 新子报告，需要检查缓存, repId:', repId)
            // 注意：不要在这里调用 setHasCacheData(null)，因为 useState 初始化已经返回 null
            // 调用 setHasCacheData(null) 会导致不必要的重新渲染，可能取消正在进行的查询
        }

        const handleBeforeUnload = () => {
            // 不清理 session key，让它在导航时保留
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [repId, subrid, pathname])

    // 检查IndexedDB中是否有未清除的uppyState数据
    useEffect(() => {
        const checkUppyStates = async () => {
            try {
                const allGroups = await fileOperationsQueue.getGroupedUppyStates()
                
                // 找到当前分组（子报告有subrid）
                const currentGroup = allGroups.find(
                    (group) => group.repId === repId && group.subrid === subrid
                )

                setHasUppyUnsavedStates(!!(currentGroup && currentGroup.count > 0))
            } catch (error) {
                console.error("[ReportData] Failed to check uppy states:", error)
                setHasUppyUnsavedStates(false)
            }
        }

        checkUppyStates()
    }, [repId, subrid])

    // 使用 ref 来追踪是否是页面刷新（导航时为 false，刷新时为 true）
    const isPageRefreshRef = useRef(false)

    const mainQueryVariables = useMemo(() => ({ id: repId }), [repId])
    const subQueryVariables = useMemo(() => ({ id: subrid }), [subrid])
    // 判断是否应该暂停查询：
    // 1. repId 或 subrid 为空时暂停
    // 2. 等待用户确认刷新时暂停（避免在 session 过期时自动发送请求）
    const shouldPauseQuery = !repId || !subrid || waitingForRefreshConfirm

    const requestPolicy = useMemo(() => {
        // 特殊情况：Next.js 离线但 GraphQL 在线时
        if (!isNextJSServerReachable && isGraphQLBackendReachable) {
            // 如果是 SPA 导航（有缓存），使用 cache-only
            if (hasCacheData === true) {
                console.log('[ReportData Sub] requestPolicy=cache-only (Next.js 离线，GraphQL 在线，SPA 导航)')
                return "cache-only"
            }
            // 否则（首次访问/刷新），发送 cache-and-network，保证会发起网络请求，并且优先缓存返回
            console.log('[ReportData Sub] requestPolicy=cache-and-network (Next.js 离线，GraphQL 在线，首次访问或刷新)')
            return "cache-and-network"
        }

        // SPA 导航时（hasCacheData === true），始终使用 cache-only，不发起网络请求
        if (hasCacheData === true) {
            console.log('[ReportData Sub] requestPolicy=cache-only (SPA 导航，有缓存)')
            return "cache-only"
        }

        // 优先使用缓存的场景：
        // 1. 客户端离线
        // 2. GraphQL后端离线
        if (!isClientOnline || !isGraphQLBackendReachable) {
            console.log('[ReportData Sub] requestPolicy=cache-only (离线: isClientOnline=' + isClientOnline + ', isGraphQLBackendReachable=' + isGraphQLBackendReachable + ')')
            return "cache-only"
        }

        // 首次访问时（hasCacheData === null），强制发送网络请求
        if (hasCacheData === null) {
            console.log('[ReportData Sub] requestPolicy=network-only (新子报告，强制网络请求)')
            return "cache-and-network"
        }

        // Next.js 离线但 GraphQL 在线时：
        // - 页面刷新/首次访问 (hasCacheData === false/null)：发送请求获取数据
        // - SPA 导航 (hasCacheData === true)：上面已处理，使用缓存
        if (!isNextJSServerReachable) {
            if (hasCacheData === false || hasCacheData === null) {
                // 首次访问或页面刷新，需要获取数据
                console.log('[ReportData Sub] requestPolicy=cache-first (Next.js 离线，首次/刷新，获取数据)')
                return "cache-first"
            }
            // SPA 导航情况已在上面处理
            console.log('[ReportData Sub] requestPolicy=cache-only (Next.js 离线，SPA导航)')
            return "cache-only"
        }

        // 页面刷新时（hasCacheData === false）且服务器在线：需要重新获取数据
        if (hasCacheData === false) {
            console.log('[ReportData Sub] requestPolicy=cache-and-network (页面刷新，服务器在线，重新获取数据)')
            return "cache-and-network"
        }

        // 新策略：默认使用 cache-only
        // 只有在明确需要网络请求时（缓存没有数据）才使用 cache-first
        if (needsNetworkFetch) {
            console.log('[ReportData Sub] requestPolicy=cache-first (缓存无数据，需要网络请求)')
            return "cache-first"
        }

        // 默认使用 cache-only，不主动发起网络请求
        console.log('[ReportData Sub] requestPolicy=cache-only (默认，hasCacheData=' + hasCacheData + ', needsNetworkFetch=' + needsNetworkFetch + ')')
        return "cache-only"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable, needsNetworkFetch, hasCacheData])

    // 检测是否是页面刷新（而非 Next.js Link 导航）
    useEffect(() => {
        // Performance Navigation API 的 type 属性：
        // - 'navigate': 页面首次加载或 Link 导航
        // - 'reload': 页面刷新
        // - 'back_forward': 浏览器前进/后退
        const navigationEntries = performance.getEntriesByType('navigation')
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming | undefined

        if (navigationEntry) {
            const navigationType = navigationEntry.type
            isPageRefreshRef.current = navigationType === 'reload'

            console.log('[ReportData Sub] 页面加载类型:', navigationType, '是否刷新:', isPageRefreshRef.current)
        }
    }, [])
    
    // 当后端不可达时始终暂停查询，不依赖 mounted
    // 注意：useQuery 必须在所有使用其结果（data, fetching, error）的 useEffect 之前调用
    const [result, reexecuteQuery] = useQuery({
        query: ReportQuery,
        variables: mainQueryVariables,
        requestPolicy,
        pause: shouldPauseQuery,
    })

    const [resultSub, reexecuteQuerySub] = useQuery({
        query: ReportSubQuery,
        variables: subQueryVariables,
        requestPolicy,
        pause: shouldPauseQuery,
    })

    const { data, fetching, error } = result
    const { data: dataSub, fetching: fetchingSub, error: errorSub } = resultSub

    // 使用 ref 来跟踪是否已经执行过缓存检查，避免重复执行
    const cacheCheckDoneRef = useRef(false)
    const spaCheckIntervalSubRef = useRef<NodeJS.Timeout | null>(null)

    // 监听 URQL 查询状态变化，当查询完成时立即检查缓存状态
    useEffect(() => {
        // 只有在查询完成（fetching 为 false）时才执行
        if (fetching || fetchingSub) {
            return
        }

        // 如果已经有定时器在运行，不要重复创建
        if (spaCheckIntervalSubRef.current) {
            return
        }

        // 执行缓存检查逻辑
        if (hasCacheData === true) {
            if (!data && !dataSub && !error && !errorSub) {
                // SPA 导航时缓存未命中
                // 注意：SPA 导航时不应该发出网络请求，即使没有缓存数据
                // 这是为了避免在子页面跳转时产生不必要的请求
                const SPA_CACHE_MISS_MAX = 10
                if (spaCacheMissCount >= SPA_CACHE_MISS_MAX) {
                    console.log('[ReportData Sub] SPA导航缓存连续未命中超过阈值，请手动刷新或等待')
                    setSpaCacheMissCount(SPA_CACHE_MISS_MAX)
                } else {
                    console.log('[ReportData Sub] SPA导航缓存未命中 #', spaCacheMissCount + 1, '，继续等待缓存（不发起网络请求）')
                    setSpaCacheMissCount((prev) => prev + 1)
                }

                // 创建定时器，每 300ms 检查一次缓存，最多 10 次（约 3 秒）
                if (!spaCheckIntervalSubRef.current && spaCacheMissCount < SPA_CACHE_MISS_MAX) {
                    spaCheckIntervalSubRef.current = setInterval(() => {
                        // 通过触发 reexecuteQuery 来检查缓存
                        reexecuteQuery({ requestPolicy: 'cache-only' })
                        reexecuteQuerySub({ requestPolicy: 'cache-only' })
                    }, 300)
                }
            } else if (data || dataSub) {
                console.log('[ReportData Sub] SPA 导航缓存命中，数据可用')
                setSpaCacheMissCount(0)
                // 只在值真正变化时才更新状态
                if (hasCacheData !== true) {
                    setHasCacheData(true)
                }
                setNeedsNetworkFetch(false)
                // 清除定时器
                if (spaCheckIntervalSubRef.current) {
                    clearInterval(spaCheckIntervalSubRef.current)
                    spaCheckIntervalSubRef.current = null
                }
            }
        } else {
            if (!data && !dataSub && !error && !errorSub) {
                // 缓存中没有数据，需要发起网络请求
                console.log('[ReportData Sub] 缓存中没有报告数据，需要发起网络请求')
                // 只在值真正变化时才更新状态
                if (hasCacheData !== false) {
                    setHasCacheData(false)
                }
                setNeedsNetworkFetch(true)
            } else if (data || dataSub) {
                // 缓存中有数据
                // 注意：首次加载或页面刷新时 (hasCacheData === null 或 false) 不要改成 cache-only
                // 让正在进行的网络请求完成，避免请求被取消
                if (hasCacheData === null || hasCacheData === false) {
                    console.log('[ReportData Sub] 缓存中有数据，但首次加载或页面刷新，让网络请求继续完成')
                    // 保持 hasCacheData 不变，不改变 requestPolicy
                } else {
                    console.log('[ReportData Sub] 缓存中已有报告数据，无需发起网络请求')
                    // 只在值真正变化时才更新状态
                    if (hasCacheData !== true) {
                        setHasCacheData(true)
                    }
                    setNeedsNetworkFetch(false)
                }
            }
        }
    }, [data, dataSub, fetching, fetchingSub, error, errorSub, hasCacheData, spaCacheMissCount, isNextJSServerReachable, isGraphQLBackendReachable, reexecuteQuery, reexecuteQuerySub])

    // 当 repId 或 subrid 变化时，重置缓存检查标记和定时器
    useEffect(() => {
        cacheCheckDoneRef.current = false
        if (spaCheckIntervalSubRef.current) {
            clearInterval(spaCheckIntervalSubRef.current)
            spaCheckIntervalSubRef.current = null
        }
    }, [repId, subrid])

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (spaCheckIntervalSubRef.current) {
                clearInterval(spaCheckIntervalSubRef.current)
                spaCheckIntervalSubRef.current = null
            }
        }
    }, [])

    // 在data为空时，每隔150毫秒查询一次，最多20次
    useEffect(() => {
        if ((!isClientOnline || !isGraphQLBackendReachable) && mounted && (!data || !dataSub)) {
            let count = 0
            const maxRetries = 20
            const interval = setInterval(() => {
                count++
                if (count >= maxRetries || data) {
                    clearInterval(interval)
                    return
                }
                reexecuteQuery({ requestPolicy: 'cache-only' })
                reexecuteQuerySub({ requestPolicy: 'cache-only' })
            }, 150)
            return () => clearInterval(interval)
        }
    }, [mounted, data, dataSub, reexecuteQuery, reexecuteQuerySub, isClientOnline, isGraphQLBackendReachable])

    // 监听网络状态从离线恢复为在线时，自动重新获取数据
    const prevServerReachableRef = useRef(isNextJSServerReachable)
    useEffect(() => {
        const wasOffline = prevServerReachableRef.current === false
        const isOnline = isNextJSServerReachable === true

        if (wasOffline && isOnline) {
            console.log('[ReportData Sub] Next.js 服务器从离线恢复为在线，自动重新获取数据')
            setHasCacheData(null)
            setNeedsNetworkFetch(false)
            reexecuteQuery({ requestPolicy: 'cache-first' })
            reexecuteQuerySub({ requestPolicy: 'cache-first' })
        }

        prevServerReachableRef.current = isNextJSServerReachable
    }, [isNextJSServerReachable, reexecuteQuery, reexecuteQuerySub])

    // 监听手动刷新报告数据的事件
    useEffect(() => {
        const handleRefreshReport = () => {
            console.log('[ReportData Sub] 收到刷新报告数据的请求，使用 network-only 策略')
            queryCountRef.current = 0
            lastQueryTimeRef.current = 0
            pausedUntilRef.current = 0
            setQueryEnabled(true)
            reexecuteQuery({ requestPolicy: 'network-only' })
            reexecuteQuerySub({ requestPolicy: 'network-only' })
        }

        window.addEventListener('refresh-report-data', handleRefreshReport as EventListener)

        return () => {
            window.removeEventListener('refresh-report-data', handleRefreshReport as EventListener)
        }
    }, [reexecuteQuery, reexecuteQuerySub])

    const report = data && data?.getReport
    const reportSub = React.useMemo(() => {
        const reportSub = dataSub && dataSub?.getReport
        if (reportSub || !report) return reportSub
        const { node: subrepObj } = report.isp?.reps?.edges?.find(({ node: { id } }: any) => id === subrid)
        return subrepObj
    }, [dataSub, subrid, report])

    // 使用 ref 来追踪是否已经标记过会话，避免重复标记
    const sessionMarkedRef = useRef(false)
    
    useEffect(() => {
        if (!reportSub) return
        
        // 如果已经标记过会话，不再重复标记
        if (sessionMarkedRef.current) {
            return
        }
        
        // 标记会话为已激活
        const touchedSessionKey = markReportSessionActive(repId, subrid)
        cleanupOldReportSessions(touchedSessionKey)
        sessionMarkedRef.current = true
    }, [repId, subrid, reportSub])
    
    // 当 repId 或 subrid 变化时重置会话标记
    useEffect(() => {
        sessionMarkedRef.current = false
    }, [repId, subrid])

    const { setStorage, setSubrType, setParrepfs, setOffline, storage, modified, setModeltype, setModelversion } =
        useStorage()

    useEffect(() => {
        if (report) {
            setModeltype?.(report.modeltype)
            setModelversion?.(report.modelversion)
        }
    }, [report, setModeltype, setModelversion])

    useEffect(() => {
        const checkUnsavedChanges = async () => {
            const subReportData = await indexedDBStorage.load(repId, subrid)
            setHasUnsavedChanges(modified || !!subReportData?.metadata?.modified)
        }

        checkUnsavedChanges()
    }, [repId, subrid, modified])

    const refreshData = useCallback(() => {
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) {
            console.log("离线状态下无法刷新数据")
            return
        }
        console.log("手动刷新报告数据")
        queryCountRef.current = 0
        lastQueryTimeRef.current = 0
        pausedUntilRef.current = 0
        setQueryEnabled(true)
        reexecuteQuery({ requestPolicy: "cache-and-network" })
        reexecuteQuerySub({ requestPolicy: "cache-and-network" })
    }, [reexecuteQuery, reexecuteQuerySub, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    useEffect(() => {
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) return
        if (fetching || fetchingSub) {
            const now = Date.now()
            if (now < pausedUntilRef.current) {
                return
            }

            queryCountRef.current++

            if (now - lastQueryTimeRef.current < 5000 && queryCountRef.current > 5) {
                console.warn("检测到子报告查询死循环，暂停查询2分钟")
                setQueryEnabled(false)
                pausedUntilRef.current = now + 120000

                setTimeout(() => {
                    console.log("子报告查询死循环暂停期结束")
                    queryCountRef.current = 0
                    setQueryEnabled(true)
                    pausedUntilRef.current = 0
                }, 120000)
            } else if (now - lastQueryTimeRef.current > 15000) {
                queryCountRef.current = 1
                lastQueryTimeRef.current = now
            }
        }
    }, [fetching, fetchingSub, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    const prevDataRef = useRef<any>(null)
    const prevParrepfsRef = useRef<any>(null)

    useEffect(() => {
        if (!report || !reportSub) return

        // 只在版本变化时才重新解析数据
        if (prevDataRef.current?._version === reportSub.version && 
            prevParrepfsRef.current?._version === report.version) {
            return
        }

        try {
            const snap = report.snapshot ? JSON.parse(report.snapshot) : undefined
            const subdat = reportSub.data ? JSON.parse(reportSub.data) : {}
            const dat = report.data ? JSON.parse(report.data) : {}

            const newSubData = subdat ? { ...subdat, _version: reportSub.version } : { _version: reportSub.version }

            const currentStorageVersion = storage?._version
            const isNewerVersion = !currentStorageVersion || reportSub.version > currentStorageVersion

            if (modified) {
                console.log("[v0] Skipping sub-report storage update - user has unsaved modifications")
                return
            }

            if (Object.keys(storage).length > 1 && !isNewerVersion) {
                console.log("[v0] Skipping sub-report storage update - local data exists and is not older", {
                    networkVersion: reportSub.version,
                    localVersion: currentStorageVersion,
                })
                return
            }

            console.log("[v0] Updating sub-report storage with network data", {
                version: reportSub.version,
                currentVersion: currentStorageVersion,
            })
            setStorage(newSubData)
            prevDataRef.current = newSubData
            setSubrType(reportSub.modeltype)

            const newParData = dat
                ? { ...dat, ...(snap || {}), _version: report.version }
                : { ...(snap || {}), _version: report.version }
            setParrepfs(newParData)
            prevParrepfsRef.current = newParData
        } catch (error) {
            console.error("[ReportData] Error parsing sub-report data:", error)
        }
    }, [report, reportSub, storage, setStorage, setSubrType, setParrepfs, modified])

    useEffect(() => {
        const hasNetworkError = isNetworkError(error) || isNetworkError(errorSub)
        const shouldBeOffline = hasNetworkError || !isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable
        setOffline(shouldBeOffline)
    }, [error, errorSub, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable, setOffline])

    if (!mounted) return <div className="p-4 text-sm text-muted-foreground">正在准备编辑环境...</div>
    if (fetching || fetchingSub) return <div>加载中...</div>

    if (error || errorSub) {
        const hasNetworkError = isNetworkError(error) || isNetworkError(errorSub)
        if (hasNetworkError) {
            return report && reportSub ? children : null
        } else {
            return <div>子报告取数据错: {error?.message || errorSub?.message}</div>
        }
    }
    // 网络不可达且没有缓存数据时的提示
    const isNetworkUnavailable = !isClientOnline || !isGraphQLBackendReachable
    
    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>
    if (!report) {
        if (fetching || error) {
            return <div className="p-4 text-sm text-muted-foreground">加载报告数据还没完...</div>
        }

        // SPA 导航时，如果缓存还没有准备好，显示加载状态而不是错误提示
        if (hasCacheData === true && spaCacheMissCount < 10) {
            return (
                <div className="content-center text-center h-screen w-screen flex flex-col items-center justify-center gap-4">
                    <div className="text-gray-600 mb-4">正在从缓存加载报告数据...</div>
                    <div className="text-sm text-gray-400">尝试 {spaCacheMissCount + 1}/10</div>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                        onClick={() => window.location.reload()}
                    >
                        刷新页面
                    </button>
                </div>
            )
        }

        // 当网络不可用时，显示不同的提示
        if (isNetworkUnavailable) {
            return (
                <div className="content-center text-center h-screen w-screen">
                    <div className="text-gray-600 mb-4">当前网络不可用，无法加载报告数据</div>
                    <span
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => window.location.href = '/report/'}
                    >
                        返回首页
                    </span>
                </div>
            )
        }
        return (
            <div className="content-center text-center h-screen w-screen flex flex-col items-center justify-center gap-4">
                <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => window.location.href = '/report/'}
                >
                    没有找到该份报告，返回首页
                </span>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    onClick={() => window.location.reload()}
                >
                    刷新页面
                </button>
            </div>
        )
    }
    if (!reportSub) {
        // 当网络不可用时，显示不同的提示
        if (isNetworkUnavailable) {
            return (
                <div className="content-center text-center h-screen w-screen">
                    <div className="text-gray-600 mb-4">当前网络不可用，无法加载子报告数据</div>
                    <span
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => window.location.href = '/report/'}
                    >
                        返回首页
                    </span>
                </div>
            )
        }
        return (
            <div className="content-center text-center h-screen w-screen">
                <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => window.location.href = '/report/'}
                >
                    没有该独立流转子报告，返回首页
                </span>
            </div>
        )
    }

    return (
        <>
            {(hasUnsavedChanges || hasUppyUnsavedStates) && (
                <div
                    className="fixed top-3 z-50 px-2 py-1 rounded-md shadow-lg print:border-8 print:border-black print:bg-white print:shadow-none"
                    style={{
                        right: "calc(1rem + var(--scrollbar-width, 0px))",
                        backgroundColor: isPrintMode ? "rgba(220, 38, 38, 1)" : "rgba(108,101,39,0.9)",
                        color: "white",
                    }}
                >
                    <div className="flex items-center gap-0 print:gap-2">
                        <AlertTriangle className="h-1.5 w-1.5 md:h-2.5 md:w-2.5 print:text-black print:h-4 print:w-4" />
                    </div>
                </div>
            )}
            {children}
        </>
    )
}

export default function ReportData({ repId, children }: { repId: string; children: React.ReactNode }) {
    const searchParams = useSearchParams()
    const subrid = searchParams?.get("subrid")
    return subrid ? (
        <CommonReportDataSub repId={repId} subrid={subrid}>
            {children}
        </CommonReportDataSub>
    ) : (
        <CommonReportData repId={repId}>{children}</CommonReportData>
    )
}
