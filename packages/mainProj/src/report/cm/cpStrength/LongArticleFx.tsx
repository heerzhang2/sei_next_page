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
import { Edit, Trash2, Plus, X, ChevronDown, Move, Target, Printer } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { JumpTab } from "@/report/common/JumpTab"
import { z } from "zod"
import { FormSwitch } from "@/components/shub"
import { useWindowSize } from "@/hooks/use-window-size"

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
    const { screenHeight } = useWindowSize()
    const searchParams = useSearchParams()
    const jumpProjIdx = searchParams?.get("from")
    const { storage } = useStorage()

    // 判断是否为小屏幕（横屏手机）
    const isTinyHeightScr = screenHeight < 500

    // Get initial data from storage - NO LONGER COMPATIBLE WITH OLD STRING FORMAT
    const getInitialData = React.useCallback(() => {
        if (subrid || (modType && redId !== undefined)) {
            return storage?.[`_${modType}_${redId}`]?.[stname] ?? []
        }
        return storage?.[stname] ?? []
    }, [storage, subrid, modType, redId, stname])

    // 定义新的文本块Schema
    const textBlockSchema = z.object({
        t: z.string().min(1, "内容是必填的"), // 文本内容
        a: z.boolean().optional(), // 避免分页
    })

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

    const [selectedForMove, setSelectedForMove] = React.useState<number | null>(null)
    const [showMoveTargets, setShowMoveTargets] = React.useState(false)

    // 用于控制是否需要自动聚焦的状态
    const [shouldAutoFocus, setShouldAutoFocus] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const projects = form.watch(stname) || []
    const { fields, append, remove, insert, update, replace } = arrayControls[stname]

    // 处理跳转到指定项的逻辑
    React.useEffect(() => {
        if (jumpProjIdx) {
            const targetIndex = Number(jumpProjIdx)
            startEdit(null, targetIndex)
            setShouldAutoFocus(true) // 标记需要自动聚焦
        }
    }, [jumpProjIdx])

    // 当编辑状态改变且需要自动聚焦时，聚焦到 textarea
    React.useEffect(() => {
        if (shouldAutoFocus && editingIndex !== null && textareaRef.current) {
            // 延迟聚焦，确保元素已经渲染
            const timer = setTimeout(() => {
                textareaRef.current?.focus()
                // 滚动到视图中
                textareaRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
                setShouldAutoFocus(false) // 重置标记
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [shouldAutoFocus, editingIndex])

    const startEdit = (e, index: number) => {
        e?.preventDefault()
        setEditingIndex(index)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
        setSelectedForMove(null)
        setShowMoveTargets(false)
    }

    const startAdd = () => {
        setIsAddingNew(true)
        setEditingIndex(null)
        setIsInserting(false)
        setInsertPosition(null)
        setOriginalDataBeforeInsert([])
        setSelectedForMove(null)
        setShowMoveTargets(false)
        append({ t: "" })
    }

    const startInsert = (position: number) => {
        setOriginalDataBeforeInsert([...projects])
        setIsInserting(true)
        setInsertPosition(position)
        setEditingIndex(null)
        setIsAddingNew(false)
        setSelectedForMove(null)
        setShowMoveTargets(false)
        insert(position, { t: "" })
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
            const originalItem = getInitialData()[editingIndex] || { t: "", a: false }
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

    const startMove = (e, index: number) => {
        e?.preventDefault()
        setSelectedForMove(index)
        setShowMoveTargets(true)
        setEditingIndex(null)
        setIsAddingNew(false)
        setIsInserting(false)
        setInsertPosition(null)
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
        cancelMove(null)
    }

    const toggleAvoidPageBreak = (index: number) => {
        const currentItem = projects[index]
        if (currentItem) {
            //避免布尔字段数据库存储false的做法：
            update(index, { ...currentItem, a: currentItem.a ? undefined : true })
            handleConfirm()
        }
    }

    const isAnyEditing = editingIndex !== null || isAddingNew || isInserting || showMoveTargets

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
                        name={`${stname}.${index}.t`}
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel htmlFor={`page-${index}`} className="select-text">
                                    一部分文字
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        ref={textareaRef}
                                        rows={20}
                                        id={`page-${index}`}
                                        className={cn(wsPre ? "whitespace-pre" : "")}
                                        placeholder="输入更多文字"
                                        // 移除 autoFocus，改用受控的聚焦逻辑
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     {/*使用外部控制的 FormSwitch */}
                    <FormSwitch  ngrid  className={"@lg:min-w-[30rem] max-w-full mx-auto px-3 py-1"}
                        label="避免分页"
                        checked={projects[index]?.a === true}
                        onChange={(checked) => {
                            const currentItem = projects[index]
                            if (currentItem) {
                                update(index, { ...currentItem, a: checked ? true : undefined })
                            }
                        }}
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

    // 渲染操作按钮组 - 根据屏幕大小决定布局
    const renderActionButtons = (index: number) => {
        if (isTinyHeightScr) {
            // 小屏幕：3x2布局，放在右侧
            return (
                <div className="flex-col">
                    <div className="flex items-center justify-center gap-0 py-0 bg-gray-50 rounded-t-lg border-b">
                        {/* 第一行：修改、插入、移动 */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startInsert(index)}
                            disabled={isAnyEditing}
                            className="h-6 w-8 p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="在此处插入"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => startMove(e, index)}
                            disabled={isAnyEditing}
                            className="h-6 w-8 p-0 text-xs text-blue-600 hover:text-blue-700"
                            title="移动"
                        >
                            <Move className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => startEdit(e, index)}
                            disabled={isAnyEditing}
                            className="h-6 w-8 p-0 text-xs"
                            title="修改"
                        >
                            <Edit className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-0 py-0 bg-gray-50 rounded-t-lg border-b">
                        {/* 第二行：删除、避免分页、空位 */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteProject(e, index)}
                            disabled={isAnyEditing}
                            className="mr-2 h-6 w-8 p-0 text-xs text-red-600 hover:text-red-700"
                            title="删除"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                        {/* 空位 */}
                        <div></div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAvoidPageBreak(index)}
                            disabled={isAnyEditing}
                            className={cn(
                                "h-6 w-8 p-0 text-xs",
                                projects[index]?.a
                                    ? "text-green-600 hover:text-green-700 bg-green-50"
                                    : "text-gray-600 hover:text-gray-700",
                            )}
                            title={projects[index]?.a ? "已启用避免分页" : "点击启用避免分页"}
                        >
                            <Printer className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            )
        } else {
            // 大屏幕或竖屏：水平布局，放在上方
            return (
                <div className="flex items-center justify-center gap-0 py-0 bg-gray-50 rounded-t-lg border-b">
                    {/* 修改按钮 */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => startEdit(e, index)}
                        disabled={isAnyEditing}
                        className="mr-4 h-8 px-2 text-xs"
                        title="修改"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    {/* 插入按钮 */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startInsert(index)}
                        disabled={isAnyEditing}
                        className="mr-1 h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="在此处插入"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                    {/* 移动按钮 */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => startMove(e, index)}
                        disabled={isAnyEditing}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700"
                        title="移动"
                    >
                        <Move className="w-4 h-4" />
                    </Button>
                    {/* 删除按钮 */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteProject(e, index)}
                        disabled={isAnyEditing}
                        className="ml-8 mr-8 h-8 px-2 text-xs text-red-600 hover:text-red-700"
                        title="删除"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    {/* 避免分页切换按钮 */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAvoidPageBreak(index)}
                        disabled={isAnyEditing}
                        className={cn(
                            "h-8 px-2 text-xs",
                            projects[index]?.a
                                ? "text-green-600 hover:text-green-700 bg-green-50"
                                : "text-gray-600 hover:text-gray-700",
                        )}
                        title={projects[index]?.a ? "已启用避免分页" : "点击启用避免分页"}
                    >
                        <Printer className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    }

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

    const content = (
        <>
            <div className="space-y-0.5">
                {/* 在第一项前显示移动目标 */}
                {showMoveTargets && selectedForMove !== null && selectedForMove !== 0 && renderMoveTarget(0, "移动到最前面")}

                {fields.map((field, index) => (
                    <div key={field.id}>
                        {/* 大屏幕：操作按钮组放在内容展示区上方 */}
                        {!isTinyHeightScr && !showMoveTargets && renderActionButtons(index)}

                        {/* 移动目标位置 - 在当前项之前显示 */}
                        {showMoveTargets &&
                            selectedForMove !== null &&
                            selectedForMove !== index &&
                            selectedForMove !== index - 1 &&
                            renderMoveTarget(index, `移动到第 ${index + 1} 位`)}

                        {/* 项目展示行 */}
                        <div
                            className={cn(
                                "flex items-center justify-between py-3 @md:px-3 transition-colors",
                                isTinyHeightScr ? "rounded-lg border" : "rounded-b-lg border",
                                editingIndex === index && !isInserting
                                    ? "bg-blue-50 border-blue-200"
                                    : selectedForMove === index
                                        ? "bg-yellow-50 border-yellow-300 shadow-md"
                                        : "hover:bg-gray-50",
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-black">
                                    {selectedForMove === index && (
                                        <div className="text-xs text-yellow-700 mb-1 font-medium">已选中 - 请选择目标位置</div>
                                    )}
                                    {projects[index]?.t && (
                                        <SmartTruncatedText
                                            maxLines={3}
                                            text={projects[index].t}
                                            uniqueKey={`project-${index}-ml`}
                                            containerClassName="w-full"
                                        />
                                    )}
                                    {projects[index]?.a && (
                                        <div className="text-xs text-green-600 mt-1 flex items-center">
                                            <Printer className="w-3 h-3 mr-1" />
                                            避免分页
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 高度很小屏幕：操作按钮组放在内容行右侧 */}
                            {isTinyHeightScr && !showMoveTargets && renderActionButtons(index)}

                            {/* 移动模式下的取消按钮 */}
                            {showMoveTargets && selectedForMove === index && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelMove}
                                    className="ml-2 text-gray-600 bg-transparent"
                                    title="取消移动"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* 编辑表单 - 只在普通编辑模式下显示 */}
                        {editingIndex === index && !isInserting && renderEditForm(index, "edit")}

                        {/* 插入表单 - 只在插入模式下显示 */}
                        {isInserting && insertPosition === index && renderEditForm(index, "insert")}

                        {/* 在最后一项后显示移动目标 */}
                        {showMoveTargets &&
                            selectedForMove !== null &&
                            index === projects.length - 1 &&
                            selectedForMove !== index &&
                            renderMoveTarget(projects.length, "移动到最后面")}
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
                            // 直接访问 t 和 a 字段，不再兼容旧的字符串格式
                            const textContent = part?.t
                            const avoidPageBreak = part?.a

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
