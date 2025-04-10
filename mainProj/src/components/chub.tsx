"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"


/*v0.dev自动帮忙写代码，替代旧的UI库代码。
* */

// Utility function for debouncing
const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

interface LineColumnProps {
    width?: number // Minimum width for each child in pixels
    className?: string
    children: React.ReactNode
}

export function LineColumn({ width=300, className, children }: LineColumnProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isSingleRow, setIsSingleRow] = useState(false)
    const childrenArray = React.Children.toArray(children)
    const childCount = childrenArray.length

    // Check if all children can fit in a single row
    useEffect(() => {
        const checkLayout = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth
                const totalRequiredWidth = childCount * width
                setIsSingleRow(containerWidth >= totalRequiredWidth + (childCount - 1) * 16) // 16px for gap
            }
        }

        // Initial check
        checkLayout()

        // Use ResizeObserver instead of window resize event when available
        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(debounce(checkLayout, 100))
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current)
            }

            return () => {
                if (containerRef.current) {
                    resizeObserver.unobserve(containerRef.current)
                }
                resizeObserver.disconnect()
            }
        } else {
            // Fallback to window resize with debounce
            const debouncedCheckLayout = debounce(checkLayout, 100)
            window.addEventListener("resize", debouncedCheckLayout)
            return () => window.removeEventListener("resize", debouncedCheckLayout)
        }
    }, [childCount, width])

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full", isSingleRow ? "flex flex-row items-center justify-between" : "grid", className)}
            style={
                isSingleRow
                    ? { gap: "1rem" }
                    : {
                        gap: "1rem",
                        gridTemplateColumns: `repeat(auto-fill, minmax(${width}px, 1fr))`,
                        alignContent: "space-between",
                    }
            }
        >
            {childrenArray.map((child, index) => (
                <div
                    key={index}
                    className={cn("flex-grow flex items-center justify-center", isSingleRow ? "flex-1" : "")}
                    style={isSingleRow ? { minWidth: `${width}px` } : {}}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}

