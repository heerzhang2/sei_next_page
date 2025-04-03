"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"

// 定义打印设置类型
interface PrintSettings {
  paperSize: string
  paperMargin?: string
  customWidth?: string
  customHeight?: string
  isCustomSize: boolean
}

// 定义上下文类型
interface PrintSettingsContextType {
  settings: PrintSettings
  setPaperSize: (size: string) => void
  setPaperMargin: (margin?: string) => void
  setCustomPaperSize: (width: string, height: string) => void
  setIsCustomSize: (isCustom: boolean) => void
  resetSettings: () => void
}

// 创建上下文
const PrintSettingsContext = createContext<PrintSettingsContextType | undefined>(undefined)

// 默认设置
const DEFAULT_SETTINGS: PrintSettings = {
  paperSize: "A4",
  paperMargin: "1cm",
  customWidth: "210mm",
  customHeight: "297mm",
  isCustomSize: false,
}

// 修改 PrintSettingsProvider 组件
export function PrintSettingsProvider({
  children,
  initialSettings = DEFAULT_SETTINGS,
}: {
  children: ReactNode
  initialSettings?: PrintSettings
}) {
  const [settings, setSettings] = useState<PrintSettings>({ ...initialSettings })

  // 设置纸张尺寸
  const setPaperSize = useCallback((size: string) => {
    setSettings((prev) => ({ ...prev, paperSize: size }))
    console.log(`设置纸张尺寸: ${size}`)
  }, [])

  // 设置纸张边距
  const setPaperMargin = useCallback((margin?: string) => {
    setSettings((prev) => ({ ...prev, paperMargin: margin }))
    console.log(`设置纸张边距: ${margin || "默认"}`)
  }, [])

  // 设置自定义纸张尺寸
  const setCustomPaperSize = useCallback((width: string, height: string) => {
    setSettings((prev) => ({
      ...prev,
      customWidth: width,
      customHeight: height,
    }))
    console.log(`设置自定义纸张尺寸: ${width} x ${height}`)
  }, [])

  // 设置是否使用自定义尺寸
  const setIsCustomSize = useCallback((isCustom: boolean) => {
    setSettings((prev) => ({ ...prev, isCustomSize: isCustom }))
    console.log(`${isCustom ? "启用" : "禁用"}自定义纸张尺寸`)
  }, [])

  // 重置为默认设置
  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS })
    console.log("重置纸张设置为默认值")
  }, [])

  // 当设置变化时，更新全局CSS变量
  useEffect(() => {
    if (typeof document !== "undefined") {
      // 设置标准纸张尺寸
      document.documentElement.style.setProperty("--paper-size", settings.paperSize)
      document.documentElement.style.setProperty("--paper-margin", settings.paperMargin || "1cm")

      // 设置自定义纸张尺寸
      if (settings.customWidth && settings.customHeight) {
        document.documentElement.style.setProperty("--custom-paper-width", settings.customWidth)
        document.documentElement.style.setProperty("--custom-paper-height", settings.customHeight)
      }
    }
  }, [settings.paperSize, settings.paperMargin, settings.customWidth, settings.customHeight])

  return (
    <PrintSettingsContext.Provider
      value={{
        settings,
        setPaperSize,
        setPaperMargin,
        setCustomPaperSize,
        setIsCustomSize,
        resetSettings,
      }}
    >
      {children}
    </PrintSettingsContext.Provider>
  )
}

// 自定义Hook，用于访问打印设置
export function usePrintSettings() {
  const context = useContext(PrintSettingsContext)
  if (context === undefined) {
    throw new Error("usePrintSettings must be used within a PrintSettingsProvider")
  }
  return context
}

