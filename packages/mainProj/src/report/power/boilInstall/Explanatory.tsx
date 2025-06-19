"use client"
import * as React from "react";
import {InternalItemProps, RepLink, } from "../../common/base";
import {FootMensLine} from "@/report/common/view";
import {
    CCell,
    FlexibleTable,
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableRow
} from "@/components/flexible-table";
import {CollapsibleFormSection} from "@/components/chub";
import {Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle,Label,Textarea} from "@/components/ui";
import {cn} from "@/lib/utils";
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { useStorage } from "@/report/StorageContext"
import { SmartTruncatedText } from "@/components/smart-truncated-text"
import { Edit, Trash2, Plus, X, ChevronDown } from "lucide-react"
import {useSearchParams} from "next/navigation";
import {JumpTab} from "@/report/common/JumpTab";
import {PrintReserveLeast} from "@/components/print-reserve-least";


interface ExplanatoryProps {
    rep?: any
    children?: React.ReactNode
    show?: boolean
    alone?: boolean
    redId?: string
    nestMd?: string
    refWidth?: string
    desc?: string
    label?: string
    stname?: string
}

export const Explanatory = React.forwardRef<HTMLDivElement, ExplanatoryProps>(
    (
        {
            rep,
            children,
            show = true,
            alone = true,
            redId,
            nestMd,
            refWidth,
            desc = "说明叙述",
            label = "长文本编辑器",
            stname = "长文字页",
        },
        ref,
    ) => {
        const searchParams = useSearchParams()
        const jumpProjIdx = searchParams?.get("from")
        const { storage } = useStorage()

        const [projects, setProjects] = React.useState<string[]>(storage?.[stname] ?? [])
        const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
        const [isAddingNew, setIsAddingNew] = React.useState(false)
        const [isInserting, setIsInserting] = React.useState(false)
        const [insertPosition, setInsertPosition] = React.useState<number | null>(null)
        const [editForm, setEditForm] = React.useState<string>("")
        const [editErr, setEditErr] = React.useState<string>()

        // 开始编辑
        const startEdit = (index: number) => {
            setEditingIndex(index)
            setEditForm(projects[index])
            setIsAddingNew(false)
            setIsInserting(false)
            setInsertPosition(null)
        }

        React.useEffect(() => {
            jumpProjIdx && startEdit(Number(jumpProjIdx))
        }, [jumpProjIdx])

        // 开始新增
        const startAdd = () => {
            setIsAddingNew(true)
            setEditingIndex(null)
            setIsInserting(false)
            setInsertPosition(null)
            setEditForm("")
        }

        // 开始插入
        const startInsert = (position: number) => {
            setIsInserting(true)
            setInsertPosition(position)
            setEditingIndex(null)
            setIsAddingNew(false)
            setEditForm("")
        }

        // 保存编辑
        const saveEdit = () => {
            if (editingIndex !== null) {
                if (editForm === "") {
                    setEditErr("内容是必填的")
                    return
                }
                const newProjects = [...projects]
                newProjects[editingIndex] = editForm
                setProjects(newProjects)
                setEditingIndex(null)
                setEditErr("")
            }
        }

        // 保存新增
        const saveAdd = () => {
            if (editForm === "") {
                setEditErr("内容是必填的")
                return
            }
            setProjects([...projects, editForm])
            setIsAddingNew(false)
            setEditErr("")
        }

        // 保存插入
        const saveInsert = () => {
            if (editForm === "") {
                setEditErr("内容是必填的")
                return
            }
            if (insertPosition !== null) {
                const newProjects = [...projects]
                newProjects.splice(insertPosition, 0, editForm)
                setProjects(newProjects)
                setIsInserting(false)
                setInsertPosition(null)
                setEditErr("")
            }
        }

        // 取消编辑
        const cancelEdit = () => {
            setEditingIndex(null)
            setIsAddingNew(false)
            setIsInserting(false)
            setInsertPosition(null)
            setEditErr("")
        }

        // 删除项目
        const deleteProject = (index: number) => {
            const newProjects = projects.filter((_, i) => i !== index)
            setProjects(newProjects)
        }

        // 更新表单字段
        const updateFormField = (value: string) => {
            setEditForm(value)
        }

        // 渲染编辑表单
        const renderEditForm = (item: string, type: "edit" | "add" | "insert" = "edit") => (
            <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                {(type === "add" || type === "insert") && (
                    <CardHeader className="pb-0">
                        <CardTitle>{type === "add" ? "长文本的加个分段" : `在第 ${insertPosition! + 1} 项前插入内容`}</CardTitle>
                    </CardHeader>
                )}
                <CardContent className="space-y-1 px-2">
                    <div className="grid grid-cols-1 gap-1">
                        <div className="space-y-2">
                            <Label htmlFor="page" className="select-text">
                                一部分文字
                            </Label>
                            <Textarea
                                rows={20}
                                id="page"
                                value={item || ""}
                                onChange={(e) => updateFormField(e.target.value)}
                                placeholder="输入更多文字"
                            />
                            {editErr && <p className="text-sm text-red-600">{editErr}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            取消
                        </Button>
                        <Button onClick={type === "add" ? saveAdd : type === "insert" ? saveInsert : saveEdit}>
                            {type === "add" ? "确认新增" : type === "insert" ? "确认插入" : "确认修改"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )

        // 渲染插入按钮
        const renderInsertButton = (position: number) => (
            <div className="flex justify-center py-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startInsert(position)}
                    disabled={editingIndex !== null || isAddingNew || isInserting}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    在此处插入
                </Button>
            </div>
        )

        const onReset = () => {
            setProjects(storage?.[stname] ?? [])
        }

        const [render] = useFrameEditorBar({ rep, values: { [stname]: projects }, onReset })

        const isAnyEditing = editingIndex !== null || isAddingNew || isInserting

        return (
            <CollapsibleFormSection title={label!} defaultOpen={show}>
                <div className="w-full m-auto">
                    <Card className="py-1 gap-2">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                长文本的编辑器
                                <Badge variant="secondary">共 {projects.length} 个部分</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-1">
                            <div className="space-y-0.5">
                                {/* 在第一项前显示插入按钮 */}
                                {projects.length > 0 && !isAnyEditing && renderInsertButton(0)}

                                {projects.map((project, index) => (
                                    <div key={index}>
                                        {/* 项目展示行 */}
                                        <div
                                            className={cn(
                                                "flex items-center justify-between py-1 @md:px-3 rounded-lg border transition-colors",
                                                editingIndex === index ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                                            )}
                                        >
                                            <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                                                <div className="col-span-2 text-sm text-black min-w-0">
                                                    {project && (
                                                        <SmartTruncatedText
                                                            maxLines={3}
                                                            text={project}
                                                            uniqueKey={`project-${index}-ml`}
                                                            containerClassName="w-full"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-0 ml-0 flex-col gap-4 @md:gap-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => startEdit(index)}
                                                    disabled={isAnyEditing}
                                                    className="@md:size-9 px-1 has-[>svg]:px-1"
                                                    aria-label="修改"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteProject(index)}
                                                    disabled={isAnyEditing}
                                                    className="@md:size-9 px-1 has-[>svg]:px-1 text-red-600 hover:text-red-700"
                                                    aria-label="删除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* 编辑表单 */}
                                        {editingIndex === index && renderEditForm(editForm, "edit")}

                                        {/* 插入表单 */}
                                        {isInserting && insertPosition === index && renderEditForm(editForm, "insert")}

                                        {/* 在每项后显示插入按钮 */}
                                        {!isAnyEditing && (index<projects.length-1) && renderInsertButton(index + 1)}
                                    </div>
                                ))}

                                {/* 新增按钮和表单 */}
                                <div className="pt-4 border-t">
                                    {!isAddingNew ? (
                                        <Button size="sm" onClick={startAdd} disabled={isAnyEditing} className="w-full max-w-32">
                                            <Plus className="w-4 h-4 mr-2" />
                                            新增一部分
                                        </Button>
                                    ) : (
                                        renderEditForm(editForm, "add")
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                    </Card>
                    {children}
                </div>
            </CollapsibleFormSection>
        )
    },
)



export interface ExplanatoryVwProps{
    orc: any;
    rep: any;
    title: string;
    desc?: string;
    hash?: string;
    stname?: string;
}
/**最简单的办法 :空白 文字
 * FootMenRowIspCheck 要求2列表格；
 *框架引进的useMediaPrint(true,true)只能确保hx+div 不会被断开打印纸张页的，但是这里是三个元素 h2+div+table没法子确保的？
 * */
export const ExplanatoryVw= ({ orc, rep, title,desc,hash,stname='长文字页'}: ExplanatoryVwProps
) => {
    return (<>
        <PrintReserveLeast reserve="6rem"
               title={<>
                      <h2 id={hash ?? "Explanatory"} className="text-2xl text-center mt-4">{title}</h2>
                      <div className="flex justify-between">
                           <span className="text-sm">工程名称：{orc?.工程名称}</span>
                           <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                      </div>
                   </>}>
            <FlexibleTable columnWidths={["62%", "%"]} className="text-sm">
                {desc && <TableHeader>
                    <TableRow><TableCell colSpan={2}>{desc}:</TableCell></TableRow>
                </TableHeader>}
                <TableBody>
                    <RepLink ori rep={rep} tag={hash ?? 'Explanatory'}>
                        <TableRow>
                            <TableCell colSpan={2} className="border border-gray-700">
                                <div className="text-sm min-h-8 whitespace-pre-wrap">
                                    {orc?.[stname]?.length>0 ? <>
                                            {orc?.[stname]?.map((part: any, i: number) => {
                                                return part && (
                                                    <JumpTab key={i} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Explanatory?from=${i}#Explanatory`}>
                                                        <div className="block">
                                                            {part}
                                                        </div>
                                                    </JumpTab>
                                                );
                                            })
                                            }
                                        </>
                                        : '／'}
                                </div>
                            </TableCell>
                        </TableRow>
                    </RepLink>
                </TableBody>
            </FlexibleTable>
            <FootMensLine cap='监检' href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}/>
        </PrintReserveLeast>
    </>)
};
