"use client"
import React, {useCallback, useState} from "react"
import {Badge, Button, Card, CardContent, CardHeader, CardTitle} from "@/components/ui";
import {cn} from "@/lib/utils";
import {ChevronDown, ChevronUp, ExternalLink, Plus, RotateCcw, Trash2} from "lucide-react";

export interface ProjectListEditorOptions {
    initialIndexes?: number[]
    availableProjects?: number[]
    maxProjects?: number
}
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
export interface ProjectListFormFieldProps extends Omit<ProjectListEditorProps, "initialIndexes"> {
    value?: number[]
    onChange?: (value: number[]) => void
    name?: string
}
// export interface ProjectListFormFieldRef {
//     getValue: () => number[]
//     setValue: (value: number[]) => void
//     reset: () => void
// }

/**
 * 常用例子
* */
export const ProjectListFormField = ({
                 value = [], onChange, name,
                 maxProjects = 1000,
                 title = "可重复分项控制器",
                 renderTitle,
                 getLinkUrl,
                 onProjectClick,
                 className,
                 showAddButton = true,
                 showClearButton = true,
   }: ProjectListFormFieldProps) => {

    const [projectIndexes, setProjectIndexes] = useState<number[]>(value)

    // 添加项目
    const addProject = useCallback(
        (index: number) => {
            let insertId;
            if(index<0){
                const maxIdNumo = Math.max(...(projectIndexes || [-1]) ) ??0;
                insertId=maxIdNumo<0 ? 0 : maxIdNumo+1;
            }
            else
                insertId=index;
            setProjectIndexes((prev) => {
                if (prev.includes(insertId) || prev.length >= maxProjects) {
                    return prev
                }
                return [...prev, insertId]
            })
        },
        [maxProjects, projectIndexes]
    )

    // 删除项目
    const removeProject = useCallback((index: number) => {
        setProjectIndexes((prev) => prev.filter((item) => item !== index))
    }, [])

    // 上移项目
    const moveProjectUp = useCallback((e: { preventDefault: () => void; },currentIndex: number) => {
        e.preventDefault()
        setProjectIndexes((prev) => {
            const index = prev.indexOf(currentIndex)
            if (index <= 0) return prev

            const newOrder = [...prev]
            ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
            return newOrder
        })
    }, [])

    // 下移项目
    const moveProjectDown = useCallback((e: { preventDefault: () => void; },currentIndex: number) => {
        e.preventDefault()
        setProjectIndexes((prev) => {
            const index = prev.indexOf(currentIndex)
            if (index < 0 || index >= prev.length - 1) return prev

            const newOrder = [...prev]
            ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
            return newOrder
        })
    }, [])

    // 重新排序项目
    const reorderProjects = useCallback((newOrder: number[]) => {
        setProjectIndexes(newOrder)
    }, [])

    // 清空所有项目
    const clearAll = useCallback(() => {
        setProjectIndexes([])
    }, [])

    // 检查是否可以上移
    const canMoveUp = useCallback(
        (currentIndex: number) => {
            const index = projectIndexes.indexOf(currentIndex)
            return index > 0
        },
        [projectIndexes],
    )

    // 检查是否可以下移
    const canMoveDown = useCallback(
        (currentIndex: number) => {
            const index = projectIndexes.indexOf(currentIndex)
            return index >= 0 && index < projectIndexes.length - 1
        },
        [projectIndexes],
    )
    // 当内部状态变化时，通知外部
    React.useEffect(() => {
        if (onChange) {
            onChange(projectIndexes)
        }
    }, [projectIndexes, onChange])

    // 当外部值变化时，更新内部状态
    React.useEffect(() => {
        if (JSON.stringify(value) !== JSON.stringify(projectIndexes)) {
            reorderProjects(value)
        }
    }, [value])

    // 处理项目点击
    const handleProjectClick = (index: number) => {
        if (onProjectClick) {
            onProjectClick(index)
        } else if (getLinkUrl) {
            window.open(getLinkUrl(index), "_blank")
        }
    }

    return (
        <div>
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
                                    )}
                                >
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
                                            onClick={(e) => moveProjectUp(e,projectIndex)}
                                            disabled={!canMoveUp(projectIndex)}
                                            className="h-9 w-6 p-0"
                                        >
                                            <ChevronUp className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => moveProjectDown(e,projectIndex)}
                                            disabled={!canMoveDown(projectIndex)}
                                            className="h-9 w-6 p-0"
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
                    {showAddButton  && (
                        <div className="border-t pt-4">
                            <div className="flex flex-wrap gap-2">
                                <Button key={1} variant="outline" size="sm" onClick={() => addProject(-1)} className="h-8">
                                    <Plus className="w-3 h-3 mr-1" />
                                    <Badge variant="secondary" className="h-8 flex items-center">
                                        + {projectIndexes.length} 更多
                                    </Badge>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            {name && <input type="hidden" name={name} value={JSON.stringify(projectIndexes)} />}
        </div>
    )
}
