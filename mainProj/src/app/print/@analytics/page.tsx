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
          <Global
              styles={{
                  html: {
                      "@page": {
                          size: 'A4 portrait',
                          // size: 'A4 landscape',
                      },
                      "#root #floormenu": {
                          // display: 'none',
                          opacity: '0.3' //: 'unset',
                      }
                  }
              }}
          />

          <div  css={{minHeight: '100vh'}}>
              3333中的<br/>
              横版本
          </div>
          《<br/>》版33333内容！

      </div>
  );
}
