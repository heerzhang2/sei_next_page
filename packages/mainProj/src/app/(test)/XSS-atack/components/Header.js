export default function Header() {
    return (
        <header className="text-center mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Next.js 中的 XSS 攻击演示
                </h1>
                <p className="text-xl opacity-90">
                    了解跨站脚本攻击的原理与防范
                </p>
            </div>
        </header>
    )
}