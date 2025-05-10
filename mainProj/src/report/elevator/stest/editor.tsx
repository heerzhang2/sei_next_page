import * as React from "react";
import {InspectRecordLayout, InternalItemProps, useItemInputControl,} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {useStorage} from "@/report/StorageContext";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage,
} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {CollapsibleFormSection} from "@/components/chub";
import {z} from "zod";
import { BlobInputList,SuffixInput,} from "@/components/chub";

interface WitnessParkDjProps  extends InternalItemProps{
    titles?: any[];      //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    nowit?: boolean;    //没有必要输入见证材料
    //大备注  列表框方式的
    memolist?: any[];
    //见证资料  默认可选择录入
    witlist?: any[];
}
export const itemA技术见证=['资料编号','大备注'];
/**通用见证材料3项的： 约定：children [] 可以嵌入俩个儿子DOM节点，分别代表两个段落插入一个div块;
 * */
export const WitnessSimple = ({ children, show, alone = true, redId, nestMd, label, rep,
                                  titles,nowit,memolist,witlist }: WitnessParkDjProps) => {
    const {storage,} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any
        itemA技术见证.forEach((name) => {
           schemaFields[name] = z.string().optional()
        })
        return z.object(schemaFields)
    }, [])
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        itemA技术见证.forEach((name) => {
           fields[name] = storage[name] ?? ""
        })
        return fields
    }, [storage])
    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            return (
                <>
                    {!nowit &&  <Card className="py-1 gap-1">
                        <CardHeader>
                            <CardTitle>{titles![0]}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            <FormField control={form.control} name="资料编号"
                                render={({ field }) => (
                                    <FormItem className="pt-2 w-full break-inside-avoid">
                                        <FormLabel>资料及编号:</FormLabel>
                                        <FormControl className="w-full">
                                            <BlobInputList rows={6} datalist={witlist}  {...field}  />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {(children as any[])?.[0]}
                        </CardContent>
                    </Card>
                    }
                    <Card className="py-1 mb-2 gap-2">
                        <CardHeader>
                            <CardTitle>{titles![1]}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-1">
                            <FormField control={form.control} name="大备注"
                                       render={({ field }) => (
                                           <FormItem className="pt-2 w-full break-inside-avoid">
                                               <FormLabel>备注:</FormLabel>
                                               <FormControl className="w-full">
                                                   <BlobInputList rows={6} datalist={memolist}  {...field}  />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                            />
                            {(children as any[])?.[1]}
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

interface ConclusionTestProps extends InternalItemProps{
    //需要加上 检验日期1 的编辑？
    startd?: boolean;
    nxtstyp?: string;
}
export const itemA结论 = ['检验结论', '新下检日','检测日期','检测日期1'];
//下结论页面：
export const ConclusionTest =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,startd=false,nxtstyp='定期检验'}: ConclusionTestProps, ref
    ) => {
        const [getInpFilter] = useMeasureInpFilter(null, itemA结论,);
        const {inp, setInp} = useItemInputControl({ref});
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label!}>
                <Text variant="h5">
                    {label} (报告下结论)：
                </Text>
                <InputLine label='检验结论'>
                    <Select inputSize="md" css={{minWidth: '140px', fontSize: '1.3rem', padding: '0 1rem'}}
                            value={inp?.检验结论 || ''}
                            onChange={e => setInp({...inp, 检验结论: e.currentTarget.value || undefined})}
                    >
                        <option></option>
                        <option>合格</option>
                        <option>不合格</option>
                    </Select>
                </InputLine>
                <InputLine label='设置检测日期'>
                    <Input value={inp?.检测日期 || ''} type='date'
                           onChange={e => setInp({...inp, 检测日期: e.currentTarget.value})}/>
                </InputLine>
                <InputLine label={`下次检测日期`}>
                    <Input value={inp?.新下检日 || ''} type='date'
                           onChange={e => setInp({...inp, 新下检日: e.currentTarget.value})}/>
                </InputLine>
            </InspectRecordLayout>
        );
    });
