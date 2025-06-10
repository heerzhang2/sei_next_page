"use client"

import { useState, useEffect } from "react"
import { debounce } from "lodash-es"

interface WindowSize {
  screenWidth: number | undefined
  screenHeight: number | undefined
}

export function useWindowSize(debounceMs = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    screenWidth: undefined,
    screenHeight: undefined,
  })

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === "undefined") return

    // 创建防抖的 resize 处理函数
    const handleResize = debounce(() => {
      setWindowSize({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      })
    }, debounceMs)

    // 设置初始值
    handleResize()

    // 添加事件监听
    window.addEventListener("resize", handleResize)

    // 清理函数
    return () => {
      handleResize.cancel()
      window.removeEventListener("resize", handleResize)
    }
  }, [debounceMs])

  return windowSize
}
