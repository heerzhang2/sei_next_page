import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FontComparison() {
  const testText = {
    chinese: "中文测试：这是一段包含各种中文字符的测试文本，用于展示字体在不同设备上的显示效果。",
    english:
      "English Test: This is a sample text containing various English characters to demonstrate font rendering across different devices.",
    mixed: "混合文本 Mixed Text: 中英文混排效果测试 123456789 !@#$%^&*()",
    numbers: "数字测试：0123456789 ￥¥$€£ 2024年1月1日",
    punctuation: '标点符号：，。！？；："，。！？；：()[]《》〈〉「」『』"',
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-center">跨平台兼容性测试</h2>

      <div className="grid gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-green-600 dark:text-green-400">字体渲染测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(testText).map(([key, text]) => (
              <div key={key} className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1")} 测试:
                </h4>
                <div className="grid gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-sans text-base leading-relaxed">{text}</p>
                    <span className="text-xs text-gray-500">Sans-serif (思源黑体)</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-serif text-base leading-relaxed">{text}</p>
                    <span className="text-xs text-gray-500">Serif (思源宋体)</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-purple-600 dark:text-purple-400">响应式字体大小</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs">超小字体 (12px): 适用于版权信息和细节说明</div>
              <div className="text-sm">小字体 (14px): 适用于辅助信息和标签</div>
              <div className="text-base">基础字体 (16px): 适用于正文内容</div>
              <div className="text-lg">大字体 (18px): 适用于重要段落</div>
              <div className="text-xl">特大字体 (20px): 适用于副标题</div>
              <div className="text-2xl">超大字体 (24px): 适用于主标题</div>
              <div className="text-3xl">巨大字体 (30px): 适用于页面标题</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-orange-600 dark:text-orange-400">系统兼容性说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-bold mb-2">✅ 支持的操作系统:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Windows 10/11 (自动下载思源字体)</li>
                  <li>• macOS (内置 PingFang SC)</li>
                  <li>• Linux (支持 Noto 字体)</li>
                  <li>• Android (内置 Noto 字体)</li>
                  <li>• iOS (内置 PingFang SC)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2">🔧 回退机制:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 优先加载 Google Fonts 思源字体</li>
                  <li>• 回退到系统内置中文字体</li>
                  <li>• 最终回退到系统默认字体</li>
                  <li>• 确保在任何环境下都能正常显示</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
