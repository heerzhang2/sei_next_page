"use client"

import type { ReactNode } from "react"
import { useState } from "react"

interface PrintTextContentProps {
    content: string
    className?: string
}

export  function PrintTextContent({ content, className = "" }: PrintTextContentProps) {
    return (
        <>
            {content.split("\n\n").map((paragraph, index) => (
                <p
                    key={index}
                    className={`text-base leading-relaxed print:text-sm print:leading-normal text-gray-700 ${className}`}
                >
                    {paragraph}
                </p>
            ))}
        </>
    )
}

interface PrintLayoutProps {
    title: string
    children: ReactNode
    imageAlt?: string
    footer?: string
    onPrint?: () => void
}

export default function PrintLayout({
                                        title,
                                        children,
                                        imageAlt = "打印图片",
                                        onPrint,
                                    }: PrintLayoutProps) {
    const handlePrint = () => {
        onPrint?.()
        window.print()
    }
    const [textContent, setTextContent] = useState(
        "",
    )
    const [textContent1, setTextContent1] = useState(
        "自然保护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。"
        +"自然保护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。"
        +"自然保护是当今世界面临的最重要挑战之一。随着全球人口的增长和工业化进程的加速，人类对自然资源的需求达到了前所未有的水平。森林被大面积砍伐，野生动物栖息地遭到破坏，空气和水污染问题日益严重。\n\n保护自然不仅仅是保存美丽的风景或珍稀物种，它关系到人类的生存基础。森林是地球的肺，吸收二氧化碳并释放氧气；湿地是自然的水过滤系统；海洋调节着全球气候。当这些生态系统遭到破坏时，最终受害的是人类自己。",
    )
    const footer=`打印于 ${new Date().toLocaleDateString()} | 打印布局优化工具`

    const [imageUrl, setImageUrl] = useState(
        "http://192.168.171.3:9000/ywmast/202507/1716/8e6a1f3a-b52b-4a7c-9381-55f204bfbe1e",
        // "http://192.168.171.3:9000/ywmast/202507/1708/153e47b9-5a7c-4765-9f8f-16e4799cb07b",
        // "http://192.168.171.3:9000/ywmast/202507/1715/1368de0c-c8f8-4692-bfdf-0e3854328c46",
    )
    return (
        <div className="h-screen mx-auto bg-white shadow-lg print:shadow-none flex flex-col ">
            {/* 标题和内容区域 */}
            <div className="flex-shrink-0 mb-1">
                <h1 className="text-2xl font-bold mb-3 print:text-xl print:mb-2 text-gray-900">{title}</h1>
                <div className="text-content space-y-3 print:space-y-2">
                    <PrintTextContent content={textContent1 } />
                </div>
            </div>

            {/* 图片区域 */}
            {imageUrl && (
                <div className="flex-1 flex items-center justify-center border border-gray-200 bg-gray-50 print:border-gray-300 print:bg-white p-2 print:p-1 min-h-0">
                    <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={imageAlt}
                        className="max-w-full max-h-full object-contain print:max-h-full"
                        loading="lazy"
                    />
                </div>
            )}

            {/* 页脚 */}
            {footer && (
                <footer className="flex-shrink-0 text-center text-xs text-gray-500  print:text-[10px]">
                    {footer}
                </footer>
            )}
        </div>
    )
}
