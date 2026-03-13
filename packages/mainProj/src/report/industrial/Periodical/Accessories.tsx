"use client"
import React, {} from "react"
import {CCell, FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {type InternalItemProps, RepLink} from "@/report/common/base";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import { useFormFramework} from "@/report/hook/useFormFramework";
import {FootMensLine, } from "@/report/common/view";
import {Badge, Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Separator, Textarea} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, FormSelectField, SuffixInput} from "@/components/chub";
import {YesNos} from "@/report/common/editor";

const jgwtLst=[`1、系统中压力表、安全阀经校验合格；
2、所检项目未见异常。`,
]
export const itemA安全附件: string[]=['附件备注','附件问题','安阀检','爆片检','急断阀','压表检'];
export const Accessories = ({
                                children,
                                show,
                                label,
                                rep,
                            }: InternalItemProps) => {
    const { storage, } = useStorage()
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        const schemaTab = {} as any
        schemaTab['no'] = z.string().optional()
        schemaTab['s'] = z.string().optional()
        schemaTab['Y'] = z.string().optional()
        schemaTab['IS'] = z.string().optional()
        schemaFields.安阀检= z.object(schemaTab)
        schemaFields.爆片检= z.object(schemaTab)
        schemaFields.急断阀= z.object(schemaTab)
        schemaFields.压表检= z.object(schemaTab)
        schemaFields.附件备注= z.string().optional()
        schemaFields.附件问题= z.string().optional()
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields.安阀检= storage.安阀检?? {no:"",};
        fields.爆片检= storage.爆片检?? {no:"",};
        fields.急断阀= storage.急断阀?? {s:"",};
        fields.压表检= storage.压表检?? {s:"",};
        fields.附件备注= storage.附件备注 ?? "";
        fields.附件问题= storage.附件问题 ?? "";
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
                            <Badge variant="secondary">共 4 项检验</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-1 mb-2">
                        <strong>安全阀检验</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`安阀检.no`} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">校验记录编号</FormLabel>
                                    <FormControl><Input {...field} /></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name="安阀检.s" control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">数量</FormLabel>
                                    <FormControl><SuffixInput unit='个'  {...field}/></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name={`安阀检.Y`} control={form.control} render={({field}) => (
                                <FormSelectField options={YesNos} label={'是否在校验有效期内'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>爆破片装置检验</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`爆片检.no`} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">型号</FormLabel>
                                    <FormControl><Input {...field} /></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name="爆片检.s" control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">数量</FormLabel>
                                    <FormControl><SuffixInput unit='个'  {...field}/></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name={`爆片检.Y`} control={form.control} render={({field}) => (
                                <FormSelectField options={YesNos} label={'是否按期更换'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>紧急切断阀检验</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`急断阀.no`} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">型式与规格</FormLabel>
                                    <FormControl><Input {...field} /></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name="急断阀.s" control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">数量</FormLabel>
                                    <FormControl><SuffixInput unit='个'  {...field}/></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name={`急断阀.Y`} control={form.control} render={({field}) => (
                                <FormSelectField options={YesNos} label={'是否完好'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                        </div>
                        <Separator className="my-2"/>
                        <strong>压力表检验</strong>
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-1 @md:gap-3">
                            <FormField name={`压表检.no`} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">编号</FormLabel>
                                    <FormControl><Input {...field} value={field.value||''}/></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name="压表检.s" control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid">
                                    <FormLabel className="select-text">数量</FormLabel>
                                    <FormControl><SuffixInput unit='个'  {...field}/></FormControl><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name={`压表检.Y`} control={form.control} render={({field}) => (
                                <FormSelectField options={YesNos} label={'是否在检定有效期内'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                            <FormField name={`压表检.IS`} control={form.control} render={({field}) => (
                                <FormSelectField options={YesNos} label={'无检定要求'}
                                                 field={field} selectClass="w-full @md:max-w-[20rem]"/>
                            )}/>
                        </div>
                    </CardContent>
                </Card>
                <Card className="py-1 gap-2">
                    <CardContent className="p-0 space-y-1">
                        <FormField name={"附件备注"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel className="select-text">备注：</FormLabel>
                                    <FormControl className="w-full">
                                        <Textarea rows={4} {...field} value={typeof field.value === 'string' ? field.value : ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                        )}/>
                        <FormField name={"附件问题"} control={form.control} render={({ field }) => (
                               <FormItem className="pt-2 w-full break-inside-avoid">
                                   <FormLabel className="select-text">发现问题描述：</FormLabel>
                                   <FormControl className="w-full">
                                       <BlobInputList rows={5} {...field} datalist={jgwtLst} className="text-base md:text-sm"/>
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
export const AccessoriesVw = ({orc, rep, children }: ViewProps) => {
    return <PrintReserveLeast reserve="6rem"
                              title={<>
                                  <h2 id='Accessories' className="block text-center leading-[0.9] text-3xl font-normal mt-4">安全附件与仪表检验报告</h2>
                                  <div className="flex justify-between text-sm">
                                      <span>单位内部编号：{orc.单位内部编号}</span>
                                      <span className="@3xl:mr-4"></span>
                                  </div>
                              </>}
    >
        <FlexibleTable columnWidths={["14%","%","15%","9%","15%","4%","25%"]} className="text-sm border-collapse">
            <TableBody>
                <RepLink ori rep={rep} tag={'Accessories'}>
                    <TableRow>
                        <CCell rowSpan={3}>安全阀检验</CCell><CCell>校验记录编号</CCell><CCell colSpan={5}>{orc?.安阀检?.no || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>数量</CCell><CCell colSpan={3}>{orc?.安阀检?.s || '／'}</CCell><CCell>个</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否在校验有效期内</CCell><CCell>( {('是'===orc?.安阀检?.Y)? '✔' : orc?.安阀检?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.安阀检?.Y)? '✔' : orc?.安阀检?.Y? '':'／'} )否</CCell><CCell colSpan={2}></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={3}>爆破片装置检验</CCell><CCell>型号</CCell><CCell colSpan={5}>{orc?.爆片检?.no || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>数量</CCell><CCell colSpan={3}>{orc?.爆片检?.s || '／'}</CCell><CCell>个</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否按期更换</CCell><CCell>( {('是'===orc?.爆片检?.Y)? '✔' : orc?.爆片检?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.爆片检?.Y)? '✔' : orc?.爆片检?.Y? '':'／'} )否</CCell><CCell colSpan={2}></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={3}>紧急切断阀检验</CCell><CCell>型式与规格</CCell><CCell colSpan={5}>{orc?.急断阀?.no || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>数量</CCell><CCell colSpan={3}>{orc?.急断阀?.s || '／'}</CCell><CCell>个</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否完好</CCell><CCell>( {('是'===orc?.急断阀?.Y)? '✔' : orc?.急断阀?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.急断阀?.Y)? '✔' : orc?.急断阀?.Y? '':'／'} )否</CCell><CCell colSpan={2}></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={3}>压力表检验</CCell><CCell>编号</CCell><CCell colSpan={5}>{orc?.压表检?.no || '／'}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>数量</CCell><CCell colSpan={3}>{orc?.压表检?.s || '／'}</CCell><CCell>个</CCell><CCell></CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>是否在检定有效期内</CCell><CCell>( {('是'===orc?.压表检?.Y)? '✔' : orc?.压表检?.Y? '':'／'} )是</CCell>
                        <CCell></CCell><CCell>( {('否'===orc?.压表检?.Y)? '✔' : orc?.压表检?.Y? '':'／'} )否</CCell>
                        <CCell></CCell><CCell>( {'是'===orc?.压表检?.IS && '✔'} )无检定要求</CCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="border border-gray-700">备注：</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="border border-gray-700 min-h-[4rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem]">
                            <div className="min-h-[2rem]">{orc?.附件备注 || '／'}</div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="border border-gray-700">发现问题描述：</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="border border-gray-700 min-h-[4rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem]">
                            <div className="min-h-[4rem]">{orc?.附件问题 || '／'}</div>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FootMensLine />
    </PrintReserveLeast>
}
