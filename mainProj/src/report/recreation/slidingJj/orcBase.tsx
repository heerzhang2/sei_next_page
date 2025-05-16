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
import {itemA应变应力} from "../waterJj/StrainStress";
import {itemA加速} from "../waterJj/Acceleration";
import {itemA结论} from "../waterJj/Conclusion";
import {setupItemAreaRoute} from "./orcIspConfig";
import {cbK2_12_3, cbK2_12_4, cbK2_4, cbK2_6, cbK3_55, cbK4_6, cbK5_21,} from "../waterJj/cbComm";
import {config主技术} from "./MainTechnical";


export const 施工许可证子项选=['' ];
export const 设用方式选=["固定式", "移动式"];
export const config设备概况 = [
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
    [['轨道高度', '_$轨道高度','m'], ['设备使用方式', {n: '设使用式', t: 'l', l: 设用方式选}], ],
    [['整机设计使用期限','_$设计年限', '年'], ['最近一次延长使用期限',{n:'延长年',u:'年'}] ],
    [['使用期限到期时间','_$使用到期时' ], ['设计加速度区域','设加速域'], ],
    [['制造单位名称', '_$制造单位'] , ],
    [['制造单位生产许可证号', '生产许号'], ['制造单位生产许可子项目', {n: '制许可子', t: 'l', l: 施工许可证子项选}], ],
    //监检情形的：
    [['施工-安装单位名称',{n:'安装单',t:'B'}] ],
    [['施工-改造单位名称',{n:'改造单',t:'B'}] ],
    [['施工-重大修理单位',{n:'大修单',t:'B'}] ],
    [['施工单位生产许可证号', '施许可号'], ['施工单位生产许可子项目', {n: '施许可子', t: 'l', l: 施工许可证子项选}],],
    [['改造（或重大修理）内容',{n:'改造内容',t:'m'}] ],
    [['安全评估单位名称',{n:'安评单位',t:'B'}] ],
    [['安全评估时间', {n:'安评估时',t:'d'}], ['现场检验条件',{r:'见附录D'}]],
    [['下次检验日期', '_$新下检日'], ],
    [['检验依据',{r:'《大型游乐设施安全技术规程》（TSG 71-2023）'}]],
];

export const config观测数据 : ((orc: any) => EachObserveConfig[][])=(orc: any)=>{
 return [
    [{n: '型钢厚', t: ['K2.4','(1)',`结构件的最大锈蚀深度应当小于原型钢厚度的15%。抽查的结构件为（${orc?.抽查构件??''}）。`],
                    x:'原型钢厚度', u: 'mm', c: '四', d: 1, cbo:cbK2_4},
        {n: '锈处钢厚', t: [undefined,undefined,null], x:'最大锈蚀处型钢厚度', c: '四', d: 1},
    ],
    [{check: '2.4', }],
    [{n: '磨轴原径', t: ['K2.6','(1)',<div key='1' className="">磨损量和锈蚀量应符合维护保养说明书及以下要求，重要轴（销轴）最大磨损量应当小于原直径的0.8%，且最大值不超过
            1mm;重要轴（销轴）的锈蚀量(经打磨后)，应当小于原直径的1%(包括凹坑处），且最大不超过1mm。磨损最大的重要轴（销轴）
            为（{orc?.销轴损最??''}）；锈蚀最大的重要轴（销轴）为（{orc?.销轴锈最??''}）。</div>], x:'最大磨损轴原直径', u: 'mm', c: '四', d: 1,cbo:cbK2_6},
         {n: '最磨损处', t: [undefined,undefined,null], x:'最大磨损轴最大磨损处实测直径', c: '四', d: 1 },
         {n: '最锈蚀原', t: [undefined,undefined,undefined], x:'最大锈蚀轴原直径',u: 'mm', c: '四', d: 1 },
        {n: '打磨径', t: [undefined,undefined,undefined], x:'最大锈蚀轴最大锈蚀处实测直径(打磨后)', c: '四', d: 1 },
    ],
    [{check: '2.6', }],
     [{n: '道原厚', t: ['※K2.12.3','(1)',<>型钢轨道磨损量应当小于原厚度尺寸的20%；钢管轨道磨损量应当小于原钢管壁厚的15%。轨道型式为（{orc?.道型式??' '}）。</>],
                    x:'轨道原厚度（壁厚）值', u: 'mm', c: '四', d: 1,cbo:cbK2_12_3},
         {n: '道厚实', t: [undefined,undefined,null], x:'轨道原厚度（壁厚）实测值', c: '四', d: 1},
     ],
     [{check: '2.12.3' }],
     [{n: '轨距设', t: ['K2.12.4','(1)',<>侧轮在轨道内时轨距允 许误差为-3mm～5mm,侧轮在轨道外时轨距允许误差为-5mm～3mm,木制轨道轨距允许误差为 -5mm～6mm。
                    侧轮在轨道（{orc?.侧轮哪侧??' '}）侧； （{orc?.木质轨??' '}）木质轨道。</>], x:'轨距设计值', u: 'mm', c: '四', d: 0,cbo:cbK2_12_4},
         {n: '轨距测', t: [undefined,undefined,null], x:'轨距测量值', c: '四', d: 0},
     ],
     [{check: '2.12.4' }],
     [{n: '接口高差', t: ['K2.12.5','(1)','轨道与车轮接触面的接口处高低差应当不大于 1 mm。'], x:'轨道接口处高低差', u: 'mm', c: '四', d: 1},],
     [{check: '2.12.5', }],
    [{n: '卷筒径', t: ['K3.5.2','(1)',<>提升乘人装置用的卷筒、滑轮直径与钢丝绳直径之比应当不小于30；钢丝绳对滑轮包角不大于90°时，滑轮直径与钢丝绳直径之比应当不小于20。</>],
                x:'卷筒直径', u: 'mm', c: '四', d: 1},
         {n: '滑轮径', t: [undefined,undefined,null], x:'滑轮直径', c: '四', d: 1 },
         {n: '绳直径', t: [undefined,undefined,undefined], x:'钢丝绳直径', c: '四', d: 1 },
    ],
    [{check: '3.5.2', }],
    [{n: '断丝数', t: ['K3.5.5','(1)','一个捻距内的断丝数。'], x:'断丝数', u: '根',c: '四', d: 0},
        {n: '绳原直径', t: [undefined,undefined,'磨损后钢丝绳直径为原直径的90%以上。'], x:'钢丝绳原直径', u: 'mm', c: '四', d: 1},
        {n: '磨后径', t: [undefined,undefined,undefined], x:'磨损后钢丝绳直径', cbo:cbK3_55},
    ],
    [{check: '3.5.5', }],
] as EachObserveConfig[][]};

export const config观测数据2 : ((orc: any) => EachObserveConfig[][])=(orc: any)=>{
    return [
        [{n: '主轮原直', t: ['※K3.8','(1)',<>滑行车车轮的磨损量应当小于原直径尺寸的 2.5%，且主车轮最大磨损量不超过6mm，侧轮和底轮最大磨损量不超过4mm。</>],
            x:'主车轮原直径', u: 'mm', c: '四', d: 1},
            {n: '主轮径实', t: [undefined,undefined,null], x:'主车轮实测直径', c: '四', d: 1 },
            {n: '侧轮原直', t: [undefined,undefined,undefined], x:'侧轮轮原直径', c: '四', d: 1 },
            {n: '侧轮径实', t: [undefined,undefined,undefined], x:'侧轮实测直径', c: '四', d: 1 },
            {n: '底轮原直', t: [undefined,undefined,undefined], x:'底轮原直径', c: '四', d: 1 },
            {n: '底轮径实', t: [undefined,undefined,undefined], x:'底轮实测直径', c: '四', d: 1 },
        ],
        [{check: '3.8', }],
        [{n: '接地阻', t: ['K4.3','(1)','低压配电系统保护接地电阻应当不大于10Ω。'], x:'接地电阻', u: 'Ω', c: '四', d: 0},
        ],
        [{check: '4.3', }],
        [{n: '绝缘阻', t: ['※K4.4','(1)','电压有效值大于50V的带电回路与接地装置之间的绝缘电阻应当能保证用电安全，绝缘电阻应当不小于1MΩ。'],
            x:'绝缘电阻', u: 'MΩ', c: '四', d: 1},
        ],
        [{check: '4.4', }],
        [{n: '轨绝缘阻', t: ['K4.5','(1)',"路轨与导电轨之间的绝缘电阻应当不小于 0.1MΩ。"], x:'绝缘电阻', u: 'MΩ', c: '四', d: 2},],
        [{check: '4.5', }],
        [{n: '工作电流', t: ['K4.6','(1)',<>满载或者偏载运转平稳后，电动机电流值应符合设计文件及以下要求。在满载和设计允许偏载的情况下，连续工作的异步电机工作电流
                应当不大于电机的额定电流。 （{orc?.工电机??''}）电机额定电流为（{orc?.机额电流??''}）A。</>],
            x:'工作电流', u: 'A', c: '四', d: 1,cbo:cbK4_6},
        ],
        [{check: '4.6', }],
    [{n: '座舱深', t: ['K5.2','(1)',<>座席距地面最大高度5m以下时, 座舱深度不小于550mm, 座席靠背高度不小于300mm。座席距地面最大高度5m以上时, 座舱深度不小于800mm,座席
                靠背高度不小于400mm。当设有安全杠和安全带等设施时, 可适当减少座舱深度。 座席距地面最大高度（{orc?.座席高??' '}）m。</>],
             x:'座舱深度', u: 'mm', c: '四', d: 0,cbo:cbK5_21},
        {n: '靠背高', t: [undefined,undefined,null], x:'靠背高度', c: '四', d: 0},
    ],
    [{check: '5.2', }],
    [{n: '安全带宽', t: ['K5.4.1','(1)',`安全带织带的宽度应当不小于30mm。`], x:'安全带织带的宽度', u: 'mm', c: '四', d: 1},
    ],
    [{check: '5.4.1', }],
    [{n: '满制距', t: ['※K6.2','(4)','在满载工况下最大速度运行时的制动距离，应符合设计文件要求。'], x:'制动距离', u: 'm',c: '四', d: 1},
        {n: '闸衬厚', t: [undefined,'(5)','对有磨损的机械式制动装置在磨损严重部位测量闸衬厚度，磨损量应当不大于原厚度50%且满足设计文件要求。'],
                    x:'磨损后闸衬厚度', u: 'mm', c: '四', d: 2},
    ],
    [{check: '6.2', }],
    [{n: '栅栏高', t: ['K6.20','(1)','安全栅栏高度应当不低于1100mm；栅栏的间隙和距离地面的间隙应当不大于 120mm。'], x:'高度', u: 'mm', c: '四', d: 0},
        {n: '栅栏隙', t: [undefined,undefined,null], x:'栅栏的间隙', c: '四', d: 0},
        {n: '栅地隙', t: [undefined,undefined,undefined], x:'距离地面的间隙', c: '四', d: 0},
    ],
    [{check: '6.20', }],
    [{n: '台阶纵宽', t: ['K6.22','(1)',<>台阶踏面纵向宽度应当不小于240mm，高度为140mm～200mm；进出口为斜坡时，坡度应当不大于1 : 6，有防滑措施的斜坡，坡度应当不大于1 : 4。</>],
            x:'台阶踏面纵向宽度', u: 'mm', c: '四', d: 0},
        {n: '台阶踏高', t: [undefined,undefined,null], x:'台阶踏面高度', c: '四', d: 1},
        {n: '斜坡度', t: [undefined,undefined,undefined], x:'无防滑措施的斜坡坡度',u: '%', c: '四', d: 1},
        {n: '防滑坡', t: [undefined,undefined,undefined], x:'有防滑措施的斜坡坡度', c: '四', d: 1},
    ],
    [{check: '6.22', }],
] as EachObserveConfig[][]};

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
        const impressionismAs = setupItemAreaRoute({rep, noDefault: true});
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'},
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论,  ...itemA技术见证, ] },
            {value: config观测数据({}), type:'mesB'},{value: config观测数据2({}), type:'mesB'},
            {value: config主技术, type:'mesB'},
            {value:[ ...itemA应变应力, ...itemA加速, ] },
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
                                <FormLabel>设置待测试表格的各列宽度：</FormLabel>
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
