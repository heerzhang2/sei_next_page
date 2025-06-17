"use client"
import React from "react"
import type { InternalItemProps } from "@/report/common/base"
import {
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Badge,
    Label,
    Checkbox,
} from "@/components/ui"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { CollapsibleFormSection } from "@/components/chub"
import { useStorage } from "@/report/StorageContext"
import { Edit, Trash2, Plus, X, AlertCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertTitle } from "@/components/ui"
import { SmartTruncatedText } from "@/components/smart-truncated-text"

export declare type InputMoreCallback = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode
interface ProjectRProps extends InternalItemProps {
    defaultProj: ProjectItem[]
    nrec?: boolean
}

interface ProjectItem {
    name: string
    ha?: string
    na?: boolean
    ml?: string
    do?: boolean
    om?: boolean
    dd?: boolean
    zs?: boolean
}

export const ProjectR = ({ children, show, alone = true, defaultProj, label, rep }: ProjectRProps) => {
    const { storage } = useStorage()
    const [projects, setProjects] = React.useState<ProjectItem[]>(storage?.Projects ?? defaultProj)
    const fixItemLen = defaultProj.length
    if (fixItemLen <= 0) throw new Error("目录表非法")
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [editForm, setEditForm] = React.useState<ProjectItem>({
        name: "",
        ha: "",
        ml: "",
        na: false,
        do: false,
        om: false,
        dd: false,
        zs: false,
    })
    const [editErr, setEditErr] = React.useState<string>()

    // 开始编辑
    const startEdit = (index: number) => {
        setEditingIndex(index)
        setEditForm({ ...projects[index] })
        setIsAddingNew(false)
    }

    // 开始新增
    const startAdd = () => {
        setIsAddingNew(true)
        setEditingIndex(null)
        setEditForm({
            name: "",
            ha: "",
            ml: "",
            na: false,
            do: false,
            om: false,
            dd: false,
            zs: false,
        })
    }

    // 保存编辑
    const saveEdit = () => {
        if (editingIndex !== null) {
            if (editForm.name === "") {
                setEditErr("名字是必填项的")
                return
            }
            const newProjects = [...projects]
            newProjects[editingIndex] = { ...editForm }
            setProjects(newProjects)
            setEditingIndex(null)
            setEditErr("")
        }
    }

    // 保存新增
    const saveAdd = () => {
        if (editForm.name === "") {
            setEditErr("名字是必填项的")
            return
        }
        setProjects([...projects, { ...editForm }])
        setIsAddingNew(false)
        setEditErr("")
    }

    // 取消编辑
    const cancelEdit = () => {
        setEditingIndex(null)
        setIsAddingNew(false)
    }

    // 删除项目
    const deleteProject = (index: number) => {
        const newProjects = projects.filter((_, i) => i !== index)
        setProjects(newProjects)
    }

    // 更新表单字段
    const updateFormField = (field: keyof ProjectItem, value: any) => {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    // 渲染编辑表单
    const renderEditForm = (item: ProjectItem, isNew = false) => (
        <Card className="mt-2 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{isNew ? "新增目录项" : "编辑目录项"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">显示名称 *</Label>
                        <Input
                            id="name"
                            value={item.name}
                            onChange={(e) => updateFormField("name", e.target.value)}
                            placeholder="输入显示名称"
                            autoComplete="name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ha">Hash路由标签</Label>
                        <Input
                            id="ha"
                            value={item.ha || ""}
                            onChange={(e) => updateFormField("ha", e.target.value)}
                            placeholder="输入路由标签"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ml">目录显示题目</Label>
                    <Input
                        id="ml"
                        value={item.ml || ""}
                        onChange={(e) => updateFormField("ml", e.target.value)}
                        placeholder="输入在报告目录中的显示题目"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="do"
                            checked={item.do || false}
                            onCheckedChange={(checked) => updateFormField("do", checked)}
                        />
                        <Label htmlFor="do" className="text-sm">
                            默认有做
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="na"
                            checked={item.na || false}
                            onCheckedChange={(checked) => updateFormField("na", checked)}
                        />
                        <Label htmlFor="na" className="text-sm">
                            不在附页
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="om"
                            checked={item.om || false}
                            onCheckedChange={(checked) => updateFormField("om", checked)}
                        />
                        <Label htmlFor="om" className="text-sm">
                            仅记录目录
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="zs"
                            checked={item.zs || false}
                            onCheckedChange={(checked) => updateFormField("zs", checked)}
                        />
                        <Label htmlFor="zs" className="text-sm">
                            证书类型
                        </Label>
                    </div>
                </div>
                {editErr && (
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>{editErr}</AlertTitle>
                    </Alert>
                )}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        取消
                    </Button>
                    <Button onClick={isNew ? saveAdd : saveEdit}>确认当前项</Button>
                </div>
            </CardContent>
        </Card>
    )

    const onReset = () => {
        setProjects(storage?.Projects ?? defaultProj)
    }
    const onVerify = (values: any) => {
        values
        return true
    }
    const [render] = useFrameEditorBar({ rep, values: { Projects: projects }, onReset, onVerify })
    const clearProjectCatalog = React.useCallback(() => {
        setProjects(defaultProj)
    }, [])

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="h-md:@md:max-w-[80rem] m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            目录或附页表的编辑器
                            <Badge variant="secondary">共 {projects.length} 项</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-2">
                            {projects.map((project, index) => (
                                <div key={index}>
                                    {/* 项目展示行 */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-between py-1 @md:px-3 rounded-lg border transition-colors",
                                            editingIndex === index ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                        )}
                                    >
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                            <div className="font-medium text-sm">
                                                <span className="text-gray-500 mr-2">#{index + 1}</span>
                                                {project.name}
                                            </div>
                                            <div className="text-sm text-gray-600 min-w-0">
                                                {project.ml && (
                                                    <SmartTruncatedText
                                                        text={project.ml}
                                                        uniqueKey={`project-${index}-ml`}
                                                        maxLines={2}
                                                        containerClassName="w-full"
                                                        onToggle={(expanded) => {
                                                            console.log(`项目 ${index + 1} 文本${expanded ? "展开" : "收起"}`)
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {project.do && (
                                                    <Badge variant="default" className="text-xs">
                                                        有做
                                                    </Badge>
                                                )}
                                                {project.na && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        不在附页
                                                    </Badge>
                                                )}
                                                {project.om && (
                                                    <Badge variant="outline" className="text-xs">
                                                        仅记录
                                                    </Badge>
                                                )}
                                                {project.zs && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        证书
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">{project.ha && `路由: ${project.ha}`}</div>
                                        </div>

                                        <div className="flex items-center space-x-0 ml-0 flex-col gap-4 @md:gap-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(index)}
                                                disabled={editingIndex !== null || isAddingNew}
                                                className="@md:size-9 px-1 has-[>svg]:px-1"
                                                aria-label="修改"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {index >= fixItemLen && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteProject(index)}
                                                    disabled={editingIndex !== null || isAddingNew}
                                                    className="@md:size-9 px-1 has-[>svg]:px-1 text-red-600 hover:text-red-700"
                                                    aria-label="删除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 编辑表单 */}
                                    {editingIndex === index && renderEditForm(editForm)}
                                </div>
                            ))}

                            {/* 新增按钮和表单 */}
                            <div className="pt-4 border-t">
                                {!isAddingNew ? (
                                    <Button size="sm" onClick={startAdd} disabled={editingIndex !== null} className="w-full max-w-32">
                                        <Plus className="w-4 h-4 mr-2" />
                                        新增目录项
                                    </Button>
                                ) : (
                                    renderEditForm(editForm, true)
                                )}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <strong>字段说明：</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>
                                    <strong>显示名称：</strong>附录显示名称，需与页面逻辑开关代码保持一致
                                </li>
                                <li>
                                    <strong>Hash路由标签：</strong>页面路由标识
                                </li>
                                <li>
                                    <strong>目录显示题目：</strong>该分项在报告目录中的文本显示题目
                                </li>
                                <li>
                                    <strong>默认有做：</strong>默认包含的分项报告
                                </li>
                                <li>
                                    <strong>不在附页：</strong>不在结论报告附页中出现，但出现在目录中
                                </li>
                                <li>
                                    <strong>仅记录目录：</strong>仅出现在原始记录目录中
                                </li>
                                <li>
                                    <strong>证书类型：</strong>证书类型项目
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">
                        <div>
              <span className="text-sm">
                有些是不在附页中体现的但却在目录中有的其页号需设定。想清空所有项目（分项）和目录的配置（谨慎使用！）
              </span>
                            <Button size="sm" onClick={clearProjectCatalog}>
                                重新初始化
                            </Button>
                        </div>
                        {render()}
                    </CardFooter>
                </Card>
                {children}
            </div>
        </CollapsibleFormSection>
    )
}
