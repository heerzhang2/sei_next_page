"use client"

import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {EditControlProvider} from "@/component/rep/editControl-provider";
import {useParams} from "next/navigation";
import Skeleton from "@/component/rep/skeleton";
import Sidebar from "@/component/rep/sidebar";

//变身 公用组件：
export default function ReportLayout({
  children,repPanel,items
}: Readonly<{
  children: React.ReactNode,
  repPanel: React.ReactNode,
  items: {
    title: string
    url: string
  }[],
}>) {
  const params = useParams()
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  //这才能绝对避免水和的报错！
  if (!isClient) {
    return <div className="skelon-placeholder">SSR加载中...</div>;
  }
  // After hydration, render the full component
    //不能再加<EditControlProvider>，上面层次组件提供了
    //children有两类情形：1，正式报告或记录  2，单独的编制编辑器。
    return (
      <div  className="flex h-screen print:h-auto">
          {params?.action ? <>
                <div className="flex-1 overflow-hidden">
                  <div className="mx-auto px-0 pt-0 pb-0">
                    <div className="flex flex-col min-h-screen">
                      <header className="border-b">
                      </header>
                      <Skeleton repPanel={repPanel}>{children}</Skeleton>
                    </div>
                  </div>
                </div>
                <Sidebar items={items}/>
              </>
            :
            children
          }
      </div>
    )
}
