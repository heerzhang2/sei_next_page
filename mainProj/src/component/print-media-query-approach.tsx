"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import {usePrintOptimization} from "@/hooks/usePrintOptimization";
function generateLongContent(repeatCount) {
  const baseContent = "这是一个非常长的内容，可能会跨越多个页面。";
  let fullContent = "";

  for (let i = 1; i <= repeatCount; i++) {
    fullContent += `${baseContent} [序号: ${i}]\n`;
  }

  return fullContent;
}

/*动态加样式，打印也需要动态js运行。 -15vh;是固定的不能调整。
### 1. CSS-Based Print Control (Recommended)

The `print-media-query-approach.tsx` file demonstrates a pure CSS solution that:

- Uses CSS `@media print` rules to apply print-specific styles
- Adds a `.tall-cell` class to cells with significant height
- Creates a pseudo-element with a height of 15vh at the bottom of each tall cell
- Uses `break-inside: avoid` to prevent breaking when that pseudo-element would cross a page boundary
* */


export default function PrintMediaQueryApproach() {
  const tableRef = useRef<HTMLTableElement>(null)
  //continuationPrefix = '(续) '
  usePrintOptimization({continuationPrefix: '(续) '});
  const handlePrint = () => {
    if (!tableRef.current) return
    window.print()
  }

  return (
      <div className="p-4">
        <div className="mb-4">
          <Button onClick={handlePrint}>Print with Media Query Approach</Button>
          <p className="text-sm text-muted-foreground mt-2">
            This method uses CSS print media queries <br/> and pseudo-elements to detect and prevent page breaks.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This method uses CSS print media queries <br/> and pto detect and prevent page breaks.
          </p>
        </div>
        <table ref={tableRef} className="w-full border-collapse border ">
          <thead>
          <tr>
            <th className="border p-2">Rey第一inten t</th>
            <th className="border p-2">Regular content</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td className="border p-2">Header 1</td>
            <td className="border p-2">{generateLongContent(41)}</td>
          </tr>
          <tr>
            <td className="border p-2">Reg3nt</td>
            <td className="border p-2">Reg5ntent</td>
          </tr>
          <tr className="special-row">
            <td className="border p-2 important-cell">
              <div className="inline">网页上面可能不止一个甚至table也可能会嵌套的</div>
            </td>
            <td className="border p-2">{generateLongContent(162)}</td>
          </tr>
          </tbody>
        </table>

        <table ref={tableRef} className="w-full border-collapse border WideChapter">
          <thead>
          <tr>
            <th className="border p-2">Regdier第二ten</th>
            <th className="border p-2">Regular content</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td className="border p-2">Header 1</td>
            <td className="border p-2">{generateLongContent(41)}</td>
          </tr>
          <tr>
            <td className="border p-2">Reg3nt</td>
            <td className="border p-2">Reg5ntent</td>
          </tr>
          <tr className="special-row">
            <td className="border p-2 important-cell">
              <div className="inline">网页上面可能不止一个甚至table也可能会嵌套的</div>
            </td>
            <td className="border p-2">{generateLongContent(122)}</td>
          </tr>
          </tbody>
        </table>
      </div>
  )
}

/*  id={"your-important-cell-selector"}
  const handlePrint = () => {
    if (!tableRef.current) return
    // Add a print-specific stylesheet
    const style = document.createElement("style")
    style.id = "print-media-query-style"
    // Generate CSS that uses print-specific media queries
    let styleContent = `
      @media print {

@page { size: A4; }
table { page-break-inside: auto; }
tr { page-break-after: auto; }

.tall-cell {
  position: relative;
}

.tall-cell::after {
  content: '';
  display: block;
  height: 15vh;
  margin-bottom: -15vh;
  position: relative;
}

.tall-cell {
  break-inside: avoid;
  page-break-inside: avoid;
}
`
    // Find all potentially tall cells and add the class
    const cells = tableRef.current.querySelectorAll("td")
    cells.forEach((cell) => {
      if (cell.clientHeight > 100) {
        // Arbitrary threshold for "tall" cells
        cell.classList.add("tall-cell")
      }
    })

    styleContent += `}`
    style.textContent = styleContent
    document.head.appendChild(style)

    // Clean up style after printing
    const cleanupStyle = () => {
      const styleElement = document.getElementById("print-media-query-style")
      if (styleElement) {
        styleElement.remove()
      }

      // Remove the tall-cell class
      cells.forEach((cell) => {
        cell.classList.remove("tall-cell")
      })

      window.removeEventListener("afterprint", cleanupStyle)
    }

    window.addEventListener("afterprint", cleanupStyle)

    // Trigger print
    window.print()
  }
* */