"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useClient } from "@urql/next"
import { ReportQuery } from "@/component/rep/report-data"
import { Button } from "@/components/ui"
import { Home } from "lucide-react"

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

/**需外部配合向localStorage("offline-reports")注入离线报告的id;
 * */
export default function Page() {
    const client = useClient()
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

    const [customUrls, setCustomUrls] = useState<CustomUrlConfig[]>([])
    const [newUrlPattern, setNewUrlPattern] = useState("")
    const [newUrlDescription, setNewUrlDescription] = useState("")
    const [showCustomUrlForm, setShowCustomUrlForm] = useState(false)

    const [offlineReports, setOfflineReports] = useState<OfflineReport[]>([])
    const [reportTemplates, setReportTemplates] = useState<{ templateId: string; version: string }[]>([])
    const [cacheStatusList, setCacheStatusList] = useState<CacheStatus[]>([])

    const [reportQueries, setReportQueries] = useState<any[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [cacheSize, setCacheSize] = useState<string>("0 KB")
    const [isCalculatingCache, setIsCalculatingCache] = useState(false)
    const [showCustomUrlSection, setShowCustomUrlSection] = useState(false)
    const [currentBuildVersion, setCurrentBuildVersion] = useState<string>("")

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
                    const offlineReportsList: OfflineReport[] = reports.map((repId) => ({ repId }))
                    setOfflineReports(offlineReportsList)
                    console.log("[v0] 加载离线报告列表:", offlineReportsList)
                }
            } catch (error) {
                console.error("加载离线报告列表失败:", error)
            }
        }

        loadOfflineReports()
    }, []) // 空依赖数组，只运行一次

    // 只有当 offlineReports 改变时才获取数据
    useEffect(() => {
        const fetchAllReports = async () => {
            if (offlineReports.length === 0) {
                setReportQueries([])
                return
            }

            setIsFetching(true)
            try {
                const queryResults = []
                for (const report of offlineReports) {
                    const repId = report.repId
                    if (!repId) {
                        queryResults.push(null)
                        continue
                    }
                    try {
                        const result = await client.query(ReportQuery, { id: repId }).toPromise()
                        queryResults.push(result)
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
    }, [offlineReports, client]) // 依赖于 offlineReports 和 client

    // 处理报告数据的 useEffect
    useEffect(() => {
        if (offlineReports.length === 0 || reportQueries.length === 0) return

        const templates: { templateId: string; version: string }[] = []
        const updatedReports: OfflineReport[] = []

        for (let i = 0; i < offlineReports.length; i++) {
            const report = offlineReports[i]
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
        if (hasNewData && !offlineReports.some((report) => report.modeltype)) {
            setOfflineReports(updatedReports)
            // 过滤重复项
            const tmplAllList = templates.filter(
                (status, index, self) =>
                    index === self.findIndex((s) => s.templateId === status.templateId && s.version === status.version),
            )
            setReportTemplates(tmplAllList)
            console.log("[v0] 更新报告数据:", updatedReports, "setReportTemplates?=", tmplAllList)
        }
    }, [reportQueries, offlineReports]) // 依赖于 reportQueries 和 offlineReports

    useEffect(() => {
        if (reportTemplates.length > 0) {
            checkCacheStatus()
        }
    }, [reportTemplates])
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
            // 4. 清理 IndexedDB
            if ("indexedDB" in window) {
                console.log("[v0] 正在清理 IndexedDB...")
            }

            if (currentBuildVersion) {
                localStorage.setItem("last-cache-warmup", currentBuildVersion)
                console.log("[v0] 已设置 last-cache-warmup:", currentBuildVersion)
            }

            setSwError("系统已完全重置，正在重新加载...")
            setTimeout(() => {
                window.location.reload()
            }, 1500)
            setCacheSize("0 KB")
        } catch (error) {
            console.error("完全重置失败:", error)
            setSwError("重置失败，请手动重启浏览器")
        }
    }
    const handleClearCacheData = async () => {
        if (!confirm("确定要清理所有缓存数据吗？这将删除页面缓存、IndexedDB数据和本地存储的缓存信息，需稍微等待才能真正地清空。")) {
            return;
        }

        try {
            // 1. 清理 Cache Storage 中所有 Serwist 相关的缓存
            if ("caches" in window) {
                const cacheNames = await caches.keys();
                const serwistCaches = cacheNames.filter(name =>
                    name.includes('serwist') ||
                    name.includes('pages') ||
                    name.includes('offline') ||
                    name.includes('next-chunks')||
                    name.includes('others')
                );

                await Promise.all(serwistCaches.map(name => caches.delete(name)));
                console.log(`已清理 ${serwistCaches.length} 个缓存`);
            }

            // 2. 清理 IndexedDB 中 Serwist 相关的数据库
            if ("indexedDB" in window) {
                const dbs = await window.indexedDB.databases();
                const serwistDBs = dbs.filter(db =>
                        db.name && (
                            db.name.includes('serwist') ||
                            db.name.includes('expiration')
                        )
                );

                for (const db of serwistDBs) {
                    if (db.name) {
                        window.indexedDB.deleteDatabase(db.name);
                        console.log(`已删除 IndexedDB: ${db.name}`);
                    }
                }
            }

            // 3. 清理 localStorage 中的缓存相关数据
            const itemsToRemove = [
                "cache-time",
                "last-cache-warmup"
            ];

            itemsToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`已清理 localStorage: ${key}`);
            });

            // 4. 更新状态
            setCacheSize("0 KB");
            setCacheStatusList([]);

            alert("缓存数据清理完成！");

            // 重新计算缓存大小
            setTimeout(() => {
                calculateCacheSize();
                checkCacheStatus();
            }, 500);

        } catch (error) {
            console.error("清理缓存数据失败:", error);
            alert("清理缓存数据时出现错误");
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

        return () => clearInterval(interval)
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
                        // 使用所有 offlineReports 中的 repId 替换通配符
                        for (const report of offlineReports) {
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
            // 创建一个 MessageChannel 来建立双向通信
            const channel = new MessageChannel()

            // 监听来自 Service Worker 的回应
            channel.port1.onmessage = (event) => {
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
                } else {
                    console.error("缓存过程中可能发生了问题，部分url失败。")
                    setPrecacheStatus("error")
                    setPrecacheMessage("预缓存完成，但可能存在部分失败")
                }
                // 关闭端口
                channel.port1.close()
            }

            // 处理消息错误
            channel.port1.onmessageerror = (error) => {
                console.error("接收消息出错:", error)
                setPrecacheStatus("error")
                setPrecacheMessage("通信错误")
                channel.port1.close()
            }

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
            setPrecacheMessage(`预缓存失败: ${error instanceof Error ? error.message : "未知错误"}`)
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
            {(swError) && (
                <div className="fixed top-4 right-4 max-w-md bg-white border-l-4 border-orange-500 rounded-lg shadow-lg p-4 z-50">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="mt-1 text-sm text-orange-700">{swError}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
                                                        缓存版本: {cachedVersion}
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
                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
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
                            disabled={precacheStatus === "loading" || reportTemplates.length === 0}
                            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                                precacheStatus === "loading" || reportTemplates.length === 0
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
                        {/* 新增清理缓存数据按钮 */}
                        <button
                            onClick={handleClearCacheData}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                            删除全部缓存
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
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">注意事项！</h2>
                        <p>为了避免离线编辑报告出现无法访问的问题:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>若您添加了新的报告编辑任务后，而且是新模板或新版本号的报告，请在模板列表点击对应的“更新”按钮。</li>
                            <li>如果基础缓存的大小出现异常（最新基础缓存大约<strong> 8.18 MB</strong>的），那么必须做个彻底地更新，请点下方“完全重置”，然后再点“重新预缓存”。</li>
                        </ul>
                    </div>
                </div>

                {/* 底部按钮区域 */}
                <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCompleteReset}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                完全重置
                            </button>
                            <button
                                onClick={handleHardRefresh}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                刷新
                            </button>
                            <button
                                onClick={() => {
                                    if (currentBuildVersion) {
                                        localStorage.setItem("last-cache-warmup", currentBuildVersion);
                                        alert(`已确认升级到版本 ${currentBuildVersion}，不再提醒`);
                                    } else {
                                        alert("无法获取当前版本信息");
                                    }
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
