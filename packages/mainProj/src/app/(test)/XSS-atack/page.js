'use client'
import { useState } from 'react'
import Header from './components/Header'
import InfoSection from './components/InfoSection'
import Card from './components/Card'
import DemoArea from './components/DemoArea'

export default function XSSDemoPage() {
    const [activeTab, setActiveTab] = useState('reflected')

    const xssTypes = [
        {
            id: 'reflected',
            title: '反射型 XSS',
            content: `反射型 XSS：恶意脚本作为请求的一部分发送到服务器，然后立即返回并在用户浏览器中执行。`,
            code: `// 攻击者构造的恶意URL
https://example.com/search?q=<script>alert('XSS')</script>`,
            description: `如果服务器直接返回搜索词而不转义，脚本将在用户浏览器执行。`
        },
        {
            id: 'stored',
            title: '存储型 XSS',
            content: `存储型 XSS：恶意脚本被存储到服务器（如数据库），然后在其他用户访问时执行。`,
            code: `// 攻击者在评论中提交恶意脚本
"很好用的网站！<script>stealCookies()</script>"`,
            description: `如果网站未对评论内容进行适当处理，其他用户查看评论时脚本将执行。`
        },
        {
            id: 'dom',
            title: 'DOM 型 XSS',
            content: `DOM 型 XSS：恶意脚本通过修改 DOM 环境在客户端执行，不涉及服务器。`,
            code: `// 不安全的 JavaScript 代码
const userInput = window.location.hash.substring(1);
document.getElementById('content').innerHTML = userInput;`,
            description: `攻击者可以构造 URL 如 example.com#<script>恶意代码</script>`
        }
    ]

    const preventionMeasures = [
        {
            title: '避免使用 dangerouslySetInnerHTML',
            code: `// 不安全的做法：
<div dangerouslySetInnerHTML={{__html: userContent}} />

// 安全的做法：
<div>{userContent}</div> // Next.js 会自动转义`,
            description: '除非绝对必要，并且必须对内容进行严格清理'
        },
        {
            title: '使用 DOMPurify 清理 HTML',
            code: `import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(dirtyHTML);
<div dangerouslySetInnerHTML={{__html: cleanHTML}} />`,
            description: '对需要渲染的HTML内容进行安全清理'
        },
        {
            title: '设置 Content Security Policy',
            code: `// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'"
  }
];`,
            description: '设置严格的内容安全策略头'
        }
    ]

    const bestPractices = [
        '避免使用 dangerouslySetInnerHTML：除非绝对必要，并且必须对内容进行严格清理',
        '使用类型安全：利用 TypeScript 减少潜在的安全问题',
        '实施 CSP：设置严格的内容安全策略头',
        '验证和清理输入：对所有用户输入进行验证和清理',
        '使用安全的 Cookie 设置：设置 HttpOnly、Secure 和 SameSite 属性',
        '定期更新依赖：保持 Next.js 和所有依赖项最新',
        '安全代码审查：定期进行安全代码审查'
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <Header />

                <InfoSection
                    title="Next.js 中的 XSS 风险"
                    content="尽管 Next.js 提供了一些内置的 XSS 防护，但在某些情况下仍然可能存在安全漏洞："
                    highlights={[
                        "使用 dangerouslySetInnerHTML 渲染未经验证的 HTML",
                        "直接渲染用户输入而不进行转义",
                        "不安全的第三方组件或库",
                        "服务端渲染时未正确处理用户数据"
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card
                        title="XSS 攻击类型"
                        className="h-full"
                    >
                        <div className="space-y-4">
                            <div className="flex border-b border-gray-200">
                                {xssTypes.map(type => (
                                    <button
                                        key={type.id}
                                        className={`px-4 py-2 font-medium transition-colors ${
                                            activeTab === type.id
                                                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                                : 'text-gray-600 hover:text-blue-600'
                                        }`}
                                        onClick={() => setActiveTab(type.id)}
                                    >
                                        {type.title}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {xssTypes.map(type => (
                                    <div
                                        key={type.id}
                                        className={`${activeTab === type.id ? 'block' : 'hidden'}`}
                                    >
                                        <p className="text-gray-700 mb-3">{type.content}</p>
                                        <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {type.code}
                    </pre>
                                        <p className="text-gray-600 text-sm mt-2">{type.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Next.js 中的防范措施"
                        className="h-full"
                    >
                        <div className="space-y-6">
                            {preventionMeasures.map((measure, index) => (
                                <div key={index} className="space-y-2">
                                    <h4 className="font-semibold text-blue-700">{measure.title}</h4>
                                    <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                    {measure.code}
                  </pre>
                                    <p className="text-gray-600 text-sm">{measure.description}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <DemoArea />

                <Card title="Next.js 安全最佳实践" className="mb-8">
                    <ul className="space-y-3">
                        {bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start">
                                <div className="bg-green-100 text-green-800 rounded-full p-1 mr-3 mt-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-gray-700">{practice}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    )
}