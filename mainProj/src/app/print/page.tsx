/** @jsxImportSource @emotion/react */
'use client';
import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import {Global} from "@emotion/react";
import NoPageBreak from "@/components/no-page-break";
import {FlexibleTable, TableBody, TableCell, TableHead, TableRow} from "@/components/flexible-table";
import {useMediaPrint} from "@/hooks/use-media-print";


/*
打印测试
* */
export default function Home() {
    useMediaPrint(true,true,"A4","10mm")
  return (
      <>
          <div className={"dASqww UsualChapter  Alld"}>

              <section className={"dASqww UsualChapter  Alld"} css={{minHeight: '40vh'}}>
                  111<br/>
                  正常A4 竖着的但因---------------------fdgdfgdf==============形成个性风格豆565 46564 5645腐干豆腐干
              </section>
              《<br/>》11版本内容！

          </div>

          <div className={"duuw WideChapter unhhuld"}>
              <div className={"Wqww    dRTffld"}  css={{minHeight: '55vh'}}>
                  cbvvccfgcfdfd<br/>
                  6787687
              </div>
              <NoPageBreak title={<>df<br/>
                  zhong jia正宗midd</>} titleHeight="3.2rem">
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
          </div>

          <div>

              <div className={"Wqww   WideChapter dRTffld"}>
                  3333中的<br/>
                  横版本
              </div>
              <div className={"Wjj  WideChapter dRTlll"}>
                  《<br/>》版33333内容！
              </div>

          </div>
      </>
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