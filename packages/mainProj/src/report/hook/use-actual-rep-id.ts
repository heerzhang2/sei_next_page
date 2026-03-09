"use client"

import { useState, useEffect } from "react"
import { usePathname, useParams } from "next/navigation"

/**
 * 自定义hook用于获取实际的repId
 * 在离线模式下，Service Worker会将repId标准化为*号
 * 这个hook直接从URL路径中解析真实的repId
 */
export function useActualRepId(): string {
    const pathname = usePathname()
    const params = useParams()
    const [actualRepId, setActualRepId] = useState<string>("")

    useEffect(() => {
        // 从路径 /rep/[repId]/... 中提取repId
        const pathSegments = pathname.split("/")
        const repIndex = pathSegments.indexOf("rep")

        if (repIndex !== -1 && pathSegments[repIndex + 1]) {
            const extractedRepId = pathSegments[repIndex + 1]
            console.log(`[useActualRepId] pathname: ${pathname}, extractedRepId: ${extractedRepId}`)
            if (extractedRepId !== "*") {
                setActualRepId(extractedRepId)
            }
        }
    }, [pathname])

    // 返回实际的repId，如果解析失败则返回空字符串
    const result = actualRepId || ""
    console.log(`[useActualRepId] returning: ${result}, actualRepId: ${actualRepId}, params.repId: ${params.repId}`)
    return result
}

