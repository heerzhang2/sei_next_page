import type React from "react"
import { Children, isValidElement, cloneElement, type ReactNode } from "react"

interface FlexibleTableProps {
    children: ReactNode
    columnWidths: string[]
    className?: string
    variant?: "default" | "borderless"
}

// Helper function to process column widths and calculate remaining percentage
function processColumnWidths(columnWidths: string[]): string[] {
    // Create a copy of the original array
    const processedWidths = [...columnWidths]

    // Find if there's any column marked with just "%"
    const percentIndex = columnWidths.findIndex((width) => width === "%")

    if (percentIndex !== -1) {
        // Calculate total percentage used by other columns
        const totalSpecified = columnWidths.reduce((sum, width, index) => {
            if (index === percentIndex || width === "%") return sum

            // Extract percentage value from strings like "20%"
            const match = width.match(/^(\d+(\.\d+)?)%$/)
            const percentValue = match ? Number.parseFloat(match[1]) : 0
            return isNaN(percentValue) ? sum : sum + percentValue
        }, 0)

        // Calculate remaining percentage (ensure it's not negative)
        const remainingPercentage = Math.max(0, 100 - totalSpecified)
        processedWidths[percentIndex] = `${remainingPercentage}%`
    }

    return processedWidths
}

// Helper function to process rows and apply widths to cells
function processRows(rows: ReactNode, columnWidths: string[]): ReactNode {
    // Calculate the processed widths
    const processedWidths = processColumnWidths(columnWidths)

    return Children.map(rows, (row) => {
        if (!isValidElement(row)) return row

        // For custom row components, we need to pass the columnWidths as a prop
        return cloneElement(row, {
            ...row.props,
            columnWidths: processedWidths,
        })
    })
}

// Process table sections (thead, tbody, tfoot)
function processTableSection(section: ReactNode, columnWidths: string[]): ReactNode {
    if (!isValidElement(section)) return section

    // Process rows within the section
    const processedRows = processRows(section.props.children, columnWidths)

    // Return the section with processed rows
    return cloneElement(section, section.props, processedRows)
}

//增加divClassName参数：应对特别情况
export function FlexibleTable({ children, columnWidths, className, variant = "default" }: FlexibleTableProps) {
    const variantStyles = {
        default: "border rounded-md",
        borderless: "",
    }

    // Process column widths for colgroup
    const processedWidths = processColumnWidths(columnWidths)

    // Process all table sections
    const processedChildren = Children.map(children, (child) => {
        if (!isValidElement(child)) return child
        return processTableSection(child, processedWidths)
    })

    return (
        <table className={`w-full table-fixed ${variantStyles[variant]} ${className || ""}`}>
            <colgroup>
                {processedWidths.map((width, i) => {
                    return <col key={i} style={{ width }} />
                })}
            </colgroup>
            {processedChildren}
        </table>
    )
}

export function TableHead({ children }: { children: ReactNode }) {
    return <thead className="bg-muted/50">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
    return <tbody>{children}</tbody>
}

export function TableRow({
                             children,
                             className,
                             variant = "default",
                             columnWidths,
                             ...props
                         }: React.HTMLAttributes<HTMLTableRowElement> & {
    variant?: "default" | "borderless" | "dashed"
    columnWidths?: string[]
}) {
    const variantStyles = {
        default: "border-b border-gray-700",
        borderless: "",
        dashed: "border-b border-dashed",
    }

    // Apply column widths to direct children if columnWidths is provided
    const processedChildren = columnWidths
        ? Children.map(children, (cell, index) => {
            if (!isValidElement(cell)) return cell

            const width = columnWidths[index] || "auto"
            return cloneElement(cell, {
                ...cell.props,
                style: { ...(cell.props.style || {}), width },
            })
        })
        : children

    return (
        <tr className={`${variantStyles[variant]} ${className || ""}`} {...props}>
            {processedChildren}
        </tr>
    )
}

// 修改TableCell组件，添加split参数
export function TableCell({
                              children,
                              className,
                              colSpan,
                              style,
                              split = true, // 默认允许拆分
                              ...props
                          }: React.TdHTMLAttributes<HTMLTableCellElement> & { split?: boolean }) {
    // 根据split参数设置pageBreakInside样式
    const splitStyle = !split ? { pageBreakInside: "avoid", breakInside: "avoid" } : {}

    return (
        <td className={`p-2 ${className || ""}`} style={{ ...style, ...splitStyle }} colSpan={colSpan} {...props}>
            {children}
        </td>
    )
}

// 修改CCell组件，添加split参数
export function CCell({
                          children,
                          className,
                          colSpan,
                          style,
                          split = true, // 默认允许拆分
                          ...props
                      }: React.TdHTMLAttributes<HTMLTableCellElement> & { split?: boolean }) {
    // 根据split参数设置pageBreakInside样式
    const splitStyle = !split ? { pageBreakInside: "avoid", breakInside: "avoid" } : {}

    return (
        <td
            className={`px-0 py-0.5 md:px-0.5 md:py-1 lg:px-1 lg:py-1.5 print:px-0 print:py-0.75rem text-center border border-gray-700 ${className || ""}`}
            style={{ ...style, ...splitStyle }}
            colSpan={colSpan}
            {...props}
        >
            {children}
        </td>
    )
}

