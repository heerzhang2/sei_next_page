"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from "react"
import {OriginalView} from "@/report/recreation/slidingJj/Regular.O-1";
import * as React from "react";

export default function Page() {
    const params = useParams()
    console.log("Page前params=", params);
    const [action, setAction] = useState<string | null>(null)
    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])

    return (
      <OriginalView action={action!} verId={'1'}/>
   )
}


/* const [code, setCode] = useState(``)
  <textarea
      className="w-full resize-none bg-transparent outline-none"
      value={code}
      onChange={(e) => setCode(e.target.value)}
  />
  <p className="h-2">mouyige Action==编辑区的----滚动果</p>
* */