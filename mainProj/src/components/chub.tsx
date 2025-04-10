"use client"

import React, { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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


interface MemoDatesInputProps {
    id?: string
    value?: string
    onChange: (value?: string) => void
    width?: string | number
    rows?: number
    className?: string
    required?: boolean
    placeholder?: string
}

export function MemoDatesInput({
                                   id,
                                   value = "",
                                   onChange,
                                   width = "10rem",
                                   rows = 1,
                                   className,
                                   required,
                                   placeholder,
                                   ...other
                               }: MemoDatesInputProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isWrapEnabled, setIsWrapEnabled] = useState<boolean | null>(null)

    // Use ResizeObserver to check container width
    useEffect(() => {
        if (!containerRef.current) return

        const checkWidth = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth
                setIsWrapEnabled(containerWidth <= 500)
            }
        }

        // Initial check
        checkWidth()

        // Set up ResizeObserver
        const resizeObserver = new ResizeObserver(checkWidth)
        resizeObserver.observe(containerRef.current)

        return () => {
            if (containerRef.current) {
                resizeObserver.disconnect()
            }
        }
    }, [])

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value || undefined)
    }

    // Handle date input change - append the date to existing text
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const newValue = (value || "") + " " + e.target.value
            onChange(newValue)
            // Reset the date input
            e.target.value = ""
        }
    }

    // Don't render the component until we know the layout
    if (isWrapEnabled === null) {
        return <div ref={containerRef} className={cn("w-full h-12 bg-gray-100 animate-pulse rounded-md", className)} />
    }

    return (
        <div
            ref={containerRef}
            className={cn("flex items-start gap-2 w-full", isWrapEnabled ? "flex-col" : "flex-row", className)}
            {...other}
        >
            <Textarea
                value={value}
                onChange={handleTextChange}
                rows={rows}
                placeholder={placeholder}
                required={required}
                className={cn(isWrapEnabled ? "w-full" : "flex-1")}
                style={{
                    resize: "vertical",
                    // When in row layout, ensure the textarea doesn't grow too much
                    maxWidth: isWrapEnabled ? undefined : "calc(100% - 10rem - 0.5rem)",
                }}
            />
            <Input
                type="date"
                className={cn(isWrapEnabled ? "w-full" : "w-[10rem] flex-shrink-0")}
                onChange={handleDateChange}
                aria-label="选择日期"
            />
        </div>
    )
}

