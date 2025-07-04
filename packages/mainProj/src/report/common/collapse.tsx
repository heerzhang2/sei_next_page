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
export function CollapseFx({ printMode = false, children, subrid }: CollapseFxProps) {
    const { subrType } = useStorage();
    const [isOpen, setIsOpen] = React.useState(!!printMode);
    return (
        (!printMode && (!subrid || !subrType)) ? (
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="flex w-full flex-col gap-0"
            >
                <div className="flex gap-4 px-4">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="font-semibold" aria-label="展开分项">
                            <span>详细内容...</span>
                            {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="flex flex-col gap-0">{children}</CollapsibleContent>
            </Collapsible>
        )
         :
        children
    );
}

