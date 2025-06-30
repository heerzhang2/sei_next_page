"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Smartphone, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragItem {
    id: number
    title: string
    color: string
}

const initialItems: DragItem[] = [
    { id: 1, title: "第一个项目", color: "bg-red-100 text-red-800" },
    { id: 2, title: "第二个项目", color: "bg-blue-100 text-blue-800" },
    { id: 3, title: "第三个项目", color: "bg-green-100 text-green-800" },
    { id: 4, title: "第四个项目", color: "bg-yellow-100 text-yellow-800" },
    { id: 5, title: "第五个项目", color: "bg-purple-100 text-purple-800" },
]

export function TouchDragDemo() {
    const [items, setItems] = useState<DragItem[]>(initialItems)
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [isClient, setIsClient] = useState(false)

    // 🔥 修复：客户端检测
    useEffect(() => {
        setIsClient(true)
        const checkTouchDevice = () => {
            if (typeof window !== "undefined") {
                return "ontouchstart" in window || navigator.maxTouchPoints > 0
            }
            return false
        }
        setIsTouchDevice(checkTouchDevice())
    }, [])

    const handleDragStart = (item: DragItem, e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()

        const getPosition = (event: MouseEvent | TouchEvent) => {
            if ("touches" in event && event.touches.length > 0) {
                return { x: event.touches[0].clientX, y: event.touches[0].clientY }
            }
            return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY }
        }

        const startPos = getPosition(e.nativeEvent as MouseEvent | TouchEvent)
        setDraggedItem(item)
        setDragPosition(startPos)

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const currentPos = getPosition(e)
            setDragPosition(currentPos)

            // 查找拖拽目标
            const elements = document.querySelectorAll("[data-drop-zone]")
            let targetIndex: number | null = null

            elements.forEach((el) => {
                const rect = el.getBoundingClientRect()
                if (
                    currentPos.x >= rect.left &&
                    currentPos.x <= rect.right &&
                    currentPos.y >= rect.top &&
                    currentPos.y <= rect.bottom
                ) {
                    targetIndex = Number.parseInt(el.getAttribute("data-drop-zone") || "0")
                }
            })

            setDropTargetIndex(targetIndex)
        }

        const handleEnd = () => {
            if (draggedItem && dropTargetIndex !== null) {
                const currentIndex = items.findIndex((i) => i.id === draggedItem.id)
                if (currentIndex !== -1 && currentIndex !== dropTargetIndex) {
                    const newItems = [...items]
                    const [movedItem] = newItems.splice(currentIndex, 1)
                    newItems.splice(dropTargetIndex, 0, movedItem)
                    setItems(newItems)
                }
            }

            setDraggedItem(null)
            setDropTargetIndex(null)

            document.removeEventListener("mousemove", handleMove)
            document.removeEventListener("mouseup", handleEnd)
            document.removeEventListener("touchmove", handleMove)
            document.removeEventListener("touchend", handleEnd)
        }

        document.addEventListener("mousemove", handleMove, { passive: false })
        document.addEventListener("mouseup", handleEnd)
        document.addEventListener("touchmove", handleMove, { passive: false })
        document.addEventListener("touchend", handleEnd)
    }

    const resetItems = () => {
        setItems(initialItems)
    }

    // 🔥 在客户端渲染之前显示加载状态
    if (!isClient) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>触摸拖拽演示</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>触摸拖拽演示</span>
                        <div className="flex items-center gap-2">
                            {isTouchDevice ? (
                                <Badge variant="default" className="flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    触摸设备
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Monitor className="w-3 h-3" />
                                    桌面设备
                                </Badge>
                            )}
                            <Button variant="outline" size="sm" onClick={resetItems}>
                                重置
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600 mb-4">
                        {isTouchDevice ? "👆 长按拖拽手柄来移动项目" : "🖱️ 点击拖拽手柄来移动项目"}
                    </div>

                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            data-drop-zone={index}
                            className={cn(
                                "flex items-center gap-3 p-3 border rounded-lg transition-all duration-200",
                                draggedItem?.id === item.id && "opacity-30 scale-95",
                                dropTargetIndex === index && "ring-2 ring-blue-500 bg-blue-50",
                                "hover:bg-gray-50",
                            )}
                        >
                            {/* 拖拽手柄 */}
                            <div
                                className={cn(
                                    "cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-200 transition-colors",
                                    isTouchDevice && "touch-manipulation",
                                )}
                                onMouseDown={(e) => handleDragStart(item, e)}
                                onTouchStart={(e) => handleDragStart(item, e)}
                            >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* 序号 */}
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                            </div>

                            {/* 项目内容 */}
                            <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                <Badge variant="secondary" className={cn("text-xs mt-1", item.color)}>
                                    ID: {item.id}
                                </Badge>
                            </div>
                        </div>
                    ))}

                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-4">
                        <strong>当前顺序:</strong> {items.map((item) => item.id).join(" → ")}
                    </div>
                </CardContent>
            </Card>

            {/* 拖拽时的浮动元素 */}
            {draggedItem && (
                <div
                    className="fixed pointer-events-none z-50 bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: dragPosition.x,
                        top: dragPosition.y,
                    }}
                >
                    <div className="font-medium text-sm">{draggedItem.title}</div>
                    <div className="text-xs text-gray-500">拖拽中...</div>
                </div>
            )}
        </>
    )
}
