import { FontDemo } from "./font-demo"
import { FontComparison } from "./font-comparison"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            思源字体展示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            展示思源字体系列在不同操作系统下的兼容性和显示效果，确保最佳的阅读体验。
          </p>
        </header>

        <FontDemo />
        <FontComparison />
      </div>
    </main>
  )
}
