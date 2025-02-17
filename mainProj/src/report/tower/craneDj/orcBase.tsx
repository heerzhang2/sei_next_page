/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, Text, TextArea, useTheme, useToast,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EditStorageContext} from "../../StorageContext";
import {EachMeasureItemConfig} from "../../common/measure";
import {itemA结论} from "../../mobilecr/editorIN";
import {render工作幅, render监控管, 操纵方式选,} from "../../tower/craneJj/orcBase";
import {itemA技术见证} from "../../park/Periodical/editor";
import {itemA受力结构, item受力结构} from "../craneJj/editThicknes";
import {config梯子} from "../craneJj/Ladder";
import {itemA起升高度} from "../craneJj/editMonitori";
import {configFix安全距} from "../craneJj/editSafDist";
import {itemA轴垂直度} from "../craneJj/editAxisVert";
import {itemA附设装} from "../craneJj/editAttachD";

export const config设备概况 = [
    [['使用单位名称', '_$使用单位']],
    [['使用单位地址', '_$使用单位地址']],
    [['分支机构', '_$分支机构']],
    [['分支机构地址', '_$分支机构地址']],
    [['产权单位名称', '_$产权单位']],
    [['产权单位地址', '_$产权单位地址'] ],
    [['使用单位联系人', '_$单位联系人'], ['使用单位安全管理人员', '安全员']],
    [['联系人电话', '_$使用单位电话'], ['使用单位安全管理人员电话', '安全员电']],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['管理部门类型','_$使管部类型']],
    [['制造单位名称', '_$制造单位'] ],
    [['安装单位名称','_$安装单位']],
    [['改造单位名称','_$改造单位']],
    [['重大修理单位名称','_$维修单位']],
    [['设备型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['型号规格', '型规格'], ['制造日期', '_$制造日期'] ],
    [['操纵方式',{n:'操纵方式',t:'l',l:操纵方式选}], ['安全监控管理系统','_$有监控',render监控管], ],
    [['设计使用年限','_$设计年限', '年'], ['投入使用日期', '_$投用日期'] ],
    [['单位内编号','_$单位内部编号'], ['邮政编码', '_$使用单位邮编'] ],
    [['使用地点', '_$设备使用地点']],
    [['设备使用所在区域', '_$使用地区域']  ],
    [['额定起重力矩','_$起重力矩','t·m'], ['最大起升高度',{n:'起升高度',t:'n',u:'m'}],],
    //@ 独立安装高度?==最大独立高度;
    [['起升速度','_$起升速','m/min'],['独立安装高度','_$独立高度','m']],
    //【特殊，有两个存储字段】 最大工作幅, 最小工作幅
    [['最小和最大工作幅度','_$最大工作幅',render工作幅], ['工作级别','_$工作级别']],
    [['标准节尺寸',{n:'标节尺寸',u:'mm'}], ['最大附着高度',{n:'附着高度',u:'m'},], ],
    [['变幅速度','_$变幅速度','m/min'], ['回转速度','_$回转速度','r/min'] ],
    [['变幅形式','_$变幅形式' ], ['移动类型','_$移动类型' ], ],
    [['其他主要参数',{n:'其他参数',t:'m'}], ],
    [['检验时起重臂架铰点高度','_$臂架铰点高','m'], ['检验时最大工作幅度','_$检工作幅度','m'] ],
    //=检验时附着装置数量 ?  , [' ',{r:' '}] ],
    [['检验时附墙架数量','附墙架','个'], ['附属装置名称', '_$附属装置名称'] ],
    [['检验依据',{r:'《起重机械安全技术规程》（TSG 51-2023）'}]],
    [['下次定期检验日期','_$新下检日'], ['是否流动作业',{n:'流动作业',t:'b'}] ],
    [['现场检验条件',{r:'见附录7'}], ],
    [['检验意见通知书编号','意通知号'], ['整改反馈确认期限',{n:'改反馈期',t:'d'}], ],
    [['备注',{n:'概备注',t:'m'}]],
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
    [{n: '钩臂距', t: ['C3.12.4', '动臂变幅的塔机，起升高度限制器动作时，吊钩装置顶部与对应位置起重臂下端的距离'], u: 'mm', c: '四', d: '2', save: true},
        {n: '钩车距', t: [undefined, '小车变幅的塔机，起升高度限制器动作时，吊钩装置顶部与小车架下端的距离'], c: '弃', d: '2', save: false},
    ],
    [{check: '3.12.4(3)'}],
    [{n: '车缓距', t: [undefined, '采用移动小车变幅的塔式起重机，限位开关动作后，小车停车时其端部距缓冲装置的距离'], u: 'mm'}, ],
    [{check: '3.12.4(6)'}],
    [{n: '扫轨隙', t: [undefined, '扫轨板底面与轨道之间的间隙'], u: 'mm'}, ],
    [{ check: '3.12.4(16)', sync:'清扫器' }],

    [{n: '绝缘阻', t: ['C3.14','主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻'], u: 'MΩ',c: '四', d: '1',save: false}, ],
    [{check: 'C3.14',sync:'绝缘电阻'}],
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
            {value: config设备概况, type:'esnt'},
            {value:[...itemA结论, ...itemA技术见证, ] },
            {value: config观测数据, type:'mesB'}, {value:[...item受力结构, ...itemA受力结构 ] },
            {value: config梯子, type: 'mesB'}, {value:[...itemA起升高度,  ] },
            {value: configFix安全距, type: 'mesB'}, {value:[...itemA轴垂直度, ...itemA附设装, ] },
            {value:['unq','仪器表','检验条件','观测备注' ]} ]);
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
