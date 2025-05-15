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
import { Check, X, Undo,EyeClosed } from "lucide-react"
import {useTableEditor} from "@/report/hook/use-table-editor";

export type Each_ZdSetting = [
  n1: string, //字段标题名
  f2: string, //数据库标签
  l3: number, //定长布局的像素宽度
  extend?: any, //扩充配置解析对象： 编辑器的: { t:编辑框类别, u:单位, l：预定的列表数组, s输入框行大小 }}
  park?: string, //对于比如svp{},pa{}的嵌套字段的编辑直接支持，直接保存为嵌套的对象字段；只能支持1层的嵌套对象： 对于Row.{m. sgm {name,username}}无法支持的。
]

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
  // 添加自定义确认回调
  onConfirm?: (form: UseFormReturn<any, any, any>) => void
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
                             }: TableEditProps & {
  externalData?: any | null
  onExternalDataChange?: ((data: any) => void) | null
  onConfirm?: ((form: UseFormReturn<any, any, any>) => void) | null
}) {
  const {
        frameRef,
        fixedColWState,
        toggleFixedColW,
        clearTable,
        editor,
        renderTable,
        spliteor,
        handleAddNewRecord,
        wrapTableOperations,
        showEditorAtRowFn,
        handleCloseEditor,
        handleConfirmEdit,
        handleCancel,
        handleTableOperation,
        localTableData
    }=useTableEditor({config,
      table,
      headview,
      tailview,
      defaultV,
      noDelAdd,
      fixColumn,
      editAs,
      maxRf,
      stretchF,
      defFixedLay,
      onlyLay,
      styleConfig, // 默认为空对象
      externalData, // 添加外部数据源参数
      onExternalDataChange, // 添加外部数据变更回调，改成onConfirm
      onConfirm});

  // 添加一个状态来跟踪当前编辑的行是否是新插入的行
  const [isEditingNewRow, setIsEditingNewRow] = React.useState(false)

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

  //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
  const [seq, setSeq] = React.useState<number | null>(null)
  const [selectedRaft, setSelectedRaft] = React.useState<number | null>(null)
  //定长折叠形态才需要区分表格raft的位置；
  const [activeHeaderIndex, setActiveHeaderIndex] = React.useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
  const { innerHeight } = useWindowSize()
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

  // 在 useTableEdit 函数内部，添加以下状态和 ref
  const [editorPosition, setEditorPosition] = React.useState<{
    top: number
    left: number
    position?: "above" | "below" | "center"
    width?: number
    height?: number
  } | null>(null)
  const [showEditorPortal, setShowEditorPortal] = React.useState(false)
  const portalContainerRef = React.useRef<HTMLDivElement | null>(null)

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


  // 2. 添加一个 useEffect 来初始化本地数据和在关键操作后更新它【没有用到？】实际用contentRendererFactory传递的(form)=>
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

  // 添加一个函数来更新本地数据状态，用于处理各种表格操作后的状态更新
  const syncFormToLocalData = React.useCallback(() => {
    // 使用 setTimeout 避免在渲染周期中修改状态
  }, [table, onExternalDataChange])


  // 在renderCollapsibleTable函数中添加浮动表头组件
  const renderCollapsibleTable = React.useCallback(
      (form: UseFormReturn<any, any, any> | null, arrays: Record<string, any>, linecnt: number) => {
        // 4. 修改 renderCollapsibleTable 函数中获取数据的方式
        // 使用本地数据而不是 form.watch
        const membersum = localTableData.length
        const { remove, move, insert } = arrays?.[table] || {}
        const excludeFix = fixColumn !== undefined && fixColumn > 0
        // 其余代码保持不变...
        // 但要确保所有使用 tabledArr[i] 的地方改为 localTableData[i]
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
                {/* 原有的表格内容 raft:表示拆分raft个小表表格水平方向上并排布局的情况 */}
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

                              // 检查是否有任何菜单项可用
                              const hasMenuItems = !noDelAdd
                              return (
                                  //行数据编辑器需要跟随这一个tr元素定位
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
                                              <div className="flex items-center gap-1">
                                                {/* 直接的修改按钮 */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      showEditorAtRowFn(i, b, "edit", form)
                                                      e.preventDefault()
                                                    }}
                                                >
                                                  修改
                                                </Button>

                                                {/* 只有在有菜单项时才显示下拉菜单 */}
                                                {hasMenuItems && (
                                                    <DropdownMenu
                                                        open={isMenuOpen}
                                                        modal={false}
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
                                                      <DropdownMenuContent
                                                          onCloseAutoFocus={(e) => {
                                                            e.preventDefault()
                                                          }}
                                                      >
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                              remove(raft * i + b)
                                                              setSeq(null)
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
                                                              setOpenMenuId(null)
                                                              handleTableOperation("insert", { index: raft * i + b, data: template })

                                                              // 使用相同的 showEditorAtRowFn 函数，但传递 'insert' 模式
                                                              showEditorAtRowFn(i, b, "insert", form)
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
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                              {config.map(([title, tag, width, _o, park]: any, k: number) => {
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
                                                        {excludeFix && k < fixColumn!
                                                            ? park
                                                                ? defaultV![i * raft + b]?.[park]?.[tag]
                                                                : defaultV![i * raft + b]?.[tag]
                                                            : park
                                                                ? (localTableData[i * raft + b]?.[park]?.[tag] ?? "")
                                                                : (localTableData[i * raft + b]?.[tag] ?? "")}
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
        localTableData,
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
        handleTableOperation,
        showEditorAtRowFn,
        noDelAdd,
      ],
  )

  // 同样需要修改弹性布局模式下的表头处理
  // 在contentRendererFactory函数中，修改弹性布局部分
  // 将原来的移动表头代码替换为浮动表头

  // 在弹性布局模式下，添加浮动表头
  const renderFlexibleTable = React.useCallback(
      (form: UseFormReturn<any, any, any> | null, arrays: Record<string, any>, linecnt: number) => {
        // 5. 同样修改 renderFlexibleTable 函数
        // 使用本地数据而不是 form.watch
        const membersum = localTableData.length
        const { remove, move, insert } = arrays?.[table] || {}
        const excludeFix = fixColumn !== undefined && fixColumn > 0
        // 但要确保所有使用 tabledArr[i] 的地方改为 localTableData[i]
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
                                          className={cn("overflow-anywhere whitespace-normal leading-tight px-2 mb-1", headerText)}
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
                                      className={cn("overflow-anywhere whitespace-normal leading-tight px-2 mb-1", headerText)}
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
                    return (
                        //行数据编辑器需要跟随这一个div元素定位
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
                                  top: rowRect.top - frameRect.top - headerRect.height - 10,
                                  tableIndex: 0, // 弹性布局模式下没有表格索引
                                  rowIndex: i,
                                })
                              }
                            }}
                        >
                          {/*数据行内容  raft: 表示拆分表格水平方向上并排布局的，弹性布局实际上就是一个行上面多栏目(raft个数据行)并排的布局*/}
                          {new Array(raft).fill(null).map((__: any, b: number) => {
                            const dbrow = localTableData[raft * i + b]
                            const cellMenuId = `${rowId}-${b}`
                            const isCellMenuOpen = openMenuId === cellMenuId

                            // 检查是否有任何菜单项可用
                            const hasMenuItems = !noDelAdd

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
                                          <div className="flex items-center gap-1">
                                            {/* 直接的修改按钮 */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  showEditorAtRowFn(i, b, "edit", form)
                                                  e.preventDefault()
                                                }}
                                            >
                                              修改
                                            </Button>

                                            {/* 只有在有菜单项时才显示下拉菜单 */}
                                            {hasMenuItems && (
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
                                                          remove(raft * i + b)
                                                          setSeq(null)
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
                                                          setOpenMenuId(null)
                                                          handleTableOperation("insert", { index: raft * i + b, data: template })

                                                          // 使用相同的 showEditorAtRowFn 函数，但传递 'insert' 模式
                                                          showEditorAtRowFn(i, b, "insert", form)
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
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex w-full flex-wrap justify-between items-center">
                                          {config.map(([title, tag, width, _, park]: any, k: number) => {
                                            return (
                                                <div
                                                    key={k}
                                                    className={cn("overflow-anywhere whitespace-normal px-2 mb-1", rowText)}
                                                    style={{ minWidth: "auto" }}
                                                >
                                                  {spliteor(k) +
                                                      ((excludeFix && k < fixColumn!
                                                          ? park
                                                              ? defaultV![raft * i + b]?.[park]?.[tag]
                                                              : defaultV![raft * i + b]?.[tag]
                                                          : park
                                                              ? (dbrow?.[park]?.[tag] ?? "")
                                                              : (dbrow?.[tag] ?? "")) ?? "")}
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
        localTableData,
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
        handleTableOperation,
        showEditorAtRowFn,
        noDelAdd,
      ],
  )

  // 修改 contentRendererFactory 函数，添加 portal 渲染
  const contentRendererFactory = React.useCallback(
      (form: UseFormReturn<any, any, any> | null, arrays?: Record<string, any>) => {
        // 获取包装后的操作函数
        const wrappedOps = arrays ? wrapTableOperations(arrays) : {}

        // 合并原始操作和包装后的操作
        const enhancedArrays = { ...arrays }
        if (enhancedArrays[table]) {
          enhancedArrays[table] = {
            ...enhancedArrays[table],
            ...wrappedOps,
          }
        }

        // 计算行数使用本地数据
        const linecnt = Math.ceil(localTableData.length / raft)

        // 其余代码与之前类似，但传递 enhancedArrays 替代 arrays

        const renderContent = () => {
          return fixedColWState
              ? renderCollapsibleTable(form, enhancedArrays!, linecnt)
              : renderFlexibleTable(form, enhancedArrays!, linecnt)
        }

        // 使用 useCallback 包装 setFixedColW 函数，避免不必要的重新创建
        const toggleFixedColW = React.useCallback((e: React.MouseEvent) => {
          e.preventDefault()
          setActiveHeaderIndex(null)
          setSelectedRaft(null)
          setFixedColWState((prev) => !prev)
        }, [])

        // 修改 clearTable 函数，同时更新本地状态
        const clearTable = React.useCallback(
            (e) => {
              form?.setValue(table, defaultV ?? [])
              // 更新本地状态
              handleTableOperation("clear", { defaultData: defaultV ?? [] })
              if (form && onConfirm) onConfirm(form)
              e.preventDefault()
            },
            [defaultV, form, table, handleTableOperation],
        )

        return (
            <div>
              {headview}
              <div className="flex items-center mb-4">
                <Button variant="outline" className={onlyLay ? "hidden" : ""} onClick={toggleFixedColW}>
                  {fixedColWState ? `弹性布局` : `定长折叠`}
                </Button>
                <span className="ml-2">
              按每行{defaultV && fixColumn! >= 1 && noDelAdd ? config.length - fixColumn! : config.length}
                  列为一组录入
            </span>
                <Button variant="outline" className="ml-auto" onClick={clearTable}>
                  清空全表至默认
                </Button>
              </div>
              <hr className="my-2" />
              <div ref={frameRef}>{renderContent()}</div>

              {/* 只在不使用 portal 时渲染底部编辑器 */}
              {!showEditorPortal && (
                  <div className={cn("flex justify-center", "flex")} ref={editorRef}>
                    {editor(form, enhancedArrays)}
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
                            top:
                                editorPosition.position === "above"
                                    ? `${editorPosition.top - (editorRef.current?.offsetHeight || 0)}px`
                                    : editorPosition.position === "center"
                                        ? `${editorPosition.top}px`
                                        : `${editorPosition.top}px`,
                            left: editorPosition.position === "center" ? `${editorPosition.left}px` : "0",
                            width: editorPosition.position === "center" ? `${editorPosition.width}px` : "100%",
                            maxWidth: editorPosition.position === "center" ? `${editorPosition.width}px` : "100%",
                            height: editorPosition.position === "center" ? `${editorPosition.height}px` : "auto",
                            maxHeight: editorPosition.position === "center" ? `${editorPosition.height}px` : "70vh",
                            zIndex: 100,
                            backgroundColor: "white",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                          className={"@container"}
                      >
                        {editor(form, enhancedArrays)}
                      </div>,
                      portalContainerRef.current,
                  )}

              {tailview}
            </div>
        )
      },
      [
        localTableData,
        wrapTableOperations,
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
      ],
  )

  return [contentRendererFactory]
}
