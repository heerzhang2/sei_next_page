import * as React from "react"
import { Children, isValidElement, cloneElement, type ReactNode, ReactElement } from "react"
import {cn} from "@/lib/utils";

interface FlexibleTableProps {
  children: ReactNode
  columnWidths: string[]
  className?: string
  variant?: "default" | "borderless"
  id?: string
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
function processRows(rows: ReactNode|ReactNode[], columnWidths: string[]): ReactNode {
  // Calculate the processed widths
  const processedWidths = processColumnWidths(columnWidths)

  return Children.map(rows, (row) => {
    if (!isValidElement(row)) return row

    // For custom row components, we need to pass the columnWidths as a prop
    // But we don't need to set width on cells since colgroup handles that
    return cloneElement(row, {
      ...(row.props || {}),
      columnWidths: processedWidths,
      // Flag to indicate we're using colgroup for widths
      usingColgroup: true,
    } as any)
  })
}

// Process table sections (thead, tbody, tfoot)
function processTableSection(section: ReactNode, columnWidths: string[]): ReactNode {
  if (!isValidElement(section)) return section

  // Process rows within the section
  const processedRows = processRows((section.props as any)?.children, columnWidths)

  // Return the section with processed rows
  return cloneElement(section, (section as any).props, processedRows)
}

/**
  两个表紧挨着的的使用border-collapse并没有效果。
* */
export function FlexibleTable({ children, columnWidths, className, variant = "default", id }: FlexibleTableProps) {
  const variantStyles = {
    default: "border border-gray-700 rounded-md",
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
    <table id={id} className={`w-full table-fixed break-all border-collapse ${variantStyles[variant]} ${className || ""}`}>
      <colgroup>
        {processedWidths.map((width, i) => {
          return <col key={i} style={{ width }} />
        })}
      </colgroup>
      {processedChildren}
    </table>
  )
}

//改成和shadcn.ui的一样名字和含义，更容易替换，避免混淆。
export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-muted/50">{children}</thead>
}
/**【注意】打印情形非常不友好@  避免用tfoot。
 * */
export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
      <tfoot
          data-slot="table-footer"
          className={cn(
              "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
              className
          )}
          {...props}
      />
  )
}

//无法把TableHeader布局放在TableBody位置下方的。
export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

// Define a proper interface for the table cell props
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  colSpan?: number
}

export function TableRow({
                           children,
                           className,
                           variant = "default",
                           columnWidths,
                           usingColgroup = false,
                           ...props
                         }: React.HTMLAttributes<HTMLTableRowElement> & {
  variant?: "default" | "borderless" | "dashed"
  columnWidths?: string[]
  usingColgroup?: boolean
}) {
  const variantStyles = {
    default: "border-b border-gray-700",
    borderless: "",
    dashed: "border-b border-dashed",
  }

  const processedChildren = usingColgroup
      ? children
      : columnWidths
          ? Children.map(children, (cell): React.ReactNode => {
            if (!isValidElement(cell)) return cell

            // Now TypeScript will recognize colSpan
            if (isValidElement<TableCellProps>(cell)) {
              const colSpan = cell.props.colSpan || 1
              return React.cloneElement(cell, { colSpan })
            }
            return cell
          })
          : children

  return (
      <tr className={`${variantStyles[variant]} ${className || ""}`} {...props}>
        {processedChildren}
      </tr>
  )
}

/*祖先级需要添加上 @container类。
* */
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
  //默认：不加边线的。
  return (
    <td className={`px-0 py-0.5 @md:px-[0.1rem] @md:py-1 @lg:px-1 @lg:py-1 print:px-0.5 print:py-[0.2rem] ${className || ""}`}
        style={{ ...style, ...splitStyle } as any}
        colSpan={colSpan} {...props}
    >
      {children}
    </td>
  )
}

//默认：加边线的。居中的；
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
    <td className={`px-0 py-0.5 @md:px-[0.1rem] @md:py-1 @lg:px-1 @lg:py-1 print:px-0.5 print:py-[0.2rem] text-center border border-gray-700 ${className || ""}`}
      style={{ ...style, ...splitStyle } as any}
      colSpan={colSpan} {...props}
    >
      {children}
    </td>
  )
}
