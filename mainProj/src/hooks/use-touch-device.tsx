"use client"

import { useState, useEffect } from "react"

/**
 * 检测当前设备是否为触摸设备的自定义 hook
 * @returns {boolean} 如果是触摸设备则返回 true，否则返回 false
 */
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false)

  useEffect(() => {
    // 检测设备是否支持触摸
    const checkTouchDevice = () => {
      // 检查方法 1: 检测 ontouchstart 是否在 window 对象上
      const hasTouchEvent = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // 检查方法 2: 使用 matchMedia 检测是否支持 hover
      // 触摸设备通常不支持 hover，或者 hover 行为与鼠标不同
      const mediaQuery = window.matchMedia?.("(hover: none)")
      const noHoverSupport = mediaQuery?.matches

      // 检查方法 3: 检测 navigator.maxTouchPoints
      const hasTouchPoints = navigator.maxTouchPoints > 0

      // 综合判断
      setIsTouchDevice(hasTouchEvent || noHoverSupport || hasTouchPoints)
    }

    checkTouchDevice()

    // 监听窗口大小变化，因为用户可能在调整窗口大小时切换设备模式
    // (例如在开发工具中模拟移动设备)
    window.addEventListener("resize", checkTouchDevice)

    return () => {
      window.removeEventListener("resize", checkTouchDevice)
    }
  }, [])

  return isTouchDevice
}
