"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useQuery, gql } from "@urql/next"

const ReportQuery = gql`
  query pagegetReportQuery($id: ID!) {
    getReport(id: $id) {
      id
      modeltype
      modelversion
    }
  }
`

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
    changeTime: number // Added changeTime for template update tracking
}

interface CacheStatus {
    templateId: string
    version: string
    needsUpdate: boolean
    lastCacheTime?: number
    templateChangeTime?: number
}

export default function Page() {
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
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(true)
    const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)

    const [customUrls, setCustomUrls] = useState<CustomUrlConfig[]>([])
    const [newUrlPattern, setNewUrlPattern] = useState("")
    const [newUrlDescription, setNewUrlDescription] = useState("")
    const [showCustomUrlForm, setShowCustomUrlForm] = useState(false)

    const [offlineReports, setOfflineReports] = useState<OfflineReport[]>([])
    const [reportTemplates, setReportTemplates] = useState<{ templateId: string; version: string }[]>([])
    const [cacheStatusList, setCacheStatusList] = useState<CacheStatus[]>([])
    const [autoUpdateAvailable, setAutoUpdateAvailable] = useState(false)

    const offlineReportIds = offlineReports.map((report) => report.repId)
    const [reportResults] = useQuery({
        query: ReportQuery,
        variables: { id: offlineReportIds[0] || "" },
        pause: offlineReportIds.length === 0,
    })
    const {getReport :repdata }=reportResults?.data||{}

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
    }, [setOfflineReports])

    useEffect(() => {
        const queryReportsData = async () => {
            if (offlineReports.length === 0) return

            const templates: { templateId: string; version: string }[] = []
            const updatedReports: OfflineReport[] = []

            for (const report of offlineReports) {
                try {
                    // In a real implementation, you would query each report individually
                    const newModeltype =repdata.modeltype
                    const newModelversion =repdata.modelversion

                    updatedReports.push({
                        ...report,
                        modeltype: newModeltype,
                        modelversion: newModelversion,
                    })

                    templates.push({
                        templateId: newModeltype,
                        version: newModelversion,
                    })
                } catch (error) {
                    console.error(`查询报告 ${report.repId} 失败:`, error)
                    updatedReports.push(report)
                }
            }

            setOfflineReports(updatedReports)
            setReportTemplates(templates)
            console.log("[v0] 更新报告模板列表:", templates)
        }

        queryReportsData()
    }, [offlineReports, repdata])

    useEffect(() => {
        const checkCacheStatus = async () => {
            if (reportTemplates.length === 0) return

            const statusList: CacheStatus[] = []
            let hasUpdates = false

            for (const template of reportTemplates) {
                try {
                    const templateModule: TemplateConfig = await import(
                        `../../rep/[repId]/${template.templateId}/${template.version}/config`
                        )

                    const cacheKey = `cache-time-${template.templateId}-${template.version}`
                    const lastCacheTime = localStorage.getItem(cacheKey)
                    const lastCacheTimestamp = lastCacheTime ? Number.parseInt(lastCacheTime) : 0

                    const needsUpdate = !lastCacheTime || lastCacheTimestamp < templateModule.changeTime

                    statusList.push({
                        templateId: template.templateId,
                        version: template.version,
                        needsUpdate,
                        lastCacheTime: lastCacheTimestamp || undefined,
                        templateChangeTime: templateModule.changeTime,
                    })

                    if (needsUpdate) {
                        hasUpdates = true
                    }
                } catch (error) {
                    console.warn(`检查模板 ${template.templateId}/${template.version} 状态失败:`, error)
                    statusList.push({
                        templateId: template.templateId,
                        version: template.version,
                        needsUpdate: true,
                    })
                    hasUpdates = true
                }
            }

            setCacheStatusList(statusList)
            setAutoUpdateAvailable(hasUpdates)

            if (hasUpdates) {
                console.log("[v0] 检测到模板更新，需要重新缓存")
            } else {
                console.log("[v0] 所有模板都是最新的")
            }
        }
        if(!autoUpdateAvailable)
            checkCacheStatus()
    }, [autoUpdateAvailable,reportTemplates])

    const handleRefreshPage = () => {
        window.location.reload()
    }

    const handleDismissError = () => {
        setSwError(null)
        setShowRefreshPrompt(false)
        setSwUpdateAvailable(false)
    }

    const handleClearCache = async () => {
        if ("caches" in window) {
            try {
                const cacheNames = await caches.keys()
                await Promise.all(cacheNames.map((name) => caches.delete(name)))
                setSwError("缓存已清理，正在刷新页面...")
                setTimeout(() => window.location.reload(), 1000)
            } catch (error) {
                console.error("清理缓存失败:", error)
                setSwError("清理缓存失败，请手动刷新页面")
            }
        }
    }

    const handleHardRefresh = () => {
        // 硬刷新页面，相当于 Ctrl+Shift+R
        window.location.reload()
    }

    const handleCloseTab = () => {
        // 尝试关闭当前标签页
        window.close()
        // 如果无法关闭，显示提示
        setTimeout(() => {
            alert("请手动关闭此标签页，然后重新打开应用")
        }, 100)
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
                // 这里可以添加更具体的 IndexedDB 清理逻辑
                console.log("[v0] 正在清理 IndexedDB...")
            }
            setSwError("系统已完全重置，正在重新加载...")
            setTimeout(() => {
                window.location.href = window.location.origin + window.location.pathname
            }, 1500)
        } catch (error) {
            console.error("完全重置失败:", error)
            setSwError("重置失败，请手动重启浏览器")
        }
    }

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
            return [
                `/rep/sample/${templateId}/${version}/ALL`,
                `/rep/sample/${templateId}/${version}/T607`,
                `/rep/sample/${templateId}/${version}/T608`,
            ]
        }
    }

    const handlePrecacheReports = async (templatesToCache = reportTemplates, includeCustomUrls = true) => {
        if (!("serviceWorker" in navigator)) {
            setPrecacheStatus("error")
            setPrecacheMessage("Service Worker 不支持")
            return
        }

        if (!navigator.serviceWorker.controller) {
            setPrecacheStatus("error")
            setPrecacheMessage("Service Worker 未激活，请刷新页面重试")
            return
        }

        const urlsToCache = []

        for (const template of templatesToCache) {
            try {
                const templateUrls = await importTemplateUrls(template.templateId, template.version)
                urlsToCache.push(...templateUrls)
            } catch (error) {
                console.error(`[v0] Error importing URLs for template ${template.templateId}/${template.version}:`, error)
                urlsToCache.push(`/rep/sample/${template.templateId}/${template.version}/ALL`)
                urlsToCache.push(`/rep/sample/${template.templateId}/${template.version}/T607`)
                urlsToCache.push(`/rep/sample/${template.templateId}/${template.version}/T608`)
            }
        }

        if (includeCustomUrls) {
            customUrls
                .filter((url) => url.enabled)
                .forEach((url) => {
                    urlsToCache.push(url.urlPattern)
                })
        }

        setPrecacheStatus("loading")
        setPrecacheMessage("正在预缓存页面...")
        setPrecacheProgress({ completed: 0, total: urlsToCache.length, currentItem: "" })
        setPrecacheResults([])
        setFailedItems([])

        try {
            navigator.serviceWorker.controller.postMessage({
                type: "CACHE_URLS",
                payload: { urlsToCache },
            })

            const handleMessage = (event: MessageEvent) => {
                const { type, ...data } = event.data

                if (type === "CACHE_URLS_PROGRESS") {
                    setPrecacheProgress({
                        completed: data.completed,
                        total: data.total,
                        currentItem: data.currentItem,
                    })
                    setPrecacheMessage(`正在缓存: ${data.currentItem} (${data.completed}/${data.total})`)
                } else if (type === "CACHE_URLS_COMPLETE") {
                    if (data.success) {
                        setPrecacheStatus("success")
                        setPrecacheMessage(`成功预缓存 ${data.successCount} 个项目`)

                        const currentTime = Date.now()
                        templatesToCache.forEach((template) => {
                            const cacheKey = `cache-time-${template.templateId}-${template.version}`
                            localStorage.setItem(cacheKey, currentTime.toString())
                        })

                        // Update cache status
                        setCacheStatusList((prev) =>
                            prev.map((status) => ({
                                ...status,
                                needsUpdate: false,
                                lastCacheTime: currentTime,
                            })),
                        )
                        setAutoUpdateAvailable(false)
                    } else {
                        setPrecacheStatus("error")
                        setPrecacheMessage(`预缓存完成，但有 ${data.failedCount} 个失败`)
                        setFailedItems(data.failedItems || [])
                    }
                    setPrecacheResults(data.results || [])
                    navigator.serviceWorker.removeEventListener("message", handleMessage)
                }
            }

            navigator.serviceWorker.addEventListener("message", handleMessage)
        } catch (error) {
            setPrecacheStatus("error")
            setPrecacheMessage(`预缓存失败: ${error instanceof Error ? error.message : "未知错误"}`)
        }
    }

    const handleAutoUpdate = async () => {
        const templatesToUpdate = cacheStatusList
            .filter((status) => status.needsUpdate)
            .map((status) => ({ templateId: status.templateId, version: status.version }))

        if (templatesToUpdate.length > 0) {
            await handlePrecacheReports(templatesToUpdate, false)
        }
    }

    const handleRetryFailed = () => {
        const failedTemplates = failedItems.map((item) => item.template)
        handlePrecacheReports(failedTemplates)
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {(swError || showRefreshPrompt || swUpdateAvailable) && (
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
                            <h3 className="text-sm font-medium text-orange-800">
                                {swUpdateAvailable ? "Service Worker 已更新" : "缓存系统提示"}
                            </h3>
                            <div className="mt-1 text-sm text-orange-700">
                                {swError ||
                                    (swUpdateAvailable ? "检测到新版本，建议刷新页面以获得最佳体验" : "建议刷新页面以重置缓存系统")}
                            </div>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleRefreshPage}
                                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                    >
                                        普通刷新
                                    </button>
                                    <button
                                        onClick={handleHardRefresh}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                                    >
                                        硬刷新
                                    </button>
                                    {swError?.includes("IndexedDB") || swError?.includes("缓存") ? (
                                        <button
                                            onClick={handleClearCache}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                        >
                                            清理缓存
                                        </button>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleCompleteReset}
                                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                                    >
                                        完全重置
                                    </button>
                                    <button
                                        onClick={handleCloseTab}
                                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                                    >
                                        关闭标签页
                                    </button>
                                    <button
                                        onClick={handleDismissError}
                                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                                    >
                                        稍后处理
                                    </button>
                                </div>
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                    <p className="font-medium">如果问题持续存在：</p>
                                    <p>1. 点击"完全重置"清理所有数据</p>
                                    <p>2. 手动重启浏览器（推荐）</p>
                                    <p>3. 清理浏览器数据：设置 → 隐私 → 清除浏览数据</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h1>等待检验的报告以及离线编制保障</h1>
            <div className="mt-10">
                <Link href="/">首页</Link>
            </div>
            <div className="max-w-4xl mx-auto">
                <header className="text-center py-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">报告离线编辑</h1>
                    <p className="text-xl text-gray-600 mb-8">Progressive Web App for Report Management</p>
                </header>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">离线报告状态</h2>

                    {offlineReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>暂无离线报告</p>
                            <p className="text-sm mt-2">请在其他页面选择报告添加到离线列表</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {offlineReports.map((report, index) => (
                                    <div key={report.repId} className="bg-gray-50 rounded-lg p-4">
                                        <div className="font-medium text-gray-900">报告 ID: {report.repId}</div>
                                        {report.modeltype && (
                                            <div className="text-sm text-gray-600">
                                                模板: {report.modeltype} v{report.modelversion}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="text-sm text-gray-600">
                                共 {offlineReports.length} 个离线报告，生成 {reportTemplates.length} 个模板配置
                            </div>
                        </div>
                    )}
                </div>

                {cacheStatusList.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">缓存状态检查</h2>

                        {autoUpdateAvailable && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-amber-800">检测到模板更新</h3>
                                        <p className="text-sm text-amber-700">
                                            有 {cacheStatusList.filter((s) => s.needsUpdate).length} 个模板需要更新缓存
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAutoUpdate}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        自动更新
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {cacheStatusList.map((status, index) => (
                                <div
                                    key={`${status.templateId}-${status.version}`}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                        status.needsUpdate ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                                    }`}
                                >
                                    <div>
                                        <div className="font-medium">
                                            {status.templateId} v{status.version}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {status.lastCacheTime ? (
                                                <>上次缓存: {new Date(status.lastCacheTime).toLocaleString()}</>
                                            ) : (
                                                "从未缓存"
                                            )}
                                            {status.templateChangeTime && (
                                                <> | 模板更新: {new Date(status.templateChangeTime).toLocaleString()}</>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded text-sm ${
                                            status.needsUpdate ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {status.needsUpdate ? "需要更新" : "已是最新"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!autoUpdateAvailable && cacheStatusList.length > 0 && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-medium">✓ 所有模板缓存都是最新的</p>
                                <p className="text-sm text-green-700">无需重新预缓存</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">查看报告</h3>
                        <p className="text-gray-600 mb-4">浏览和管理您的所有报告文档</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">创建报告</h3>
                        <p className="text-gray-600 mb-4">创建新的报告文档和分析</p>
                        <button className="text-green-600 hover:text-green-800 font-medium">开始创建 →</button>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ height: "2rem" }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">数据分析</h3>
                        <p className="text-gray-600 mb-4">深入分析报告数据和趋势</p>
                        <button className="text-purple-600 hover:text-purple-800 font-medium">查看分析 →</button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">PWA 功能</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ height: "2rem" }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">离线访问支持</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ height: "2rem" }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">智能缓存管理</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ height: "2rem" }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">快速加载体验</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ height: "2rem" }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">移动端优化</span>
                        </div>
                    </div>
                </div>

                {/* ... existing precache section with minimal changes ... */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">离线预缓存</h2>
                    <p className="text-gray-600 mb-6">
                        {offlineReports.length > 0
                            ? `基于您的 ${offlineReports.length} 个离线报告，预先缓存对应的报告模板和自定义页面。`
                            : "预先缓存常用的报告模板和自定义页面，确保在离线状态下也能快速访问。"}
                    </p>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">自定义预缓存 URL</h3>
                            <button
                                onClick={() => setShowCustomUrlForm(!showCustomUrlForm)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                {showCustomUrlForm ? "取消" : "添加 URL"}
                            </button>
                        </div>

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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                        <button
                            onClick={() => handlePrecacheReports()}
                            disabled={precacheStatus === "loading" || reportTemplates.length === 0}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
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
                                `我要开始预缓存 (${reportTemplates.length + customUrls.filter((u) => u.enabled).length} 项)`
                            )}
                        </button>

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
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
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
                                <p className="text-sm text-gray-500 mt-2">当前: {precacheProgress.currentItem}</p>
                            )}
                        </div>
                    )}

                    {precacheResults.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">缓存结果</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {precacheResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${
                                            result.pageSuccess && result.rscSuccess
                                                ? "bg-green-50 border-green-200"
                                                : "bg-red-50 border-red-200"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    result.pageSuccess && result.rscSuccess ? "bg-green-500" : "bg-red-500"
                                                }`}
                                            ></div>
                                            <span className="font-medium">
                        {result.template.templateId} v{result.template.version}
                      </span>
                                        </div>
                                        <div className="flex space-x-2 text-xs">
                      <span
                          className={`px-2 py-1 rounded ${result.pageSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        页面: {result.pageSuccess ? "✓" : "✗"}
                      </span>
                                            <span
                                                className={`px-2 py-1 rounded ${result.rscSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                            >
                        RSC: {result.rscSuccess ? "✓" : "✗"}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {failedItems.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-red-800 mb-3">失败项详情</h3>
                            <div className="space-y-3 max-h-40 overflow-y-auto">
                                {failedItems.map((item, index) => (
                                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="font-medium text-red-800 mb-1">
                                            {item.template.templateId} v{item.template.version}
                                        </div>
                                        {item.pageError && <div className="text-sm text-red-600">页面错误: {item.pageError}</div>}
                                        {item.rscError && <div className="text-sm text-red-600">RSC错误: {item.rscError}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-500">
                        <p>预缓存项目包括:</p>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium mb-2">基于离线报告的模板:</p>
                                <ul className="space-y-1">
                                    {reportTemplates.map((template, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span>
                        {template.templateId} v{template.version}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                                {reportTemplates.length === 0 && <p className="text-gray-400 italic">暂无模板</p>}
                            </div>
                            {customUrls.filter((u) => u.enabled).length > 0 && (
                                <div>
                                    <p className="font-medium mb-2">自定义 URL:</p>
                                    <ul className="space-y-1">
                                        {customUrls
                                            .filter((u) => u.enabled)
                                            .map((url) => (
                                                <li key={url.id} className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                    <span className="truncate">{url.description}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="text-center py-8 text-gray-500">
                    <p>© 2024 报告管理系统 - Powered by Next.js & Serwist PWA</p>
                </footer>
            </div>
        </main>
    )
}
