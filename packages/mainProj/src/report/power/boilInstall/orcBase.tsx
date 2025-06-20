import * as React from "react";
import {z} from "zod";
import {toast} from "sonner"
import {Button, CardContent, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui";
import {useFormFramework} from "@/report/hook/useFormFramework";
import {BlobInputList, CollapsibleFormSection} from "@/components/chub";
import {InternalItemProps} from "@/report/common/base";
import {assertNamesUnique} from "@/report/common/eHelper";
import {useStorage} from "@/report/StorageContext";
import {EachObserveConfig} from "@/report/hook/useObserve";
import {itemA技术见证} from "@/report/common/editor";
import {render设备类别} from "@/report/common/render";
import {display额定功率, input额定是} from "@/report/boiler/rarelyVary";


export const config设备概况4 = [
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['设备所在区域', '_$使用地区域']],
    [['使用登记证编号', '_$使用证号'], ['注册代码', '_$注册代码'], ],
    [['使用单位名称', '_$使用单位'],  ],
    [['使用单位地址', '_$使用单位地址'],  ],
    [['分支机构名称', '_$分支机构'] ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['使用地点', '_$设备使用地点'], ],
    [['安全管理人员', '安全员'], ['联系电话', '安全员电'] ],
    [['设备联系人','_$设备联系人'],['联系人电话','_$设备联系手机'] ],
    [['产品名称', '_$设备名称'], ['设备级别', '_$设备等级']],
    [['产品型号', '_$型号'], ['设备型式', '设型式'], ],
    [['制造完成日期', '_$制造日期'], ['产品编号', '_$出厂编号']  ],
    [['投入使用时间', '_$投用日期'], ['每车承载人数', '_$额定乘客数','人'],  ],
    [['车辆数', '_$车船数量','个'], ['运行速度','_$额定速度','km/h'], ],
    [['轨距', '_$车道轨距','m'], ['轨道长度','_$轨道长度','m'], ],
    [['整机设计使用期限','_$设计年限', '年'], ['最近一次延长使用期限',{n:'延长年',u:'年'}] ],
    [['使用期限到期时间','_$使用到期时' ], ['设计加速度区域','设加速域'], ],
    [['制造单位名称', '_$制造单位'] , ],
    //监检情形的：
    [['施工-安装单位名称',{n:'安装单',t:'B'}] ],
    [['施工-改造单位名称',{n:'改造单',t:'B'}] ],
    [['施工-重大修理单位',{n:'大修单',t:'B'}] ],
    [['改造（或重大修理）内容',{n:'改造内容',t:'m'}] ],
    [['安全评估单位名称',{n:'安评单位',t:'B'}] ],
    [['安全评估时间', {n:'安评估时',t:'d'}], ['现场检验条件',{r:'见附录D'}]],
    [['下次检验日期', '_$新下检日'], ],
    [['检验依据',{r:'《大型游乐设施安全技术规程》（TSG 71-2023）'}]],
];
export const config设备概况 = [
    //没有在结论概况中出现的：  在头部抬头栏目出现
    [['工程名称', {n:'工程名称', t:'B'}], ],
    //不用台账的安装单位？
    [['安装单位', {n:'安装单', t:'B'}], ['安装联系人', '安装联人'] ],
    [['安装许可证编号', '安许可号'], ['联系电话', '安装联电'] ],
    [['使用单位', '_$使用单位'], ],
    [['使用单位地址', '_$使用单位地址'], ],
    [['使用单位代码', '_$使用单位信用码'], ['邮政编码', '_$使用单位邮编'] ],
    [['锅炉安装地点', '_$设备使用地点'], ['使用单位联系人电话', '_$使用单位电话'], ],
    // [['使用单位代码', '_$使用单位信用码'],  ['使用单位联系人电话', '_$使用单位电话'], ],
    [['制造单位', '_$制造单位'], ],
    [['设备代码', '_$设备代码', ], ['制造日期', '_$制造日期']],
    [['产品编号', '_$出厂编号'], ['锅炉型号', '_$型号'], ],
    [[display额定功率, '_$额定蒸发量', input额定是],  ['再热蒸汽流量', '_$再热蒸汽流量','t/h'],  ],
    [['锅筒工作压力', '_$锅筒工作压力', 'MPa'],  ['锅筒工作温度',{n:'筒工温', u:'℃'}, ],  ],
    //过热 蒸汽==过热 器?
    [['过热蒸汽出口压力','_$过热器出口压', 'MPa'],  ['过热蒸汽出口温度','_$过热器出口温', '℃'],  ],
    [['再热蒸汽进口压力','_$再热入口压力', 'MPa'],  ['再热蒸汽进口温度','_$再热入口温度', '℃'],  ],
    [['再热蒸汽出口压力','_$再热出口压力', 'MPa'],  ['再热蒸汽出口温度','_$再热出口温度', '℃'],  ],
    [['给水压力','_$给水压力', 'MPa'],  ['给水温度','_$给水温度', '℃'],  ],
    [['燃烧方式', '_$燃烧方式'],  ['监督检验受理文号', '告知号'] ],
    //下结论编辑器的
    [['监检开始日期', '_$检验日期1'], ['监检结束日期', '_$检验日期']],
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

export const tail观测= <div className={"text-[0.75rem]"}>
    注：
    <div className={"ml-8 print:ml-6 mt-[-1rem]"}>
        1、K2.4、K2.6、K2.12.3、K2.12.4、K2.12.5、K3.5.2、K3.5.5、K3.8、K5.2、K6.2（5）、K6.20、K6.22、仅在不符合时，才需填观测数据和测量结果等数值。<br/>
        2、结果判定栏都需填；<br/>
        3、其他需记录的测量值和结果值填在备注栏中。
    </div>
</div>;


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
            // {value: config设备概况, type:'esnt'}, {value:[...itemA结论,  ...itemA技术见证, ] },
            // {value: config主技术, type:'mesB'},
            // {value:[ ...itemA应变应力, ...itemA加速, ] },
            {value:['unq','仪器表','检验条件','观备注', '主技备注' ]} ]);
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
