"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TableOfContentsProps {
  items: {
    title: string
    url: string
  }[]
}

/**辅助列表的显示；同步#hash路由的标签的位置突出显示。
 * 源自v0dev的；
* */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeItem, setActiveItem] = useState<string>("")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    // Create an intersection observer for each section
    items.forEach(({ url }) => {
      // Extract the ID from the URL (e.g., "#nesting-layouts" -> "nesting-layouts")
      const id = url.startsWith("#") ? url.substring(1) : url
      const element = document.getElementById(id)

      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // When section is in view with at least 40% visibility
            if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
              setActiveItem(url)
            }
          })
        },
        {
          rootMargin: "0px 0px -80% 0px", // Adjust the margins to control when sections are considered "active"
          threshold: [0.4, 0.8], // Observe at 40% and 80% visibility
        },
      )

      observer.observe(element)
      observers.push(observer)
    })

    // Cleanup observers when component unmounts
    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [items])

  //CSS需要在相对窗口添加的"@container", 设置容器查询@3xs:columns-2的位置最靠近的上下文；
  return (
    <div className="w-full @container">
      <div className="mb-4 text-sm font-medium">快捷入口</div>
      <nav>
        <ul className="@3xs:columns-2 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                className={cn(
                    "block text-foreground hover:text-foreground transition-colors", // 直接使用默认深色
                    activeItem === item.url && "font-bold text-foreground" // 激活状态保持一致
                )}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(item.url)?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
