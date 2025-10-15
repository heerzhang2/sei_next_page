export default function InfoSection({ title, content, highlights }) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">{title}</h2>
            <p className="text-gray-700 text-lg mb-6">{content}</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                <p className="font-semibold text-yellow-800 mb-3">主要风险点：</p>
                <ul className="list-disc list-inside space-y-2 text-yellow-700">
                    {highlights.map((highlight, index) => (
                        <li key={index} className="text-sm">
                            <code className="bg-yellow-100 px-1 rounded">{highlight.split('：')[0]}</code>
                            {highlight.split('：')[1]}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full mb-4">
                        安全
                    </div>
                    <h3 className="font-bold text-green-800 mb-3">安全的做法</h3>
                    <ul className="space-y-2 text-sm text-green-700">
                        <li>• 使用 Next.js 内置的转义机制</li>
                        <li>• 对用户输入进行严格验证和清理</li>
                        <li>• 使用 Content Security Policy (CSP)</li>
                        <li>• 设置 HTTPOnly Cookie</li>
                    </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full mb-4">
                        风险
                    </div>
                    <h3 className="font-bold text-red-800 mb-3">不安全的做法</h3>
                    <ul className="space-y-2 text-sm text-red-700">
                        <li>• 直接使用 dangerouslySetInnerHTML</li>
                        <li>• 信任并渲染未经验证的用户输入</li>
                        <li>• 使用不安全的第三方库</li>
                        <li>• 忽略 CSP 头设置</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}