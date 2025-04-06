import type React from "react"

interface PrintTogetherProps {
  title: React.ReactNode
  children: React.ReactNode
  reserve?: string // Amount of space to reserve (default: 3.7rem)
}

//预计设置 1行的= 3.7rem;  2行的=5rem;  3行的=4.7rem; 两行表头3行文字的=7.7rem
//替代NoPageBreak来解决print:hidden切换hidden print:block导致表格目标错位无法完成important-cell复制。 reserve和文字表头部高度相关的。
export function PrintTogether({ title, children, reserve = "3.7rem" }: PrintTogetherProps) {
  return (
    <>
      <div
        style={{
          paddingBottom: reserve,
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: `-${reserve}`,
        }}
      >
        {children}
      </div>
    </>
  )
}

//更好用的: 替代  PrintTogether
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
            <div className="print:pt-[length:var(--reserve)]" style={{"--reserve": reserve} as React.CSSProperties}>
                {children}
            </div>
        </div>
    )
}
