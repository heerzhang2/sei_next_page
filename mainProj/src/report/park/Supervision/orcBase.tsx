/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    InputLine, Input, TextArea, Text, SuffixInput, useTheme, LineColumn, Button, useToast, ColumnWidth,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork,  useItemInputControl
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EachMeasureItemConfig, } from "../../common/measure";
import {useMeasureOldVer} from "../../hook/useMeasureOldVer";
import {arraySetInp, calcAverageArrObj, objNestArrSetInp} from "../../../common/tool";
import {
    config梯子,
    itemA受力结构,
    itemA机构速度, itemA漏磁检, itemA现场,
    itemA结论,
    item受力结构,
    item机构速度,
    Notepad,
    TechnicalWitness
} from "../editor";
import {multiCheckFor} from "../../common/general";
import {eqpTypeAllMap} from "../../../dict/eqpComm";


const render子设备型={
    view:(orc:any)=><>{eqpTypeAllMap.get(orc?.子设备品种)}</>,
};
const 工作条件操作式=["准无人方式", "无人方式", "人车共乘方式"];
/**台账snapshot.‘安装单位’等不能直接使用的，要本次最新:易变动。
 * */
const daL改造内容=[['改变主要受力结构件的结构形式','改结构形'],['改变主要机构的配置形式','改配置形'],['改变主参数','改主参']];
const daL重大修理内容=[['更换主要受力结构件','换结构件'],['更换主要机构','换机构'],['更换控制系统','换控制']];
export const config设备概况 = [
    [['安装改造重大修理单位名称', '安改修单']],
    [['施工单位特种设备生产许可证（受理决定书）编号', '许可书号'], ['安装改造重大修理单位负责人', '安改负人']],
    [['施工单位生产许可证许可子项目', '施许可子'],['施工单位联系电话', '施单联电']],
    [['使用单位名称', '_$使用单位']],
    [['使用单位地址', '_$使用单位地址']],
    [['分支机构', '_$分支机构']],
    [['分支机构地址', '_$分支机构地址']],
    [['产权单位名称', '_$产权单位']],
    [['产权单位地址', '_$产权单位地址']],
    [['使用单位联系人', '_$单位联系人'], ['使用单位安全管理人员', '安全员']],
    [['使用单位联系电话', '_$使用单位电话'], ['安全管理人员联系电话', '安全员电']],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['管理部门类型','_$使管部类型']],
    [['制造单位名称', '_$制造单位']],
    [['制造单位特种设备生产许可证编号','生产许号'],['制造单位生产许可证许可子项目','制许可子']],
    [['型号规格', '_$型号'], ['产品编号', '_$出厂编号']],
    [['单位内编码', '_$单位内部编号'], ['进口情况','_$进口类型']],
    [['制造日期', '_$制造日期'], ['投入使用日期', '_$投用日期']],
    [['工作条件', {n: '操纵方式', t: 'l', l: 工作条件操作式}], ['设计使用年限', '_$设计年限', '年']],
    [['使用地点', '_$设备使用地点']],
    [['设备使用地点所在区域', '_$使用地区域']],
    //缺了 "汽车专用升降机类停车设备"
    [['停车设备类型', '_$子设备品种',render子设备型]],
    [['起升方式', '_$停车起升式'], ['设备型号', '设备型号']],
    [['层数', '_$电梯层数','层'], ['存容量', '_$泊位数量','辆']],
    [['适停汽车质量', '_$适停车质量', 'kg'], ['适停汽车尺寸(长×宽×高)', '_$适停尺寸','mm']],
    //额定起升速度（公式型）(svp?.额起升速)，;
    [['额定升降速度', '_$额升降速度', 'm/min'], ['额定运行速度', '_$额定速度', 'm/min']],
    [['单车最大进(出)车时间', '_$最大进出时', 's'], ['工作级别', '_$工作级别'] ],
    [['其他主要参数', {n: '其他参数', t: 'B'}] ],
    [['检验依据', {r: '《起重机械安全技术规程》（TSG 51-2023）'}]],
    [['下次检验日期', '_$新下检日'], ['是否型式试验样机', {n: '型试样机', t: 'b'}]],
    [['现场检验条件', {r: '见附录11'}]],
    [['重大修理内容','',multiCheckFor(daL重大修理内容)]],
    [['改造内容','',multiCheckFor(daL改造内容)]],
    [['备注',{n:'概备注',t:'m'}]],
    /*报告接收#3个字段？属于业务层面的，不放在这里*/
];

/**开启编制时的：默认值初始化操作。  若打印：本编辑器全部都不显示。
 * */
export const EntranceSetup =
React.forwardRef((
    {children, show, alone = true, repId, verId, rep}: InternalItemProps, ref
) => {
    const atPrint = useMedia('print');
    const theme = useTheme();
    const toast = useToast();
    const checkName = true;      //开发测试完，改成=false, 测试时 REACT_APP_TEST 需设置， 开发模式的校对开关。
    const doCheckNames = React.useCallback((verId: string) => {
                // const nameMap = new Map();      //只有对象可以作为键。不能使用基本类型作为WeakMap的键。
        const impressionismAs = setupItemAreaRoute({verId: verId!, repId: repId!, noDefault: true, theme});
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'}, {value: config观测数据, type: 'mesB'},
            {value:config设备概况, type:'esnt'},{value: itemA现场},{value:itemA结论},{value:itemA技术见证},{value: config安全距离, type: 'mesB'},
            {value: config几何尺寸, type: 'mesB'}, {value:[...item受力结构,...itemA受力结构,]},{value: config梯子, type: 'mesB'},
            {value:[...item机构速度,...itemA机构速度,...itemA制动距离,...itemA机构同步,...itemA停车专项,...itemA漏磁检]},
            {value:['unq','仪器表','观测备注','距离备注','几何备注','梯子备注']} ]);
        toast({title: "完成！", subtitle: result ? "没发现冲突" : "测试开关没开", intent: "success"});
    }, [rep?.tzFields,repId,theme,toast]);
    const getInpFilter = React.useCallback((par: any) => {}, []);
    const {inp, setInp} = useItemInputControl({ref});
    if (atPrint) return null;
    else
        return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={'初始化本报告，默认值配置等'}>
            {checkName && <div>
                <Text variant="h5">
                    构建开发模板时的工具：校验模板的存储name冲突；
                </Text>
                <Button intent='primary' onPress={() => {
                    doCheckNames(verId!);
                }}>校验模板name唯一性</Button>
            </div>
            }
            <hr/>
        </InspectRecordLayout>
    );
});

export const config观测数据 = [
    [{n: '卷筒板', t: ['C3.8.1', '卷筒上压板数量'], u: '个'}],
    [{n: '绳夹数', t: [undefined, '绳夹数量'],}],
    [{n: '绳夹间', t: [undefined, '绳夹间距'], u: 'mm'}],
    [{n: '编结长', t: [undefined, '钢丝绳编结长度'],}],
    [{n: '安圈数', t: [undefined, '安全圈数'], u: '圈'}],
    [{check: 'C3.8.1'}],
    [{n: '电阻N', t: ['C3.11.3', 'TN系统重复接地电阻'], u: 'Ω', c: '四', d: '2', save: true},
        {n: '电阻T', t: [undefined, 'TT系统接地电阻'], c: '弃', d: '2', save: false},
        {n: '电阻I', t: [undefined, 'IT系统接地电阻'], c: '四', },
    ],
    [{check: 'C3.11.3'}],
    [{n: '阻车高', t: ['C3.12.4', '阻车装置高度'], u: 'mm'}],
    [{check: undefined}],
    [{n: '绝缘阻', t: ['C3.14', '主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻'], u: 'MΩ'}],
    [{check: undefined}],
    [{n: '油前温', t: ['C4.7.2.3', '液压系统油液温升', '试验前温度'], u: '℃', omit: true},
        {n: '油后温', t: [undefined, undefined, '试验后温度'], omit: true},
        {n: '温升值', t: [undefined, undefined, '温升值'], omit: true},
        {n: '温升允', t: [undefined, undefined, '温升允许值'], omit: 'C4.7.2.3'},
    ],
    [{check: 'C4.7.2.3'}],
] as EachMeasureItemConfig[][];
export const ObservationMeasure =
    React.forwardRef((
        {children, show, alone = true, refWidth,}: InternalItemProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config观测数据, false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, '观测备注'];
        }, [itemObservationA]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={'附录1 观测值及测量结果记录表'}>
                附录1 观测值及测量结果记录表<br/>
                { render }
                备注：
                <TextArea  value={inp?.观测备注 ||''} rows={5}
                           onChange={e => setInp({ ...inp, 观测备注: e.currentTarget.value||undefined}) } />
                注：1、未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。（下同）<br/>
                2、其他需记录的测量值和结果值填在备注栏中。<br/>
                3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。<br/>
                4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
        </InspectRecordLayout>
    );
} );
export const config安全距离 = [
    [{n: '板地面距', t: ['汽车自行驶入的停车设备，搬运器(或载车板)停车表面端部与出入口地面接合处的距离'], u: 'm', c: '四', d: '2'},
        {n: '轨水平间', t: ['自动运行的搬运器轨道与周边可出入区域', '水平间隙'],  c: '四',},
        {n: '轨直高间', t: [undefined, '垂直高差'],  c: '四',},
        {n: '出入水间', t: ['如搬运器运行单点采取双轮方式时轨道与周边可出入区域的水平间隙'],  c: '四',},
    ],
    [{n: '建固净距', t: ['运动部分与建筑物净距','距固定部分'], c: '四', d: '2'},
        {n: '建栏净距', t: [undefined, '距作何栏杆或扶手'], c: '四', d: '2'},
        {n: '侧搬运器', t: [undefined, '侧方与外部固定部分的间隙尺寸','具有水平滚轮或带轮缘车轮导向的搬运器或搬运小车等'], c: '四', d: '2'},
        {n: '侧未平轮', t: [undefined, undefined,'未带水平轮的'], c: '四', d: '2'},
    ],
    [{n: '上界垂距', t: ['上界限尺寸','运动部分的上界限线与上方的固定或活动部分之间的垂直距离'], u: 'm', c: '四', d: '2'},
        {n: '上界维台', t: [undefined, '在保养区域和维修平台等处的距离'], c: '四', d: '2'},
        {n: '上界人距', t: [undefined, '如果不会对人员产生危险时的距离'], c: '四', d: '2'},
    ],
    [{n: '两载板距', t: ['垂直于汽车轴线方向移动的载车板','两载车板的外缘之间垂直于其移动方向的最小距离'], c: '四', d: '2'},
        {n: '邻板距', t: [undefined, '两邻近的载车板边缘内侧间的最小距离'], c: '四', d: '2'},
        {n: '板外缘距', t: [undefined, '载车板的外缘与固定建筑物或部件之间垂直于其移动方向的最小距离'], c: '四', d: '2'},
        {n: '板缘内距', t: [undefined, '载车板的边缘内侧与固定建筑物或部件之间垂直于其移动方向的最小距离'], c: '四', d: '2'},
        {n: '保杠建距', t: [undefined, '载车板上停放汽车的保险杠','与固定建筑物的最小距离'], c: '四', d: '2'},
        {n: '保杠他距', t: [undefined, undefined,'与其他载车板间，或与其他载车板上停放汽车的保险杠之间的最小距离'], c: '四', d: '2'},
    ],
    [{n: '轴两板外', t: ['沿汽车轴线方向移动的载车板','两载车板的外缘之间垂直于其移动方向的最小距离'], u: 'm', c: '四', d: '2'},
        {n: '轴终位距', t: [undefined, '载车板在最终位置时(转换区进出车位置除外)载车板的外缘与固定建筑物或部件之间沿其移动方向的最小距离'], c: '四', d: '2'},
        {n: '轴平固距', t: [undefined, '载车板平行于其移动方向的外缘与固定建筑物或部件之间的最小距离'], c: '四', d: '2'},
        {n: '轴缘内距', t: [undefined, '载车板的边缘内侧与固定建筑物或部件之间的最小距离'], c: '四', d: '2'},
    ],
    [{check: 'C3.3'}],
] as EachMeasureItemConfig[][];
export const SafeDistance =
React.forwardRef((
    {children, show, alone = true, refWidth,}: InternalItemProps, ref
) => {
    const {inp, setInp} = useItemInputControl({ref});
    const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config安全距离, false ,false);
    const itemA = React.useMemo(() => {
        return [...itemObservationA, '距离备注'];
    }, [itemObservationA]);
    const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={'附录2：C3.3 安全距离观测值及测量结果记录表'}>
            附录2：C3.3 安全距离观测值及测量结果记录表<br/>
            { render }
            备注：
            <TextArea  value={inp?.距离备注 ||''} rows={5}
                       onChange={e => setInp({ ...inp, 距离备注: e.currentTarget.value||undefined}) } />
            注：1、对于不合格的值才需测量和记录，未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。<br/>
            2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
        </InspectRecordLayout>
    );
} );

export const config几何尺寸 = [
    [{n: '入口转宽', t: ['出入口尺寸', '转换区','宽度'], u: 'm', c: '四', d: '2'},
        {n: '入口转高', t: [undefined, undefined,'高度'], c: '四', d: '2'},
        {n: '入工宽', t: [undefined, '工作区','宽度'], c: '四', d: '2'},
        {n: '入工高', t: [undefined, undefined,'高度'], c: '四', d: '2'},
    ],
    [{n: '人道宽', t: ['人行通道尺寸','宽度'], c: '四', d: '2'},
        {n: '人走宽', t: [undefined, '用于行走的宽度'], c: '四', d: '2'},
        {n: '人道高', t: [undefined, '高度'], c: '四', d: '2'},
    ],
    [{n: '栅栏高', t: ['栅栏高'], u: 'm', c: '四', d: '2'}],
    [{n: '车位宽', t: ['停车位尺寸','宽度'], c: '四', d: '2'},
        {n: '车位长', t: [undefined, '长度'], c: '四', d: '2'},
        {n: '车位高', t: [undefined, '高度'], c: '四', d: '2'},
        {n: '车位斜角', t: [undefined, '倾斜角度'], u: '°', c: '四', d: '2'},
    ],
    [{check: 'C3.6'}],
] as EachMeasureItemConfig[][];
export const Geometric =
React.forwardRef((
    {children, show, alone = true, refWidth,}: InternalItemProps, ref
) => {
    const {inp, setInp} = useItemInputControl({ref});
    const {render,itemObservation, itemObservationA,}=useMeasureOldVer(inp,setInp, config几何尺寸, true ,false);
    const itemA = React.useMemo(() => {
        return [...itemObservationA, '几何备注'];
    }, [itemObservationA]);
    const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={'附录3：C3.6主要几何尺寸观测值及测量结果记录表'}>
            附录3：C3.6主要几何尺寸观测值及测量结果记录表(适于改造监检)<br/>
            { render }
            备注：
            <TextArea  value={inp?.几何备注 ||''} rows={5}
                       onChange={e => setInp({ ...inp, 几何备注: e.currentTarget.value||undefined}) } />
            注：1、以设计图样要求作为检验结果判定依据。<br/>
            2、其他尺寸的要求可将其测量值和结果填在备注栏中。<br/>
            3、停车位尺寸中的倾斜角度为“适停车辆倾斜角”。
        </InspectRecordLayout>
    );
} );
const itemA制动距离=['主制距','主制距r','制距备注'];
export const Braking=
React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA制动距离,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'附录7：C4.3.2.2起升机构制动距离记录表'}>
            附录7：C4.3.2.2起升机构制动距离记录表, 单位：mm<br/>
            项目 {'>'} 起升机构：
            <LineColumn>
                { (new Array(3)).fill(null).map(( _,  w:number) => {
                    return <InputLine key={w} label={`次数${w+1}，制动距离：`}>
                        <SuffixInput  value={inp?.主制距?.[w] ||''} onSave={txt=>arraySetInp('主制距',w,txt,inp,setInp)}>mm</SuffixInput>
                    </InputLine>;
                }) }
                <InputLine  label='平均制动距离：'>
                    <Text>{calcAverageArrObj(inp?.主制距,a=>a,2,3)}mm</Text>
                </InputLine>
                <InputLine label={'起升机构 > 制动距离-检验结果'}>
                    <SelectHookfork value={ inp?.主制距r ||''}
                                    onChange={e => setInp({ ...inp, 主制距r: e.currentTarget.value||undefined}) }/>
                </InputLine>
            </LineColumn>
            备注：
            <TextArea  value={inp?.制距备注 ||''} rows={3}
                       onChange={e => setInp({ ...inp, 制距备注: e.currentTarget.value||undefined}) } />
            注：1、对于产品标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文 件对制动距离都没有规定的，相应的制动距离可不测量。<br/>
            2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
        </InspectRecordLayout>
    );
} );
export const items机构同步=['同小构','不小构','不小行','他机构'];
const itemA机构同步=['同小构','不小构','不小行','他机构','同步性r','同步备注'];
/**同步性能： 嵌套对象存储方式的{n,u,fu,fd,su,sd,m,l}， 布局也有特别的ColumnWidth。
 * */
export const InstitutionSync=
React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA机构同步,);      //实际存储还是嵌套的对象格式的。'同小构'：{}；
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'附录8：C4.3.2.3各机构同步性能记录表'}>
            附录8：C4.3.2.3各机构同步性能记录表<br/>
            { items机构同步.map((field, i:number) => {
                return  <React.Fragment key={i}>
                    第{i+1}个项目 {'>>'}
                    <ColumnWidth clnWidth={320} >
                        <InputLine  label='本项目是什么机构的：'>
                            <Input  value={inp?.[field]?.n ||''}
                                    onChange={e => setInp({ ...inp, [field]:{...inp?.[field], n: e.currentTarget.value||undefined} }) } />
                        </InputLine>
                        <InputLine  label='单位：'>
                            <Input  value={inp?.[field]?.u ||''}
                                    onChange={e => setInp({ ...inp, [field]:{...inp?.[field], u: e.currentTarget.value||undefined} }) } />
                        </InputLine>
                        <InputLine  label='机构1：'>
                            <div css={{display: 'flex',alignItems: 'center'}}>
                                <Input  value={inp?.[field]?.fu ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fu: e.currentTarget.value||undefined} }) } />
                                /
                                <Input  value={inp?.[field]?.fd ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], fd: e.currentTarget.value||undefined} }) } />
                            </div>
                        </InputLine>
                        <InputLine  label='机构2：'>
                            <div css={{display: 'flex',alignItems: 'center'}}>
                                <Input  value={inp?.[field]?.su ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], su: e.currentTarget.value||undefined} }) } />
                                /
                                <Input  value={inp?.[field]?.sd ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], sd: e.currentTarget.value||undefined} }) } />
                            </div>
                        </InputLine>
                        <ColumnWidth clnWidth={160} >
                            <InputLine  label='偏差测量值：'>
                                <Input  value={inp?.[field]?.m ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], m: e.currentTarget.value||undefined} }) } />
                            </InputLine>
                            <InputLine  label='偏差允计值：'>
                                <Input  value={inp?.[field]?.l ||''}
                                        onChange={e => setInp({ ...inp, [field]:{...inp?.[field], l: e.currentTarget.value||undefined} }) } />
                            </InputLine>
                        </ColumnWidth>
                    </ColumnWidth>
                </React.Fragment>;
            }) }
            <InputLine label='C4.3.2.3各机构同步性能-检验结果'>
                <SelectHookfork value={ inp?.同步性r ||''}
                                onChange={e => setInp({ ...inp, 同步性r: e.currentTarget.value||undefined}) }/>
            </InputLine>
            备注：
            <TextArea  value={inp?.同步备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 同步备注: e.currentTarget.value||undefined}) } />
            <Text>注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
                2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。<br/>
                3、未检查或无需检验的，仅填检验结果栏。
            </Text>
        </InspectRecordLayout>
    );
} );
export const items停车专项=[['单车最大进(出)时间','进出时','s'],['平层精度','平层精','mm'],['停位误差','停位误','mm'],['停准精度','停准精','mm']];
const itemA停车专项=['进出时','平层精','停位误','停准精','停车专r','停专备注'];
/**机械式停车设备专项试验
 * */
export const ParkSpecial=
React.forwardRef(({ children, show ,alone=true,refWidth}:InternalItemProps,  ref
) => {
    const [getInpFilter]=useMeasureInpFilter(null,itemA停车专项,);      //实际存储还是嵌套的对象格式的。'进出时'：{l,,}；
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={'附录9：C4.3.2.5机械式停车设备专项试验记录表'}>
            附录9：C4.3.2.5机械式停车设备专项试验记录表<br/>
            { items停车专项.map(([title,field,unit], i:number) => {
                return  <React.Fragment key={i}>
                    第{i+1}个项目 {'>'} {title}:
                    <ColumnWidth clnWidth={320} key={i}>
                        <InputLine  label='偏差允计值：'>
                            <Input  value={inp?.[field]?.l ||'±'}
                                    onChange={e => setInp({ ...inp, [field]:{...inp?.[field], l: e.currentTarget.value||undefined} }) } />
                        </InputLine>
                        { (new Array(3)).fill(null).map(( _,  w:number) => {
                            return <ColumnWidth clnWidth={160} key={w+'_'+i}>
                                <InputLine label={`次数${w+1}，测量值：`}>
                                    <SuffixInput  value={inp?.[field]?.o?.[w] ||''} onSave={txt=>objNestArrSetInp(field,'o',w,txt,inp,setInp)}>{unit}</SuffixInput>
                                </InputLine>
                                <InputLine label={`次数${w+1}，结果值：`}>
                                    <SuffixInput  value={inp?.[field]?.v?.[w] ||''} onSave={txt=>objNestArrSetInp(field,'v',w,txt,inp,setInp)}>{unit}</SuffixInput>
                                </InputLine>
                                <InputLine label={`次数${w+1}，偏差值：`}>
                                    <Input  value={inp?.[field]?.m?.[w] ||''}
                                            onChange={e => objNestArrSetInp(field,'m',w, e.currentTarget.value||undefined, inp,setInp)} />
                                </InputLine>
                            </ColumnWidth>;
                        }) }
                    </ColumnWidth>
                </React.Fragment>;
            }) }
            <InputLine label='C4.3.2.5机械式停车设备专项试验-检验结果'>
                <SelectHookfork value={ inp?.停车专r ||''}
                                onChange={e => setInp({ ...inp, 停车专r: e.currentTarget.value||undefined}) }/>
            </InputLine>
            备注：
            <TextArea  value={inp?.停专备注 ||''} rows={4}
                       onChange={e => setInp({ ...inp, 停专备注: e.currentTarget.value||undefined}) } />
            <Text>注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
                2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
            </Text>
        </InspectRecordLayout>
    );
} );
const itemA技术见证=['见证表','记事表','大备注'];
const default见证=[{no:'ZLQR',ti:'资料审查确认单'},{no:'ZJBG',ti:'机械式停车设备施工过程自检记录'}];
const default记事=[{nm:'检验意见通知书'},];
export const Witness=
React.forwardRef((
    { children, show ,alone=true,redId,nestMd}:InternalItemProps,  ref
) => {
    const defvcbFunc = React.useCallback((par: any) => {
        const { 见证表,记事表 }=par||{};
        if(!见证表 || 见证表.length<1)   par.见证表=default见证;
        if(!(记事表?.length>=1))   par.记事表=default记事;
        return  par;
    }, []);
    const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
    const {inp, setInp} = useItemInputControl({ ref });
    return  <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                 alone={alone}  label={'五、技术资料见证 六、记事 七、备注'}>
        <TechnicalWitness  inp={inp} setInp={setInp} defaultV={default见证} label={'五、技术资料和工作见证材料'}/>
        <hr/>
        <Notepad  inp={inp} setInp={setInp} defaultV={default记事} label={'六、记事'}/>
        <hr/>
        <Text variant="h5">
            七、备注
        </Text>
        <TextArea  value={inp?.大备注 ||''} rows={4}
                   onChange={e => setInp({ ...inp, 大备注: e.currentTarget.value||undefined}) } />
        注：本备注栏的内容在检验报告备注栏内体现。
    </InspectRecordLayout>;
} );

