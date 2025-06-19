import * as React from "react";
import { InternalItemProps } from "../../common/base";
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