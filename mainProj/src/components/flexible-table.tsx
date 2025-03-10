import type React from "react"
import { Children, isValidElement, cloneElement, type ReactElement } from "react"

interface FlexibleTableProps {
  children: React.ReactNode
  fixed: string[]
  className?: string
}

// Helper function to process rows and apply widths to cells
function processRows(rows: React.ReactNode, fixed: string[]): React.ReactNode {
  return Children.map(rows, (row) => {
    if (!isValidElement(row)) return row

    // Process cells within the row
    const cells = Children.map(row.props.children, (cell, cellIndex) => {
      if (!isValidElement(cell)) return cell

      // Apply width to the cell based on its index
      const width = fixed[cellIndex] || "auto"
      return cloneElement(cell as ReactElement, {
        ...cell.props,
        style: { ...cell.props.style, width },
      })
    })

    // Return the row with processed cells
    return cloneElement(row, row.props, cells)
  })
}

// Process table sections (thead, tbody, tfoot)
function processTableSection(section: React.ReactNode, columnWidths: string[]): React.ReactNode {
  if (!isValidElement(section)) return section

  // Process rows within the section
  const rows = processRows(section.props.children, columnWidths)

  // Return the section with processed rows
  return cloneElement(section, section.props, rows)
}

export function FlexibleTable({ children, fixed, className }: FlexibleTableProps) {
  // Process all table sections
  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    return processTableSection(child, fixed)
  })

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className || ""}`}>{processedChildren}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/50">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableFoot({ children }: { children: React.ReactNode }) {
  return <tfoot className="bg-muted/20">{children}</tfoot>
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b ${className || ""}`} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({
  children,
  className,
  colSpan,
  style,
   css,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { css?: React.CSSProperties }) {
  const mergedStyle = css ? { ...style, ...css } : style;
  return (
    <td className={`p-4 ${className || ""}`} style={mergedStyle} colSpan={colSpan} {...props}>
      {children}
    </td>
  )
}

