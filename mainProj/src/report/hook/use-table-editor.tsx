"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useWindowSize } from "@/hooks/use-window-size"
import { cn } from "@/lib/utils"
import { useMeasure } from "@/hooks/use-measure"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
    //改useform了:就不用了，直接配置指示好了。
    editAs?: (obj: any, setObj: React.Dispatch<React.SetStateAction<any>>, seq: number | null) => React.ReactNode
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

// Define the type for Each_ZdSetting if not already defined elsewhere
type Each_ZdSetting = [string, string, number, Function?, string?]

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
 * */
export function useTableEditor({
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
                               }: TableEditorProps) {
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

    // 添加一个滚动到编辑器的函数
    const scrollToEditor = React.useCallback(() => {
        setTimeout(() => {
            if (editorRef.current) {
                // 使用更安全的滚动方法，避免 ARIA 问题
                const rect = editorRef.current.getBoundingClientRect()
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                const targetPosition = rect.top + scrollTop - 100 // 减去一些偏移量，让编辑器在视图中更居中

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                })
            }
        }, 100) // 短暂延迟确保 DOM 已更新
    }, [])

    //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
    const [seq, setSeq] = React.useState<number | null>(null)
    const [obj, setObj] = React.useState<any>({})
    const [selectedRaft, setSelectedRaft] = React.useState<number | null>(null)
    const [fixedColW, setFixedColW] = React.useState<boolean>(defFixedLay ?? false)
    const [activeHeaderIndex, setActiveHeaderIndex] = React.useState<number | null>(null)
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
    const { innerHeight, innerWidth } = useWindowSize()
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
    //定长折叠模式：需要复杂的key="tableIndex-rowIndex"而不是正常的{i}来做标记关联的。
    const rowRefs = React.useRef<Map<number | string, HTMLDivElement | null>>(new Map())
    // 存储每个表格的表头引用
    const headerRefs = React.useRef<Map<number, HTMLTableSectionElement | null>>(new Map())

    function spliteor(i: number) {
        return TabSplChars[i % TabSplChars.length]
    }

    const editor = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const { fields, append, remove, move } = arrays?.[table] || {}
            const tabledArr = form.watch?.(table) || []
            const index = seq ?? 0 // 表格第几行的

            if (editAs) return editAs(obj, setObj, seq)
            else
                return (
                    <Card className="flex justify-center w-full flex-col md:p-1" ref={editorRef}>
                        <div>{seq === null ? "新" : seq! + 1}：</div>
                        <div className="w-full">
                            <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                                {config.map(([title, tag, _, extobj, park]: any, i: number) => {
                                    const filedVl = tabledArr[index] ? (park ? tabledArr[index][park][tag] : tabledArr[index][tag]) : ""
                                    const { t: type, l: list, u: unit, s: size } = extobj || {}
                                    if ((fixColumn && i < fixColumn) || !(fields.length > 0))
                                        return <React.Fragment key={i}></React.Fragment>
                                    else if (type === "l")
                                        return (
                                            <FormField
                                                key={i}
                                                control={form.control}
                                                name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full break-inside-avoid">
                                                        <FormLabel>{title}</FormLabel>
                                                        <FormControl className="w-full">
                                                            {/*<InputDatalist  datalist={list} unit={unit}  {...field}  />*/}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
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
                                                        <FormLabel>{title}</FormLabel>
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
                                                        <FormLabel>{title}</FormLabel>
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
                                                        <FormLabel>{title}</FormLabel>
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
                                                        <FormLabel>{title}</FormLabel>
                                                        <FormControl className="w-full">{/*<Textarea rows={4}  {...field} />*/}</FormControl>
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
                                                        <FormLabel>{title}</FormLabel>
                                                        <FormControl className="w-full">
                                                            {/*<SuffixInput  unit={unit}  {...field}  />*/}
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
                                                        <FormLabel>{title}</FormLabel>
                                                        <FormControl className="w-full">
                                                            <Input type={type === "n" ? "number" : undefined} {...field} value={filedVl} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )
                                })}
                            </div>
                            <Button
                                className="mt-4"
                                onClick={(e) => {
                                    if (append) {
                                        // 如果 seq 是合法数据行，复制该行数据
                                        if (seq !== null && tabledArr[seq]) {
                                            // 创建一个深拷贝以避免引用问题
                                            const newItem = JSON.parse(JSON.stringify(tabledArr[seq]))
                                            append(newItem)
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
                                        }
                                        setSeq(tabledArr.length) // 设置为新添加的行
                                        scrollToEditor() // 滚动到编辑器
                                    }
                                    e.preventDefault()
                                }}
                            >
                                新增一条
                            </Button>
                        </div>
                    </Card>
                )
        },
        [seq, config, table, editAs, fixColumn, scrollToEditor],
    )

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
                    top: rowRect.top - frameRect.top - headerRect.height - 6,
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

    // 处理行点击的函数 - 不打开菜单，只移动表头
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

    // 在renderCollapsibleTable函数中添加浮动表头组件
    const renderCollapsibleTable = React.useCallback(
        (form: any, arrays: Record<string, any>, linecnt: number) => {
            const tabledArr = form.watch?.(table) || []
            const membersum = tabledArr.length
            const { remove, move, insert } = arrays?.[table] || {}
            return (
                <div className="relative">
                    {/* 浮动表头 */}
                    {floatingHeader && floatingHeader.visible && (
                        <>
                            <div
                                className={cn(
                                    "absolute left-0 right-0 w-full flex gap-2 @md:gap-4 border rounded-md overflow-hidden box-border",
                                    customClasses.headerWrapper,
                                )}
                                style={{
                                    top: `${floatingHeader!.top}px`,
                                }}
                            >
                                {new Array(raft).fill(null).map((_, b: number) => {
                                    return (
                                        <table key={b} className="  w-full border-collapse">
                                            <thead className={`z-[10] border-collapse table-header-group`}>
                                            <tr className="flex flex-wrap justify-around items-center">
                                                <th className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                                    <div className="z-[1] flex flex-col items-start w-full justify-between h-auto p-0 text-left bg-white">
                                                        <div className="flex w-full justify-between items-center">
                                                            <span className={headerText}>{b + 1}</span>
                                                            <button className=" text-gray-500 hover:text-gray-700" onClick={closeFloatingHeader}>
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                            {config.map(([title, tag, width]: any, k: number) => {
                                                                return (
                                                                    <div
                                                                        key={k}
                                                                        className={cn(
                                                                            `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal min-h-[33px]`,
                                                                            customClasses.cellWrapper,
                                                                        )}
                                                                        style={{
                                                                            flexBasis: `${width * stretchF[screenTp]}px`,
                                                                            flexGrow: 1,
                                                                            flexShrink: 1,
                                                                        }}
                                                                    >
                                                                        <div className={cn("m-auto", headerText)}>{title}</div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                            </thead>
                                        </table>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    <div
                        className={cn(
                            "w-full flex gap-2 @md:gap-4 border rounded-md overflow-hidden box-border relative",
                            customClasses.tableWrapper,
                        )}
                    >
                        {/* 原有的表格内容 */}
                        {new Array(raft).fill(null).map((_, b: number) => {
                            return (
                                <table key={b} className="w-full border-collapse">
                                    <thead
                                        ref={(el) => headerRefs.current.set(b, el)}
                                        className={cn(
                                            `bg-ghostwhite z-[10] border-collapse table-header-group`,
                                            customClasses.headerWrapper,
                                        )}
                                    >
                                    <tr className="flex flex-wrap justify-around items-center">
                                        <th className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                            <div className="flex flex-col items-start w-full justify-between h-auto p-0 text-left">
                                                <span className={"text-sm"}>{b + 1}</span>
                                                <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                    {config.map(([title, tag, width]: any, k: number) => {
                                                        return (
                                                            <div
                                                                key={k}
                                                                className={cn(
                                                                    `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal min-h-[33px]`,
                                                                    customClasses.cellWrapper,
                                                                )}
                                                                style={{
                                                                    flexBasis: `${width * stretchF[screenTp]}px`,
                                                                    flexGrow: 1,
                                                                    flexShrink: 1,
                                                                }}
                                                            >
                                                                <div className={cn("m-auto", headerText)}>{title}</div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="border-collapse">
                                    {isNaN(linecnt) && (
                                        <tr className="border border-solid border-gray-300">
                                            <td className="text-center">空表</td>
                                        </tr>
                                    )}
                                    {!isNaN(linecnt) &&
                                        new Array(linecnt).fill(null).map((_, i: number) => {
                                            const rowId = `${b}-${i}`
                                            const isMenuOpen = openMenuId === rowId
                                            const isActive =
                                                floatingHeader && floatingHeader.tableIndex === b && floatingHeader.rowIndex === i

                                            return (
                                                <tr
                                                    key={i}
                                                    className={cn(
                                                        `flex flex-wrap justify-around items-center cursor-pointer
                                                      ${isActive ? "bg-blue-50" : ""}`,
                                                        customClasses.rowWrapper,
                                                    )}
                                                    ref={(el) => rowRefs.current.set(rowId, el as HTMLDivElement)}
                                                    onClick={(e) => handleRowClick(e, i, b)}
                                                >
                                                    <td className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                                        {raft * i + b < membersum && (
                                                            <div className="flex flex-col items-start w-full justify-between h-auto p-0 text-left">
                                                                <div className="flex justify-between w-full">
                                    <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                                    <DropdownMenu
                                                                        open={isMenuOpen}
                                                                        onOpenChange={(open) => handleMenuOpenChange(open, rowId)}
                                                                    >
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 px-2 ml-auto"
                                                                                data-dropdown-trigger="true"
                                                                            >
                                                                                •••
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSeq(raft * i + b)
                                                                                    setOpenMenuId(null)
                                                                                    scrollToEditor() // 添加滚动到编辑器
                                                                                }}
                                                                            >
                                                                                修改
                                                                            </DropdownMenuItem>
                                                                            {!noDelAdd && (
                                                                                <>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => {
                                                                                            remove(raft * i + b)
                                                                                            setSeq(null)
                                                                                            setOpenMenuId(null)
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
                                                                                            setOpenMenuId(null)
                                                                                            scrollToEditor() // 添加滚动到编辑器
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
                                                                                        }}
                                                                                    >
                                                                                        移动到此
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                                    {config.map(([title, tag, width,_o,park]: any, k: number) => {
                                                                        return (
                                                                            <div
                                                                                key={k}
                                                                                className={cn(
                                                                                    `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal`,
                                                                                    customClasses.cellWrapper,
                                                                                )}
                                                                                style={{
                                                                                    flexBasis: `${width * stretchF[screenTp]}px`,
                                                                                    flexGrow: 1,
                                                                                    flexShrink: 1,
                                                                                }}
                                                                            >
                                                                                <div className={cn("m-auto", cellText)}>
                                                                                    { park
                                                                                            ? (tabledArr[i * raft + b]?.[park]?.[tag] ?? "")
                                                                                            : (tabledArr[i * raft + b]?.[tag] ?? "")
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )
                        })}
                    </div>
                </div>
            )
        },
        [
            table,
            raft,
            config,
            screenTp,
            stretchF,
            activeHeaderIndex,
            handleRowClick,
            handleMenuOpenChange,
            openMenuId,
            floatingHeader,
            closeFloatingHeader,
            headerText,
            rowText,
            cellText,
            rowNumberText,
            customClasses,
            scrollToEditor,
        ],
    )

    // 同样需要修改弹性布局模式下的表头处理
    // 在contentRendererFactory函数中，修改弹性布局部分
    // 将原来的移动表头代码替换为浮动表头

    // 在弹性布局模式下，添加浮动表头
    const renderFlexibleTable = React.useCallback(
        (form: any, arrays: Record<string, any>, linecnt: number) => {
            const tabledArr = form.watch?.(table) || []
            const membersum = tabledArr.length
            const { remove, move, insert } = arrays?.[table] || {}
            return (
                <div className={cn("relative", tableSeparation)}>
                    {/* 浮动表 */}
                    {floatingHeader && floatingHeader.visible && (
                        <div
                            className={cn(
                                "absolute left-0 right-0 bg-ghostwhite z-[1] border-b shadow-md bg-white",
                                customClasses.headerWrapper,
                            )}
                            style={{
                                top: `${floatingHeader.top}px`,
                            }}
                        >
                            <div className={cn("flex justify-around items-center", tableSeparation)}>
                                {new Array(raft).fill(null).map((_, b: number) => {
                                    return (
                                        <div
                                            key={b}
                                            className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left font-bold"
                                            style={{ width: `calc(${100 / raft}%)` }}
                                        >
                                            <div className="flex w-full justify-between items-center">
                                                <span className={"text-sm"}>{b + 1}</span>
                                                <button className="text-gray-500 hover:text-gray-700" onClick={closeFloatingHeader}>
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="flex w-full flex-wrap justify-between items-center">
                                                {config.map(([title, tag, width]: any, k: number) => {
                                                    return (
                                                        <div
                                                            key={k}
                                                            className={cn(
                                                                "overflow-anywhere whitespace-normal leading-tight px-2 mb-1",
                                                                headerText,
                                                            )}
                                                            style={{ minWidth: "auto" }}
                                                        >
                                                            {spliteor(k)}
                                                            {title}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 原始表头 - 保持不动 */}
                    <div className={cn("bg-ghostwhite z-10", customClasses.headerWrapper)}>
                        <div
                            ref={(el) => headerRefs.current.set(0, el)}
                            className={cn("flex justify-around items-center", tableSeparation)}
                        >
                            {new Array(raft).fill(null).map((_, b: number) => {
                                return (
                                    <div
                                        key={b}
                                        className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left font-bold"
                                        style={{ width: `calc(${100 / raft}%)` }}
                                    >
                                        <span className={"text-sm"}>{b + 1}</span>
                                        <div className="flex w-full flex-wrap justify-between items-center">
                                            {config.map(([title, tag, width]: any, k: number) => {
                                                return (
                                                    <div
                                                        key={k}
                                                        className={cn(
                                                            "overflow-anywhere whitespace-normal leading-tight px-2 mb-1",
                                                            headerText,
                                                        )}
                                                        style={{ minWidth: "auto" }}
                                                    >
                                                        {spliteor(k)}
                                                        {title}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 数据行 */}
                    {!isNaN(linecnt) &&
                        new Array(linecnt).fill(null).map((_, i: number) => {
                            const rowId = `row-${i}`
                            const isActive = floatingHeader && floatingHeader.rowIndex === i
                            const excludeFix = fixColumn !== undefined && fixColumn > 0

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        `flex  justify-around items-center cursor-pointer
                                                ${isActive ? "bg-blue-50" : ""}`,
                                        customClasses.rowWrapper,
                                        tableSeparation,
                                    )}
                                    ref={(el) => rowRefs.current.set(i, el as HTMLDivElement)}
                                    onClick={(e) => {
                                        // 如果点击的是菜单触发器，不执行任何操作
                                        if ((e.target as HTMLElement).closest('[data-dropdown-trigger="true"]')) {
                                            return
                                        }
                                        // 设置当前活动行
                                        setActiveHeaderIndex(i)
                                        // 获取点击的行元素
                                        const clickedRow = rowRefs.current.get(i)
                                        const frameRect = frameRef.current?.getBoundingClientRect() || { top: 0 }
                                        //实际ref是来自 原有的表格内容，而不是隐藏的！
                                        const header = headerRefs.current.get(0)
                                        if (clickedRow && header) {
                                            const rowRect = clickedRow.getBoundingClientRect()
                                            const headerRect = header.getBoundingClientRect()
                                            // 设置浮动表头
                                            setFloatingHeader({
                                                visible: true,
                                                top: rowRect.top - frameRect.top - headerRect.height - 6,
                                                tableIndex: 0, // 弹性布局模式下没有表格索引
                                                rowIndex: i,
                                            })
                                        }
                                    }}
                                >
                                    {/* 数据行内容 */}
                                    {new Array(raft).fill(null).map((__: any, b: number) => {
                                        const a = tabledArr[raft * i + b]
                                        const cellMenuId = `${rowId}-${b}`
                                        const isCellMenuOpen = openMenuId === cellMenuId

                                        return (
                                            <div
                                                key={b}
                                                className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left"
                                                style={{ width: `calc(${100 / raft}%)` }}
                                            >
                                                {raft * i + b < membersum && (
                                                    <>
                                                        <div className="flex justify-between w-full">
                              <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                            <DropdownMenu
                                                                open={isCellMenuOpen}
                                                                onOpenChange={(open) => handleMenuOpenChange(open, cellMenuId)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 ml-auto"
                                                                        data-dropdown-trigger="true"
                                                                    >
                                                                        •••
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSeq(raft * i + b)
                                                                            setOpenMenuId(null)
                                                                            scrollToEditor() // 添加滚动到编辑器
                                                                        }}
                                                                    >
                                                                        修改
                                                                    </DropdownMenuItem>
                                                                    {!noDelAdd && (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    remove(raft * i + b)
                                                                                    setSeq(null)
                                                                                    setOpenMenuId(null)
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
                                                                                    setOpenMenuId(null)
                                                                                    scrollToEditor() // 添加滚动到编辑器
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
                                                                                }}
                                                                            >
                                                                                移动到此
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="flex w-full flex-wrap justify-between items-center">
                                                            {config.map(([title, tag, width, _, park]: any, k: number) => {
                                                                return (
                                                                    <div
                                                                        key={k}
                                                                        className={cn(
                                                                            "overflow-anywhere whitespace-normal px-2 mb-1",
                                                                            rowText,
                                                                        )}
                                                                        style={{ minWidth: "auto" }}
                                                                    >
                                                                        {spliteor(k) +
                                                                            (excludeFix && k < fixColumn!
                                                                                ? park
                                                                                    ? defaultV[raft * i + b]?.[park]?.[tag]
                                                                                    : defaultV[raft * i + b]?.[tag]
                                                                                : park
                                                                                    ? (a?.[park]?.[tag] ?? "")
                                                                                    : (a?.[tag] ?? ""))}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                </div>
            )
        },
        [
            table,
            raft,
            config,
            floatingHeader,
            closeFloatingHeader,
            activeHeaderIndex,
            openMenuId,
            handleMenuOpenChange,
            defaultV,
            fixColumn,
            headerText,
            rowText,
            rowNumberText,
            customClasses,
            tableSeparation,
            scrollToEditor,
        ],
    )

    const [fixedColWState, setFixedColWState] = React.useState<boolean>(defFixedLay ?? false)

    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const tabledArr = form.watch?.(table) || []
            const linecnt = Math.ceil(tabledArr.length / raft)

            // 使用 useCallback 包装 setFixedColW 函数，避免不必要的重新创建
            const toggleFixedColW = React.useCallback((e: React.MouseEvent) => {
                e.preventDefault()
                setActiveHeaderIndex(null)
                setSelectedRaft(null)
                setFixedColWState((prev) => !prev)
            }, [])

            const clearTable = React.useCallback(
                (e) => {
                    //useform:实际也是中间过渡状态? 未牵涉到保存到后端， 没有考虑排除固定字段？
                    //     let fxkeys={} as any;       //配置里面前面几列的固定不修改的字段key名; 转为对象化形式的{key1:, key2:, ...}；
                    //     for(let k=0;k<fixColumn!;k++){
                    //         const field=config[k][1];
                    //         fxkeys[field]=undefined;        //排除字段。
                    //     }
                    //     const excludeAft=defaultV?.map(defObj=>{
                    //         const newobj = Object.keys(defObj).reduce((object : any, key) => {
                    //             if(! (key in fxkeys)) {
                    //                 object[key] =defObj[key];
                    //             }
                    //             return object;
                    //         }, {})
                    //         return newobj;
                    //     });
                    //     setInp({ ...inp, [table]: excludeAft})
                    form.setValue(table, defaultV ?? [])
                    e.preventDefault()
                },
                [defaultV, form, table],
            )

            const renderContent = () => {
                return fixedColWState
                    ? //定长折叠 模式下的布局:
                    renderCollapsibleTable(form, arrays!, linecnt)
                    : //弹性布局模式:
                    renderFlexibleTable(form, arrays!, linecnt)
            }
            //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
            const excludeFix = defaultV && fixColumn! >= 1 && noDelAdd && !saveFixC
            return (
                <div>
                    {headview}
                    <div className="flex items-center mb-4">
                        <Button variant="outline" onClick={toggleFixedColW}>
                            {fixedColWState ? `弹性布局` : `定长折叠`}
                        </Button>
                        <span className="ml-2">按每行{excludeFix ? config.length - fixColumn! : config.length}列为一组录入</span>
                        <Button variant="outline" className="ml-auto" onClick={clearTable}>
                            清空全表至默认
                        </Button>
                    </div>
                    <hr className="my-2" />
                    <div ref={frameRef}>{renderContent()}</div>
                    <div className={cn("flex justify-center", "flex")} ref={editorRef}>
                        {editor(form, arrays)}
                    </div>
                    {tailview}
                </div>
            )
        },
        [
            activeHeaderIndex,
            raft,
            openMenuId,
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
        ],
    )

    return [contentRendererFactory]
}
