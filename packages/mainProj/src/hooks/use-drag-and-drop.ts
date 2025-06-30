"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"

export interface DragItem {
    id: string | number
    index: number
}

export interface DragPosition {
    x: number
    y: number
}

export interface UseDragAndDropOptions {
    onReorder: (fromIndex: number, toIndex: number) => void
    disabled?: boolean
}

export function useDragAndDrop({ onReorder, disabled = false }: UseDragAndDropOptions) {
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
    const [dragPosition, setDragPosition] = useState<DragPosition>({ x: 0, y: 0 })
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)

    // 🔥 修复：使用 ref 来避免闭包问题
    const draggedItemRef = useRef<DragItem | null>(null)
    const dropTargetIndexRef = useRef<number | null>(null)
    const dragStartPos = useRef<DragPosition>({ x: 0, y: 0 })
    const isDragging = useRef(false)
    const dragThreshold = 5 // 最小拖拽距离

    // 🔥 修复：在客户端检测触摸设备
    useEffect(() => {
        const checkTouchDevice = () => {
            if (typeof window !== "undefined") {
                return "ontouchstart" in window || navigator.maxTouchPoints > 0
            }
            return false
        }
        setIsTouchDevice(checkTouchDevice())
    }, [])

    // 获取事件坐标
    const getEventPosition = useCallback((e: MouseEvent | TouchEvent): DragPosition => {
        if ("touches" in e && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
    }, [])

    // 开始拖拽
    const handleDragStart = useCallback(
        (item: DragItem, e: React.MouseEvent | React.TouchEvent) => {
            if (disabled) return

            e.preventDefault()
            const position = getEventPosition(e.nativeEvent as MouseEvent | TouchEvent)

            console.log("🔥 开始拖拽:", item) // 调试日志

            // 🔥 修复：同时更新状态和 ref
            setDraggedItem(item)
            draggedItemRef.current = item
            setDragPosition(position)
            dragStartPos.current = position
            isDragging.current = false

            // 添加全局事件监听
            const handleMove = (e: MouseEvent | TouchEvent) => {
                const currentPos = getEventPosition(e)
                const deltaX = Math.abs(currentPos.x - dragStartPos.current.x)
                const deltaY = Math.abs(currentPos.y - dragStartPos.current.y)

                // 检查是否超过拖拽阈值
                if (!isDragging.current && (deltaX > dragThreshold || deltaY > dragThreshold)) {
                    isDragging.current = true
                    console.log("🔥 开始真正拖拽") // 调试日志
                }

                if (isDragging.current) {
                    setDragPosition(currentPos)

                    // 🔥 修复：查找拖拽目标
                    const elements = document.querySelectorAll("[data-drop-target]")
                    let targetIndex: number | null = null

                    console.log("🔥 查找拖拽目标，找到元素数量:", elements.length) // 调试日志

                    elements.forEach((el, idx) => {
                        const rect = el.getBoundingClientRect()
                        const dropIndex = Number.parseInt(el.getAttribute("data-drop-target") || "0")

                        console.log(`🔥 检查元素 ${idx}:`, {
                            dropIndex,
                            rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
                            currentPos,
                            isInside:
                                currentPos.x >= rect.left &&
                                currentPos.x <= rect.right &&
                                currentPos.y >= rect.top &&
                                currentPos.y <= rect.bottom,
                        }) // 调试日志

                        if (
                            currentPos.x >= rect.left &&
                            currentPos.x <= rect.right &&
                            currentPos.y >= rect.top &&
                            currentPos.y <= rect.bottom
                        ) {
                            targetIndex = dropIndex
                            console.log("🔥 找到目标位置:", targetIndex) // 调试日志
                        }
                    })

                    // 🔥 修复：同时更新状态和 ref
                    setDropTargetIndex(targetIndex)
                    dropTargetIndexRef.current = targetIndex
                }
            }

            const handleEnd = () => {
                console.log("🔥 拖拽结束:", {
                    isDragging: isDragging.current,
                    draggedItemRef: draggedItemRef.current,
                    dropTargetIndexRef: dropTargetIndexRef.current,
                    fromIndex: item.index,
                }) // 调试日志

                // 🔥 修复：使用 ref 值而不是状态值
                if (
                    isDragging.current &&
                    draggedItemRef.current &&
                    dropTargetIndexRef.current !== null &&
                    dropTargetIndexRef.current !== item.index
                ) {
                    console.log("🔥 执行重排序:", item.index, "->", dropTargetIndexRef.current) // 调试日志
                    onReorder(item.index, dropTargetIndexRef.current)
                }

                // 清理状态和 ref
                setDraggedItem(null)
                setDropTargetIndex(null)
                draggedItemRef.current = null
                dropTargetIndexRef.current = null
                isDragging.current = false

                // 移除事件监听
                document.removeEventListener("mousemove", handleMove)
                document.removeEventListener("mouseup", handleEnd)
                document.removeEventListener("touchmove", handleMove)
                document.removeEventListener("touchend", handleEnd)
            }

            // 添加事件监听
            document.addEventListener("mousemove", handleMove, { passive: false })
            document.addEventListener("mouseup", handleEnd)
            document.addEventListener("touchmove", handleMove, { passive: false })
            document.addEventListener("touchend", handleEnd)
        },
        [disabled, getEventPosition, onReorder],
    )

    return {
        draggedItem,
        dragPosition,
        dropTargetIndex,
        isDragging: isDragging.current,
        isTouchDevice,
        handleDragStart,
    }
}
