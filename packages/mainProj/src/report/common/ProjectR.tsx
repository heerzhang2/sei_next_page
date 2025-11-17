"use client"
import React, { useEffect } from "react"
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
    Switch,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { CollapsibleFormSection } from "@/components/chub"
import { useStorage } from "@/report/StorageContext"
import { Edit, Trash2, Plus, X, AlertCircleIcon, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertTitle } from "@/components/ui"
import { SmartTruncatedText } from "@/components/smart-truncated-text"
import { useSearchParams } from "next/navigation"
import PdfOutlineAnalyzer from "@/components/pdf-outline-analyzer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// export declare type InputMoreCallback = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode
interface ProjectItem {
    name: string
    ha?: string
    na?: boolean
    ml?: string
    do?: boolean
    om?: boolean
    dd?: boolean
    zs?: boolean
    page?: string
    apx?: string
    op?: string
    oa?: string
}
interface ProjectRProps extends InternalItemProps {
    defaultProj: ProjectItem[]
    nRec?: boolean
    nApx?: boolean
}
/*
这里表格布局类似于手机上原生的APP用的图片Card方块布局有点类似的，都是无法通用的做法，只能为特定表格做特殊布局，Grid配置也不通用，屏幕适应性差。
* */
export const ProjectR = ({ children, show, defaultProj: defPrj, label, rep, nApx, nRec }: ProjectRProps) => {
    const searchParams = useSearchParams()
    const jumpProjIdx = searchParams!.get("from")
    const { storage } = useStorage()
    const defaultProj = React.useMemo(() => {
        //仅仅页面上用的路由hash字段 "ha": 不需要存储数据库给报告的。
        return defPrj.map((one) => {
            const { ha, ...other } = one
            return { ...other }
        })
    }, [defPrj])
    const [projects, setProjects] = React.useState<ProjectItem[]>(storage?.Projects ?? defaultProj)
    const fixItemLen = defaultProj.length
    if (fixItemLen <= 0) throw new Error("目录表非法")
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [editForm, setEditForm] = React.useState<ProjectItem>({
        name: "",
    })
    const [editErr, setEditErr] = React.useState<string>()

    // 取消编辑或新增的通用方法
    const cancelEdit = () => {
        setEditingIndex(null)
        setIsAddingNew(false)
        setEditErr("")
    }

    // 开始编辑 - 自动取消其他操作
    const startEdit = (index: number) => {
        // 如果有正在进行的编辑或新增，先取消
        if (editingIndex !== null || isAddingNew) {
            cancelEdit()
        }

        setEditingIndex(index)
        setEditForm({ ...projects[index] })
        setIsAddingNew(false)
    }

    useEffect(() => {
        jumpProjIdx && startEdit(Number(jumpProjIdx))
    }, [jumpProjIdx])

    // 开始新增 - 自动取消其他操作
    const startAdd = () => {
        // 如果有正在进行的编辑，先取消
        if (editingIndex !== null) {
            cancelEdit()
        }

        setIsAddingNew(true)
        setEditingIndex(null)
        setEditForm({
            name: "",
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

    // 删除项目 - 自动取消其他操作
    const deleteProject = (index: number) => {
        // 如果有正在进行的编辑或新增，先取消
        if (editingIndex !== null || isAddingNew) {
            cancelEdit()
        }

        const newProjects = projects.filter((_, i) => i !== index)
        setProjects(newProjects)
    }

    // 更新表单字段
    const updateFormField = (field: keyof ProjectItem, value: any) => {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    // 渲染编辑表单
    const renderEditForm = (item: ProjectItem, isNew = false) => (
        <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
            {isNew && (
                <CardHeader className="pb-0">
                    <CardTitle>新增目录项</CardTitle>
                </CardHeader>
            )}
            <CardContent className="space-y-1 px-2">
                <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3 gap-1">
                    {isNew && (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="select-text">
                                检验项目名称 *
                            </Label>
                            <Input
                                id="name"
                                value={item.name}
                                onChange={(e) => updateFormField("name", e.target.value)}
                                placeholder="输入关键名称"
                                autoComplete="name"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="page" className="select-text">
                            页号
                        </Label>
                        <Input
                            id="page"
                            value={item.page || ""}
                            onChange={(e) => updateFormField("page", e.target.value)}
                            placeholder="输入页号"
                        />
                    </div>
                    {!nApx && (
                        <div className="space-y-2">
                            <Label htmlFor="apx" className="select-text">
                                附页、附图
                            </Label>
                            <Input
                                id="apx"
                                value={item.apx || ""}
                                onChange={(e) => updateFormField("apx", e.target.value)}
                                placeholder="输入附页、附图"
                            />
                        </div>
                    )}
                    {!nRec && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="op" className="select-text">
                                    记录-页号
                                </Label>
                                <Input
                                    id="op"
                                    value={item.op || ""}
                                    onChange={(e) => updateFormField("op", e.target.value)}
                                    placeholder="输入记录-页号"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="oa" className="select-text">
                                    记录-附图附页
                                </Label>
                                <Input
                                    id="oa"
                                    value={item.oa || ""}
                                    onChange={(e) => updateFormField("oa", e.target.value)}
                                    placeholder="输入记录-附图附页"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="ml" className="select-text">
                        目录显示标题
                    </Label>
                    <Input
                        id="ml"
                        value={item.ml || ""}
                        onChange={(e) => updateFormField("ml", e.target.value)}
                        placeholder="输入在报告目录中的显示"
                    />
                </div>

                <div className="grid grid-cols-2 @5xl:grid-cols-4 gap-1">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="do"
                            checked={item.do || false}
                            onCheckedChange={(checked) => updateFormField("do", checked)}
                            className="h-[25px] w-[42px] [&>span]:h-[21px] [&>span]:w-[21px] [&>span]:data-[state=checked]:translate-x-[17px]"
                        />
                        <Label htmlFor="do" className="text-sm select-text">
                            有做该项目
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="na"
                            checked={item.na || false}
                            onCheckedChange={(checked) => updateFormField("na", checked)}
                            className="h-[25px] w-[42px] [&>span]:h-[21px] [&>span]:w-[21px] [&>span]:data-[state=checked]:translate-x-[17px]"
                        />
                        <Label htmlFor="na" className="text-sm select-text">
                            不在目录中显示
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
                {item.do && <CollapsibleMarkTabs rep={rep} inline />}
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
    const [render] = useFrameEditorBar({
        rep,
        transformValues: () => ({ Projects: projects }),
        onReset,
        onVerify,
    });
    const clearProjectCatalog = React.useCallback(() => {
        setProjects(defaultProj)
    }, [])
    //原来设置 className="h-md:@md:max-w-[98%] m-auto"
    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            目录或附页表的编辑器
                            <Badge variant="secondary">共 {projects.length} 项</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <div className="space-y-0.5">
                            {projects.map((project, index) => (
                                <div key={index}>
                                    {/* 项目展示行，使用grird做表格的模式，局限性很大的，不通用适应性差 */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-between py-1 @md:px-3 rounded-lg border transition-colors",
                                            editingIndex === index ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                        )}
                                    >
                                        <div className="flex-1 grid grid-cols-2 @md:grid-cols-4 @5xl:grid-cols-7 gap-2 items-center">
                                            <div className="col-span-2 font-medium text-sm">
                                                <span className="text-gray-600 mr-2 text-sm">#{index + 1}</span>
                                                {project.name}
                                            </div>
                                            <div className="col-span-2 text-sm text-black min-w-0">
                                                {project.ml && (
                                                    <SmartTruncatedText
                                                        text={project.ml}
                                                        uniqueKey={`project-${index}-ml`}
                                                        containerClassName="w-full"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {project.do && (
                                                    <Badge variant="default" className="text-xs px-1 py-0">
                                                        有做
                                                    </Badge>
                                                )}
                                                {project.na && (
                                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                                        不在目录
                                                    </Badge>
                                                )}
                                                {project.om && (
                                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                                        仅记录
                                                    </Badge>
                                                )}
                                                {project.zs && (
                                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                                        证书
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="col-span-2 flex-1 grid grid-cols-4 gap-2 items-center">
                                                <div className="text-xs font-medium border-transparent bg-white text-gray-900">
                                                    {project.page && `页: ${project.page}`}
                                                </div>

                                                {!nApx && (
                                                    <div className="text-xs font-medium border-transparent bg-gray-50 text-secondary-foreground">
                                                        {project.apx && `附图: ${project.apx}`}
                                                    </div>
                                                )}

                                                {!nRec && (
                                                    <>
                                                        <div className="text-xs font-medium border-transparent bg-white text-gray-900">
                                                            {project.op && `记录页: ${project.op}`}
                                                        </div>
                                                        <div className="text-xs font-medium border-transparent bg-gray-50 text-secondary-foreground">
                                                            {project.oa && `记录附图: ${project.oa}`}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-0 ml-0 flex-col gap-4 @md:gap-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(index)}
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
                                    <Button size="sm" onClick={startAdd} className="w-full max-w-32">
                                        <Plus className="w-4 h-4 mr-2" />
                                        新增目录项
                                    </Button>
                                ) : (
                                    renderEditForm(editForm, true)
                                )}
                            </div>
                        </div>
                        <CollapsibleMarkTabs rep={rep} />
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <strong>字段说明：</strong>
                            </p>
                            <ul className="@md:columns-2 list-disc list-inside space-y-1 ml-4">
                                <li>
                                    <strong>显示名称：</strong>附录显示名称
                                </li>
                                <li>
                                    <strong>目录显示题目：</strong>该分项在报告目录中的文本显示题目
                                </li>
                                <li>
                                    <strong>有做吗：</strong>默认包含的分项报告
                                </li>
                                <li>
                                    <strong>不在附页：</strong>不在结论报告附页中出现，但出现在目录中
                                </li>
                                <li>
                                    <strong>仅记录目录：</strong>仅出现在原始记录目录中
                                </li>
                                <li>
                                    <strong>证书类型：</strong>证书类型的项目
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
/*书签复用部分
 * */
function CollapsibleMarkTabs({ rep, inline }: { rep: any; inline?: boolean }) {
    const [isOpen, setIsOpen] = React.useState(false)
    // 用于跟踪两个 PdfOutlineAnalyzer 组件的加载状态
    const [reportLoading, setReportLoading] = React.useState(false)
    const [recordLoading, setRecordLoading] = React.useState(false)

    // 计算是否有任何组件正在加载
    const isAnyLoading = reportLoading || recordLoading

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn("flex w-full flex-col gap-0", inline ? "@md:relative @md:-top-8 pointer-events-none" : "")}
        >
            <div className={cn("flex gap-4 px-4", inline ? "" : "mx-auto items-center")}>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="font-semibold pointer-events-auto" aria-label="展开切换">
                        <span>打印在第几页</span>
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-0">
                <div className="w-full max-w-[35rem] mx-auto @md:px-6 py-0 space-y-0">
                    <Tabs defaultValue="generate" className="w-full pointer-events-auto">
                        <TabsList className={cn("grid w-full grid-cols-2", isAnyLoading && "pointer-events-none opacity-50")}>
                            <TabsTrigger
                                value="generate"
                                disabled={isAnyLoading}
                                className={cn(isAnyLoading && "cursor-not-allowed")}
                            >
                                报告的书签
                                {reportLoading && <span className="ml-1 text-xs">(处理中...)</span>}
                            </TabsTrigger>
                            <TabsTrigger value="analyze" disabled={isAnyLoading} className={cn(isAnyLoading && "cursor-not-allowed")}>
                                原始记录的书签
                                {recordLoading && <span className="ml-1 text-xs">(处理中...)</span>}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="generate" className="space-y-0">
                            <PdfOutlineAnalyzer inline={inline} rep={rep} slug="R" onLoadingChange={setReportLoading} />
                        </TabsContent>
                        <TabsContent value="analyze" className="space-y-0">
                            <PdfOutlineAnalyzer inline={inline} rep={rep} slug="O" onLoadingChange={setRecordLoading} />
                        </TabsContent>
                    </Tabs>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
