"use client"
import React, { useId, useState, useRef, useEffect, type ChangeEventHandler } from "react"
import { ChevronDown, ChevronRight, ChevronUp, X, Calendar, Type, List, Keyboard } from "lucide-react"
import type { ControllerRenderProps } from "react-hook-form"
import {
    autoUpdate,
    size,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
    FloatingFocusManager,
    FloatingPortal,
} from "@floating-ui/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTouchDevice } from "@/hooks/use-touch-device"

// Utility function for debouncing
const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

interface CollapsibleFormSectionProps {
    title: string
    defaultOpen?: boolean
    className?: string
    titleClassName?: string
    contentClassName?: string
    children: React.ReactNode
}

export function CollapsibleFormSection({
                                           title,
                                           defaultOpen = false,
                                           className,
                                           titleClassName,
                                           contentClassName,
                                           children,
                                       }: CollapsibleFormSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const isTouchDevice = useTouchDevice()

    const toggleOpen = () => setIsOpen(!isOpen)

    // 根据触摸设备和屏幕宽度设置不同的 padding 值
    const contentPadding = isTouchDevice
        ? "px-1 py-2 @md:pr-3 @md:py-4" // 触摸设备使用更大的右侧 padding
        : "px-1 py-2 @md:px-2 @md:py-4" // 非触摸设备使用标准 padding

    return (
        <div className={cn("border rounded-md overflow-hidden @container", className)}>
            <button
                type="button"
                onClick={toggleOpen}
                className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left font-medium bg-muted/50 hover:bg-muted transition-colors select-text",
                    titleClassName,
                )}
                aria-expanded={isOpen}
                aria-controls={`content-${title?.replace(/\s+/g, "-").toLowerCase()}`}
            >
                <span>{title}</span>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>
            <div
                id={`content-${title?.replace(/\s+/g, "-").toLowerCase()}`}
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isOpen ? "opacity-100" : "max-h-0 opacity-0",
                    contentClassName,
                )}
            >
                <div className={contentPadding}>
                    {children}

                    {/* 底部折叠按钮 - 仅在展开状态显示 */}
                    {isOpen && (
                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={toggleOpen}
                                className={cn(
                                    "flex items-center gap-1",
                                    isTouchDevice ? "mr-10" : "mr-8", // 触摸设备使用更大的右侧 margin
                                )}
                            >
                                <ChevronUp className="h-4 w-4" />
                                <span>收起</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface MemoDatesInputProps {
    id?: string
    value?: string
    onChange: (value?: string) => void
    rows?: number
    className?: string
    required?: boolean
    placeholder?: string
    dateInputWidth?: string | number
}

export function MemoDatesInput({
                                   id,
                                   value = "",
                                   onChange,
                                   rows = 1,
                                   className,
                                   required,
                                   placeholder,
                                   dateInputWidth = "10rem",
                                   ...other
                               }: MemoDatesInputProps) {
    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value || undefined)
    }

    // Handle date input change - append the date to existing text
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const newValue = (value || "") + " " + e.target.value
            onChange(newValue)
            // Reset the date input
            e.target.value = ""
        }
    }

    // Convert dateInputWidth to string with px if it's a number
    const dateWidth = typeof dateInputWidth === "number" ? `${dateInputWidth}px` : dateInputWidth

    return (
        <div
            className={cn(
                "@container w-full", // 设置容器查询上下文
                className,
            )}
            {...other}
        >
            <div className="flex flex-col @[500px]:flex-row gap-2 w-full">
                <Textarea
                    value={value}
                    onChange={handleTextChange}
                    rows={rows}
                    placeholder={placeholder}
                    required={required}
                    className={cn("min-w-0 w-full @[500px]:flex-1", "@[500px]:max-w-[calc(100%-var(--date-input-width)-0.5rem)]")}
                    style={
                        {
                            resize: "vertical",
                            "--date-input-width": dateWidth,
                        } as React.CSSProperties
                    }
                />
                <Input
                    type="date"
                    className="w-full @[500px]:w-auto @[500px]:flex-shrink-0"
                    style={{ width: dateWidth }}
                    onChange={handleDateChange}
                    aria-label="选择日期"
                />
            </div>
        </div>
    )
}

interface ItemProps {
    children: React.ReactNode
    active: boolean
    index: number
}

function Item({
                  children,
                  active,
                  index,
                  ref,
                  ...rest
              }: ItemProps & React.HTMLProps<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
    const id = useId()
    return (
        <div
            ref={ref}
            role="option"
            id={id}
            aria-selected={active}
            {...rest}
            className={cn("cursor-default p-2", active ? "bg-blue-200" : index % 2 === 0 ? "" : "bg-slate-100")}
        >
            {children}
        </div>
    )
}

interface BlobInputListProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value?: string
    /** List of suggestions to display */
    datalist?: string[]
    /** Additional className for the list container */
    listClassName?: string
    /**正常直接用 onChange，没必要使用onListChange
     * 在非useForm场合下的，函数类型问题 (value: any ) =>void
     */
    onChange?: ChangeEventHandler<HTMLTextAreaElement> // (value: string) => void
    /** Callback when the value changes */
    onListChange?: (value: string | undefined) => void
    unit?: any
}

/**支持多行输入的；  缺点：textarea无法记住用户的历史输入；没有清空按钮在手机上不方便。
 * 若是放入FormItem底下的情况：不要自行去设置id的，不一致；<FormItem会转换的。
 */
export function BlobInputList({
                                  value,
                                  className,
                                  datalist = [],
                                  placeholder,
                                  onListChange,
                                  onChange,
                                  listClassName,
                                  unit, autoComplete, rows=2,
                                  ...other
                              }: BlobInputListProps) {
    const ComInp=rows>1? "textarea" : "input";
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [isSmallHeight, setIsSmallHeight] = useState(false)
    const [isSelectMode, setIsSelectMode] = useState(false)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const listRef = useRef<Array<HTMLElement | null>>([])

    const { x, y, refs, strategy, context } = useFloating<HTMLTextAreaElement>({
        whileElementsMounted: autoUpdate,
        open,
        onOpenChange: setOpen,
        middleware: [
            size({
                apply({ rects, availableHeight, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${availableHeight}px`,
                    })
                },
                padding: 10,
            }),
        ],
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        useRole(context, { role: "listbox" }),
        useDismiss(context),
        useListNavigation(context, {
            listRef,
            activeIndex,
            onNavigate: setActiveIndex,
            virtual: true,
            loop: true,
        }),
    ])

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        // 同时调用两个回调函数
        if (onChange) {
            // @ts-ignore
            onChange(newValue)
        }
        if (onListChange) onListChange(newValue)
    }

    // 处理选择列表项
    const handleSelectItem = (item: string) => {
        setInputValue(item)
        // 同时调用两个回调函数
        if (onChange) {
            // @ts-ignore
            onChange(item)
        }
        if (onListChange) onListChange(item)
    }
    const filtItems = inputValue
        ? datalist.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
        : datalist
    const items = filtItems.length === 0 ? datalist : filtItems

    // 检测屏幕高度
    useEffect(() => {
        const checkScreenHeight = () => {
            const height = window.innerHeight
            const isSmall = height < 600
            setIsSmallHeight(isSmall)
        }

        checkScreenHeight()
        window.addEventListener("resize", checkScreenHeight)
        window.addEventListener("orientationchange", checkScreenHeight)

        return () => {
            window.removeEventListener("resize", checkScreenHeight)
            window.removeEventListener("orientationchange", checkScreenHeight)
        }
    }, [isSelectMode])

    return (
        <div className="w-full inline-flex items-center">
            {isSmallHeight ? (
                // 小屏幕高度模式：使用按钮切换
                <div className="w-full relative">
                    {isSelectMode ? (
                        <div className="relative flex-1">
                            <Select
                                value={inputValue || ""}
                                onValueChange={(value) => {
                                    setInputValue(value)
                                    if (onChange) {
                                        // @ts-ignore
                                        onChange(value)
                                    }
                                    if (onListChange) onListChange(value)
                                }}
                            >
                                <SelectTrigger className="w-full pr-20">
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.length > 0 ? (
                                        items.map((item, index) => (
                                            <SelectItem key={index} value={item}>
                                                {item}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="" disabled>
                                            暂无选项
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {/* 控制按钮组 */}
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsSelectMode(false)}
                                    className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                                    aria-label="切换到输入模式"
                                    title="切换到输入模式"
                                >
                                    <Type size={16} className="text-muted-foreground" />
                                </button>
                                {inputValue && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputValue("")
                                            if (onChange) {
                                                // @ts-ignore
                                                onChange("")
                                            }
                                            if (onListChange) onListChange("")
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                                        aria-label="清除内容"
                                        title="清除内容"
                                    >
                                        <X size={16} className="text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        // 输入模式：使用 textarea
                        <div className="relative w-full">
              <ComInp
                  className={cn(
                      "w-full rounded-md border border-input bg-background resize-vertical overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:border-input pr-20",
                      className,
                  )}
                  {...other}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  autoComplete={autoComplete ?? "on"}
              />
                            {/* 控制按钮组 */}
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                                {/* 切换到选择模式按钮 */}
                                <button
                                    type="button"
                                    onClick={() => setIsSelectMode(true)}
                                    className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                                    aria-label="切换到选择模式"
                                    title="切换到选择模式"
                                >
                                    <List size={16} className="text-muted-foreground" />
                                </button>
                                {/* 清除按钮 */}
                                {inputValue && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInputValue("")
                                            if (onChange) {
                                                // @ts-ignore
                                                onChange("")
                                            }
                                            if (onListChange) onListChange("")
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                                        aria-label="清除内容"
                                        title="清除内容"
                                    >
                                        <X size={16} className="text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {unit}
                </div>
            ) : (
                // 原有的 Floating UI 模式（屏幕高度 >= 600px）
                <>
          <ComInp
              className={cn(
                  "w-full rounded-md border border-input bg-background resize-vertical overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                  className,
              )}
              {...other}
              {...getReferenceProps({
                  ref: refs.setReference,
                  onChange: handleInputChange,
                  value: inputValue,
                  placeholder: placeholder,
                  "aria-autocomplete": "list",
                  onKeyDown(event) {
                      if (event.key === "Enter" && activeIndex != null && items[activeIndex]) {
                          event.preventDefault()
                          setInputValue(items[activeIndex])
                          if (onListChange) {
                              onListChange(items[activeIndex])
                          }
                          setActiveIndex(null)
                          setOpen(false)
                      }
                  },
                  onPointerDown() {
                      setOpen(true)
                  },
              })}
              autoComplete={autoComplete ?? "on"}
          />
                    {unit}
                    <FloatingPortal>
                        {open && items.length > 0 && (
                            <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
                                <div
                                    {...getFloatingProps({
                                        ref: refs.setFloating,
                                        className: cn(
                                            "z-50 bg-white border border-slate-200 shadow-md rounded-md overflow-y-auto",
                                            listClassName,
                                        ),
                                        style: {
                                            position: strategy,
                                            left: x ?? 0,
                                            top: y ?? 0,
                                        },
                                    })}
                                >
                                    {items.map((item, index) => (
                                        <Item
                                            key={item}
                                            index={index}
                                            {...getItemProps({
                                                ref(node) {
                                                    listRef.current[index] = node
                                                },
                                                onClick() {
                                                    handleSelectItem(item)
                                                    setOpen(false)
                                                },
                                            })}
                                            active={activeIndex === index}
                                        >
                                            {item}
                                        </Item>
                                    ))}
                                </div>
                            </FloatingFocusManager>
                        )}
                    </FloatingPortal>
                </>
            )}
        </div>
    )
}

interface SuffixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** 是否全宽 */
    fullWidth?: boolean
    /** 单位显示内容 */
    unit: any
}
export function SuffixInput({ fullWidth = true, className, style, value, onChange, unit, ...other }: SuffixInputProps) {
    //确保unit不是函数
    const unitDisplay = typeof unit === "function" ? "" : unit
    return (
        <div className={cn("text-left inline-flex items-center gap-0.5", fullWidth ? "w-full" : "w-auto")} style={style}>
            <input
                className={cn(
                    "rounded-md border border-input bg-background flex-1 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                    className,
                )}
                value={value || ""}
                onChange={onChange}
                {...other}
            />
            <div className="whitespace-nowrap flex-shrink-0">{unitDisplay}</div>
        </div>
    )
}

interface MemoDateInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    /** Current date value */
    value?: string
    /** Callback when date changes */
    onChange: (value: string | undefined) => void
    /** Width of the text input */
    width?: string
    /** Number of rows for the text input */
    rows?: number
}

export function MemoDateInput({
                                  id,
                                  className,
                                  style,
                                  onChange,
                                  value = "",
                                  width = "10.7rem",
                                  rows = 1,
                                  ...other
                              }: MemoDateInputProps) {
    // 日期验证函数（增强版）
    const isValidDate = (dateStr: string): boolean => {
        if (!dateStr) return false
        const date = new Date(dateStr)
        return !isNaN(date.getTime()) && dateStr === date.toISOString().split("T")[0]
    }
    const [textValue, setTextValue] = useState(value)
    const [isDateMode, setIsDateMode] = useState(() => !value || isValidDate(value))
    // 同步外部 value 变化
    useEffect(() => {
        const isValueValid = isValidDate(value)
        setIsDateMode(!value || isValueValid)
        setTextValue(value)
    }, [value])
    // 文本输入变化处理
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setTextValue(newValue)
        onChange(newValue || undefined)
    }

    // 日期输入变化处理
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setTextValue(newValue)
        onChange(newValue || undefined)
    }
    // 切换模式时重置文本输入框
    const toggleInputMode = () => {
        setIsDateMode(!isDateMode)
        setTextValue(value) // 切换时同步最新值
    }

    return (
        <div className={cn("flex flex-wrap items-start relative", className)} style={style}>
            {isDateMode ? (
                <input
                    id={id}
                    type="date"
                    value={isDateMode && isValidDate(value) ? value : ""} // 关键修改：过滤非法值
                    onChange={handleDateChange}
                    className="rounded-l-md border border-r-0 border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    style={{ width }}
                    aria-label="Date picker"
                />
            ) : (
                <textarea
                    id={id}
                    value={textValue}
                    onChange={handleTextChange}
                    rows={rows}
                    className="rounded-l-md border border-r-0 border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-none"
                    style={{ width }}
                    {...other}
                />
            )}

            <button
                type="button"
                onClick={toggleInputMode}
                className="flex items-center justify-center border border-input bg-background h-full min-h-[38px] w-10 px-1 hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                aria-label={isDateMode ? "Switch to text input" : "Switch to date picker"}
            >
                {isDateMode ? <Type size={16} /> : <Calendar size={16} />}
            </button>
        </div>
    )
}

export function ClearableSelect({
                                    field,
                                    options,
                                    placeholder = "",
                                    onClear,
                                    id,
                                    className,
                                    value,
                                }: {
    field: any
    options: { value: string; label?: any }[]
    placeholder?: string
    onClear: () => void
    id?: string
    className?: string
    //允许外部控制传值，手动同步
    value?: any
}) {
    // 检查是否有选定的值
    const newValue = value === undefined ? field.value || "" : value
    const hasValue = !!field.value
    return (
        <div className={`relative w-full ${className || ""}`}>
            <Select {...field} onValueChange={field.onChange} value={newValue}>
                <SelectTrigger
                    id={id}
                    className="w-full pr-8"
                    style={{
                        fontSize: "inherit",
                    }}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label ?? option.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 清除按钮 - 仅在有值时显示 */}
            {hasValue && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation() // 阻止事件冒泡到 SelectTrigger
                        onClear()
                    }}
                    className="absolute right-8 top-0 h-full flex items-center pr-2"
                    aria-label="清除选择"
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
            )}
        </div>
    )
}

interface FormSelectFieldProps {
    field: ControllerRenderProps<any, any>
    label: any
    //选择取值value只能是 字符串 类型！
    options: { value: string; label?: any }[]
    className?: string
    selectClass?: string
    value?: any
}

export function FormSelectField({ field, label, options, className, selectClass, value }: FormSelectFieldProps) {
    const id = useId() + "-" + field.name // 使用 field.name 生成唯一ID
    return (
        <FormItem className={`pt-2 w-full break-inside-avoid ${className || ""}`}>
            <FormLabel htmlFor={id} className="select-text">
                {label}
            </FormLabel>
            <FormControl>
                <ClearableSelect
                    id={id}
                    field={field}
                    value={value}
                    options={options}
                    onClear={() => field.onChange("")}
                    className={`${selectClass || ""}`}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}

export function CommonSelect({
                                 options,
                                 placeholder = "",
                                 onClear,
                                 id,
                                 className,
                                 value,
                                 onValueChange,
                             }: {
    options: { value: string; label?: any }[]
    placeholder?: string
    onClear: () => void
    id?: string
    className?: string
    value?: any
    //特殊：不是传递e:event;直接传递已经选取值。
    onValueChange?: (value: any) => void
}) {
    // const uId = useId()    防止报错，加 name={id}
    const hasValue = !!value
    return (
        <div className={`relative w-full ${className || ""}`}>
            <Select onValueChange={onValueChange} name={id} value={hasValue ? value : ""}>
                <SelectTrigger className="w-full pr-8" style={{ fontSize: "inherit" }}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label ?? option.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hasValue && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClear()
                    }}
                    className="absolute right-8 top-0 h-full flex items-center pr-2"
                    aria-label="清除选择"
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
            )}
        </div>
    )
}

// 基础接口定义
interface BaseInputDatalistProps {
    /** Whether the input should take full width */
    fullWidth?: boolean
    /** List of suggestions to display */
    datalist?: string[]
    /** Callback when the value changes */
    onListChange?: (value: string) => void
    unit?: any
    /** Current value */
    value?: string | number
    /** Change handler */
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    /** Input ID */
    id?: string
    /** Custom className */
    className?: string
    /** Custom style */
    style?: React.CSSProperties
    /** Placeholder text */
    placeholder?: string
    /** Whether input is required */
    required?: boolean
    /** Whether input is disabled */
    disabled?: boolean
}

// 桌面端组件 - 使用原生 datalist; 但不能支持rows>1多行录入框的。因为datalist不配合textarea啊。
function DesktopInputDatalist({
                                  fullWidth = true,
                                  datalist = [],
                                  className,
                                  style,
                                  onListChange,
                                  value,
                                  onChange,
                                  id, rows,
                                  unit, autoComplete, listClassName,
                                  ...other
                              }: BaseInputDatalistProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof BaseInputDatalistProps>) {
    const [inputValue, setInputValue] = useState(String(value || ""))
    const [showClearButton, setShowClearButton] = useState(Boolean(value && String(value).length > 0))

    const uid = id || useId()
    const listId = `desktop-list-${uid}`

    // 同步外部值变化
    useEffect(() => {
        setInputValue(String(value || ""))
        setShowClearButton(Boolean(value && String(value).length > 0))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        setShowClearButton(newValue !== "")

        if (onChange) {
            onChange(e)
        }
        if (onListChange) {
            onListChange(newValue)
        }
    }

    const handleClear = () => {
        setInputValue("")
        setShowClearButton(false)
        if (onListChange) {
            onListChange("")
        }
        if (onChange) {
            const event = {
                target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>
            onChange(event)
        }
    }

    return (
        <div className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")} style={style}>
            <datalist id={listId} className={listClassName}>
                {datalist.map((option, i) => (
                    <option key={i} value={option} />
                ))}
            </datalist>

            <div className="relative flex-1">
                <input
                    className={cn(
                        "min-h-8 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input w-full",
                        showClearButton ? "pr-8" : "pr-2",
                        className,
                    )}
                    value={inputValue}
                    onChange={handleChange}
                    list={listId}
                    id={id}
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    {...other}
                    autoComplete={autoComplete ?? "on"}
                    rows={rows}
                />

                {/* 清除按钮 */}
                {showClearButton && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="清除输入"
                    >
                        <X size={14} className="text-gray-500" />
                    </button>
                )}
            </div>

            {unit}
        </div>
    )
}

// 移动端组件 - 使用 Floating UI
function MobileInputDatalist({
                                 fullWidth = true,
                                 datalist = [],
                                 className,
                                 style,
                                 onListChange,
                                 value,
                                 onChange,
                                 id,
                                 unit, autoComplete,listClassName,
                                 ...other
                             }: BaseInputDatalistProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof BaseInputDatalistProps>) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const listRef = useRef<Array<HTMLElement | null>>([])

    const { x, y, refs, strategy, context } = useFloating<HTMLTextAreaElement>({
        whileElementsMounted: autoUpdate,
        open,
        onOpenChange: setOpen,
        middleware: [
            size({
                apply({ rects, availableHeight, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${availableHeight}px`,
                    })
                },
                padding: 10,
            }),
        ],
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        useRole(context, { role: "listbox" }),
        useDismiss(context),
        useListNavigation(context, {
            listRef,
            activeIndex,
            onNavigate: setActiveIndex,
            virtual: true,
            loop: true,
        }),
    ])

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        // 同时调用两个回调函数
        if (onChange) {
            // @ts-ignore
            onChange(newValue)
        }
        if (onListChange) onListChange(newValue)
    }

    // 处理选择列表项
    const handleSelectItem = (item: string) => {
        setInputValue(item)
        // 同时调用两个回调函数
        if (onChange) {
            // @ts-ignore
            onChange(item)
        }
        if (onListChange) onListChange(item)
    }

    const items = inputValue ? datalist.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase())) : datalist

    return (
        <div className="w-full inline-flex items-center">
      <textarea
          className={cn(
              "w-full rounded-md border border-input bg-background resize-vertical overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
              className,
          )}
          id={id}
          {...other}
          {...getReferenceProps({
              ref: refs.setReference,
              onChange: handleInputChange,
              value: inputValue,
              "aria-autocomplete": "list",
              onKeyDown(event) {
                  if (event.key === "Enter" && activeIndex != null && items[activeIndex]) {
                      event.preventDefault()
                      setInputValue(items[activeIndex])
                      if (onListChange) {
                          onListChange(items[activeIndex])
                      }
                      setActiveIndex(null)
                      setOpen(false)
                  }
              },
              onPointerDown() {
                  setOpen(true)
              },
          })}
          autoComplete={autoComplete ?? "on"}
      />
            {unit}
            <FloatingPortal>
                {open && items.length > 0 && (
                    <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
                        <div
                            {...getFloatingProps({
                                ref: refs.setFloating,
                                className: cn(
                                    "z-50 bg-white border border-slate-200 shadow-md rounded-md overflow-y-auto",
                                    listClassName,
                                ),
                                style: {
                                    position: strategy,
                                    left: x ?? 0,
                                    top: y ?? 0,
                                },
                            })}
                        >
                            {items.map((item, index) => (
                                <Item
                                    key={item}
                                    index={index}
                                    {...getItemProps({
                                        ref(node) {
                                            listRef.current[index] = node
                                        },
                                        onClick() {
                                            handleSelectItem(item)
                                            setOpen(false)
                                        },
                                    })}
                                    active={activeIndex === index}
                                >
                                    {item}
                                </Item>
                            ))}
                        </div>
                    </FloatingFocusManager>
                )}
            </FloatingPortal>
        </div>
    )
}

// 主组件 - 智能切换器
interface InputDatalistProps
    extends BaseInputDatalistProps,
        Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof BaseInputDatalistProps> {}

export function InputDatalist(props: InputDatalistProps) {
    const [isMobile, setIsMobile] = useState(false)

    // 检测设备类型
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
            const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
            const isSmallScreen = window.innerWidth <= 768

            // 综合判断：移动设备 或 触摸设备 或 小屏幕
            setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen))
        }

        checkMobile()

        // 监听窗口大小变化
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // 根据设备类型渲染不同的组件
    if (isMobile) {
        return <MobileInputDatalist {...props} />
    } else {
        return <DesktopInputDatalist {...props} />
    }
}

// 新增：混合输入选择组件
interface HybridInputSelectProps {
    /** 当前值 */
    value?: string
    /** 值变化回调 */
    onChange?: (value: string) => void
    /** 预定义选项列表 */
    options?: string[]
    /** 原生datalist选项（用于扩充功能） */
    datalist?: string[]
    /** 占位符文本 */
    placeholder?: string
    /** 输入框行数（多行模式） */
    rows?: number
    /** 单位显示 */
    unit?: React.ReactNode
    /** 是否全宽 */
    fullWidth?: boolean
    /** 自定义样式类名 */
    className?: string
    /** 输入框样式类名 */
    inputClassName?: string
    /** 列表容器样式类名 */
    listClassName?: string
    /** 是否必填 */
    required?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 输入框ID */
    id?: string
    /** 默认模式：'input' | 'select' */
    defaultMode?: "input" | "select"
}

export function HybridInputSelect({
                                      value = "",
                                      onChange,
                                      options = [],
                                      datalist = [],
                                      placeholder = "",
                                      unit,
                                      fullWidth = true,
                                      className,
                                      inputClassName,
                                      listClassName,
                                      required,
                                      disabled,
                                      id,
                                      defaultMode = "select",
                                      rows=1,
                                      ...other
                                  }: HybridInputSelectProps) {
    const CompInp = rows>1 ? "textarea" : "input";
    const [inputValue, setInputValue] = useState(value)
    const [isInputMode, setIsInputMode] = useState(defaultMode === "input")
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const listRef = useRef<Array<HTMLElement | null>>([])
    const uid = id || useId()
    const listId = `hybrid-list-${uid}`

    // 合并所有选项（预定义选项 + datalist）
    const allOptions = [...new Set([...options, ...datalist])]

    // 检测移动设备
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase()
            const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
            const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
            setIsMobile(isMobileDevice || isTouchDevice)
        }
        checkMobile()
    }, [])

    // 同步外部值变化
    useEffect(() => {
        setInputValue(value)
    }, [value])

    // Floating UI 设置
    const { x, y, refs, strategy, context } = useFloating<HTMLTextAreaElement>({
        whileElementsMounted: autoUpdate,
        open: isOpen && !isInputMode,
        onOpenChange: setIsOpen,
        middleware: [
            size({
                apply({ rects, availableHeight, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${Math.min(availableHeight, 200)}px`,
                    })
                },
                padding: 10,
            }),
        ],
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        useRole(context, { role: "listbox" }),
        useDismiss(context),
        useListNavigation(context, {
            listRef,
            activeIndex,
            onNavigate: setActiveIndex,
            virtual: true,
            loop: true,
        }),
    ])

    // 过滤选项
    const filteredOptions = React.useMemo(() => {
        const opts =
            inputValue && !isInputMode
                ? allOptions.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
                : allOptions
        return opts.length <= 0 ? allOptions : opts
    }, [inputValue, isInputMode, allOptions])

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        if (onChange) {
            onChange(newValue)
        }
    }

    // 处理选项选择
    const handleSelectOption = (option: string) => {
        setInputValue(option)
        setIsOpen(false)
        setActiveIndex(null)
        if (onChange) {
            onChange(option)
        }
    }

    // 切换模式
    const toggleMode = () => {
        setIsInputMode(!isInputMode)
        setIsOpen(false)
        setActiveIndex(null)

        // 切换到输入模式时，延迟聚焦以避免键盘立即弹出
        if (!isInputMode && isMobile) {
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                }
            }, 100)
        }
    }

    // 清除内容
    const handleClear = () => {
        setInputValue("")
        setIsOpen(false)
        if (onChange) {
            onChange("")
        }
    }

    // 显示选项列表
    const handleShowOptions = () => {
        if (!isInputMode) {
            setIsOpen(true)
            setActiveIndex(null)
        }
    }

    // 键盘事件处理
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isInputMode && isOpen) {
            if (e.key === "Enter" && activeIndex !== null && filteredOptions[activeIndex]) {
                e.preventDefault()
                handleSelectOption(filteredOptions[activeIndex])
            } else if (e.key === "Escape") {
                setIsOpen(false)
                setActiveIndex(null)
            }
        }
    }

    return (
        <div className={cn("w-full", className)}>
            <div className={cn("text-left inline-flex items-start", fullWidth ? "w-full" : "w-auto")}>
                {/* 桌面端原生 datalist 支持 */}
                {!isMobile && (
                    <datalist id={listId}>
                        {allOptions.map((option, i) => (
                            <option key={i} value={option} />
                        ))}
                    </datalist>
                )}

                <div className="relative flex-1">
                    {isInputMode ? (
                        // 输入模式：多行文本输入
                        <CompInp
                            ref={textareaRef}
                            id={id}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            rows={rows}
                            placeholder={placeholder}
                            required={required}
                            disabled={disabled}
                            list={!isMobile ? listId : undefined}
                            className={cn(
                                "w-full rounded-md border border-input bg-background p-2 pr-20 resize-vertical focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                                inputClassName,
                            )}
                            // autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            {...other}
                        />
                    ) : (
                        // 选择模式：只读显示区域
                        <div
                            {...getReferenceProps({
                                ref: refs.setReference,
                                onClick: handleShowOptions,
                                className: cn(
                                    "w-full rounded-md border border-input bg-background p-2 pr-20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                                    inputClassName,
                                    inputValue ? "min-h-[3rem]" : "min-h-[1.5rem]",
                                ),
                                tabIndex: 0,
                                role: "combobox",
                                "aria-expanded": isOpen,
                                "aria-haspopup": "listbox",
                            })}
                        >
                            {inputValue ? (
                                <div className="whitespace-pre-wrap break-words">{inputValue}</div>
                            ) : (
                                <div className="text-muted-foreground">{placeholder}</div>
                            )}
                        </div>
                    )}

                    {/* 控制按钮组 */}
                    <div className="absolute right-2 top-[-0.5rem] flex flex-col gap-1">
                        {/* 模式切换按钮 */}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label={isInputMode ? "切换到选择模式" : "切换到输入模式"}
                            title={isInputMode ? "切换到选择模式" : "切换到输入模式"}
                        >
                            {isInputMode ? (
                                <List size={18} className="text-gray-500" />
                            ) : (
                                <Keyboard size={18} className="text-gray-500" />
                            )}
                        </button>

                        {/* 清除按钮 */}
                        {inputValue && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring"
                                aria-label="清除内容"
                                title="清除内容"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        )}

                        {/* 下拉按钮（仅选择模式显示） */}
                        {!isInputMode && (
                            <button
                                id={id}
                                type="button"
                                onClick={handleShowOptions}
                                className={cn(
                                    "p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring",
                                    inputValue ? "absolute right-[2.5rem]" : "",
                                )}
                                aria-label="显示选项"
                                title="显示选项"
                            >
                                <ChevronDown size={18} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 单位显示 */}
                {unit && <div className="ml-1 flex items-start pt-2 whitespace-nowrap flex-shrink-0">{unit}</div>}
            </div>

            {/* 选项下拉列表 */}
            <FloatingPortal>
                {isOpen && !isInputMode && filteredOptions.length > 0 && (
                    <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
                        <div
                            {...getFloatingProps({
                                ref: refs.setFloating,
                                className: cn(
                                    "z-50 bg-white border border-slate-200 shadow-lg rounded-md overflow-y-auto",
                                    listClassName,
                                ),
                                style: {
                                    position: strategy,
                                    left: x ?? 0,
                                    top: y ?? 0,
                                },
                            })}
                        >
                            {filteredOptions.map((option, index) => (
                                <div
                                    key={option}
                                    {...getItemProps({
                                        ref(node) {
                                            listRef.current[index] = node
                                        },
                                        onClick() {
                                            handleSelectOption(option)
                                        },
                                    })}
                                    className={cn(
                                        "cursor-pointer p-3 text-sm border-b border-gray-100 last:border-b-0 whitespace-pre-wrap break-words",
                                        activeIndex === index ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50",
                                    )}
                                    role="option"
                                    aria-selected={activeIndex === index}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </FloatingFocusManager>
                )}
            </FloatingPortal>
        </div>
    )
}
