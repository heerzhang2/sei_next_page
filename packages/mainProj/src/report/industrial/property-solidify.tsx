"use client"

import * as React from "react"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel } from "@/components/ui"
import { CollapsibleFormSection } from "@/components/chub"
import { useFormFramework } from "@/report/hook/useFormFramework"
import { PipingUnitSelector } from "@/components/piping-unit/piping-unit-selector"
import type { IPipingUnitEntity } from "@/types/piping-unit"


export const itemA结论 = ["检验结论", "新下检日", "检验日期", "检验日期1", "参检人员"]
//下结论页面：
export const PropertySolidify = ({
                                     children,
                                     show,
                                     label,
                                     rep,
                                 }: InternalItemProps) => {
    const { storage } = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        // itemA结论.forEach((name) => {
        //     schemaFields[name] = z.string().optional()
        // })
        //不用 schemaFields['units'] = z.array(z.any()).optional()
        // 首先定义 IPipingUnitEntity 的 Zod schema
        const pipingUnitSchema = z.object({
            id: z.string(),
            code: z.string(),
            rno: z.string(),
            name: z.string(),
            ust: z.string(),
            reg: z.string(),
            nxtd1: z.string(),
            nxtd2: z.string(),
            start: z.string(),
            stop: z.string(),
            proj: z.string(),
            leng: z.number(),
            useu: z.object({
                id: z.string(),
                name: z.string(),
            }),
            pipe: z.object({
                id: z.string(),
                cod: z.string(),
                oid: z.string(),
                useu: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
            }),
            crDate: z.string(),
        })

        // 然后在 schemaFields 中使用
        schemaFields["units"] = z.array(pipingUnitSchema).optional()
        // units: IPipingUnitEntity[]
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        // itemA结论.forEach((name) => {
        //     fields[name] = storage[name] ?? ""
        // })
        fields.units = (storage["units"] as IPipingUnitEntity[]) ?? []
        return fields
    }, [storage])

    const { render,form, } = useFormFramework({ schema, defaultValues, rep })
    const content =<>
        <Card className="py-1 mb-2 gap-2 max-w-[60rem] m-auto">
            <CardHeader>
                <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="px-1 max-w-[40rem] m-auto">
                <h5>(报告)：</h5>
                <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>选择管道单元</FormLabel>
                            <FormControl>
                                <PipingUnitSelector pipelineId={rep.isp.dev.id}
                                    field="units"
                                    initialUnits={field.value}
                                    onSelectionChange={field.onChange}
                                    className="w-full"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {children}
            </CardContent>
        </Card>
    </>

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}
