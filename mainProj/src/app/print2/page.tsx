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
打印测试  <table className="w-full border-collapse border" style={{ tableLayout: "fixed" }}>
* */
export default function Home() {
  useMediaPrint(true,true,"A4","10mm")
  return (
      <PageSectionOrientation orientation="portrait">
        <div className={"dASqww   Alld"}>

          <section className={"dASqww   Alld"} css={{minHeight: '63vh'}}>
            111<br/>
            正常A4 竖着的但因---------------------fdgdfgdf==============形成个性风格豆565 46564 5645腐干豆腐干
          </section>
          《<br/>》11版本内容！

        </div>

        <div>
          <PrintTogether reserve="3.7rem" title={<>df<br/>
            zhong jia正宗midd</>}>
            <FlexibleTable className="w-full" columnWidths={["20%","%","20%","10%"]}>
              <TableHead>
                <TableRow>
                  <TableCell>编号</TableCell><TableCell>描述</TableCell>
                  <TableCell>结果</TableCell><TableCell>结论</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className="border">
                  <TableCell className="important-cell " rowSpan={3}>这是一托于同体容示例</TableCell>
                  <TableCell  className="border">段很长的文字内</TableCell>
                  <TableCell className="border"><div style={{ height: "300px"}}>坎坎坷坷示例</div></TableCell>
                  <TableCell  className="border   important-cell" rowSpan={3}>这是twer3/werew内容示例</TableCell>
                </TableRow>
                <TableRow className="border">
                  <TableCell  className="border" rowSpan={2}>{"这是一段很长的文字内容。。。".repeat(118)}</TableCell>
                  <TableCell  className="border important-cell" >这是mmn存储卡简单化示例</TableCell>
                </TableRow>
                <TableRow className="border">
                  <TableCell  className="important-cell  border">聊聊天越来越讨论内容示例</TableCell>
                </TableRow>
              </TableBody>
            </FlexibleTable>
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