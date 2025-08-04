import * as React from "react";
import {z} from "zod";
import {toast} from "sonner"
import {Button, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection} from "@/components/chub";
import {InternalItemProps} from "@/report/common/base";
import {assertNamesUnique} from "@/report/common/eHelper";
import {useStorage} from "@/report/StorageContext";
import {itemA结论} from "@/report/power/boilInstall/Conclusion";
import {itemA简图} from "@/report/power/boilInstall/BoilerDiagram";
import {工作介质选, 管道级别} from "@/report/industrial/Periodical/rarelyVary";

export const config设备概况 = [
    [['管道名称', '_$管道设备名'], ['单位内编号', {n:'单位内编号',t:'B',l:['见管道特性表']}],],
    [['管道级别', {n:'管道级别',t:'l',l:管道级别}], ['起始—终止位置', {n:'起始终止',t:'B',l:['见管道特性表']}]],
    [['使用单位名称', '_$使用单位'], ['使用登记证编号', '_$使用证号'],],
    [['使用单位地址', '_$使用单位地址'],],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['邮政编码', '_$使用单位邮编'],],
    [['安全管理人员', '安全员'], ['联系电话', '安全员电'] ],
    //投用日期: 还是不用台账的。 还是：需报告自己录入。而且不是日期的。
    [['设计使用年限', '_$设计年限', '年'], ['投入使用日期', {n: '投用日', t: 'l', l: ["见管道特性表"]}],],
    //拆分和注解插入点的：
    [['公称外径',{n:'公外径',u:'mm'}], ['管道长度',{n:'管长度',u:'m'}]],
    [['管道壁厚',{n:'管壁厚', u:'mm'}], ['设计压力',{n:'设计压', u:'MPa'}]],
    [['设计温度',{n:'设计温', u:'℃'}], ['工作压力',{n:'工作压', u:'MPa'}]],
    [['工作温度',{n:'工作温', u:'℃'}], ['工作介质',{n:'工作介',t:'l',l:工作介质选}]],
];


export const EntranceSetup = ({show,redId, nestMd,rep}: InternalItemProps) => {
    const {storage,} =useStorage();
    const schema = React.useMemo(() => {
        const schemaFields = {} as any;
        schemaFields["_tblFixed"] = z.string().optional().refine(
            (value) => {
                if (!value) return true;
                try { JSON.parse(value);return true; } catch { return false;}
            }, {message: "字段必须为有效的 JSON 字符串"}
        );
        return z.object(schemaFields);
    }, []);
    const defaultValues = React.useMemo(() => {
        const fields = {} as any
        fields["_tblFixed"]= storage["_tblFixed"]
        return fields
    }, [storage])
    const doCheckNames = React.useCallback((e: React.MouseEvent,rep: any) => {
        const result = assertNamesUnique([{value: rep?.tzFields},
            {value: config设备概况, type:'esnt'},
            {value:[ ...itemA结论, ...itemA简图, ] },
            {value:['Projects', '证书说明', "长文字页" ]} ]);
            if(result) toast.success("完成", {description: "没冲突",})
            else toast.error("完成", {description: "冲突",})
        e.preventDefault()
    }, [toast]);
    const contentRendererFactory = React.useCallback(
        (form: any) => {
        return <CardContent>
                {process.env.NEXT_PUBLIC_APP_TEST==='true' && <div>
                    <h5>构建开发模板时的工具：校验模板的存储name冲突；</h5>
                    <Button onClick={(e) => doCheckNames(e,rep)}>校验模板name唯一性</Button>
                    <FormField control={form.control} name={"_tblFixed"}
                        render={({ field }) => (
                            <FormItem className="pt-2 w-full break-inside-avoid">
                                <FormLabel className="select-text">设置待测试表格的各列宽度：</FormLabel>
                                <FormControl className="w-full">
                                    <BlobInputList rows={2} {...field} autoComplete="off"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                    )}/>
                 </div>
                }
             </CardContent>
    }, [])
    const { render } = useFormFramework({schema,defaultValues, contentRendererFactory, rep})
    return  <CollapsibleFormSection title={'初始化本报告，默认值配置等'} defaultOpen={show}>
        {render(null)}
    </CollapsibleFormSection>;
};
