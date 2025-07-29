"use client"
import * as React from "react"
import { CollapsibleFormSection } from "@/components/chub"
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Textarea,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui"
import { cn } from "@/lib/utils"
import { useFormFramework } from "@/report/hook/useFormFramework"
import { useStorage } from "@/report/StorageContext"
import { SmartTruncatedText } from "@/components/smart-truncated-text"
import { Edit, Trash2, Plus, X, ChevronDown, Move, Target } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { JumpTab } from "@/report/common/JumpTab"
import { z } from "zod"

interface LongArticleFxProps {
    rep?: any
    children?: React.ReactNode
    show?: boolean
    redId?: number
    modType?: string
    subrid?: string
    nestMd?: string
    label?: string
    stname?: string
    //长文本行的不换行显示。
    wsPre?: boolean
}

export const LongArticleFx = ({
                                  rep,
                                  children,
                                  show = false,
                                  label = "长文本编辑器",
                                  stname = "长文",
                                  redId,
                                  modType,
                                  subrid,
                                  wsPre,
                              }: LongArticleFxProps) => {
    const searchParams = useSearchParams()
    const jumpProjIdx = searchParams?.get("from")
    const { storage } = useStorage()

    // Get initial data from storage
    const getInitialData = React.useCallback(() => {
        if (subrid || (modType && redId !== undefined)) {
            return storage?.[`_${modType}_${redId}`]?.[stname] ?? []
        }
        return storage?.[stname] ?? []
    }, [storage, subrid, modType, redId, stname])

    const explanatorySchema = z.object({
        [stname]: z.array(z.string().min(1, "内容是必填的")).default([]),
    })

    // Use state to track initial values and update when storage changes
    const [initialValues, setInitialValues] = React.useState(() => ({
        [stname]: getInitialData(),
    }))

    // Update initial values when storage changes
    React.useEffect(() => {
        const newData = getInitialData()
        setInitialValues({
            [stname]: newData,
        })
    }, [getInitialData, stname])

    const arrayFields = [{ name: stname, itemTemplate: "" }]

    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema: explanatorySchema,
        defaultValues: initialValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })

    // Update form values when initialValues change
    React.useEffect(() => {
        const currentValues = form.getValues(stname)
        const newValues = initialValues[stname]

        // Only update if the values are actually different
        if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
            form.setValue(stname, newValues)
        }
    }, [initialValues, form, stname])

    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [isInserting, setIsInserting] = React.useState(false)
    const [insertPosition, setInsertPosition] = React.useState<number | null>(null)
    // 保存插入前的原始数据，用于取消时恢复
    const [originalDataBeforeInsert, setOriginalDataBeforeInsert] = React.useState<string[]>([])

    // 拖拽重排序相关状态
    const [selectedForMove, setSelectedForMove] = React.useState<number | null>(null)
    const [showMoveTargets, setShowMoveTargets] = React.useState(false)

    const projects = form.watch(stname) || []
    const { fields, append, remove, insert, update, replace } = arrayControls[stname]

    React.useEffect(() => {
        if (jumpProjIdx) {
            startEdit(null, Number(jumpProjIdx))
        }
    }, [jumpProjIdx])

    // 开始编辑
    const startEdit = (e, index: number) => {
        e?.preventDefault()
        setEditingIndex(index)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
    }

    // 开始新增
    const startAdd = () => {
        setIsAddingNew(true)
        setEditingIndex(null)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
        append("")
    }

    // 开始插入
    const startInsert = (position: number) => {
        // 保存插入前的原始数据
        setOriginalDataBeforeInsert([...projects])

        setIsInserting(true)
        setInsertPosition(position)
        setEditingIndex(null)
        setIsAddingNew(false)
        insert(position, "")
    }

    // 保存编辑
    const saveEdit = () => {
        const errors = form.formState.errors?.[stname]
        if (editingIndex !== null && !errors?.[editingIndex]) {
            setEditingIndex(null)
            handleConfirm()
        }
    }

    // 保存新增
    const saveAdd = () => {
        const errors = form.formState.errors?.[stname]
        const lastIndex = projects.length - 1
        if (!errors?.[lastIndex]) {
            setIsAddingNew(false)
            handleConfirm()
        }
    }

    // 保存插入
    const saveInsert = () => {
        const errors = form.formState.errors?.[stname]
        if (insertPosition !== null && !errors?.[insertPosition]) {
            setIsInserting(false)
            setInsertPosition(null)
            setOriginalDataBeforeInsert([])
            handleConfirm()
        }
    }

    // 取消编辑 react-hook-form在对付非表格的数组是空值情况的意外删除下一条
    const cancelEdit = () => {
        if (editingIndex !== null && !isInserting && !isAddingNew) {
            const nowVal=projects[editingIndex]
            const originalValue = getInitialData()[editingIndex] || ""
            if(nowVal===""){        //特殊情况的处理，否则会直接删除下一条
                let currentProjects = [...projects];
                currentProjects[editingIndex]=originalValue;
                replace(currentProjects)
                setEditingIndex(null)
                return
            }
            // 普通编辑模式：恢复原值
            update(editingIndex, originalValue)
            setEditingIndex(null)
        } else if (isAddingNew) {
            // 新增模式：删除新增的空项
            remove(projects.length - 1)
            setIsAddingNew(false)
        } else if (isInserting && insertPosition !== null) {
            // 插入模式：恢复到插入前的状态
            replace(originalDataBeforeInsert)
            setIsInserting(false)
            setInsertPosition(null)
            setOriginalDataBeforeInsert([])
        }
    }

    // 删除项目
    const deleteProject = (e,index: number) => {
        e?.preventDefault()
        remove(index)
        handleConfirm()
    }

    // 开始移动操作
    const startMove = (e,index: number) => {
        e?.preventDefault()
        setSelectedForMove(index)
        setShowMoveTargets(true)
    }

    // 取消移动操作
    const cancelMove = (e) => {
        e?.preventDefault()
        setSelectedForMove(null)
        setShowMoveTargets(false)
    }

    // 移动到指定位置
    const moveToPosition = (targetIndex: number) => {
        if (selectedForMove === null) return

        const currentProjects = [...projects]
        const [movedItem] = currentProjects.splice(selectedForMove, 1)

        // 如果目标位置在被移动项之后，需要调整索引
        const adjustedTargetIndex = targetIndex > selectedForMove ? targetIndex - 1 : targetIndex
        currentProjects.splice(adjustedTargetIndex, 0, movedItem)

        replace(currentProjects)
        handleConfirm()
        cancelMove()
    }

    // 渲染编辑表单
    const renderEditForm = (index: number, type: "edit" | "add" | "insert" = "edit") => (
        <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
            {(type === "add" || type === "insert") && (
                <CardHeader className="pb-0">
                    <CardTitle>{type === "add" ? "长文本的加个分段" : `在第 ${insertPosition! + 1} 项前插入内容`}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="space-y-1 px-2">
                <div className="grid grid-cols-1 gap-1">
                    <FormField
                        control={form.control}
                        name={`${stname}.${index}`}
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel htmlFor={`LongArticleFx_${index}`} className="select-text">
                                    一部分文字
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={20}
                                        id={`LongArticleFx_${index}`}
                                        className={cn(wsPre ? "whitespace-pre" : "")}
                                        placeholder="输入更多文字"
                                        autoFocus
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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

    // 渲染插入按钮，等4个按钮
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
            {!showMoveTargets ? (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => startEdit(e,position)}
                        disabled={isAnyEditing}
                        className="@md:size-9 px-1 has-[>svg]:px-1"
                        aria-label="修改"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => startMove(e,position)}
                        disabled={isAnyEditing}
                        className="@md:size-9 px-1 has-[>svg]:px-1 text-blue-600 hover:text-blue-700"
                        aria-label="移动"
                    >
                        <Move className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteProject(e,position)}
                        disabled={isAnyEditing}
                        className="@md:size-9 px-1 has-[>svg]:px-1 text-red-600 hover:text-red-700"
                        aria-label="删除"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </>
            ) : selectedForMove === position ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelMove}
                    className="@md:size-9 px-1 has-[>svg]:px-1 text-gray-600"
                    aria-label="取消移动"
                >
                    <X className="w-4 h-4" />
                </Button>
            ) : null}
        </div>
    )

    // 渲染移动目标按钮
    const renderMoveTarget = (position: number, label: string) => (
        <div className="flex justify-center py-1">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => moveToPosition(position)}
                className="h-8 px-3 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            >
                <Target className="w-3 h-3 mr-1" />
                {label}
            </Button>
        </div>
    )

    const isAnyEditing = editingIndex !== null || isAddingNew || isInserting || showMoveTargets

    const content = (
        <>
            <div className="space-y-0.5">
                {/* 在第一项前显示插入按钮 */}
                {projects.length > 0 && !isAnyEditing && renderInsertButton(0)}

                {fields.map((field, index) => (
                    <div key={field.id}>
                        {/* 项目展示行 */}
                        <div
                            className={cn(
                                "flex items-center justify-between py-1 @md:px-3 rounded-lg border transition-colors",
                                editingIndex === index && !isInserting
                                    ? "bg-blue-50 border-blue-200"
                                    : selectedForMove === index
                                        ? "bg-yellow-50 border-yellow-300 shadow-md"
                                        : "hover:bg-gray-50",
                            )}
                        >
                            <div className="flex-1 grid grid-cols-2 gap-2 items-center">
                                <div className="col-span-2 text-sm text-black min-w-0">
                                    {selectedForMove === index && (
                                        <div className="text-xs text-yellow-700 mb-1 font-medium">已选中 - 请选择目标位置</div>
                                    )}
                                    {projects[index] && (
                                        <SmartTruncatedText
                                            maxLines={3}
                                            text={projects[index]}
                                            uniqueKey={`project-${index}-ml`}
                                            containerClassName="w-full"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-0 ml-0 flex-col gap-4 @md:gap-0">
                                {!showMoveTargets ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => startEdit(e,index)}
                                            disabled={isAnyEditing}
                                            className="@md:size-9 px-1 has-[>svg]:px-1"
                                            aria-label="修改"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => startMove(e,index)}
                                            disabled={isAnyEditing}
                                            className="@md:size-9 px-1 has-[>svg]:px-1 text-blue-600 hover:text-blue-700"
                                            aria-label="移动"
                                        >
                                            <Move className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => deleteProject(e,index)}
                                            disabled={isAnyEditing}
                                            className="@md:size-9 px-1 has-[>svg]:px-1 text-red-600 hover:text-red-700"
                                            aria-label="删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : selectedForMove === index ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelMove}
                                        className="@md:size-9 px-1 has-[>svg]:px-1 text-gray-600"
                                        aria-label="取消移动"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>

                        {/* 移动目标位置 */}
                        {showMoveTargets && selectedForMove !== null && (
                            <>
                                {/* 在第一项前显示移动目标 */}
                                {index === 0 && renderMoveTarget(0, "移动到最前面")}

                                {/* 在当前项后显示移动目标（排除选中项本身和其相邻位置） */}
                                {selectedForMove !== index &&
                                    selectedForMove !== index + 1 &&
                                    renderMoveTarget(index + 1, `移动到第 ${index + 2} 位`)}

                                {/* 在最后一项后显示移动目标 */}
                                {index === projects.length - 1 &&
                                    selectedForMove !== index &&
                                    renderMoveTarget(projects.length, "移动到最后面")}
                            </>
                        )}

                        {/* 编辑表单 - 只在普通编辑模式下显示 */}
                        {editingIndex === index && !isInserting && renderEditForm(index, "edit")}

                        {/* 插入表单 - 只在插入模式下显示 */}
                        {isInserting && insertPosition === index && renderEditForm(index, "insert")}

                        {/* 在每项后显示插入按钮 */}
                        {!isAnyEditing && index < projects.length - 1 && renderInsertButton(index + 1)}
                    </div>
                ))}

                {/* 移动操作控制 */}
                {showMoveTargets && (
                    <div className="pt-2 pb-2 border-t border-b bg-yellow-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-yellow-700">正在移动第 {(selectedForMove ?? 0) + 1} 项，请选择目标位置</div>
                            <Button variant="outline" size="sm" onClick={cancelMove} className="text-gray-600 bg-transparent">
                                <X className="w-4 h-4 mr-1" />
                                取消移动
                            </Button>
                        </div>
                    </div>
                )}

                {/* 新增按钮和表单 */}
                <div className="pt-4 border-t">
                    {!isAddingNew ? (
                        <Button size="sm" onClick={startAdd} className="w-full max-w-32">
                            <Plus className="w-4 h-4 mr-2" />
                            新增一部分
                        </Button>
                    ) : (
                        renderEditForm(projects.length - 1, "add")
                    )}
                </div>
            </div>
        </>
    )

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
                    <CardContent className="p-0 space-y-1">{render(content)}</CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{children}</CardFooter>
                </Card>
            </div>
        </CollapsibleFormSection>
    )
}

interface LongArticleContentProps {
    orc: any
    rep: any
    hash?: string
    stname?: string
    //分项报告id
    subrid?: string
    //分项报告里面的可重复分项的编号。
    redId?: number
    //长文本行的不换行显示。
    wsPre?: boolean
    className?: string
    printMode?: boolean
}

/**跳编辑器，分页，
 *框架引进的useMediaPrint(true,true)只能确保hx+div 不会被断开打印纸张页的，但是这里是三个元素 h2+div+table没法子确保的？
 *因为长文本 string 改成数组类型 string[]的。可能报错 _orc_stname1.map is not a function；
 * */
export const LongArticleContent = ({
                                       orc,
                                       rep,
                                       hash,
                                       stname = "长文",
                                       subrid,
                                       redId,
                                       wsPre,
                                       printMode,
                                       className,
                                   }: LongArticleContentProps) => {
    const apds = `${subrid ? "&subrid=" + subrid : ""}`
    const apdr = `${redId !== undefined ? "&redId=" + redId : ""}`
    return (
        <>
            <div
                className={cn(
                    "text-sm min-h-8",
                    wsPre && !printMode ? "whitespace-pre overflow-x-auto" : "whitespace-pre-wrap",
                    className,
                )}
            >
                {orc?.[stname]?.length > 0 ? (
                    <>
                        {orc?.[stname]?.map((part: any, i: number) => {
                            return (
                                part && (
                                    <JumpTab
                                        key={i}
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LongArticleFx?original=1${apds}${apdr}&from=${i}#LongArticleFx_${i}`}
                                    >
                                        <div className="block break-inside-avoid-page">{part}</div>
                                    </JumpTab>
                                )
                            )
                        })}
                    </>
                ) : (
                    "／"
                )}
                {!(orc?.[stname]?.length > 0) && (
                    <JumpTab
                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LongArticleFx?original=1${apds}${apdr}&from=0#LongArticleFx_0`}
                    >
                        <div className="text-lg ml-4 print:hidden">还没有内容，先编辑</div>
                    </JumpTab>
                )}
            </div>
        </>
    )
}
