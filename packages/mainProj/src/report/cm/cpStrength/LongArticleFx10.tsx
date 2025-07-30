"use client"
import * as React from "react"
import { CollapsibleFormSection } from "@/components/chub"
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useFormFramework } from "@/report/hook/useFormFramework"
import { useStorage } from "@/report/StorageContext"
import { SmartTruncatedText } from "@/components/smart-truncated-text"
import { Plus, X } from "lucide-react" // 导入 Printer 图标
import { useSearchParams } from "next/navigation"
import { JumpTab } from "@/report/common/JumpTab"
import { z } from "zod"

// 定义新的文本块Schema
const textBlockSchema = z.object({
    t: z.string().min(1, "内容是必填的"), // 文本内容
    a: z.boolean().default(false), // 避免分页 (avoid page break)
})

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

const renderActionButtons = (index: number) => {
    // Implementation of renderActionButtons
    return <div>{/* Action buttons for editing, deleting, moving */}</div>
}

const renderMoveTarget = (index: number, label: string) => {
    // Implementation of renderMoveTarget
    return <div>{/* Move target button */}</div>
}

const renderEditForm = (index: number, mode: string) => {
    // Implementation of renderEditForm
    return <div>{/* Edit form for adding, editing, or inserting */}</div>
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

    // Get initial data from storage, mapping old string format to new object format
    const getInitialData = React.useCallback(() => {
        const storedData =
            subrid || (modType && redId !== undefined)
                ? (storage?.[`_${modType}_${redId}`]?.[stname] ?? [])
                : (storage?.[stname] ?? [])

        // 兼容旧数据格式：如果存储的是字符串数组，转换为对象数组
        return storedData.map((item: any) => {
            if (typeof item === "string") {
                return { t: item, a: false }
            }
            return item // 已经是新格式
        })
    }, [storage, subrid, modType, redId, stname])

    const explanatorySchema = z.object({
        [stname]: z.array(textBlockSchema).default([]),
    })

    const [initialValues, setInitialValues] = React.useState(() => ({
        [stname]: getInitialData(),
    }))

    React.useEffect(() => {
        const newData = getInitialData()
        setInitialValues({
            [stname]: newData,
        })
    }, [getInitialData, stname])

    const arrayFields = [{ name: stname, itemTemplate: { t: "", a: false } }]

    const { render, handleConfirm, form, arrayControls } = useFormFramework({
        schema: explanatorySchema,
        defaultValues: initialValues,
        arrayFields,
        rep,
        subrid,
        redId,
        modType: modType,
    })

    React.useEffect(() => {
        const currentValues = form.getValues(stname)
        const newValues = initialValues[stname]

        if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
            form.setValue(stname, newValues)
        }
    }, [initialValues, form, stname])

    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [isInserting, setIsInserting] = React.useState(false)
    const [insertPosition, setInsertPosition] = React.useState<number | null>(null)
    const [originalDataBeforeInsert, setOriginalDataBeforeInsert] = React.useState<(typeof textBlockSchema._type)[]>([])

    const projects = form.watch(stname) || []
    const { fields, append, remove, insert, update, replace } = arrayControls[stname]

    React.useEffect(() => {
        if (jumpProjIdx) {
            startEdit(null, Number(jumpProjIdx))
        }
    }, [jumpProjIdx])

    const startEdit = (e, index: number) => {
        e?.preventDefault()
        setEditingIndex(index)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
    }

    const startAdd = () => {
        setIsAddingNew(true)
        setEditingIndex(null)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
        append({ t: "", a: false })
    }

    const startInsert = (position: number) => {
        setOriginalDataBeforeInsert([...projects])
        setIsInserting(true)
        setInsertPosition(position)
        setEditingIndex(null)
        setIsAddingNew(false)
        insert(position, { t: "", a: false })
    }

    const saveEdit = () => {
        const errors = form.formState.errors?.[stname]
        if (editingIndex !== null && !errors?.[editingIndex]) {
            setEditingIndex(null)
            handleConfirm()
        }
    }

    const saveAdd = () => {
        const errors = form.formState.errors?.[stname]
        const lastIndex = projects.length - 1
        if (!errors?.[lastIndex]) {
            setIsAddingNew(false)
            handleConfirm()
        }
    }

    const saveInsert = () => {
        const errors = form.formState.errors?.[stname]
        if (insertPosition !== null && !errors?.[insertPosition]) {
            setIsInserting(false)
            setInsertPosition(null)
            setOriginalDataBeforeInsert([])
            handleConfirm()
        }
    }

    const cancelEdit = () => {
        if (editingIndex !== null && !isInserting && !isAddingNew) {
            const nowVal = projects[editingIndex]
            const originalItem = getInitialData()[editingIndex] || { t: "", a: false }
            if (nowVal.t === "") {
                const currentProjects = [...projects]
                currentProjects[editingIndex] = originalItem
                replace(currentProjects)
                setEditingIndex(null)
                return
            }
            update(editingIndex, originalItem)
            setEditingIndex(null)
        } else if (isAddingNew) {
            remove(projects.length - 1)
            setIsAddingNew(false)
        } else if (isInserting && insertPosition !== null) {
            replace(originalDataBeforeInsert)
            setIsInserting(false)
            setInsertPosition(null)
            setOriginalDataBeforeInsert([])
        }
    }

    const deleteProject = (e, index: number) => {
        e?.preventDefault()
        remove(index)
        handleConfirm()
    }

    const [selectedForMove, setSelectedForMove] = React.useState<number | null>(null)
    const [showMoveTargets, setShowMoveTargets] = React.useState(false)

    const startMove = (e, index: number) => {
        e?.preventDefault()
        setSelectedForMove(index)
        setShowMoveTargets(true)
    }

    const cancelMove = (e) => {
        e?.preventDefault()
        setSelectedForMove(null)
        setShowMoveTargets(false)
    }

    const moveToPosition = (targetIndex: number) => {
        if (selectedForMove === null) return

        const currentProjects = [...projects]
        const [movedItem] = currentProjects.splice(selectedForMove, 1)

        const adjustedTargetIndex = targetIndex > selectedForMove ? targetIndex - 1 : targetIndex
        currentProjects.splice(adjustedTargetIndex, 0, movedItem)

        replace(currentProjects)
        handleConfirm()
        cancelMove(null) // Pass null to avoid event object
    }

    const content = (
        <>
            <div className="space-y-0.5">
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
                                    {projects[index]?.t && ( // 访问 t 字段
                                        <SmartTruncatedText
                                            maxLines={3}
                                            text={projects[index].t} // 访问 t 字段
                                            uniqueKey={`project-${index}-ml`}
                                            containerClassName="w-full"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* 统一的操作按钮区域 */}
                            {!showMoveTargets && renderActionButtons(index)}
                            {showMoveTargets && selectedForMove === index && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelMove}
                                    className="@md:size-9 px-1 has-[>svg]:px-1 text-gray-600"
                                    aria-label="取消移动"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* 移动目标位置 */}
                        {showMoveTargets && selectedForMove !== null && (
                            <>
                                {/* 在当前项后显示移动目标（排除选中项本身和其相邻位置） */}
                                {selectedForMove !== index &&
                                    selectedForMove !== index + 1 &&
                                    renderMoveTarget(index + 1, `移动到第 ${index + 2} 位`)}
                            </>
                        )}

                        {/* 编辑表单 - 只在普通编辑模式下显示 */}
                        {editingIndex === index && !isInserting && renderEditForm(index, "edit")}

                        {/* 插入表单 - 只在插入模式下显示 */}
                        {isInserting && insertPosition === index && renderEditForm(index, "insert")}
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
                            // 兼容旧数据格式：如果存储的是字符串，直接使用；否则访问 t 字段
                            const textContent = typeof part === "string" ? part : part?.t
                            const avoidPageBreak = typeof part === "object" && part !== null ? part.a : false

                            return (
                                textContent && (
                                    <JumpTab
                                        key={i}
                                        href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/LongArticleFx?original=1${apds}${apdr}&from=${i}#LongArticleFx_${i}`}
                                    >
                                        <div className={cn("block", avoidPageBreak && "break-inside-avoid-page")}>{textContent}</div>
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
