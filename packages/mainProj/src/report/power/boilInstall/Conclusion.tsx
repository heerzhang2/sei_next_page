import * as React from "react";
import {InternalItemProps, RepLink} from "../../common/base";
import {useStorage} from "@/report/StorageContext";
import {z} from "zod";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, Input
} from "@/components/ui";
import {BlobInputList, CollapsibleFormSection, FormSelectField} from "@/components/chub";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {config设备概况} from "@/report/power/boilInstall/orcBase";
import {useThreeColumnView} from "@/report/hook/useThreeColumnSubr";
import {CCell, FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";

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
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1','参检人员' ];
//下结论页面：
export const ConclusionBoiler = ({ children, show, alone = true, redId, nestMd, label, rep,
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
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    <Card className="py-1 mb-2 gap-2 max-w-[60rem] m-auto">
                        <CardHeader>
                            <CardTitle>{label}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1 max-w-[40rem] m-auto">
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
                            {children}
                        </CardContent>
                    </Card>
                </>
            )
        },
        [children,],
    )
    const { render } = useFormFramework({schema, defaultValues, contentRendererFactory, rep})
    return  <CollapsibleFormSection title={label!} defaultOpen={show}>
        {render(null)}
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

export const ConclusionVw= ({ orc, rep } : { orc: any,rep:any}
) => {
    const [_,renderUpper,render2]=useThreeColumnView({orc, config:config设备概况,slash:true,split:[1,9]});
    const result1=mapBoilerResult(orc?.检验结论)
    return <React.Fragment>
        <PrintReserveLeast reserve="10rem"
                           title={<>
                               <h2  className="text-xl text-center mt-4">一、锅炉安装监督检验综合报告<br/>
                                   1.1锅炉安装监督检验结论报告</h2>
                               <div className="flex justify-between">
                                   <span className="text-sm">工程名称：{orc?.工程名称}</span>
                                   <span className="text-sm @3xl:mr-4">报告编号：{rep.isp.no}</span>
                               </div>
                           </>}>
            <FlexibleTable id='Survey' columnWidths={ ["14.1%", "19%", "%", "10.1%","10%","8%"] } className="text-sm border-collapse">
                <TableBody>
                    <RepLink ori rep={rep} tag={'Survey'}>
                        {renderUpper}
                    </RepLink>
                </TableBody>
            </FlexibleTable>
        </PrintReserveLeast>
        <FlexibleTable columnWidths={ ["16.7%", "11%", "%", "16.7%","16%","16%"] }  className="text-sm">
            <TableBody>
                <RepLink ori rep={rep} tag={'Survey'}>
                    {render2}
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
