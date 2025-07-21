import * as React from "react";
import {InternalItemProps, RepLink} from "../../common/base";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {
    Card,
    CardContent, CardFooter,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Textarea
} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, FormSelectField} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {config设备概况} from "@/report/industrial/Periodical/orcBase";
import {useThreeColumnView} from "@/report/hook/useThreeColumnSubr";
import {CCell, FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";

interface ConclusionProps  extends InternalItemProps{
    startd?: boolean;
    nxtstyp?: string;
    rslist?: { value: string; label?: any }[],
    cjry?: boolean;
}
const 结论选 = [
    { value: "符合要求" },
    { value: "基本符合要求" },
    { value: "不符合要求" },
]
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1','参检人员','问题及处' ];
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
                    <Card className="py-1 mb-2 gap-2  m-auto">
                        <CardHeader>
                            <CardTitle>{label}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1  m-auto">
                            <h5>(报告下结论)：</h5>
                            {cjry && <FormField control={form.control} name={"参检人员"}
                                               render={({ field }) => (
                                                   <FormItem className="pt-2 w-full break-inside-avoid">
                                                       <FormLabel className="select-text">参检人员</FormLabel>
                                                       <FormControl className="w-full mr-1">
                                                           <BlobInputList rows={2}  {...field}  />
                                                       </FormControl>
                                                       <FormMessage />
                                                   </FormItem>
                                               )}
                                />
                            }
                            <FormField control={form.control} name={`检验结论`}
                                       render={({ field }) => (
                                           <FormSelectField field={field} label={"检验结论"} options={rslist}
                                                       selectClass="w-full @md:w-[20rem]  text-2xl"
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
                                               <FormLabel className="select-text">下次检验日期</FormLabel>
                                               <FormControl className="w-full">
                                                   <Input type="date"  {...field}  />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                            />
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
                                        <Textarea rows={5} {...field} />
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

const config设备上=config设备概况.slice(0, 7);
const config设备下=config设备概况.slice(7);

export const ConclusionVw= ({ orc, rep} : { orc: any,rep:any}
) => {
    const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
    const [performant]=useThreeColumnView({orc, config:config设备下,slash:true,
                        embedCol: [ <CCell key='1' rowSpan={4}>性能参数</CCell> ] });

    const result1=mapBoilerResult(orc?.检验结论)
    return <React.Fragment>
        <PrintReserveLeast reserve="10rem"
                           title={<>
                               <h2 id={"Conclusion"} className="text-2xl text-center mt-4 mb-2">工业管道定期检验结论报告</h2>
                           </>}>
            <FlexibleTable id='Survey' columnWidths={ ["14.8%", "19%", "%", "11.6%","10%","8%"] } className="text-sm border-collapse">
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
        <FlexibleTable columnWidths={ ["16.7%", "11%", "%", "16.7%","16%","16%"] }  className="text-sm">
            <TableBody>
                <RepLink ori rep={rep} tag={'Conclusion'}>
                    <TableRow>
                        <CCell colSpan={2}>问题及其处理</CCell>
                        <TableCell colSpan={4} className="border border-gray-700">
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
                <RepLink rep={rep} tag={'Conclusion'}>
                    <TableRow>
                        <TableCell split={true} colSpan={6} className={"border border-gray-700 min-h-4 whitespace-pre-wrap"}>
                            <span className="block tracking-[0.7rem] font-bold text-center">
                              监督检验结论
                            </span>
                            <span className="block indent-[2rem] text-left">
                              按照《中华人民共和国特种设备全法》、《特种设备安全监察条例》的规定，该台锅炉的安装，经我机构监督检验，&nbsp;
                                <span className="font-bold text-xl tracking-[0.5rem]">{result1}</span>
                                《锅炉安全技术规程》规定的基本安全要求。
                            </span>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <CCell>参检人员</CCell>
                        <CCell colSpan={5}>{orc.参检人员 ?? '／' }</CCell>
                    </TableRow>
                </RepLink>
            </TableBody>
        </FlexibleTable>
    </React.Fragment>;
};
