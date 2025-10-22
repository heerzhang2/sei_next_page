"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useStorage } from "@/report/StorageContext"
import { indexedDBStorage } from "@/lib/indexed-db-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export interface SubReportConfig {
    catKey: string
    component: React.ComponentType<any>
    collapse?: boolean
    cat?: any
    title?: string
}

interface SubRepProps {
    modType: string
    rep: any
    title: string
    collapse?: boolean
    children: React.ReactNode
}

interface SingeSubRepProps {
    rep: any
    subrid: string
    title: string
    children: React.ReactNode
}

export default function SubRep({ modType, rep, title, collapse = false, children }: SubRepProps) {
    const { storage } = useStorage()
    const [isOpen, setIsOpen] = useState(!collapse)

    return (
        <div className="my-4">
            {collapse ? (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <Card>
                        <CollapsibleTrigger className="w-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{title}</CardTitle>
                                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent>{children}</CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            )}
        </div>
    )
}

export function SingeSubRep({ rep, subrid, title, children }: SingeSubRepProps) {
    const { storage, parrepfs } = useStorage()
    const [subrepData, setSubrepData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadSubrepData = async () => {
            try {
                const indexedData = await indexedDBStorage.load(rep?.id, subrid)

                if (indexedData && indexedData.metadata.modified) {
                    // Use IndexedDB data if modified but not yet sent
                    console.log("[SingeSubRep] Using modified data from IndexedDB for subrid:", subrid)
                    setSubrepData(indexedData.storage)
                } else {
                    // Use network data from rep.isp.reps
                    const subrep = rep?.isp?.reps?.edges?.find(({ node }: any) => node.id === subrid)?.node

                    if (subrep?.data) {
                        const dat = JSON.parse(subrep.data)
                        console.log("[SingeSubRep] Using network data for subrid:", subrid)
                        setSubrepData(dat)
                    }
                }
            } catch (error) {
                console.error("[SingeSubRep] Failed to load sub-report data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadSubrepData()
    }, [rep, subrid])

    if (isLoading) {
        return <div className="p-4 text-sm text-muted-foreground">加载子报告数据...</div>
    }

    return (
        <Card className="my-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}
