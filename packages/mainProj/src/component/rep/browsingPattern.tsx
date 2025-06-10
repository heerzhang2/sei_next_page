"use client"
import React from "react";
import Sidebar from "@/component/rep/sidebar";

interface ReportProps {
    items: {
        title: string
        url: string
    }[],
    children: React.ReactNode
}
/**浏览形态的报告，不带编辑器的
* */
export default function BrowsingPattern({ items,children }: ReportProps) {
  // let photos = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
      <>
          <div className="flex-1 overflow-auto">
              <div className="mx-auto px-0 md:px-6 py-8 print:px-0 print:py-0">
                  <div  className="flex flex-col min-h-screen">
                      <header className="print:hidden border-b">
                          <div className="container flex items-center justify-between h-14">
                              <h1 className="text-xl font-bold">福建特检</h1>

                          </div>
                      </header>
                      {children}
                  </div>
              </div>
          </div>
          <Sidebar items={items}/>
      </>
  );
}
