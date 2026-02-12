# Service Worker 子路径部署修复指南

## 问题

将 Next.js 部署到 `/report` 子路径后，Service Worker 无法正常激活。

## 根本原因

1. Service Worker 注册路径错误
2. Service Worker 作用域不匹配
3. APISIX 未正确代理 SW 请求

## 解决方案

### 1. 修改 Serwist 配置

在 `serwist.config.js` 中添加 basePath 支持：

```javascript
import crypto from "crypto";

const revision = crypto.randomUUID();

// 获取 basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import("serwist").SerwistOptions} */
export default {
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: false,
  cacheOnNavigation: false,
  register: false, // 手动注册，控制作用域
  
  // 添加 basePath 到所有预缓存 URL
  additionalPrecacheEntries: [
    { url: `${basePath}/`, revision },
    { url: `${basePath}/login`, revision },
    { url: `${basePath}/~offline`, revision },
    { url: `${basePath}/offline`, revision },
  ],
  
  // 添加 basePath 支持
  buildOptions: {
    define: {
      'import.meta.env.BASE_PATH': JSON.stringify(basePath)
    }
  }
};
```

### 2. 修改 src/sw.ts

在 Service Worker 源文件中添加 basePath 支持：

```typescript
import {
    ExpirationPlugin,
    NetworkFirst,
    NetworkOnly,
    type PrecacheEntry,
    type RuntimeCaching,
    type SerwistGlobalConfig,
} from "serwist"
import { Serwist } from "serwist"
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker"

// 从全局配置获取 basePath
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
        __BASE_PATH__: string
    }
}

declare const self: ServiceWorkerGlobalScope

const BASE_PATH = (globalThis as any).__BASE_PATH__ || '';

// 修改所有缓存键生成逻辑，添加 basePath 前缀
const createCacheKeyPlugin = (normalizeFunction: (param: { request: Request }) => Promise<string>) => ({
    cacheKeyWillBeUsed: async (params: { request: Request }) => {
        const originalResult = await normalizeFunction(params);
        const url = new URL(originalResult);
        
        // 如果有 basePath，确保路径包含它
        if (BASE_PATH && !url.pathname.startsWith(BASE_PATH)) {
            url.pathname = `${BASE_PATH}${url.pathname}`;
        }
        
        return url.toString();
    },
    // ... 其余代码保持不变
})
```

### 3. 创建手动 SW 注册组件

创建 `src/components/service-worker-register.tsx`:

```typescript
"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegister() {
    const [swStatus, setSwStatus] = useState<'unregistered' | 'registering' | 'active' | 'failed'>('unregistered')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const swUrl = `${basePath}/sw.js`;

        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
            setSwStatus('failed')
            setMessage('Service Worker 不支持')
            return
        }

        // 检查现有注册
        navigator.serviceWorker.getRegistrations().then(async (registrations) => {
            for (const registration of registrations) {
                // 如果旧版本在根路径，注销它
                if (!basePath && registration.scope === '/') {
                    await registration.unregister()
                    console.log('注销了旧版本的 Service Worker')
                }
                // 如果有 basePath 但注册在根路径，注销它
                if (basePath && registration.scope === '/' && !registration.active?.scriptURL.includes(basePath)) {
                    await registration.unregister()
                    console.log('注销了不匹配作用域的 Service Worker')
                }
            }
        })

        // 注册新的 Service Worker
        setSwStatus('registering')
        
        navigator.serviceWorker.register(swUrl, {
            scope: basePath || '/'  // 设置作用域
        }).then((registration) => {
            console.log('Service Worker 注册成功:', registration.scope)
            setSwStatus('active')
            setMessage(`已激活 (${new Date().toLocaleTimeString()})`)
            
            // 监听更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing
                if (newWorker) {
                    console.log('发现新版本 Service Worker')
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 立即激活新版本
                            newWorker.postMessage({ type: 'SKIP_WAITING' })
                        }
                    })
                }
            })
            
            // 监听控制权变化
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('Service Worker 已接管页面')
                setSwStatus('active')
                window.location.reload()
            })
        }).catch((error) => {
            console.error('Service Worker 注册失败:', error)
            setSwStatus('failed')
            setMessage(`注册失败: ${error.message}`)
        })
    }, [basePath])

    if (swStatus === 'unregistered') return null

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    swStatus === 'active' ? 'bg-green-500' :
                    swStatus === 'registering' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span>SW: {swStatus === 'active' ? '✓' : swStatus}</span>
                {message && <span className="text-gray-300">- {message}</span>}
                <button 
                    onClick={() => window.location.reload()}
                    className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                    刷新
                </button>
            </div>
        </div>
    )
}
```

### 4. 在 layout.tsx 中使用

```typescript
import { ServiceWorkerRegister } from "@/components/service-worker-register"

// 在 RootLayout 中添加
export default async function RootLayout({ children }: { children: React.ReactNode }) {
    // ... 其他代码
    
    return (
        <html suppressHydrationWarning lang="zh-CN">
            <body>
                {/* 其他 providers */}
                <ServiceWorkerRegister />
                {children}
            </body>
        </html>
    )
}
```

### 5. 修改 APISIX 配置

确保 APISIX 正确代理 SW 请求：

```yaml
# APISIX Route for sw.js
{
  "uri": "/report/sw.js",
  "name": "report-sw",
  "methods": ["GET"],
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "host": "sei-nextjs.seirep.svc.cluster.local",
      "port": 3765,
      "weight": 1
    }
  },
  "plugins": {
    "proxy-rewrite": {
      "regex_uri": "^/report/sw.js$",
      "uri": "/sw.js"
    },
    "response-rewrite": {
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/report/"
        }
      ]
    }
  }
}
```

### 6. 修改 next.config.mjs

确保正确设置 Service Worker 相关的 headers：

```javascript
headers: async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return [
        {
            source: `${basePath}/sw.js`,
            headers: [
                {
                    key: "Cache-Control",
                    value: "public, max-age=0, must-revalidate",
                },
                {
                    key: "Service-Worker-Allowed",
                    value: basePath || "/",
                },
                {
                    key: "Content-Type",
                    value: "application/javascript",
                },
            ],
        },
        {
            source: `${basePath}/manifest.json`,
            headers: [
                {
                    key: "Cache-Control",
                    value: "public, max-age=3600",
                },
            ],
        },
    ];
},
```

### 7. 清理旧缓存

在 `src/app/(reprel)/pwa/page.tsx` 中添加清理功能：

```typescript
const handleCleanup = async () => {
    if ("serviceWorker" in navigator) {
        // 注销所有 SW
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map(r => r.unregister()))
        
        // 清理所有缓存
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        
        // 清理 localStorage
        localStorage.clear()
        
        // 刷新页面
        window.location.reload()
    }
}
```

## 验证步骤

1. **检查 SW 注册状态**：
   - 打开浏览器开发者工具 > Application > Service Workers
   - 查看 Scope 是否为 `/report/`
   - 查看 Client 是否显示当前页面

2. **检查网络请求**：
   - 打开 Network 标签
   - 访问 `/report/sw.js`
   - 确保返回 200 OK

3. **测试缓存功能**：
   - 点击"重新预缓存"按钮
   - 查看控制台是否有缓存成功日志

4. **离线测试**：
   - 使用开发者工具 > Network > Offline
   - 刷新页面，检查是否正常加载
