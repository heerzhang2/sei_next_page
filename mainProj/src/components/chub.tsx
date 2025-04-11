"use client"

import React, { useId, useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
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
export function LineColumn({ width=300, className, children }: LineColumnProps) {
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
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                <div className="p-4">
                    {children}

                    {/* 底部折叠按钮 - 仅在展开状态显示 */}
                    {isOpen && (
                        <div className="flex justify-end mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={toggleOpen}
                                className="flex items-center gap-1"
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
//包含 `onChange` 事件处理器，这些是客户端交互功能。只有当组件完全是静态的或只执行服务器端逻辑时，才可不用use client;
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

export interface BlobInputListProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** The size of the textarea element */
    inputSize?: "sm" | "md" | "lg"
    value?: string
    /** List of suggestions to display */
    datalist?: string[]
    /** Callback when the value changes */
    onListChange: (value: string | undefined) => void
    /** Additional className for the list container */
    listClassName?: string
}

/**
 * A textarea with autocomplete dropdown functionality
 */
export function BlobInputList({
                                  inputSize = "md",
                                  value,
                                  className,
                                  datalist = [],
                                  placeholder,
                                  onListChange,
                                  listClassName,
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

    function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = event.target.value
        setInputValue(value)

        if (value) {
            setOpen(true)
            setActiveIndex(0)
        } else {
            setOpen(false)
        }

        onListChange(value)
    }

    const items = inputValue ? datalist.filter((item) => item.toLowerCase().includes(inputValue.toLowerCase())) : datalist

    const sizeClasses = {
        sm: "text-sm p-1.5",
        md: "text-base p-2",
        lg: "text-lg p-3",
    }

    return (
        <>
      <textarea
          className={cn(
              "w-full rounded-md border border-input bg-background resize-vertical overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
              sizeClasses[inputSize],
              className,
          )}
          {...other}
          {...getReferenceProps({
              ref: refs.setReference,
              onChange,
              value: inputValue,
              placeholder: placeholder,
              "aria-autocomplete": "list",
              onKeyDown(event) {
                  if (event.key === "Enter" && activeIndex != null && items[activeIndex]) {
                      event.preventDefault()
                      setInputValue(items[activeIndex])
                      onListChange(items[activeIndex])
                      setActiveIndex(null)
                      setOpen(false)
                  }
              },
              onPointerDown() {
                  setOpen(true)
              },
          })}
      />

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
                                            setInputValue(item)
                                            onListChange(item)
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
    )
}


