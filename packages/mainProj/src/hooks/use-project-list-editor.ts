"use client"

import { useState, useCallback } from "react"

export interface ProjectListEditorOptions {
    initialIndexes?: number[]
    availableProjects?: number[]
    maxProjects?: number
}

export interface ProjectListEditorReturn {
    // 状态
    projectIndexes: number[]

    // 操作方法
    addProject: (index: number) => void
    removeProject: (index: number) => void
    moveProjectUp: (currentIndex: number) => void
    moveProjectDown: (currentIndex: number) => void
    reorderProjects: (newOrder: number[]) => void
    clearAll: () => void

    // 工具方法
    canMoveUp: (currentIndex: number) => boolean
    canMoveDown: (currentIndex: number) => boolean
    isProjectAdded: (index: number) => boolean
    getAvailableProjects: () => number[]
}

export function useProjectListEditor({
                                         initialIndexes = [],
                                         availableProjects = [],
                                         maxProjects = 50,
                                     }: ProjectListEditorOptions = {}): ProjectListEditorReturn {
    const [projectIndexes, setProjectIndexes] = useState<number[]>(initialIndexes)

    // 添加项目
    const addProject = useCallback(
        (index: number) => {
            setProjectIndexes((prev) => {
                if (prev.includes(index) || prev.length >= maxProjects) {
                    return prev
                }
                return [...prev, index]
            })
        },
        [maxProjects],
    )

    // 删除项目
    const removeProject = useCallback((index: number) => {
        setProjectIndexes((prev) => prev.filter((item) => item !== index))
    }, [])

    // 上移项目
    const moveProjectUp = useCallback((currentIndex: number) => {
        setProjectIndexes((prev) => {
            const index = prev.indexOf(currentIndex)
            if (index <= 0) return prev

            const newOrder = [...prev]
            ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
            return newOrder
        })
    }, [])

    // 下移项目
    const moveProjectDown = useCallback((currentIndex: number) => {
        setProjectIndexes((prev) => {
            const index = prev.indexOf(currentIndex)
            if (index < 0 || index >= prev.length - 1) return prev

            const newOrder = [...prev]
            ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
            return newOrder
        })
    }, [])

    // 🔥 修复：重新排序项目
    const reorderProjects = useCallback((newOrder: number[]) => {
        console.log("🔥 reorderProjects 被调用:", newOrder) // 调试日志
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

    // 检查项目是否已添加
    const isProjectAdded = useCallback(
        (index: number) => {
            return projectIndexes.includes(index)
        },
        [projectIndexes],
    )

    // 获取可添加的项目
    const getAvailableProjects = useCallback(() => {
        return availableProjects.filter((index) => !projectIndexes.includes(index))
    }, [availableProjects, projectIndexes])

    return {
        projectIndexes,
        addProject,
        removeProject,
        moveProjectUp,
        moveProjectDown,
        reorderProjects,
        clearAll,
        canMoveUp,
        canMoveDown,
        isProjectAdded,
        getAvailableProjects,
    }
}
