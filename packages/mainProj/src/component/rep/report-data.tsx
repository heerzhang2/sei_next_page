"use client"

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useQuery, gql } from "@urql/next"
import { useStorage } from "@/report/StorageContext"
import Link from "next/link"
import { DirectLink } from "@/routing/Link"
import { useSearchParams, useRouter } from "next/navigation"
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
          svp
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
    const router = useRouter()
    const isPrintMode = searchParams?.get("print") === "1"

    useEffect(() => {
        setIsClient(true)
        setMounted(true)
    }, [])

    // 检查IndexedDB中是否有未清除的uppyState数据
    useEffect(() => {
        const checkUppyStates = async () => {
            try {
                const allGroups = await fileOperationsQueue.getGroupedUppyStates()
                
                // 只要repId一样，不管是主报告还是子报告有uppyState都认为需要警告
                const relatedGroups = allGroups.filter(
                    (group) => group.repId === repId
                )

                const hasAnyUppyStates = relatedGroups.some(group => group.count > 0)
                setHasUppyUnsavedStates(hasAnyUppyStates)
            } catch (error) {
                console.error("[ReportData] Failed to check uppy states:", error)
                setHasUppyUnsavedStates(false)
            }
        }

        checkUppyStates()
    }, [repId])

    const queryVariables = useMemo(() => ({ id: repId }), [repId])
    const requestPolicy = useMemo(() => {
        // 优先使用缓存的场景：
        // 1. 客户端离线
        // 2. GraphQL后端离线
        // 3. Next.js前端离线（页面刷新模式，避免多余请求）
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) {
            return "cache-only"
        }
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    const [result, reexecuteQuery] = useQuery({
        query: ReportQuery,
        variables: queryVariables,
        requestPolicy,
        pause: (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) && !mounted ? true : false,
    })

    const { data, fetching, error } = result

    // 在data为空时，每隔200毫秒查询一次，最多10次
    useEffect(() => {
        if ((!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) && mounted && !data) {
            let count = 0
            const maxRetries = 20
            const interval = setInterval(() => {
                count++
                if (count >= maxRetries || data) {
                    clearInterval(interval)
                    return
                }
                reexecuteQuery({ requestPolicy: requestPolicy })
            }, 150)
            return () => clearInterval(interval)
        }
    }, [mounted, data, reexecuteQuery, requestPolicy, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])
    const report = data && data.getReport
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
    }, [reexecuteQuery, isClientOnline, isGraphQLBackendReachable])

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
    }, [fetching, isClientOnline, isGraphQLBackendReachable])

    const prevDataRef = useRef<any>(null)
    useEffect(() => {
        if (!report) return
        
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
    }, [report, storage, setStorage, setSubrType, modified])

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
    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>
    if (!report) {
        return (
            <div className="content-center text-center h-screen w-screen">
                <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => window.location.href = '/report/'}
                >
                    没有找到该份报告，返回首页
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

    const { isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable } = useNetworkStatusContext()
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [hasUppyUnsavedStates, setHasUppyUnsavedStates] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const isPrintMode = searchParams?.get("print") === "1"

    useEffect(() => setMounted(true), [])

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

    const mainQueryVariables = useMemo(() => ({ id: repId }), [repId])
    const subQueryVariables = useMemo(() => ({ id: subrid }), [subrid])
    const requestPolicy = useMemo(() => {
        // 优先使用缓存的场景（包括 Next.js 前端离线）
        if (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) {
            console.log("[report-data] 离线模式，使用 cache-only 策略", {
                isClientOnline,
                isGraphQLBackendReachable,
                isNextJSServerReachable,
            })
            return "cache-only"
        }
        return "cache-and-network"
    }, [isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])
    const [result, reexecuteQuery] = useQuery({
        query: ReportQuery,
        variables: mainQueryVariables,
        requestPolicy,
        pause: (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) && !mounted ? true : false,
    })

    const [resultSub, reexecuteQuerySub] = useQuery({
        query: ReportSubQuery,
        variables: subQueryVariables,
        requestPolicy,
        pause: (!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) && !mounted ? true : false,
    })

    const { data, fetching, error } = result
    const { data: dataSub, fetching: fetchingSub, error: errorSub } = resultSub

    // 在data为空时，每隔200毫秒查询一次，最多10次
    useEffect(() => {
        if ((!isClientOnline || !isGraphQLBackendReachable || !isNextJSServerReachable) && mounted && (!data || !dataSub)) {
            let count = 0
            const maxRetries = 20
            const interval = setInterval(() => {
                count++
                if (count >= maxRetries || data) {
                    clearInterval(interval)
                    return
                }
                reexecuteQuery({ requestPolicy: requestPolicy })
                reexecuteQuerySub({ requestPolicy: requestPolicy })
            }, 150)
            return () => clearInterval(interval)
        }
    }, [mounted, data, reexecuteQuery, reexecuteQuerySub, requestPolicy, isClientOnline, isGraphQLBackendReachable, isNextJSServerReachable])

    const report = data && data?.getReport
    const reportSub = React.useMemo(() => {
        const reportSub = dataSub && dataSub?.getReport
        if (reportSub || !report) return reportSub
        const { node: subrepObj } = report.isp?.reps?.edges?.find(({ node: { id } }: any) => id === subrid)
        return subrepObj
    }, [dataSub, subrid])

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
    }, [fetching, fetchingSub, isClientOnline, isGraphQLBackendReachable])

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
    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>
    if (!report) {
        if(fetching || error)
            return <div className="p-4 text-sm text-muted-foreground">加载报告数据还没完...</div>
        return (
            <div className="content-center text-center h-screen w-screen">
                <span
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => window.location.href = '/report/'}
                >
                    没有找到该份报告，返回首页
                </span>
            </div>
        )
    }
    if (!reportSub) {
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
