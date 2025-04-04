import type React from "react"

export default function NoPageBreak({
            title,
            children,
            titleHeight = "2.5rem",
        }: {
    title: React.ReactNode
    children: React.ReactNode
    titleHeight?: string
}) {
    return (
        <>
            <div className="print:hidden">
                <div >{title}</div>
                <div>{children}</div>
            </div>
            <div className="hidden print:block">
                <div style={{ position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: titleHeight,
                            margin: 0,
                            pageBreakAfter: "avoid",
                            breakAfter: "avoid",
                        }}
                    >
                        {title}
                    </div>
                    <div style={{ paddingTop: titleHeight }}>{children}</div>
                </div>
            </div>
        </>
    )
}
