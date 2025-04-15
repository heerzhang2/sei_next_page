/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, OriginalDataMutation, useItemInputControl,} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {usePrefixDataEdit} from "../hook/usePrefixData";
import {CollapsibleFormSection} from "@/components/chub";
import {Button, CardFooter, Form} from "@/components/ui";
import {useForm} from "react-hook-form";
import {z as zod, z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Column_Setting} from "@/report/common/useFormatOmni";
import {useStorage} from "@/report/StorageContext";
import {useMutation} from "@urql/next";
import {toast} from "sonner";

interface Props  extends InternalItemProps{
    label: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;  可变的多个标题编码的。
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    memolist?: string[];        //备注 输入的列表
    witnlist?: string[];        //见证 输入的列表
    config?: any[];
    itemA?:string[];
}
/**资料审查主体  config={config资料审查}
 * */
export const DeviceSurveyD = ({
                                  children, show, alone = true, redId, nestMd, label, config,itemA,rep
                              }: Props) => {
        // const {inp, setInp} = useItemInputControl({ref});
        // const [getInpFilter] = useMeasureInpFilter(null, itemA,);
    // 创建动态 schema
    const fullSchema = React.useMemo(() => {
        const schemaFields = {} as any;
        const surveyItems = [] as any;          //原本布局2排或1排的，需首先转为正常的1排列表，若desc有前缀的首先预处理！
        config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            let [desc2, name2, cb2] = add2p || [];
            if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name,  cb});
            else if (typeof name === 'object' && name.n && !name.r && !name.n.startsWith('_$')) surveyItems.push({name: name.n, cb });
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, cb: cb2});
            else if (typeof name2 === 'object' && name2.n && !name2.r && !name2.n.startsWith('_$')) surveyItems.push({name: name2.n, cb: cb2 });
        });
        const itemA设备概况: string[] =itemA? [ ...itemA] : [];
        //初始化 存储字段
        surveyItems.forEach(({name,cb}: any, i: number) => {
            if(cb?.names)   itemA设备概况.push(...cb?.names);
            else  itemA设备概况.push(name);
        });
        itemA设备概况.forEach((namecfg, i) => {
            schemaFields[namecfg] = zod.string().optional()
        });
        return z.object(schemaFields)
    }, [config,itemA])
    const {storage, setStorage} =useStorage();
    const defaultValues = React.useMemo(() => {
        const fields = {} as any;
        config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            let [desc2, name2, cb2] = add2p || [];
            if (typeof name === 'string' && !name?.startsWith('_$'))
                fields[name] = storage[name] ?? ""
            else if (typeof name === 'object' && name.n && !name.r && !name.n.startsWith('_$'))
                fields[name.n] = storage[name.n] ?? ""
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$'))
                fields[name2] = storage[name2] ?? ""
            else if (typeof name2 === 'object' && name2.n && !name2.r && !name2.n.startsWith('_$'))
                fields[name2.n] = storage[name2.n] ?? ""
        });
        itemA?.forEach((name, i) => {
            fields[name] = storage[name] ?? ""
        });
        return fields
    }, [config,itemA])
    const form = useForm<z.infer<typeof fullSchema>>({
        resolver: zodResolver(fullSchema),
        defaultValues: defaultValues as any,
    })
    const [renderEditor] = usePrefixDataEdit({
        config: config!,  form
    });
    const [updateResult, updateOriginal] = useMutation(OriginalDataMutation)
    // 处理表单提交
    async function onSubmit(values: any) {
        // 这里是您需要的JSON数据
        const jsonData = JSON.stringify(values, null, 2)
        console.log("表单值:", jsonData)
        const { _version, ...RepData } = {...storage, ...values }
        updateOriginal({
            id: rep?.id,
            operationType: 1,
            version: _version,
            data: JSON.stringify(RepData),
        }).then((result) => {
            console.log("updateOriginalResult8=应答=", result)
            if (result.error) {
                // 使用 sonner 的 toast.error 显示错误
                toast.error("保存失败", {
                    description: result.error.toString(),
                })
                console.log("Oh no!", result.error)
            } else {
                // 使用 sonner 的 toast.success 显示成功消息
                toast.success("保存成功", {
                    description: "数据已成功保存到服务器",
                })
            }
        })
    }
    return <CollapsibleFormSection title={label ?? '一、设备概况'} defaultOpen={show}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 @container">
                <Text variant="h5">{label}：</Text>
                资料审查设备概况除在台账业务信息中可修改外还需修改的部分:
                {renderEditor}
                {children}
                <CardFooter className="flex justify-end space-x-4 border-t p-6">
                    <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                        重置
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "提交中..." : "提交表单"}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </CollapsibleFormSection>;
    // <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} redId={redId}
    //                                 nestMd={nestMd} alone={alone} label={label ?? '一、设备概况'}>
    //         <Text variant="h5">{label}：</Text>
    //         资料审查设备概况除在台账业务信息中可修改外还需修改的部分:
    //         {renderEditor}
    //         {children}
    //     </InspectRecordLayout>;
};
