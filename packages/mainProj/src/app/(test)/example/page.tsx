import PdfOutlineAnalyzer from "@/components/pdf-outline-analyzer"

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">PDF大纲页面定位分析器</h1>
                    <p className="text-lg text-muted-foreground">最简单、最准确的页面定位解决方案</p>
                </div>

                <PdfOutlineAnalyzer />

                {/* 方案对比 */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-6">方案对比分析</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-green-600">✅ PDF大纲方案</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 直接使用PDF内置功能</li>
                                <li>• 100%准确的页码定位</li>
                                <li>• 无需复杂计算</li>
                                <li>• 支持所有PDF查看器</li>
                                <li>• 自动处理分页变化</li>
                                <li>• 性能最优</li>
                            </ul>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-blue-600">📊 DOM分析方案</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 需要复杂的位置计算</li>
                                <li>• 可能有精度误差</li>
                                <li>• 需要处理分页规则</li>
                                <li>• 性能开销较大</li>
                                <li>• 适合复杂布局分析</li>
                            </ul>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-purple-600">🔍 PDF标记方案</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 需要注入标记元素</li>
                                <li>• 基于真实PDF分析</li>
                                <li>• 处理流程较复杂</li>
                                <li>• 适合非标题元素</li>
                                <li>• 精度高但效率低</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 核心优势 */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-6">PDF大纲方案的核心优势</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 border rounded-lg text-center">
                            <div className="text-4xl mb-2">🎯</div>
                            <h3 className="font-semibold mb-2">100%精确</h3>
                            <p className="text-sm text-muted-foreground">直接使用PDF生成时的大纲信息，无任何计算误差</p>
                        </div>
                        <div className="p-6 border rounded-lg text-center">
                            <div className="text-4xl mb-2">⚡</div>
                            <h3 className="font-semibold mb-2">性能最优</h3>
                            <p className="text-sm text-muted-foreground">无需DOM分析和复杂计算，直接读取PDF结构</p>
                        </div>
                        <div className="p-6 border rounded-lg text-center">
                            <div className="text-4xl mb-2">🔧</div>
                            <h3 className="font-semibold mb-2">实现简单</h3>
                            <p className="text-sm text-muted-foreground">只需启用outline选项，使用pdf-lib提取信息</p>
                        </div>
                        <div className="p-6 border rounded-lg text-center">
                            <div className="text-4xl mb-2">🌐</div>
                            <h3 className="font-semibold mb-2">通用兼容</h3>
                            <p className="text-sm text-muted-foreground">所有PDF查看器都支持大纲导航功能</p>
                        </div>
                    </div>
                </div>

                {/* 使用场景 */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-center mb-6">适用场景</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">📚 文档导航系统</h3>
                            <p className="text-sm text-muted-foreground">
                                为长文档提供快速导航，用户可以直接跳转到指定章节，提高阅读效率。
                            </p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">📋 报告生成系统</h3>
                            <p className="text-sm text-muted-foreground">自动生成报告目录和索引，为每个章节标注准确的页码信息。</p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">🔍 内容管理系统</h3>
                            <p className="text-sm text-muted-foreground">批量处理文档，自动提取文档结构和章节信息，建立内容索引。</p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">📖 电子书制作</h3>
                            <p className="text-sm text-muted-foreground">为电子书自动生成目录和书签，提供良好的阅读体验。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
