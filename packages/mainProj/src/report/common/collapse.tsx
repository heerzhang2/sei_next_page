"use client"

import React, {ReactNode, useEffect} from "react";
import {Button, Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui";
import {ChevronDown, ChevronUp} from "lucide-react";
import {useStorage} from "@/report/StorageContext";

interface CollapseFxProps {
    children: ReactNode
    //进入打印预览的：
    printMode?: boolean
    //可独立流转分项报告id
    subrid?: string;
}

/**打印模式全部展开，浏览或编辑模式要折叠的形态；
 * 报告适当的折叠，浏览编辑形态模式中：避免一次展示出太多了。
 * */
export function CollapseFx({printMode, children,subrid
                }: CollapseFxProps)
{
    //依据subrType来判定：当前是否在可流转子报告单独显示状态下的。 subrType=undefined 表示主报告里嵌入集成的显示上下文中。
    const { subrType, } = useStorage()
    const [isOpen, setIsOpen] = React.useState(printMode)
    useEffect(() => {
        setIsOpen(printMode)
    }, [printMode])
    //不是可独立流转子报告模式的，不是打印预览目的：
  if(printMode || (subrid && subrType))
      return children
  else return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}
                   className={"flex w-full flex-col gap-0"}
      >
          <div className={"flex gap-4 px-4"}>
              <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="font-semibold" aria-label="展开分项">
                      <span>详细内容...</span>
                      { isOpen? <ChevronUp /> : <ChevronDown />}
                  </Button>
              </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-0">
              {children}
           </CollapsibleContent>
      </Collapsible>
  )
}
