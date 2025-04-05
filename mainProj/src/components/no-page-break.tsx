import type React from "react"
//反过来了 替代  PrintTogether
export default function NoPageBreak({
                                        title,
                                        children,
                                        reserve = "2.5rem",
                                    }: {
    title: React.ReactNode
    children: React.ReactNode
    reserve?: string
}) {
    return (
        <div className="relative">
            {/* 标题区域 */}
            <div
                className="print:absolute print:top-0 print:left-0 print:right-0"
                style={{
                    pageBreakAfter: "avoid",
                    breakAfter: "avoid",
                    height: "auto",
                    printHeight: reserve,
                }}
            >
                {title}
            </div>

            {/* 内容区域 */}
            <div className="print:pt-[length:var(--reserve)]" style={{ "--reserve": reserve } as React.CSSProperties}>
                {children}
            </div>
        </div>
    )
}

