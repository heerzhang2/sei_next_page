/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, useTheme, Button, useToast, TextArea, InputLine, SuffixInput, Input,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl
} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EachMeasureItemConfig, } from "../../common/measure";
import {useMeasureInpFilter} from "../../common/hooks";
import {
    useMeasureRow, useMeasureEdit, useMeasureItem
} from "../../hook/useMeasure";
import {EditorProps} from "../../common/editor";
import {itemA制动距离, itemA技术见证, itemA结论, itemB机构速度} from "../editorIN";
import {config梯子, itemA漏磁检, itemB受力结构} from "../../park/editor";

const 施工许可证子项选=['曳引驱动乘客电梯','曳引驱动载货电梯','曳引驱动乘客电梯（含消防员电梯）'];
const 操纵方式选= ["地面操纵", "司机室操纵", "遥控", "多点操纵", "其它", "遥控", "其它", "地面操作", "司机室操作", "操作平台操作", "地面+司机室", "地面+遥控", "遥控+司机室", "地面+遥控+司机室"];
const 作业环境选=["室内", "室外", "吊运熔融金属", "吊运炽热固体", "防爆", "绝缘"];
export const 主臂型式选=["伸缩式", "桁架式", "箱形", "其它"];
export const config设备概况 = [
    [['使用单位名称', '_$使用单位'] ],
    [['使用单位地址', '_$使用单位地址'] ],
    [['分支机构', '_$分支机构'] ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['产权单位名称', '_$产权单位'] ],
    [['产权单位地址', '_$产权单位地址'] ],
    [['使用单位联系人', '_$单位联系人'], ['使用单位安全管理人员', '安全员']],
    [['使用单位联系电话', '_$使用单位电话'], ['安全管理人员联系电话', '安全员电']],
    [['使用单位统一社会信用代码', '_$使用单位信用码'], ['管理部门类型','_$使管部类型']],
    [['制造单位', '_$制造单位'] ],
    [['制造单位生产许可证编号', '生产许号'], ['制造单位生产许可证许可子项目', {n: '制许可子', t: 'l', l: 施工许可证子项选}], ],
    [['型号', '_$型号'], ['产品编号', '_$出厂编号']],
    [['操纵方式',{n:'操纵方式',t:'l',l:操纵方式选}],['作业环境',{n:'作业环境',t:'l',l:作业环境选}]],
    [['防爆等级','_$防爆等级'],['进口情况','_$进口类型']],
    [['制造日期', '_$制造日期'], ['投入使用日期', '_$投用日期']],
    [['单位内编号','_$单位内部编号'],['设计使用年限','_$设计年限', '年']],
    [['检验地点', '检验地点'] ],
    [['设备使用地点所在区域', '使地区域'], ['邮政编码', '_$使用单位邮编']],
    [['额定起重量','_$额定起重量','t'],['额定起重力矩','_$起重力矩','t·m']],
    [['起升速度','_$起升速','m/min'],['工作幅度',{n:'工作幅度',t:'n',u:'m'}]],
    [['起升高度',{n:'起升高度',t:'n',u:'m'}], ['工作级别','_$工作级别']],
    [['起升速度','_$回转速度','r/min'],['作业时动力方式','_$动力系统']],
    [['主臂型式',{n:'主臂型式',t:'l',l:主臂型式选}], [' ',{r:''}] ],
    //pa.检验时副钩额定起重量 ?
    [['检验时主起升机构起重量',{n:'主起起重', u:'t'}], ['检验时副起升机构起重量',{n:'副起起重', u:'t'}] ],
    [['其他主要参数',{n:'其他参数',t:'m'}], ],
    [['检验时吊具',{n:'检吊具',t:'l',l:['吊钩','集装箱吊具','抓斗','起重电磁铁','真空吸盘','夹钳','其他']}],['主起升机构起升悬挂部件',{n:'主起悬挂',t:'l',l:['钢丝绳','环链','纤维绳','钢铰线','其他']}]],
    [['检验依据',{r:'《起重机械安全技术规程》（TSG 51-2023）'}]],
    [['检验意见通知书编号','意通知号'], ['整改反馈期限',{n:'改反馈期',t:'d'}] ],
    [['下次定期检验日期','_$新下检日'],['是否流动作业',{n:'流动作业',t:'b'}]],
    [['现场检验条件',{r:'见附录13'}],['是否型式试验样机',{n:'型试样机',t:'b'}]],
    [['附设装置名称','附设装']],
    [['备注',{n:'概备注',t:'m'}]],
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
        const impressionismAs = setupItemAreaRoute({rep, noDefault: true, theme});
        //几个固定都会有的，其余测量项目多出的，【第一次】可检查console.log看看assertNamesUnique: 正常吗。rep?.tzFields没有区分设备类型的。
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'},
            {value: config设备概况, type:'esnt'}, {value: config观测数据, type: 'mesB'},{value: configFix安全距, type: 'mesB'},
            {value: itemA结论}, {value: config梯子, type: 'mesB'},
            {value:[...itemA技术见证,...itemA观测1,...itemA安全距,...itemB受力结构,...itemB机构速度,...itemA制动距离,...item流动式专,...itemA漏磁检 ]},
            {value:['unq','仪器表','检验条件', '梯子备注', ]} ]);
        toast({title: "完成！", subtitle: result ? "没发现冲突" : "测试开关没开", intent: "success"});
    }, [rep,theme,toast]);
    const getInpFilter = React.useCallback((par: any) => {}, []);
    const {inp, setInp} = useItemInputControl({ref});
    if (atPrint) return null;
    else return (
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
/**测量表：太多了可拆成两个编辑器； 注意：t: [] 不同于 t: [undefined,undefined,undefined]；
 * */
export const config观测数据 = [
    [{n: '卷筒板', t: ['C3.8.1','卷筒上压板数量'], u: '个'}, ],
    [{n: '绳夹数', t: [undefined,'绳夹数量'],  save: false},],
    [{n: '绳夹间', t: [undefined,'绳夹间距'],  u: 'mm', c: '弃', d: '2', save: false},],
    [{n: '编结长', t: [undefined,'钢丝绳编结长度'],  c: '弃', d: '2', save: false},],
    [{n: '安圈数', t: [undefined,'安全圈数'],  u: '圈', save: false},],
    [{check: 'C3.8.1', }],
    [{n: '敞护高', t: ['C3.10','敞开式司机室护栏高度'], u: 'm'}, ],
    [{check: 'C3.10'}],
    [{n: '电阻N', t: ['C3.11.3', 'TN系统重复接地电阻'], u: 'Ω', c: '四', d: '2', save: true},
        {n: '电阻T', t: [undefined, 'TT系统接地电阻'], c: '弃', d: '2', save: false},
        {n: '电阻I', t: [undefined, 'IT系统接地电阻'], c: '四', },
    ],
    [{check: 'C3.11.3'}],
    [{n: '备磁铁', t: ['C3.11.7','起重电磁铁：备用电池能够保持起重电磁铁吸附额定载荷的时间'], u: 'mm'}, ],
    [{check: 'C3.11.7'}],
    [{n: '绝缘阻', t: ['C3.14','主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻'], u: 'MΩ'}, ],
    [{check: 'C3.14'}],
    [{n: '空吸盘', t: ['C4.5.2.4','真空吸盘：如果出现电源故障，真空吸盘能够保持载荷的时间'], u: 'mm'}, ],
    [{check: 'C4.5.2.4'}],
] as EachMeasureItemConfig[][];

interface ObservationMeasureProps  extends InternalItemProps{
    label: string;
    config: ( (orc:any)=>EachMeasureItemConfig[][] ) | EachMeasureItemConfig[][];
    iAname?: string[];           //附加的存储那些字段     ，'观测备注'
}
const itemA观测1=['观测备注',];
/**更为通用性的测量： 可拆分两个编辑器， children也能注入内容。 iAname：附加存储。
 * */
export const ObservationMeasure =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const newconfig=typeof config ==='function'? config(inp) : config;
        const {render,itemObservation, itemObservationA,}=useMeasureEdit(inp,setInp, newconfig, false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, ...itemA观测1, ...iAname??[]];
        }, [itemObservationA, iAname]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                {label}<br/>
                { render }
                备注：
                <TextArea  value={inp?.观测备注 ||''} rows={5}
                           onChange={e => setInp({ ...inp, 观测备注: e.currentTarget.value||undefined}) } />
                注：1、未测量或无需测量的，仅填检验结果栏。
                2、其他需记录的测量值和结果值填在备注栏中。
                3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
                4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值
                { children }
            </InspectRecordLayout>
        );
    } );
//早前版本：编辑器和打印的都很别直接拼凑的，两个代码关联的字段name需要人工复制核对，没有config数组的模式。
export const config距离 =(orc:any)=> [
    [{n: '距固定', t: ['（1）运动部分与建筑物净距','距固定部分'], u: 'm'}, ],
    [{n: '距扶手', t: [undefined,'距任何栏杆或扶手'],  save: false},],
    [{n: '距出入', t: [undefined,'距出入区'], c: '弃', d: '2', save: false},],
    [{n: '垂出入', t: ['（2）运动部分的下界限线','与下方的一般出入区之间的垂直距离'],  c: '弃', d: '2', save: false},],
    [{n: '垂不准', t: [undefined,'与通常不准人出入的下方的固定或活动部分及与栏杆顶部的垂直距离'],   save: false},],
    [{n: '保养距', t: ['（3）运动部分的上界限线与上方的固定或活动部分之间的垂直距离','在保养区域和维修平台等处的距离'],  save: false},],
    [{n: '人险距', t: [undefined,'如果不会对人员产生危险时的距离'],  save: false},],
    [{n: '输最距', t: [<Text>(4)与输电线的最小距离，线路电压（ {orc?.输线电压} ）kv</Text>],  save: false},],
    [{check: 'C3.3', }],
] as EachMeasureItemConfig[][];

export const itemA安全距=['输线电压','安距备注'];
const configFix安全距 =config距离({});           //若用useMeasureClistX()会陷入hook依赖的循环！！
export const SafeDistance =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {itemObservation, itemObservationA,}=useMeasureItem(configFix安全距,false);
        const {inp, setInp} = useItemInputControl({ref});
        //【Hook死循环】不能使用const newconfig=typeof config ==='function'? config(inp) : config;
        const newconfig =React.useMemo(() => {
            return (typeof config ==='function')? config({输线电压: inp?.输线电压}) : config;
         //底下依赖项 也没法使用[inp?.输线电压, config]无法对'输线电压'编辑成功；另外用}, [storage?.输线电压, config]);也需要重新刷新才能同步。
         //inp.输线电压 变动：=>newconfig=>itemObservationA=>getInpFilter=>inp形成了循环变动链条，循环了！必须要斩断其中一个点关联！！useMeasureClistX进行修订？Fix可变的config两种配置；
        }, [inp?.输线电压, config]);
        const {render}=useMeasureRow(inp,setInp, newconfig, false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, ...itemA安全距, ...iAname??[]];
        }, [itemObservationA, iAname]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        //【严重的毛病】会死循环！
        // React.useEffect(() => { setInp({ ...inp, 输线电压: voltage }); }, [voltage, inp, setInp] );
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                {label}<br/>
                本表合计4款共8项目，其中第四款：(4)与输电线的最小距离，线路电压（ ）kv；
                <InputLine  label='(4)线路电压' >
                    <SuffixInput  value={inp?.输线电压 ||''}  placeholder="使用默认规则，缺省编号情况的可不填"
                             onChange={e =>setInp({ ...inp, 输线电压: e.currentTarget.value||undefined }) }>(kv)</SuffixInput>
                </InputLine>
                <hr/>
                { render }
                <hr/>
                备注：
                <TextArea  value={inp?.安距备注 ||''} rows={5}
                           onChange={e => setInp({ ...inp, 安距备注: e.currentTarget.value||undefined}) } />
                { children }
            </InspectRecordLayout>
        );
    } );

const item流动式专o=[['活塞杆缩','变幅油缸的活塞杆回缩量','mm'],['下沉量','重物下沉量','mm'],['腿活塞缩','支腿油缸的活塞杆回缩量','mm'],
                  ['箱爬坡度','集装箱正面吊运起重机爬坡度','°'],['铁平仪精','铁路起重机的水平仪安装精度','°']];
const itemA流动式专: string[]=[];
const item流动式专: string[]=[];              //简化name唯一性检查：不需要查：itemA流动式专
item流动式专o.forEach(([name,title,unit], i:number)=>{
    item流动式专.push(name);
    itemA流动式专.push(name+'r');
});
/**变换新思路： 编辑器采用简约原始文字流布局的。
 * */
export const SpecialExperm =
React.forwardRef((
    {children, show, alone = true, repId, verId, rep,label}: EditorProps, ref
) => {
    const theme = useTheme();
    const [getInpFilter]=useMeasureInpFilter(item流动式专,itemA流动式专,);
    const {inp, setInp} = useItemInputControl({ ref });
    return (
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={label!}>
            {label}, 如下{item流动式专o.length}个测量工况:
            <div css={{display: 'flex',margin: 'auto'}}>
                <div css={{display: 'inline-block',margin: 'auto'}}>
                    {item流动式专o.map(([name, title, unit], i: number) => {
                        return <React.Fragment key={i}>
                            <Text variant="h5">{title}:</Text>
                            观测结果
                            <Input value={inp?.[name + 'o'] || ''} size={4}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => setInp({...inp, [name + 'o']: e.currentTarget.value || undefined})}/>
                            (单位：{unit})，观测数据检验结果
                            <div css={{width: '12rem', display: 'inline-flex', "& > div": {width: '100%'}}}>
                                <SelectHookfork value={(inp?.[name + 'r']) || ''}
                                                onChange={e => setInp({
                                                    ...inp,
                                                    [name + 'r']: e.currentTarget.value || undefined
                                                })}/>
                            </div>
                            。
                        </React.Fragment>;
                    })}
                </div>
            </div>
            <Text>
                注：
                1、对于采用油缸支撑起重作业的流动式起重机在密封性能试验时，载荷稳定后的 15min 内变幅液压油缸和垂直支腿液压油缸的回缩量应不大于
                2mm，载荷下沉量不 大于 15mm；
                2、对于采用液压系统的集装箱正面吊运起重机在额定载荷试验时，吊具下沉量在 10min 内不大于 150mm；
                3、采用液压支腿的铁路起重机在密封性能试验时，10min 内活塞杆回缩量不大 于 2mm 和设计文件的要求。
                4、集装箱正面吊运起重机爬坡度符合设计文件和产品标准的要求；
                5、铁路起重机的水平仪安装精度，应当以底架上的回转支承安装平面为基准，安装精度在±0.5°范围内；铁路起重机对中装置
                显示正确。
                4、未检查或无需检验的，仅填检验结果栏。
            </Text>
        </InspectRecordLayout>
);
});

