"use client"

import React, {forwardRef, useCallback, useImperativeHandle, useState} from "react"
import { ProjectListEditor, type ProjectListEditorProps } from "./project-list-editor"
import { useProjectListEditor } from "@/hooks/use-project-list-editor"

export interface ProjectListFormFieldProps extends Omit<ProjectListEditorProps, "initial"> {
    value?: number[]
    onChange?: (value: number[]) => void
    name?: string
}

export interface ProjectListFormFieldRef {
    getValue: () => number[]
    setValue: (value: number[]) => void
    reset: () => void
}

export const ProjectListFormField = ({
             value = [], onChange, name,initialIndexes = [],
                 availableProjects = [],
                 maxProjects = 50,
                 ...props }: ProjectListFormFieldProps) => {
    // const {projectIndexes, } = useProjectListEditor({
    //     ...props,
    //     initialIndexes: value,
    // })

    const [projectIndexes, setProjectIndexes] = useState<number[]>(value)

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

    const editor= {
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


    // 当内部状态变化时，通知外部
    React.useEffect(() => {
        if (onChange) {
            onChange(projectIndexes)
        }
    }, [projectIndexes, onChange])

    // 当外部值变化时，更新内部状态
    React.useEffect(() => {
        if (JSON.stringify(value) !== JSON.stringify(projectIndexes)) {
            editor.reorderProjects(value)
        }
    }, [value])

    return (
        <div>
            <ProjectListEditor {...props}
                               initialIndexes={initialIndexes}
                               availableProjects={availableProjects}
                               maxProjects={maxProjects}
                               {...editor}
            />
            {name && <input type="hidden" name={name} value={JSON.stringify(projectIndexes)} />}
        </div>
    )
}
