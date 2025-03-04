"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Code, FileCode, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {SplitView} from "@/components/split-view";
import ReportOrRecord from "@/component/reportOrRecord";


export default function Page() {
    const params = useParams()
    const [action, setAction] = useState<string | null>(null)
    const [code, setCode] = useState(`function greeting() {
  return "Hello, world!";
}
旧版的编辑区域范围的
// Call the function
console.log(greeting());`)

    useEffect(() => {
        if (params && params.action) {
            setAction(params.action as string)
        }
    }, [params])

    return (<>
              <textarea
                  className="w-full h-full resize-none bg-transparent outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
              />

      </>
        )

}
