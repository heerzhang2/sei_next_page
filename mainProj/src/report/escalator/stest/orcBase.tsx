/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    BlobInputList, Button, CCell, Table, TableBody, TableRow, Text, TextArea, useTheme, useToast,
} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EditStorageContext} from "../../StorageContext";
import {EachMeasureItemConfig} from "../../common/measure";
import {itemA结论} from "./editor";
import {render交通型} from "../supervi/orcBase";
import {itemA扶速差, } from "../supervi/editor";
import {itemA技术见证} from "../../elevator/stest/editor";


export const 检测依据选=['《电梯自行检测规则》(TSGT7008-2023)',
    'TSG T7008-2023《电梯自行检测规则》、《福建省市场监督管理局办公室关于做好电梯远程监测相关检验检测工作的通知》（闽市监办[2023]12号）',
];
const input检测依据={
    edit:(inp:any,setInp:(a:any)=>void, orc:any)=>{
        return <div>检测依据:
            <BlobInputList value={inp?.检测依据 ??检测依据选[0]} rows={4} datalist={检测依据选}
                           onListChange={v => setInp({...inp, 检测依据: v || undefined}) } />
        </div>;
    },
    view:(orc:any)=> {
        return <div css={{whiteSpace: 'pre-wrap'}}>
            {orc.检测依据 ??检测依据选[0]}
        </div>
    }
};
export const config设备概况 = [
    [['统一社会信用代码', '_$使用单位信用码'], ['设备所在区域', '_$使用地区域']],
    [['设备注册代码', '_$注册代码'], ['使用登记证编号', '_$使用证号'] ],
    [['楼盘名称', '_$楼盘'], ['楼盘性质', '_$楼盘性质'] ],
    [['安装地点', '_$设备使用地点'], ['单位内编号','_$单位内部编号']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['制造日期', '_$制造日期'], ['改造日期', {n:'改造日期',t:'d'}] ],
    [['驱动主机型号', '_$主机型号'], ['驱动主机编号', '_$主机编号'] ],
    [['控制柜型号', '_$控制屏型号'], ['控制柜编号', '_$控制屏编号'] ],
    [['名义速度', '_$运行速度', 'm/s'], ['名义宽度', '_$名义宽度', 'mm'] ],
    [['倾斜角', '_$倾斜角度', '°'], ['输送能力', {n:'输送能',u:'P/h'}, ] ],
    [['（自动扶梯）提升高度', '_$提升高度', 'm'], ['（自动人行道）使用区长度', '_$使用区长度', 'm']  ],
    [['进口情况','_$进口类型'],['是否公共交通型', '_$是公共交通',render交通型], ],
    [['安全管理人员', '安全员'], ['使用单位联系人', '_$单位联系人'],  ],
    [['使用单位联系人手机', '联手机'], ['使用单位联系电话', '_$使用单位电话'] ],
    // ?设备联系人的手机
    // [['使用单位联系人手机', '_$设备联系手机'], ['维保电话', '维保电话'] ],
    [['使用单位地址', '_$使用单位地址'] ],
    [['分支机构名称', '_$分支机构'],  ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['楼盘地址', '_$楼盘地址'] ],
    [['制造单位名称', '_$制造单位'],  ],
    [[{pr:'施工单位名称', span:3, t:'安装单位'}, '_$安装单位'],   ],
    [[{t:'改造单位'}, '_$改造单位'],  ],
    [[{t:'重大修理单位'}, '_$维修单位'],  ],
    [['产权单位名称', '_$产权单位'] ],
    [['维保单位名称', '_$维保单位']],
    [['维护保养单位电话', '维保电话']],
    [['电梯自行检测备忘录编号','检备录号'], ],
    [['监督检验日期',{n:'监检日',t:'d'}], ['上次检验日期',{n:'上检验日',t:'d'}] ],
    [['下次检验日期',{n:'下检验日',t:'d'}],  ['下次检测日期','_$新下检日'] ],
    [['现场检测条件',{r:'见附录B'}]],
    [['检测依据','检测依据',input检测依据]],
];

/**测量表：太多了可拆成两个编辑器； 注意：t: [] 不同于 t: [undefined,undefined,undefined]；
 * */
export const config观测数据 = [
    [{n: '光照度', t: ['A2.2.2.1','(1)','测量在楼层板平面的梳齿与踏面相交线位置的照度是否至少为50lx'], x:'照度', u: 'lx', c: '四', d: '0'},
    ],
    [{check: '2.2.2.1(1)', }],
    //fontSize:'0.875rem' 来自 css={{fontSize:theme.fontSizes[0]}}
    [{n: '畅通宽', t: ['A2.2.2.2','(1)',<Text css={{fontSize:'0.875rem'}}>检查出入口区域是否充分畅通，其宽度至少等于扶手带外缘距离加上每边各 80mm，纵深尺寸从扶手装置端部算起至少为2.50m；该区域的宽度不小于扶手
            带外缘之间距离的2倍加上每边各80mm 时，其纵深尺寸允许减少至2.00m</Text>], x:'出入口区域宽度', u: 'mm', c: '四', d: '0'},
        {n: '畅通深', t: [undefined,undefined,null], x:'出入口区域纵深尺寸', u: 'm', c: '四', d: '2' },
    ],
    [{check: '2.2.2.2(1)', }],
    [{n: '高出带距', t: ['*A2.2.2.3','(1)','出入口防护装置至少高出扶手带100mm，位于扶手带外缘80mm～120mm处'], x:'高出扶手带的距离', u: 'mm', c: '四', d: '0'},
        {n: '带外缘距', t: [undefined,undefined,null], x:'与扶手带外缘距离',  c: '四', d: '0'},
        {n: '楼层起高', t: [undefined,'(2)','出入口防护装置从楼层板起高度不小于1100mm'], x:'从楼层板起的高度',  c: '四', d: '0'},
    ],
    [{check: '2.2.2.3', }],
    [{n: '挡板高', t: ['*A2.2.2.4','(1)',<Text css={{fontSize:'0.875rem'}}>受检设备与楼板有交叉或者受检设备之间有交叉的，检查交叉处是否设有垂直固
                定、无锐利边缘的封闭防护挡板，其位于扶手带上方的防护高度不小于0.30m，并且延伸至扶手带下缘以下至少25mm。扶手带外缘与任何障碍物之间的距离不
                小于400mm的，可以不设置防护挡板</Text>], x:'防护挡板高度', u: 'm' },
        {n: '缘下距', t: [undefined,undefined,null], x:'扶手带下缘以下距离', u: 'mm' },
    ],
    [{check: '2.2.2.4(1)', }],
    //假如是分解成多个数组[, ][ {n: '断丝数',} ]的，导致：编辑器布局 序号递增+1； 改变。
    [{n: '水平距离', t: ['A2.2.2.5','(1)','墙壁或者障碍物与扶手带外缘之间的水平距离不小于80mm，与扶手带下缘的垂直距离不小于25mm'], x:'水平距离', u: 'mm'},
        {n: '垂直距离', t: [undefined,undefined,null], x:'垂直距离',  },
        {n: '邻带缘距', t: [undefined,'(2)','对于邻近布置的受检设备，其扶手带外缘之间的距离不小于160mm'], x:'邻近扶手带外缘之间的距离', u: 'mm', c: '四', d: '0'},
    ],
    [{check: '2.2.2.5', }],
    [{n: '附急停距', t: ['*A2.2.2.6','(2)','多台连续并且无中间出口的受检设备在梯级、踏板或胶带到达梳齿与踏面相交线之前2.00m～3.00m处，设有乘客易于触及的附加紧急停止开关'],
                x:'附加紧急停止开关与踏面相交线的距离', u: 'm', c: '四', d: '0'},
    ],
    [{check: '2.2.2.6(2)', }],
    [{n: '啮合深', t: ['*A2.2.2.8','(2)','梳齿板梳齿与踏面齿槽的啮合深度至少为4mm，梳齿槽根部与踏面的间隙不超过4mm'], x:'啮合深度', u: 'mm',c:'四',d:'1'},
        {n: '齿间隙', t: [undefined,undefined,null], x:'间隙',  },
    ],
    [{check: '2.2.2.8(2)', }],
    [{n: '急停开距', t: ['*A2.2.2.9','(1)','受检设备出入口附近设有紧急停止开关，必要时增设附加紧急停止开关，以使紧急停止开关之间的距离不超过30m(适用于自动扶梯)或者40m(适用于自动人行道)'],
                x:'紧急停止开关之间的距离', u: 'm',c:'四',d:'1'},
    ],
    [{check: '2.2.2.9(1)', }],
    [{n: '标记径', t: [undefined,'(2)','各紧急停止开关标识清晰，对于位于扶手装置高度1/2以下的紧急停止开关，在扶手装置高度1/2以上的醒目位置还设有直径至少为 80mm的红底白字“急停”指示标记，箭头指向该开关'],
                x:'指示标记直径', u: 'mm',c:'四',d:'1'},
    ],
    [{check: '2.2.2.9(2)', }],
    [{n: '裂纹宽', t: ['*A2.2.3.1','(1)','扶手带完好、表面无龟裂、剥离、严重磨损，扶手带单一开裂处最大裂纹宽度不大于3mm'], x:'最大裂纹宽度', u: 'mm',c:'四',d:'1'},
    ],
    [{check: '2.2.3.1(1)', }],
    [{n: '端口垂距', t: [undefined,'(2)','扶手转向端入口处的最低点与地板之间的垂直距离不小于0.10m，并且不大于0.25m'], x:'垂直距离', u: 'm',c:'四',d:'1'},
    ],
    [{check: '2.2.3.1(2)', }],
    [{n: '凸高度', t: [undefined,'(3)','朝向梯级、踏板或者胶带一侧的部分光滑、平齐；装设方向与运行方向不一致的压条或者镶条凸出高度不大于 3mm，其边缘呈圆角或者倒角状；沿运行方向的盖板连接处结构能够防止勾绊'],
            x:'凸出高度', u: 'mm',c:'四',d:'1'},
    ],
    [{check: '2.2.3.1(3)', }],
//也太多了，底下拆分成 2个编辑器页面：
] as EachMeasureItemConfig[][];

export const config观测数据2 = [
    [{n: '防爬离', t: ['*A2.2.3.3','(1)','防爬装置在位于地平面上方1000mm±50mm处'], x:'防爬装置离地平面距离', u: 'mm', c: '四', d: '0'},
        {n: '防爬长', t: [undefined,'(2)','防爬装置高度至少与扶手带表面齐平，下部与外盖板相交，平行于外盖板方向上的延伸长度不小于1000mm，并且在此长度范围内无踩脚处'],
                        x:'防爬装置延伸长度', c: '四', d: '0' },
    ],
    [{check: '2.2.3.3', }],
    [{n: '外盖宽', t: ['*A2.2.3.4','(1)',<Text css={{fontSize:'0.875rem'}}>对于与墙相邻并且外盖板的宽度大于125mm的受检设备，或者相邻平行布置并且 共用外盖板的宽度大于125mm 的自动扶梯或者倾斜的自动人行道，
            检查在上、下端部装设的阻挡装置是否能够防止人员进入外盖板区域，并且延伸到高度距离 扶手带下缘25mm-150mm处</Text>], x:'外盖板宽度', u: 'mm', c: '四', d: '0'},
        {n: '阻下缘距', t: [undefined,undefined,null], x:'阻挡装置与扶手带下缘的距离',  c: '四', d: '0'},
    ],
    [{check: '2.2.3.4(1)', }],
    [{n: '墙带中距', t: ['*A2.2.3.5','(3)',<Text css={{fontSize:'0.875rem'}}>自动扶梯或者倾斜的自动人行道和相邻的墙之间装有接近扶手带高度的扶手盖板，并且建筑物(墙)和扶手带中心线之间的距离大于300mm时，
            或者相邻自动扶梯或者倾斜的自动人行道的扶手带中心线之间的距离大于400mm时，检查在扶手盖板上装设的防滑行装置是否无锐角或者锐边，与扶手带的距离不小于100mm，
            并且防滑行装置之间的间隔距离不大于1800mm，高度不小于20mm</Text>], x:'建筑物（墙）和扶手带中心线或者相邻设备扶手带中心线之间的距离', u: 'mm' },
        {n: '防滑带距', t: [undefined,undefined,null], x:'防滑行装置与扶手带距离', },
        {n: '防滑间距', t: [undefined,undefined,null], x:'防滑行装置之间的间隔距离', u: 'mm' },
        {n: '防滑高', t: [undefined,undefined,null], x:'防滑行装置的高度', },
    ],
    [{check: 'A2.2.3.5(3)', }],
    [{n: '护板间隙', t: ['A2.2.3.6','(1)','检查护壁板之间的间隙是否不大于4mm，其边缘是否呈圆角或者倒角状'], x:'护壁板间隙', u: 'mm', c: '四', d: '1'},
    ],
    [{check: '2.2.3.6(1)', }],
    [{n: '单侧隙', t: ['*A2.2.3.7','(1)','任何一侧的水平间隙不大于4mm，并且两侧对称位置处的间隙总和不大于7mm'], x:'单侧水平间隙', u: 'mm',c:'四',d:'1'},
        {n: '两侧隙', t: [undefined,undefined,null], x:'两侧间隙总和',  },
    ],
    [{check: '2.2.3.7(1)', }],
    [{n: '踏围垂隙', t: [undefined,'(2)','围裙板设置在踏板之上时，踏板表面与围裙板下端的垂直间隙不大于4mm，踏板侧边与围裙板垂直投影间不产生间隙'],
                            x:'踏板表面与围裙板下端的垂直间隙', u: 'mm',c:'四',d:'1'},
    ],
    [{check: '2.2.3.7(2)', }],
    [{n: '夹端点位', t: ['A2.2.3.8','(2)','围裙板防夹装置端点位于梳齿与踏面相交线前(梯级侧)不小于50mm，但不大于150mm 的位置'], x:'防夹装置端点位置', u: 'mm', c: '四', d: '0'},
    ],
    [{check: '2.2.3.8(2)', }],
    [{n: '邻梯级隙', t: ['A2.2.4.1','(2)','在工作区段内的任何位置，从踏面测得的两个相邻梯级或者踏板之间的间隙不大于6mm；在自动人行道过渡曲线区段，如果踏板的前缘和相邻踏板的后缘啮合，其间隙允许增至8mm'],
                    x:'相邻梯级或者踏板间隙',  c: '四', d: '0'},
    ],
    [{check: '2.2.4.1(2)', }],
    [{n: '停行时间', t: ['*A2.3.1','(2)',<Text css={{fontSize:'0.875rem'}}>对于由使用者的进入而自动启动的受检设备，观察、测量当使用者从预定运行方向进入时，是否经过足够的
             时间(至少为预期输送时间再加上10s)才能自动停止运行；当使用者从预定运行方向相反的方向进入时，是否仍按照预先确定的方向启动，运行时间不少于10s</Text>],
                    x:'自动停止运行时间', u: 's' },
        {n: '逆运行时', t: [undefined,undefined,null], x:'自动启动运行时间', u: 's' },
    ],
    [{check: '2.3.1(2)', }],
    [{n: '扶制距上', t: ['*A2.3.3', '(1)', <div>
            <div css={{display: 'flex', width: 'max-content', margin: 'auto'}}><Text
                css={{whiteSpace: 'nowrap'}}>(1)</Text>
                <Table tight miniw={800}><TableBody>
                    <TableRow><CCell colSpan={2}>表A2-1 自动扶梯制停距离</CCell></TableRow>
                    <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                    <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                    <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                    <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                </TableBody></Table>
            </div>
        </div>],
            x: '空载上行制停距离', u: 'm', c: '四', d: '2'
        },
        {n: '扶制距下', t: [undefined, undefined, null], x: '空载下行制停距离', c: '四', d: '2'},
    ],
    [{check: '2.3.3(1)',}],
    [{n: '道制距上', t: [undefined, '(2)', <div css={{display: 'flex', width: 'max-content', margin: 'auto'}}><Text
            css={{whiteSpace: 'nowrap'}}>(2)</Text>
            <Table tight miniw={800}><TableBody>
                <TableRow><CCell colSpan={2}>表A2-2 自动人行道制停距离</CCell></TableRow>
                <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                <TableRow><CCell>0.90m/s</CCell><CCell>0.55m～1.70m</CCell></TableRow>
            </TableBody></Table>
        </div>],
            x: '空载上行制停距离', u: 'm', c: '四', d: '2'
        },
        {n: '道制距下', t: [undefined, undefined, null], x: '空载下行制停距离', c: '四', d: '2'},
    ],
    [{check: '2.3.3(2)',}],
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
                {value: config设备概况, type: 'esnt'}, {value:[...itemA结论, ...itemA技术见证,  ] },
                {value: config观测数据, type:'mesB'}, {value: config观测数据2, type:'mesB'},
                {value:[...itemA扶速差, ] },
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
