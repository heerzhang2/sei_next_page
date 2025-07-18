"use client"

import { useState } from "react"

export default function PrintPictureLayout() {
    const [textContent1, setTextContent1] = useState(
        "自然保护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。",
    )
    const [imageUrl, setImageUrl] = useState(
        "http://192.168.171.3:9000/ywmast/202507/1716/8e6a1f3a-b52b-4a7c-9381-55f204bfbe1e",
    )
    const handlePrint = () => {
        window.print()
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            {/* 打印按钮 */}
            <div className="max-w-4xl mx-auto mb-4 print:hidden">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    打印预览
                </button>
            </div>

            <div className="print:bg-white print:shadow-none">
                <div className="print-container w-[210mm] h-[297mm] mx-auto p-[15mm] flex flex-col bg-white shadow-lg print:shadow-none">
                    {/* 标题和文本内容 */}
                    <div className="text-section flex-shrink-0 mb-4">
                        <h2 className="text-2xl font-bold mb-3 print:text-xl print:mb-2">关于自然保护的思考</h2>
                        <div className="space-y-3 print:space-y-2">
                            {textContent1.split("\n\n").map((paragraph, index) => (
                                <p key={index} className="text-base leading-relaxed print:text-sm print:leading-normal">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* 图片容器 */}
                    <div className="image-container flex-grow flex items-center justify-center border border-gray-200 bg-gray-50 p-4 print:border-gray-300 print:bg-white print:p-2">
                        <img
                            src={imageUrl || "/placeholder.svg"}
                            alt="打印图片"
                            className="print-image max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* 页脚 */}
                    <footer className="footer-section text-center text-xs text-gray-500 mt-4 print:mt-2 print:text-[10px] flex-shrink-0">
                        打印于 {new Date().toLocaleDateString()} | 打印布局优化工具
                    </footer>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .print-container {
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-direction: column !important;
                        page-break-inside: avoid;
                        page-break-after: avoid;
                        page-break-before: avoid;
                    }
                    
                    .text-section {
                        flex-shrink: 0 !important;
                        margin-bottom: 8px !important;
                    }
                    
                    .image-container {
                        flex: 1 !important;
                        min-height: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        overflow: hidden !important;
                    }
                    
                    .print-image {
                        max-width: 100% !important;
                        max-height: 100% !important;
                        width: auto !important;
                        height: auto !important;
                        object-fit: contain !important;
                    }
                    
                    .footer-section {
                        flex-shrink: 0 !important;
                        margin-top: 8px !important;
                        height: 20px !important;
                    }
                    
                    /* 防止分页 */
                    * {
                        page-break-inside: avoid !important;
                    }
                    
                    /* 隐藏不需要打印的元素 */
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
