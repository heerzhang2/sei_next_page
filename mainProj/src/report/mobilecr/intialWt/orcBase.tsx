/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, Text, TextArea, useTheme, useToast,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EditStorageContext} from "../../StorageContext";
import {EachMeasureItemConfig} from "../../common/measure";
import {作业环境选, 升悬挂部件选, 操纵方式选, 施工许可证子项选, 检验时吊具选} from "../../gantry/Periodical/orcBase";
import {render工作幅} from "../../tower/craneJj/orcBase";
import {config距离, itemA安全距, 主臂型式选} from "../Intial/orcBase";
import {itemA结论} from "../../lift/hydlicDj/editor";
import {itemA技术见证} from "../editorIN";
import {itemA受力结构, item受力结构} from "../../tower/craneJj/editThicknes";
import {config运行速度} from "./MoveSpeed";
import {defConfig制动} from "./Braking";
import {itemA流动专} from "./SpecialTopic";
import {itemA漏磁检} from "./MagneticLeak";


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


export const config梯子 = [
    [{n: '台净高', t: ['（1）通道与平台','通道、斜梯和平台的净空高度'], u: 'm', c: '四'}],
    [{n: '台净宽', t: [undefined,'运动部分附近的通道和平台的净宽度'], c: '四'}],
    [{n: '高不净宽', t: [undefined,'如果设有扶手或者栏杆，在高度不超过0.6m的范围内，通道的净宽度'], c: '四'}],
    [{n: '固道净宽', t: [undefined,'固定部分之间的通道净宽度'], c: '四'}],
    [{n: '少使高', t: [undefined,'起重机械结构件内部很少使用的进出通道','最小净空高度'], c: '四'}],
    [{n: '少使道宽', t: [undefined,undefined,'通道净宽度'], c: '四'}],
    [{n: '维保净高', t: [undefined,'只用于维护保养的平台，其上面的净空高度'], c: '四'}],
    [{n: '缝隙最宽', t: [undefined,'通道基面上缝隙长度等于或者大于200mm时，其最大宽度'], u: 'mm', c: '四'}],
    [{n: '动线上距', t: [undefined,'通道区域与裸露动力线，上方距离'], u: 'm', c: '四'}],
    [{n: '动线左右', t: [undefined,'通道区域与裸露动力线，左右距离'], c: '四'}],
    [{n: '动线下距', t: [undefined,'通道区域与裸露动力线，下方距离'], c: '四'}],
    [{n: '斜梯角', t: ['（2）梯子与栏杆','斜梯','斜梯的倾斜角'], u: '°', c: '四'}],
    [{n: '斜栏间距', t: [undefined,undefined,'主要斜梯栏杆的间距'], u: 'm', c: '四'}],
    [{n: '他斜栏间', t: [undefined,undefined,'其他斜梯栏杆的间距'], c: '四'}],
    [{n: '斜靠栏高', t: [undefined,undefined,'斜梯的一侧靠墙壁时，栏杆高度'], c: '四'}],
    [{n: '梯级宽', t: [undefined,undefined,'梯级的净宽度'], c: '四'}],
    [{n: '梯级高', t: [undefined,undefined,'单个梯级的高度'], c: '四'}],
    [{n: '梯级进深', t: [undefined,undefined,'梯级的进深'], c: '四'}],
    [{n: '直撑杆间', t: [undefined,'直梯','直梯两侧撑杆的间距'], c: '四'}],
    [{n: '撑梯级宽', t: [undefined,undefined,'两侧撑杆之间梯级宽度'], c: '四'}],
    [{n: '直梯级间', t: [undefined,undefined,'梯级的间距'], c: '四'}],
    [{n: '直梯固距', t: [undefined,undefined,'梯级与固定结构件距离'], c: '四'}],
    [{n: '直护圈径', t: [undefined,undefined,'从高处有跌落危险的直梯，护圈直径'], c: '四'}],
    [{n: '直杆高出', t: [undefined,undefined,'直梯的两边撑杆比最上一个梯级高出的高度'], c: '四'}],
    [{n: '栏垂高', t: [undefined,'栏杆的垂直高度'], u: 'm', c: '四'}],
    [{n: '脚板高', t: [undefined,'踢脚板高度'], c: '四'}],
    [{n: '栏中间距', t: [undefined,'中间横杆，其与踢脚板或者栏杆的距离'], c: '四'}],
    [{n: '栏不道高', t: [undefined,'对净高不超过1.3m的通道，栏杆的高度'], c: '四'}],
    [{n: '扶手断长', t: [undefined,'沿建筑物墙壁或者实体墙结构设有的通道，允许用扶手代替栏杆，扶手的中断长度'], c: '四'}],
    [{n: '围绳高', t: [undefined,'护绳(如钢丝绳、链条)，高度'], c: '四'}],
    [{check: 'C3.7.4'}],
] as EachMeasureItemConfig[][];

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
    [['设备型号', '设备型号'], ['产品编号', '_$出厂编号']],
    [['操纵方式',{n:'操纵方式',t:'l',l:操纵方式选}],['作业环境',{n:'作业环境',t:'l',l:作业环境选}]],
    [['防爆等级','_$防爆等级'],['进口情况','_$进口类型']],
    [['制造日期', '_$制造日期'], ['投入使用日期', '_$投用日期'] ],
    [['单位内编号','_$单位内部编号'], ['设计使用年限','_$设计年限', '年'], ],
    //台账中的： 是详细的 型号规格l;    不用：台账 _$设备使用地点
    [['检验地点', '检验地点'], ['型号规格', '_$型号'],],
    [['设备使用地点所在区域', '_$使用地区域'], ['邮政编码', '_$使用单位邮编'] ],
    [['额定起重量','_$额定起重量','t'],['额定起重力矩','_$起重力矩','t·m']],
    [['起升速度','_$起升速','m/min'],['工作幅度','_$最大工作幅',render工作幅],],
    [['起升高度',{n:'起升高度',t:'n',u:'m'}], ['工作级别','_$工作级别']],
    [['回转速度','_$回转速度','r/min'], ['作业时动力方式','_$动力系统'] ],
    //注意可能报错,不能改成 [' ',{r:''}] ],
    [['主臂型式',{n:'主臂型式',t:'l',l:主臂型式选}], [' ',{r:' '}] ],
        //不用台账的  "检验时副钩额定起重量"
    [['检验时主起升机构起重量',{n:'主起额起',u:'t'}],['检验时副起升机构起重量',{n:'副起额起',u:'t'}]],
    [['其他主要参数',{n:'其他参数',t:'m'}], ],
    [['检验时吊具',{n:'检吊具',t:'l',l:检验时吊具选}],['主起升机构起升悬挂部件',{n:'主起悬挂',t:'l',l:升悬挂部件选}]],
    [['检验依据',{r:'《起重机械安全技术规程》（TSG 51-2023）及第1号修改单'}]],
    [['检验意见通知书编号','意通知号'], ['整改反馈期限',{n:'改反馈期',t:'d'}] ],
    [['下次委托检验日期','_$新下检日'],['是否流动作业',{n:'流动作业',t:'b'}]],
    [['现场检验条件',{r:'见附录13'}],['是否型式试验样机',{n:'型试样机',t:'b'}]],
    [['附设装置名称','附设装']],
    [['备注',{n:'概备注',t:'m'}]],
];


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
            {value: config观测数据, type:'mesB'}, {value: config距离({}), type:'mesB'},
            {value:[...itemA安全距, ] },
            {value:[...item受力结构, ...itemA受力结构 ] },  {value: config梯子, type:'mesB'},
            {value: config运行速度, type: 'moAR'},  {value: defConfig制动, type: 'moAR'},
            {value:[...itemA流动专, ...itemA漏磁检, ] },
            {value:['unq','仪器表','检验条件', '观测备注','梯子备注' ]} ]);
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
