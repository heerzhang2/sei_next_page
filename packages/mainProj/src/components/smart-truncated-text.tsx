"use client"
import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui"
import { cn } from "@/lib/utils"


// 全局状态管理 - 可以替换为 zustand 或其他状态管理库
const expandedTextsGlobal = new Map<string, boolean>()

// 字体配置 - 从 CSS 变量中读取或使用默认值
const getFontFamily = (): string => {
  if (typeof window !== "undefined") {
    const computedStyle = getComputedStyle(document.documentElement)
    const fontSans = computedStyle.getPropertyValue("--font-sans").trim()
    if (fontSans) {
      return fontSans
    }
  }
  // 默认中文字体配置
  return '"Noto Sans SC", "Source Han Sans SC", "Source Han Sans CN", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, -apple-system, sans-serif'
}

// 自定义 Hook 用于动态计算字符限制
const useResponsiveCharLimit = () => {
  const [charLimit, setCharLimit] = React.useState(50)
  const [containerWidth, setContainerWidth] = React.useState(0)

  React.useEffect(() => {
    const updateCharLimit = () => {
      const width = window.innerWidth

      // 根据屏幕宽度设置不同的字符限制
      let baseLimit: number
      if (width < 640) {
        // sm - 移动端
        baseLimit = 15
      } else if (width < 768) {
        // md - 小平板
        baseLimit = 25
      } else if (width < 1024) {
        // lg - 平板
        baseLimit = 40
      } else if (width < 1280) {
        // xl - 桌面
        baseLimit = 60
      } else {
        // 2xl+ - 大屏
        baseLimit = 80
      }

      setCharLimit(baseLimit)
      setContainerWidth(width)
    }

    updateCharLimit()
    window.addEventListener("resize", updateCharLimit)
    return () => window.removeEventListener("resize", updateCharLimit)
  }, [])

  return { charLimit, containerWidth }
}

// 文本测量工具函数 - 支持中文字体
const measureTextWidth = (text: string, fontSize = 12, fontFamily?: string): number => {
  if (typeof window === "undefined") return text.length * 8 // SSR fallback

  // 创建一个临时的 canvas 来测量文本宽度
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) {
    // fallback: 中文字符按1.5倍英文字符宽度计算
    const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const otherCharCount = text.length - chineseCharCount
    return chineseCharCount * fontSize * 1.2 + otherCharCount * fontSize * 0.6
  }

  const font = fontFamily || getFontFamily()
  context.font = `${fontSize}px ${font}`
  return context.measureText(text).width
}

/**根据容器宽度计算可显示的字符数
  @param reservW  水平方向的预留空间给 padding、边框等；
* */
const calculateMaxChars = (text: string, containerWidth: number,reservW: number, fontSize = 12, fontFamily?: string): number => {
  if (!text || containerWidth <= 0) return 0

  // 预留空间给 padding、边框等
  const availableWidth = containerWidth-reservW;  //* 0.75 75% 的可用宽度
  const textWidth = measureTextWidth(text, fontSize, fontFamily)

  if (textWidth <= availableWidth) {
    return text.length // 文本完全可以显示
  }

  // 二分查找最适合的字符数
  let left = 0
  let right = text.length
  let maxChars = 0

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const substring = text.substring(0, mid)
    const substringWidth = measureTextWidth(substring, fontSize, fontFamily)

    if (substringWidth <= availableWidth) {
      maxChars = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return Math.max(8, maxChars) // 至少显示8个字符
}

interface SmartTruncatedTextProps {
  text: string
  className?: string
  //预计能显示几行
  maxLines?: number
  fontSize?: number
  fontFamily?: string
  containerClassName?: string
  //通知外部的
  onToggle?: (isExpanded: boolean) => void
  //【APP范围】全局状态？唯一
  uniqueKey?: string // 用于状态管理的唯一标识
  //
  reservW?: number
}
/**限定文本超出区域显示。
实际影响因素还差一个没有配置参数的：lineHeight: "var(--line-height-normal, 1.5)" 这个没有，不能期望在className自行再设置文本这个属性。
* */
export const SmartTruncatedText: React.FC<SmartTruncatedTextProps> = ({
  text,
  className,
  maxLines = 2,
  reservW=10,
  fontSize = 12,
  fontFamily,
  containerClassName,
  onToggle,
  uniqueKey,
}) => {
  const textRef = React.useRef<HTMLDivElement>(null)
  const [shouldTruncate, setShouldTruncate] = React.useState(false)
  const [actualCharLimit, setActualCharLimit] = React.useState(50)
  const [isClient, setIsClient] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)

  // 使用响应式字符限制
  const { charLimit, containerWidth } = useResponsiveCharLimit()

  // 生成唯一键
  const textKey =
    uniqueKey ||
    React.useMemo(() => {
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

  React.useEffect(() => {
    if (!isClient || !textRef.current || !text) return

    const updateTruncation = () => {
      if (!textRef.current) return

      const containerWidth = textRef.current.offsetWidth
      const maxChars = calculateMaxChars(text, containerWidth, reservW, fontSize, fontFamily)
      const needsTruncation = text.length > maxChars

      setShouldTruncate(needsTruncation)
      setActualCharLimit(maxChars)
    }

    updateTruncation()

    // 使用 ResizeObserver 监听容器大小变化
    const resizeObserver = new ResizeObserver(updateTruncation)
    if (textRef.current) {
      resizeObserver.observe(textRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [text, containerWidth, charLimit, fontSize, fontFamily, isClient])

  const toggleExpanded = () => {
    const newExpanded = !isExpanded
    expandedTextsGlobal.set(textKey, newExpanded)
    setIsExpanded(newExpanded)
    onToggle?.(newExpanded)
    // 强制重新渲染
    setActualCharLimit((prev) => prev + (newExpanded ? 0.1 : -0.1))
  }

  if (!text) return null
  //短截取做法的
  const displayText = shouldTruncate && !isExpanded ? text.substring(0, actualCharLimit) + "..." : text

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative", containerClassName)}>
            <div
              ref={textRef}
              className={cn(
                "bg-gray-100 px-2 py-1 rounded text-xs transition-all duration-200 select-text relative",
                shouldTruncate && "cursor-pointer hover:bg-gray-200",
                isExpanded ? "line-clamp-none" : `line-clamp-${maxLines}`,
                className,
              )}
              onClick={shouldTruncate ? toggleExpanded : undefined}
              style={{
                fontFamily: fontFamily || getFontFamily(),
                fontSize: `${fontSize}px`,
                lineHeight: "var(--line-height-normal, 1.5)",
              }}
            >
              {displayText}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <p className="whitespace-pre-wrap text-sm" style={{ fontFamily: fontFamily || getFontFamily() }}>
            {text}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

//不用？： 导出一个简化版本的 Hook，供其他组件使用
// export const useSmartTruncation = (text: string, containerRef: React.RefObject<HTMLElement>) => {
//   const [shouldTruncate, setShouldTruncate] = React.useState(false)
//   const [charLimit, setCharLimit] = React.useState(50)
//
//   React.useEffect(() => {
//     if (!containerRef.current || !text) return
//
//     const containerWidth = containerRef.current.offsetWidth
//     const maxChars = calculateMaxChars(text, containerWidth)     //少了字体大小的2个参数？ 以及reservW参数的；
//     const needsTruncation = text.length > maxChars
//
//     setShouldTruncate(needsTruncation)
//     setCharLimit(maxChars)
//   }, [text, containerRef])
//
//   return { shouldTruncate, charLimit }
// }
