"use client"
import * as React from "react"
import { z } from "zod"
import { CollapsibleFormSection } from "@/components/chub"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStorage } from "@/report/StorageContext"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function PageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRedId = searchParams.get("redId") || "0"

    const switchRedId = (newRedId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("redId", newRedId)
        params.set("original", "1") // 保持其他参数
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">仪器编号管理</h1>
                <div className="flex gap-2">
                    <Button variant={currentRedId === "0" ? "default" : "outline"} onClick={() => switchRedId("0")}>
                        redId = 0
                    </Button>
                    <Button variant={currentRedId === "1" ? "default" : "outline"} onClick={() => switchRedId("1")}>
                        redId = 1
                    </Button>
                    <Button variant={currentRedId === "2" ? "default" : "outline"} onClick={() => switchRedId("2")}>
                        redId = 2
                    </Button>
                </div>
            </div>

        </div>
    )
}

export default function Page() {
    const { storage } = useStorage()
    return (
            <Suspense fallback={<div>Loading...</div>}>
                    <PageContent />
            </Suspense>

    )
}
