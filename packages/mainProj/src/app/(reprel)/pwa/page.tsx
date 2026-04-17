"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useClient } from "@urql/next"
import { ReportQueryWithSubReports, ReportSubQuery } from "@/component/rep/report-data"
import { Button } from "@/components/ui"
import { Home } from "lucide-react"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { toast } from "sonner"

interface PrecacheResult {
    template: { templateId: string; version: string }
    pageSuccess: boolean
    rscSuccess: boolean
    pageError?: string
    rscError?: string
}

interface PrecacheProgress {
    completed: number
    total: number
    currentItem: string
}

interface CustomUrlConfig {
    id: string
    urlPattern: string
    description: string
    enabled: boolean
}

interface OfflineReport {
    repId: string
    modeltype?: string
    modelversion?: string
    lastCacheTime?: number
}

interface TemplateConfig {
    cacheUrls: string[]
}

interface CacheStatus {
    templateId: string
    version: string
    lastCacheTime?: number
}

/**
 * 将版本时间戳格式化为可读的日期时间字符串
 * @param version 版本时间戳（毫秒级时间戳字符串）
 * @returns 格式化的日期时间字符串
 */
function formatVersionTime(version: string | null | undefined): string {
    if (!version) return "未知"
    const timestamp = Number.parseInt(version, 10)
    if (Number.isNaN(timestamp)) return version // 如果不是数字，返回原值

    const date = new Date(timestamp)
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    })
}

/**需外部配合向localStorage("offline-reports")注入离线报告的id;
 * */
export default function Page() {
    const client = useClient()
    const { isNextJSServerReachable,isGraphQLBackendReachable } = useNetworkStatusContext()
    const [precacheStatus, setPrecacheStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [precacheMessage, setPrecacheMessage] = useState("")
    const [precacheProgress, setPrecacheProgress] = useState<PrecacheProgress>({
        completed: 0,
        total: 0,
        currentItem: "",
    })
    const [precacheResults, setPrecacheResults] = useState<PrecacheResult[]>([])
    const [failedItems, setFailedItems] = useState<PrecacheResult[]>([])
    const [swError, setSwError] = useState<string | null>(null)
    
    // 添加 ref 来追踪预缓存操作的触发时机
    const precacheTriggerTimeRef = useRef<number | null>(null)
    const currentPrecacheOperationRef = useRef<boolean>(false)

    const [customUrls, setCustomUrls] = useState<CustomUrlConfig[]>([])
    const [newUrlPattern, setNewUrlPattern] = useState("")
    const [newUrlDescription, setNewUrlDescription] = useState("")
    const [showCustomUrlForm, setShowCustomUrlForm] = useState(false)

    const [offlineReports, setOfflineReports] = useState<OfflineReport[]>([])
    // 保存初始的离线报告列表（只有 repId）
    const [initialOfflineReports, setInitialOfflineReports] = useState<OfflineReport[]>([])
    const [reportTemplates, setReportTemplates] = useState<{ templateId: string; version: string }[]>([])
    const [cacheStatusList, setCacheStatusList] = useState<CacheStatus[]>([])

    const [reportQueries, setReportQueries] = useState<any[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [cacheSize, setCacheSize] = useState<string>("0 KB")
    const [isCalculatingCache, setIsCalculatingCache] = useState(false)
    const [showCustomUrlSection, setShowCustomUrlSection] = useState(false)
    const [currentBuildVersion, setCurrentBuildVersion] = useState<string>("")
    const [pwaCertStatus, setPwaCertStatus] = useState<'active' | 'failed' | 'pending'>('active')

    // 缓存健康检测状态
    const [needsCompleteReset, setNeedsCompleteReset] = useState(false)
    const [resetReason, setResetReason] = useState<string>("")
    const [cacheHealthStatus, setCacheHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy')
    const [resetInProgress, setResetInProgress] = useState(() => {
        // 从 sessionStorage 恢复重置状态，避免页面重新加载后立即检查
        if (typeof window !== 'undefined') {
            const resetTimestamp = sessionStorage.getItem('pwa-cache-reset-timestamp')
            if (resetTimestamp) {
                const resetTime = parseInt(resetTimestamp, 10)
                const now = Date.now()
                // 如果重置时间在过去2分钟内，仍然认为重置进行中
                if (now - resetTime < 2 * 60 * 1000) {
                    return true
                } else {
                    // 超过2分钟，清理旧的标记
                    sessionStorage.removeItem('pwa-cache-reset-timestamp')
                }
            }
        }
        return false
    })

    // 缓存健康检测配置
    const CACHE_HEALTH_CONFIG = {
        minExpectedSize: 5 * 1024 * 1024,  // 5MB
        maxExpectedSize: 20 * 1024 * 1024, // 20MB
        expectedSize: 8.46 * 1024 * 1024,   // x MB (预期值)
        failureThreshold: 0.5,             // 失败率超过50%触发警告
    }

    // 检查缓存健康状况
    const checkCacheHealth = async (): Promise<{ status: 'healthy' | 'warning' | 'critical'; reason: string }> => {
        try {
            // 检查是否在重置恢复期内（过去2分钟内进行过完全重置）
            const resetTimestamp = sessionStorage.getItem('pwa-cache-reset-timestamp')
            if (resetTimestamp) {
                const resetTime = parseInt(resetTimestamp, 10)
                const now = Date.now()
                if (now - resetTime < 2 * 60 * 1000) {
                    console.log('[CacheHealth] 检测到最近进行过完全重置，跳过健康检查，等待缓存恢复')
                    return { status: 'healthy', reason: '' }
                } else {
                    // 超过2分钟，清理旧的标记
                    sessionStorage.removeItem('pwa-cache-reset-timestamp')
                }
            }

            // 1. 检查缓存大小
            const cacheNames = await caches.keys()
            let totalSize = 0
            let serwistCacheCount = 0

            for (const cacheName of cacheNames) {
                if (cacheName.includes('serwist') || cacheName.includes('precache')) {
                    serwistCacheCount++
                    const cache = await caches.open(cacheName)
                    const requests = await cache.keys()
                    // 估算大小
                    for (const request of requests) {
                        try {
                            const response = await cache.match(request)
                            if (response) {
                                const blob = await response.blob()
                                totalSize += blob.size
                            }
                        } catch {
                            // 忽略无法读取的缓存项
                        }
                    }
                }
            }

            // 2. 检查 Service Worker 状态
            let swStatus: 'active' | 'inactive' | 'error' = 'inactive'
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration()
                if (registration) {
                    if (registration.active) {
                        swStatus = 'active'
                    } else if (registration.installing || registration.waiting) {
                        swStatus = 'inactive'
                    }
                }
            }

            // 3. 检查版本一致性
            const lastCacheWarmup = localStorage.getItem("last-cache-warmup")
            const versionMismatch = currentBuildVersion && lastCacheWarmup && lastCacheWarmup !== currentBuildVersion

            // 4. 判断健康状况
            if (totalSize < CACHE_HEALTH_CONFIG.minExpectedSize) {
                return {
                    status: 'critical',
                    reason: `缓存大小异常 (${formatBytes(totalSize)})，远低于预期值 ${formatBytes(CACHE_HEALTH_CONFIG.expectedSize)}，可能是缓存损坏或未正确初始化`
                }
            }

            if (totalSize > CACHE_HEALTH_CONFIG.maxExpectedSize) {
                return {
                    status: 'warning',
                    reason: `缓存大小异常 (${formatBytes(totalSize)})，超过最大值 ${formatBytes(CACHE_HEALTH_CONFIG.maxExpectedSize)}，可能存在重复或过期缓存`
                }
            }

            if (swStatus === 'inactive') {
                return {
                    status: 'warning',
                    reason: 'Service Worker 处于等待状态，可能无法正确提供离线功能'
                }
            }

            if (versionMismatch) {
                return {
                    status: 'warning',
                    reason: `缓存版本不匹配 (缓存: ${formatVersionTime(lastCacheWarmup)}, 当前: ${formatVersionTime(currentBuildVersion)})，建议更新缓存`
                }
            }

            if (serwistCacheCount === 0) {
                return {
                    status: 'critical',
                    reason: '未检测到 Serwist 预缓存，离线功能可能不可用'
                }
            }

            return { status: 'healthy', reason: '' }
        } catch (error) {
            console.error("[CacheHealth] 检查缓存健康失败:", error)
            return { status: 'critical', reason: '缓存健康检查失败，可能存在严重问题' }
        }
    }

    // 格式化字节大小
    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    // 触发需要完全重置的提示
    const triggerResetNeeded = (reason: string, level: 'warning' | 'critical' = 'warning') => {
        setNeedsCompleteReset(true)
        setResetReason(reason)
        setCacheHealthStatus(level)
        console.warn(`[CacheHealth] 需要完全重置: ${reason}`)
    }

    // 清除重置提示
    const clearResetNeeded = () => {
        setNeedsCompleteReset(false)
        setResetReason("")
        setCacheHealthStatus('healthy')
    }

    // 检查 PWA 证书状态
    const checkPwaCertStatus = () => {
        if (typeof window === 'undefined') return 'failed'

        // 检查是否为 HTTPS 协议
        const isHttps = window.location.protocol === 'https:'
        if (!isHttps && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return 'failed'
        }

        // 检查是否为 IP 地址访问
        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname)
        if (isIpAddress) {
            const certTrusted = sessionStorage.getItem('pwa-cert-trusted')
            if (certTrusted !== 'true') {
                return 'pending'
            }
        }

        return 'active'
    }

    // 在组件加载时检查 PWA 证书状态
    useEffect(() => {
        setPwaCertStatus(checkPwaCertStatus())

        // 监听来自证书说明窗口的消息
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CERT_TRUSTED') {
                sessionStorage.setItem('pwa-cert-trusted', 'true')
                setPwaCertStatus('active')
                window.location.reload()
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    // 简化的缓存状态检查 - 只检查是否有缓存时间
    const checkCacheStatus = async () => {
        console.log("checkCacheStatus function is called")
        try {
            // 检查 report-pages-normalized 缓存
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                const reportCacheName = cacheNames.find(name => name.includes("report-pages-normalized"));
                if (reportCacheName) {
                    const reportCache = await caches.open(reportCacheName);
                    const keys = await reportCache.keys();
                    console.log(`[PWA] report-pages-normalized 缓存中有 ${keys.length} 个请求`);
                    // 打印前5个缓存键作为示例
                    for (let i = 0; i < Math.min(5, keys.length); i++) {
                        console.log(`[PWA]   缓存键 ${i}: ${keys[i].url}`);
                    }
                } else {
                    console.log("[PWA] 未找到 report-pages-normalized 缓存");
                }
            }

            const statusList: CacheStatus[] = []
            const cacheTimeData = localStorage.getItem("cache-time")
            const cacheTimeObj = cacheTimeData ? JSON.parse(cacheTimeData) : {}

            for (const template of reportTemplates) {
                const templateKey = `${template.templateId}-${template.version}`
                const lastCacheTime = cacheTimeObj[templateKey] ? Number.parseInt(cacheTimeObj[templateKey]) : undefined

                statusList.push({
                    templateId: template.templateId,
                    version: template.version,
                    lastCacheTime,
                })
            }

            setCacheStatusList(statusList)
        } catch (error) {
            console.error("检查缓存状态失败:", error)
        }
    }

    // 加载离线报告的 useEffect - 应该只运行一次
    useEffect(() => {
        const loadOfflineReports = () => {
            try {
                const savedReports = localStorage.getItem("offline-reports")
                if (savedReports) {
                    const reports: string[] = JSON.parse(savedReports)
                    // 初始列表只包含 repId
                    const initialList: OfflineReport[] = reports.map((repId) => ({ repId }))
                    // 保存初始列表到独立变量
                    setInitialOfflineReports(initialList)
                    console.log("[v0] 加载离线报告列表 (初始):", initialList)
                }
            } catch (error) {
                console.error("加载离线报告列表失败:", error)
            }
        }

        loadOfflineReports()
    }, []) // 空依赖数组，只运行一次

    // 只有当 initialOfflineReports 改变时才获取数据
    useEffect(() => {
        const fetchAllReports = async () => {
            if (initialOfflineReports.length === 0) {
                setReportQueries([])
                return
            }

            setIsFetching(true)
            if(isGraphQLBackendReachable === false)
                toast.error("后端离线，无法获取最新的报告数据", {
                                description: "当前Java后端离线，没法使用缓存更新功能了",
                                duration: 30 * 1000,
                            })
            try {
                const queryResults = []
                for (const report of initialOfflineReports) {
                    const repId = report.repId
                    if (!repId) {
                        queryResults.push(null)
                        continue
                    }
                    try {
                        // 检查后端是否可用，如果不可用则直接跳过请求，使用缓存数据
                        if (isGraphQLBackendReachable === false) {
                            console.log(`[PWA] 后端离线，直接使用 urql 缓存: ${repId}`)
                            queryResults.push(null)
                            continue
                        }

                        // 后端在线时才发送请求
                        const result = await client.query(ReportQueryWithSubReports, { id: repId }).toPromise()

                        // 检查是否是网络错误（502 Bad Gateway 等），如果是则抛弃错误响应，使用缓存
                        const isNetworkError = result?.error?.graphQLErrors?.some(
                            (e: any) => e?.extensions?.statusCode >= 500 || 
                                        e?.message?.includes('502') || 
                                        e?.message?.includes('Failed to fetch')
                        ) || result?.stale

                        if (isNetworkError) {
                            console.warn(`[PWA] 后端离线，repId=${repId} 返回 ${result?.error?.graphQLErrors?.[0]?.extensions?.statusCode}，跳过更新`)
                            queryResults.push(null)
                        } else {
                            queryResults.push(result)
                        }

                        // 获取主报告后，遍历所有子报告并单独查询，填充 urql 缓存
                        if (result?.data?.getReport?.isp?.reps?.edges) {
                            const subReports = result.data.getReport.isp.reps.edges
                            for (const { node: subReport } of subReports) {
                                if (subReport?.id) {
                                    try {
                                        // 为每个子报告发起单独查询，使用与普通页面相同的查询
                                        await client.query(ReportSubQuery, { id: subReport.id }).toPromise()
                                        console.log(`[PWA] 预缓存子报告: ${subReport.id}`)
                                    } catch (subErr) {
                                        console.warn(`[PWA] 预缓存子报告失败 ${subReport.id}:`, subErr)
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to fetch report ${repId}:`, err)
                        queryResults.push(null)
                    }
                }
                setReportQueries(queryResults)
            } catch (error) {
                console.error("Failed to fetch reports:", error)
            } finally {
                setIsFetching(false)
            }
        }

        fetchAllReports()
    }, [initialOfflineReports, client, isGraphQLBackendReachable]) // 依赖于 initialOfflineReports、client 和 isGraphQLBackendReachable

    // 处理报告数据的 useEffect
    useEffect(() => {
        if (initialOfflineReports.length === 0 || reportQueries.length === 0) return

        const templates: { templateId: string; version: string }[] = []
        const updatedReports: OfflineReport[] = []

        for (let i = 0; i < initialOfflineReports.length; i++) {
            const report = initialOfflineReports[i]
            const queryResult = reportQueries[i]

            try {
                if (queryResult?.data?.getReport) {
                    const repdata = queryResult.data.getReport
                    const newModeltype = repdata.modeltype
                    const newModelversion = repdata.modelversion

                    updatedReports.push({
                        ...report,
                        modeltype: newModeltype,
                        modelversion: newModelversion,
                    })

                    templates.push({
                        templateId: newModeltype,
                        version: newModelversion,
                    })
                } else {
                    // Keep original report if query failed or no data
                    updatedReports.push(report)
                }
            } catch (error) {
                console.error(`查询报告 ${report.repId} 失败:`, error)
                updatedReports.push(report)
            }
        }

        const hasNewData = updatedReports.some((report) => report.modeltype && report.modelversion)
        if (hasNewData && !initialOfflineReports.some((report) => report.modeltype)) {
            setOfflineReports(updatedReports)
            // 过滤重复项
            const tmplAllList = templates.filter(
                (status, index, self) =>
                    index === self.findIndex((s) => s.templateId === status.templateId && s.version === status.version),
            )
            setReportTemplates(tmplAllList)
            console.log("[v0] 更新报告数据:", updatedReports, "setReportTemplates?=", tmplAllList)
        }
    }, [reportQueries, initialOfflineReports]) // 依赖于 reportQueries 和 initialOfflineReports

    useEffect(() => {
        if (reportTemplates.length > 0) {
            checkCacheStatus()
        }
    }, [reportTemplates])

    // 定期检查缓存健康状况
    useEffect(() => {
        const performHealthCheck = async () => {
            // 如果正在进行重置操作，跳过健康检查
            if (resetInProgress) {
                console.log("[CacheHealth] 重置进行中，跳过健康检查")
                return
            }

            if (!isNextJSServerReachable) {
                // 服务器离线时不进行检查
                return
            }
            const health = await checkCacheHealth()
            if (health.status !== 'healthy') {
                triggerResetNeeded(health.reason, health.status)
            } else {
                clearResetNeeded()
            }
        }

        // 初始检查
        performHealthCheck()

        // 每60秒检查一次
        const interval = setInterval(performHealthCheck, 60000)

        return () => clearInterval(interval)
    }, [isNextJSServerReachable, currentBuildVersion, resetInProgress])

    // 检查 PWA 环境支持 - 恢复代码
    useEffect(() => {
        // 清理过期的重置时间戳标记
        const resetTimestamp = sessionStorage.getItem('pwa-cache-reset-timestamp')
        if (resetTimestamp) {
            const resetTime = parseInt(resetTimestamp, 10)
            const now = Date.now()
            // 如果重置时间超过2分钟，清理标记
            if (now - resetTime >= 2 * 60 * 1000) {
                sessionStorage.removeItem('pwa-cache-reset-timestamp')
                console.log('[CacheHealth] 清理过期的重置时间戳标记')
            }
        }

        const checkPWAEnv = () => {
            // 检查是否为 HTTPS
            const isHttps = window.location.protocol === 'https:'

            // 检查是否为 IP 地址
            const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname)

            if (isIpAddress) {
                const certTrusted = sessionStorage.getItem('pwa-cert-trusted')
                if (certTrusted !== 'true') {
                    setSwError("PWA 待启用：使用 IP 地址访问需要手动信任 SSL 证书。点击右下角'查看证书说明'了解操作步骤，或使用域名访问。")
                    console.warn('[PWA] IP 地址访问，需要信任证书')
                    return
                }
                // 证书已信任，不设置错误
            }

            if (!isHttps && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                setSwError("PWA 不支持：当前不是 HTTPS 环境。Service Worker 需要使用 HTTPS 协议")
                console.warn('[PWA] 非 HTTPS 环境')
                return
            }
        }

        checkPWAEnv()
    }, [])

    useEffect(() => {
        const fetchBuildVersion = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_WEB}/api/nextLive`, { cache: "no-store" })
                if (response.ok) {
                    const data = await response.json()
                    setCurrentBuildVersion(data.version)
                    console.log("[v0] 当前构建版本:", data.version)
                }
            } catch (error) {
                console.error("获取构建版本失败:", error)
            }
        }
        fetchBuildVersion()
    }, [])

    const handleHardRefresh = () => {
        //刷新页面
        window.location.reload()
    }
    const handleCompleteReset = async () => {
        try {
            // 设置重置进行中标志，防止在重置期间触发健康检查警告
            setResetInProgress(true)
            // 在 sessionStorage 中记录重置时间戳，页面重新加载后仍然有效
            sessionStorage.setItem('pwa-cache-reset-timestamp', Date.now().toString())

            // 1. 清理所有缓存
            if ("caches" in window) {
                const cacheNames = await caches.keys()
                await Promise.all(cacheNames.map((name) => caches.delete(name)))
            }
            // 2. 注销 Service Worker
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations()
                await Promise.all(registrations.map((registration) => registration.unregister()))
            }
            // 3. 清理本地存储
            // localStorage.clear()
            sessionStorage.clear()
            // 注意：这里会清除刚刚设置的重置时间戳，但页面重新加载前会重新设置
            // 4. 清理 IndexedDB
            if ("indexedDB" in window) {
                console.log("[v0] 正在清理 IndexedDB...")
            }
            // 清除重置提示
            clearResetNeeded()

            // 在重新加载前重新设置时间戳（因为sessionStorage.clear()会清除它）
            sessionStorage.setItem('pwa-cache-reset-timestamp', Date.now().toString())

            setSwError("系统已完全重置，正在重新加载...")
            setTimeout(() => {
                window.location.reload()
            }, 1500)
            setCacheSize("0 KB")
        } catch (error) {
            console.error("完全重置失败:", error)
            setSwError("重置失败，请手动重启浏览器")
            // 重置失败时也要清除标志
            setResetInProgress(false)
            sessionStorage.removeItem('pwa-cache-reset-timestamp')
        }
    }
    const handleClearSiteData = async () => {
        if (!confirm("⚠️ 确定要清除全部网站数据吗？\n\n这将清除：\n• 所有缓存（Cache Storage）\n• 所有 IndexedDB 数据库\n• 所有 LocalStorage 数据\n• 所有 SessionStorage 数据\n• Service Worker 注册\n• Cookie（同域）\n• 应用状态数据\n\n操作不可恢复，页面将重新加载！")) {
            return;
        }

        const clearResults: string[] = [];

        try {
            // 1. 清理所有 Cache Storage（不只是 Serwist）
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => {
                    caches.delete(name);
                    return name;
                }));
                clearResults.push(`✓ Cache Storage: ${cacheNames.length} 个缓存`);
                console.log(`[清除网站数据] 已清理 ${cacheNames.length} 个缓存:`, cacheNames);
            }

            // 2. 清理所有 IndexedDB 数据库
            if ("indexedDB" in window) {
                const dbs = await window.indexedDB.databases();
                for (const db of dbs) {
                    if (db.name) {
                        window.indexedDB.deleteDatabase(db.name);
                    }
                }
                clearResults.push(`✓ IndexedDB: ${dbs.length} 个数据库`);
                console.log(`[清除网站数据] 已删除 ${dbs.length} 个 IndexedDB:`, dbs.map(d => d.name));
            }

            // 3. 清理所有 LocalStorage
            const localStorageKeys = Object.keys(localStorage);
            localStorageKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            clearResults.push(`✓ LocalStorage: ${localStorageKeys.length} 项`);
            console.log(`[清除网站数据] 已清理 LocalStorage:`, localStorageKeys);

            // 4. 清理所有 SessionStorage
            const sessionStorageKeys = Object.keys(sessionStorage);
            sessionStorageKeys.forEach(key => {
                sessionStorage.removeItem(key);
            });
            clearResults.push(`✓ SessionStorage: ${sessionStorageKeys.length} 项`);
            console.log(`[清除网站数据] 已清理 SessionStorage:`, sessionStorageKeys);

            // 5. 注销所有 Service Workers
            if ("serviceWorker" in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
                clearResults.push(`✓ Service Workers: ${registrations.length} 个`);
                console.log(`[清除网站数据] 已注销 ${registrations.length} 个 Service Worker`);
            }

            // 6. 清理 Cookie（同域）
            const cookies = document.cookie.split(";");
            cookies.forEach(cookie => {
                const [name] = cookie.split("=");
                const trimmedName = name?.trim();
                if (trimmedName) {
                    // 设置过期时间为过去，删除 cookie
                    document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                }
            });
            clearResults.push(`✓ Cookies: ${cookies.length} 个`);
            console.log(`[清除网站数据] 已清理 Cookies:`, cookies.length);

            // 7. 清理应用特定数据
            setCacheSize("0 KB");
            setCacheStatusList([]);
            setReportTemplates([]);
            setCustomUrls([]);
            setOfflineReports([]);

            // 8. 显示结果
            alert(`✅ 网站数据清除完成！\n\n${clearResults.join('\n')}\n\n页面将在 2 秒后重新加载...`);

            // 延迟后重新加载页面
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);

        } catch (error) {
            console.error("[清除网站数据] 失败:", error);
            alert(`❌ 清除网站数据时出现错误:\n${error instanceof Error ? error.message : String(error)}\n\n请手动清除浏览器数据或联系管理员。`);
        }
    };
    const saveCustomUrls = (urls: CustomUrlConfig[]) => {
        setCustomUrls(urls)
        localStorage.setItem("customPrecacheUrls", JSON.stringify(urls))
    }

    const handleAddCustomUrl = () => {
        if (!newUrlPattern.trim()) return

        const newUrl: CustomUrlConfig = {
            id: Date.now().toString(),
            urlPattern: newUrlPattern.trim(),
            description: newUrlDescription.trim() || newUrlPattern.trim(),
            enabled: true,
        }

        const updatedUrls = [...customUrls, newUrl]
        saveCustomUrls(updatedUrls)
        setNewUrlPattern("")
        setNewUrlDescription("")
        setShowCustomUrlForm(false)
    }

    const handleRemoveCustomUrl = (id: string) => {
        const updatedUrls = customUrls.filter((url) => url.id !== id)
        saveCustomUrls(updatedUrls)
    }

    const handleToggleCustomUrl = (id: string) => {
        const updatedUrls = customUrls.map((url) => (url.id === id ? { ...url, enabled: !url.enabled } : url))
        saveCustomUrls(updatedUrls)
    }

    const importTemplateUrls = async (templateId: string, version: string): Promise<string[]> => {
        try {
            const templateModule: TemplateConfig = await import(`../../rep/[repId]/${templateId}/${version}/config`)
            return templateModule.cacheUrls || []
        } catch (error) {
            console.warn(`[v0] Failed to import cacheUrls from template ${templateId}/${version}:`, error)
            return []
        }
    }
    const calculateCacheSize = async () => {
        if (!("caches" in window)) return "0 KB"

        setIsCalculatingCache(true)
        try {
            const cacheNames = await caches.keys()
            let totalSize = 0

            // 只处理 serwist-precache- 开头的缓存
            const serwistPrecacheCaches = cacheNames.filter(name =>
                name.startsWith('serwist-precache-')
            )

            console.log(`找到 ${serwistPrecacheCaches.length} 个 serwist-precache 缓存:`, serwistPrecacheCaches)

            for (const cacheName of serwistPrecacheCaches) {
                const cache = await caches.open(cacheName)
                const requests = await cache.keys()

                console.log(`缓存 ${cacheName} 中有 ${requests.length} 个请求`)

                for (const request of requests) {
                    const response = await cache.match(request)
                    if (response) {
                        // 尝试获取Content-Length头信息
                        const contentLength = response.headers.get("content-length")
                        if (contentLength) {
                            totalSize += Number.parseInt(contentLength, 10)
                        } else {
                            // 如果没有Content-Length头，则读取整个响应体来计算大小
                            const blob = await response.blob()
                            totalSize += blob.size
                        }
                    }
                }
            }

            // 格式化大小显示
            let formattedSize
            if (totalSize < 1024) {
                formattedSize = `${totalSize} B`
            } else if (totalSize < 1024 * 1024) {
                formattedSize = `${(totalSize / 1024).toFixed(2)} KB`
            } else {
                formattedSize = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
            }

            console.log(`serwist-precache 缓存总大小: ${formattedSize}`)
            setCacheSize(formattedSize)
            return formattedSize
        } catch (error) {
            console.error("计算缓存大小失败:", error)
            setCacheSize("计算失败")
            return "计算失败"
        } finally {
            setIsCalculatingCache(false)
        }
    }
    useEffect(() => {
        calculateCacheSize()

        // 可以定期更新缓存大小
        const interval = setInterval(() => {
            calculateCacheSize()
        }, 30000) // 每30秒更新一次

        // 页面卸载时重置预缓存操作标志
        const handleBeforeUnload = () => {
            if (currentPrecacheOperationRef.current) {
                console.log(`[PWA] 页面即将卸载，取消进行中的预缓存操作 (ID: ${precacheTriggerTimeRef.current})`);
                currentPrecacheOperationRef.current = false;
                precacheTriggerTimeRef.current = null;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [])
    const handlePrecacheSuccess = () => {
        setTimeout(() => {
            calculateCacheSize()
        }, 100) //延迟后更新，确保缓存操作完成
    }
    const cleanupOldCacheTimes = () => {
        try {
            const cacheTimeData = getCacheTimeData()
            const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000 // 60天的毫秒数

            let hasChanges = false

            // 遍历所有缓存时间记录
            for (const [key, timestamp] of Object.entries(cacheTimeData)) {
                if (timestamp < twoMonthsAgo) {
                    delete cacheTimeData[key]
                    hasChanges = true
                    console.log(`移除过期缓存记录: ${key}, 时间: ${new Date(timestamp).toLocaleString()}`)
                }
            }

            // 如果有变更，保存回localStorage
            if (hasChanges) {
                setCacheTimeData(cacheTimeData)
                console.log("已清理过期的缓存时间记录")
            }
        } catch (error) {
            console.error("清理旧缓存时间记录时出错:", error)
        }
    }
    const handlePrecacheReports = async (templatesToCache = reportTemplates, includeCustomUrls = true) => {
        if (!("serviceWorker" in navigator)) {
            setPrecacheStatus("error")
            setPrecacheMessage("Service Worker 不支持")
            return
        }

        // 改进：检查 SW 是否激活，允许手动重试
        if (!navigator.serviceWorker.controller) {
            // 给用户一个提示，而不是直接返回错误
            console.warn("[PWA] Service Worker 未激活，但允许继续尝试")
            // 不立即返回，让用户可以通过点击"重新预缓存"来重试
            // setPrecacheStatus("error")
            // setPrecacheMessage("Service Worker 未激活，请刷新页面重试")
            // return
        }

        const basePath = "/report"  // 从 .env 读取 NEXT_PUBLIC_BASE_PATH
        const urlsToCache = []

        for (const template of templatesToCache) {
            try {
                const templateUrls = await importTemplateUrls(template.templateId, template.version)

                // 将通配符 URL 替换为实际的 repId URL，并添加 basePath 前缀
                // 例如：/rep/*/SLIDING_JJ/1 -> /report/rep/HAAAA.../SLIDING_JJ/1
                const actualUrls = []
                for (const url of templateUrls) {
                    if (url.includes('/rep/*/')) {
                        // 1. 首先添加通配符 URL 本身（用于规范化缓存）
                        const wildcardUrlWithBasePath = url.startsWith(basePath) ? url : `${basePath}${url}`
                        actualUrls.push(wildcardUrlWithBasePath)

                        // 2. 然后只使用与当前模板类型匹配的 repId 替换通配符
                        const matchingReports = offlineReports.filter(report => {
                            // 报告的 templateId 与当前预缓存的模板匹配
                            return report.templateId === template.templateId
                        })
                        for (const report of matchingReports) {
                            const actualUrl = url.replace('/rep/*/', `/rep/${report.repId}/`)
                            // 添加 basePath 前缀（如果还没有）
                            const urlWithBasePath = actualUrl.startsWith(basePath) ? actualUrl : `${basePath}${actualUrl}`
                            actualUrls.push(urlWithBasePath)
                        }
                    } else {
                        // 添加 basePath 前缀（如果还没有）
                        const urlWithBasePath = url.startsWith(basePath) ? url : `${basePath}${url}`
                        actualUrls.push(urlWithBasePath)
                    }
                }
                urlsToCache.push(...actualUrls)
            } catch (error) {
                console.error(`[v0] Error importing URLs for template ${template.templateId}/${template.version}:`, error)
            }
        }

        if (includeCustomUrls) {
            customUrls
                .filter((url) => url.enabled)
                .forEach((urlItem) => {
                    const url = urlItem.urlPattern
                    // 添加 basePath 前缀（如果还没有）
                    const urlWithBasePath = url.startsWith(basePath) ? url : `${basePath}${url}`
                    urlsToCache.push(urlWithBasePath)
                })
        }

        setPrecacheStatus("loading")
        setPrecacheMessage("正在预缓存页面...")
        setPrecacheProgress({ completed: 0, total: urlsToCache.length, currentItem: "" })
        setPrecacheResults([])
        setFailedItems([])

        // 改进：检查 SW 激活状态并给出更详细的提示
        if (!navigator.serviceWorker.controller) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            if (registrations.length === 0) {
                setPrecacheStatus("error")
                setPrecacheMessage("Service Worker 未注册，请等待页面右下角的状态提示")
                return
            } else {
                setPrecacheStatus("error")
                setPrecacheMessage("Service Worker 已注册但未激活，请点击右下角'刷新'按钮")
                return
            }
        }

        // 替换原有的 navigator.serviceWorker.controller.postMessage 调用部分
        try {
            // 防止重复触发
            if (currentPrecacheOperationRef.current) {
                console.warn(`[PWA] 检测到正在进行的预缓存操作，取消本次请求`);
                setPrecacheStatus("error");
                setPrecacheMessage("请等待当前预缓存操作完成");
                return;
            }

            // 标记预缓存操作开始
            currentPrecacheOperationRef.current = true;
            precacheTriggerTimeRef.current = Date.now();

            console.log(`[PWA] 准备发送 CACHE_URLS 消息，URLs 数量: ${urlsToCache.length}`);
            console.log(`[PWA] 发送时间: ${new Date().toISOString()}`);
            console.log(`[PWA] 当前页面路径: ${window.location.pathname}`);
            console.log(`[PWA] 操作 ID: ${precacheTriggerTimeRef.current}`);
            console.log(`[PWA] 要缓存的 URLs:`, urlsToCache);
            
            // 创建一个 MessageChannel 来建立双向通信
            const channel = new MessageChannel()

            // 监听来自 Service Worker 的回应
            channel.port1.onmessage = (event) => {
                // 清除超时定时器
                clearTimeout(timeoutId)

                if (event.data === true) {
                    console.log("URLs 缓存成功！")
                    // 在这里更新 UI，例如设置成功状态、隐藏加载指示器等
                    setPrecacheStatus("success")
                    setPrecacheMessage(`成功预缓存 ${urlsToCache.length} 个项目`)

                    const cacheVersion = currentBuildVersion || Date.now().toString()

                    templatesToCache.forEach((template) => {
                        setCacheTime(template.templateId, template.version, cacheVersion)
                    })
                    cleanupOldCacheTimes()
                    handlePrecacheSuccess()
                    setTimeout(async () => {
                        await checkCacheStatus()
                    }, 100)
                    // 预缓存成功，清除重置提示
                    clearResetNeeded()
                } else {
                    console.error("缓存过程中可能发生了问题，部分url失败。")
                    setPrecacheStatus("error")
                    setPrecacheMessage("预缓存完成，但可能存在部分失败")
                    // 触发重置提示
                    triggerResetNeeded("预缓存部分失败，可能是缓存系统不稳定", 'warning')
                }
                // 关闭端口
                channel.port1.close()
                // 重置预缓存操作标志
                currentPrecacheOperationRef.current = false
                precacheTriggerTimeRef.current = null
            }

            // 处理消息错误
            channel.port1.onmessageerror = (error) => {
                console.error("接收消息出错:", error)
                setPrecacheStatus("error")
                setPrecacheMessage("通信错误")
                channel.port1.close()
                // 重置预缓存操作标志
                currentPrecacheOperationRef.current = false
                precacheTriggerTimeRef.current = null
                // 触发重置提示
                triggerResetNeeded("预缓存通信错误，可能是Service Worker状态异常", 'critical')
            }

            // 设置超时处理
            const timeoutId = setTimeout(() => {
                console.error("[PWA] 预缓存操作超时")
                setPrecacheStatus("error")
                setPrecacheMessage("预缓存超时，请检查网络连接或尝试完全重置")
                channel.port1.close()
                currentPrecacheOperationRef.current = false
                precacheTriggerTimeRef.current = null
                triggerResetNeeded("预缓存操作超时，可能是缓存系统响应异常", 'warning')
            }, 5 * 60 * 1000) // 5分钟超时

            // 发送消息到 Service Worker，并转移 MessageChannel 的 port2
            navigator.serviceWorker.controller.postMessage(
                {
                    type: "CACHE_URLS",
                    payload: { urlsToCache },
                },
                [channel.port2],
            ) // 将 port2 转移给 Service Worker
        } catch (error) {
            setPrecacheStatus("error")
            const errorMessage = error instanceof Error ? error.message : "未知错误"
            setPrecacheMessage(`预缓存失败: ${errorMessage}`)
            // 重置预缓存操作标志
            currentPrecacheOperationRef.current = false
            precacheTriggerTimeRef.current = null
            // 触发重置提示
            triggerResetNeeded(`预缓存失败: ${errorMessage}，可能是缓存系统异常`, 'critical')
        }
    }

    // 更新单个模板的缓存
    const handleUpdateSingleTemplate = async (templateId: string, version: string) => {
        const template = { templateId, version }
        await handlePrecacheReports([template], false)
        setTimeout(async () => {
            await checkCacheStatus()
        }, 500)
    }

    // 更新所有模板的缓存
    const handleUpdateAllTemplates = async () => {
        await handlePrecacheReports(reportTemplates, false)
        setTimeout(async () => {
            await checkCacheStatus()
        }, 500)
    }

    const handleRetryFailed = () => {
        const failedTemplates = failedItems.map((item) => item.template)
        handlePrecacheReports(failedTemplates)
    }

    const getCacheTimeData = (): Record<string, string> => {
        const cacheTimeStr = localStorage.getItem("cache-time")
        return cacheTimeStr ? JSON.parse(cacheTimeStr) : {}
    }

    const setCacheTimeData = (data: Record<string, string>) => {
        localStorage.setItem("cache-time", JSON.stringify(data))
    }

    const getCacheTime = (templateId: string, version: string): string => {
        const cacheData = getCacheTimeData()
        return cacheData[`${templateId}-${version}`] || ""
    }

    const setCacheTime = (templateId: string, version: string, buildVersion: string) => {
        const cacheData = getCacheTimeData()
        cacheData[`${templateId}-${version}`] = buildVersion
        setCacheTimeData(cacheData)
    }

    const handleAutoWarmup = async () => {
        await handlePrecacheReports()
    }

    const needsUpdate = (templateId: string, version: string): boolean => {
        if (!currentBuildVersion) return false
        const cachedVersion = getCacheTime(templateId, version)
        if (!cachedVersion) return true // 从未缓存
        return cachedVersion !== currentBuildVersion // 版本不匹配
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">

            <Button asChild variant="outline" size="sm" className="absolute top-4 right-4 bg-transparent">
                <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                </Link>
            </Button>
            <div className="max-w-7xl mx-auto mb-24">
                <header className="text-center py-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">离线报告编制保障</h1>
                </header>
                <div className="bg-white rounded-lg shadow-md p-1 mb-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">离线报告状态</h2>
                        {offlineReports.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm("确定要清空所有离线报告列表吗？这将移除所有已添加的离线报告。")) {
                                        // 清空状态
                                        setOfflineReports([]);
                                        // 清空 localStorage
                                        localStorage.removeItem("offline-reports");
                                        // 同时清空相关状态
                                        setReportTemplates([]);
                                        setCacheStatusList([]);
                                        setReportQueries([]);
                                        console.log("[v0] 已清空离线报告列表");
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                清空列表
                            </button>
                        )}
                    </div>

                    {offlineReports.length === 0 ? (
                        <div className="text-center py-1 text-gray-500">
                            <p>暂无等待编制的报告。</p>
                            <p className="text-sm mt-2">请在其他页面选择报告添加到离线列表，</p>
                            <p className="text-red-500">报告添加完毕后，务必回到这里更新缓存，确保离线编制报告能力。</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                                {offlineReports.map((report, index) => (
                                    <div key={report.repId} className="bg-gray-50 rounded-lg p-1">
                                        <div className="text-sm text-gray-900">报告ID: {report.repId}</div>
                                        {report.modeltype && (
                                            <div className="text-sm text-blue-800">
                                                模板: {report.modeltype} v{report.modelversion}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="text-sm text-gray-600">
                                共 {offlineReports.length} 个离线报告，对应于 {reportTemplates.length} 个模板需缓存。
                            </div>
                        </div>
                    )}
                </div>
                {cacheStatusList.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-1 mb-1">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-semibold text-gray-900">模板缓存管理</h2>
                            <button
                                onClick={handleUpdateAllTemplates}
                                disabled={!isNextJSServerReachable}
                                className={`px-4 py-1 rounded-lg transition-colors text-sm ${
                                    isNextJSServerReachable
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                更新所有模板
                            </button>
                        </div>

                        <div className="space-y-1">
                            {cacheStatusList.map((status, index) => {
                                const needUpdate = needsUpdate(status.templateId, status.version)
                                const cachedVersion = getCacheTime(status.templateId, status.version)

                                return (
                                    <div
                                        key={`${status.templateId}-${status.version}`}
                                        className="flex items-center justify-between p-1 rounded-lg border bg-gray-50 border-gray-200"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {status.templateId} v{status.version}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {cachedVersion ? (
                                                    <>
                                                        缓存版本: {formatVersionTime(cachedVersion)}
                                                    </>
                                                ) : (
                                                    "从未缓存"
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`px-3 py-1 rounded text-sm ${
                                                    cachedVersion && !needUpdate
                                                        ? "bg-green-100 text-green-800"
                                                        : needUpdate
                                                            ? "bg-orange-100 text-orange-800"
                                                            : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {cachedVersion && !needUpdate ? "已是最新" : needUpdate ? "需要更新" : "未缓存"}
                                            </div>
                                            <button
                                                onClick={() => handleUpdateSingleTemplate(status.templateId, status.version)}
                                                disabled={!isNextJSServerReachable}
                                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                                    isNextJSServerReachable
                                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                            >
                                                更新
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-1 mb-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">离线预缓存</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">基础缓存大小:</span>
                            <span className="text-base font-semibold text-blue-600">
                {isCalculatingCache ? "计算中..." : cacheSize}
              </span>
                            <button
                                onClick={calculateCacheSize}
                                disabled={isCalculatingCache}
                                className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
                                title="刷新缓存大小"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 修改自定义URL部分为可折叠 */}
                    <div className="mb-6 bg-gray-50 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center justify-between p-1 cursor-pointer"
                            onClick={() => setShowCustomUrlSection(!showCustomUrlSection)}
                        >
                            <h3 className="text-base font-medium text-gray-900">自定义预缓存 URL</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowCustomUrlForm(!showCustomUrlForm)
                                    }}
                                    className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mr-2"
                                >
                                    {showCustomUrlForm ? "取消添加" : "添加 URL"}
                                </button>
                                <svg
                                    className={`w-5 h-5 transform transition-transform ${showCustomUrlSection ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {showCustomUrlSection && (
                            <div className="p-4 border-t border-gray-200">
                                {showCustomUrlForm && (
                                    <div className="mb-4 p-4 bg-white rounded-lg border">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">URL 模式 *</label>
                                                <input
                                                    type="text"
                                                    value={newUrlPattern}
                                                    onChange={(e) => setNewUrlPattern(e.target.value)}
                                                    placeholder="/rep/sample/CUSTOM_RPT/1/ALL"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                                                <input
                                                    type="text"
                                                    value={newUrlDescription}
                                                    onChange={(e) => setNewUrlDescription(e.target.value)}
                                                    placeholder="自定义报告模板"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setShowCustomUrlForm(false)}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                onClick={handleAddCustomUrl}
                                                disabled={!newUrlPattern.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                添加
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {customUrls.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-700">已配置的自定义 URL:</h4>
                                        {customUrls.map((url) => (
                                            <div key={url.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={url.enabled}
                                                        onChange={() => handleToggleCustomUrl(url.id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{url.description}</div>
                                                        <div className="text-sm text-gray-500">{url.urlPattern}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCustomUrl(url.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>提示:</strong> 您可以添加任何想要预缓存的 URL 模式。例如：
                                    </p>
                                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                        <li>
                                            • <code>/rep/sample/CUSTOM_RPT/1/ALL</code> - 特定报告模板
                                        </li>
                                        <li>
                                            • <code>/dashboard</code> - 仪表板页面
                                        </li>
                                        <li>
                                            • <code>/settings</code> - 设置页面
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={() => handlePrecacheReports()}
                            disabled={precacheStatus === "loading" || reportTemplates.length === 0 || !isNextJSServerReachable}
                            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                                precacheStatus === "loading" || reportTemplates.length === 0 || !isNextJSServerReachable
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {precacheStatus === "loading" ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>预缓存中...</span>
                                </div>
                            ) : (
                                `重新预缓存 (${reportTemplates.length + customUrls.filter((u) => u.enabled).length} 项)`
                            )}
                        </button>
                        {/* 清除网站数据按钮 */}
                        <button
                            onClick={handleClearSiteData}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            title="清除所有网站数据（类似 Chrome DevTools 的清除网站数据）"
                        >
                            🗑️ 清除网站数据
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        {reportTemplates.length === 0 && (
                            <div className="text-sm text-amber-600">请先在其他页面添加报告到离线列表</div>
                        )}

                        {failedItems.length > 0 && precacheStatus !== "loading" && (
                            <button
                                onClick={handleRetryFailed}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                重试失败项 ({failedItems.length})
                            </button>
                        )}
                        {precacheMessage && (
                            <div
                                className={`flex items-center space-x-2 px-1 py-1 rounded-lg ${
                                    precacheStatus === "success"
                                        ? "bg-green-100 text-green-800"
                                        : precacheStatus === "error"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {precacheStatus === "success" && (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ height: "2rem" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {precacheStatus === "error" && (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ height: "2rem" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                <span className="text-sm">{precacheMessage}</span>
                            </div>
                        )}
                    </div>

                    {precacheStatus === "loading" && precacheProgress.total > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  进度: {precacheProgress.completed}/{precacheProgress.total}
                </span>
                                <span>{Math.round((precacheProgress.completed / precacheProgress.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(precacheProgress.completed / precacheProgress.total) * 100}%` }}
                                ></div>
                            </div>
                            {precacheProgress.currentItem && (
                                <div className="text-xs text-gray-500 mt-2 truncate">当前: {precacheProgress.currentItem}</div>
                            )}
                        </div>
                    )}

                    {precacheResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">预缓存结果</h3>
                            <div className="space-y-2">
                                {precacheResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${
                                            result.pageSuccess && result.rscSuccess
                                                ? "bg-green-50 border-green-200"
                                                : "bg-red-50 border-red-200"
                                        }`}
                                    >
                                        <div className="font-medium">
                                            {result.template.templateId} v{result.template.version}
                                        </div>
                                        <div className="text-sm mt-1">
                                            <div className="flex items-center space-x-2">
                                                <span>页面:</span>
                                                {result.pageSuccess ? (
                                                    <span className="text-green-600 flex items-center">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            成功
                          </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            失败: {result.pageError}
                          </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span>数据:</span>
                                                {result.rscSuccess ? (
                                                    <span className="text-green-600 flex items-center">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            成功
                          </span>
                                                ) : (
                                                    <span className="text-red-600 flex items-center">
                            <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            失败: {result.rscError}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* 缓存健康警告提示 - 固定在顶部 */}
                    {needsCompleteReset && (
                        <div className={`fixed top-0 left-0 right-0 z-50 rounded-b-lg p-4 shadow-lg ${cacheHealthStatus === 'critical' ? 'bg-red-50 border-b-2 border-red-200' : 'bg-amber-50 border-b-2 border-amber-200'}`}>
                            <div className="flex items-start space-x-3 max-w-7xl mx-auto">
                                <svg 
                                    className={`w-5 h-5 mt-0.5 ${cacheHealthStatus === 'critical' ? 'text-red-600' : 'text-amber-600'}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                                    />
                                </svg>
                                <div className="flex-1">
                                    <h3 className={`text-sm font-medium ${cacheHealthStatus === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
                                        {cacheHealthStatus === 'critical' ? '检测到严重的缓存异常' : '检测到缓存异常'}
                                    </h3>
                                    <p className={`text-sm mt-1 ${cacheHealthStatus === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                                        {resetReason}
                                    </p>
                                    <div className="mt-3 flex items-center space-x-3">
                                        <button
                                            onClick={handleCompleteReset}
                                            disabled={!isNextJSServerReachable}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isNextJSServerReachable
                                                    ? cacheHealthStatus === 'critical' 
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-amber-600 text-white hover:bg-amber-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            立即完全重置
                                        </button>
                                        <button
                                            onClick={() => clearResetNeeded()}
                                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            暂时忽略
                                        </button>
                                    </div>
                                    <p className={`text-xs mt-2 ${cacheHealthStatus === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                        提示：完全重置将清理所有缓存并重新注册 Service Worker，重置后需要重新点击"重新预缓存"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 mb-32 bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">注意事项！</h2>
                        <p>为了避免离线编辑报告出现无法访问的问题:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            {swError && (
                                <li className="text-orange-700 font-medium">
                                    ⚠️ {swError}
                                </li>
                            )}
                            {pwaCertStatus === 'pending' && (
                                <li className="text-orange-700 font-medium">
                                    ⚠️ PWA 待启用：使用 IP 地址访问需要手动信任 SSL 证书。
                                    <button
                                        onClick={() => {
                                            const certWindow = window.open('', 'PWA 证书说明', 'width=800,height=600,scrollbars=yes')
                                            if (certWindow) {
                                                certWindow.document.write(`
                                                    <html>
                                                    <head>
                                                        <title>PWA 证书信任说明</title>
                                                        <style>
                                                            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                                                            h1 { color: #333; }
                                                            .step { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                                                            .note { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }
                                                            code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <h1>如何信任 SSL 证书以启用 PWA 功能</h1>
                                                        <div class="note">
                                                            <strong>注意：</strong> 由于您使用 IP 地址（${window.location.hostname}）访问此应用，浏览器不会自动信任自签名证书。您需要手动导入并信任证书。
                                                        </div>
                                                        <h2>步骤 1: 下载证书</h2>
                                                        <div class="step">
                                                            <p>请访问服务器并下载 SSL 证书文件（通常是 <code>.crt</code> 或 <code>.pem</code> 格式）</p>
                                                            <p>如果证书在服务器上，可以通过以下命令下载：</p>
                                                            <pre><code># 示例：从服务器下载证书
scp user@server:/path/to/certificate.crt ./</code></pre>
                                                        </div>
                                                        <h2>步骤 2: 导入证书（Windows）</h2>
                                                        <div class="step">
                                                            <ol>
                                                                <li>双击下载的证书文件</li>
                                                                <li>选择"安装证书"</li>
                                                                <li>选择"本地计算机"，点击下一步</li>
                                                                <li>选择"将所有的证书放入下列存储"</li>
                                                                <li>点击"浏览"，选择"受信任的根证书颁发机构"</li>
                                                                <li>点击"确定"，然后完成安装</li>
                                                            </ol>
                                                        </div>
                                                        <h2>步骤 3: 验证证书信任</h2>
                                                        <div class="step">
                                                            <ol>
                                                                <li>关闭此说明窗口</li>
                                                                <li>在浏览器中访问 <code>${window.location.href}</code></li>
                                                                <li>确认地址栏不再显示"不安全"警告</li>
                                                                <li>刷新页面，PWA 功能应该正常工作</li>
                                                            </ol>
                                                        </div>
                                                        <h2>步骤 4: 确认信任</h2>
                                                        <div class="step">
                                                            <p>如果证书已正确导入，点击下方按钮确认：</p>
                                                            <button onclick="
                                                                window.opener.postMessage({ type: 'CERT_TRUSTED' }, '*');
                                                                window.close();
                                                                alert('已确认，请刷新主页面');
                                                            " style="
                                                                background: #4CAF50; color: white; padding: 10px 20px;
                                                                border: none; border-radius: 5px; cursor: pointer;
                                                                font-size: 16px;
                                                            ">
                                                                我已信任证书，启用 PWA
                                                            </button>
                                                        </div>
                                                        <h2>替代方案：使用域名访问</h2>
                                                        <div class="step">
                                                            <p>如果不想手动导入证书，建议配置域名并使用受信任的 SSL 证书：</p>
                                                            <ul>
                                                                <li>配置 DNS 解析</li>
                                                                <li>使用 Let's Encrypt 免费证书</li>
                                                                <li>或购买商业 SSL 证书</li>
                                                            </ul>
                                                        </div>
                                                        <p style="margin-top: 20px; color: #666;">
                                                            如有疑问，请联系系统管理员。
                                                        </p>
                                                    </body>
                                                    </html>
                                                `)
                                            }
                                        }}
                                        className="ml-2 text-xs bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded transition-colors"
                                    >
                                        查看证书说明
                                    </button>
                                </li>
                            )}
                            <li>为了避免代码不一致，通常请直接重新预缓存，更新全部模板，而不是在模板列表点击对应的"更新"按钮。</li>
                            <li>如果基础缓存的大小出现异常（最新基础缓存大约<strong> {(CACHE_HEALTH_CONFIG.expectedSize / (1024 * 1024)).toFixed(2)} MB</strong>的），那么必须做个彻底地更新，请点下方"完全重置"，然后再点"重新预缓存"。</li>
                            <li>若基础缓存大小是异常的，点击"完全重置"按钮都没反应的情况，请关闭浏览器然后重启再试；若真的无法恢复正常的才需考虑点击“清除网站数据”按钮并重启。</li>
                        </ul>
                    </div>
                </div>

                {/* 底部按钮区域 */}
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-2 sm:p-3">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        <div className="flex space-x-2 w-full justify-center sm:justify-start">
                            <button
                                onClick={handleCompleteReset}
                                disabled={!isNextJSServerReachable}
                                className={`px-3 py-1.5 rounded transition-colors text-xs sm:text-sm ${
                                    isNextJSServerReachable
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                完全重置
                            </button>
                            <button
                                onClick={handleHardRefresh}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                            >
                                刷新
                            </button>
                            <button
                                onClick={() => {
                                    if (currentBuildVersion) {
                                        localStorage.setItem("last-cache-warmup", currentBuildVersion);
                                        alert(`已确认升级到版本 ${formatVersionTime(currentBuildVersion)}，不再提醒`);
                                    } else {
                                        alert("无法获取当前版本信息");
                                    }
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs sm:text-sm"
                            >
                                升级确认
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}
