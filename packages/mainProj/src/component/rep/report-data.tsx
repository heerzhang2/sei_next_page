"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useQuery, gql } from "@urql/next"
import { useStorage } from "@/report/StorageContext"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { subscribeToNetworkStatus, getNetworkStatus } from "@/auth/graphql-component"

export interface ReportParams {
    repId: string
    action?: string
}

//片段不能像Relay那样的能做独立形式的定义了！必须每个请求都定义； "Validation error (UndefinedFragment@[getReport]) : Undefined fragment 'pageReportIsp'"
// const RepIspQuery=gql` `;
export const ReportQuery = gql`
    query pagegetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id,version,
            data
            snapshot
            modeltype,modelversion
            isp{id, no}
            ...pageReportIsp
        }
    }
    fragment pageReportIsp on Report
    {
        id, modeltype, modelversion, tzFields,
        link { rep ori },
        isp {
            id, no, report{id},
            dev{id cod},bsType,
            reps {
                edges {
                    node {
                        id, modeltype, data,version,
                        stm{id,sta,
                            authr{ id, username, person {id, name} },
                            reviewer{ id, username, person {id, name} }
                        }
                    }
                },
            },
            ispMen { id, username, person {id, name} },
            checkMen { id, username, person {id, name} }
            ispu{id agency{id,apno,bjtel,bjurl},name},
            bus{id,
                pipus{id crDate code rno name start stop nxtd1 nxtd2 leng level lay safe svp pa}
            }
        }
    }
`

// 判断数据来源的辅助函数
function getDataSource(result: any) {
    // 方法1: 检查缓存结果
    const cacheOutcome = result?.operation?.context?.meta?.cacheOutcome
    if (cacheOutcome === "hit") {
        return "cache" // 完全来自缓存
    } else if (cacheOutcome === "miss") {
        return "network" // 来自网络请求
    } else if (cacheOutcome === "partial") {
        return "partial" // 部分来自缓存
    }

    // 方法2: 检查 stale 标志
    if (result?.stale) {
        return "stale-cache" // 过期的缓存数据
    }

    // 方法3: 如果正在获取且没有数据，说明是首次网络请求
    if (result?.fetching && !result?.data) {
        return "network-loading"
    }

    // 方法4: 如果有数据且不在获取中，可能是缓存
    if (result?.data && !result?.fetching) {
        return "cache-or-network"
    }

    return "unknown"
}

// 判断是否为网络错误（表示后端离线）, 针对java的graphQL后端; 前端服务器nextjs离线不在这里涉及。
function isNetworkError(error: any) {
    if (!error) return false

    // 检查自定义的网络错误标记
    if (error.isNetworkError) return true

    // 检查错误类型
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
        networkErrorKeywords.some((keyword) => errorMessage.includes(keyword)) ||
        (error.name === "TypeError" && errorMessage.includes("fetch"))
    )
}

function CommonReportData({ repId, children }: { repId: string; children: React.ReactNode }) {
    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: "cache-and-network",
    })
    const { data, fetching, error } = result
    const { getReport: report } = data || {}
    const { setStorage, setSubrType, offline, setOffline } = useStorage()

    // 监听全局网络状态
    const [networkState, setNetworkState] = useState(getNetworkStatus())

    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkState)
        return unsubscribe
    }, [])

    // 判断数据来源
    const dataSource = getDataSource(result)
    const isFromCache = dataSource === "cache" || dataSource === "stale-cache"
    const isNetworkFailure = isNetworkError(error) || !networkState.isOnline

    console.log(
        "数据来源:",
        dataSource,
        "是否来自缓存:",
        isFromCache,
        "网络错误:",
        isNetworkFailure,
        "全局网络状态:",
        networkState,
    )

    //服务器也运行的console.log("左边页面的OriginalRecordMainInner",storage,"routeData",);
    React.useEffect(() => {
        const snap = report && report.snapshot && JSON.parse(report.snapshot)
        const dat = report && report.data && JSON.parse(report.data)
        //JPA互斥锁 _version 同时保存一份到了data区域,保存数据需要回传后端的。  snapshot【只有经过一次】保存才能复制进入data字段，否则不变。
        if (dat)
            setStorage({ ...dat, ...snap, _version: report?.version }) //台账基础信息优先采信
        else setStorage({ ...snap, _version: report?.version })
        //切换，否则报告页面无法更新：
        setSubrType(undefined)
        console.log("每次保存都会更新", dat, "snap", snap) //点击不同的编辑区块链接跳转后这个竟然没有再去运行！！
    }, [report, setStorage])

    // 处理离线状态
    React.useEffect(() => {
        if (isNetworkFailure || !networkState.isOnline) {
            // 网络错误，设置为离线
            setOffline(true)
        } else if (dataSource === "network" || dataSource === "network-loading" || networkState.isOnline) {
            // 成功从网络获取数据，设置为在线
            setOffline(false)
        }
        // 如果只是从缓存获取数据，不改变离线状态
    }, [dataSource, isNetworkFailure, networkState, setOffline])

    if (fetching && !data) return <div>加载中...</div>

    if (error) {
        if (isNetworkFailure) {
            return (
                <div className="text-center p-4">
                    <div className="text-red-500 mb-2">后端服务器离线</div>
                    <div className="text-sm text-gray-600">{isFromCache || data ? "正在使用缓存数据" : "无法连接到服务器"}</div>
                    <div className="text-xs text-gray-500 mt-2">
                        错误: {error?.message || networkState.lastError?.message || "网络连接失败"}
                    </div>
                    {data && <div className="text-xs text-blue-600 mt-2">已加载缓存数据，功能可能受限</div>}
                </div>
            )
        } else {
            return <div>报告取数据错: {error.message}</div>
        }
    }
    //error= {error??'err'}  networkState.isOnline={networkState.isOnline ?'tr':'f'}  isNetworkFailure={isNetworkFailure?'tr':'f'}
    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有找到该份报告，返回首页</Link>
            </div>
        )

    return (
        <Suspense>
            {/* {process.env.NODE_ENV === "development" && (
                <div className="fixed top-0 right-0 bg-blue-100 text-xs p-2 z-50">
                    数据来源: {dataSource} | 离线: {offline ? "是" : "否"} | 网络: {networkState.isOnline ? "在线" : "离线"}
                </div>
            )}*/}
            {children}
        </Suspense>
    )
}

export const ReportSubQuery = gql`
    query pagegetReportQuery($id: ID! ) {
        getReport(id: $id) {
            id,version,data,modeltype
        }
    }
`

/**独立流转分项需要同步显示，避免主报告不能刷新子报告的新数据。
 * 直接查询子报告的数据，替换子报告数据修改部分。
 * */
function CommonReportDataSub({
                                 repId,
                                 subrid,
                                 children,
                             }: { repId: string; subrid: string; children: React.ReactNode }) {
    const [result] = useQuery({
        query: ReportQuery,
        variables: { id: repId },
        requestPolicy: "cache-and-network",
    })
    const { data, fetching, error } = result
    const { getReport: report } = data || {}

    //独立流转的分项报告：  独立分项报告反而需附加一个查询。因为上面主查询不会因子报告保存做立刻更新的。
    const [resultSub] = useQuery({
        query: ReportSubQuery,
        variables: { id: subrid },
        requestPolicy: "cache-and-network",
    })
    const { data: dataSub, fetching: fetchingSub, error: errorSub } = resultSub
    const { getReport: reportSub } = dataSub || {}
    const { setStorage, setSubrType, setParrepfs, offline, setOffline } = useStorage()

    // 监听全局网络状态
    const [networkState, setNetworkState] = useState(getNetworkStatus())

    useEffect(() => {
        const unsubscribe = subscribeToNetworkStatus(setNetworkState)
        return unsubscribe
    }, [])

    // 判断主查询和子查询的数据来源
    const mainDataSource = getDataSource(result)
    const subDataSource = getDataSource(resultSub)
    const isMainNetworkError = isNetworkError(error)
    const isSubNetworkError = isNetworkError(errorSub)

    console.log("主查询数据来源:", mainDataSource, "子查询数据来源:", subDataSource, "网络状态:", networkState)

    //服务器也运行的console.log("左边页面的OriginalRecordMainInner",storage,"routeData",);
    React.useEffect(() => {
        const snap = report && report.snapshot && JSON.parse(report.snapshot)
        if (reportSub) {
            const subdat = reportSub.data && JSON.parse(reportSub.data)
            //不是主报告分项的： 不需要设备台账的字段。
            if (subdat)
                setStorage({ ...subdat, _version: reportSub?.version }) //台账基础信息优先采信
            else setStorage({ _version: reportSub?.version })
            setSubrType(reportSub.modeltype)
            console.log("每次保存CommonReportDataSub", subdat) //点击不同的编辑区块链接跳转后这个竟然没有再去运行！！
        }
        const dat = report && report.data && JSON.parse(report.data)
        //JPA互斥锁 _version 同时保存一份到了data区域,保存数据需要回传后端的。  snapshot【只有经过一次】保存才能复制进入data字段，否则不变。
        if (reportSub) {
            if (dat) setParrepfs({ ...dat, ...snap, _version: report?.version })
            else setParrepfs({ ...snap, _version: report?.version })
        }
    }, [reportSub, report, setStorage, setParrepfs])

    // 处理离线状态
    React.useEffect(() => {
        const hasNetworkError = isMainNetworkError || isSubNetworkError || !networkState.isOnline
        const hasNetworkSuccess = (mainDataSource === "network" || subDataSource === "network") && networkState.isOnline

        if (hasNetworkError) {
            setOffline(true)
        } else if (hasNetworkSuccess) {
            setOffline(false)
        }
    }, [mainDataSource, subDataSource, isMainNetworkError, isSubNetworkError, networkState, setOffline])

    if (fetching || fetchingSub) return <div>加载中...</div>

    if (error || errorSub) {
        const hasNetworkError = isMainNetworkError || isSubNetworkError
        if (hasNetworkError) {
            return (
                <div className="text-center p-4">
                    <div className="text-red-500 mb-2">后端服务器离线</div>
                    <div className="text-sm text-gray-600">正在使用缓存数据</div>
                    <div className="text-xs text-gray-500 mt-2">
                        {error?.message} {errorSub?.message} {networkState.lastError?.message}
                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    报告取数据错: {error?.message} {errorSub?.message}
                </div>
            )
        }
    }

    if (report && !report.snapshot) return <React.Fragment>{`该报告的基础信息未赋值`}</React.Fragment>
    if (!report)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有找到该份报告，返回首页</Link>
            </div>
        )
    if (!reportSub)
        return (
            <div className="content-center text-center h-screen w-screen">
                <Link href="/">没有该独立流转子报告，返回首页</Link>
            </div>
        )

    return (
        <Suspense>
            {children}
        </Suspense>
    )
}

/**支持：子报告编辑情形需要单独展示子报告，不涉及主报告显示的模式。
 * */
export default function ReportData({
                                       repId,
                                       children,
                                   }: {
    repId: string
    children: React.ReactNode
}) {
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid")
    if (subrid)
        return (
            <Suspense>
                <CommonReportDataSub repId={repId} subrid={subrid}>
                    {children}
                </CommonReportDataSub>
            </Suspense>
        )
    else
        return (
            <Suspense>
                <CommonReportData repId={repId}>{children}</CommonReportData>
            </Suspense>
        )
}
