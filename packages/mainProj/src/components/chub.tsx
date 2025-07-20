"use client"
import React, { useId, useState, useRef, useEffect, type ChangeEventHandler } from "react"
import { ChevronDown, ChevronRight, ChevronUp, X, Calendar, Type } from "lucide-react"
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
// 修改 CollapsibleFormSection 组件，添加触摸屏检测
import { useTouchDevice } from "@/hooks/use-touch-device"

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

/*@Deprecated
可以用className="@container"嵌套className="columns-1 @lg:columns-2能直接替换掉LineColumn：但是顺序是分裂垂直阅读的，就不会有扩张稀疏问题较为紧凑的。
而LineColumn这个用grid的导致：某些输入框占据较大的高度空间的就会引起一整个行的空间稀疏同一扩展开的，项目顺序是常规阅读顺序。
* */
export function LineColumn({ width = 300, className, children }: LineColumnProps) {
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
                ? { gap: "1rem" }
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
                style={isSingleRow ? { minWidth: `${width}px` } : {}}
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

// 在 CollapsibleFormSection 函数内部添加
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
              style={{ width: dateWidth }}
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
    /** 是否全宽 */
    fullWidth?: boolean;
    /** 单位显示内容 */
    unit: any;
}
export function SuffixInput({ fullWidth = true, className, style, value, onChange, unit, ...other }: SuffixInputProps) {
    //确保unit不是函数
    const unitDisplay = typeof unit === "function" ? "" : unit
    return (
        <div className={cn("text-left inline-flex items-center gap-0.5", fullWidth ? "w-full" : "w-auto")}
             style={style}>
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
/**日期输入： 支持日期，文本切换的模式。
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
    // 日期验证函数（增强版）
    const isValidDate = (dateStr: string): boolean => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) && dateStr === date.toISOString().split("T")[0];
    };
    const [textValue, setTextValue] = useState(value);
    const [isDateMode, setIsDateMode] = useState(() => !value || isValidDate(value));
    // 同步外部 value 变化
    useEffect(() => {
        const isValueValid = isValidDate(value);
        setIsDateMode(!value || isValueValid);
        setTextValue(value);
    }, [value]);
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
        setIsDateMode(!isDateMode);
        setTextValue(value); // 切换时同步最新值
    };

    return (
        <div className={cn("flex flex-wrap items-start relative", className)} style={style}>
            {isDateMode ? (
                <input id={id}
                    type="date"
                    value={isDateMode && isValidDate(value) ? value : ""} // 关键修改：过滤非法值
                    onChange={handleDateChange}
                    className="rounded-l-md border border-r-0 border-input bg-background p-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                    style={{ width }}
                    aria-label="Date picker"
                />
            ) : (
                <textarea id={id}
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
    );
}

/**必须配套 useForm 使用的;
可清除的 Select 组件；  注意上级的<FormLabel htmlFor={field.name}></FormLabel>一致性的配套id=name。
 * */
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
/*配套 useForm， 简化嵌套的形式；
 * */
export function FormSelectField({ field, label, options, className, selectClass, value }: FormSelectFieldProps) {
  const id = useId() + "-" + field.name // 使用 field.name 生成唯一ID
  return (
      <FormItem className={`pt-2 w-full break-inside-avoid ${className || ""}`}>
        <FormLabel htmlFor={id} className="select-text">{label}</FormLabel>
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

/**通用版本：
 * 不在局限于form绑定的情况的： 因为嵌套在form组件底下的，需要加id;
 * */
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

interface InputDatalistProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Whether the input should take full width */
  fullWidth?: boolean
  /** List of suggestions to display */
  datalist?: string[]
  /** Callback when the value changes */
  onListChange?: (value: string) => void
  unit?: any
}

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
  const [showClearButton, setShowClearButton] = useState(Boolean(value && String(value).length > 0))
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showAllOptions, setShowAllOptions] = useState(false) // 新增：控制是否显示全部选项

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<Array<HTMLElement | null>>([])
  const uid = id
  const listId = `list-${uid}`

  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      setIsMobile(isMobileDevice || isTouchDevice)
    }

    checkMobile()
  }, [])

  // Floating UI setup for mobile custom dropdown
  const { x, y, refs, strategy, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open: isOpen && isMobile,
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

  // 修改过滤选项逻辑
  const filteredOptions = showAllOptions
      ? datalist
      : inputValue
          ? datalist.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
          : datalist

  // 清理 Chrome 添加的属性
  useEffect(() => {
    const input = inputRef.current
    if (input && !isMobile) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes") {
            const target = mutation.target as HTMLElement
            if (target.hasAttribute("__gchrome_uniqueid")) {
              target.removeAttribute("__gchrome_uniqueid")
            }
          }
        })
      })

      observer.observe(input, {
        attributes: true,
        attributeFilter: ["__gchrome_uniqueid"],
      })

      return () => observer.disconnect()
    }
  }, [isMobile])

  // 更新清除按钮显示状态
  useEffect(() => {
    setShowClearButton(inputValue !== "")
  }, [inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowAllOptions(false) // 输入时重置为过滤模式

    if (onChange) {
      onChange(e)
    }
    if (onListChange) {
      onListChange(newValue)
    }

    // 移动端：输入时显示下拉列表
    if (isMobile && newValue && filteredOptions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleClear = () => {
    setInputValue("")
    setIsOpen(false)
    setShowAllOptions(false)
    if (onListChange) {
      onListChange("")
    }
    if (onChange) {
      const event = {
        target: {
          value: "",
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(event)
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // 新增：处理下拉按钮点击
  const handleDropdownClick = () => {
    setShowAllOptions(true)
    setIsOpen(true)
    setActiveIndex(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSelectOption = (option: string) => {
    setInputValue(option)
    setIsOpen(false)
    setActiveIndex(null)
    setShowAllOptions(false)

    if (onListChange) {
      onListChange(option)
    }
    if (onChange) {
      const event = {
        target: {
          value: option,
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(event)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isMobile && isOpen) {
      if (e.key === "Enter" && activeIndex !== null && filteredOptions[activeIndex]) {
        e.preventDefault()
        handleSelectOption(filteredOptions[activeIndex])
      } else if (e.key === "Escape") {
        setIsOpen(false)
        setActiveIndex(null)
        setShowAllOptions(false)
      }
    }
  }

  const handleFocus = () => {
    if (isMobile && filteredOptions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    // 延迟关闭，允许点击选项
    setTimeout(() => {
      if (isMobile) {
        setIsOpen(false)
        setShowAllOptions(false)
      }
    }, 150)
  }

  return (
      <div
          ref={wrapperRef}
          className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")}
          style={style}
      >
        {/* 桌面端使用原生 datalist */}
        {!isMobile && (
            <datalist id={listId}>
              {datalist.map((option, i) => (
                  <option key={i} value={option} />
              ))}
            </datalist>
        )}

        <div className="relative flex-1">
          <input
              ref={isMobile ? refs.setReference : inputRef}
              className={cn(
                  "min-h-8 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input w-full",
                  // 调整右侧padding以容纳按钮
                  showClearButton ? "pr-16" : "pr-10",
                  className,
              )}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              list={!isMobile ? listId : undefined}
              id={id}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              suppressHydrationWarning
              {...(isMobile ? getReferenceProps() : {})}
              {...other}
          />

          {/* 按钮容器 */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* 清除按钮 */}
            {showClearButton && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring z-10"
                    aria-label="清除输入"
                >
                  <X size={14} className="text-gray-500" />
                </button>
            )}

            {/* 下拉箭头按钮 */}
            <button
                type="button"
                onClick={handleDropdownClick}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring z-10"
                aria-label="显示选项列表"
            >
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* 移动端自定义下拉列表 */}
        {isMobile && (
            <FloatingPortal>
              {isOpen && filteredOptions.length > 0 && (
                  <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
                    <div
                        {...getFloatingProps({
                          ref: refs.setFloating,
                          className: "z-50 bg-white border border-slate-200 shadow-lg rounded-md overflow-y-auto",
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
                                  "cursor-pointer p-3 text-sm border-b border-gray-100 last:border-b-0",
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
        )}

        {unit}
      </div>
  )
}
