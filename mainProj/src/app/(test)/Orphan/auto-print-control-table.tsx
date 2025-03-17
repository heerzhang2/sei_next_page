"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import {usePrintOptimization} from "@/hooks/usePrintOptimization";

// Props for the component
interface AutoPrintControlTableProps {
  data: any[][] // Your table data
  headers: string[] // Table headers
  minOrphanHeight?: 4 | 7 | 10 | 14 | 20  // Orphan height in vh units
  cellRenderer?: (cellData: any, rowIndex: number, colIndex: number) => React.ReactNode
}

export default function AutoPrintControlTable({
  data,
  headers,
  minOrphanHeight = 10,
  cellRenderer,
}: AutoPrintControlTableProps) {
  usePrintOptimization({continuationPrefix: '(续)'});
  const tableRef = useRef<HTMLTableElement>(null)

  // Function to determine if a cell might be tall based on content
  const isTallContent = (content: any): boolean => {
    // You can implement your own logic here
    // For example, if it's a string with many characters, it might be tall
    if (typeof content === "string" && content.length > 200) return true

    // If it's an object with a height property
    if (content && typeof content === "object" && "height" in content) return true

    return false
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button onClick={handlePrint}>Print Table</Button>
      </div>

      <table ref={tableRef} className="w-full border-collapse border ">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="border p-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
        <tr className="">
          <td className="border p-2 ">Product A</td>
          <td className="border p-2 ">Short description</td>
          <td className="border p-2 ">Active</td>
        </tr>
        <tr className="">
          <td className="border p-2 ">Product B</td>
          <td className="border">{"This is a very long description tha to be tall. ".repeat(37)}</td>
          <td className="border p-2 ">Pending</td>
        </tr>
        <tr className=" ">
          <td className="border " rowSpan={4}>Produc很 fdgf dgfdg 234 3242 34</td>
          <td className="border ">Another short description</td>
          <td className="border important-cell" rowSpan={3}>Inactiv 给干 66豆腐干豆 腐干 888反对</td>
        </tr>
        <tr className="">
          <td className="border ">{"This is a very long description tha to be tall. ".repeat(37)}</td>

        </tr>
        <tr className="  ">
          <td className="border ">Cusgjght-<br/>都会受到《》<br/>---- height</td>

        </tr>
        <tr className="  ">
          <td className="border ">Cusg5666eight</td>
          <td className="border ">想挂话</td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}

/* special-row  important-cell
 <td className="border  print-container-min-5h" rowSpan={4}>ProductCio 说的很对n 换个给和</td>
          {data.map((row, rowIndex) => {
              const isTall =rowIndex===1 || rowIndex===3;   // isTallContent(cell)
              const rowClasses =isTall ? `print-container-min-${minOrphanHeight}vh` : ""
              return(
              <tr key={rowIndex} className={`${rowClasses}`}>
                {row.map((cell, colIndex) => {
                  // Determine if this cell might be tall
                  const isTall = isTallContent(cell)

                  // Apply the appropriate classes based on height
                  //【最早】原本加上 print-avoid-break
                  const printClasses =""//  isTall ? `print-min-orphan-${minOrphanHeight}vh` : ""

                  return (
                    <td key={colIndex} className={`border p-2 ${printClasses}`}>
                      {cellRenderer ? cellRenderer(cell, rowIndex, colIndex) : cell}
                    </td>
                  )})}
              </tr>
           )
        })}
* */
