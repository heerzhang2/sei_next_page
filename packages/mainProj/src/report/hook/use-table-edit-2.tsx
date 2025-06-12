"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { useWindowSize } from "@/hooks/use-window-size"
import { cn } from "@/lib/utils"
import { useMeasure } from "@/hooks/use-measure"
import {
    Card,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui"
import { FormSelectField, MemoDateInput, MemoDatesInput, SuffixInput } from "@/components/chub"
import type { UseFormReturn } from "react-hook-form"
import {
    Check,
    Undo,
    EyeIcon as EyeClosed,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowRight,
} from "lucide-react"
import { useEffect } from "react"

export interface Each_ZdSetting extends Array<any> {
    n1: string //字段标题名
    f2: string //数据库标签
    l3: number //定长布局的像素宽度
    extend?: any //扩充配置解析对象： 编辑器的: { t:编辑框类别, u:单位, l：预定的列表数组, s输入框行大小 }}
    park?: string //对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；只能支持1层的嵌套对象： 对于Row.{m. sgm {name,username}}无法支持的。
}

interface TableEditProps {
    config: Each_ZdSetting[]
    table: string
    headview: React.ReactNode
    tailview?: React.ReactNode
    defaultV?: any[]
    noDelAdd?: boolean
    //定长折叠布局没有考虑隐藏固定内容的列的。弹性布局才会做隐藏。
    fixColumn?: number
    //改useform了:就不用了，直接配置指示好了。
    editAs?: (form: UseFormReturn<any, any, any>, seq: number | null) => React.ReactNode
    maxRf?: number
    stretchF?: number[]
    //初始的布局模式
    defFixedLay?: boolean
    onlyLay?: boolean //不允许切换模式只能适用defFixedLay设置的模式。
    // 添加样式自定义配置
    styleConfig?: {
        // 表头样式
        headerText?: string
        //弹性布局： 数据行div样式
        rowText?: string
        //定长折叠布局： 数据单元格样式
        cellText?: string
        // 行号样式
        rowNumberText?: string
        //弹性布局 表格间距
        tableSeparation?: string // 表格之间的间距
        // 其他自定义样式类
        customClasses?: {
            headerWrapper?: string
            rowWrapper?: string
            //定长布局的
            tableWrapper?: string
            cellWrapper?: string
        }
    }
    form: UseFormReturn<any, any, any>
    arrayControls: Record<string, any>
    externalData?: any | null
    //自定义确认回调：用户弹出编辑窗口只做一次的，按钮触发的。
    onConfirm?: ((form: UseFormReturn<any, any, any>) => void) | null
    //删除也能触发：在form操作触发的
    onExternalDataChange?: ((data: any) => void) | null
    // 新增分页参数
    pageSize?: number // 每页显示的行数，默认为0表示不分页
    showPagination?: boolean // 是否显示分页控件，默认true
    pageSizeOptions?: number[] // 新增：页面大小选项
    toPage?: number //加载时刻直接定位第几页 是0based的；配合外部关键字去定位当前显示行。
}

const TabSplChars = [
    "◆",
    "╏",
    "│",
    "┋",
    "╁",
    "↑",
    "╀",
    "●",
    "║",
    "◇",
    "┃",
    "┩",
    "¤",
    "┪",
    "╔",
    "╝",
    "Θ",
    "∣",
    "╚",
    "╗",
    "╡",
    "┇",
    "╞",
    "╘",
    "╕",
    "┊",
    "╬",
    "┾",
    "╮",
    "╉",
    "◎",
    "♂",
    "╰",
    "┠",
    "↓",
    "╠",
]

/*目的是编辑器而不是表格显示打印。适应于编辑表格的显示编辑列数不算太多的,表格行数也比较少的情况;并非适用于普通数据库表格编辑保存。
表格数据全都加载进来的，表数据无关键字id的，当有顺序的，数据保存一次性全量的保存到非结构化存储的。【优点】屏幕大小自适应好。
小屏幕大屏幕和浏览器适应需要，多加个表头独立做复的。实际表格数据行可能在屏幕上多行输出的。但是对于字段书很少的表格，也会出现大屏幕上有多个表格数据行在同一行上做并排布局情况。
【注意】特别要求必须把 {remove, move, insert } = arrays?.[];  因为 (form: UseFormReturn 参数实际上是从外部注入的。
参数onConfirm的用途：实际上替代掉onExternalDataChange了。
原版本参数saveFixC排除掉固定列模式的存储需要，新版本作废saveFixC：都必须存储该表config的字段到后端,但是保留不允许用户修改的字段列fixColumn。
 * */
export function useTableEdit({
                                 config,
                                 table,
                                 headview,
                                 tailview,
                                 defaultV,
                                 noDelAdd,
                                 fixColumn,
                                 editAs,
                                 maxRf,
                                 stretchF = [1, 1.35, 1.7],
                                 defFixedLay,
                                 onlyLay,
                                 styleConfig = {}, // 默认为空对象
                                 externalData = null, // 添加外部数据源参数
                                 onExternalDataChange = null, // 添加外部数据变更回调，改成onConfirm
                                 onConfirm, // 添加确认回调函数
                                 form,
                                 arrayControls: arrays,
                                 pageSize = 0, // 新增：每页行数，0表示不分页
                                 showPagination = true, // 新增：是否显示分页控件
                                 pageSizeOptions = [5, 10, 20, 30, 50, 100], // 新增：页面大小选项
                                 toPage = 0,
                             }: TableEditProps) {
    //避免输入性能问题：引入 1. 添加一个新的状态来存储本地表格数据
    const [localTableData, setLocalTableData] = React.useState<any[]>([])

    // 添加一个状态来跟踪当前编辑的行是否是新插入的行
    const [isEditingNewRow, setIsEditingNewRow] = React.useState(false)

    // 新增分页相关状态
    const [currentPage, setCurrentPage] = React.useState(toPage)
    // 新增：用户选择的页面大小状态
    const [userPageSize, setUserPageSize] = React.useState<number>(pageSize > 0 ? pageSize : pageSizeOptions[0])

    // 修改：使用用户选择的页面大小
    const isPaginationEnabled = userPageSize > 0 // 是否启用分页

    // 计算分页相关数据
    const totalItems = localTableData.length
    const totalPages = isPaginationEnabled ? Math.ceil(totalItems / userPageSize) : 1
    const startIndex = isPaginationEnabled ? currentPage * userPageSize : 0
    const endIndex = isPaginationEnabled ? Math.min(startIndex + userPageSize, totalItems) : totalItems
    const currentPageData = isPaginationEnabled ? localTableData.slice(startIndex, endIndex) : localTableData

    // 提取样式配置，设置默认值
    const {
        headerText = "text-sm",
        rowText = "text-xs h-md:md:text-sm leading-none",
        cellText = "text-xs h-md:md:text-[14px]",
        rowNumberText = "text-[10px]/1 h-md:text-xs/2",
        tableSeparation = "gap-2",
        customClasses = {},
    } = styleConfig || {}

    // 添加一个 ref 来引用编辑器区域
    const editorRef = React.useRef<HTMLDivElement>(null)
    // 添加一个 ref 来引用编辑器内容区域，用于测量高度
    const editorContentRef = React.useRef<HTMLDivElement>(null)

    //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
    const [seq, setSeq] = React.useState<number | null>(null)
    const [selectedRaft, setSelectedRaft] = React.useState<number | null>(null)
    //定长折叠形态才需要区分表格raft的位置；
    const [activeHeaderIndex, setActiveHeaderIndex] = React.useState<number | null>(null)
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
    const { screenHeight, screenWidth } = useWindowSize()
    const frameRef = React.useRef<HTMLDivElement>(null)
    const barRect = useMeasure(frameRef as React.RefObject<HTMLElement>)
    const hBarWidth = barRect?.width || 0
    const screenTp = screenHeight! > 860 && hBarWidth > 1700 ? 2 : screenHeight! > 740 && hBarWidth > 1280 ? 1 : 0
    //最多几个分区表可以并排的:默认raft=1
    const raft = React.useMemo(() => {
        // Calculate total width needed for all columns
        const desiredW = config.reduce((prevSum, [_, _t, width]: any) => {
            return prevSum + width
        }, 0)
        // Add some padding to account for margins and borders
        const totalDesiredWidth = desiredW + config.length * 10
        // Calculate how many columns can fit based on available width
        // Use a more conservative stretch factor to ensure we don't try to fit too many
        const adjustedStretchFactor = stretchF[screenTp] * 1.2
        const rfnum = Math.max(1, Math.floor(hBarWidth / (totalDesiredWidth * adjustedStretchFactor)))
        // Limit to reasonable bounds
        const canDispNum = isNaN(rfnum) || rfnum < 1 ? 1 : Math.min(rfnum, 20)
        // Apply maxRf constraint if provided
        return maxRf ? Math.min(canDispNum, maxRf) : canDispNum
    }, [hBarWidth, screenTp, stretchF, config, maxRf])

    //定长折叠模式：需要复杂的key="tableIndex-rowIndex"而不是正常的{i}来做标记关联的。
    const rowRefs = React.useRef<Map<number | string, HTMLDivElement | null>>(new Map())
    // 存储每个表格的表头引用
    const headerRefs = React.useRef<Map<number, HTMLTableSectionElement | null>>(new Map())

    // 在 useTableEdit 函数内部，添加以下状态和 ref
    const [editorPosition, setEditorPosition] = React.useState<{
        top: number
        left: number
        width?: number
        height?: number
        visibility?: any
    } | null>(null)
    const [showEditorPortal, setShowEditorPortal] = React.useState(false)
    const portalContainerRef = React.useRef<HTMLDivElement | null>(null)

    // 新增：索引转换函数
    const pageIndexToGlobalIndex = React.useCallback(
        (pageRowIndex: number, tableIndex: number) => {
            return startIndex + raft * pageRowIndex + tableIndex
        },
        [startIndex, raft],
    )

    // 新增：分页控制函数
    const goToPage = React.useCallback(
        (page: number) => {
            if (page >= 0 && page < totalPages) {
                setCurrentPage(page)
                // 重置一些状态
                setActiveHeaderIndex(null)
                setSelectedRaft(null)
                setFloatingHeader(null)
                setOpenMenuId(null)
            }
        },
        [totalPages],
    )

    const goToFirstPage = React.useCallback(() => goToPage(0), [goToPage])
    const goToLastPage = React.useCallback(() => goToPage(totalPages - 1), [goToPage, totalPages])
    const goToPrevPage = React.useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage])
    const goToNextPage = React.useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage])

    useEffect(() => {
        setUserPageSize(pageSize)
        setCurrentPage(toPage)
    }, [toPage, pageSize])

    // 在 useEffect 中创建 portal 容器
    React.useEffect(() => {
        // 创建一个 div 作为 portal 的容器
        const portalContainer = document.createElement("div")
        portalContainer.className = "editor-portal-container"
        portalContainer.style.position = "absolute"
        portalContainer.style.zIndex = "50"
        portalContainer.style.width = "100%"
        portalContainer.style.maxWidth = "100%"
        document.body.appendChild(portalContainer)

        portalContainerRef.current = portalContainer

        return () => {
            if (portalContainer && document.body.contains(portalContainer)) {
                document.body.removeChild(portalContainer)
            }
        }
    }, [])

    // 添加动态调整编辑器高度的 useEffect 没法修正？
    React.useEffect(() => {
        //editorPosition已经再点击修改按钮后初始化了:初始hidden不显示的；然后这里重新设置窗口height。
        if (editorContentRef.current && showEditorPortal && editorPosition?.visibility === "hidden") {
            const adjustEditorHeight = () => {
                const contentElement = editorContentRef.current
                if (!contentElement) return

                const viewportHeight = window.innerHeight
                const viewportWidth = window.innerWidth
                const phoneLandscape = viewportWidth > viewportHeight && viewportHeight < 500
                const isMobile = viewportWidth < 768

                // 测量内容的实际高度
                const contentHeight = contentElement.scrollHeight
                const headerHeight = 48 // 编辑器头部高度（估算）
                const padding = 24 // 内边距
                const totalContentHeight = contentHeight + headerHeight + padding

                let newHeight: number
                let newTop: number

                if (isMobile || phoneLandscape) {
                    // 移动设备：限制最大高度，但允许内容自适应
                    const maxHeight = viewportHeight * (phoneLandscape ? 0.96 : 0.9)
                    const minHeight = Math.min(300, viewportHeight * 0.4)
                    newHeight = Math.max(minHeight, Math.min(totalContentHeight, maxHeight))
                    newTop = Math.max(5, (viewportHeight - newHeight) / 2)
                } else {
                    // 桌面设备：根据内容调整高度
                    const maxHeight = Math.min(viewportHeight * 0.85, 900) // 增加最大高度
                    const minHeight = 160 // 电脑屏最小高度
                    newHeight = Math.max(minHeight, Math.min(totalContentHeight, maxHeight))
                    newTop = Math.max(20, (viewportHeight - newHeight) / 2)
                }
                // 更新编辑器位置
                setEditorPosition((prev) =>
                    prev
                        ? {
                            ...prev,
                            height: newHeight,
                            top: newTop,
                            visibility: "unset",
                        }
                        : null,
                )
            }
            // 延迟执行，确保内容已渲染
            const timer = setTimeout(adjustEditorHeight, 100)
            //监听窗口大小变化，编辑器宽度变化导致高度也需要改变的。浏览器大小若变：就只能让用户手动关闭弹出的编辑器了。
            window.addEventListener("resize", adjustEditorHeight)
            return () => {
                clearTimeout(timer)
                //实际马上就移除掉resize监听的：就没意义啊！
                window.removeEventListener("resize", adjustEditorHeight)
            }
        }
        //绝不能加上依赖 editorPosition 会导致死循环的；
    }, [editorContentRef.current, showEditorPortal])

    function spliteor(i: number) {
        return TabSplChars[i % TabSplChars.length]
    }
    //性能问题editor = React.useCallback((form: any) => {不能用const tabledArr = form.watch?.(table) || []输入太慢
    const handleTableOperation = React.useCallback(
        (operation: "add" | "remove" | "update" | "move" | "insert" | "clear", params: any) => {
            // 基于操作类型更新本地状态
            let newData: any[] = []
            let shouldUpdate = true

            switch (operation) {
                case "add":
                    newData = [...localTableData, params.data]
                    break
                case "remove":
                    newData = localTableData.filter((_, i) => i !== params.index)
                    break
                case "update":
                    newData = [...localTableData]
                    newData[params.index] = params.data
                    break
                case "move":
                    newData = [...localTableData]
                    const [movedItem] = newData.splice(params.fromIndex, 1)
                    newData.splice(params.toIndex, 0, movedItem)
                    break
                case "insert":
                    newData = [...localTableData]
                    newData.splice(params.index, 0, params.data)
                    break
                case "clear":
                    newData = params.defaultData || []
                    break
                default:
                    shouldUpdate = false
            }

            if (shouldUpdate) {
                // 检查数据是否真的变化了
                const isEqual = JSON.stringify(newData) === JSON.stringify(localTableData)
                if (!isEqual) {
                    setLocalTableData(newData)

                    // 分页相关：检查当前页是否还有效
                    if (isPaginationEnabled) {
                        const newTotalPages = Math.ceil(newData.length / userPageSize)
                        if (currentPage >= newTotalPages && newTotalPages > 0) {
                            setCurrentPage(newTotalPages - 1)
                        }
                    }

                    // 如果提供了外部数据变更回调，则调用它
                    if (onExternalDataChange) {
                        // 创建一个新对象，保持外部数据的其他部分不变
                        onExternalDataChange({ [table]: newData })
                    }
                }
            }
        },
        [localTableData, onExternalDataChange, table, isPaginationEnabled, userPageSize, currentPage],
    )
    //原本放在useCallback内部的
    const { fields, append, remove, move, insert } = arrays?.[table] || {}
    // 修改取消编辑的函数，只重置当前行数据
    const handleCancel = React.useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            if (form && seq !== null) {
                if (isEditingNewRow && remove) {
                    // 如果是新增或插入的行，直接移除
                    remove(seq)
                    handleTableOperation("remove", { index: seq })
                } else {
                    let originalData: { [x: string]: any }
                    // 如果是编辑现有行，只重置当前行数据到原始状态
                    if (externalData && externalData[table]) {
                        const externalTableData = externalData[table] || []
                        originalData = externalTableData[seq] || {}
                    }
                    // 遍历配置，只重置当前行的字段
                    config.forEach(([_, tag, __, ___, park]) => {
                        try {
                            if (park) {
                                if (originalData[park]) {
                                    form.setValue(`${table}.${seq}.${park}.${tag}`, originalData[park][tag] || "", {
                                        shouldDirty: false,
                                        shouldTouch: false,
                                    })
                                }
                            } else {
                                form.setValue(`${table}.${seq}.${tag}`, originalData[tag] || "", {
                                    shouldDirty: false,
                                    shouldTouch: false,
                                })
                            }
                        } catch (err) {
                            console.error("Error resetting form value:", err)
                        }
                    })
                }
            }
            // 关闭编辑器并重置状态
            setShowEditorPortal(false)
            setSeq(null)
            setIsEditingNewRow(false) // 重置新行状态
            e.preventDefault()
        },
        [form, seq, config, table, localTableData, remove, handleTableOperation, isEditingNewRow],
    )

    //表格行数据编辑器的DOM
    const editor = React.useMemo(() => {
        const index = seq ?? 0 // 表格第几行的

        // 添加跳转到下一条记录的函数
        const handleNextRecord = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            if (seq !== null && seq < localTableData.length - 1) {
                const nextIndex = seq + 1
                setSeq(nextIndex)

                // 同步下一条记录的数据到表单
                const nextRowData = localTableData[nextIndex]
                if (nextRowData) {
                    setTimeout(() => {
                        config.forEach(([_, tag, __, ___, park]) => {
                            try {
                                if (park) {
                                    if (nextRowData[park]) {
                                        form.setValue(`${table}.${nextIndex}.${park}.${tag}`, nextRowData[park][tag] || "", {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                } else {
                                    form.setValue(`${table}.${nextIndex}.${tag}`, nextRowData[tag] || "", {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                    })
                                }
                            } catch (e) {
                                console.error("Error setting form value:", e)
                            }
                        })
                    }, 0)
                }

                // 如果下一条记录在不同页面，需要跳转页面
                if (isPaginationEnabled) {
                    const nextPage = Math.floor(nextIndex / userPageSize)
                    if (nextPage !== currentPage) {
                        setCurrentPage(nextPage)
                    }
                }
            }
        }

        // 创建编辑处理函数，使用不依赖 form.watch 的方式
        const handleAddNewRecord = (e: React.MouseEvent) => {
            e.preventDefault()
            if (append) {
                // 如果当前有选中行，复制该行数据
                if (seq !== null && localTableData[seq]) {
                    // 创建一个深拷贝以避免引用问题
                    const newItem = JSON.parse(JSON.stringify(localTableData[seq]))
                    append(newItem)
                    // 更新本地状态
                    handleTableOperation("add", { data: newItem })
                } else {
                    // 否则创建空白记录
                    const template = {} as any
                    config.forEach(([_t, tag, _w, _o, park]) => {
                        if (park) {
                            // 确保嵌套对象存在
                            if (!template[park]) template[park] = {}
                            template[park][tag] = ""
                        } else {
                            template[tag] = ""
                        }
                    })
                    append(template)
                    // 更新本地状态
                    handleTableOperation("add", { data: template })
                }

                // 分页相关：新增记录后可能需要跳转到最后一页
                const newLength = localTableData.length + 1
                if (isPaginationEnabled) {
                    const newTotalPages = Math.ceil(newLength / userPageSize)
                    const lastPage = newTotalPages - 1
                    if (lastPage !== currentPage) {
                        setCurrentPage(lastPage)
                    }
                }
                setSeq(localTableData.length) // 设置为新添加的行
                setIsEditingNewRow(true) // 标记为编辑新行
                setShowEditorPortal(false) // 新增行时不使用 portal
            }
        }

        // 添加关闭编辑器的函数
        const handleCloseEditor = (e: React.MouseEvent<HTMLButtonElement>) => {
            setShowEditorPortal(false)
            setSeq(null)
            setIsEditingNewRow(false)
            e.preventDefault()
        }
        // 添加确认编辑的函数
        const handleConfirmEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (form && onConfirm) {
                onConfirm(form)
            }
            e.preventDefault()
            setShowEditorPortal(false)
            setSeq(null)
            setIsEditingNewRow(false) // 重置新行状态
        }

        const isLastRecord = seq !== null && seq >= localTableData.length - 1
        //编辑器的头部按钮区域不做滚动的，编辑项目的区域才是可滚动的区域。
        if (noDelAdd && seq === null) return null
        else
            return (
                <Card
                    className={cn(
                        "flex justify-center w-full flex-col md:p-1 gap-1",
                        showEditorPortal && "h-full flex flex-col py-0", // 添加滚动支持
                    )}
                    ref={editorRef}
                >
                    <div className="flex justify-between items-center sticky top-0 bg-background z-10 px-1 py-0 border-b @4xl:pr-[24rem]">
                        <div className="flex gap-2">
                            {seq !== null && (
                                <Button variant="outline" size="sm" onClick={handleNextRecord} disabled={isLastRecord}>
                                    <ArrowRight className="h-4 w-4 @md:mr-2" />
                                    <span className="hidden @md:block">下一条</span>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleCloseEditor}>
                                <Check className="h-4 w-4 @md:mr-2" />
                                关闭
                            </Button>
                        </div>
                        <div className="flex-nowrap text-sm @md:text-base m-auto">
                            {seq === null ? "新增一" : `第${seq! + 1}`}条：
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <Button variant="default" size="sm" onClick={handleConfirmEdit}>
                                <EyeClosed className="h-4 w-4 @md:mr-2" />
                                同步
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                                <Undo className="h-4 w-4 @md:mr-2" />
                                取消
                            </Button>
                        </div>
                    </div>
                    <div className={cn("w-full", "flex-1 overflow-y-auto p-2")}>
                        <div ref={editorContentRef}>
                            {seq !== null && (
                                <>
                                    {editAs ? (
                                        editAs(form, seq)
                                    ) : (
                                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2 p-2">
                                            {config.map(([title, tag, _, extobj, park]: any, i: number) => {
                                                const { t: type, l: list, u: unit, s: size } = extobj || {}
                                                if ((fixColumn && i < fixColumn) || !(fields?.length > 0))
                                                    return <React.Fragment key={i}></React.Fragment>
                                                if (type === "s")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => <FormSelectField field={field} label={title} options={list} />}
                                                        />
                                                    )
                                                else if (type === "d")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        <Input type="date" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (type === "b")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">{/*<Switch   {...field}  />*/}</FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (type === "B")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid @5xl:col-span-2">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        {/*<BlobInputList datalist={list} unit={unit}  {...field}  />*/}
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (type === "m")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">{/*<Textarea rows={4}  {...field} />*/}</FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (type === "M")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        <MemoDatesInput {...field} rows={2} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (type === "D")
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        <MemoDateInput {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else if (unit)
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        <SuffixInput unit={unit} {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                else
                                                    return (
                                                        <FormField
                                                            key={i}
                                                            control={form.control}
                                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                            render={({ field }) => (
                                                                <FormItem className="w-full break-inside-avoid">
                                                                    <FormLabel className="select-text">{title}</FormLabel>
                                                                    <FormControl className="w-full">
                                                                        <Input type={type === "n" ? "number" : undefined} {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                            {!noDelAdd && !showEditorPortal && (
                                <Button className="mt-1" onClick={handleAddNewRecord}>
                                    新增一条
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )
    }, [
        seq,
        config,
        table,
        editAs,
        fixColumn,
        localTableData,
        handleTableOperation,
        noDelAdd,
        showEditorPortal,
        editorPosition,
        onConfirm,
        isEditingNewRow,
        isPaginationEnabled,
        userPageSize,
        currentPage,
        form,
    ])

    // 添加一个新的状态来跟踪浮动表头的位置和可见性
    const [floatingHeader, setFloatingHeader] = React.useState<{
        visible: boolean
        top: number
        tableIndex: number
        rowIndex: number
    } | null>(null)

    // 修改处理表头位置的函数，使用浮动表头而不是移动原始表头
    const handleHeaderPosition = React.useCallback(
        (rowIndex: number, tableIndex: number) => {
            // 如果点击的是当前活动行，则重置表头位置
            if (selectedRaft !== tableIndex) {
                setSelectedRaft(tableIndex)
            }
            //定长折叠形态下：设置当前活动行
            setActiveHeaderIndex(rowIndex)
            // 获取点击的行元素 ：区分那一个raft表格的；
            const clickedRow = rowRefs.current.get(`${tableIndex}-${rowIndex}`)
            const frameRect = frameRef.current?.getBoundingClientRect() || { top: 0 }
            // 获取对应表格的表头
            const header = headerRefs.current.get(tableIndex)

            if (clickedRow && header) {
                const rowRect = clickedRow.getBoundingClientRect()
                const headerRect = header.getBoundingClientRect()
                // 设置浮动表头的位置和可见性
                setFloatingHeader({
                    visible: true,
                    top: rowRect.top - frameRect.top - headerRect.height - 10,
                    tableIndex,
                    rowIndex,
                })
            }
        },
        [activeHeaderIndex, selectedRaft],
    )

    // 添加一个函数来关闭浮动表头
    const closeFloatingHeader = React.useCallback(() => {
        setFloatingHeader(null)
        setActiveHeaderIndex(null)
        setSelectedRaft(null)
    }, [])

    // 处理菜单打开状态的函数
    const handleMenuOpenChange = React.useCallback((open: boolean, menuId: string) => {
        if (open) {
            setOpenMenuId(menuId)
        } else {
            setOpenMenuId(null)
        }
    }, [])

    // 修改 handleRowClick 函数，添加编辑器位置计算
    const handleRowClick = React.useCallback(
        (e: React.MouseEvent, rowIndex: number, tableIndex: number) => {
            // 如果点击的是菜单触发器，不执行任何操作
            if ((e.target as HTMLElement).closest('[data-dropdown-trigger="true"]')) {
                return
            }
            // 移动表头
            handleHeaderPosition(rowIndex, tableIndex)
        },
        [handleHeaderPosition],
    )

    const [fixedColWState, setFixedColWState] = React.useState<boolean>(defFixedLay ?? false)

    // 新增：处理页面大小变更
    const handlePageSizeChange = React.useCallback((newSize: number) => {
        setUserPageSize(newSize)
        // 重置到第一页，避免切换后当前页超出范围
        setCurrentPage(0)
    }, [])

    // 添加一个新函数来处理编辑器的位置和显示
    const showEditorAtRowFn = React.useCallback(
        (
            rowIndex: number,
            tableIndex: number,
            mode: "edit" | "insert" = "edit",
            form: UseFormReturn<any, any, any> | null,
        ) => {
            // 计算实际的数据索引（全局索引）
            const dataIndex = pageIndexToGlobalIndex(rowIndex, tableIndex)

            // 设置当前编辑的行索引
            setSeq(dataIndex)

            // 设置是否是编辑新插入的行
            setIsEditingNewRow(mode === "insert")

            // 同步数据到编辑器 - 确保在打开编辑器前同步数据
            if (mode === "edit" && form && localTableData[dataIndex]) {
                // 获取当前行数据
                const rowData = localTableData[dataIndex]

                // 延迟一帧执行，确保 seq 已更新
                setTimeout(() => {
                    // 遍历配置，设置表单值
                    config.forEach(([_, tag, __, ___, park]) => {
                        try {
                            if (park) {
                                if (rowData[park]) {
                                    form.setValue(`${table}.${dataIndex}.${park}.${tag}`, rowData[park][tag] || "", {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                    })
                                }
                            } else {
                                form.setValue(`${table}.${dataIndex}.${tag}`, rowData[tag] || "", {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        } catch (e) {
                            console.error("Error setting form value:", e)
                        }
                    })
                }, 0)
            }
            // 固定编辑器位置在屏幕中央，增加宽度
            if (portalContainerRef.current) {
                if (!showEditorPortal) {
                    //有必要调整窗口
                    const viewportHeight = window.innerHeight
                    const viewportWidth = window.innerWidth
                    const phoneLandscape = viewportWidth > viewportHeight && viewportHeight < 500
                    const isMobile = viewportWidth < 768

                    // 统一使用居中模式，根据设备类型调整大小
                    if (isMobile || phoneLandscape) {
                        // 移动设备：几乎全屏
                        setEditorPosition({
                            top: Math.max(5, viewportHeight * (phoneLandscape ? 0.02 : 0.05)),
                            left: Math.max(5, viewportWidth * 0.02),
                            width: viewportWidth * 0.96,
                            height: viewportHeight * (phoneLandscape ? 0.96 : 0.9), // 初始高度，会被动态调整
                            visibility: editorPosition?.visibility ?? "hidden",
                        })
                    } else {
                        // 桌面设备：居中弹窗，增加宽度
                        const editorWidth = Math.min(viewportWidth * 0.9, 1400) // 增加宽度从0.8到0.9，最大宽度从1200到1400
                        const editorHeight = Math.min(viewportHeight * 0.85, 900) // 增加高度比例和最大高度
                        setEditorPosition({
                            top: (viewportHeight - editorHeight) / 2,
                            left: (viewportWidth - editorWidth) / 2,
                            width: editorWidth,
                            height: editorHeight, // 初始高度，会被动态调整
                            visibility: editorPosition?.visibility ?? "hidden",
                        })
                    }
                }
                //重新显示编辑器
                setShowEditorPortal(true)
            }
        },
        [pageIndexToGlobalIndex, localTableData, config, table, editorPosition?.visibility],
    )

    // 2. 添加一个 useEffect 来初始化本地数据和在关键操作后更新它【没有用到？】
    // 修改这个 useEffect 钩子，添加一个 ref 来确保它只在初始化时运行一次
    const initializedRef = React.useRef(false)

    React.useEffect(() => {
        // 只在组件首次挂载时执行一次
        if (!initializedRef.current) {
            const initialData = defaultV || []
            setLocalTableData(initialData)
            initializedRef.current = true
        }
    }, [defaultV, table])

    // 添加对外部数据的监听
    // 修改外部数据同步的 useEffect，添加深度比较
    React.useEffect(() => {
        if (externalData && externalData[table]) {
            // 添加深度比较，只在数据真正变化时才更新
            const externalTableData = externalData[table] || []
            const currentData = JSON.stringify(externalTableData)
            const localData = JSON.stringify(localTableData)

            if (currentData !== localData) {
                // 当外部数据变化时，更新本地状态
                setLocalTableData(externalTableData)
            }
        }
    }, [externalData, table, localTableData])

    // 计算当前页的行数
    const currentPageItemCount = currentPageData.length
    const linecnt = Math.ceil(currentPageItemCount / raft)

    // 新增：分页控件组件
    // 在 useTableEdit 函数内部，添加一个新的状态来存储用户输入的页码
    const [jumpToPage, setJumpToPage] = React.useState<string>("")

    // 修改处理跳转的函数，移除表单依赖
    const handleJumpToPageDirect = React.useCallback(() => {
        const pageNumber = Number.parseInt(jumpToPage, 10)
        if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
            // 页码从1开始显示，但状态从0开��，所以需要减1
            goToPage(pageNumber - 1)
            // 清空输入框
            setJumpToPage("")
        }
    }, [jumpToPage, totalPages, goToPage])

    // 添加处理回车键的函数
    const handleJumpInputKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault()
                e.stopPropagation()
                handleJumpToPageDirect()
            }
        },
        [handleJumpToPageDirect],
    )

    // 修改 PaginationControls 组件，添加页码跳转功能
    // 修改 PaginationControls 组件，添加位置参数以生成唯一 ID

    // 在 PaginationControls 的定义中，添加位置参数
    const PaginationControls = React.useMemo(() => {
        if (!isPaginationEnabled || !showPagination) return null

        // 检测是否为小屏幕
        const isSmallScreen = typeof window !== "undefined" ? hBarWidth < 640 : false

        // 创建一个函数来生成唯一的 ID
        const getUniqueId = (baseId: string, position: "top" | "bottom") => `${baseId}-${position}`

        // 创建一个渲染函数，接受位置参数
        const renderPaginationControls = (position: "top" | "bottom") => (
            <div className="flex flex-wrap items-center justify-between px-2 py-2 bg-white border-t border-gray-200">
                {/* 页面大小选择器 */}
                <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <label
                        htmlFor={getUniqueId("page-size-select", position)}
                        className={isSmallScreen ? "text-xs" : "text-sm text-gray-700"}
                    >
                        {isSmallScreen ? "每页:" : "每页显示:"}
                    </label>
                    <select
                        id={getUniqueId("page-size-select", position)}
                        value={userPageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="h-8 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="选择每页显示记录数"
                        // 防止表单提交
                        onClick={(e) => e.stopPropagation()}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className={isSmallScreen ? "text-xs" : "text-sm text-gray-700"}>条</span>
                </div>

                {/* 分页信息 - 响应式显示 */}
                <div className={isSmallScreen ? "text-xs w-full mb-2" : "flex items-center text-sm text-gray-700"}>
                    {isSmallScreen ? (
                        <span>
              {startIndex + 1}-{endIndex}/{totalItems} · 第{currentPage + 1}/{totalPages}页
            </span>
                    ) : (
                        <span>
              第 {startIndex + 1} - {endIndex} 条，共 {totalItems} 条
              <span className="ml-4">
                第 {currentPage + 1} 页，共 {totalPages} 页
              </span>
            </span>
                    )}
                </div>

                {/* 分页按钮 - 增大触摸区域 */}
                <div className="flex flex-wrap items-center space-x-1 sm:space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault() // 防止表单提交
                            goToFirstPage()
                        }}
                        disabled={currentPage === 0}
                        className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                        type="button" // 明确指定按钮类型
                        aria-label="首页"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault() // 防止表单提交
                            goToPrevPage()
                        }}
                        disabled={currentPage === 0}
                        className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                        type="button"
                        aria-label="上一页"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* 在小屏幕上减少显示的页码数量 */}
                    <div className="hidden sm:flex items-center space-x-1">
                        {Array.from({ length: Math.min(isSmallScreen ? 3 : 5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= (isSmallScreen ? 3 : 5)) {
                                pageNum = i
                            } else if (currentPage < (isSmallScreen ? 1 : 3)) {
                                pageNum = i
                            } else if (currentPage > totalPages - (isSmallScreen ? 2 : 4)) {
                                pageNum = totalPages - (isSmallScreen ? 3 : 5) + i
                            } else {
                                pageNum = currentPage - (isSmallScreen ? 1 : 2) + i
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault() // 防止表单提交
                                        goToPage(pageNum)
                                    }}
                                    className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                                    type="button"
                                >
                                    {pageNum + 1}
                                </Button>
                            )
                        })}
                    </div>

                    {/* 小屏幕上显示当前页/总页数 */}
                    <div className="flex sm:hidden items-center">
                        <span className="text-xs font-medium">{currentPage + 1}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault() // 防止表单提交
                            goToNextPage()
                        }}
                        disabled={currentPage === totalPages - 1}
                        className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                        type="button"
                        aria-label="下一页"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault() // 防止表单提交
                            goToLastPage()
                        }}
                        disabled={currentPage === totalPages - 1}
                        className="h-9 w-9 p-0 sm:h-8 sm:w-8"
                        type="button"
                        aria-label="末页"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>

                    {/* 新增: 跳转到指定页码 - 桌面版 */}
                    <div className="hidden sm:flex items-center ml-2 space-x-1">
                        <span className="text-xs text-gray-600">跳至</span>
                        <input
                            name={getUniqueId("tzymz", position)}
                            type="text"
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            onKeyDown={handleJumpInputKeyDown}
                            className="h-8 w-12 px-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="跳转到页码"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleJumpToPageDirect()
                            }}
                        >
                            跳转
                        </Button>
                    </div>

                    {/* 移动端紧凑版跳转 */}
                    <div className="flex sm:hidden items-center ml-1">
                        <input
                            name={getUniqueId("tzymp", position)}
                            type="text"
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            onKeyDown={handleJumpInputKeyDown}
                            placeholder="页码"
                            className="h-9 w-10 px-1 text-xs border rounded-l-md focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="跳转到页码"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-1 text-xs rounded-l-none border-l-0"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleJumpToPageDirect()
                            }}
                        >
                            跳转
                        </Button>
                    </div>
                </div>
            </div>
        )

        // 返回一个对象，包含顶部和底部的分页控件
        return {
            top: renderPaginationControls("top"),
            bottom: renderPaginationControls("bottom"),
        }
    }, [
        isPaginationEnabled,
        showPagination,
        startIndex,
        endIndex,
        totalItems,
        currentPage,
        totalPages,
        goToFirstPage,
        goToPrevPage,
        goToNextPage,
        goToLastPage,
        goToPage,
        userPageSize,
        handlePageSizeChange,
        pageSizeOptions,
        jumpToPage,
        handleJumpToPageDirect,
        handleJumpInputKeyDown,
        hBarWidth,
    ])

    const toggleFixedColW = () => {
        setFixedColWState(!fixedColWState)
    }

    const clearTable = () => {
        handleTableOperation("clear", { defaultData: defaultV })
    }

    const renderCollapsibleTable = React.useMemo(() => {
        return (
            <div className="overflow-x-auto">
                {Array.from({ length: linecnt }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex flex-nowrap">
                        {Array.from({ length: raft }).map((__, tableIndex) => {
                            const globalIndex = pageIndexToGlobalIndex(rowIndex, tableIndex)
                            const item = currentPageData[rowIndex * raft + tableIndex]
                            if (!item) return null
                            return (
                                <div
                                    key={`${tableIndex}-${rowIndex}`}
                                    className={cn("inline-block flex-none", tableSeparation, customClasses.tableWrapper)}
                                >
                                    <table className="table-auto border-collapse">
                                        <thead ref={(el) => headerRefs.current.set(tableIndex, el)}>
                                        <tr>
                                            {config.map(([title, _tag, width]: any, i: number) => (
                                                <th
                                                    key={i}
                                                    className={cn("px-2 py-1 border text-left", headerText, customClasses.headerWrapper)}
                                                    style={{ width: width * stretchF[screenTp] }}
                                                >
                                                    {title}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr ref={(el) => rowRefs.current.set(`${tableIndex}-${rowIndex}`, el)}>
                                            {config.map(([_, tag]: any, i: number) => (
                                                <td key={i} className={cn("px-2 py-1 border", cellText, customClasses.cellWrapper)}>
                                                    {item[tag]}
                                                </td>
                                            ))}
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }, [
        currentPageData,
        config,
        raft,
        pageIndexToGlobalIndex,
        screenTp,
        stretchF,
        headerText,
        cellText,
        tableSeparation,
        customClasses,
    ])

    const renderFlexibleTable = React.useMemo(() => {
        return (
            <div className="flex flex-col">
                {headview}
                {currentPageData.map((item: any, i: number) => (
                    <div
                        key={i}
                        ref={(el) => rowRefs.current.set(i, el)}
                        className={cn("flex items-center border-b py-2", rowText, customClasses.rowWrapper)}
                        onClick={(e) => handleRowClick(e, i, 0)}
                    >
                        <div className={cn("w-4 mr-2", rowNumberText)}>{startIndex + i + 1}.</div>
                        {config.map(([title, tag, width]: any, k: number) => (
                            <div
                                key={k}
                                className={cn("px-2 py-1", tableSeparation, customClasses.cellWrapper)}
                                style={{
                                    width: width * stretchF[screenTp],
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {item[tag]}
                            </div>
                        ))}
                        <DropdownMenu onOpenChange={(open) => handleMenuOpenChange(open, `row-menu-${i}`)}>
                            <DropdownMenuTrigger asChild data-dropdown-trigger="true">
                                <Button variant="ghost" className="ml-2 h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={() => showEditorAtRowFn(i, 0, "edit", form)}>编辑</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (insert) {
                                            insert(i, {})
                                            handleTableOperation("insert", { index: i, data: {} })
                                        }
                                    }}
                                >
                                    插入
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (remove) {
                                            remove(i)
                                            handleTableOperation("remove", { index: i })
                                        }
                                    }}
                                >
                                    删除
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        )
    }, [
        currentPageData,
        config,
        handleRowClick,
        screenTp,
        stretchF,
        rowText,
        tableSeparation,
        customClasses,
        startIndex,
        handleMenuOpenChange,
        showEditorAtRowFn,
        form,
    ])

    // 修改 contentRenderer 中使用 PaginationControls 的方式
    const contentRenderer = React.useMemo(() => {
        return (
            <div>
                {headview}
                <div className="flex items-center mb-4">
                    <Button variant="outline" className={onlyLay ? "hidden" : ""} onClick={toggleFixedColW}>
                        {fixedColWState ? `弹性布局` : `定长折叠`}
                    </Button>
                    <span className="ml-2 text-sm">
            按每行{defaultV && fixColumn! >= 1 && noDelAdd ? config.length - fixColumn! : config.length}列为一组录入
          </span>
                    <Button variant="outline" className="ml-auto" onClick={clearTable}>
                        清空全表至默认
                    </Button>
                </div>
                <hr className="my-2" />

                {/* 分页控件 - 顶部 */}
                {PaginationControls?.top}

                <div ref={frameRef}>{fixedColWState ? renderCollapsibleTable : renderFlexibleTable}</div>

                {/* 分页控件 - 底部 */}
                {PaginationControls?.bottom}

                {/* 只在不使用 portal 时渲染底部编辑器 */}
                {!showEditorPortal && (
                    <div className={cn("flex justify-center", "flex")} ref={editorRef}>
                        {editor}
                    </div>
                )}

                {/* 使用 portal 渲染编辑器 */}
                {showEditorPortal &&
                    portalContainerRef.current &&
                    editorPosition &&
                    createPortal(
                        <div
                            style={{
                                position: "fixed",
                                top: `${editorPosition.top}px`,
                                left: `${editorPosition.left}px`,
                                width: `${editorPosition.width}px`,
                                maxWidth: `${editorPosition.width}px`,
                                height: `${editorPosition.height}px`,
                                maxHeight: `${editorPosition.height}px`,
                                zIndex: 100,
                                backgroundColor: "white",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                                borderRadius: "8px",
                                overflow: "hidden",
                                visibility: editorPosition.visibility,
                            }}
                            className={"@container"}
                        >
                            {editor}
                        </div>,
                        portalContainerRef.current,
                    )}

                {tailview}
            </div>
        )
    }, [
        localTableData,
        raft,
        fixedColWState,
        fixColumn,
        editor,
        config,
        table,
        headview,
        tailview,
        defaultV,
        noDelAdd,
        screenTp,
        stretchF,
        renderCollapsibleTable,
        handleMenuOpenChange,
        renderFlexibleTable,
        handleTableOperation,
        showEditorPortal,
        editorPosition,
        showEditorAtRowFn,
        PaginationControls,
        isPaginationEnabled,
        userPageSize,
        toggleFixedColW,
        clearTable,
    ])

    return [contentRenderer]
}
