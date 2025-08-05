import * as React from "react";
import {CCellUnit, InternalItemProps, RepLink} from "../../common/base";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {Card, CardContent, CardFooter, CardHeader, CardTitle, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Textarea} from "@/components/ui";
import {CollapsibleFormSection, FormSelectField} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {useThreeColumnView} from "@/report/hook/useThreeColumnSubr";
import {CCell, FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {安全评定选, 结论选} from "@/report/industrial/Periodical/rarelyVary";
import {FormHybridSelect} from "@/components/shub";
// import {config设备概况} from "@/report/industrial/Periodical/indPipelineO1";

interface ConclusionProps  extends InternalItemProps{
    startd?: boolean;
    nxtstyp?: string;
    rslist?: { value: string; label?: any }[],
    cjry?: boolean;
}
export const 工作介质选=['蒸汽','导热油','见管道特性表'];
export const itemA结论 = ['检验结论','新下检日','检验日期','检验日期1','问题及处','结论说明','安全评定',
    '结论压力','结论温度','结论介质','结论其它'
];
//下结论页面：
export const ConclusionIndPer = ({ children, show,  redId, nestMd, label, rep,
                                      startd=false,nxtstyp='检验',rslist=结论选,cjry}: ConclusionProps) => {
    const {storage,} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        itemA结论.forEach((name) => {
            schemaFields[name] = z.string().optional()
        })
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        itemA结论.forEach((name) => {
            fields[name] = storage[name] ?? ""
        })
        return fields
    }, [storage])
    const { render,form } = useFormFramework({schema, defaultValues, rep})

    const content = React.useMemo(() => {
            return (
                <>
                    <Card className="py-1 mb-2 gap-2 m-auto">
                       <CardHeader>
                          <CardTitle>{label}</CardTitle>
                       </CardHeader>
                       <CardContent className="px-1 m-auto">
                          <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                            <FormField control={form.control} name={`检验结论`}
                                       render={({ field }) => (
                                           <FormSelectField field={field} label={"检验结论"} options={rslist}
                                                  selectClass="w-full min-w-[15rem] text-2xl"
                                           />
                                       )}
                            />
                            <FormField control={form.control} name="检验日期"
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                               <FormLabel className="select-text">{`设置${nxtstyp}日期`}</FormLabel>
                                               <FormControl className="w-full">
                                                   <Input type="date"  {...field}  />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                            />
                            { startd &&
                                <FormField control={form.control} name="检验日期1"
                                           render={({ field }) => (
                                               <FormItem className="pt-2 w-full break-inside-avoid">
                                                   <FormLabel className="select-text">检验起始日期</FormLabel>
                                                   <FormControl className="w-full">
                                                       <Input type="date"  {...field}  />
                                                   </FormControl>
                                                   <FormMessage />
                                               </FormItem>
                                           )}
                                />
                            }
                            <FormField control={form.control} name="新下检日"
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                               <FormLabel className="select-text">下次定期检验日期</FormLabel>
                                               <FormControl className="w-full">
                                                   <Input type="date"  {...field}  />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                            />
                         </div>
                       </CardContent>
                    </Card>
                    <Card className="py-2 px-1 gap-2">
                        <CardHeader>
                            <CardTitle><strong>允许（监控）工作条件</strong></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-1">
                            <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                                <FormField name={`结论压力`} control={form.control} render={({ field }) => (
                                    <FormHybridSelect field={field} label='压力' options={[]} unit='MPa'/>
                                )}/>
                                <FormField name={`结论温度`} control={form.control} render={({ field }) => (
                                    <FormHybridSelect field={field} label='温度' options={[]} unit='℃'/>
                                )}/>
                                <FormField name={`结论介质`} control={form.control} render={({ field }) => (
                                    <FormHybridSelect field={field} label='介质' defSel options={工作介质选}/>
                                )}/>
                                <FormField name={`结论其它`} control={form.control} render={({ field }) => (
                                    <FormHybridSelect field={field} label='其它' rows={2}/>
                                )}/>
                                <FormField name={`安全评定`} control={form.control} render={({field}) => (
                                    <FormSelectField options={安全评定选} label={'安全状况等级评定为'}
                                                     field={field} selectClass="w-full @md:max-w-[20rem]"/>
                                )}/>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-2 px-1 gap-2">
                        <CardHeader>
                            <CardTitle><strong>问题及其处理</strong></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-1">
                            <FormField name={"问题及处"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel className="select-text">[检验发现的缺陷位置、性质、程度及处理意见（必要时附图或者附页，也可以直接注明见某项报告）]</FormLabel>
                                    <FormControl className="w-full">
                                        <Textarea rows={15} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField name={"结论说明"} control={form.control} render={({ field }) => (
                                <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                    <FormLabel className="select-text">说明（包括变更情况）</FormLabel>
                                    <FormControl className="w-full">
                                        <Textarea rows={10} {...field} />
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
        },
        [children,],
    )

    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(content)}
    </CollapsibleFormSection>;
};

//结论转换函数
export const mapBoilerResult = (input: "符合要求" | "基本符合要求" | "不符合要求"): "符合" | "不符合" => {
    switch (input) {
        case "符合要求":
        case "基本符合要求":
            return "符合";
        case "不符合要求":
        default:
            return "不符合";
    }
};
//[报错]Cannot access 'config设备概况' before initialization不能把config设备概况放入到indPipelineO1.tsx文件做初始化，循环依赖初始化错误。配套的这里const config设备上=config设备概况.slice(0, 7);
//不能放在这里做！ const config设备上=config设备概况.slice(0, 7);       const config设备下=config设备概况.slice(7); 循环依赖的初始化错误！改成第三方注入了。
export const ConclusionVw= ({orc,rep,config1,config2}
                            : { orc: any,rep:any,config1:any[],config2:any[]}
) => {
    const renderUpper=usePrefixDataTable({config: config1, orc, rep, slash:true});
    const [performant]=useThreeColumnView({orc, config:config2,slash:true,
                                        embedCol: [ <CCell key='1' rowSpan={4}>性能参数</CCell> ] });
    const result1=mapBoilerResult(orc?.检验结论)
    return <React.Fragment>
        <PrintReserveLeast reserve="10rem"
                   title={<>
                       <h2 id='Conclusion' className="text-center leading-[0.9] text-3xl font-normal mt-4 mb-2">工业管道定期检验结论报告</h2>
                   </>}>
            <FlexibleTable id='Survey' columnWidths={ ["5%", "10%", "%", "6%","8.8%","30%"] } className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={'Survey'}>
                        {renderUpper}
                    </RepLink>
                    <TableRow>
                        <CCell colSpan={2}>检验依据</CCell>
                        <CCell colSpan={4}>《压力管道安全技术监察规程——工业管道》（TSG D0001-2009）<br/>
                            《压力管道定期检验规则——工业管道》（TSG D7005-2018）</CCell>
                    </TableRow>
                </TableBody>
            </FlexibleTable>
        </PrintReserveLeast>
        <FlexibleTable columnWidths={ ["5%", "10%", "%", "6%","9%","10%","30%"] }  className="text-sm">
            <TableBody>
                <RepLink ori rep={rep} tag={'Conclusion'}>
                    <TableRow>
                        <CCell colSpan={2}>问题及其处理</CCell>
                        <TableCell colSpan={5} className="border border-gray-700">
                            [检验发现的缺陷位置、性质、程度及处理意见（必要时附图或者附页，也可以直接注明见某项报告）]<br/>
                            <div className="min-h-[4rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                {orc?.问题及处 || '／'}
                            </div>
                        </TableCell>
                    </TableRow>
                </RepLink>
                <RepLink ori rep={rep} tag={'Survey'}>
                    {performant}
                </RepLink>
            </TableBody>
        </FlexibleTable>
        <FlexibleTable  columnWidths={["6%","26%","6%","24%","6%","%"]}  className="text-sm">
            <TableBody>
                <RepLink rep={rep} tag={'Conclusion'}>
                    <TableRow>
                        <CCell split={false} rowSpan={5}>检查结论</CCell>
                        <CCell>安全状况等级评定为</CCell>
                        <CCell colSpan={4} className="text-base">{orc.安全评定 || '／'}</CCell>
                    </TableRow>
                    <TableRow >
                        <CCell rowSpan={3}><span className="text-xl">{orc.检验结论}</span></CCell>
                        <CCell colSpan={4}>允许（监控）工作条件</CCell>
                    </TableRow>
                    <TableRow >
                        <CCell>压力</CCell>
                        <CCellUnit unit={'MPa'}>{orc.结论压力 || '／'}</CCellUnit>
                        <CCell>温度</CCell>
                        <CCellUnit unit={'℃'}>{orc.结论温度 || '／'}</CCellUnit>
                    </TableRow>
                    <TableRow >
                        <CCell>介质</CCell>
                        <CCell>{orc.结论介质}</CCell>
                        <CCell>其它</CCell>
                        <CCell>{orc.结论其它}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>下次定期检验日期：</CCell>
                        <CCell colSpan={4}>{orc.新下检日}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>说明</CCell>
                        <TableCell colSpan={5} className="border border-gray-700 pt-0 relative">
                            <span className="absolute -top-0.25 text-xs">（包括变更情况）</span><br/>
                            <div className="min-h-[4rem] whitespace-pre-wrap -mt-[0.4rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                {orc?.结论说明 || '／'}
                            </div>
                        </TableCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
    </React.Fragment>;
};
