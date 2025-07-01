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

    // 🔥 新增：防止页面滚动的方法
    const preventScroll = useCallback((e: Event) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const lockBodyScroll = useCallback(() => {
        // 锁定 body 滚动
        document.body.style.overflow = "hidden"
        document.body.style.position = "fixed"
        document.body.style.width = "100%"
        document.body.style.height = "100%"

        // 阻止触摸滚动
        document.addEventListener("touchmove", preventScroll, { passive: false })
        document.addEventListener("touchstart", preventScroll, { passive: false })
    }, [preventScroll])

    const unlockBodyScroll = useCallback(() => {
        // 恢复 body 滚动
        document.body.style.overflow = ""
        document.body.style.position = ""
        document.body.style.width = ""
        document.body.style.height = ""

        // 移除滚动阻止
        document.removeEventListener("touchmove", preventScroll)
        document.removeEventListener("touchstart", preventScroll)
    }, [preventScroll])

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

            // 🔥 修复：强制阻止默认行为和事件冒泡
            // e.preventDefault()
            e.stopPropagation()

            const position = getEventPosition(e.nativeEvent as MouseEvent | TouchEvent)

            console.log("🔥 开始拖拽:", item) // 调试日志

            // 🔥 修复：同时更新状态和 ref
            setDraggedItem(item)
            draggedItemRef.current = item
            setDragPosition(position)
            dragStartPos.current = position
            isDragging.current = false

            // 🔥 新增：锁定页面滚动
            if (isTouchDevice) {
                lockBodyScroll()
            }

            // 添加全局事件监听
            const handleMove = (e: MouseEvent | TouchEvent) => {
                // 🔥 修复：强制阻止默认行为
                e.preventDefault()
                e.stopPropagation()

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

                    elements.forEach((el) => {
                        const rect = el.getBoundingClientRect()
                        const dropIndex = Number.parseInt(el.getAttribute("data-drop-target") || "0")

                        if (
                            currentPos.x >= rect.left &&
                            currentPos.x <= rect.right &&
                            currentPos.y >= rect.top &&
                            currentPos.y <= rect.bottom
                        ) {
                            targetIndex = dropIndex
                        }
                    })

                    // 🔥 修复：同时更新状态和 ref
                    setDropTargetIndex(targetIndex)
                    dropTargetIndexRef.current = targetIndex
                }
            }

            const handleEnd = (e: MouseEvent | TouchEvent) => {
                // 🔥 修复：阻止默认行为
                e.preventDefault()
                e.stopPropagation()

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

                // 🔥 新增：解锁页面滚动
                if (isTouchDevice) {
                    unlockBodyScroll()
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

            // 🔥 修复：添加事件监听，确保不是被动的
            document.addEventListener("mousemove", handleMove, { passive: false })
            document.addEventListener("mouseup", handleEnd, { passive: false })
            document.addEventListener("touchmove", handleMove, { passive: false })
            document.addEventListener("touchend", handleEnd, { passive: false })
        },
        [disabled, getEventPosition, onReorder, isTouchDevice, lockBodyScroll, unlockBodyScroll],
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
