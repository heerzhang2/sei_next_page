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
          <NoPageBreak reserve="3.2rem" title={<>df<br/>
            zhong jia正宗midd</>} >
            <FlexibleTable className="w-full" columnWidths={["30%", "70%"]}>
              <TableHead>
                <TableRow>
                  <TableCell>标题</TableCell>
                  <TableCell>描述</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="important-cell ">这是一个纯文本内容示例</TableCell>
                  <TableCell>{"这是一段很长的文字内容。。。".repeat(118)}</TableCell>
                </TableRow>
              </TableBody>
            </FlexibleTable>
          </NoPageBreak>
        </PageSectionOrientation>

        <div>
          <NoPageBreak reserve="3.2rem" title={<>df<br/>
            zhong jia正宗midd</>}>
            <table className="w-full border-collapse border" style={{tableLayout: "fixed"}}>
              <colgroup>
                <col style={{width: "20%"}}/>
                <col style={{width: "50%"}}/>
                <col style={{width: "30%"}}/>
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
                  <table className="w-full border-collapse border" style={{tableLayout: "fixed"}}>
                    <colgroup>
                      <col style={{width: "40%"}}/>
                      <col style={{width: "60%"}}/>
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
                      <td className="border p-2">{"这是一段很长的文字内容。".repeat(31)}</td>
                    </tr>
                    </tbody>
                  </table>
                </td>
                <td className="border p-2">{"这是一段很长的文字内容。".repeat(5)}</td>
              </tr>
              </tbody>
            </table>
          </NoPageBreak>
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