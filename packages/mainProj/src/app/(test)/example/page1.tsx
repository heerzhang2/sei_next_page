"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputDatalist } from "@/components/chub"
import * as React from "react";
import {cn} from "@/lib/utils";
import Link from "next/link";

export default function ExamplePage() {
  const [displayValue, setDisplayValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const retentionOptions = [
    { label: "7天" },
    { label: "15天" },
    { label: "30天" },
    { label: "60天" },
    { label: "90天" },
  ]

  const handlePeriodChange = (value: string) => {
    setDisplayValue(value)
  }

  const handlePdfFlow = () => {
    setIsProcessing(true)
    // 模拟处理
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  return (
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">修复版输入组件</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">不同宽度测试</h2>

            {/* 测试不同宽度 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">宽度 140px</label>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <InputDatalist
                      id="ccts1"
                      placeholder="天数"
                      datalist={retentionOptions.map((a) => a.label)}
                      value={displayValue}
                      onListChange={handlePeriodChange}
                      className="w-[140px]"
                  />
                  <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                    {isProcessing ? "发起申请中..." : "后端转pdf"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">宽度 100px</label>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <InputDatalist
                      id="ccts2"
                      placeholder="天数"
                      datalist={retentionOptions.map((a) => a.label)}
                      value={displayValue}
                      onListChange={handlePeriodChange}
                      className="w-[100px]"
                  />
                  <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                    {isProcessing ? "发起申请中..." : "后端转pdf"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">宽度 80px</label>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <InputDatalist
                      id="ccts3"
                      placeholder="天数"
                      datalist={retentionOptions.map((a) => a.label)}
                      value={displayValue}
                      onListChange={handlePeriodChange}
                      className="w-[80px]"
                  />
                  <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                    {isProcessing ? "发起申请中..." : "后端转pdf"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">全宽度</label>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <InputDatalist
                      id="ccts4"
                      placeholder="天数"
                      datalist={retentionOptions.map((a) => a.label)}
                      value={displayValue}
                      onListChange={handlePeriodChange}
                      className="w-full max-w-xs"
                  />
                  <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                    {isProcessing ? "发起申请中..." : "后端转pdf"}
                  </Button>
                </div>
              </div>

              <div
                  className={cn("m-2 flex justify-around items-center gap-2 print:hidden",  "fixed bottom-0 w-full")}
              >
                <Button
                    variant="outline"
                >
                  原始记录
                </Button>
                    <>
                      <Button
                          variant="outline"
                      >
                        浏览模式
                      </Button>
                      {true && (
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => window.print()}>
                                预览
                              </Button>
                              <Button variant="outline" >
                               本机转pdf
                              </Button>
                            </div>

                            {/* PDF转换区域 */}
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                              {false ? (
                                  // 显示PDF链接
                                  <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <Link
                                        href={`${process.env.NEXT_PUBLIC_OSS_ENDP}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                    >
                                      有pdfrr版
                                    </Link>
                                    <Button variant="ghost" size="sm"
                                            onClick={() => void 0}
                                    >
                                      后端rr再转
                                    </Button>
                                  </div>
                              ) : (
                                  // 显示转换控件
                                  <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <InputDatalist id="ccts"
                                                   placeholder="天数"
                                                   datalist={retentionOptions.map((a) => a.label)}
                                                   value={displayValue}
                                                   onListChange={handlePeriodChange}
                                                   className="w-[140px]"
                                    />
                                    <Button variant="outline" onClick={handlePdfFlow} disabled={isProcessing}>
                                      {isProcessing ? "发起rr申请中..." : "后端rr转pdf"}
                                    </Button>
                                  </div>
                              )}
                            </div>
                          </div>
                      )}
                    </>


            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">修复内容:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>移除自定义下拉按钮</strong>: 避免与浏览器原生下拉按钮冲突
            </li>
            <li>
              <strong>修复按钮定位</strong>: 清除按钮现在正确定位在输入框内部
            </li>
            <li>
              <strong>适配小宽度</strong>: 在各种宽度下都能正确显示
            </li>
            <li>
              <strong>保留原生功能</strong>: 使用浏览器原生的下拉列表功能
            </li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">使用说明:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>点击输入框或右侧原生下拉按钮显示选项列表</li>
            <li>输入内容后，点击 X 按钮可清空输入</li>
            <li>清除按钮会自动避开原生下拉按钮的位置</li>
            <li>在各种宽度下都能正常工作</li>
          </ol>
        </div>
      </div>
      </div>
  )
}
