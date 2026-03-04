"use client"

import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { useRouter } from "next/navigation"
import { withBasePath } from "@/lib/tool"
import type { ReactNode } from "react"

interface OfflineAwareLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function OfflineAwareLink({ href, children, className, onClick }: OfflineAwareLinkProps) {
  const router = useRouter()
  const { isNextJSServerReachable } = useNetworkStatusContext()

  const handleClick = (e: React.MouseEvent) => {
    // 先调用传入的 onClick
    onClick?.(e)

    // 如果事件被阻止，则不执行后续逻辑
    if (e.defaultPrevented) {
      return
    }

    e.preventDefault()

    // 根据 Next.js 服务器可达性选择导航方式
    if (!isNextJSServerReachable) {
      // Next.js 服务器不可达时，使用 window.location.href
      // 这样可以让 Service Worker 处理缓存和离线回退
      window.location.href = withBasePath(href)
    } else {
      // Next.js 服务器可达时，使用 Next.js 的客户端导航
      router.push(withBasePath(href))
    }
  }

  return (
    <a href={withBasePath(href)} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
