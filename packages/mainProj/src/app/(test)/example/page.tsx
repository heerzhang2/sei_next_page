"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputDatalist } from "@/components/input-datalist"
import { InputDatalistAlternative } from "@/components/input-datalist-alternative"
import { InputDatalistDynamic } from "@/components/input-datalist-dynamic"

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
      <h1 className="text-2xl font-bold">Chrome 自动填充问题解决方案</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">方案1: 禁用自动填充 + suppressHydrationWarning</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
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
          <h2 className="text-lg font-semibold mb-2">方案2: 使用 MutationObserver 清理属性</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <InputDatalistAlternative
              id="ccts2"
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
          <h2 className="text-lg font-semibold mb-2">方案3: 使用 Dynamic Import (无 SSR)</h2>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <InputDatalistDynamic
              id="ccts3"
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
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">解决方案说明:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>方案1</strong>: 添加 suppressHydrationWarning 和禁用自动填充属性
          </li>
          <li>
            <strong>方案2</strong>: 使用 MutationObserver 监听并移除 Chrome 添加的属性
          </li>
          <li>
            <strong>方案3</strong>: 使用 dynamic import 完全避免 SSR，只在客户端渲染
          </li>
        </ul>
      </div>
    </div>
  )
}
