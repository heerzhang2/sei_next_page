/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, Text, TextArea, useTheme, useToast,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
// import {itemA结论,} from "../../mobilecr/editorIN";
import {EditStorageContext} from "../../StorageContext";
import {EachMeasureItemConfig} from "../../common/measure";
import {itemA技术见证, itemA结论} from "./editor";
import {itemA间隙} from "./DoorGap";
import {itemn平衡} from "./Equilibrium";
import {itemA限速器对, itemA限速器轿} from "./LimiterSpeed";
// import {itemA技术见证} from "./editor";

const 监检依据选=[
    "TSG T7001或TSG T7002或TSG T7003之前",
    "TSG T7001或TSG T7002或TSG T7003（及1号修改单）",
    "TSG T7001或TSG T7002或TSG T7003及2号修改单（及3号修改单）",
    "TSG T7001-2023"
];
export const 检测依据选=[`TSG T7008-2023《电梯自行检测规则》 
《福建省市场监管局办公室关于做好电梯远程监测装置等配置和检验检测工作的通知》（闽市
监办[2023]12号）
`
];
const input检测依据={
    edit:(inp:any,setInp:(a:any)=>void, orc:any)=>{
        return <div>检测依据:
            <TextArea  value={inp?.检测依据 ??检测依据选[0]} rows={4}
                       onChange={e => setInp({ ...inp, 检测依据: e.currentTarget.value||undefined}) } />
        </div>;
    },
    // names: [ ],
    // toTail: ' ',
    view:(orc:any)=> {
        return <div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>
            {orc.检测依据 ??检测依据选[0]}
        </div>
    }
};
export const config设备概况 = [
    [['统一社会信用代码', '_$使用单位信用码'], ['设备所在区域', '_$使用地区域']],
    [['设备注册代码', '_$注册代码'], ['使用登记证编号', '_$使用证号'] ],
    [['楼盘名称', '_$楼盘'], ['分支机构名称', '_$分支机构'] ],
    //单位台账的属性：部门管理类型 舍去： 单位管理类型 "MGE_DEPT_TYPE_NAME": [ "无内设管理部门", "内设管理部门", "内设分支机构" ],
    [['安装地点', '_$设备使用地点'], ['单位内编号','_$单位内部编号']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['制造单位名称', '_$制造单位'] ,['制造日期', '_$制造日期'] ],
    [['改造单位名称','_$改造单位'], ['改造日期', {n:'改造日期',t:'d'}] ],
    [['额定载重量','_$额定载荷','kg'], ['额定速度', '_$运行速度','m/s'] ],
    [['层数','_$电梯层数','层'], ['站数', '_$电梯站数','站'] ],
    [['门数','_$电梯门数','门'], ['控制方式', '_$控制方式',] ],
    [['倾斜角','_$倾斜角度','°'], ['轿门位置', '轿门位',] ],
    [['区域防爆等级', '_$防爆等级'], ['整机防爆标志','_$防爆标志',] ],
    [['驱动主机型号', '_$主机型号'], ['驱动主机编号', '_$主机编号'] ],
    //控制柜{?屏 }型号
    [['控制柜型号', '_$控制屏型号'], ['控制柜编号', '_$控制屏编号'] ],
    [['轿厢限速器型号', '_$限速器型号'], ['轿厢限速器编号', '_$限速器编号'] ],
    [['对重限速器型号', '_$对限速型号'], ['对重限速器编号', '_$对限速编号'] ],
    // [['平衡系数范围','平衡系范'], [' ',{r:' '}] ],
    [['安全管理人员', '安全员'], ['使用单位联系电话', '_$使用单位电话'] ],
    // ?设备联系人的手机
    [['使用单位联系人手机', '_$设备联系手机'], ['维保电话', '维保电话'] ],
    [['使用单位地址', '_$使用单位地址'] ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['楼盘地址', '_$楼盘地址'] ],
    [['维保单位名称', '_$维保单位']],
    [['电梯自行检测备忘录编号','检备录号'], ],
    [['监督检验依据',{n: '监检依据', t: 'B', l: 监检依据选}] ],
    [['监督检验日期',{n:'监检日',t:'d'}], ['上次检验日期',{n:'上检验日',t:'d'}] ],
    [['下次检验日期',{n:'下检验日',t:'d'}],  ['下次检测日期','_$新下检日'] ],
    [['现场检测条件',{r:'见附录D'}]],
    [['检测依据','检测依据',input检测依据]],
];

/**测量表：太多了可拆成两个编辑器； 注意：t: [] 不同于 t: [undefined,undefined,undefined]；
 * */
export const config观测数据 = [
    [{n: '道门宽', t: ['A1.2.1.2','(1)','机房通道门的高度不小于1.80m，宽度不小于0.60m'], x:'宽度', u: 'm'},
        {n: '道门高', t: [undefined,undefined,null], x:'高度',  },
    ],
    [{check: '1.2.1.2', }],
    [{n: '坑通门宽', t: ['A1.2.2.2','(3)','底坑通道门的高度不小于1.80m，宽度不小于0.60m'], x:'宽度', u: 'm'},
        {n: '坑通门高', t: [undefined,undefined,null], x:'高度',  },
        {n: '板门宽', t: [undefined,undefined,'斜行电梯活板门的尺寸不小于0.80m×0.80m'], x:'宽度',  },
        {n: '板门高', t: [undefined,undefined,null], x:'高度',  },
    ],
    [{check: '1.2.2.2', }],
    [{n: '板缓允许', t: ['A1.2.2.4','(4)','当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的距离不超过对重越程距离标识上标注的最大允许值'], x:'最大允许值', u: 'mm'},
        {n: '板缓顶距', t: [undefined,undefined,null], x:'测量值',  },
    ],
    [{check: '1.2.2.4', }],
    [{n: '钢丝绳直', t: ['A1.2.5.1','(1)','磨损后的钢丝绳直径小于钢丝绳公称直径的90%。'], x:'钢丝绳直径', u: 'mm'},
        {n: '钢丝公称', t: [undefined,undefined,null], x:'公称直径',  },
    ],
    [{check: '1.2.5.1(1)', }],
    [{n: '断丝数', t: [undefined,'(2)','一个捻距内出现的断丝数'], x:'断丝数', u: '根', c: '四', d: '0',save:false},
    ],
    [{check: '1.2.5.1(2)', }],
    [{n: '脚板宽', t: ['A1.2.6.7','(1)','对于非斜行电梯，轿厢护脚板的垂直部分高度不小于0.75m，宽度不小于层站入口宽度；'], x:'宽度', u: 'm',c:'四',d:'1'},
        {n: '脚板直高', t: [undefined,undefined,null], x:'高度',  },
        {n: '斜脚板宽', t: [undefined,'(2)',<Text>对于斜行电梯，轿厢护脚板的宽度至少等于运载装置位于开锁区域内时相应层站人口可能暴露的整个净宽度；设有侧置轿门时，其垂直部分的尺寸能够保护所有
                可能暴露的表面;设有前置轿门时，面对较低的层站侧，垂直部分的高度不小于0.30m。</Text>], x:'宽度',  },
        {n: '斜脚板高', t: [undefined,undefined,null], x:'高度',  },
    ],
    [{check: '1.2.6.7', }],
    [{n: '房噪测1', t: ['A1.3.14','(1)','机房噪声：电梯以额定速度运行，声音测量传感器置于距地面高1.5m、驱动主机1.0m处测试，测试点不少于3点，取平均值'], x:'测量值1', u: 'dB',c:'四',d:'1'},
        {n: '房噪测2', t: [undefined,undefined,null], x:'测量值2',  },
        {n: '房噪测3', t: [undefined,undefined,null], x:'测量值3',  },
        {n: '房噪背景', t: [undefined,undefined,null], x:'背景',  },
    ],
    [{n: '厢噪上', t: [undefined,'(2)','轿厢内噪声:电梯以额定速度全程上、下运行，声音测量传感器置于轿厢内中央、距地面高1.5m处测试，取最大值；'], x:'上行', u: 'dB',c:'四',d:'1'},
        {n: '厢噪下', t: [undefined,undefined,null], x:'下行',  },
        {n: '厢噪背景', t: [undefined,undefined,null], x:'背景',  },
    ],
    [{n: '开门噪', t: ['A1.3.14','(3)',<Text>开关门噪声：声音测量传感器置于层（轿）门宽度的中央、
                            距门0.24m、地面高1.5m处，测试开、关门过程中的噪声，取最大值；</Text>], x:'开门', u: 'dB',c:'四',d:'1'},
        {n: '关门噪', t: [undefined,undefined,null], x:'关门',  },
        {n: '关门背景', t: [undefined,undefined,null], x:'背景',  },
    ],
    [{n: '层噪上', t: [undefined,'(4)',<Text>无机房层门处噪声:声音测量传感器置于驱动主机安装位置最近层站开门宽度的中 部对着层门，在水平方向距门扇0.5m，垂直方向距层站地面1.5m处测试，取出发
                   端站门关闭后至到达端站门开启前，电梯全程上、下运行过程中以额定速度运行 时的最大值</Text>], x:'上行', u: 'dB',c:'四',d:'1'},
        {n: '层噪下', t: [undefined,undefined,null], x:'下行',  },
        {n: '层噪背景', t: [undefined,undefined,null], x:'背景',  },
    ],
    [{check: '1.3.14', }],
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
            {value:[...itemA间隙, ...itemn平衡 ] }, {value:[...itemA限速器轿, ...itemA限速器对 ] },
            {value:['unq','仪器表','检验条件', ]} ]);
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
