"use client"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useSearchParams } from "next/navigation"
import type React from "react"
import { useState, useCallback } from "react"
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react"

interface RepHeadLinkProps {
    template: string
    verId: string
    repId: string
    rep: any
    //单独正式报告的，就没有原始记录的展示模式的。
    single?: boolean
}

/**报告的头部功能区
* */
export function RepHeadLink({ template, verId, repId, rep, single }: RepHeadLinkProps) {
    //无法连接java的后端服务器，urql缓存没有可获取RepLink:`${rep?.link?.rep}`的值
    const { isGraphQLBackendReachable } = useNetworkStatusContext()
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const pdfUri = (!single && original) ? rep?.link?.ori : rep?.link?.rep

    const [fileExists, setFileExists] = useState<boolean | null>(null)
    const [isChecking, setIsChecking] = useState(false)

    const pdfUrl = pdfUri ? `${process.env.NEXT_PUBLIC_OSS_ENDP}/${pdfUri}` : null

    /**点击时检查文件是否存在 */
    const handleClick = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!pdfUrl) return

        e.preventDefault()
        setIsChecking(true)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(pdfUrl, {
                method: "HEAD",
                signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (response.ok) {
                // 文件存在，打开新窗口
                setFileExists(true)
                window.open(pdfUrl, "_blank", "noopener,noreferrer")
            } else {
                // 文件不存在
                setFileExists(false)
            }
        } catch {
            // 请求失败（可能是 CORS 或网络问题），默认尝试打开
            setFileExists(true)
            window.open(pdfUrl, "_blank", "noopener,noreferrer")
        } finally {
            setIsChecking(false)
        }
    }, [pdfUrl])

    const handleRefresh = useCallback(() => {
        window.location.reload()
    }, [])

    return (
        <div id="BeginOfRep" className="print:hidden text-center mt-4 mb-4 md:mb-0">
            <div className="space-y-3 border-b">
                {pdfUri ? (
                    <div className="space-y-2">
                        <a
                            href={pdfUrl || "#"}
                            onClick={handleClick}
                            className="inline-flex items-center justify-center w-1/4 min-w-28 rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-lime-200 text-red-500 hover:bg-gray-200 h-8 px-3 py-1 cursor-pointer"
                        >
                            {isChecking ? (
                                <span className="flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    检查中...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    有Pdf版
                                    <ExternalLink className="w-3 h-3" />
                                </span>
                            )}
                        </a>
                        {/* 文件不存在的提示 */}
                        {fileExists === false && (
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                <AlertCircle className="w-4 h-4" />
                                <span>PDF 文件不存在或已过期</span>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                                    title="刷新页面获取最新数据"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    刷新页面
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1 p-1 text-xs bg-gray-50 rounded-lg">
                        {isGraphQLBackendReachable ? "没有Pdf版" : "无法连接后端服务器，不可获取Pdf信息"}
                    </div>
                )}
            </div>
        </div>
    )
}
