/** @jsxImportSource @emotion/react */
'use client';
import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import {Global} from "@emotion/react";
import NoPageBreak from "@/components/no-page-break";
import {FlexibleTable, TableBody, TableCell, TableHead, TableRow} from "@/components/flexible-table";
import {useMediaPrint} from "@/hooks/use-media-print";
import PageSectionOrientation from "@/components/page-section-orientation";
import {PrintTogether} from "@/components/print-together";
import type React from "react";


/*
打印测试
* */
export default function Home() {
  useMediaPrint(true,true,"A4","10mm")
  return (
      <PageSectionOrientation orientation="portrait">
        <div className={"dASqww   Alld"}>

          <section className={"dASqww   Alld"} css={{minHeight: '40vh'}}>
            111<br/>
            正常A4 竖着的但因---------------------fdgdfgdf==============形成个性风格豆565 46564 5645腐干豆腐干
          </section>
          《<br/>》11版本内容！

        </div>

        <PageSectionOrientation >
          <div className={"Wqww    dRTffld"}  css={{minHeight: '55vh'}}>
            cbvvccfgcfdfd<br/>
            6787687
          </div>

            <FlexibleTable className="w-full" columnWidths={["20%","50%","20%","10%"]}>
              <TableHead>
                <TableRow>
                  <TableCell>编号</TableCell>
                  <TableCell>描述</TableCell><TableCell>结果</TableCell><TableCell>结论</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="important-cell " rowSpan={3}>这是一个纯文本内容示例</TableCell>
                  <TableCell>段很长的文字内</TableCell>
                  <TableCell>这是内容示例</TableCell><TableCell rowSpan={3}>这是twerwer<br/>ew内容<br/>示例</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell rowSpan={2}>{"这是一段很长的文字内容。。。".repeat(118)}</TableCell>
                  <TableCell  rowSpan={2}>这是内容示例</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>这是内容示例</TableCell>
                </TableRow>
              </TableBody>
            </FlexibleTable>

        </PageSectionOrientation>

        <div>
          <PrintTogether reserve="3.7rem" title={<>df<br/>
            zhong jia正宗midd</>}>
            <div  >
              <table className="w-full border-collapse border" >
                <colgroup>
                  <col width="20%"/>
                  <col width="50%"/>
                  <col width="30%"/>
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
                  <td className="important-cell ">普通单77777元格</td>
                  <td className="border p-2">
                    {"这是一段很长的文字内容。".repeat(68)}
                  </td>
                  <td className="border p-2">{"这是一段很长的文字内容。".repeat(5)}</td>
                </tr>
                </tbody>
              </table>
            </div>
          </PrintTogether>
          <div className={"Wqww    dRTffld"}>
            3333中的<br/>
            横版本
          </div>
          <h2 className="text-xl font-bold mb-2">嵌套表格示例</h2>


        </div>
      </PageSectionOrientation>
  );
}

/*同一个页面可能连纸张大小也能修改的：
@page portraitPg {
  size: 7in 5in;
  margin: 15mm 5mm;
}
@page landscapePg {
  size: a4 landscape;
}
@media print {
  .WideChapter {
    page: landscapePg;
  }
  .UsualChapter {
    page: portraitPg;
  }
}
* */