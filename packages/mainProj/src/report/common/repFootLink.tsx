//src\report\common\repFootLink.tsx
"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ConfigRoot, FileTransform } from "page2pdf_server/src"
import { usePrintPdf } from "@/hooks/usePrintPdf"
import { toast } from "sonner"
import { useCreateQueryString } from "@/hooks/useCreateQueryString"
import { startPdfCvtProcess } from "@/actions/camunda-actions"
import { useState, useRef, useCallback, useMemo } from "react"
import type React from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useWindowSize } from "@/hooks/use-window-size"
import { type ReportPanelType, useEditControlContext } from "@/component/rep/editControl-provider"
import { RepLink } from "@/report/common/base"
import { ExternalLink, FileText, Share2 } from "lucide-react"

interface RepFootLinkProps {
    template?: string
    verId?: string
    repId?: string
    className?: string
    rep?: any
    pdf_job?: ConfigRoot<FileTransform>
    onLocalCvtFin?: () => void
    single?: boolean
    subrid?: string
}

type TimeUnit = "day" | "month" | "year"
/**报告底部的功能区：
 * v0dev帮忙解决fiexed元素scroll的告警问题
 * */
export function RepFootLink({
                                        template,
                                        verId,
                                        repId,
                                        rep,
                                        pdf_job,
                                        onLocalCvtFin,
                                        single,
                                        subrid,
                                        className = "",
                                    }: RepFootLinkProps) {
    const searchParams = useSearchParams()
    const print = "1" === searchParams!.get("print")
    const createQueryString = useCreateQueryString()
    const router = useRouter()
    const pathname = usePathname()
    const { action } = useParams()
    const original = "1" === searchParams!.get("original")
    const { screenHeight, screenWidth } = useWindowSize()
    const [isMutating, handleSubmit] = usePrintPdf(pdf_job)
    // Popover 状态
    const [popoverOpen, setPopoverOpen] = useState(false)
    // 输入框引用
    const inputRef = useRef<HTMLInputElement>(null)
    // 状态管理
    const [retentionValue, setRetentionValue] = useState("1")
    const [retentionUnit, setRetentionUnit] = useState<TimeUnit>("year")
    const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "redo">("idle")
    const pdfUri = original ? rep?.link?.ori : rep?.link?.rep
    const [isProcessing, setIsProcessing] = useState(false)
    const { activeTab, setActiveTab } = useEditControlContext()

    // 根据屏幕宽度确定 Popover 宽度和布局
    const getPopoverConfig = useMemo(() => {
        if (screenWidth! >= 1024) {
            // 大屏幕：3列布局
            return {
                width: "w-[600px]",
                buttonCols: "grid-cols-3",
                navCols: "grid-cols-2",
                maxHeight: "max-h-[60vh]",
            }
        } else if (screenWidth! >= 768) {
            // 中屏幕：2列布局
            return {
                width: "w-[480px]",
                buttonCols: "grid-cols-2",
                navCols: "grid-cols-2",
                maxHeight: "max-h-[65vh]",
            }
        } else {
            // 小屏幕：1列布局
            return {
                width: "w-72",
                buttonCols: "grid-cols-1",
                navCols: "grid-cols-1",
                maxHeight: "max-h-[70vh]",
            }
        }
    }, [screenWidth])

    // 处理导航，禁用自动滚动
    const handleNavigation = useCallback(
        (url: string, closePopover = true, toTab?: ReportPanelType) => {
            if (closePopover) {
                setPopoverOpen(false)
            }
            // 使用 scroll: false 禁用自动滚动行为
            router.push(url, { scroll: false })
            if (setActiveTab !== null && toTab) {
                setActiveTab(toTab!)
            }
        },
        [router],
    )

    const handlePDFGeneration = () => {
        if (!handleSubmit) {
            toast.error("操作失败", {
                description: "请确认文书打印转换器在运行",
            })
        } else {
            handleSubmit()
                .then(() => {
                    onLocalCvtFin?.()
                })
                .catch((error) => {
                    toast.error("操作失败", {
                        description: "请确认文书打印转换器在运行" + error,
                    })
                })
        }
    }

    // 根据单位和数值计算天数
    const calculateDays = useCallback((value: string, unit: TimeUnit): number => {
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
    }, [])

    // 获取过期日期
    const getExpirationDate = useCallback(
        (value: string, unit: TimeUnit): string => {
            const days = calculateDays(value, unit)
            const expiration = new Date()
            expiration.setDate(expiration.getDate() + days)
            expiration.setUTCHours(0, 0, 0, 0)
            return expiration.toISOString()
        },
        [calculateDays],
    )

    // 处理数值变化
    const handleValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value.replace(/[^\d]/g, "")

            if (newValue !== retentionValue) {
                setRetentionValue(newValue)
            }
        },
        [retentionValue],
    )

    // 处理单位变化
    const handleUnitChange = useCallback((value: TimeUnit) => {
        setRetentionUnit(value)
    }, [])

    // 获取显示文本
    const displayText = useMemo((): string => {
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
    }, [retentionValue, retentionUnit])

    const handlePdfFlow = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (isProcessing) return
            setIsProcessing(true)

            const isoDate = getExpirationDate(retentionValue, retentionUnit)

            try {
                const { success, error, processInstanceKey } = (await startPdfCvtProcess({
                    processId: "genRepPdf",
                    variables: {
                        pdfJob: pdf_job,
                        pdfType: !single && original ? "ori" : "rep",
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
        },
        [isProcessing, getExpirationDate, retentionValue, retentionUnit, displayText, pdf_job, original, repId, single],
    )

    const handleShareReport = async () => {
        if (!repId) {
            toast.error("无法分享", { description: "报告ID不存在" })
            return
        }

        const shareUrl = `${window.location.origin}/rep/${repId}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "报告分享",
                    text: `查看报告: ${template || "未知模板"} v${verId || "1.0"}`,
                    url: shareUrl,
                })
                toast.success("分享成功")
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("分享失败:", error)
                    fallbackShare(shareUrl)
                }
            }
        } else {
            fallbackShare(shareUrl)
        }
    }

    const fallbackShare = (url: string) => {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                toast.success("链接已复制到剪贴板")
            })
            .catch(() => {
                toast.error("复制失败", { description: "请手动复制链接" })
            })
    }

    const handleViewTemplate = () => {
        if (!template) {
            toast.error("模板信息不存在")
            return
        }

        toast.info("模板信息", {
            description: `模板: ${template}, 版本: ${verId || "1.0"}`,
            duration: 3000,
        })
    }

    const handlePrintReport = () => {
        window.print()
        toast.info("正在准备打印...")
    }

    // 数值输入组件
    const NumberInput = useMemo(
        () => (
            <Input
                name="_retds"
                ref={inputRef}
                type="text"
                value={retentionValue}
                onChange={handleValueChange}
                className="bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm text-sm"
                placeholder="数值"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={{
                    fontSize: "16px",
                    WebkitAppearance: "none",
                    WebkitUserSelect: "text",
                }}
                data-form-type="other"
                data-lpignore="true"
                key="retention-value-input"
            />
        ),
        [retentionValue, handleValueChange],
    )

    // 单位选择组件
    const UnitSelect = useMemo(
        () => (
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
        ),
        [retentionUnit, handleUnitChange],
    )

    // Popover 内容 - 响应式布局
    const PopoverContent_All = useMemo(
        () => (
            <ScrollArea className={cn("h-full overflow-auto", getPopoverConfig.maxHeight)} scrollHideDelay={0} type="always">
                <div className="viewport" style={{ scrollBehavior: "auto" }}>
                    <div className="space-y-4 p-2 mb-1">
                        {/* 主要功能按钮 - 响应式网格布局 */}
                        <div className="space-y-3">
                            <div className={cn("grid gap-2", getPopoverConfig.buttonCols)}>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newUrl = `/rep/${repId}/${template}/${verId}/?${print ? "" : "print=1"}${original ? "&original=1" : ""}`
                                        if (!print) {
                                            // 切换到打印模式时保持 popover 打开
                                            handleNavigation(newUrl, true)
                                        } else {
                                            // 切换到浏览模式时关闭 popover
                                            handleNavigation(newUrl, false)
                                        }
                                    }}
                                    className="text-xs h-8"
                                    size="sm"
                                >
                                    {print ? "浏览模式" : "准备打印"}
                                </Button>

                                {/* 打印功能按钮 - 只在打印模式下显示 */}
                                {print && !action && (
                                    <>
                                        <Button variant="outline" onClick={() => window.print()} className="text-xs h-8" size="sm">
                                            预览
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handlePDFGeneration}
                                            disabled={isMutating}
                                            className="text-xs h-8 bg-transparent"
                                            size="sm"
                                        >
                                            {isMutating ? "生成中..." : "本机转pdf"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 快速导航 - 响应式网格布局 */}
                        <div className="space-y-3 border-t pt-3">
                            <h4 className="text-xs font-medium text-gray-700 text-center">导航</h4>
                            <div className={cn("grid gap-2", getPopoverConfig.navCols)}>
                                <button
                                    onClick={() =>
                                        handleNavigation(`http://192.168.171.3:3765/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/ALL`)
                                    }
                                    className="text-blue-600 hover:text-blue-800 text-xs block px-2 py-1.5 rounded-md hover:bg-gray-50 text-center border border-gray-200"
                                >
                                    流转(流程)
                                </button>

                                <button
                                    onClick={() => handleNavigation("/")}
                                    className="text-blue-600 hover:text-blue-800 text-xs block px-2 py-1.5 rounded-md hover:bg-gray-50 text-center border border-gray-200"
                                >
                                    回首页
                                </button>
                                {!subrid && (
                                    <button
                                        onClick={() => handleNavigation(`/rep/${repId}/${template}/${verId}/ALL`, true, "editor")}
                                        className="text-blue-600 hover:text-blue-800 text-xs block px-2 py-1.5 rounded-md hover:bg-gray-50 text-center border border-gray-200"
                                    >
                                        原始记录列表
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* PDF转换区域 - 只在打印模式下显示 */}
                        {print && !action && (
                            <div className="space-y-3 border-t pt-3">
                                {pdfStatus === "idle" && pdfUri ? (
                                    <div className={cn("grid gap-2", screenWidth! >= 768 ? "grid-cols-5" : "grid-cols-3")}>
                                        <div className={cn(screenWidth! >= 768 ? "col-span-3" : "col-span-2")}>
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_OSS_ENDP}/${pdfUri}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-lime-200 text-red-500 hover:bg-gray-200 h-8 px-3 py-1 w-full"
                                                onClick={() => setPopoverOpen(false)}
                                            >
                                                有Pdf版
                                            </Link>
                                        </div>
                                        <div className={cn(screenWidth! >= 768 ? "col-span-2" : "col-span-1")}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPdfStatus("redo")}
                                                className="w-full text-xs h-6"
                                            >
                                                后端再转
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-600 text-center font-medium">设置Pdf保留期</div>
                                        {/* 数值和单位输入组合 - 响应式布局 */}
                                        <div className={cn("grid gap-2", screenWidth! >= 768 ? "grid-cols-7" : "grid-cols-3")}>
                                            <div className={cn(screenWidth! >= 768 ? "col-span-3" : "col-span-2")}>{NumberInput}</div>
                                            <div className={cn(screenWidth! >= 768 ? "col-span-2" : "col-span-1")}>{UnitSelect}</div>
                                            <div className={cn(screenWidth! >= 768 ? "col-span-2" : "col-span-1")}>
                                                <Button
                                                    variant="outline"
                                                    onClick={handlePdfFlow}
                                                    disabled={isProcessing}
                                                    className="w-full text-xs h-8 bg-transparent"
                                                    size="sm"
                                                >
                                                    {isProcessing ? "发起申请中..." : "后端转pdf"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        ),
        [
            getPopoverConfig,
            original,
            print,
            pathname,
            createQueryString,
            handleNavigation,
            repId,
            template,
            verId,
            action,
            isMutating,
            pdfStatus,
            pdfUri,
            isProcessing,
            NumberInput,
            UnitSelect,
            screenWidth,
        ],
    )

    return (
        <div id="EndOfRep" className={`print:hidden text-center mb-4 md:mb-0 ${className}`}>
            {/* 返回首页链接 */}
            <div className="text-right border-b pb-4 mb-8">
                {subrid && (
                    <RepLink rep={rep} tag="">
                        <div className="mr-8 text-blue-600 hover:text-blue-800 text-sm font-medium">-返回主报告-</div>
                    </RepLink>
                )}
                <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    -{!single && original ? "原始记录" : "报告"}完毕,返回-
                </Link>
            </div>
            <div
                className={cn(
                    "flex justify-center",
                    "fixed bottom-4 -translate-x-1/2 z-50",
                    screenHeight! < 500 ? "left-40" : screenWidth! < 500 ? "left-32 bottom-8" : "left-72",
                )}
            >
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm" // 新增：缩小按钮尺寸
                            className={cn(
                                "shadow-sm", // 修改：减小阴影
                                "px-2 py-1", // 修改：缩小内边距
                                "text-[0.8rem]", // 修改：缩小文字
                                "border-1", // 修改：减细边框
                                "bg-white/50 backdrop-blur-sm border-blue-300 hover:border-blue-400",
                                "hover:bg-slate-500/30", // 新增：半透明悬停效果
                                "transition-all duration-200", // 新增：过渡动画
                                "opacity-90", // 新增：基础透明度
                                screenHeight! < 500
                                    ? "h-6 w-10 rounded-xs gap-1 px-1 has-[>svg]:px-1.5"
                                    : screenWidth! < 500
                                        ? "h-8 w-8 rounded-xs gap-1 px-1 has-[>svg]:px-1.5"
                                        : "",
                            )}
                            data-scroll-ignore="true"
                        >
                            操作
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className={cn(getPopoverConfig.width, "print:hidden p-0")}
                        align="center"
                        side="top"
                        sideOffset={5}
                        data-scroll-ignore="true"
                    >
                        {PopoverContent_All}
                        <div className={cn("grid gap-2", screenWidth! >= 768 ? "grid-cols-7" : "grid-cols-5")}>
                            <Button
                                disabled={single}
                                variant="outline"
                                onClick={() => {
                                    const newUrl = pathname + "?" + createQueryString("original", original ? "" : "1")
                                    handleNavigation(newUrl, true)
                                }}
                                className={cn("text-xs h-8", screenWidth! >= 768 ? "col-span-2 col-end-4" : "col-span-2")}
                                size="sm"
                            >
                                {original ? "正式报告" : "原始记录"}
                            </Button>
                            <div className={cn("text-center border-b", screenWidth! >= 768 ? "col-span-3 col-end-8" : "col-span-3")}>
                                <Link href="#PHEAD" className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-6">
                                    -头部-
                                </Link>
                                <Link href="#PTAIL" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    -尾巴-
                                </Link>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center justify-between p-4 border-t bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4" />
                    <span>{template ? `${template} v${verId || "1.0"}` : "报告模板"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleViewTemplate} className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        模板信息
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handlePrintReport} className="text-xs">
                        打印
                    </Button>

                    <Button variant="ghost" size="sm" onClick={handleShareReport} className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        分享
                    </Button>
                </div>
            </div>
        </div>
    )
}
