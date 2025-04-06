/** @jsxImportSource @emotion/react */
'use client';
import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import {Global} from "@emotion/react";
import {FlexibleTable, TableBody, TableCell, TableHead, TableRow} from "@/components/flexible-table";
import {useMediaPrint} from "@/hooks/use-media-print";
import PageSectionOrientation from "@/components/page-section-orientation";
import type React from "react";
import NoPageBreak, {PrintTogether} from "@/components/print-together";


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

        <PageSectionOrientation>
          <div className={"Wqww    dRTffld"} css={{minHeight: '45vh'}}>
            cbvvccfgcfdfd<br/>
            6787687
          </div>
          <NoPageBreak reserve="3.7rem" title={<>df<br/>
            zhong jia正宗midd</>}>
            <div >
              <FlexibleTable className="w-full" columnWidths={["30%", "70%"]}>
                <TableHead>
                  <TableRow>
                    <TableCell>标题</TableCell>
                    <TableCell>描述</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className="important-cell">这是一个纯文本内容示例</TableCell>
                    <TableCell>
                      {Array.from({ length: 115 }, (_, i) =>
                        `这是一段很长的文字内容。。。${i + 1}`
                    ).join('')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </FlexibleTable>
            </div>
          </NoPageBreak>
        </PageSectionOrientation>

        <div>
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