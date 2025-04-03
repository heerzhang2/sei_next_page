import type React from "react"

export default function NoPageBreak({
            title,
            children,
            titleHeight = "2.5rem", // 控制标题高度
        }: {
    title: React.ReactNode
    children: React.ReactNode
    titleHeight?: string
}) {
    return (
        <>
            {/* 屏幕渲染时的正常文档流版本 */}
            <div className="print:hidden">
                <div >{title}</div>
                <div>{children}</div>
            </div>

            {/* 打印时的版本 */}
            <div className="hidden print:block">
                {/* 标题容器 */}
                <div style={{ position: "relative" }}>
                    {/* 标题 */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: titleHeight,
                            margin: 0,
                            // fontWeight: "bold",
                            // fontSize: "1.25rem",
                            // 确保标题不会与其后的内容分开
                            pageBreakAfter: "avoid",
                            breakAfter: "avoid",
                        }}
                    >
                        {title}
                    </div>

                    {/* 内容区域 - 移除了 pageBreakBefore: "avoid" */}
                    <div style={{ paddingTop: titleHeight }}>{children}</div>
                </div>
            </div>
        </>
    )
}
