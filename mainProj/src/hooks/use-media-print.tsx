"use client"

import { useState, useCallback, useEffect } from "react"
import { usePrintSettings } from "../contexts/print-settings-context"
import { getPrintPreparation, measureAllCellsWithPrintMedia, measureCellHeightWithPrintMedia } from "../lib/print-utils"

// 修改 useMediaPrint hook，使用新的准确测量方法
export function useMediaPrint(
  autoInit = true,
  reloadAfterPrint = false,
  customPaperSize?: string,
  customPaperMargin?: string,
) {
  const { settings ,setIsCustomSize } = usePrintSettings()
  const [isMediaSwitching, setIsMediaSwitching] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // 使用传入的自定义纸张设置，如果没有则使用上下文中的设置
  const actualPaperSize = customPaperSize || settings.paperSize
  const actualPaperMargin = customPaperMargin || settings.paperMargin

  // 记录日志
  const log = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs((prevLogs) => [...prevLogs, logMessage])
    console.log(logMessage)
    return logMessage
  }, [])

  // 清除日志
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // 添加自定义纸张尺寸和边距的打印样式
  const addCustomPaperStyles = useCallback(() => {
    // 移除旧的样式
    const oldStyle = document.getElementById("custom-paper-style")
    if (oldStyle) {
      oldStyle.remove()
    }

    // 创建新的样式元素
    const style = document.createElement("style")
    style.id = "custom-paper-style"

    // 设置CSS变量，以便在测量时使用
    document.documentElement.style.setProperty("--paper-size", actualPaperSize)
    document.documentElement.style.setProperty("--paper-margin", actualPaperMargin || "1cm")

    // 检查 paperSize 是否是自定义尺寸（包含空格，表示宽度和高度）
    const isCustomSize = actualPaperSize.includes(" ")

    // 如果是自定义尺寸，设置宽度和高度变量
    if (isCustomSize) {
      setIsCustomSize(true)
      const [width, height] = actualPaperSize.split(/\s+/)
      document.documentElement.style.setProperty("--custom-paper-width", width)
      document.documentElement.style.setProperty("--custom-paper-height", height)
      document.documentElement.style.setProperty("--paper-size", "custom")
    }

    // 构建样式内容 - 注意：这里不再设置方向，让CSS类处理方向
    let styleContent = `
    @media print {
      @page {
        size: ${isCustomSize ? actualPaperSize : actualPaperSize};
    `

    // 添加边距（如果提供）
    if (actualPaperMargin) {
      styleContent += `
        margin: ${actualPaperMargin};
    `
    }

    styleContent += `
      }
      
      /* 确保CSS类方向控制正常工作 */
      .print-landscape {
        page: landscape !important;
      }
      
      /* 自定义尺寸纸张类 */
      .print-custom-portrait {
        page: custom-portrait !important;
      }
      
      .print-custom-landscape {
        page: custom-landscape !important;
      }
      
      /* 自定义尺寸纸张页面定义 */
      @page custom-portrait {
        size: ${isCustomSize ? actualPaperSize : actualPaperSize};
        margin: ${actualPaperMargin || "1cm"};
      }
      
      @page custom-landscape {
        size: ${isCustomSize ? actualPaperSize.split(/\s+/).reverse().join(" ") : actualPaperSize + " landscape"};
        margin: ${actualPaperMargin || "1cm"};
      }
      
      /* 横向页面定义 */
      @page landscape {
        size: ${isCustomSize ? actualPaperSize.split(/\s+/).reverse().join(" ") : actualPaperSize + " landscape"};
        margin: ${actualPaperMargin || "1cm"};
      }
    }
    `

    style.textContent = styleContent
    document.head.appendChild(style)

    log(`已添加自定义纸张样式: 尺寸=${actualPaperSize}${actualPaperMargin ? `, 边距=${actualPaperMargin}` : ""}`)

    return () => {
      if (document.getElementById("custom-paper-style")) {
        document.getElementById("custom-paper-style")?.remove()
      }
    }
  }, [actualPaperSize, actualPaperMargin, log])

  // 测量单个单元格的 高度
  const measureSingleCell = useCallback(
    (cell: HTMLElement) => {
      if (!cell) {
        log("错误: 未提供有效的单元格元素")
        return 0
      }

      log(`开始使用准确测量方法测量单元格...`)
      setIsMediaSwitching(true)

      try {
        // 确保单元格有ID
        if (!cell.dataset.cellId) {
          cell.dataset.cellId = `cell-${Date.now()}`
        }

        // 先添加自定义纸张样式
        addCustomPaperStyles()

        // 使用准确测量方法测量单元格
        const height = measureCellHeightWithPrintMedia(cell)

        log(`单元格 ${cell.dataset.cellId} 测量高度: ${height}px`)

        setIsMediaSwitching(false)
        return height
      } catch (error) {
        log(`测量单元格时出错: ${error instanceof Error ? error.message : String(error)}`)
        setIsMediaSwitching(false)
        return 0
      }
    },
    [log, addCustomPaperStyles],
  )

  // 测量所有单元格
  const measureAllCells = useCallback(() => {
    log("开始使用准确测量方法测量所有重要单元格")
    setIsMediaSwitching(true)

    try {
      // 先添加自定义纸张样式
      addCustomPaperStyles()

      // 测量所有单元格
      const result = measureAllCellsWithPrintMedia()

      log("完成测量所有单元格高度 (使用准确测量方法)")
      setIsMediaSwitching(false)
      return result
    } catch (error) {
      log(`测量所有单元格时出错: ${error instanceof Error ? error.message : String(error)}`)
      setIsMediaSwitching(false)
      return false
    }
  }, [log, addCustomPaperStyles])

  // 准备打印
  const preparePrint = useCallback(() => {
    log("使用准确测量方法准备打印...")
    setIsMediaSwitching(true)

    try {
      // 获取打印准备实例
      const printPrep = getPrintPreparation()

      // 设置打印后是否应该刷新页面
      printPrep.shouldReloadAfterPrint = reloadAfterPrint

      // 添加自定义纸张样式
      addCustomPaperStyles()

      // 测量所有单元格
      measureAllCells()

      // 准备打印
      printPrep.prepareForPrint()

      log("打印准备完成 (使用准确测量方法)")
      setIsMediaSwitching(false)
      return true
    } catch (error) {
      log(`准备打印时出错: ${error instanceof Error ? error.message : String(error)}`)
      setIsMediaSwitching(false)
      return false
    }
  }, [log, reloadAfterPrint, addCustomPaperStyles, measureAllCells])

  // 触发打印
  const triggerPrint = useCallback(() => {
    log("触发打印 (使用准确测量方法)...")
    setIsPrinting(true)

    try {
      preparePrint()

      // 给一点时间让准备完成
      setTimeout(() => {
        window.print()
      }, 500)

      return true
    } catch (error) {
      log(`触发打印时出错: ${error instanceof Error ? error.message : String(error)}`)
      setIsPrinting(false)
      return false
    }
  }, [log, preparePrint])

  // 监听打印事件
  useEffect(() => {
    if (typeof window === "undefined") return

    // 在打印开始前设置状态
    const handleBeforePrint = () => {
      log("检测到打印请求（通过浏览器或快捷键）")
      setIsPrinting(true)

      // 确保打印前的准备工作已完成
      preparePrint()
    }

    // 打印完成后处理
    const handleAfterPrint = () => {
      log("打印完成")

      // 如果启用了打印后重新加载，则重新加载页面
      if (reloadAfterPrint) {
        log("准备重新加载页面...")

        // 使用短暂延迟确保所有打印后处理已完成
        setTimeout(() => {
          log("重新加载页面")
          window.location.reload()
        }, 100)
      } else {
        // 短暂延迟后重置打印状态
        setTimeout(() => {
          setIsPrinting(false)
        }, 300)
      }
    }

    window.addEventListener("beforeprint", handleBeforePrint)
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [log, preparePrint, reloadAfterPrint])

  // 自动初始化
  useEffect(() => {
    if (autoInit && typeof window !== "undefined") {
      log("媒体类型切换打印助手已加载")

      // 添加自定义纸张样式
      const cleanup = addCustomPaperStyles()

      // 检查URL参数是否包含print=true
      const urlParams = new URLSearchParams(window.location.search)
      const shouldPrint = urlParams.get("print") === "true"

      if (shouldPrint) {
        log("检测到print=true参数，自动准备打印...")

        // 等待DOM完全加载
        if (document.readyState === "complete" || document.readyState === "interactive") {
          // 给一点时间让所有内容渲染完成
          setTimeout(() => {
            preparePrint()
          }, 1000)
        } else {
          // 等待DOMContentLoaded事件
          window.addEventListener("DOMContentLoaded", () => {
            setTimeout(() => {
              preparePrint()
            }, 1000)
          })
        }
      }

      return cleanup
    }
  }, [autoInit, log, preparePrint, addCustomPaperStyles])

  return {
    isMediaSwitching,
    isPrinting,
    logs,
    log,
    clearLogs,
    measureSingleCell,
    measureAllCells,
    preparePrint,
    triggerPrint,
    paperSize: actualPaperSize,
    paperMargin: actualPaperMargin,
  }
}
