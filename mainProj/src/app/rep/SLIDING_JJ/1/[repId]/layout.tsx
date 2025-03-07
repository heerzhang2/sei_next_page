"use client"

import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


    return (<>
      <div   className="flex min-h-screen">
               {children}
      </div>
        </>
  )
}
