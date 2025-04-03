"use client"

import type React from "react"
import { useRef, useContext, createContext, useId } from "react"
import { usePrintSettings } from "@/contexts/print-settings-context"

// 创建一个上下文来处理嵌套的 PageSectionOrientation
interface OrientationContextType {
  parentOrientation?: "portrait" | "landscape"
}

const OrientationContext = createContext<OrientationContextType>({})

//【约束】对于非自定义纸张的，默认竖着的，不能用<PageSectionOrientation orientation="landscape">在顶层设置打印方向，只能默认竖的，然后添加独立的PageSectionOrientation改变为横着打印方向。不能嵌套2层的;
//简单来说：横竖纸张方向都有的+非自定义纸张的前提情形之下，只能在顶层默认竖着的打印方向。不支持默认横着打印，就是只能竖着的底下嵌套横着的组件嵌套布局。
// 修改 PageSectionOrientation 组件，使用CSS类名而不是动态样式
export default function PageSectionOrientation({
  orientation = "portrait",
  children,
}: {
  orientation?: "portrait" | "landscape"
  children: React.ReactNode
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  // 使用 useId() 替代 Math.random() 生成稳定的ID
  const uniqueId = useId()
  const sectionId = `print-section-${orientation}-${uniqueId.replace(/:/g, "")}`

  // 获取父级方向上下文
  const parentContext = useContext(OrientationContext)

  // 获取全局打印设置
  const { settings } = usePrintSettings()

  // 确定要使用的CSS类名
  let orientationClass = ""

  if (settings.isCustomSize) {
    // 使用自定义尺寸
    orientationClass = orientation === "landscape" ? "print-custom-landscape" : "print-custom-portrait"
  } else {
    // 使用标准尺寸
    orientationClass = orientation === "landscape" ? "print-landscape" : "" // 纵向是默认值，不需要特殊类
  }

  // 添加嵌套标记
  const isNested = !!parentContext.parentOrientation

  return (
    <OrientationContext.Provider value={{ parentOrientation: orientation }}>
      <div
        ref={sectionRef}
        id={sectionId}
        className={`print-section my-8 print:my-0 ${orientationClass}`}
        data-orientation={orientation}
        data-nested={isNested ? "true" : "false"}
        data-parent-orientation={parentContext.parentOrientation}
      >
        {children}
      </div>
    </OrientationContext.Provider>
  )
}

