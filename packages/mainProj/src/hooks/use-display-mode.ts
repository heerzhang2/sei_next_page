"use client"

import { useState, useEffect } from "react"

type DisplayMode = "list" | "card"

export function useDisplayMode() {
    const [displayMode, setDisplayMode] = useState<DisplayMode>("card")
    const [visibleFields, setVisibleFields] = useState<string[]>(["code", "rno", "name", "useu", "pipe"])

    // 从 localStorage 恢复设置
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedMode = localStorage.getItem("piping-unit-display-mode")
            const savedFields = localStorage.getItem("piping-unit-visible-fields")

            if (savedMode) {
                setDisplayMode(savedMode as DisplayMode)
            }
            if (savedFields) {
                try {
                    setVisibleFields(JSON.parse(savedFields))
                } catch (error) {
                    console.error("Failed to parse saved visible fields:", error)
                }
            }
        }
    }, [])

    // 保存设置到 localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("piping-unit-display-mode", displayMode)
        }
    }, [displayMode])

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("piping-unit-visible-fields", JSON.stringify(visibleFields))
        }
    }, [visibleFields])

    return {
        displayMode,
        setDisplayMode,
        visibleFields,
        setVisibleFields,
    }
}
