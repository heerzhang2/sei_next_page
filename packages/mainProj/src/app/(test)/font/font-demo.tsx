import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FontDemo() {
  const fontSamples = [
    {
      title: "思源黑体 (Sans-serif)",
      className: "font-sans",
      samples: [
        { weight: "font-light", text: "轻体：优雅简洁的现代设计" },
        { weight: "font-normal", text: "常规：适合正文阅读的标准字重" },
        { weight: "font-medium", text: "中等：突出重点的适中字重" },
        { weight: "font-bold", text: "粗体：标题和强调文本的理想选择" },
        { weight: "font-black", text: "特粗：最强视觉冲击力的字重" },
      ],
    },
    {
      title: "思源宋体 (Serif)",
      className: "font-serif",
      samples: [
        { weight: "font-normal", text: "常规：传统优雅的衬线字体" },
        { weight: "font-medium", text: "中等：适合长篇阅读的字重" },
        { weight: "font-bold", text: "粗体：正式文档的标题字重" },
        { weight: "font-black", text: "特粗：古典韵味的重磅字重" },
      ],
    },
    {
      title: "等宽字体 (Monospace)",
      className: "font-mono",
      samples: [
        { weight: "font-normal", text: "代码：const message = '你好世界';" },
        { weight: "font-medium", text: "终端：npm install @types/node" },
        { weight: "font-bold", text: "强调：console.log('调试信息');" },
      ],
    },
  ]

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-center">字体样式展示</h2>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {fontSamples.map((fontFamily, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">{fontFamily.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fontFamily.samples.map((sample, sampleIndex) => (
                <div key={sampleIndex} className="border-l-4 border-blue-200 pl-4">
                  <p className={`${fontFamily.className} ${sample.weight} text-lg leading-relaxed`}>{sample.text}</p>
                  <p className="text-sm text-gray-500 mt-1">字重: {sample.weight.replace("font-", "")}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
