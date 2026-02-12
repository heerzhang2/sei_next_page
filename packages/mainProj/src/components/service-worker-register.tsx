"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegister() {
    const [swStatus, setSwStatus] = useState<'unregistered' | 'registering' | 'active' | 'failed'>('unregistered')
    const [message, setMessage] = useState('')

    useEffect(() => {
        // 从全局变量获取 basePath（由 Next.js 注入）
        const basePath = typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_BASE_PATH__ || '';
        const swUrl = basePath ? `${basePath}/sw.js` : '/sw.js';

        console.log('[SW Register] basePath:', basePath, 'swUrl:', swUrl)

        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
            setSwStatus('failed')
            setMessage('Service Worker 不支持')
            return
        }

        // 检查现有注册并清理不匹配的
        navigator.serviceWorker.getRegistrations().then(async (registrations) => {
            console.log('[SW Register] 现有注册数量:', registrations.length)

            for (const registration of registrations) {
                console.log('[SW Register] 现有注册:', {
                    scope: registration.scope,
                    scriptURL: registration.active?.scriptURL
                })

                // 如果没有 basePath 但注册在根路径，保留
                if (!basePath && registration.scope === '/') {
                    continue
                }

                // 检查 scope 是否匹配当前页面
                const currentOrigin = window.location.origin
                const expectedScope = basePath ? `${currentOrigin}${basePath}` : `${currentOrigin}/`

                // 如果注册的作用域与预期不符，注销它
                if (registration.scope !== expectedScope) {
                    console.log('[SW Register] 注销错误作用域的 SW:', registration.scope, '期望:', expectedScope)
                    await registration.unregister()
                }
            }
        })

        // 注册新的 Service Worker
        setSwStatus('registering')
        setMessage('正在注册...')

        navigator.serviceWorker.register(swUrl, {
            scope: basePath || '/'  // 设置正确的作用域
        }).then((registration) => {
            console.log('[SW Register] Service Worker 注册成功:', {
                scope: registration.scope,
                scriptURL: registration.active?.scriptURL
            })
            setSwStatus('active')
            setMessage(`已激活 (${new Date().toLocaleTimeString('zh-CN')})`)

            // 监听更新
            if (registration.addEventListener) {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (newWorker) {
                        console.log('[SW Register] 发现新版本 Service Worker')
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[SW Register] 新版本已安装，通知跳过等待')
                                // 告诉新版本立即激活
                                newWorker.postMessage({ type: 'SKIP_WAITING' })
                            }
                        })
                    }
                })
            }

            // 监听控制权变化
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW Register] Service Worker 已接管页面')
                setSwStatus('active')
                // 延迟刷新，让 SW 完全接管
                setTimeout(() => {
                    window.location.reload()
                }, 500)
            })
        }).catch((error) => {
            console.error('[SW Register] Service Worker 注册失败:', error)
            setSwStatus('failed')
            setMessage(`注册失败: ${error.message}`)
        })
    }, [])

    if (swStatus === 'unregistered') return null

    return (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-xs z-50 flex items-center gap-3">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    swStatus === 'active' ? 'bg-green-500 animate-pulse' :
                    swStatus === 'registering' ? 'bg-yellow-500 animate-bounce' : 'bg-red-500'
                }`} />
                <span className="font-medium">SW: {
                    swStatus === 'active' ? '✓' :
                    swStatus === 'registering' ? '注册中...' : '✗'
                }</span>
            </div>
            {message && <span className="text-gray-300">{message}</span>}
            <button 
                onClick={() => window.location.reload()}
                className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
            >
                刷新
            </button>
        </div>
    )
}
