"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface InputDatalistProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
  datalist?: string[]
  onListChange?: (value: string) => void
  unit?: any
}

// 方案2: 使用 useRef 和 useEffect 来处理 Chrome 属性
export function InputDatalistAlternative({
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
  const inputRef = useRef<HTMLInputElement>(null)
  const uid = id
  const listId = `list-${uid}`

  // 清理 Chrome 添加的属性
  useEffect(() => {
    const input = inputRef.current
    if (input) {
      // 移除 Chrome 自动添加的属性
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
  }, [])

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
          <option key={i} value={option} />
        ))}
      </datalist>

      <input
        ref={inputRef}
        className={cn(
          "rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
          fullWidth ? "w-full" : "w-auto",
          className,
        )}
        value={inputValue}
        onChange={handleChange}
        list={listId}
        id={id}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-form-type="other"
        suppressHydrationWarning
        {...other}
      />
      {unit}
    </div>
  )
}
