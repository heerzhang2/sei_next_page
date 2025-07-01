"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink, GripVertical, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectListEditor, type ProjectListEditorOptions } from "@/hooks/use-project-list-editor"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"

export interface ProjectListEditorMobileProps extends ProjectListEditorOptions {
    title?: string
    renderTitle: (index: number) => React.ReactNode
    getLinkUrl?: (index: number) => string
    onProjectClick?: (index: number) => void
    className?: string
    showAddButton?: boolean
    showClearButton?: boolean
    dragEnabled?: boolean
}

export function ProjectListEditorMobile({
                                            title = "项目列表编辑器",
                                            renderTitle,
                                            getLinkUrl,
                                            onProjectClick,
                                            className,
                                            showAddButton = true,
                                            showClearButton = true,
                                            dragEnabled = false,
                                            ...editorOptions
                                        }: ProjectListEditorMobileProps) {
    const [isClient, setIsClient] = useState(false)

    const {
        projectIndexes,
        addProject,
        removeProject,
        moveProjectUp,
        moveProjectDown,
        reorderProjects,
        clearAll,
        canMoveUp,
        canMoveDown,
        getAvailableProjects,
    } = useProjectListEditor(editorOptions)

    // 🔥 修复：拖拽功能的重排序逻辑
    const { draggedItem, dragPosition, dropTargetIndex, isTouchDevice, handleDragStart } = useDragAndDrop({
        onReorder: (fromIndex, toIndex) => {
            console.log("🔥 收到重排序请求:", { fromIndex, toIndex, projectIndexes }) // 调试日志

            if (fromIndex === toIndex) return

            const newOrder = [...projectIndexes]
            const [movedItem] = newOrder.splice(fromIndex, 1)
            newOrder.splice(toIndex, 0, movedItem)

            console.log("🔥 新顺序:", newOrder) // 调试日志
            reorderProjects(newOrder)
        },
        disabled: !dragEnabled,
    })

    // 🔥 修复：客户端检测
    useEffect(() => {
        setIsClient(true)
    }, [])

    // 处理项目点击
    const handleProjectClick = (index: number) => {
        if (onProjectClick) {
            onProjectClick(index)
        } else if (getLinkUrl) {
            window.open(getLinkUrl(index), "_blank")
        }
    }

    const availableProjects = getAvailableProjects()

    // 🔥 在客户端渲染之前显示加载状态
    if (!isClient) {
        return (
            <Card className={cn("w-full", className)}>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className={cn("w-full", className)}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{title}</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{projectIndexes.length} 个项目</Badge>
                            {isTouchDevice && <Badge variant="outline">📱 触摸设备</Badge>}
                            {showClearButton && projectIndexes.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearAll} className="h-8 bg-transparent">
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    清空
                                </Button>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* 项目列表 */}
                    <div className="space-y-2 relative">
                        {projectIndexes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>暂无项目</p>
                                <p className="text-sm">点击下方按钮添加项目</p>
                            </div>
                        ) : (
                            projectIndexes.map((projectIndex, position) => (
                                <div
                                    key={`${projectIndex}-${position}`} // 🔥 修复：使用组合键避免重复
                                    data-drop-target={position} // 🔥 关键：确保这个属性正确设置
                                    className={cn(
                                        "flex items-center gap-2 p-3 border rounded-lg transition-all duration-200",
                                        "hover:bg-gray-50 active:bg-gray-100",
                                        draggedItem?.id === projectIndex && "opacity-30 scale-95",
                                        dropTargetIndex === position && "ring-2 ring-blue-500 bg-blue-50",
                                    )}
                                >
                                    {/* 拖拽手柄 */}
                                    {dragEnabled && (
                                        <div
                                            className={cn(
                                                "flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded",
                                                "hover:bg-gray-200 transition-colors",
                                                // 🔥 修复：添加 CSS 来防止触摸滚动
                                                "touch-none select-none",
                                                isTouchDevice ? "touch-manipulation" : "",
                                            )}
                                            style={{
                                                // 🔥 修复：CSS 防止触摸滚动
                                                touchAction: "none",
                                                WebkitTouchCallout: "none",
                                                WebkitUserSelect: "none",
                                                userSelect: "none",
                                            }}
                                            onMouseDown={(e) => {
                                                console.log("🔥 鼠标按下:", { projectIndex, position }) // 调试日志
                                                handleDragStart({ id: projectIndex, index: position }, e as React.MouseEvent)
                                            }}
                                            onTouchStart={(e) => {
                                                console.log("🔥 触摸开始:", { projectIndex, position }) // 调试日志
                                                // 🔥 修复：阻止触摸滚动
                                                // e.preventDefault()
                                                e.stopPropagation()
                                                handleDragStart({ id: projectIndex, index: position }, e as React.TouchEvent)
                                            }}
                                        >
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}

                                    {/* 序号 */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {position + 1}
                                    </div>

                                    {/* 项目标题 */}
                                    <div
                                        className="flex-1 cursor-pointer hover:text-blue-600 transition-colors select-none"
                                        onClick={() => handleProjectClick(projectIndex)}
                                    >
                                        {renderTitle(projectIndex)}
                                    </div>

                                    {/* 链接图标 */}
                                    {(getLinkUrl || onProjectClick) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleProjectClick(projectIndex)}
                                            className="h-8 w-8 p-0 flex-shrink-0"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    )}

                                    {/* 移动按钮 - 在移动端显示更大的按钮 */}
                                    <div className={cn("flex", isTouchDevice ? "flex-row gap-1" : "flex-col")}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveProjectUp(projectIndex)}
                                            disabled={!canMoveUp(projectIndex)}
                                            className={cn("p-0", isTouchDevice ? "h-8 w-8" : "h-6 w-6")}
                                        >
                                            <ChevronUp className={cn(isTouchDevice ? "w-4 h-4" : "w-3 h-3")} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveProjectDown(projectIndex)}
                                            disabled={!canMoveDown(projectIndex)}
                                            className={cn("p-0", isTouchDevice ? "h-8 w-8" : "h-6 w-6")}
                                        >
                                            <ChevronDown className={cn(isTouchDevice ? "w-4 h-4" : "w-3 h-3")} />
                                        </Button>
                                    </div>

                                    {/* 删除按钮 */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProject(projectIndex)}
                                        className={cn(
                                            "p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0",
                                            isTouchDevice ? "h-8 w-8" : "h-8 w-8",
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 添加项目按钮 */}
                    {showAddButton && availableProjects.length > 0 && (
                        <div className="border-t pt-4">
                            <div className="flex flex-wrap gap-2">
                                {availableProjects.slice(0, 10).map((index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addProject(index)}
                                        className={cn("h-8", isTouchDevice && "min-h-[44px] h-auto py-2")}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        <span className="truncate">{renderTitle(index)}</span>
                                    </Button>
                                ))}
                                {availableProjects.length > 10 && (
                                    <Badge variant="secondary" className={cn("h-8 flex items-center", isTouchDevice && "h-11")}>
                                        +{availableProjects.length - 10} 更多
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 调试信息 */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <div>
                            <strong>当前索引数组:</strong> [{projectIndexes.join(", ")}]
                        </div>
                        {dragEnabled && (
                            <div className="mt-1">
                                <strong>拖拽状态:</strong>{" "}
                                {draggedItem ? `拖拽中 (ID:${draggedItem.id}, 位置:${draggedItem.index})` : "未拖拽"}
                                {dropTargetIndex !== null && ` -> 目标位置: ${dropTargetIndex}`}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 拖拽时的浮动元素 */}
            {draggedItem && (
                <div
                    className="fixed pointer-events-none z-50 bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: dragPosition.x,
                        top: dragPosition.y,
                        // 🔥 修复：确保浮动元素不影响触摸
                        touchAction: "none",
                    }}
                >
                    <div className="text-sm font-medium">拖拽中...</div>
                    <div className="text-xs text-gray-500">{renderTitle(draggedItem.id as number)}</div>
                </div>
            )}
        </>
    )
}
