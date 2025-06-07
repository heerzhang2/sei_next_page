"use client"

import type React from "react"

import { useState } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

interface InputDatalistProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
  datalist?: string[]
  onListChange?: (value: string) => void
  unit?: any
}

// 方案3: 使用 dynamic import 避免 SSR
const DynamicInputDatalist = dynamic(() => Promise.resolve(InputDatalistComponent), {
  ssr: false,
  loading: () => <div className="rounded-md border border-input bg-background h-10 w-full animate-pulse" />,
})

function InputDatalistComponent({
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
  const uid = id
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
        autoComplete="off"
        {...other}
      />
      {unit}
    </div>
  )
}

export { DynamicInputDatalist as InputDatalistDynamic }
