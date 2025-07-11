"use client"

import { useState, useEffect, useCallback } from "react"

type DisplayMode = "list" | "card"

export function useDisplayMode() {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("card")
    const [visibleFields, setVisibleFields] = useState<string[]>(["code", "rno", "name", "useu", "pipe"])
    const [isInitialized, setIsInitialized] = useState(false)

    // 确保状态正确初始化和更新
    useEffect(() => {
        if (typeof window !== "undefined" && !isInitialized) {
            const savedMode = localStorage.getItem("piping-unit-display-mode")
            const savedFields = localStorage.getItem("piping-unit-visible-fields")

            if (savedMode && (savedMode === "list" || savedMode === "card")) {
                setDisplayMode(savedMode as DisplayMode)
            }
            if (savedFields) {
                try {
                    const parsed = JSON.parse(savedFields)
                    if (Array.isArray(parsed)) {
                        setVisibleFields(parsed)
                    }
                } catch (error) {
                    console.error("Failed to parse saved visible fields:", error)
                }
            }
            setIsInitialized(true)
        }
    }, [isInitialized])

    // 保存设置到 localStorage
    const updateDisplayMode = useCallback((mode: DisplayMode) => {
        console.log("Updating display mode to:", mode)
        setDisplayMode(mode)
        if (typeof window !== "undefined") {
            localStorage.setItem("piping-unit-display-mode", mode)
        }
    }, [])

    const updateVisibleFields = useCallback((fields: string[]) => {
        console.log("Updating visible fields to:", fields)
        setVisibleFields(fields)
        if (typeof window !== "undefined") {
            localStorage.setItem("piping-unit-visible-fields", JSON.stringify(fields))
        }
    }, [])

    return {
        displayMode,
        setDisplayMode: updateDisplayMode,
        visibleFields,
        setVisibleFields: updateVisibleFields,
        isInitialized,
    }
}
