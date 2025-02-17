/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, Text, TextArea, useTheme, useToast,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {itemA结论,} from "../../mobilecr/editorIN";
import {EditStorageContext} from "../../StorageContext";
import {EachMeasureItemConfig} from "../../common/measure";
import {render子设备型, render设备品种, render设备类别} from "../../common/render";
import {itemA技术见证} from "./editor";
import {itemA受力结构, item受力结构} from "../../tower/craneJj/editThicknes";
import {config梯子, itemA机构速度, itemA漏磁检, item机构速度} from "../editor";
import {itemA制动距离} from "../../tower/craneJj/editBraking";
import {itemA同步性能} from "./Synchronization";
import {itemA停车专项} from "./ParkSpecial";


const 工作条件操作式=["准无人方式", "无人方式", "人车共乘方式"];
export const config设备概况 = [
    [['使用单位', '_$使用单位']],
    [['使用单位地址', '_$使用单位地址']],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['使用单位安全管理人员', '安全员']],
    [['联系电话', '安全员电'], ['邮政编码', '_$使用单位邮编'] ],
    [['管理部门类型','_$使管部类型'], ],
    [['制造单位', '_$制造单位']],
    [['改造单位','_$改造单位']],
    [['重大修理单位','_$维修单位']],
    [['设备使用地点所在区域', '_$使用地区域']],
    [['设备类别', '_$设备类别',render设备类别], ['设备品种', '_$设备品种',render设备品种], ],
    [['型号规格', '_$型号'], ['设备代码','_$设备代码'], ],
    [['产品编号', '_$出厂编号'], ['单位内编号','_$单位内部编号'] ],
    [['投入使用日期', '_$投用日期'], ['设计使用年限', '_$设计年限', '年']],
    [['使用地点', '_$设备使用地点'],  ],
    [['工作条件', {n: '操纵方式', t: 'l', l: 工作条件操作式}], ['设备型号', '设备型']],
    //缺了 "汽车专用升降机类停车设备"
    [['停车设备类型', '_$子设备品种',render子设备型]],
    [['层数', '_$电梯层数','层'], ['存容量', '_$泊位数量','辆']],
    [['适停汽车质量', '_$适停车质量', 'kg'], ['适停汽车尺寸(长×宽×高)', '_$适停尺寸','mm']],
    //额定起升速度（公式型）(svp?.额起升速)，;
    [['额定升降速度', '_$额升降速度', 'm/min'], ['额定运行速度', '_$额定速度', 'm/min']],
    [['单车最大进(出)车时间', '_$最大进出时', 's'], ['工作级别', '_$工作级别'] ],
    [['其他主要参数', {n: '其他参数', t: 'm'}] ],
    [['检验依据', {r: '《起重机械安全技术规程》（TSG 51-2023）'}]　],
    [['检验意见通知书编号','意通知号'], ['整改反馈确认期限',{n:'改反馈期',t:'d'}] ],
    [['下次定期检验日期', '_$新下检日'], ['是否型式试验样机', {n: '型试样机', t: 'b'}]　],
    [['现场检验条件',{r:'见附录B'}]　],
    [['备注',{n:'概备注',t:'m'}]　],
];

/**测量表：太多了可拆成两个编辑器； 注意：t: [] 不同于 t: [undefined,undefined,undefined]；
 * */
export const config观测数据 = [
    [{n: '卷筒板', t: ['C3.8.1','卷筒上压板数量'], u: '个'}, ],
    [{n: '绳夹数', t: [undefined,'绳夹数量'],  save: false},],
    [{n: '绳夹间', t: [undefined,'绳夹间距'],  u: 'mm', c: '弃', d: '2', save: false},],
    [{n: '编结长', t: [undefined,'钢丝绳编结长度'],  c: '弃', d: '2', save: false},],
    [{n: '安圈数', t: [undefined,'安全圈数'],  u: '圈', save: false},],
    [{check: 'C3.8.1', }],
    [{n: '电阻N', t: ['C3.11.3', 'TN系统重复接地电阻'], u: 'Ω', c: '四', d: '2', save: true},
        {n: '电阻T', t: [undefined, 'TT系统接地电阻'], c: '弃', d: '2', save: false},
        {n: '电阻I', t: [undefined, 'IT系统接地电阻'], c: '四', },
    ],
    [{check: 'C3.11.3'}],

    [{n: '车缓距', t: ['C3.12.4', '阻车装置高度'], u: 'mm'}, ],
    [{check: '3.12.4(6)'}],

    [{n: '绝缘阻', t: ['C3.14','主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻'], u: 'MΩ',c: '四', d: '1',save: false}, ],
    [{check: 'C3.14',sync:'绝缘电阻'}],
    [{n: '油前温', t: ['C4.2.2.3', '液压系统油液温升', '试验前温度'], u: '℃', omit: true},
        {n: '油后温', t: [undefined, undefined, '试验后温度'], omit: true},
        {n: '温升值', t: [undefined, undefined, '温升值'], omit: true},
        {n: '温升允', t: [undefined, undefined, '温升允许值'], omit: 'C4.7.2.3'},
    ],
    [{check: 'C4.2.2.3'}],
] as EachMeasureItemConfig[][];


export const EntranceSetup =
    React.forwardRef((
        {show, alone = true, verId, rep}: InternalItemProps, ref
) => {
    const theme = useTheme();
    const atPrint = useMedia('print');
    const toast = useToast();
    const doCheckNames = React.useCallback((verId: string) => {
        const impressionismAs = setupItemAreaRoute({rep, noDefault: true, theme});
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'},
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论, ...itemA技术见证,  ] },
            {value: config观测数据, type:'mesB'},
            {value:[...item受力结构, ...itemA受力结构 ] },   {value: config梯子, type:'mesB'},
            {value:[...item机构速度, ...itemA机构速度, ...itemA制动距离, ...itemA同步性能, ...itemA停车专项, ...itemA漏磁检 ] },
            {value:['unq','仪器表','检验条件','梯子备注' ]} ]);
        toast({title: "完成！", subtitle: result ? "没发现冲突" : "测试开关没开", intent: "success"});
    }, [rep,toast,theme]);
    const {storage, setStorage} =React.useContext(EditStorageContext) as any;
    const getInpFilter = React.useCallback((par: any) => {
        const {_tblFixed, } =par||{};
        return {_tblFixed, };
    }, []);
    const {inp, setInp} = useItemInputControl({ref});
    if (atPrint) return null;
    else return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show} alone={alone} label={'初始化本报告，默认值配置等'}>
            {process.env.REACT_APP_TEST==='true' && <><div>
                <Text variant="h5">构建开发模板时的工具：校验模板的存储name冲突；</Text>
                <Button intent='primary' onPress={() => doCheckNames(verId!)}>校验模板name唯一性</Button>
                <Text variant="h5">设置待测试表格的各列宽度：</Text>
                <TextArea value={storage?._tblFixed || ''} rows={2} onChange={e =>{
                    JSON.parse(e.currentTarget.value??'[]');
                    setStorage({ ...storage, _tblFixed: e.currentTarget.value || undefined}); }}/>
            </div>
            </>
            }
            <hr/>
        </InspectRecordLayout>
    );
});
