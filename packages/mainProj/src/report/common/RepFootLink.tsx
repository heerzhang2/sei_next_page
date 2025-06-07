"use client";
import * as React from "react";
import {useState, useEffect} from "react"
import Link from "next/link"
// import { Link  } from "next/navigation"
import {Button} from "@/components/ui";
import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import {cn} from "@/lib/utils";
import {usePrintPdf} from "@/hooks/usePrintPdf";
import {toast} from "sonner";
import {useCreateQueryString} from "@/hooks/useCreateQueryString";
import {startProcess} from "@/actions/camunda-actions";
import {ConfigRoot, FileTransform} from "page2pdf_server/src";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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

  // 屏幕尺寸检测
  const [isMobile, setIsMobile] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // 当切换到浏览模式时关闭 popover
  useEffect(() => {
    if (!print) {
      setPopoverOpen(false)
    }
  }, [print])

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

  // 新的状态管理 - 分开存储数值和单位
  const [retentionValue, setRetentionValue] = useState("1")
  const [retentionUnit, setRetentionUnit] = useState<TimeUnit>("month")
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "redo">("idle")
  const pdfUri = original ? rep?.link?.ori : rep?.link?.rep
  const [isProcessing, setIsProcessing] = useState(false)

  // 根据单位和数值计算天数
  const calculateDays = (value: string, unit: TimeUnit): number => {
    const numValue = Number.parseInt(value, 10) || 1 // 默认为1，如果解析失败

    switch (unit) {
      case "day":
        return numValue
      case "month":
        return numValue * 30 // 简化计算，一个月按30天
      case "year":
        return numValue * 365 // 简化计算，一年按365天
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

  // 处理数值变化
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字
    const value = e.target.value.replace(/[^\d]/g, "")
    setRetentionValue(value)
  }

  // 处理单位变化
  const handleUnitChange = (value: TimeUnit) => {
    setRetentionUnit(value)
  }

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

  const handlePrintModeClick = () => {
    if (isMobile && !print) {
      // 小屏幕下，点击打印模式时先切换模式再打开 popover
      router.push(pathname + "?" + createQueryString("print", "1"))
      setPopoverOpen(true)
    } else if (isMobile && print) {
      // 小屏幕下，已经是打印模式时，切换 popover 状态
      setPopoverOpen(!popoverOpen)
    } else {
      // 大屏幕下，正常切换模式
      router.push(pathname + "?" + createQueryString("print", print ? "" : "1"))
    }
  }

  const handleBrowseModeClick = () => {
    setPopoverOpen(false)
    router.push(pathname + "?" + createQueryString("print", ""))
  }

  // 主要内容组件
  const MainContent = () => (
      <div className="space-y-4">
        {/* 导航链接 */}
        <div className="space-y-2">
          <Link
              href={`http://192.168.171.3:3765/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/ALL`}
              className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
          >
            流转(流程)
          </Link>
          <Link
              href={`/rep/${repId}/${template}/${verId}/ALL`}
              className="text-blue-600 hover:text-blue-800 text-sm block px-3 py-2 rounded-lg hover:bg-gray-50 text-center"
          >
            原始记录列表
          </Link>
        </div>

        {/* 打印相关控件 */}
        {print && (
            <div className="space-y-3 border-t pt-3">
              {/* 预览和本机转pdf按钮 */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()} className="flex-1">
                  预览
                </Button>
                <Button variant="outline" onClick={handlePDFGeneration} disabled={isMutating} className="flex-1">
                  {isMutating ? "生成中..." : "本机转pdf"}
                </Button>
              </div>

              {/* PDF转换区域 */}
              <div>
                {pdfStatus === "idle" && pdfUri ? (
                    <div className="flex flex-col gap-2">
                      <Link
                          href={`${process.env.NEXT_PUBLIC_OSS_ENDP}${pdfUri}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        有pdf版
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setPdfStatus("redo")}>
                        后端再转
                      </Button>
                    </div>
                ) : (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      {/* 新的数值和单位输入组合 */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                              type="text"
                              value={retentionValue}
                              onChange={handleValueChange}
                              className="bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm"
                              placeholder="数值"
                              inputMode="numeric"
                          />
                        </div>
                        <div className="w-24">
                          <Select value={retentionUnit} onValueChange={handleUnitChange as (value: string) => void}>
                            <SelectTrigger className="bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm">
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
                      <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing} className="w-full">
                        {isProcessing ? "发起申请中..." : "后端转pdf"}
                      </Button>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  )

  return (
      <div id="EndOfRep" className="print:hidden text-center mb-4 md:mb-0">
        <Link href="/" passHref className="text-blue-600 hover:text-blue-800 block text-sm mb-4 md:mb-0 md:inline-block">
          -报告完毕,返回-
        </Link>

        {/* 大屏幕布局 */}
        {!isMobile && (
            <>
              <div
                  className={cn(
                      "text-center space-y-3 md:space-y-0 md:space-x-4 md:flex md:justify-around md:flex-wrap",
                      fixBtn ? "mb-12" : "",
                  )}
              >
                <div className="mx-auto">
                  <Link
                      href={`http://192.168.171.3:3765/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1/ALL`}
                      className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    流转(流程)
                  </Link>
                </div>
                <div className="mx-auto">
                  {print ? (
                      <Link
                          href="/"
                          className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        回首页
                      </Link>
                  ) : (
                      <Link
                          href={`/rep/${repId}/${template}/${verId}/?print=1${original ? "&original=1" : ""}`}
                          className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        预览打印
                      </Link>
                  )}
                </div>
                <div className="mx-auto">
                  <Link
                      href={`/rep/${repId}/${template}/${verId}/ALL`}
                      className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    原始记录列表
                  </Link>
                </div>
              </div>
              <div
                  className={cn(
                      "m-2 flex flex-col gap-3 print:hidden",
                      fixBtn ? "fixed bottom-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4" : "",
                  )}
              >
                <Button
                    variant="outline"
                    onClick={() => router.push(pathname + "?" + createQueryString("original", original ? "" : "1"))}
                >
                  {original ? "正式报告" : "原始记录"}
                </Button>
                {!action && (
                    <>
                      <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => router.push(pathname + "?" + createQueryString("print", print ? "" : "1"))}
                        >
                          {print ? "浏览模式" : "打印模式"}
                        </Button>
                      </div>
                      {print && (
                          <div className="flex flex-col gap-3 w-full">
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" onClick={() => window.print()}>
                                预览
                              </Button>
                              <Button variant="outline" onClick={handlePDFGeneration} disabled={isMutating}>
                                {isMutating ? "生成中..." : "本机转pdf"}
                              </Button>
                            </div>
                            <div className="flex justify-center">
                              {pdfStatus === "idle" && pdfUri ? (
                                  <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <Link
                                        href={`${process.env.NEXT_PUBLIC_OSS_ENDP}${pdfUri}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                    >
                                      有pdf版
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={() => setPdfStatus("redo")}>
                                      后端再转
                                    </Button>
                                  </div>
                              ) : (
                                  <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm">
                                    {/* 新的数值和单位输入组合 - 大屏幕版本 */}
                                    <div className="flex gap-2 items-center">
                                      <Input
                                          type="text"
                                          value={retentionValue}
                                          onChange={handleValueChange}
                                          className="w-20 bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm"
                                          placeholder="数值"
                                          inputMode="numeric"
                                      />
                                      <Select value={retentionUnit} onValueChange={handleUnitChange as (value: string) => void}>
                                        <SelectTrigger className="w-20 bg-white border-2 border-blue-200 focus:border-blue-400 shadow-sm">
                                          <SelectValue placeholder="单位" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="day">天</SelectItem>
                                          <SelectItem value="month">月</SelectItem>
                                          <SelectItem value="year">年</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                                      {isProcessing ? "发起申请中..." : "后端转pdf"}
                                    </Button>
                                  </div>
                              )}
                            </div>
                          </div>
                      )}
                    </>
                )}
              </div>
            </>
        )}

        {/* 小屏幕布局 */}
        {isMobile && (
            <div
                className={cn(
                    "flex flex-col gap-3 print:hidden",
                    fixBtn ? "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4" : "m-2",
                )}
            >
              {/* 固定的两个按钮 - 同一行 */}
              <div className="flex gap-2 justify-center">
                <Button
                    variant="outline"
                    onClick={() => router.push(pathname + "?" + createQueryString("original", original ? "" : "1"))}
                    className="flex-1"
                >
                  {original ? "正式报告" : "原始记录"}
                </Button>

                {!action && (
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            onClick={print ? handlePrintModeClick : handlePrintModeClick}
                            className="flex-1"
                        >
                          {print ? "浏览模式" : "打印模式"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="center" side="top">
                        <MainContent />
                      </PopoverContent>
                    </Popover>
                )}
              </div>

              {/* 浏览模式按钮 - 单独处理 */}
              {!action && print && (
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={handleBrowseModeClick}>
                      切换到浏览模式
                    </Button>
                  </div>
              )}
            </div>
        )}
      </div>
  )
}
