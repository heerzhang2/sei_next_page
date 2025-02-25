/** @jsxImportSource @emotion/react */
'use client';
import Link from "next/link";
import Header from "@/component/header";
import FootBar from "@/component/footbar";
import {Global} from "@emotion/react";


/* 不能省略掉第一行的 @jsxImportSource @emotion/react
* */
export default function Home() {
  return (
      <div>


          <div  css={{minHeight: '100vh'}}>
              111<br/>
              正常A4   竖着的但因
          </div>
          《<br/>》11版本内容！

      </div>
  );
}
