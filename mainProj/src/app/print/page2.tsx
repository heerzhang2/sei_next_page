"use client"

import { useState } from "react"
import { useMediaPrint } from "@/hooks/use-media-print"
import PageSectionOrientation from "@/components/page-section-orientation"

export default function EnhancedPrintExample() {
  useMediaPrint(true,true,"A4","10mm")
  return (
      <PageSectionOrientation orientation="portrait">
        <h2 className="text-xl font-bold mb-2">纵向部分</h2>
        <table className="w-full border-collapse border" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "60%" }} />
          </colgroup>
          <thead>
          <tr>
            <th className="border p-2">标题 1</th>
            <th className="border p-2">标题 2</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td className="important-cell border ">纵向内容 - 不再需要 cell-content 类</td>
            <td className="border ">{"这是一段很长的文字内容。".repeat(10)}</td>
          </tr>
          </tbody>
        </table>

        {/* 横向部分 - 添加列宽度 */}
        <PageSectionOrientation orientation="landscape">
          <div style={{height: "560px"}}></div>
          <h2 className="text-xl font-bold mb-2">sdfsdfsd3333333</h2>
          <table className="w-full border-collapse border" style={{tableLayout: "fixed"}}>
            <colgroup>
              <col style={{width: "7%"}}/>
              <col style={{width: "28%"}}/>
              <col style={{width: "30%"}}/>
              <col style={{width: "35%"}}/>
            </colgroup>
            <thead>
            <tr>
              <th className="border p-2">标题 1</th>
              <th className="border p-2">标题 2</th>
              <th className="border p-2">标题 3</th>
              <th className="border p-2">标题 4</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td className="important-cell border ">横向内宣布 豆腐55 55干豆腐干ghfh 容33d 腐干反对bv t32内容过 忽高忽低的后果
                好多个搞坏的是 读后感读后感33 梵蒂冈梵蒂冈哈哈哈哈个 vfdgfd 水电费水电4567 546费水电费===- --*** @@@！
                ！！！
              </td>
              <td className="border  ">{"这是一段很长的文字内容。".repeat(137)}</td>
              <td className="border ">{"更多内容。".repeat(5)}</td>
              <td className="border ">{"额外内容。".repeat(5)}</td>
            </tr>
            </tbody>
          </table>
        </PageSectionOrientation>

        {/* 多个重要单元格示例 - 添加列宽度 */}
        <PageSectionOrientation orientation="portrait">
          <h2 className="text-xl font-bold mb-2">多个重要单元格示例</h2>
          <table className="w-full border-collapse border" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "33.33%" }} />
              <col style={{ width: "33.33%" }} />
              <col style={{ width: "33.33%" }} />
            </colgroup>
            <thead>
            <tr>
              <th className="border p-2">标题 1</th>
              <th className="border p-2">标题 2</th>
              <th className="border p-2">标题 3</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td className="important-cell border p-2">重要单元格 1 - 直接内容</td>
              <td className="important-cell border p-2">重要单元格 2 - 直接内容</td>
              <td className="border p-2">普通单元格</td>
            </tr>
            <tr>
              <td className="border p-2">普通单元格</td>
              <td className="important-cell border p-2">重要单元格 3 - 直接内容</td>
              <td className="important-cell border p-2">重要单元格 4 - 直接内容</td>
            </tr>
            </tbody>
          </table>
        </PageSectionOrientation>

        {/* 嵌套表格示例 - 添加列宽度 */}
        <PageSectionOrientation orientation="landscape">
          <h2 className="text-xl font-bold mb-2">嵌套表格示例</h2>
          <table className="w-full border-collapse border" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "50%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
            <thead>
            <tr>
              <th className="border p-2">标题 1</th>
              <th className="border p-2">标题 2</th>
              <th className="border p-2">标题 3</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td className="border p-2">普通单元格</td>
              <td className="border p-2">
                {/* 嵌套表格 - 添加列宽度 */}
                <table className="w-full border-collapse border" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "60%" }} />
                  </colgroup>
                  <thead>
                  <tr>
                    <th className="border p-2">嵌套标题 1</th>
                    <th className="border p-2">嵌套标题 2</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td className="important-cell border p-2">嵌套重要单元格 - 直接内容</td>
                    <td className="border p-2">{"这是一段很长的文字内容。".repeat(68)}</td>
                  </tr>
                  </tbody>
                </table>
              </td>
              <td className="border p-2">{"这是一段很长的文字内容。".repeat(5)}</td>
            </tr>
            </tbody>
          </table>
        </PageSectionOrientation>

      </PageSectionOrientation>

  )
}

//data-interval-height="730"
