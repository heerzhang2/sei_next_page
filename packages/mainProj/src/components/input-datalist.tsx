"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

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
  const [isClient, setIsClient] = useState(false)
  const uid = id
  const listId = `list-${uid}`

  // 确保只在客户端渲染后才显示组件
  useEffect(() => {
    setIsClient(true)
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

  // 方案1: 禁用自动填充
  const inputProps = {
    ...other,
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    // 添加这些属性来阻止 Chrome 的自动填充
    "data-form-type": "other",
    "data-lpignore": "true",
  }

  if (!isClient) {
    // 服务端渲染时返回简化版本
    return (
      <div className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")} style={style}>
        <input
          className={cn(
            "rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input",
            fullWidth ? "w-full" : "w-auto",
            className,
          )}
          value={inputValue}
          onChange={handleChange}
          id={id}
          {...inputProps}
          suppressHydrationWarning
        />
        {unit}
      </div>
    )
  }

  return (
    <div className={cn("text-left inline-flex items-center", fullWidth ? "w-full" : "w-auto")} style={style}>
      <datalist id={listId}>
        {datalist.map((option, i) => (
          <option key={i} value={option} />
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
        {...inputProps}
        suppressHydrationWarning
      />
      {unit}
    </div>
  )
}
