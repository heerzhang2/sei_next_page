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

export default function MultiTableFormExample() {
    const { storage } = useStorage()

    return (
        <CollapsibleFormSection title="加速度测量表单" defaultOpen={true}>
 xcgdfg
        </CollapsibleFormSection>
    )
}
