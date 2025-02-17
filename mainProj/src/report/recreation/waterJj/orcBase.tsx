/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Button, Text, TextArea, useTheme, useToast,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EditStorageContext} from "../../StorageContext";
import {itemA技术见证} from "../../elevator/stest/editor";
import {itemA结论} from "./Conclusion";
import {EachObserveConfig} from "../../hook/useObserve";
import {施工许可证子项选} from "../../tower/craneJj/orcBase";
import {genCBoAver} from "./repView";
import {config主技术} from "./MainTechnical";
import {itemA应变应力} from "./StrainStress";
import {itemA加速} from "./Acceleration";
import {config格栅流} from "./Safetygap";
import {config最驶速} from "./Maxspeed";
import {cbK2_4, cbK2_6, cbK3_55, cbK4_6, cbK5_21, genCBoOmit} from "./cbComm";

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
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['设备型式', '设型式'], ['设备使用方式', '设使用式'], ],
    [['制造完成日期', '_$制造日期'], ['投入使用时间', '_$投用日期'] ],
    //台账 不匹配？ _$额定载人  ， 座舱数++
    [['单舱（每船、每筏）承载人数',{n:'单舱筏载',u:'人'},], ['座舱数（或滑道数、或碰碰船数）', {n:'座舱道船',u:'个'} ] ],
    //？ 单位不同于台账m/min   km/h
    [['运行速度', '_$额定速度','km/h'],  ['运行高度','_$提升高度','m'], ],
    [['设计加速度范围', '设加速范','g'],  ['设计加速度区域','设加速域'], ],
    [['设计使用期限','_$设计年限', '年'], ['最近一次延长使用期限',{n:'延长年',u:'年'}] ],
    [['使用期限到期时间','_$使用到期时' ], ['最近一次安全评估时间', {n:'安评估时',t:'d'}] ],
    [['制造单位名称', '_$制造单位'] , ],
    [['制造单位生产许可证号', '生产许号'], ['制造单位生产许可子项目', {n: '制许可子', t: 'l', l: 施工许可证子项选}], ],
    [['施工-安装单位名称',{n:'安装单',t:'B'}] ],
    [['施工-改造单位名称',{n:'改造单',t:'B'}] ],
    [['施工-大修单位名称',{n:'大修单',t:'B'}] ],
    [['施工单位生产许可证号', '施许可号'], ['施工单位生产许可子项目', {n: '施许可子', t: 'l', l: 施工许可证子项选}],],
    [['改造（或重大修理）内容',{n:'改造内容',t:'B'}] ],
    [['最近一次安全评估单位名称',{n:'安评单位',t:'B'}] ],
    [['现场检验条件',{r:'见附录F'}]],
    [['下次定期检验日期', '_$新下检日'], ],
    [['检验依据',{r:'《大型游乐设施安全技术规程》（TSG 71-2023）'}]],
];


export const config观测数据 : ((orc: any) => EachObserveConfig[][])=(orc: any)=>{
 return [
    [{n: '型钢厚', t: ['K2.4','(1)',`结构件的最大锈蚀深度应当小于原型钢厚度的15%。抽查的结构件为（${orc?.抽查构件??''}）。`],
                    x:'原型钢厚度', u: 'mm', c: '四', d: 1, cbo:cbK2_4},
        {n: '锈处钢厚', t: [undefined,undefined,null], x:'最大锈蚀处型钢厚度', c: '四', d: 1},
    ],
    [{check: '2.4', }],
    [{n: '磨轴原径', t: ['K2.6','(1)',<>磨损量和锈蚀量应符合维护保养说明书及以下要求，重要轴（销轴）最大磨损量应当小于原直径的0.8%，且最大值不超过
            1mm;重要轴（销轴）的锈蚀量(经打磨后)，应当小于原直径的1%(包括凹坑处），且最大不超过1mm。磨损最大的重要轴（销轴）
            为（{orc?.销轴损最??''}）；锈蚀最大的重要轴（销轴）为（{orc?.销轴锈最??''}）。</>], x:'最大磨损轴原直径', u: 'mm', c: '四', d: 1,cbo:cbK2_6},
         {n: '最磨损处', t: [undefined,undefined,null], x:'最大磨损轴最大磨损处实测直径', c: '四', d: 1 },
         {n: '最锈蚀原', t: [undefined,undefined,undefined], x:'最大锈蚀轴原直径',u: 'mm', c: '四', d: 1 },
        {n: '打磨径', t: [undefined,undefined,undefined], x:'最大锈蚀轴最大锈蚀处实测直径(打磨后)', c: '四', d: 1 },
    ],
    [{check: '2.6', }],
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
     [{n: '接地阻', t: ['K4.3','(1)','低压配电系统保护接地电阻应当不大于10Ω。'], x:'接地电阻', u: 'Ω', c: '四', d: 0},
     ],
     [{check: '4.3', }],
     [{n: '绝缘阻', t: ['※K4.4','(1)','电压有效值大于50V的带电回路与接地装置之间的绝缘电阻应当能保证用电安全，绝缘电阻应当不小于1MΩ。'],
            x:'绝缘电阻', u: 'MΩ', c: '四', d: 1},
     ],
     [{check: '4.4', }],
     [{n: '工作电流', t: ['K4.6','(1)',<>满载或者偏载运转平稳后，电动机电流值应符合设计文件及以下要求。在满载和设计允许偏载的情况下，连续工作的异步电机工作电流
                应当不大于电机的额定电流。 （{orc?.工电机??''}）电机额定电流为（{orc?.机额电流??''}）A。</>],
         x:'工作电流', u: 'A', c: '四', d: 1,cbo:cbK4_6},
     ],
     [{check: '4.6', }],
     [{n: '座舱深', t: ['K5.2','(1)',<>座席距地面最大高度5m以下时, 座舱深度不小于550mm, 座席靠背高度不小于300mm。座席距地面最大高度5m以上时, 座舱深度不小于800mm,座席靠背高度不小于400mm。当设有安全杠和安全带等设施时,
             可适当减少座舱深度。乘人座席宽度每人应不小于400mm，专供儿童乘坐的每人应不小于250mm。座席距地面最大高度（{orc?.座席高??''}）m。</>],
            x:'座舱深度', u: 'mm', c: '四', d: 0,cbo:cbK5_21},
        {n: '靠背高', t: [undefined,undefined,null], x:'靠背高度', c: '四', d: 0},
         {n: '席宽大', t: [undefined,undefined,undefined], x:'座席宽度（最大）', c: '四', d: 0, cbo:genCBoAver(['席宽大o','席宽小o'],0,1)},
         {n: '席宽小', t: [undefined,undefined,undefined], x:'座席宽度（最小）', c: '四', d: 0, cbo:genCBoOmit('席宽小o')},
         {n: '童席大', t: [undefined,undefined,undefined], x:'专供儿童座席宽度(最大)', c: '四', d: 0, cbo:genCBoAver(['童席大o','童席小o'],0,1)},
         {n: '童席小', t: [undefined,undefined,undefined], x:'专供儿童座席宽度(最小)', c: '四', d: 0, cbo:genCBoOmit('童席小o')},
     ],
     [{check: '5.2', }],
] as EachObserveConfig[][]};

export const config观测数据2=[
    [{n: '安全带宽', t: ['K5.4.1','(1)',`安全带织带的宽度应当不小于30mm。`], x:'安全带织带的宽度', u: 'mm', c: '四', d: 1},
    ],
    [{check: '5.4.1', }],
    [{n: '满制距', t: ['※K6.2','(4)','在满载工况下最大速度运行时的制动距离，应符合设计文件要求。'], x:'制动距离', u: 'm',c: '四', d: 1},
        {n: '衬原厚', t: [undefined,'(5)','对有磨损的机械式制动装置在磨损严重部位测量闸衬厚度，磨损量应当不大于原厚度50%且满足设计文件要求。'],
                    x:'闸衬原厚度', u: 'mm', c: '四', d: 1},
        {n: '闸衬厚', t: [undefined,undefined,null], x:'磨损后闸衬厚度', },
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
    [{n: '阶差', t: ['K8.2','(1)','沿滑行方向不应当有逆向阶差，顺向阶差应当不大于2mm'], x:'顺向阶差', u: 'mm', c: '四', d: 1},
    ],
    [{check: '8.2(1)', }],
    [{n: '缝隙宽', t: [undefined,'(2)','当乘员有可能触及时，孔洞的直径和缝隙的宽度应当不大于8mm，且有倒圆处理。'], x:'孔洞的直径和缝隙的宽度', c: '四', d: 1},
    ],
    [{check: '8.2(2)', }],
    [{n: '邻滑道距', t: ['K8.7','(1)',<>相邻水滑道侧边之间的距离应当不小于1.0m；并列多滑梯其相邻滑道中心线距离应当不小于900mm；敞开式单或者
                            多滑梯边缘距周边障碍物的距离应当不小于500mm；敞开式滑道上方的任何物体距离滑槽截面最低点应当不小于1400mm。</>],
              x:'相邻水滑道侧边之间的距离', u: 'm', c: '四', d: 1},
        {n: '邻滑中距', t: [undefined,undefined,null], x:'并列多滑梯其相邻滑道中心线距离',u: 'mm', c: '四', d: 0},
        {n: '边障物距', t: [undefined,undefined,undefined], x:'敞开式单或者多滑梯边缘距周边障碍物的距离', c: '四', d: 0},
        {n: '上方低点', t: [undefined,undefined,undefined], x:'敞开式滑道上方的任何物体距离滑槽截面最低点', c: '四', d: 0},
    ],
    [{check: '8.7', }],
    [{n: '滑梯壁距', t: ['K8.8','(1)',<>身体滑梯、皮筏滑梯的侧边（靠池壁）到池壁水平距离应当分别不小于1.2m和1.5m。</>],
                    x:'身体滑梯的侧边（靠池壁）到池壁水平距离', u: 'm', c: '四', d: 1},
        {n: '皮筏壁距', t: [undefined,undefined,null], x:'皮筏滑梯的侧边（靠池壁）到池壁水平距离', c: '四', d: 1},
    ],
    [{check: '8.8', }],
] as EachObserveConfig[][];

export const config观测数据3=[
    [{n: '溅落高', t: ['K8.9','(1)',<>水滑梯末端滑落点距溅落区水面的高度应当不大于200mm；儿童滑梯末端滑落点距溅落区水面的高度应当不大于50mm；上抛入水的滑梯末端
                    距溅落区水面高度应当不大于1200mm，上抛角度应当不大于30°。</>],
            x:'水滑梯末端滑落点距溅落区水面的高度', u: 'mm', c: '四', d: 0},
        {n: '童落高', t: [undefined,undefined,null], x:'儿童滑梯末端滑落点距溅落区水面的高度', c: '四', d: 1},
        {n: '上抛落高', t: [undefined,undefined,undefined], x:'上抛入水的滑梯末端距溅落区水面高度', c: '四', d: 0},
        {n: '上抛角', t: [undefined,undefined,undefined], x:'上抛角度',u: '(°)', c: '四', d: 1},
    ],
    [{check: '8.9', }],
    [{n: '横杆高', t: ['※K8.11','(1)','身体滑梯入口处应当设置高度为0.8m～1.1m的横杆，以防止乘员站立进入滑道。'],
            x:'横杆高度',u: 'm', c: '四', d: 2},
    ],
    [{check: '8.11', }],
    [{n: '装置圆角', t: ['K8.14','(1)',<>净空区域内不应当放置固定物体和结构，不可避免的物体应当放置在延伸的净空区域的范围之内，并设置表面光滑、形状规则、边缘圆角半径不小于100mm的防护装置。</>],
           x:'防护装置边缘圆角半径',u: 'mm', c: '四', d: 0},
    ],
    [{check: '8.14', }],
    [{n: '格栅间', t: ['K8.19','(1)','水循环系统的水池回水口格栅间隙应当小于8mm'],
           x:'格栅间隙',u: 'mm', c: '四', d: 1},
    ],
    [{check: '8.19', }],
    [{n: '落区水深', t: ['K8.20','(1)',<>水滑梯溅落区水深一般为0.8m～0.9m；儿童滑梯溅落区水深应当为0.3m～0.6m；特殊型式滑梯溅落区水深一般为0.9m～4m；</>],
                    x:'水滑梯溅落区水深', u: 'm', c: '四', d: 1},
        {n: '童落水深', t: [undefined,undefined,null], x:'儿童滑梯溅落区水深', c: '四', d: 1},
        {n: '殊落水深', t: [undefined,undefined,undefined], x:'特殊型式滑梯溅落区水深', c: '四', d: 1},
    ],
    [{check: '8.20', }],
    [{n: '泵栏间', t: ['K8.24','(1)','峡谷漂流的水泵进出水口应当设置间隔不大于100mm的防护栅栏。'],
        x:'防护栅栏间隔',u: 'mm', c: '四', d: 0},
    ],
    [{check: '8.24(1)', }],
    [{n: '峡漂深', t: [undefined,'(2)','峡谷漂流水道的水深应当不大于1.2m'],
        x:'水深',u: 'm', c: '四', d: 2},
    ],
    [{check: '8.24(2)', }],
    [{n: '气室', t: [undefined,'(4)','筏胎采用充气胎时，气室数量应当不少于6个'],
        x:'气室数量',u: '个', c: '四', d: 0},
    ],
    [{check: '8.24(4)', }],
    [{n: '船沿水距', t: ['K8.25','(5)','按照实际工况在船体内加入额定载荷，碰碰船船沿至水面距离不得小于300mm。'],
        x:'船沿至水面距离',u: 'mm', c: '四', d: 0},
    ],
    [{check: '8.25(5)', }],
    [{n: '浮圈压', t: [undefined,'(9)','碰碰船浮圈的充气压力应当不大于0.3MPa。'],
        x:'浮圈的充气压力',u: 'Mpa', c: '四', d: 2},
    ],
    [{check: '8.25(9)', }],
    [{n: '碰船水深', t: [undefined,'(11)','碰碰船水池水深应当不大于1.5m。'],
        x:'水深',u: 'm', c: '四', d: 2},
    ],
    [{check: '8.25(11)', }],
] as EachObserveConfig[][];

export const tail观测= <Text css={{"@media print": {fontSize: '0.75rem'}}}>
    注：<br/>
    <div css={{marginLeft: '2rem',"@media print": {marginLeft:'1.5rem'}}}>
        1、K2.4、K2.6、K3.5.2、K3.5.5、K6.2（5）仅在不符合时，才需填观测数据和测量结果等数值；<br/>
        2、座席上、下宽度相等时，K5.2的最大宽度和最小宽度填同一个值；<br/>
        3、结果判定栏都需填；<br/>
        4、其他需记录的测量值和结果值填在表下方的备注栏中。
    </div>
</Text>;


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
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论,  ...itemA技术见证, ] },
            {value: config观测数据({}), type:'mesB'},{value: config观测数据2, type:'mesB'},{value: config观测数据3, type:'mesB'},
            {value: config主技术, type:'mesB'},
            {value:[ ...itemA应变应力, ...itemA加速, ] },
            {value: config格栅流, type:'mesB'},{value: config最驶速, type:'mesB'},
            {value:['unq','仪器表','检验条件','观备注', '主技备注','格栅备注','最驶备注' ]} ]);
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
