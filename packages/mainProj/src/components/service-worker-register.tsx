"use client"

import { useEffect, useState } from "react"

export function ServiceWorkerRegister() {
    const [swStatus, setSwStatus] = useState<'unregistered' | 'registering' | 'active' | 'failed' | 'pending'>('unregistered')
    const [message, setMessage] = useState('')

    // 监听来自证书说明窗口的消息 - 必须在所有条件语句之前调用
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CERT_TRUSTED') {
                sessionStorage.setItem('pwa-cert-trusted', 'true')
                window.location.reload()
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    useEffect(() => {
        // 从全局变量获取 basePath（由 Next.js 注入）
        const basePath = typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_BASE_PATH__ || '';
        // 使用 @serwist/turbopack 的默认路径
        const swUrl = basePath ? `${basePath}/serwist/sw.js` : '/serwist/sw.js';

        console.log('[SW Register] basePath:', basePath, 'swUrl:', swUrl)

        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
            setSwStatus('failed')
            setMessage('Service Worker 不支持')
            return
        }

        // 检查是否为 HTTPS 协议
        const isHttps = window.location.protocol === 'https:'
        if (!isHttps && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.warn('[SW Register] 非安全源，Service Worker 需要 HTTPS')
            setSwStatus('failed')
            setMessage('需要 HTTPS 协议')
            return
        }

        // 检查是否为 IP 地址访问（IP 地址使用 HTTPS 时需要用户手动信任证书）
        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname)
        if (isIpAddress) {
            const certTrusted = sessionStorage.getItem('pwa-cert-trusted')
            if (certTrusted !== 'true') {
                console.warn('[SW Register] IP 地址访问，需要先信任 SSL 证书')
                setSwStatus('pending')
                setMessage('需要信任证书 (点击查看说明)')
                return
            }
            console.log('[SW Register] 证书已确认信任，继续注册 Service Worker')
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

    const handleCertTrust = () => {
        const certWindow = window.open('', 'PWA 证书说明', 'width=800,height=600,scrollbars=yes')
        if (certWindow) {
            certWindow.document.write(`
                <html>
                <head>
                    <title>PWA 证书信任说明</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h1 { color: #333; }
                        .step { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                        .note { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }
                        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
                    </style>
                </head>
                <body>
                    <h1>如何信任 SSL 证书以启用 PWA 功能</h1>

                    <div class="note">
                        <strong>注意：</strong> 由于您使用 IP 地址（${window.location.hostname}）访问此应用，浏览器不会自动信任自签名证书。您需要手动导入并信任证书。
                    </div>

                    <h2>步骤 1: 下载证书</h2>
                    <div class="step">
                        <p>请访问服务器并下载 SSL 证书文件（通常是 <code>.crt</code> 或 <code>.pem</code> 格式）</p>
                        <p>如果证书在服务器上，可以通过以下命令下载：</p>
                        <pre><code># 示例：从服务器下载证书
scp user@server:/path/to/certificate.crt ./</code></pre>
                    </div>

                    <h2>步骤 2: 导入证书（Windows）</h2>
                    <div class="step">
                        <ol>
                            <li>双击下载的证书文件</li>
                            <li>选择"安装证书"</li>
                            <li>选择"本地计算机"，点击下一步</li>
                            <li>选择"将所有的证书放入下列存储"</li>
                            <li>点击"浏览"，选择"受信任的根证书颁发机构"</li>
                            <li>点击"确定"，然后完成安装</li>
                        </ol>
                    </div>

                    <h2>步骤 3: 验证证书信任</h2>
                    <div class="step">
                        <ol>
                            <li>关闭此说明窗口</li>
                            <li>在浏览器中访问 <code>${window.location.href}</code></li>
                            <li>确认地址栏不再显示"不安全"警告</li>
                            <li>刷新页面，PWA 功能应该正常工作</li>
                        </ol>
                    </div>

                    <h2>步骤 4: 确认信任</h2>
                    <div class="step">
                        <p>如果证书已正确导入，点击下方按钮确认：</p>
                        <button onclick="
                            window.opener.postMessage({ type: 'CERT_TRUSTED' }, '*');
                            window.close();
                            alert('已确认，请刷新主页面');
                        " style="
                            background: #4CAF50; color: white; padding: 10px 20px;
                            border: none; border-radius: 5px; cursor: pointer;
                            font-size: 16px;
                        ">
                            我已信任证书，启用 PWA
                        </button>
                    </div>

                    <h2>替代方案：使用域名访问</h2>
                    <div class="step">
                        <p>如果不想手动导入证书，建议配置域名并使用受信任的 SSL 证书：</p>
                        <ul>
                            <li>配置 DNS 解析</li>
                            <li>使用 Let's Encrypt 免费证书</li>
                            <li>或购买商业 SSL 证书</li>
                        </ul>
                    </div>

                    <h2>测试证书信任状态</h2>
                    <div class="step">
                        <p>在浏览器控制台运行以下代码测试：</p>
                        <pre><code>// 检查证书是否被信任
fetch('${window.location.href}', { method: 'HEAD', mode: 'cors' })
  .then(() => console.log('✓ 证书信任正常'))
  .catch(err => console.log('✗ 证书未信任:', err))</code></pre>
                    </div>

                    <p style="margin-top: 20px; color: #666;">
                        如有疑问，请联系系统管理员。
                    </p>
                </body>
                </html>
            `)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-xs z-50 flex items-center gap-3">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                    swStatus === 'active' ? 'bg-green-500 animate-pulse' :
                    swStatus === 'registering' ? 'bg-yellow-500 animate-bounce' :
                    swStatus === 'pending' ? 'bg-orange-500 animate-pulse' :
                    'bg-red-500'
                }`} />
                <span className="font-medium">SW: {
                    swStatus === 'active' ? '✓' :
                    swStatus === 'registering' ? '注册中...' :
                    swStatus === 'pending' ? '等待证书' : '✗'
                }</span>
            </div>
            {message && <span className="text-gray-300">{message}</span>}
            {swStatus === 'pending' ? (
                <button
                    onClick={handleCertTrust}
                    className="ml-2 text-xs bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded transition-colors"
                >
                    查看证书说明
                </button>
            ) : (
                <button
                    onClick={() => window.location.reload()}
                    className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
                >
                    刷新
                </button>
            )}
        </div>
    )
}
