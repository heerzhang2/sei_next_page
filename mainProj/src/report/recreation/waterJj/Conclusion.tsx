/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text, } from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, SelectInput, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {css} from "@emotion/react";
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
import {itemA技术见证} from "@/report/elevator/stest/editor";
import {tail应变} from "@/report/recreation/waterJj/StrainStress";

interface ConclusionProps  extends InternalItemProps{
    startd?: boolean;
    nxtstyp?: string;
    rslist?: { value: string; label?: any }[],
}
const 结论选 = [
    { value: "合格" },
    { value: "不合格" },
    { value: "整改后合格" },
]
export const itemA结论 = ['检验结论', '新下检日','检验日期','检验日期1' ];
//下结论页面：
export const ConclusionWaterJj = ({ children, show, alone = true, redId, nestMd, label, rep,
                                      startd=false,nxtstyp='检验',rslist=结论选}: ConclusionProps) => {
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
                                               <FormLabel>{`设置${nxtstyp}日期`}</FormLabel>
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
                                                   <FormLabel>检验起始日期</FormLabel>
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
                                               <FormLabel>下次检验日期</FormLabel>
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
        {render()}
    </CollapsibleFormSection>;
};