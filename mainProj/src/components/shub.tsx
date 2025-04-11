import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"


/*v0.dev自动帮忙写代码，替代旧的UI库代码。
CSS的container-type: inline-size;是容器查询（Container Queries）的核心特性之一：避免副作用的多一次刷新页面，不需要辅助的js代码。@container (width >= 32rem) {columns: 2;}
* */

interface FormFieldProps {
    id: string
    label: string
    required?: boolean
    error?: string
    className?: string
    children: ReactNode
}

export function FormField({ id, label, required = false, error, className, children }: FormFieldProps) {
    return (
        <div className={cn("flex flex-col space-y-2 w-full break-inside-avoid", className)}>
            <Label htmlFor={id} className="flex items-center text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className={cn("w-full", error && "ring-1 ring-red-500 rounded-md")}>{children}</div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    )
}

