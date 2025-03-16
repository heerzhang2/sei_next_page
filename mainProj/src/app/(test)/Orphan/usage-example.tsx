"use client"

import AutoPrintControlTable from "./auto-print-control-table"

export default function UsageExample() {
  // Sample data
  const headers = ["Name", "Description", "Status"]
  const data = [
    ["Product A", "Short description", "Active"],
    ["Product B", "This is a very long description that might cause the cell to be tall. ".repeat(25), "Pending"],
    ["ProductCio  说的很对n 换个给和", "Another short description", "Inactive"],
    ["Product D", { height: "25vh", content: "Custom content with explicit height" }, "Active"],
  ]

  // Custom cell renderer
  const renderCell = (cell: any, rowIndex: number, colIndex: number) => {
    if (typeof cell === "string") {
      return cell
    }

    if (cell && typeof cell === "object" && "height" in cell) {
      return <div style={{ height: cell.height }}>{cell.content}</div>
    }

    return String(cell)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Table with Automatic Print Control</h1>

      <AutoPrintControlTable headers={headers} data={data} minOrphanHeight={4} cellRenderer={renderCell} />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How it works</h2>
        <p>
          This table automatically applies print control classes to cells that might be tall. When printing, cells will
          avoid breaking if there's less than 15vh space remaining on the page.
        </p>
      </div>
    </div>
  )
}

