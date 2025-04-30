"use client"

import React, {ReactNode} from "react";

interface PrintReserveLeastProps {
  /**
   * 需要预留的空间高度，例如 "13.3rem"
   */
  reserve: string

  /**
   * 标题内容
   */
  title: ReactNode

  /**
   * 正文内容
   */
  children: ReactNode

  /**
   * 额外的类名
   */
  className?: string

  /**
   * 标题容器的额外类名
   */
  titleClassName?: string

  /**
   * 内容容器的额外类名
   */
  contentClassName?: string
    /**必须新一页的页首开始打印的; 让reserve失去作用
     * */
  fromHead?: boolean
}

/**一页尾巴最少多少空间才打印，否则新一页打印的。
 * 使用动态生成的类名和内联样式的组合方式
 * 防止命名冲突 "--reserve-height":。仅作用于 .relative div 及其子元素。:root {--reserve-height:;全局默认值}; 内联样式优先级最高.
 * */
export function PrintReserveLeast({
                                    reserve,
                                    title,
                                    children,
                                    className = "",
                                    titleClassName = "",
                                    contentClassName = "",
                                    fromHead,
                                  }: PrintReserveLeastProps) {
  // 创建一个唯一的样式标签，用于动态添加CSS
  React.useEffect(() => {
    // 检查是否已存在相同的样式
    const existingStyle = document.getElementById("print-page-break-styles")

    if (!existingStyle) {
      const style = document.createElement("style")
      style.id = "print-page-break-styles"
      style.textContent = `
        @media print {
          .print-title-reserve {
            padding-bottom: var(--reserve-height) !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-content-offset {
            margin-top: calc(-1 * var(--reserve-height)) !important;
          }
        }
      `
      document.head.appendChild(style)
    }

    return () => {
      // 组件卸载时不移除样式，因为可能有其他实例在使用
    }
  }, [])

//同一个URL网页允许同时有多个不同的reserve配置的组件共存的：
  if(fromHead) return (
        <div className={`print:break-before-page ${className}`}>
            {/* 标题部分 */}
            <div className={`${titleClassName}`}>{title}</div>
            {/* 正文部分 */}
            <div className={`${contentClassName}`}>{children}</div>
        </div>
  )
  else return (
      <div className={`relative ${className}`} style={{"--reserve-height": reserve} as React.CSSProperties}>
        {/* 标题部分 */}
        <div className={`print-title-reserve ${titleClassName}`}>{title}</div>

        {/* 正文部分 */}
        <div className={`print-content-offset ${contentClassName}`}>{children}</div>
      </div>
  )
}
