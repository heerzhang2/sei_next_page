"use client"
import React, {} from "react"
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import { useFormFramework} from "@/report/hook/useFormFramework";
import {FootMensLine, } from "@/report/common/view";
import {Badge, Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Separator, Textarea} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, FormSelectField, SuffixInput} from "@/components/chub";
import {FormSwitch} from "@/components/shub";
import {cn} from "@/lib/utils";

export const ReviewSels = [
    { value: "齐全" },
    { value: "缺失" },
    { value: "无资料" },
]
const jgwtLst=[`1、系统中压力表、安全阀经校验合格；
2、所检项目未见异常。`,
]
export const itemA安全附件: string[]=['设资料','安资料','改资料','使资料','检资料', '压表检'];
export const MaterialReview = ({
                                children,
                                show,
                                label,
                                rep,
                            }: InternalItemProps) => {
    const { storage, } = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        schemaTab['r'] = z.string().optional()
        schemaTab['s'] = z.boolean().optional()
        schemaTab['L'] = z.string().optional()
        schemaTab['X'] = z.boolean().optional()
        schemaFields.设资料= z.object(schemaTab)
        schemaFields.安资料= z.object(schemaTab)
        schemaFields.改资料= z.object(schemaTab)
        schemaFields.使资料= z.object(schemaTab)
        schemaFields.检资料= z.object(schemaTab)
        schemaFields.上次报告= z.string().optional()
        schemaFields.上次评级= z.string().optional()
        schemaFields.上次缺处= z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields.设资料= storage.设资料?? {};
        fields.安资料= storage.安资料?? {};
        fields.改资料= storage.改资料?? {};
        fields.使资料= storage.使资料?? {};
        fields.检资料= storage.检资料?? {};
        fields.上次报告= storage.上次报告 ?? "";
        fields.上次评级= storage.上次评级 ?? "";
        fields.上次缺处= storage.上次缺处 ?? "";
        return fields
    }, [storage,])
    const { render, form } = useFormFramework({schema, defaultValues, rep,})
    const content = React.useMemo(() => {
        return (
            <>
                <Card className="py-1 gap-1">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            {label}
                            <Badge variant="secondary">共 5 项审查</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-1 mb-2">
                        <strong>设计资料</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`设资料.r`} control={form.control} render={({field}) => (
                                <FormSelectField options={ReviewSels} label={'审查结果'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={`设资料.s`} control={form.control} render={({ field }) => (
                                <FormSwitch field={field} label='非首次定期检验'/>
                            )}/>
                            <FormField name={"设资料.L"} control={form.control} render={({ field }) => (
                                   <FormItem className="pt-2 w-full break-inside-avoid">
                                       <FormLabel className="select-text">缺失情况</FormLabel>
                                       <FormControl className="w-full mr-1"><BlobInputList rows={2} {...field}/></FormControl>
                                       <FormMessage />
                                   </FormItem>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>安装资料</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`安资料.r`} control={form.control} render={({field}) => (
                                <FormSelectField options={ReviewSels} label={'审查结果'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={`安资料.s`} control={form.control} render={({ field }) => (
                                <FormSwitch field={field} label='非首次定期检验'/>
                            )}/>
                            <FormField name={"安资料.L"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">缺失情况</FormLabel>
                                    <FormControl className="w-full mr-1"><BlobInputList rows={2} {...field}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>改造或者重大修理资料</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`改资料.X`} control={form.control} render={({ field }) => (
                                <FormSwitch field={field} label='无此项'/>
                            )}/>
                            <FormField name={`改资料.r`} control={form.control} render={({field}) => (
                                <FormSelectField options={ReviewSels} label={'审查结果'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={`改资料.s`} control={form.control} render={({ field }) => (
                                <FormSwitch field={field} label='非首次定期检验'/>
                            )}/>
                            <FormField name={"改资料.L"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">缺失情况</FormLabel>
                                    <FormControl className="w-full mr-1"><BlobInputList rows={2} {...field}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>使用管理资料</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`使资料.r`} control={form.control} render={({field}) => (
                                <FormSelectField options={ReviewSels} label={'审查结果'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={"使资料.L"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">缺失情况</FormLabel>
                                    <FormControl className="w-full mr-1"><BlobInputList rows={2} {...field}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>检验、检查资料</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`检资料.r`} control={form.control} render={({field}) => (
                                <FormSelectField options={ReviewSels} label={'审查结果'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={"检资料.L"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">缺失情况</FormLabel>
                                    <FormControl className="w-full mr-1"><BlobInputList rows={2} {...field}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>
                <Card className="py-2 px-1 gap-2">
                    <CardHeader>
                        <CardTitle><strong>上次定期检验问题</strong></CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-1">
                        <FormField name={"上次报告"} control={form.control} render={({ field }) => (
                            <FormItem className="pt-2 w-full break-inside-avoid">
                                <FormLabel className="select-text">上次定期检验报告编号：</FormLabel>
                                <FormControl className="w-full">
                                    <BlobInputList rows={2} {...field} datalist={[]} className="text-base md:text-sm max-w-[22rem]"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField name={"上次评级"} control={form.control} render={({ field }) => (
                            <FormItem className="pt-2 w-full break-inside-avoid">
                                <FormLabel className="select-text">上次定期检验安全状况等级评为</FormLabel>
                                <FormControl className="w-full">
                                    <BlobInputList rows={1} unit='级。' {...field} datalist={[]} className="text-base md:text-sm max-w-[15rem] text-center"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField name={"上次缺处"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel className="select-text">上次定期检验问题记载（注明上次定期检验发现的主要缺陷及处理情况）</FormLabel>
                                    <FormControl className="w-full">
                                        <Textarea rows={6} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                        )}/>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">
                        {children}
                    </CardFooter>
                </Card>
            </>
        )
    }, [children, form])

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            {render(content)}
        </CollapsibleFormSection>
    )
}

interface ViewProps {
    orc: any
    rep: any
    children?: React.ReactNode
}
export const MaterialReviewVw = ({orc, rep, children }: ViewProps) => {
    return <PrintReserveLeast reserve="6rem"
                              title={<>
                                  <h2 id='MaterialReview' className="block text-center leading-[0.9] text-3xl font-normal mt-4">工业管道资料审查报告</h2>
                                  <div className="flex justify-between text-sm">
                                      <span>单位内部编号：{orc.单位内部编号}</span>
                                      <span className="@3xl:mr-4"></span>
                                  </div>
                              </>}
    >
        <FlexibleTable columnWidths={["13%","9%","9%","9%","%"]} className="text-sm border-collapse">
            <TableHeader>
                <TableRow>
                    <CCell>审查项目</CCell><CCell colSpan={3}>审查结果</CCell><CCell>缺失情况</CCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                <RepLink ori rep={rep} tag={'MaterialReview'}>
                    <TableRow>
                        <CCell rowSpan={2}>设计资料</CCell>
                        <CCell>( {'齐全'===orc?.设资料?.r&&'✔'} )齐全</CCell><CCell>( {'缺失'===orc?.设资料?.r&&'✔'} )缺失</CCell><CCell>( {'无资料'===orc?.设资料?.r&&'✔'} )无资料</CCell>
                        <CCell rowSpan={2} className="whitespace-pre-wrap">
                           {orc?.设资料?.L || '／'}
                        </CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>( {orc?.设资料?.s&&'✔'} )非首次定期检验</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>安装资料</CCell>
                        <CCell>( {'齐全'===orc?.安资料?.r&&'✔'} )齐全</CCell><CCell>( {'缺失'===orc?.安资料?.r&&'✔'} )缺失</CCell><CCell>( {'无资料'===orc?.安资料?.r&&'✔'} )无资料</CCell>
                        <CCell rowSpan={2} className="whitespace-pre-wrap">
                            {orc?.安资料?.L || '／'}
                        </CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>( {orc?.安资料?.s&&'✔'} )非首次定期检验</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>改造或者重大修理资料</CCell>
                        <CCell>( {'齐全'===orc?.改资料?.r&&'✔'} )齐全</CCell><CCell>( {'缺失'===orc?.改资料?.r&&'✔'} )缺失</CCell><CCell>( {'无资料'===orc?.改资料?.r&&'✔'} )无资料</CCell>
                        <CCell rowSpan={2} className="whitespace-pre-wrap">
                            {orc?.改资料?.L || '／'}
                        </CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>( {orc?.改资料?.s&&'✔'} )非首次定期检验</CCell><CCell>( {orc?.改资料?.X&&'✔'} )无此项</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>使用管理资料</CCell>
                        <CCell>( {'齐全'===orc?.使资料?.r&&'✔'} )齐全</CCell><CCell>( {'缺失'===orc?.使资料?.r&&'✔'} )缺失</CCell><CCell>( {'无资料'===orc?.使资料?.r&&'✔'} )无资料</CCell>
                        <CCell className="whitespace-pre-wrap">
                            {orc?.使资料?.L || '／'}
                        </CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>检验、检查资料</CCell>
                        <CCell>( {'齐全'===orc?.检资料?.r&&'✔'} )齐全</CCell><CCell>( {'缺失'===orc?.检资料?.r&&'✔'} )缺失</CCell><CCell>( {'无资料'===orc?.检资料?.r&&'✔'} )无资料</CCell>
                        <CCell className="whitespace-pre-wrap">
                            {orc?.检资料?.L || '／'}
                        </CCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable columnWidths={["13%","%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={'MaterialReview'}>
                    <TableRow>
                        <CCell rowSpan={2}>上次定期检验问题记载</CCell>
                        <CCell>上次定期检验报告编号： {orc.上次报告 || '／'}<br/>
                            上次定期检验安全状况等级评为： {orc.上次评级 || '／'} 级。
                        </CCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="border border-gray-700 min-h-[4rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem]">
                            <div className={cn("min-h-[5rem]", orc.上次缺处?.length>20 ? "" : "text-center mt-4",)}
                            >{orc.上次缺处 || '／'}</div>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine />
    </PrintReserveLeast>
}
