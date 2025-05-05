"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useWindowSize } from "@/hooks/use-window-size"
import { cn } from "@/lib/utils"
import { useMeasure } from "@/hooks/use-measure"
import { Card, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@/components/ui"
import { FormSelectField, MemoDateInput, MemoDatesInput, SuffixInput } from "@/components/chub"
import type { UseFormReturn } from "react-hook-form"
import { debounce } from "lodash"
import { Edit, Plus, Trash, ArrowDown, ArrowUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * 通用型 {制作 报告的} 可适应 大屏 手机小屏幕的 二维表格数据编辑录入。
 * 注意固定长布局 l3: 参数设置：最大设置为手机的竖屏的极限宽度360px，超过了不正常。"D:/file/dsfsdfxqe4qwe说的很对cvxcv3xcvsdf.docx"就超过了；
 * 【局限与选择】固定长布局不适合小屏幕竖屏的+超长的字段内容需显示的场景，要切换弹性布局来显示。
 * 若配置刚刚加上了 input_render_cb 字段，效果可能需要重启前端才能正常？展示。
 *@param  n1 参数是标题名；
 * f2 参数是=存储字段；
 * l3： 安排的px宽度 允许超过手机宽度如=430。
 * input_render_cb 当前单独一个字段的编辑器重新自己定义。
 * 【局限与选择】固定长布局不适合小屏幕竖屏的+超长的字段内容需显示的场景，要切换弹性布局来显示。
 * 若配置刚刚加上了 input_render_cb 字段，效果可能需要重启前端才能正常？展示。
 *@param  n1 参数是标题名；
 * f2 参数是=存储字段；
 * l3： 安排的px宽度 允许超过手机宽度如=430。
 * input_render_cb 当前单独一个字段的编辑器重新自己定义。
 * */
export type Each_ZdSetting = [
    n1: string, //字段标题名
    f2: string, //数据库标签
    l3: number, //定长布局的像素宽度
    extend?: any, //扩充配置解析对象： 编辑器的: { t:编辑框类别, u:单位, l：预定的列表数组, s输入框行大小 }}
    //input_render_cb?: InputRenderCallback | undefined,       //旧版本的:编辑回调: 编辑器特殊性要求，高阶函数。 useform版本用对象配置解析替代; editAs整体替代？？
    //只能支持1层的嵌套对象： 对于Row.{m. sgm {name,username}}无法支持的。
    park?: string, //对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；
]

interface TableEditorProps {
    config: Each_ZdSetting[]
    table: string
    headview: React.ReactNode
    tailview?: React.ReactNode
    defaultV?: any[]
    noDelAdd?: boolean
    //定长折叠布局没有考虑隐藏固定内容的列的。弹性布局才会做隐藏。
    fixColumn?: number
    saveFixC?: boolean
    //改useform了:就不用了，直接配置好了。
    editAs?: (form: UseFormReturn<any, any, any>, seq: number | null) => React.ReactNode
    maxRf?: number
    stretchF?: number[]
    //初始的布局模式
    defFixedLay?: boolean
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

/*目的是编辑器而不是表格显示打印。适应于编辑表格的显示编辑列数不算太多的,表格行数也比较少的情况,不支持普通表格的分页功能。
屏幕和浏览器适应需要，多加个表头独立做复制的。
【注意】特别要求必须把 {remove, move, insert } = arrays?.[];  从form外部注入的接口。
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
                                 saveFixC = false,
                                 defFixedLay,
                                 styleConfig = {}, // 默认为空对象
                                 externalData = null, // 添加外部数据源参数
                                 onExternalDataChange = null, // 添加外部数据变更回调
                             }: TableEditorProps & {
    externalData?: any | null
    onExternalDataChange?: ((data: any) => void) | null
}) {
    // 修改 useTableEditor 函数，添加本地状态来管理表格数据而不是每次都使用 form.watch()

    // 1. 在 useTableEditor 函数顶部添加一个新的状态来存储本地表格数据
    const [localTableData, setLocalTableData] = React.useState<any[]>([])
    const [form, setForm] = React.useState<UseFormReturn<any, any, any> | null>(null)

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

    // 新增：跟踪当前编辑行的索引和是否是新增模式
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState<boolean>(false)

    // 新增：存储每行的引用，用于定位编辑器
    const rowRefs = React.useRef<Map<string, HTMLElement | null>>(new Map())

    //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
    const [seq, setSeq] = React.useState<number | null>(null)
    const [selectedRaft, setSelectedRaft] = React.useState<number | null>(null)
    const [activeHeaderIndex, setActiveHeaderIndex] = React.useState<number | null>(null)
    const { innerHeight } = useWindowSize()
    const frameRef = React.useRef<HTMLDivElement>(null)
    const barRect = useMeasure(frameRef as React.RefObject<HTMLElement>)
    const hBarWidth = barRect?.width || 0
    const screenTp = innerHeight! > 860 && hBarWidth > 1700 ? 2 : innerHeight! > 740 && hBarWidth > 1280 ? 1 : 0

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

    // 存储每个表格的表头引用
    const headerRefs = React.useRef<Map<number, HTMLTableSectionElement | null>>(new Map())

    function spliteor(i: number) {
        return TabSplChars[i % TabSplChars.length]
    }

    // 处理表格操作
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

                    // 如果提供了外部数据变更回调，则调用它
                    if (onExternalDataChange) {
                        // 创建一个新对象，保持外部数据的其他部分不变
                        onExternalDataChange({ [table]: newData })
                    }
                }
            }
        },
        [localTableData, onExternalDataChange, table],
    )

    // 编辑器组件
    const renderEditor = React.useCallback(
        (form: any, arrays?: Record<string, any>, index: number | null = null) => {
            const currentFields = arrays?.[table]?.fields
            const { append, remove, move, insert } = arrays?.[table] || {}
            const currentIndex = index ?? 0 // 表格第几行的

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
                    setSeq(localTableData.length) // 设置为新添加的行
                    setEditingIndex(localTableData.length)
                    setIsAddingNew(true)
                }
            }

            // 处理保存编辑
            const handleSaveEdit = () => {
                setEditingIndex(null)
                setIsAddingNew(false)
            }

            // 处理取消编辑
            const handleCancelEdit = () => {
                setEditingIndex(null)
                setIsAddingNew(false)
            }

            return (
                <Card
                    className="flex justify-center w-full flex-col p-4 gap-2 shadow-lg border-t-4 border-t-blue-500"
                    ref={editorRef}
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{isAddingNew ? "新增记录" : `编辑第 ${currentIndex + 1} 条记录`}</h3>
                        <div className="space-x-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                                保存
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                取消
                            </Button>
                        </div>
                    </div>

                    <div className="w-full">
                        {(currentIndex !== null || isAddingNew) && (
                            <>
                                {editAs ? (
                                    editAs(form, currentIndex)
                                ) : (
                                    <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                                        {config.map(([title, tag, _, extobj, park]: any, i: number) => {
                                            const { t: type, l: list, u: unit, s: size } = extobj || {}

                                            if ((fixColumn && i < fixColumn) || !(currentFields?.length > 0))
                                                return <React.Fragment key={i}></React.Fragment>

                                            // 渲染表单字段
                                            if (type === "s")
                                                return (
                                                    <FormField
                                                        key={i}
                                                        control={form.control}
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => <FormSelectField field={field} label={title} options={list} />}
                                                    />
                                                )
                                            else if (type === "d")
                                                return (
                                                    <FormField
                                                        key={i}
                                                        control={form.control}
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full break-inside-avoid">
                                                                <FormLabel>{title}</FormLabel>
                                                                <FormControl className="w-full">
                                                                    <Input type="date" {...field} />
                                                                </FormControl>
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
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full break-inside-avoid">
                                                                <FormLabel>{title}</FormLabel>
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
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full break-inside-avoid">
                                                                <FormLabel>{title}</FormLabel>
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
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full break-inside-avoid">
                                                                <FormLabel>{title}</FormLabel>
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
                                                        name={park ? `${table}.${currentIndex}.${park}.${tag}` : `${table}.${currentIndex}.${tag}`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full break-inside-avoid">
                                                                <FormLabel>{title}</FormLabel>
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
                    </div>
                </Card>
            )
        },
        [config, table, editAs, fixColumn, localTableData, handleTableOperation, seq, isAddingNew],
    )

    // 修改 useTableEditor 函数，添加本地状态来管理表格数据而不是每次都使用 form.watch()

    // 1. 在 useTableEditor 函数顶部添加一个新的状态来存储本地表格数据

    // 提取样式配置，设置默认值

    // 添加一个 ref 来引用编辑器区域
    // const boundary = React.useRef<HTMLDivElement>(null);
    // 修改 scrollToEditor 函数，使其能够处理嵌套滚动容器

    //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。

    //定长折叠形态才需要区分表格raft的位置；

    //最多几个分区表可以并排的:默认raft=1

    //定长折叠模式：需要复杂的key="tableIndex-rowIndex"而不是正常的{i}来做标记关联的。
    // 存储每个表格的表头引用

    //性能问题editor = React.useCallback((form: any) => {不能用const tabledArr = form.watch?.(table) || []输入太慢

    // 2. 添加一个 useEffect 来初始化本地数据和在关键操作后更新它【没有用到？】实际用contentRendererFactory传递的(form)=>
    // 修改这个 useEffect 钩子，添加一个 ref 来确保它只在初始化时运行一次
    const initializedRef = React.useRef(false)

    React.useEffect(() => {
        // 只在组件首次挂载时执行一次
        if (!initializedRef.current) {
            const initialData = form?.getValues?.(table) || defaultV || []
            setLocalTableData(initialData)
            initializedRef.current = true
        }
    }, [defaultV, table, form])

    // 添加对外部数据的监听
    // 修改外部数据同步的 useEffect，添加深度比较

    // 3. 创建处理表格操作的函数，同时更新 form 和本地状态

    // 添加一个自定义钩子来替代直接使用 form.watch
    // 在 useTableEditor 函数内部添加此函数

    // 添加一个函数来更新本地数据状态，用于处理各种表格操作后的状态更新

    // 为常用表格操作创建包装函数，这些函数会同时更新表单和本地状态
    const wrapTableOperations = React.useCallback(
        (arrays: Record<string, any>) => {
            const { append, remove, move, insert } = arrays?.[table] || {}

            const wrappedAppend = (data: any) => {
                if (append) {
                    append(data)
                    handleTableOperation("add", { data })
                }
            }

            const wrappedRemove = (index: number) => {
                if (remove) {
                    remove(index)
                    handleTableOperation("remove", { index })
                }
            }

            const wrappedMove = (fromIndex: number, toIndex: number) => {
                if (move) {
                    move(fromIndex, toIndex)
                    handleTableOperation("move", { fromIndex, toIndex })
                }
            }

            const wrappedInsert = (index: number, data: any, options?: any) => {
                if (insert) {
                    insert(index, data, options)
                    handleTableOperation("insert", { index, data })
                }
            }

            return {
                append: wrappedAppend,
                remove: wrappedRemove,
                move: wrappedMove,
                insert: wrappedInsert,
            }
        },
        [handleTableOperation, table],
    )

    // 在renderCollapsibleTable函数中添加浮动表头组件

    // 同样需要修改弹性布局模式下的表头处理
    // 在contentRendererFactory函数中，修改弹性布局部分
    // 将原来的移动表头代码替换为浮动表头

    // 在弹性布局模式下，添加浮动表头

    const [fixedColWState, setFixedColWState] = React.useState<boolean>(defFixedLay ?? false)
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
    // 修改 contentRendererFactory 函数来使用包装后的操作函数
    const renderTableRow = React.useCallback(
        (rowIndex: number, data: any, arrays: Record<string, any>) => {
            const { remove, move, insert } = arrays?.[table] || {}
            const isEditing = editingIndex === rowIndex

            // 处理编辑按钮点击
            const handleEdit = () => {
                setEditingIndex(rowIndex)
                setIsAddingNew(false)
                setSeq(rowIndex)
            }

            // 处理删除按钮点击
            const handleDelete = () => {
                if (remove) {
                    remove(rowIndex)
                    handleTableOperation("remove", { index: rowIndex })
                    // 如果正在编辑该行，关闭编辑器
                    if (editingIndex === rowIndex) {
                        setEditingIndex(null)
                        setIsAddingNew(false)
                    }
                }
            }

            // 处理插入按钮点击
            const handleInsert = () => {
                if (insert) {
                    // 创建空白记录
                    const template = {} as any
                    config.forEach(([_t, tag, _w, _o, park]) => {
                        if (park) {
                            if (!template[park]) template[park] = {}
                            template[park][tag] = ""
                        } else {
                            template[tag] = ""
                        }
                    })

                    insert(rowIndex, template, { shouldFocus: false })
                    handleTableOperation("insert", { index: rowIndex, data: template })

                    // 设置编辑器到新插入的行
                    setEditingIndex(rowIndex)
                    setIsAddingNew(true)
                    setSeq(rowIndex)
                }
            }

            // 处理选定按钮点击
            const handleSelect = () => {
                setSeq(rowIndex)
            }

            // 处理移动到此按钮点击
            const handleMoveTo = () => {
                if (move && seq !== null && seq !== rowIndex) {
                    move(seq, rowIndex)
                    handleTableOperation("move", { fromIndex: seq, toIndex: rowIndex })
                }
            }

            return (
                <React.Fragment key={rowIndex}>
                    <tr
                        className={cn("border-b hover:bg-gray-50", isEditing && "bg-blue-50")}
                        ref={(el) => rowRefs.current.set(`row-${rowIndex}`, el)}
                    >
                        <td className="py-2 px-4 text-center">{rowIndex + 1}</td>

                        {config.map(([_, tag, width, _o, park]: any, colIndex: number) => (
                            <td
                                key={colIndex}
                                className="py-2 px-4"
                                style={{ maxWidth: `${width * 1.5}px`, overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                                {park ? data[park]?.[tag] || "" : data[tag] || ""}
                            </td>
                        ))}

                        <td className="py-2 px-4">
                            <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" onClick={handleEdit} title="修改">
                                    <Edit className="h-4 w-4" />
                                </Button>

                                <Button size="sm" variant="ghost" onClick={handleInsert} title="前面插入一行">
                                    <Plus className="h-4 w-4" />
                                </Button>

                                {!noDelAdd && (
                                    <Button size="sm" variant="ghost" onClick={handleDelete} title="删除这行">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                )}

                                <Button size="sm" variant="ghost" onClick={handleSelect} title="选定这行">
                                    <ArrowDown className="h-4 w-4" />
                                </Button>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleMoveTo}
                                    disabled={seq === null || seq === rowIndex}
                                    title="移动到这行"
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>

                    {/* 编辑器插入在当前行下方 */}
                    {isEditing && !isAddingNew && (
                        <tr>
                            <td colSpan={config.length + 2} className="p-0">
                                <div className="py-2">{renderEditor(form, arrays, rowIndex)}</div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            )
        },
        [config, editingIndex, isAddingNew, seq, form, renderEditor, handleTableOperation, noDelAdd, table],
    )

    // 渲染表格
    const renderTable = React.useCallback(
        (form: any, arrays: Record<string, any>) => {
            // 使用本地数据
            const data = localTableData

            return (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 text-left">#</th>
                            {config.map(([title], index) => (
                                <th key={index} className="py-2 px-4 text-left">
                                    {title}
                                </th>
                            ))}
                            <th className="py-2 px-4 text-left">操作</th>
                        </tr>
                        </thead>
                        <tbody>{data.map((row, index) => renderTableRow(index, row, arrays))}</tbody>
                    </table>

                    {/* 添加新行按钮 */}
                    <div className="mt-4 flex justify-center">
                        {!noDelAdd && (
                            <Button
                                onClick={() => {
                                    setIsAddingNew(true)
                                    setEditingIndex(null)
                                    // 准备添加到末尾
                                    setSeq(data.length)
                                }}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                新增一行
                            </Button>
                        )}
                    </div>

                    {/* 新增行的编辑器显示在表格末尾 */}
                    {isAddingNew && editingIndex === null && (
                        <div className="mt-4">{renderEditor(form, arrays, data.length)}</div>
                    )}
                </div>
            )
        },
        [localTableData, config, renderTableRow, renderEditor, noDelAdd, isAddingNew, editingIndex],
    )

    // 主渲染函数
    const contentRendererFactory = React.useCallback(
        (form: UseFormReturn<any, any, any> | null, arrays?: Record<string, any>) => {
            // 获取包装后的操作函数
            const wrappedOps = wrapTableOperations(arrays)

            // 合并原始操作和包装后的操作
            const enhancedArrays = { ...arrays }
            if (enhancedArrays[table]) {
                enhancedArrays[table] = {
                    ...enhancedArrays[table],
                    ...wrappedOps,
                }
            }

            // 修改 clearTable 函数，同时更新本地状态
            const clearTable = React.useCallback(
                (e) => {
                    form?.setValue(table, defaultV ?? [])
                    // 更新本地状态
                    handleTableOperation("clear", { defaultData: defaultV ?? [] })
                    // 重置编辑状态
                    setEditingIndex(null)
                    setIsAddingNew(false)
                    e.preventDefault()
                },
                [defaultV, form, table, handleTableOperation],
            )

            const renderCollapsibleTable = React.useCallback(
                (form: any, arrays: Record<string, any>, linecnt: number) => {
                    const { append, remove, move, insert } = arrays?.[table] || {}
                    const currentFields = arrays?.[table]?.fields
                    return (
                        <div className="flex flex-col">
                            {Array.from({ length: raft }, (_, i) => (
                                <div key={i} className={cn("flex", tableSeparation)}>
                                    {Array.from({ length: Math.ceil(linecnt / raft) }, (_, b) => {
                                        const rowId = `row-${raft * i + b}`
                                        const isMenuOpen = openMenuId === rowId
                                        const handleMenuOpenChange = (open: boolean, id: string) => {
                                            setOpenMenuId(open ? id : null)
                                        }
                                        if (raft * i + b >= linecnt) return null
                                        return (
                                            <div
                                                key={rowId}
                                                ref={(el) => rowRefs.current.set(rowId, el)}
                                                className={cn(
                                                    "flex flex-col border rounded-md shadow-sm overflow-hidden",
                                                    customClasses.tableWrapper,
                                                )}
                                                style={{ width: `${100 / raft}%` }}
                                            >
                                                <div className="flex justify-between w-full">
                                                    <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                    <div className="flex items-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                setSeq(raft * i + b)
                                                                setEditingIndex(raft * i + b)

                                                                // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
                                                                requestAnimationFrame(() => {
                                                                    // 获取当前行的引用
                                                                    const rowElement = rowRefs.current.get(rowId)
                                                                    if (rowElement) {
                                                                        // 滚动到编辑器位置
                                                                        rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            修改
                                                        </Button>
                                                        <DropdownMenu
                                                            open={isMenuOpen}
                                                            modal={false}
                                                            onOpenChange={(open) => handleMenuOpenChange(open, rowId)}
                                                        >
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 px-2" data-dropdown-trigger="true">
                                                                    •••
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                onCloseAutoFocus={(e) => {
                                                                    e.preventDefault()
                                                                }}
                                                            >
                                                                {!noDelAdd && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                remove(raft * i + b)
                                                                                setSeq(null)
                                                                                setEditingIndex(null)
                                                                                setOpenMenuId(null)
                                                                                handleTableOperation("remove", { index: raft * i + b })
                                                                            }}
                                                                        >
                                                                            刪除这条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                // 创建空白记录
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
                                                                                insert(raft * i + b, template, { shouldFocus: false })
                                                                                setSeq(raft * i + b) // 设置为新插入的行
                                                                                setEditingIndex(raft * i + b)
                                                                                setOpenMenuId(null)

                                                                                // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
                                                                                requestAnimationFrame(() => {
                                                                                    // 获取当前行的引用
                                                                                    const rowElement = rowRefs.current.get(rowId)
                                                                                    if (rowElement) {
                                                                                        // 滚动到编辑器位置
                                                                                        rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
                                                                                    }
                                                                                })

                                                                                handleTableOperation("insert", { index: raft * i + b, data: template })
                                                                            }}
                                                                        >
                                                                            插入一条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSeq(raft * i + b)
                                                                                setOpenMenuId(null)
                                                                            }}
                                                                        >
                                                                            选定这条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            disabled={seq === null}
                                                                            onClick={() => {
                                                                                move(seq, raft * i + b)
                                                                                setOpenMenuId(null)
                                                                                handleTableOperation("move", { fromIndex: seq, toIndex: raft * i + b })
                                                                            }}
                                                                        >
                                                                            移动到此
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                {config.map(([_t, tag, width, _o, park]: any, k: number) => {
                                                    if (fixColumn && k < fixColumn) {
                                                        return (
                                                            <div
                                                                key={k}
                                                                className={cn(
                                                                    "flex items-center border-b px-3 py-2 text-sm",
                                                                    customClasses.cellWrapper,
                                                                )}
                                                                style={{ width: `${width}px` }}
                                                            >
                                                                <span className="font-medium">{tag}</span>
                                                                <span className="ml-2 text-gray-500">
                                  {park
                                      ? currentFields?.[raft * i + b]?.[park]?.[tag]
                                      : currentFields?.[raft * i + b]?.[tag]}
                                </span>
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <div
                                                            key={k}
                                                            className={cn("flex items-center border-b px-3 py-2 text-sm", customClasses.cellWrapper)}
                                                            style={{ width: `${width}px` }}
                                                        >
                                                            <span className="font-medium">{tag}</span>
                                                            <span className="ml-2 text-gray-500">
                                {park
                                    ? currentFields?.[raft * i + b]?.[park]?.[tag]
                                    : currentFields?.[raft * i + b]?.[tag]}
                              </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )
                },
                [
                    config,
                    customClasses.cellWrapper,
                    customClasses.tableWrapper,
                    fixColumn,
                    openMenuId,
                    raft,
                    rowNumberText,
                    setOpenMenuId,
                    tableSeparation,
                    handleTableOperation,
                    noDelAdd,
                ],
            )

            const renderFlexibleTable = React.useCallback(
                (form: any, arrays: Record<string, any>, linecnt: number) => {
                    const { append, remove, move, insert } = arrays?.[table] || {}
                    const currentFields = arrays?.[table]?.fields
                    return (
                        <div className="flex flex-col">
                            {Array.from({ length: raft }, (_, i) => (
                                <div key={i} className={cn("flex", tableSeparation)}>
                                    {Array.from({ length: Math.ceil(linecnt / raft) }, (_, b) => {
                                        const cellMenuId = `cell-${raft * i + b}`
                                        const isCellMenuOpen = openMenuId === cellMenuId
                                        const handleMenuOpenChange = (open: boolean, id: string) => {
                                            setOpenMenuId(open ? id : null)
                                        }
                                        return (
                                            <div
                                                key={i}
                                                ref={(el) => rowRefs.current.set(i, el)}
                                                className={cn("flex flex-col border rounded-md shadow-sm overflow-hidden")}
                                                style={{ width: `${100 / raft}%` }}
                                            >
                                                <div className="flex justify-between w-full">
                                                    <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                    <div className="flex items-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                setSeq(raft * i + b)
                                                                setEditingIndex(raft * i + b)

                                                                // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
                                                                requestAnimationFrame(() => {
                                                                    // 获取当前行的引用
                                                                    const rowElement = rowRefs.current.get(i)
                                                                    if (rowElement) {
                                                                        // 滚动到编辑器位置
                                                                        rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            修改
                                                        </Button>
                                                        <DropdownMenu
                                                            open={isCellMenuOpen}
                                                            onOpenChange={(open) => handleMenuOpenChange(open, cellMenuId)}
                                                        >
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 px-2" data-dropdown-trigger="true">
                                                                    •••
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                {!noDelAdd && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                remove(raft * i + b)
                                                                                setSeq(null)
                                                                                setEditingIndex(null)
                                                                                setOpenMenuId(null)
                                                                                handleTableOperation("remove", { index: raft * i + b })
                                                                            }}
                                                                        >
                                                                            刪除这条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                // 创建空白记录
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
                                                                                insert(raft * i + b, template, { shouldFocus: false })
                                                                                setSeq(raft * i + b) // 设置为新插入的行
                                                                                setEditingIndex(raft * i + b)
                                                                                setOpenMenuId(null)

                                                                                // 使用 requestAnimationFrame 确保 DOM 更新后再滚动
                                                                                requestAnimationFrame(() => {
                                                                                    // 获取当前行的引用
                                                                                    const rowElement = rowRefs.current.get(i)
                                                                                    if (rowElement) {
                                                                                        // 滚动到编辑器位置
                                                                                        rowElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
                                                                                    }
                                                                                })

                                                                                handleTableOperation("insert", { index: raft * i + b, data: template })
                                                                            }}
                                                                        >
                                                                            插入一条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSeq(raft * i + b)
                                                                                setOpenMenuId(null)
                                                                            }}
                                                                        >
                                                                            选定这条
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            disabled={seq === null}
                                                                            onClick={() => {
                                                                                move(seq, raft * i + b)
                                                                                setOpenMenuId(null)
                                                                                handleTableOperation("move", { fromIndex: seq, toIndex: raft * i + b })
                                                                            }}
                                                                        >
                                                                            移动到此
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 p-2">
                                                    {config.map(([_t, tag, width, _o, park]: any, k: number) => {
                                                        const excludeFix = fixColumn && k < fixColumn
                                                        if (excludeFix) return <React.Fragment key={k}></React.Fragment>
                                                        return (
                                                            <div key={k} className={cn("flex items-center", customClasses.rowText)}>
                                                                <div className="w-1/3 font-medium">{tag}</div>
                                                                <div className="w-2/3 break-words">
                                                                    {park
                                                                        ? currentFields?.[raft * i + b]?.[park]?.[tag]
                                                                        : currentFields?.[raft * i + b]?.[tag]}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )
                },
                [
                    config,
                    customClasses.rowText,
                    fixColumn,
                    openMenuId,
                    raft,
                    rowNumberText,
                    setOpenMenuId,
                    tableSeparation,
                    handleTableOperation,
                    noDelAdd,
                ],
            )

            const editor = React.useCallback(
                (form: any, arrays?: Record<string, any>) => {
                    const currentFields = arrays?.[table]?.fields
                    return (
                        <Card
                            className="flex justify-center w-full flex-col p-4 gap-2 shadow-lg border-t-4 border-t-blue-500"
                            ref={editorRef}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">{isAddingNew ? "新增记录" : `编辑第 ${seq! + 1} 条记录`}</h3>
                                <div className="space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingIndex(null)
                                            setIsAddingNew(false)
                                        }}
                                    >
                                        保存
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingIndex(null)
                                            setIsAddingNew(false)
                                        }}
                                    >
                                        取消
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full">
                                {(seq !== null || isAddingNew) && (
                                    <>
                                        {editAs ? (
                                            editAs(form, seq)
                                        ) : (
                                            <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                                                {config.map(([title, tag, _, extobj, park]: any, i: number) => {
                                                    const { t: type, l: list, u: unit, s: size } = extobj || {}

                                                    if ((fixColumn && i < fixColumn) || !(currentFields?.length > 0))
                                                        return <React.Fragment key={i}></React.Fragment>

                                                    // 渲染表单字段
                                                    if (type === "s")
                                                        return (
                                                            <FormField
                                                                key={i}
                                                                control={form.control}
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => <FormSelectField field={field} label={title} options={list} />}
                                                            />
                                                        )
                                                    else if (type === "d")
                                                        return (
                                                            <FormField
                                                                key={i}
                                                                control={form.control}
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="w-full break-inside-avoid">
                                                                        <FormLabel>{title}</FormLabel>
                                                                        <FormControl className="w-full">
                                                                            <Input type="date" {...field} />
                                                                        </FormControl>
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
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="w-full break-inside-avoid">
                                                                        <FormLabel>{title}</FormLabel>
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
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="w-full break-inside-avoid">
                                                                        <FormLabel>{title}</FormLabel>
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
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="w-full break-inside-avoid">
                                                                        <FormLabel>{title}</FormLabel>
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
                                                                name={park ? `${table}.${seq}.${park}.${tag}` : `${table}.${seq}.${tag}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="w-full break-inside-avoid">
                                                                        <FormLabel>{title}</FormLabel>
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
                            </div>
                        </Card>
                    )
                },
                [config, table, editAs, fixColumn, seq, isAddingNew],
            )

            const linecnt = form?.watch?.(table)?.length || defaultV?.length || 1
            const renderContent = () => {
                const content = fixedColWState
                    ? renderCollapsibleTable(form, enhancedArrays!, linecnt)
                    : renderFlexibleTable(form, enhancedArrays!, linecnt)

                // 如果有正在编辑的行，在该行下方添加编辑器
                if (editingIndex !== null) {
                    // 编辑器将在行组件中通过条件渲染显示
                    return content
                }

                return (
                    <>
                        {content}
                        {seq !== null && editingIndex === null && <div className="mt-4">{editor(form, enhancedArrays)}</div>}
                    </>
                )
            }

            return (
                <div id="tabEditor-boundary" className="relative">
                    {headview}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">数据表格</h2>
                        <Button variant="outline" onClick={clearTable}>
                            重置表格
                        </Button>
                    </div>

                    <div ref={frameRef}>{renderContent()}</div>

                    {tailview}
                </div>
            )
        },
        [
            wrapTableOperations,
            table,
            headview,
            tailview,
            defaultV,
            handleTableOperation,
            renderTable,
            fixedColWState,
            editingIndex,
            seq,
        ],
    )

    // 监听表单变化
    React.useEffect(() => {
        if (!form) return

        // 创建一个防抖的更新函数
        const debouncedSync = debounce(() => {
            const currentData = form.getValues(table) || []
            setLocalTableData(currentData)
        }, 500) // 500ms防抖，可根据需要调整

        // 监听表单变化
        const subscription = form.watch((value, { name }) => {
            // 只有当变化发生在我们关心的表格数据上时才更新
            if (name && name.startsWith(`${table}.`)) {
                debouncedSync()
            }
        })

        return () => {
            debouncedSync.cancel()
            subscription.unsubscribe()
        }
    }, [form, table])

    return [contentRendererFactory, setForm]
}
