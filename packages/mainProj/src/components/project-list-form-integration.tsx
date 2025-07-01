"use client"

import React, { forwardRef, useImperativeHandle } from "react"
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

export const ProjectListFormField = forwardRef<ProjectListFormFieldRef, ProjectListFormFieldProps>(
    ({ value = [], onChange, name, ...props }, ref) => {
        const {projectIndexes, ...editor} = useProjectListEditor({
            ...props,
            initialIndexes: value,
        })

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

        // 暴露给父组件的方法
        useImperativeHandle(
            ref,
            () => ({
                getValue: () => projectIndexes,
                setValue: (newValue: number[]) => editor.reorderProjects(newValue),
                reset: () => editor.clearAll(),
            }),
            [editor],
        )

        return (
            <div>
                <ProjectListEditor {...props} {...editor}  />
                {name && <input type="hidden" name={name} value={JSON.stringify(projectIndexes)} />}
            </div>
        )
    },
)

ProjectListFormField.displayName = "ProjectListFormField"
