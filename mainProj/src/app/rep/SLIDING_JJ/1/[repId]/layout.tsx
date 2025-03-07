"use client"

import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";
import {EditControlProvider} from "@/app/rep/SLIDING_JJ/1/[repId]/editControl-provider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

    return (<>
      <div  className="flex min-h-screen">
        <EditControlProvider>
          {children}
        </EditControlProvider>
      </div>
      </>
  )
}
