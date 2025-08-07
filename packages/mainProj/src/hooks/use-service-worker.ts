'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
    isSupported: boolean
    isRegistered: boolean
    isUpdating: boolean
    hasUpdate: boolean
    registration: ServiceWorkerRegistration | null
}

export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isRegistered: false,
        isUpdating: false,
        hasUpdate: false,
        registration: null
    })

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return
        }

        setState(prev => ({ ...prev, isSupported: true }))

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                })

                setState(prev => ({
                    ...prev,
                    isRegistered: true,
                    registration
                }))

                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (!newWorker) return

                    setState(prev => ({ ...prev, isUpdating: true }))

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setState(prev => ({
                                ...prev,
                                hasUpdate: true,
                                isUpdating: false
                            }))
                        }
                    })
                })

                // 监听控制器变化
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload()
                })

                console.log('Service Worker 注册成功')
            } catch (error) {
                console.error('Service Worker 注册失败:', error)
            }
        }

        registerSW()
    }, [])

    const updateServiceWorker = () => {
        if (state.registration?.waiting) {
            state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
    }

    return {
        ...state,
        updateServiceWorker
    }
}
