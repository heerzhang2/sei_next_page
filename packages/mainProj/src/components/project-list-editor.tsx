"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ChevronUp, ChevronDown, ExternalLink, GripVertical, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjectListEditor, type ProjectListEditorOptions } from "@/hooks/use-project-list-editor"

export interface ProjectListEditorProps extends ProjectListEditorOptions {
    title?: string
    renderTitle: (index: number) => React.ReactNode
    getLinkUrl?: (index: number) => string
    onProjectClick?: (index: number) => void
    className?: string
    showAddButton?: boolean
    showClearButton?: boolean
    dragEnabled?: boolean
}

export function ProjectListEditor({
                                      title = "项目列表编辑器",
                                      renderTitle,
                                      getLinkUrl,
                                      onProjectClick,
                                      className,
                                      showAddButton = true,
                                      showClearButton = true,
                                      dragEnabled = false,
                                      ...editorOptions
                                  }: ProjectListEditorProps) {
    const {
        projectIndexes,
        addProject,
        removeProject,
        moveProjectUp,
        moveProjectDown,
        clearAll,
        canMoveUp,
        canMoveDown,
        getAvailableProjects,
    } = useProjectListEditor(editorOptions)

    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

    // 处理项目点击
    const handleProjectClick = (index: number) => {
        if (onProjectClick) {
            onProjectClick(index)
        } else if (getLinkUrl) {
            window.open(getLinkUrl(index), "_blank")
        }
    }

    // 拖拽处理
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (!dragEnabled) return
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent) => {
        if (!dragEnabled) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        if (!dragEnabled || draggedIndex === null) return
        e.preventDefault()

        const draggedPosition = projectIndexes.indexOf(draggedIndex)
        const targetPosition = projectIndexes.indexOf(targetIndex)

        if (draggedPosition !== -1 && targetPosition !== -1) {
            const newOrder = [...projectIndexes]
            const [removed] = newOrder.splice(draggedPosition, 1)
            newOrder.splice(targetPosition, 0, removed)

            // 这里需要调用 reorderProjects，但我们需要从 hook 中获取
            // 暂时使用多次移动来实现
            if (draggedPosition < targetPosition) {
                for (let i = draggedPosition; i < targetPosition; i++) {
                    moveProjectDown(draggedIndex)
                }
            } else {
                for (let i = draggedPosition; i > targetPosition; i--) {
                    moveProjectUp(draggedIndex)
                }
            }
        }

        setDraggedIndex(null)
    }

    const availableProjects = getAvailableProjects()

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{projectIndexes.length} 个项目</Badge>
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
                <div className="space-y-2">
                    {projectIndexes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>暂无项目</p>
                            <p className="text-sm">点击下方按钮添加项目</p>
                        </div>
                    ) : (
                        projectIndexes.map((projectIndex, position) => (
                            <div
                                key={projectIndex}
                                className={cn(
                                    "flex items-center gap-2 p-3 border rounded-lg transition-colors",
                                    "hover:bg-gray-50",
                                    draggedIndex === projectIndex && "opacity-50",
                                )}
                                draggable={dragEnabled}
                                onDragStart={(e) => handleDragStart(e, projectIndex)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, projectIndex)}
                            >
                                {/* 拖拽手柄 */}
                                {dragEnabled && <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />}

                                {/* 序号 */}
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    {position + 1}
                                </div>

                                {/* 项目标题 */}
                                <div
                                    className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
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
                                        className="h-8 w-8 p-0"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                )}

                                {/* 移动按钮 */}
                                <div className="flex flex-col">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveProjectUp(projectIndex)}
                                        disabled={!canMoveUp(projectIndex)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveProjectDown(projectIndex)}
                                        disabled={!canMoveDown(projectIndex)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </div>

                                {/* 删除按钮 */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeProject(projectIndex)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                                <Button key={index} variant="outline" size="sm" onClick={() => addProject(index)} className="h-8">
                                    <Plus className="w-3 h-3 mr-1" />
                                    {renderTitle(index)}
                                </Button>
                            ))}
                            {availableProjects.length > 10 && (
                                <Badge variant="secondary" className="h-8 flex items-center">
                                    +{availableProjects.length - 10} 更多
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* 调试信息 */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <strong>当前索引数组:</strong> [{projectIndexes.join(", ")}]
                </div>
            </CardContent>
        </Card>
    )
}
