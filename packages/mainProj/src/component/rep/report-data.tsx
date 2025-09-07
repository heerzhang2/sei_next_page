"use client"

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useQuery, gql } from "@urql/next"
import { useStorage } from "@/report/StorageContext"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {useNetworkStatusContext} from "@/contexts/network-status-context";
import {toast} from "sonner";

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
    const [queryEnabled, setQueryEnabled] = useState(true)      //避免死循环地查询
    const queryCountRef = useRef(0)
    const lastQueryTimeRef = useRef(0)
    const pausedUntilRef = useRef(0)

    const [isClient, setIsClient] = useState(false)
    const { isClientOnline, isGraphQLBackendReachable } = useNetworkStatusContext()

    useEffect(() => {
        setIsClient(true)
        setMounted(true)
    }, [])

    console.log("当前CommonReportData状态:", { mounted, isClient, repId })

    const queryVariables = useMemo(() => ({ id: repId }), [repId])
    //有四种策略 'cache-first' | 'cache-and-network' | 'network-only' | 'cache-only';
    const requestPolicy = useMemo(() => {
        if (!isClientOnline || !isGraphQLBackendReachable) {
            return 'cache-first'
        }
        return 'cache-and-network'      //在线时先用缓存，同时同步请求网络
    }, [isClientOnline, isGraphQLBackendReachable])

    const [result, reexecuteQuery] = useQuery({
        query: ReportQuery,
        variables: queryVariables,
        requestPolicy,
        pause: false,
    })

    const { data, fetching, error } = result
    const report = data && data.getReport
    const { setStorage, setSubrType, setOffline } = useStorage()

    const refreshData = useCallback(() => {
        if (!isClientOnline || !isGraphQLBackendReachable) {
            toast.error(`离线状态下无法刷新数据`, {
                description: (
                    <>{ !isClientOnline ? "终端断网中": "后端服务断了"}<br/></>
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
        if (!isClientOnline || !isGraphQLBackendReachable) return

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

        const snap = report.snapshot && JSON.parse(report.snapshot)
        const dat = report.data && JSON.parse(report.data || "{}")
        const newData = dat ? { ...dat, ...snap, _version: report.version } : { ...(snap || {}), _version: report.version }

        if (JSON.stringify(newData) !== JSON.stringify(prevDataRef.current)) {
            console.log("StorageContext: Setting storage data", { version: report.version })
            setStorage(newData)
            setSubrType(undefined)
            prevDataRef.current = newData
        }
    }, [report])

    useEffect(() => {
        const hasNetworkError = isNetworkError(error)
        const shouldBeOffline = hasNetworkError || !isClientOnline || !isGraphQLBackendReachable
        //这儿设置内部用的状态 后续也都没有用到的； 只能是猜测Java后端不可用状态，很可能被限制限速，后端太慢。
        setOffline(shouldBeOffline)
    }, [error, isClientOnline, isGraphQLBackendReachable, setOffline])

    if (!isClient || !mounted) {
        return <div className="p-4 text-sm text-muted-foreground">正在准备编辑环境...</div>
    }

    if (!isClientOnline || !isGraphQLBackendReachable) {
        if (data && report) {
            return (
                <>
                    <div className="fixed top-7 right-7 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-amber-500 text-white rounded text-xs">离线呢{isClientOnline?"":"A"}{isGraphQLBackendReachable?"":"B"}</span>
                        <button
                            onClick={refreshData}
                            className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                            title="离线状态下无法刷新"
                        >
                            ↻
                        </button>
                    </div>
                    {children}
                </>
            )
        }
    }

    if (fetching && !data && Date.now() < pausedUntilRef.current) {
        return <div className="p-4 text-sm text-muted-foreground">查询已暂停，请稍后...</div>
    }

    if (fetching && !data) return <div className="p-4">加载中...</div>

    if (error) {
        if (isNetworkError(error)) {
            return (
                <>
                    <div className="text-center p-4">
                        <div className="text-red-500 mb-2">后端服务器离线</div>
                        <div className="text-sm text-gray-600">{data ? "正在使用缓存数据" : "无法连接到服务器"}</div>
                        <div className="text-xs text-gray-500 mt-2">错误: {error.message}</div>
                        {data && <div className="text-xs text-blue-600 mt-2">已加载缓存数据，功能有限</div>}
                        <button
                            onClick={refreshData}
                            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            disabled={fetching}
                        >
                            {fetching ? "刷新中..." : "重试连接"}
                        </button>
                    </div>
                    {report && data && children}
                </>
            )
        } else {
            return <div>报告取数据错: {error.message}</div>
        }
    }

    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>

    if (!report) {
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有找到该份报告，返回首页</Link>
            </div>
        )
    }

    return (
        <>
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs">
                <button
                    onClick={refreshData}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={fetching}
                    title="刷新数据"
                >
                    {fetching ? "⟳" : "↻"}
                </button>
            </div>
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

    const { isClientOnline, isGraphQLBackendReachable } = useNetworkStatusContext()

    useEffect(() => setMounted(true), [])
    console.log("CommonReportDataSub编辑需要子报告单独查", { repId, subrid })

    const mainQueryVariables = useMemo(() => ({ id: repId }), [repId])
    const subQueryVariables = useMemo(() => ({ id: subrid }), [subrid])
    const requestPolicy = useMemo(() => {
        if (!isClientOnline || !isGraphQLBackendReachable) {
            return 'cache-first'
        }
        return 'cache-and-network'      //在线时先用缓存，同时同步请求网络
    }, [isClientOnline, isGraphQLBackendReachable])

    const [result] = useQuery({
        query: ReportQuery,
        variables: mainQueryVariables,
        requestPolicy,
        pause: false,
    })

    const [resultSub] = useQuery({
        query: ReportSubQuery,
        variables: subQueryVariables,
        requestPolicy,
        pause: false,
    })

    const { data, fetching, error } = result
    const { data: dataSub, fetching: fetchingSub, error: errorSub } = resultSub
    const report =data && data?.getReport
    const reportSub =dataSub && dataSub?.getReport
    const { setStorage, setSubrType, setParrepfs, setOffline } = useStorage()

    const refreshData = useCallback(() => {
        if (!isClientOnline || !isGraphQLBackendReachable) {
            console.log("离线状态下无法刷新数据")
            return
        }
        console.log("手动刷新报告数据")
        queryCountRef.current = 0
        lastQueryTimeRef.current = 0
        pausedUntilRef.current = 0
        setQueryEnabled(true)
        result.reexecuteQuery({ requestPolicy: "cache-and-network" })
        resultSub.reexecuteQuery({ requestPolicy: "cache-and-network" })
    }, [result, resultSub, isClientOnline, isGraphQLBackendReachable])

    useEffect(() => {
        if (!isClientOnline || !isGraphQLBackendReachable) return

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

        const snap = report.snapshot && JSON.parse(report.snapshot)
        const subdat = reportSub.data && JSON.parse(reportSub.data || "{}")
        const dat = report.data && JSON.parse(report.data || "{}")

        const newSubData = subdat ? { ...subdat, _version: reportSub.version } : { _version: reportSub.version }
        if (JSON.stringify(newSubData) !== JSON.stringify(prevDataRef.current)) {
            setStorage(newSubData)
            setSubrType(reportSub.modeltype)
            prevDataRef.current = newSubData
        }

        const newParData = dat
            ? { ...dat, ...(snap || {}), _version: report.version }
            : { ...(snap || {}), _version: report.version }
        if (JSON.stringify(newParData) !== JSON.stringify(prevParrepfsRef.current)) {
            setParrepfs(newParData)
            prevParrepfsRef.current = newParData
        }
    }, [report, reportSub])

    useEffect(() => {
        const hasNetworkError = isNetworkError(error) || isNetworkError(errorSub)
        const shouldBeOffline = hasNetworkError || !isClientOnline || !isGraphQLBackendReachable
        setOffline(shouldBeOffline)
    }, [error, errorSub, isClientOnline, isGraphQLBackendReachable, setOffline])

    if (!mounted) return <div className="p-4 text-sm text-muted-foreground">正在准备编辑环境...</div>
    if (fetching || fetchingSub) return <div>加载中...</div>

    if (error || errorSub) {
        const hasNetworkError = isNetworkError(error) || isNetworkError(errorSub)
        if (hasNetworkError) {
            return (
                <>
                    <div className="text-center p-4">
                        <div className="text-red-500 mb-2">后端服务器离线</div>
                        <div className="text-sm text-gray-600">正在使用缓存数据</div>
                        <div className="text-xs text-gray-500 mt-2">{error?.message || errorSub?.message}</div>
                    </div>
                    {report && reportSub && children}
                </>
            )
        } else {
            return <div>报告取数据错: {error?.message || errorSub?.message}</div>
        }
    }

    if (report && !report.snapshot) return <React.Fragment>该报告的基础信息未赋值</React.Fragment>
    if (!report) {
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有找到该份报告，返回首页</Link>
            </div>
        )
    }
    if (!reportSub) {
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有该独立流转子报告，返回首页</Link>
            </div>
        )
    }

    return <>{children}</>
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
