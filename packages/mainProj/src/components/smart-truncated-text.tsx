"use client"
import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { cn } from "@/lib/utils"

interface SmartTruncatedTextProps {
  text: string
  uniqueKey?: string // 用于状态管理的唯一标识
  maxLines?: number
  className?: string
  containerClassName?: string
  onToggle?: (isExpanded: boolean) => void
}

// 全局状态管理： ？uniqueKey 唯一性冲突了:
const expandedTextsGlobal = new Map<string, boolean>()

// 获取字体配置
const getFontFamily = (): string => {
  if (typeof window !== "undefined") {
    const computedStyle = getComputedStyle(document.documentElement)
    const fontSans = computedStyle.getPropertyValue("--font-sans").trim()
    if (fontSans) {
      return fontSans
    }
  }
  return '"Noto Sans SC", "Source Han Sans SC", "Source Han Sans CN", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, -apple-system, sans-serif'
}

export const SmartTruncatedText: React.FC<SmartTruncatedTextProps> = ({
                                                                        text,
                                                                        className,
                                                                        maxLines = 2,
                                                                        containerClassName,
                                                                        onToggle,
                                                                        uniqueKey,
                                                                      }) => {
  const textRef = React.useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)

  // 生成唯一键
  const textKey = React.useMemo(() => {
    if (uniqueKey) {
      return uniqueKey
    }
    // 使用文本内容的 hash 作为唯一标识
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return `text-${Math.abs(hash)}`
  }, [text, uniqueKey])

  React.useEffect(() => {
    setIsClient(true)
    const storedExpandedState = expandedTextsGlobal.get(textKey) || false
    setIsExpanded(storedExpandedState)
  }, [textKey])

  // 检测文本是否溢出
  React.useEffect(() => {
    if (!isClient || !textRef.current || !text) return

    const checkOverflow = () => {
      if (!textRef.current) return

      // 临时移除 line-clamp 来检测原始高度
      const element = textRef.current
      const originalStyle = element.style.cssText

      // 暂时移除行数限制
      element.style.webkitLineClamp = "unset"
      element.style.display = "block"

      const scrollHeight = element.scrollHeight

      // 恢复行数限制
      element.style.cssText = originalStyle
      element.style.webkitLineClamp = maxLines.toString()
      element.style.display = "-webkit-box"

      const clientHeight = element.clientHeight

      // 如果内容高度大于显示高度，说明有溢出
      setIsOverflowing(scrollHeight > clientHeight)
    }

    // 延迟检测，确保样式已应用
    const timer = setTimeout(checkOverflow, 10)

    // 监听窗口大小变化
    const handleResize = () => {
      setTimeout(checkOverflow, 10)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", handleResize)
    }
  }, [text, maxLines, isClient])

  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    expandedTextsGlobal.set(textKey, newExpanded)
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
  }

  if (!text) return null

  return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative", containerClassName)}>
              <div
                  ref={textRef}
                  className={cn(
                      "bg-gray-100 px-2 py-1 rounded text-xs transition-all duration-200 select-text relative",
                      // 使用 CSS line-clamp 来限制行数
                      !isExpanded && `line-clamp-${maxLines}`,
                      isExpanded && "line-clamp-none",
                      isOverflowing && "cursor-pointer hover:bg-gray-200",
                      className,
                  )}
                  onClick={isOverflowing ? toggleExpanded : undefined}
                  style={{
                    fontFamily: getFontFamily(),
                    lineHeight: "var(--line-height-normal, 1.5)",
                    // 确保 line-clamp 生效的必要样式
                    display: isExpanded ? "block" : "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    wordBreak: "break-word",
                  }}
              >
                {text}

                {/* 省略号和操作提示 */}
                {isOverflowing && !isExpanded && <span className="text-blue-500 ml-1 font-medium">...</span>}
              </div>
{/*              {showDebugInfo && (
                  <div className="absolute -top-8 left-0 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow-sm opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
                    行数: {maxLines} | 溢出: {isOverflowing ? "是" : "否"} | 展开: {isExpanded ? "是" : "否"}
                  </div>
              )}*/}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-md">
            <p className="whitespace-pre-wrap text-sm" style={{ fontFamily: getFontFamily() }}>
              {text}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  )
}

/**判定文本超出容器 的Hook，供其他组件使用 ： ？ 针对打印预览场景的估计也不可使用textRef的。
 * @param textRef 文本的容器；
 * @param maxLines 固定显示几行的；
* */
export const useTextOverflow = (textRef: React.RefObject<HTMLElement>, maxLines: number) => {
  const [isOverflowing, setIsOverflowing] = React.useState(false)

  React.useEffect(() => {
    if (!textRef.current) return

    const checkOverflow = () => {
      if (!textRef.current) return

      const element = textRef.current
      const lineHeight = Number.parseInt(getComputedStyle(element).lineHeight)
      const maxHeight = lineHeight * maxLines

      setIsOverflowing(element.scrollHeight > maxHeight)
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)

    return () => window.removeEventListener("resize", checkOverflow)
  }, [maxLines])

  return isOverflowing
}
