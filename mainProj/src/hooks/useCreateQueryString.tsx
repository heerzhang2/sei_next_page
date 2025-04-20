'use client'

import { useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

//URL装配用 通用 Hook
export function useCreateQueryString() {
    const searchParams = useSearchParams()

    return useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams!.toString())
            if(value==='')  params.delete(name)
            else params.set(name, value)
            return params.toString()
        },
        [searchParams]  // 当搜索参数变化时自动更新
    )
}
