"use client"
import * as React from "react";
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ConfigRoot, FileTransform } from "page2pdf_server/src";
import {usePrintPdf} from "@/hooks/usePrintPdf";
import {toast} from "sonner";
import {useCreateQueryString} from "@/hooks/useCreateQueryString";
import {startProcess} from "@/actions/camunda-actions";
import { useState, useRef, useEffect, useCallback } from "react"


interface PDFControlsProps {
    template: string
    verId: string
    repId: string
    rep: any
    pdf_job: ConfigRoot<FileTransform>
    onLocalCvtFin?: () => void
}

type TimeUnit = "day" | "month" | "year"

export function RepFootLink({ template, verId, repId, rep, pdf_job, onLocalCvtFin }: PDFControlsProps) {
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const createQueryString = useCreateQueryString()
    const router = useRouter()
    const pathname = usePathname()
    const { action } = useParams()
    const original = "1" === searchParams!.get("original")
    const fixBtn = !action
    const [isMutating, handleSubmit] = usePrintPdf(pdf_job)

    // Popover 状态
    const [popoverOpen, setPopoverOpen] = useState(false)

    // 滚动位置状态
    const viewportRef = useRef<HTMLDivElement>(null)
    const [scrollPosition, setScrollPosition] = useState(0)

    // 输入框引用 - 用于保持焦点
    const inputRef = useRef<HTMLInputElement>(null)
    const [inputFocused, setInputFocused] = useState(false)

    // 状态管理
    const [retentionValue, setRetentionValue] = useState("1")
    const [retentionUnit, setRetentionUnit] = useState<TimeUnit>("month")
    const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "redo">("idle")
    const pdfUri = original ? rep?.link?.ori : rep?.link?.rep
    const [isProcessing, setIsProcessing] = useState(false)

    // 监听滚动位置变化
    const handleScroll = () => {
        if (viewportRef.current) {
            setScrollPosition(viewportRef.current.scrollTop)
        }
    }

    // 恢复滚动位置和输入框焦点
    useEffect(() => {
        const viewport = viewportRef.current
        if (viewport && scrollPosition > 0) {
            requestAnimationFrame(() => {
                viewport.scrollTop = scrollPosition
            })
        }

        // 如果输入框之前有焦点，重新聚焦
        if (inputFocused && inputRef.current) {
            requestAnimationFrame(() => {
                inputRef.current?.focus()
                // 将光标移到末尾
                const length = inputRef.current?.value.length || 0
                inputRef.current?.setSelectionRange(length, length)
            })
        }
    }, [retentionValue, scrollPosition, inputFocused])

    const handlePDFGeneration = async () => {
        try {
            if (!handleSubmit) throw new Error("空pdf_job")
            else {
                const result = await handleSubmit()
                onLocalCvtFin?.()
            }
        } catch (error) {
            toast.error("操作失败", {
                description: "请确认文书打印转换器在运行" + error,
            })
        }
    }

    // 根据单位和数值计算天数
    const calculateDays = (value: string, unit: TimeUnit): number => {
        const numValue = Number.parseInt(value, 10) || 1

        switch (unit) {
            case "day":
                return numValue
            case "month":
                return numValue * 30
            case "year":
                return numValue * 365
            default:
                return numValue
        }
    }

    // 获取过期日期
    const getExpirationDate = (value: string, unit: TimeUnit): string => {
        const days = calculateDays(value, unit)
        const expiration = new Date()
        expiration.setDate(expiration.getDate() + days)
        expiration.setUTCHours(0, 0, 0, 0)
        return expiration.toISOString()
    }

    // 处理数值变化 - 使用 useCallback 防止重新渲染
    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // 记录当前滚动位置
        if (viewportRef.current) {
            setScrollPosition(viewportRef.current.scrollTop)
        }

        const value = e.target.value.replace(/[^\d]/g, "")
        setRetentionValue(value)
    }, [])

    // 处理输入框焦点事件
    const handleInputFocus = useCallback(() => {
        setInputFocused(true)
    }, [])

    const handleInputBlur = useCallback(() => {
        setInputFocused(false)
    }, [])

    // 处理单位变化 - 保持滚动位置
    const handleUnitChange = useCallback((value: TimeUnit) => {
        // 记录当前滚动位置
        if (viewportRef.current) {
            setScrollPosition(viewportRef.current.scrollTop)
        }

        setRetentionUnit(value)
    }, [])

    // 获取显示文本
    const getDisplayText = (): string => {
        const value = Number.parseInt(retentionValue, 10) || 1

        switch (retentionUnit) {
            case "day":
                return `${value}天`
            case "month":
                return value === 1 ? "1个月" : `${value}个月`
            case "year":
                return value === 1 ? "1年" : `${value}年`
            default:
                return `${value}天`
        }
    }

    const handlePdfFlow = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isProcessing) return
        setIsProcessing(true)

        const isoDate = getExpirationDate(retentionValue, retentionUnit)
        const displayText = getDisplayText()

        try {
            const { success, error, processInstanceKey } = (await startProcess({
                processId: "genRepPdf",
                variables: {
                    pdfJob: pdf_job,
                    pdfType: original ? "ori" : "rep",
                    repId,
                    expiration: isoDate,
                },
            })) as any

            if (success && processInstanceKey) {
                toast.success(`申请PDF转换成功！保留期限：${displayText}`, {
                    description: (
                        <>
                            在后端排队，等它完成后，再刷新才能看到下载链接
                            <br />
                            请不要重复提交转换Pdf的申请单，后端也需消耗时间处理。
                        </>
                    ),
                })
            } else {
                toast.error("PDF转换失败", { description: error })
            }
        } catch (err) {
            toast.error("PDF转换失败", { description: "错误" + err })
        } finally {
            setIsProcessing(false)
        }
    }

    // Popover 内容 - 使用 React.memo 优化渲染
    const PopoverContent_All = React.memo(() => (
        <ScrollArea className="h-full max-h-[70vh] overflow-auto" onScrollCapture={handleScroll} scrollHideDelay={0} type="always">
            <div className="viewport" ref={viewportRef} style={{ scrollBehavior: "auto" }}>
                <div className="space-y-4 p-1">
                    {/* 返回首页链接 */}
                    <div className="text-center border-b pb-3">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                            -报告完毕,返回-
                        </Link>
                    </div>

                    {/* 主要功能按钮 - 缩短文字 */}
                    <div className="space-y-3">
                        {/* 原始记录/正式报告切换 - 缩短按钮文字 */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.push(pathname + "?" + createQueryString("original", original ? "" : "1"))
                                setPopoverOpen(false)
                            }}
                            className="w-full text-sm"
                        >
                            {original ? "正式报告" : "原始记录"}
                        </Button>

                        {/* 浏览模式/打印模式切换 - 缩短按钮文字 */}
                        <Button
                            variant="outline"
                            onClick={() => {
                                router.push(pathname + "?" + createQueryString("print", print ? "" : "1"))
                                if (!print) {
                                    // 切换到打印模式时保持 popover 打开
                                    // setPopoverOpen(false)
                                } else {
                                    // 切换到浏览模式时关闭 popover
                                    setPopoverOpen(false)
                                }
                            }}
                            className="w-full text-sm"
                        >
                            {print ? "浏览模式" : "打印模式"}
                        </Button>
                    </div>

                    {/* 导航链接 */}
                    <div className="space-y-2 border-t pt-3">
                        <h4 className="text-xs font-medium text-gray-700 text-center">快速导航</h4>
                        <div className="space-y-2">
                            <Link
                                href={`http://192.168.171.3:3765/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/ALL`}
                                className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
                                onClick={() => setPopoverOpen(false)}
                            >
                                流转(流程)
                            </Link>
                            {print ? (
                                <Link
                                    href="/"
                                    className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
                                    onClick={() => setPopoverOpen(false)}
                                >
                                    回首页
                                </Link>
                            ) : (
                                <Link
                                    href={`/rep/${repId}/${template}/${verId}/?print=1${original ? "&original=1" : ""}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
                                    onClick={() => setPopoverOpen(false)}
                                >
                                    预览打印
                                </Link>
                            )}
                            <Link
                                href={`/rep/${repId}/${template}/${verId}/ALL`}
                                className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
                                onClick={() => setPopoverOpen(false)}
                            >
                                原始记录列表
                            </Link>
                        </div>
                    </div>

                    {/* 打印相关功能 - 只在打印模式下显示 */}
                    {print && !action && (
                        <div className="space-y-3 border-t pt-3">
                            <h4 className="text-xs font-medium text-gray-700 text-center">打印功能</h4>

                            {/* 预览和本机转pdf按钮 */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => window.print()} className="text-sm">
                                    预览
                                </Button>
                                <Button variant="outline" onClick={handlePDFGeneration} disabled={isMutating} className="text-sm">
                                    {isMutating ? "生成中..." : "本机转pdf"}
                                </Button>
                            </div>

                            {/* PDF转换区域 */}
                            <div>
                                {pdfStatus === "idle" && pdfUri ? (
                                    <div className="space-y-2">
                                        <Link
                                            href={`${process.env.NEXT_PUBLIC_OSS_ENDP}${pdfUri}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                                            onClick={() => setPopoverOpen(false)}
                                        >
                                            有pdf版
                                        </Link>
                                        <Button variant="ghost" size="sm" onClick={() => setPdfStatus("redo")} className="w-full text-xs">
                                            后端再转
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-600 text-center">设置保留期限</div>
                                        {/* 数值和单位输入组合 */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="col-span-2">
                                                <Input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={retentionValue}
                                                    onChange={handleValueChange}
                                                    onFocus={handleInputFocus}
                                                    onBlur={handleInputBlur}
                                                    className="bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm text-sm"
                                                    placeholder="数值"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    spellCheck={false}
                                                    // 关键：防止 iOS Safari 的自动缩放和键盘收起
                                                    style={{
                                                        fontSize: "16px",
                                                        WebkitAppearance: "none",
                                                        WebkitUserSelect: "text",
                                                    }}
                                                    // 添加这些属性来改善移动端体验
                                                    data-form-type="other"
                                                    data-lpignore="true"
                                                />
                                            </div>
                                            <div>
                                                <Select value={retentionUnit} onValueChange={handleUnitChange}>
                                                    <SelectTrigger className="bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm text-sm">
                                                        <SelectValue placeholder="单位" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="day">天</SelectItem>
                                                        <SelectItem value="month">月</SelectItem>
                                                        <SelectItem value="year">年</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={handlePdfFlow}
                                            disabled={isProcessing}
                                            className="w-full text-sm"
                                        >
                                            {isProcessing ? "发起申请中..." : "后端转pdf"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    ))

    return (
        <div id="EndOfRep" className="print:hidden text-center mb-4 md:mb-0">
            {/* 统一的 Popover 布局 */}
            <div className={cn("flex justify-center", fixBtn ? "fixed bottom-4 left-1/2 -translate-x-1/2 z-50" : "m-2")}>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "shadow-lg",
                                fixBtn ? "bg-white/95 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400" : "",
                            )}
                        >
                            报告操作
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" align="center" side="top" sideOffset={5}>
                        <PopoverContent_All />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
