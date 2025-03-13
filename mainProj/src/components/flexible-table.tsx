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
  return Children.map(rows, (row) => {
    if (!isValidElement(row)) return row

    // Process cells within the row
    const cells = Children.map(row.props.children, (cell: ReactNode, cellIndex: number) => {
      if (!isValidElement(cell)) return cell

      // Apply width to the cell based on its index
      const width = columnWidths[cellIndex] || "auto"
      return cloneElement(cell, {
        style: { ...(cell.props.style || {}), width },
      })
    })

    // Return the row with processed cells
    return cloneElement(row, row.props, cells)
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
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  variant?: "default" | "borderless" | "dashed"
}) {
  const variantStyles = {
    default: "border-b",
    borderless: "",
    dashed: "border-b border-dashed",
  }

  return (
    <tr className={`${variantStyles[variant]} ${className || ""}`} {...props}>
      {children}
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

