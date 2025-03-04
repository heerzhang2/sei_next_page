"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSplit?: number
  minLeftWidth?: number
  minRightWidth?: number
  orientation?: "horizontal" | "vertical"
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  className?: string
  dividerClassName?: string
}

export function SplitView({
  defaultSplit = 50,
  minLeftWidth = 200,
  minRightWidth = 200,
  orientation = "vertical",
  leftPanel,
  rightPanel,
  className,
  dividerClassName,
  ...props
}: SplitViewProps) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const isVertical = orientation === "vertical"

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const containerRect = container.getBoundingClientRect()

      if (isVertical) {
        const containerWidth = containerRect.width
        const mouseX = e.clientX - containerRect.left

        // Calculate percentage
        let newSplitPosition = (mouseX / containerWidth) * 100

        // Apply constraints
        const minLeftPercent = (minLeftWidth / containerWidth) * 100
        const minRightPercent = (minRightWidth / containerWidth) * 100

        newSplitPosition = Math.max(minLeftPercent, Math.min(100 - minRightPercent, newSplitPosition))

        setSplitPosition(newSplitPosition)
      } else {
        const containerHeight = containerRect.height
        const mouseY = e.clientY - containerRect.top

        // Calculate percentage
        let newSplitPosition = (mouseY / containerHeight) * 100

        // Apply constraints
        const minLeftPercent = (minLeftWidth / containerHeight) * 100
        const minRightPercent = (minRightWidth / containerHeight) * 100

        newSplitPosition = Math.max(minLeftPercent, Math.min(100 - minRightPercent, newSplitPosition))

        setSplitPosition(newSplitPosition)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !e.touches[0]) return

      const containerRect = container.getBoundingClientRect()

      if (isVertical) {
        const containerWidth = containerRect.width
        const touchX = e.touches[0].clientX - containerRect.left

        // Calculate percentage
        let newSplitPosition = (touchX / containerWidth) * 100

        // Apply constraints
        const minLeftPercent = (minLeftWidth / containerWidth) * 100
        const minRightPercent = (minRightWidth / containerWidth) * 100

        newSplitPosition = Math.max(minLeftPercent, Math.min(100 - minRightPercent, newSplitPosition))

        setSplitPosition(newSplitPosition)
      } else {
        const containerHeight = containerRect.height
        const touchY = e.touches[0].clientY - containerRect.top

        // Calculate percentage
        let newSplitPosition = (touchY / containerHeight) * 100

        // Apply constraints
        const minLeftPercent = (minLeftWidth / containerHeight) * 100
        const minRightPercent = (minRightWidth / containerHeight) * 100

        newSplitPosition = Math.max(minLeftPercent, Math.min(100 - minRightPercent, newSplitPosition))

        setSplitPosition(newSplitPosition)
      }
    }

    const handleTouchEnd = () => {
      isDragging.current = false
      document.body.style.userSelect = ""
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isVertical, minLeftWidth, minRightWidth])

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    document.body.style.cursor = isVertical ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  }

  const handleDividerTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    document.body.style.userSelect = "none"
  }

  return (
    <div ref={containerRef} className={cn("relative flex", isVertical ? "flex-row" : "flex-col", className)} {...props}>
      <div
        className="overflow-auto"
        style={{
          [isVertical ? "width" : "height"]: `${splitPosition}%`,
        }}
      >
        {leftPanel}
      </div>
      <div
        ref={dividerRef}
        className={cn(
          "flex items-center justify-center",
          isVertical
            ? "cursor-col-resize border-x w-2 hover:bg-muted/80 active:bg-muted"
            : "cursor-row-resize border-y h-2 hover:bg-muted/80 active:bg-muted",
          dividerClassName,
        )}
        onMouseDown={handleDividerMouseDown}
        onTouchStart={handleDividerTouchStart}
      >
        <div className={cn("bg-border", isVertical ? "w-[1px] h-8" : "h-[1px] w-8")} />
      </div>
      <div
        className="overflow-auto"
        style={{
          [isVertical ? "width" : "height"]: `${100 - splitPosition}%`,
        }}
      >
        {rightPanel}
      </div>
    </div>
  )
}

