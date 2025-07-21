import * as React from "react";
import {z} from "zod";
import {toast} from "sonner"
import {Button, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection} from "@/components/chub";
import {InternalItemProps} from "@/report/common/base";
import {assertNamesUnique} from "@/report/common/eHelper";
import {useStorage} from "@/report/StorageContext";
import {render设备类别} from "@/report/common/render";
import {display额定功率, input额定是} from "@/report/boiler/rarelyVary";
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

export const 许可级别选=['A级','B级'];
export const config证书概要 = [
    //施工==安装单位，在结论概况页面录入的；
    [['施工单位', '_$安装单'], ],
    [['许可级别', {n:'许可级',t:'l',l:许可级别选}], ['许可证编号', '_$安许可号'], ],
    [['使用单位', '_$使用单位'], ['制造单位', '_$制造单位'] ],
    //台账必须录入:设备名称？
    [['设备类别', '_$设备类别',render设备类别], ['设备品种(名称)','_$设备名称']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['设备代码', '_$设备代码'], ['制造日期', '_$制造日期'] ],
    [['使用地点', '_$设备使用地点']],
    [['使用单位内部编号','_$单位内部编号'], ['使用登记证编号', '_$使用证号'] ],
    //orc?.额定蒸发量  .是功率
    [['额定蒸发量(功率)', '_$额定蒸发量', input额定是], ['额定出口压力', '_$设计出口压力','MPa'] ],
    //设计出口温度 svp?.设出口温);     这不是用台账的:额定工作压力  ['额定温度', '_$额定温度','℃']
    [['额定出口温度', '_$出口温度','℃'], ['允许工作压力', '许工压','MPa'] ],
    //允许工作温度=额定温度；    台账3字段：耐压试验压力、水压试验压力、液压试验压力；
    [['允许工作温度', '_$额定温度','℃'], ['水(耐)压试验压力', '试验压','MPa'] ],
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
            {value: config设备概况, type:'esnt'}, {value: config证书概要, type:'esnt'},
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
                                    <BlobInputList rows={2} {...field} datalist={["[\"4%\",\"5%\",\"4%\",\"6%\",\"%\",\"23%\"]"]}/>
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
