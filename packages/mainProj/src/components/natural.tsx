"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageProps {
  src: string
  alt?: string
}

export const ImageComponentNatural: React.FC<ImageProps> = ({ src, alt = "图片" }) => {
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 })
  const [isLoading, setIsLoading] = useState(true)

  // 获取图片的自然尺寸
  useEffect(() => {
    if (typeof window === 'undefined' || !src) return
    const img = new window.Image() // 改用原生 Image 构造函数
    img.onload = () => {
      const maxWidth = 800
      const width = img.width > maxWidth ? maxWidth : img.width
      const height = (width / img.width) * img.height
      setDimensions({ width, height })
      setIsLoading(false)
    }
    img.onerror = () => {
      setIsLoading(false)
    }
    img.src = src

    // 添加清理函数防止内存泄漏
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return (
    <div className="flex justify-around items-center mb-2">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 rounded" style={{ width: 300, height: 200 }}></div>
      ) : (
        <div className="relative">
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={dimensions.width}
            height={dimensions.height}
            className="object-contain max-h-[14cm] print:max-h-[26cm] print:max-w-[705px] lg:max-h-[18cm]"
            unoptimized
            style={{
              width: "auto", // 让图片保持其自然宽度
              height: "auto", // 让图片保持其自然高度
              maxWidth: "100%", // 确保图片不会超出容器
            }}
          />
        </div>
      )}
    </div>
  )
}

