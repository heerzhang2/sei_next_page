import type React from "react"
import { Children, isValidElement, cloneElement, type ReactElement } from "react"

interface FlexibleTableProps {
  children: React.ReactNode
  columnWidths: string[]
  className?: string
  variant?: "default" | "borderless"
}

// Helper function to process rows and apply widths to cells
function processRows(rows: React.ReactNode, columnWidths: string[]): React.ReactNode {
  return Children.map(rows, (row) => {
    if (!isValidElement(row)) return row

    // Cast row to ReactElement after validation
    const rowElement = row as ReactElement

    // Process cells within the row
    // @ts-ignore
    const cells = Children.map(rowElement.props.children, (cell, cellIndex) => {
      if (!isValidElement(cell)) return cell

      // Apply width to the cell based on its index
      const width = columnWidths[cellIndex] || "auto"
      return cloneElement(cell as ReactElement, {
        // @ts-ignore
        ...cell.props,
        // @ts-ignore
        style: { ...cell.props.style, width },
      })
    })

    // Return the row with processed cells
    // @ts-ignore
    return cloneElement(rowElement, rowElement.props, cells)
  })
}

// Process table sections (thead, tbody, tfoot)
function processTableSection(section: React.ReactNode, columnWidths: string[]): React.ReactNode {
  if (!isValidElement(section)) return section

  // Cast section to ReactElement after validation
  const sectionElement = section as ReactElement

  // Process rows within the section
  // @ts-ignore
  const rows = processRows(sectionElement.props.children, columnWidths)

  // Return the section with processed rows
  // @ts-ignore
  return cloneElement(sectionElement, sectionElement.props, rows)
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

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/50">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableFoot({ children }: { children: React.ReactNode }) {
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
    <td className={`${className || ""}`} style={style} colSpan={colSpan} {...props}>
      {children}
    </td>
  )
}

