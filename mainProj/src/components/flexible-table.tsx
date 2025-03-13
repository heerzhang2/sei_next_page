import type React from "react"
import { Children, isValidElement, cloneElement, type ReactNode } from "react"

interface FlexibleTableProps {
  children: ReactNode
  columnWidths: string[]
  className?: string
  variant?: "default" | "borderless"
}

// Helper function to process rows and apply widths to cells
function processRows(rows: ReactNode, columnWidths: string[]): ReactNode {
  // Calculate the remaining width for any column marked with just "%"
  const processedWidths = [...columnWidths]
  const percentIndex = columnWidths.findIndex((width) => width === "%")

  if (percentIndex !== -1) {
    // Calculate total percentage used by other columns
    const totalSpecified = columnWidths.reduce((sum, width, index) => {
      if (index === percentIndex || width === "%") return sum

      // Extract percentage value from strings like "20%"
      const percentValue = Number.parseFloat(width)
      return isNaN(percentValue) ? sum : sum + percentValue
    }, 0)

    // Calculate remaining percentage (ensure it's not negative)
    const remainingPercentage = Math.max(0, 100 - totalSpecified)
    processedWidths[percentIndex] = `${remainingPercentage}%`
  }

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

export function FlexibleTable({ children, columnWidths, className, variant = "default" }: FlexibleTableProps) {
  const variantStyles = {
    default: "border rounded-md",
    borderless: "",
  }

  // Process all table sections
  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    return processTableSection(child, columnWidths)
  })

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${variantStyles[variant]} ${className || ""}`}>{processedChildren}</table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-muted/50">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableFoot({ children }: { children: ReactNode }) {
  return <tfoot className="bg-muted/20">{children}</tfoot>
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
    default: "border-b",
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

export function TableCell({
  children,
  className,
  colSpan,
  style,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`p-2 ${className || ""}`} style={style} colSpan={colSpan} {...props}>
      {children}
    </td>
  )
}

