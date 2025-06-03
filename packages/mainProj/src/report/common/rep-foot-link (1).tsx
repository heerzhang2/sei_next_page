"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// 假设这些是你的自定义hooks
// import { useCreateQueryString } from "@/hooks/use-create-query-string"
// import { startProcess } from "@/lib/process"

// 临时mock函数，你需要替换为实际的实现
const useCreateQueryString = () => {
  const searchParams = useSearchParams()
  return (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }
}

const startProcess = async (config: any) => {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: { pdfUrl: "https://example.com/generated-report.pdf" },
      })
    }, 2000)
  })
}

export const RepFootLink = ({
  template,
  verId,
  repId,
  rep,
  pdf_job,
  toPDF,
}: {
  template: string
  verId: string
  repId: string
  rep: any
  pdf_job: any
  toPDF: () => void
}) => {
  // ... 现有的状态和逻辑保持不变

  const searchParams = useSearchParams()
  const print = "1" === searchParams!.get("print")
  const createQueryString = useCreateQueryString()
  const router = useRouter()
  const pathname = usePathname()
  const { action } = useParams()
  const original = "1" === searchParams!.get("original")
  const fixBtn = !action

  // 新增状态管理
  const [retentionPeriod, setRetentionPeriod] = useState("30") // 默认30天
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // 保留期限选项
  const retentionOptions = [
    { value: "30", label: "1个月", days: 30 },
    { value: "365", label: "1年", days: 365 },
    { value: "1825", label: "5年", days: 1825 },
    { value: "3650", label: "10年", days: 3650 },
    { value: "10950", label: "30年", days: 10950 },
  ]

  const getExpirationDate = (days: number) => {
    const expiration = new Date()
    expiration.setDate(expiration.getDate() + days)
    expiration.setUTCHours(0, 0, 0, 0)
    return expiration.toISOString()
  }

  const handlePdfFlow = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isProcessing) return

    setIsProcessing(true)
    setPdfStatus("loading")

    const selectedOption = retentionOptions.find((opt) => opt.value === retentionPeriod)
    const retainDays = selectedOption?.days || 30
    const isoDate = getExpirationDate(retainDays)

    try {
      const { success, error, data } = (await startProcess({
        processId: "genRepPdf",
        variables: {
          pdfJob: pdf_job,
          pdfType: original ? "ori" : "rep",
          repId,
          expiration: isoDate,
        },
      })) as any

      if (success && data?.pdfUrl) {
        setPdfStatus("success")
        setPdfUrl(data.pdfUrl)
        toast.success(`PDF转换成功！保留期限：${selectedOption?.label}`, {
          description: "点击下方链接查看PDF文件",
        })
      } else {
        setPdfStatus("error")
        toast.error("PDF转换失败", { description: error || "未知错误" })
      }
    } catch (err) {
      setPdfStatus("error")
      toast.error("PDF转换失败", { description: "网络错误或服务异常" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div id="EndOfRep" className="print:hidden text-center mb-4 md:mb-0">
      {/* 现有内容保持不变 */}
      <Link href="/" passHref className="text-blue-600 hover:text-blue-800 block text-sm mb-4 md:mb-0 md:inline-block">
        -报告完毕,返回-
      </Link>

      {/* 现有的链接区域保持不变 */}
      <div
        className={cn(
          "text-center space-y-3 md:space-y-0 md:space-x-4 md:flex md:justify-around md:flex-wrap",
          fixBtn ? "mb-12" : "",
        )}
      >
        {/* 现有链接内容保持不变 */}
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

      {/* 按钮区域 - 添加防止布局偏移的样式 */}
      <div
        className={cn("m-2 flex justify-around items-center gap-2 print:hidden", fixBtn ? "fixed bottom-0 w-full" : "")}
        style={{
          // 防止滚动条导致的布局偏移
          marginRight: "calc(-1 * (100vw - 100%))",
        }}
      >
        {/* 现有按钮内容保持不变 */}
        <Button
          variant="outline"
          onClick={() => router.push(pathname + "?" + createQueryString("original", original ? "" : "1"))}
        >
          {original ? "正式报告" : "原始记录"}
        </Button>

        {action ? (
          <div />
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => router.push(pathname + "?" + createQueryString("print", print ? "" : "1"))}
            >
              {print ? "浏览模式" : "打印模式"}
            </Button>
            {print && (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    预览
                  </Button>
                  <Button variant="outline" onClick={toPDF}>
                    本机转pdf
                  </Button>
                </div>

                {/* PDF转换区域 */}
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  {pdfStatus === "success" && pdfUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Link
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        查看PDF文件
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPdfStatus("idle")
                          setPdfUrl("")
                        }}
                      >
                        重新转换
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      {/* 修改Select组件，添加防止布局偏移的属性 */}
                      <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="选择期限" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="max-h-[200px] overflow-y-auto">
                          {retentionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                        {isProcessing ? "转换中..." : "后端转pdf"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
