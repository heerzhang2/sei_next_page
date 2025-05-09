"use client"

import React, {useId, useState, useRef, useEffect, ChangeEventHandler} from "react"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {cn} from "@/lib/utils"
import {ChevronDown, ChevronRight, ChevronUp,X, Calendar, Type } from "lucide-react"
import {Button} from "@/components/ui/button"
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
import {Form, FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import type {ControllerRenderProps} from "react-hook-form"

/*v0.dev自动帮忙写代码，替代旧的UI库代码。
* */

// Utility function for debouncing
const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

interface LineColumnProps {
    width?: number // Minimum width for each child in pixels
    className?: string
    children: React.ReactNode
}

/*可以用className="@container"嵌套className="columns-1 @lg:columns-2能直接替换掉LineColumn：但是顺序是分裂垂直阅读的，就不会有扩张稀疏问题较为紧凑的。
而LineColumn这个用grid的导致：某些输入框占据较大的高度空间的就会引起一整个行的空间稀疏同一扩展开的，项目顺序是常规阅读顺序。
* */
export function LineColumn({width = 300, className, children}: LineColumnProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isSingleRow, setIsSingleRow] = useState(false)
    const childrenArray = React.Children.toArray(children)
    const childCount = childrenArray.length

    // Check if all children can fit in a single row
    useEffect(() => {
        const checkLayout = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth
                const totalRequiredWidth = childCount * width
                setIsSingleRow(containerWidth >= totalRequiredWidth + (childCount - 1) * 16) // 16px for gap
            }
        }

        // Initial check
        checkLayout()

        // Use ResizeObserver instead of window resize event when available
        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(debounce(checkLayout, 100))
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current)
            }

            return () => {
                if (containerRef.current) {
                    resizeObserver.unobserve(containerRef.current)
                }
                resizeObserver.disconnect()
            }
        } else {
            // Fallback to window resize with debounce
            const debouncedCheckLayout = debounce(checkLayout, 100)
            window.addEventListener("resize", debouncedCheckLayout)
            return () => window.removeEventListener("resize", debouncedCheckLayout)
        }
    }, [childCount, width])

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full", isSingleRow ? "flex flex-row items-center justify-between" : "grid", className)}
            style={
                isSingleRow
                    ? {gap: "1rem"}
                    : {
                        gap: "1rem",
                        gridTemplateColumns: `repeat(auto-fill, minmax(${width}px, 1fr))`,
                        alignContent: "space-between",
                    }
            }
        >
            {childrenArray.map((child, index) => (
                <div
                    key={index}
                    className={cn("flex-grow flex items-center justify-center", isSingleRow ? "flex-1" : "")}
                    style={isSingleRow ? {minWidth: `${width}px`} : {}}
                >
                    {child}
                </div>
            ))}
        </div>
    )
}


interface CollapsibleFormSectionProps {
    title: string
    defaultOpen?: boolean
    className?: string
    titleClassName?: string
    contentClassName?: string
    children: React.ReactNode
}

//第二个idv不能加overflow-hidden;  max-h-[2000px]
export function CollapsibleFormSection({
                                           title,
                                           defaultOpen = false,
                                           className,
                                           titleClassName,
                                           contentClassName,
                                           children,
                                       }: CollapsibleFormSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <div className={cn("border rounded-md overflow-hidden", className)}>
            <button
                type="button"
                onClick={toggleOpen}
                className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left font-medium bg-muted/50 hover:bg-muted transition-colors",
                    titleClassName,
                )}
                aria-expanded={isOpen}
                aria-controls={`content-${title.replace(/\s+/g, "-").toLowerCase()}`}
            >
                <span>{title}</span>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground"/>
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground"/>
                )}
            </button>
            <div
                id={`content-${title.replace(/\s+/g, "-").toLowerCase()}`}
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isOpen ? "opacity-100" : "max-h-0 opacity-0",
                    contentClassName,
                )}
            >
                <div className="px-0 py-2 md:px-2 md:py-4">
                    {children}

                    {/* 底部折叠按钮 - 仅在展开状态显示 */}
                    {isOpen && (
                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={toggleOpen}
                                className="flex items-center gap-1 mr-8"
                            >
                                <ChevronUp className="h-4 w-4"/>
                                <span>收起</span>
                            </Button>
                        </div>
                    )}
                </div>
                {/*取经自JumpMeasure的意外效果来纠正手机上编制页面滚动条效果,台式机tabs竖屏的该删除这个*/}
                {/*<span className="absolute -bottom-1 left-0 right-0 h-[1px]"/>*/}
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

//随意日期录入最大情形:包含 `onChange` 事件处理器，这些是客户端交互功能。只有当组件完全是静态的或只执行服务器端逻辑时，才可不用use client;
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
                    style={{width: dateWidth}}
                    onChange={handleDateChange}
                    aria-label="选择日期"
                />
            </div>
        </div>
    )
}

//扩展列表大的输入框
interface ItemProps {
    children: React.ReactNode
    active: boolean
    index: number
}

//不能声明为 : ItemProps & Omit<React.HTMLProps<HTMLDivElement>, "onClick"> & { ref?: React.Ref<HTMLDivElement> })
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

export interface BlobInputListProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value?: string
    /** List of suggestions to display */
    datalist?: string[]
    /** Callback when the value changes */
    onListChange?: (value: string | undefined) => void
    /** Additional className for the list container */
    listClassName?: string
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;      // (value: string) => void
    unit?: any;
}

/**
 * A textarea with autocomplete dropdown functionality
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
                                  unit,
                                  ...other
                              }: BlobInputListProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        setInputValue(value)
    }, [value])

    const listRef = useRef<Array<HTMLElement | null>>([])

    const {x, y, refs, strategy, context} = useFloating<HTMLTextAreaElement>({
        whileElementsMounted: autoUpdate,
        open,
        onOpenChange: setOpen,
        middleware: [
            size({
                apply({rects, availableHeight, elements}) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${availableHeight}px`,
                    })
                },
                padding: 10,
            }),
        ],
    })

    const {getReferenceProps, getFloatingProps, getItemProps} = useInteractions([
        useRole(context, {role: "listbox"}),
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
        if (onChange) { // @ts-ignore
            onChange(newValue)
        }
        if (onListChange) onListChange(newValue)
    }

    // 处理选择列表项
    const handleSelectItem = (item: string) => {
        setInputValue(item)
        // 同时调用两个回调函数
        if (onChange) { // @ts-ignore
            onChange(item)
        }
        if (onListChange) onListChange(item)
    }

    const items = inputValue ? datalist.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase())) : datalist

    return (
        <div className="inline-flex items-center">
          <textarea
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

interface SuffixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Whether the input should take full width */
    fullWidth?: boolean
    unit: any;
}

export function SuffixInput({
                                fullWidth = true,
                                className,
                                style,
                                value,
                                onChange,
                                unit,
                                ...other
                            }: SuffixInputProps) {
    return (
        <div className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")} style={style}>
            <input
                className={cn(
                    "rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                    fullWidth ? "w-full" : "w-auto",
                    className,
                )}
                value={value}
                onChange={onChange}
                {...other}
            />
            {unit}
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

/**
 * A component that allows switching between text input and date picker for dates
 */
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
    const [textValue, setTextValue] = useState(value)
    // 日期验证函数
    const isValidDate = (dateStr: string): boolean => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) && dateStr !== "Invalid Date";
    };
    const [isDateMode, setIsDateMode] = useState(() => {
        if (!value) return true; // 空值时默认启用日期模式
        return isValidDate(value);
    });
    // 同步外部value变化到内部状态
    useEffect(() => {
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

    // 切换输入模式
    const toggleInputMode = () => {
        setIsDateMode(!isDateMode)
    }

    return (
        <div className={cn("flex flex-wrap items-start relative", className)} style={style}>
            {/* 根据当前模式显示不同的输入框 */}
            {isDateMode ? (
                // 日期输入模式
                <input
                    id={id ? `${id}-date` : undefined}
                    type="date"
                    value={value}
                    onChange={handleDateChange}
                    className="rounded-l-md border border-r-0 border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    style={{ width }}
                    aria-label="Date picker"
                />
            ) : (
                // 文本输入模式
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

            {/* 模式切换按钮 */}
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

// 创建一个可清除的 Select 组件；  注意上级的<FormLabel htmlFor={field.name}></FormLabel>一致性的配套id=name。
export function ClearableSelect({
                                    field,
                                    options,
                                    placeholder = "",
                                    onClear,
                                    id,
                                    className,
                                    value
                                }: {
    field: any,
    options: { value: string; label?: any }[],
    placeholder?: string,
    onClear: () => void,
    id?: string,
    className?: string,
    //允许外部控制传值，手动同步
    value?: any
}) {
    // 检查是否有选定的值
    const newValue=value===undefined? (field.value || "") : value;
    const hasValue = !!field.value;
    return (
        <div className={`relative w-full ${className || ""}`}>
            <Select  {...field}  onValueChange={field.onChange}
                     value={newValue}>
                <SelectTrigger id={id} className="w-full pr-8"
                         style={{
                        fontSize: "inherit"
                }}>
                    <SelectValue placeholder={placeholder}/>
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
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground"/>
                </button>
            )}
        </div>
    )
}

interface FormSelectFieldProps {
    field: ControllerRenderProps<any, any>,
    label: any,
    options: { value: string; label?: any }[],
    className?: string,
    selectClass?: string,
    value?: any
}

export function FormSelectField({field, label, options, className, selectClass, value}: FormSelectFieldProps) {
    const id = useId() + "-" + field.name // 使用 field.name 生成唯一ID
    return (
        <FormItem className={`pt-2 w-full break-inside-avoid ${className || ""}`}>
            <FormLabel htmlFor={id}>{label}</FormLabel>
            <FormControl>
                <ClearableSelect id={id} field={field} value={value} options={options}
                                 onClear={() => field.onChange("")}
                                 className={`${selectClass || ""}`}
                />
            </FormControl>
            <FormMessage/>
        </FormItem>
    )
}
//不在局限于form绑定的情况的： 因为嵌套在form组件底下的，需要加id;
export function CommonSelect({options, placeholder = "", onClear, id, className, value, onChange}: {
    options: { value: string; label?: any }[],
    placeholder?: string,
    onClear: () => void,
    id?: string,
    className?: string,
    value?: any
    onChange?: (e: any)=> void;
}) {
    // const uId = useId()    防止报错，加 name={id}
    const hasValue = !!value;
    return (
        <div className={`relative w-full ${className || ""}`}>
            <Select  onValueChange={onChange} name={id}
                     value={hasValue? value : ""}>
                <SelectTrigger className="w-full pr-8"
                               style={{fontSize: "inherit"}}>
                    <SelectValue  placeholder={placeholder}/>
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
                <button type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClear()
                    }}
                    className="absolute right-8 top-0 h-full flex items-center pr-2"
                    aria-label="清除选择"
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground"/>
                </button>
            )}
        </div>
    )
}


interface InputDatalistProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Whether the input should take full width */
    fullWidth?: boolean
    /** List of suggestions to display */
    datalist?: string[]
    /** Callback when the value changes */
    onListChange?: (value: string) => void
    unit?: any;
}

//不要自行去设置id的，<FormItem会转换的。
export function InputDatalist({
                                  fullWidth = true,
                                  datalist = [],
                                  className,
                                  style,
                                  onListChange,
                                  value,
                                  onChange,
                                  id,
                                  unit,
                                  ...other
                              }: InputDatalistProps) {
    const [inputValue, setInputValue] = useState(value || "")
    const uid = id;      //useId()避免不会记住用户输入文字
    const listId = `list-${uid}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        if (onChange) {
            onChange(e)
        }
        if (onListChange) {
            onListChange(newValue)
        }
    }

    return (
        <div className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")} style={style}>
            <datalist id={listId}>
                {datalist.map((option, i) => (
                    <option key={i} value={option}/>
                ))}
            </datalist>

            <input
                className={cn(
                    "rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
                    fullWidth ? "w-full" : "w-auto",
                    className,
                )}
                value={inputValue}
                onChange={handleChange}
                list={listId}
                id={id}
                {...other}
            />
            {unit}
        </div>
    )
}

