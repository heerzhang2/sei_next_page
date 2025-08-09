"use client"

import React, { useEffect, useState } from "react"
import { useQuery, gql } from "@urql/next"
import { useStorage } from "@/report/StorageContext"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { subscribeToNetworkStatus, getNetworkStatus } from "@/auth/graphql-component"

// NOTE: Removed nested Suspense wrappers to avoid server/client mismatch.
// We also gate first render with a "mounted" flag to keep HTML stable across SSR/CSR and prevent hydration errors.

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
    useEffect(() => setMounted(true), [])

    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: "cache-and-network",
    })
    const { data, fetching, error } = result
    const report = data?.getReport
    const { setStorage, setSubrType, offline, setOffline } = useStorage()

    const [networkState, setNetworkState] = useState(getNetworkStatus())
    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkState)
        return unsubscribe
    }, [])

    const dataSource = getDataSource(result)
    const isFromCache = dataSource === "cache" || dataSource === "stale-cache"
    const isNetworkFailure = isNetworkError(error) || !networkState.isOnline

    useEffect(() => {
        const snap = report?.snapshot && JSON.parse(report.snapshot)
        const dat = report?.data && JSON.parse(report.data || "{}")
        if (dat) setStorage({ ...dat, ...snap, _version: report?.version })
        else setStorage({ ...(snap || {}), _version: report?.version })
        setSubrType(undefined)
    }, [report, setStorage, setSubrType])

    useEffect(() => {
        if (isNetworkFailure) {
            console.log("Setting offline to true due to network failure")
            setOffline(true)
        } else if (dataSource === "network" || dataSource === "network-loading" || networkState.isOnline) {
            console.log("Setting offline to false due to network success")
            setOffline(false)
        }
    }, [dataSource, isNetworkFailure, networkState, setOffline])

    // Stable initial HTML to avoid hydration mismatch
    if (!mounted) {
        return <div className="p-4 text-sm text-muted-foreground">{"正在准备编辑环境..."}</div>
    }

    if (fetching && !data) return <div className="p-4">{"加载中..."}</div>

    if (error || !networkState.isOnline) {
        if (isNetworkFailure || !networkState.isOnline) {
            return (
                <div className="text-center p-4">
                    <div className="text-red-500 mb-2">{"后端服务器离线"}</div>
                    <div className="text-sm text-gray-600">{isFromCache || data ? "正在使用缓存数据" : "无法连接到服务器"}</div>
                    <div className="text-xs text-gray-500 mt-2">{`错误: ${error?.message || networkState.lastError?.message || "网络连接失败"}`}</div>
                    {data && <div className="text-xs text-blue-600 mt-2">{"已加载缓存数据，功能可能受限"}</div>}
                </div>
            )
        } else {
            return <div>{`报告取数据错: ${error?.message}`}</div>
        }
    }

    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">{"没有找到该份报告，返回首页"}</Link>
            </div>
        )

    return <>{children}</>
}

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

function CommonReportDataSub({
                                 repId,
                                 subrid,
                                 children,
                             }: { repId: string; subrid: string; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: "cache-and-network",
    })
    const { data, fetching, error } = result
    const report = data?.getReport

    const [resultSub] = useQuery({
        query: ReportSubQuery,
        variables: { id: subrid },
        requestPolicy: "cache-and-network",
    })
    const { data: dataSub, fetching: fetchingSub, error: errorSub } = resultSub
    const reportSub = dataSub?.getReport
    const { setStorage, setSubrType, setParrepfs, offline, setOffline } = useStorage()

    const [networkState, setNetworkState] = useState(getNetworkStatus())
    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkState)
        return unsubscribe
    }, [])

    const mainDataSource = getDataSource(result)
    const subDataSource = getDataSource(resultSub)
    const isMainNetworkError = isNetworkError(error)
    const isSubNetworkError = isNetworkError(errorSub)

    useEffect(() => {
        const snap = report?.snapshot && JSON.parse(report.snapshot)
        if (reportSub) {
            const subdat = reportSub.data && JSON.parse(reportSub.data || "{}")
            if (subdat) setStorage({ ...subdat, _version: reportSub?.version })
            else setStorage({ _version: reportSub?.version })
            setSubrType(reportSub.modeltype)
        }
        const dat = report?.data && JSON.parse(report.data || "{}")
        if (reportSub) {
            if (dat) setParrepfs({ ...dat, ...(snap || {}), _version: report?.version })
            else setParrepfs({ ...(snap || {}), _version: report?.version })
        }
    }, [reportSub, report, setStorage, setParrepfs, setSubrType])

    useEffect(() => {
        const hasNetworkError = isMainNetworkError || isSubNetworkError || !networkState.isOnline
        const hasNetworkSuccess = (mainDataSource === "network" || subDataSource === "network") && networkState.isOnline
        if (hasNetworkError) setOffline(true)
        else if (hasNetworkSuccess) setOffline(false)
    }, [mainDataSource, subDataSource, isMainNetworkError, isSubNetworkError, networkState, setOffline])

    if (!mounted) return <div className="p-4 text-sm text-muted-foreground">{"正在准备编辑环境..."}</div>

    if (fetching || fetchingSub) return <div>{"加载中..."}</div>

    if (error || errorSub || !networkState.isOnline) {
        const hasNetworkError = isMainNetworkError || isSubNetworkError || !networkState.isOnline
        if (hasNetworkError) {
            return (
                <div className="text-center p-4">
                    <div className="text-red-500 mb-2">{"后端服务器离线"}</div>
                    <div className="text-sm text-gray-600">{"正在使用缓存数据"}</div>
                    <div className="text-xs text-gray-500 mt-2">{`${error?.message || ""} ${errorSub?.message || ""} ${networkState.lastError?.message || ""}`}</div>
                </div>
            )
        } else {
            return <div>{`报告取数据错: ${error?.message || ""} ${errorSub?.message || ""}`}</div>
        }
    }

    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">{"没有找到该份报告，返回首页"}</Link>
            </div>
        )
    if (!reportSub)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">{"没有该独立流转子报告，返回首页"}</Link>
            </div>
        )

    return <>{children}</>
}

/** 支持子报告编辑或主报告编辑（通过 ?subrid=...） */
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
