"use client"

import * as React from "react"
import { debounce } from "lodash-es"

// 创建一个模拟的 DOMRectReadOnly 对象，用于 SSR 环境
const createEmptyRect = () => {
  if (typeof DOMRectReadOnly !== "undefined") {
    return new DOMRectReadOnly(0, 0, 0, 0)
  }

  // 在 SSR 环境中返回一个模拟对象
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON() {
      return this
    },
  }
}

/**
 * 测量 DOM 元素尺寸的 Hook，支持响应式更新和防抖
 * @param target 目标 DOM 元素的 ref
 * @param debounceMs 防抖延迟毫秒数，默认为 100ms
 * @returns DOMRectReadOnly 包含元素的尺寸和位置信息
 */
export const useMeasure = (target: React.RefObject<HTMLElement> | null, debounceMs = 100) => {
  const [size, setSize] = React.useState<DOMRect | null>(null)

  // 使用 useRef 存储 ResizeObserver 实例，避免重复创建
  const observerRef = React.useRef<ResizeObserver | null>(null)

  // 创建防抖的 setSize 函数
  const debouncedSetSize = React.useMemo(
    () =>
      debounce((rect: DOMRect) => {
        setSize(rect)
      }, debounceMs),
    [debounceMs],
  )

  React.useEffect(() => {
    // 清理函数
    return () => {
      // 取消所有待处理的防抖更新
      debouncedSetSize.cancel()

      // 断开 ResizeObserver 连接
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [debouncedSetSize])

  // 初始测量和设置 ResizeObserver
  React.useEffect(() => {
    // 如果没有目标元素或目标元素不存在，则不执行任何操作
    if (!target?.current) return

    // 初始测量
    const rect = target.current.getBoundingClientRect()
    setSize(rect)

    // 创建 ResizeObserver 实例
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        if (!entries[0]) return

        // 使用防抖函数更新尺寸
        const contentRect = entries[0].contentRect
        // 转换为 DOMRect 以保持一致性
        const rect = new DOMRect(contentRect.x, contentRect.y, contentRect.width, contentRect.height)
        debouncedSetSize(rect)
      })

      // 开始观察目标元素
      observer.observe(target.current)

      // 保存 observer 实例以便清理
      observerRef.current = observer

      // 清理函数
      return () => {
        observer.disconnect()
        observerRef.current = null
      }
    }
  }, [target, debouncedSetSize])

  // 处理 SSR
  if (typeof window === "undefined") {
    return createEmptyRect()
  }

  // 处理 ref 为 null 的情况
  if (!target) {
    return createEmptyRect()
  }

  // 如果还没有测量结果，但 ref 已存在，立即测量
  if (!size && target.current) {
    return target.current.getBoundingClientRect()
  }

  // 返回已测量的尺寸
  return size || createEmptyRect()
}
