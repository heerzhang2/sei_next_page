'use client'

import { useEffect } from 'react'

export function useSafariViewportFix() {
    useEffect(() => {
        // 检测是否为 Safari
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

        if (!isSafari) return

        let resizeTimer: NodeJS.Timeout

        const handleResize = () => {
            // 清除之前的定时器
            clearTimeout(resizeTimer)

            // 延迟执行以确保方向变化完成
            resizeTimer = setTimeout(() => {
                // 强制重新计算视口高度
                const vh = window.innerHeight * 0.01
                document.documentElement.style.setProperty('--vh', `${vh}px`)

                // 触发重新布局
                document.body.style.height = `${window.innerHeight}px`

                // 滚动到顶部以确保布局正确
                window.scrollTo(0, 0)
            }, 150)
        }

        const handleOrientationChange = () => {
            // 方向改变时的特殊处理
            setTimeout(() => {
                handleResize()
                // 强制重绘
                document.body.style.display = 'none'
                document.body.offsetHeight // 触发重排
                document.body.style.display = ''
            }, 500)
        }

        // 初始设置
        handleResize()

        // 监听事件
        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleOrientationChange)

        // 监听视口变化（iOS Safari 特有）
        if ('visualViewport' in window) {
            window.visualViewport?.addEventListener('resize', handleResize)
        }

        return () => {
            clearTimeout(resizeTimer)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleOrientationChange)
            if ('visualViewport' in window) {
                window.visualViewport?.removeEventListener('resize', handleResize)
            }
        }
    }, [])
}
