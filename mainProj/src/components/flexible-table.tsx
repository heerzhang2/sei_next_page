import type React from "react"
import { Children, isValidElement, cloneElement, type ReactNode } from "react"

interface FlexibleTableProps {
  children: ReactNode
  columnWidths: string[]
  className?: string
  variant?: "default" | "borderless"
  divClassName?: string
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

//增加divClassName参数：应对特别情况
export function FlexibleTable({ children, columnWidths, className,divClassName, variant = "default" }: FlexibleTableProps) {
  const variantStyles = {
    default: "border rounded-md",
    borderless: "",
  }

  // Process all table sections
  const processedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    return processTableSection(child, columnWidths)
  })
  //不用<colgroup> 和 <col> 标签 ，如何设置各个列的宽度width，还能准确拼凑各个列宽度正好100%的；colspan属性在处理需要合并列的表格时仍然是不可或缺的；
  return (
    <div className={`overflow-x-auto ${divClassName || ""}`}>
      <table className={`w-full ${variantStyles[variant]} ${className || ""}`}>
        <colgroup >
          {columnWidths?.map((width, i) => {
            return <col key={i} width={width} />;
          })}
        </colgroup>
        {processedChildren}
      </table>
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
//考虑打印p-0.25rem md:px-0.75rem md:py-0.25rem lg:px-1.5rem lg:py-0.25rem print:px-0 print:py-0.75rem
export function CCell({
                            children,
                            className,
                            colSpan,
                            style,
                            ...props
                          }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
      <td className={`px-0 py-0.5 md:px-0.5 md:py-1 lg:px-1 lg:py-1.5 print:px-0 print:py-0.75rem text-center border border-gray-700 ${className || ""}`}
          style={style} colSpan={colSpan} {...props}>
        {children}
      </td>
  )
}
