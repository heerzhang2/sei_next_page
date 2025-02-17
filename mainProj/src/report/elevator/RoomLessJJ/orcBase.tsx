/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, useTheme, Button, useToast, Table, TableBody, TableRow, CCell,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, useItemInputControl
} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {EachMeasureItemConfig, } from "../../common/measure";
import {itemA结论,} from "../../park/editor";
import {multiCheckMany} from "../../common/general";
import {itemA见证Jj1, itemn间隙61} from "../editorJJ";
import {itemA导轨, itemn底坑, itemn空间} from "../editor";
import {itemn平衡} from "../editorTest";


const daL重大修理内容=[['限速器','改限速'],['安全钳','改安全钳'],['缓冲器','改缓冲'],['门锁','改锁'],['悬挂装置','改悬挂'],['上行超速保护装置','改上保'],['驱动主机','改主机'],['控制柜','改柜'],
    ['轿厢意外移动保护装置','改意移保'],['层门','改门'], ['含有电子元件的安全电路','改电路'],['可编程电子安全相关系统','改编程'],['自动救援操作装置','改救援'],['能量回馈节能装置','改节能'],['IC卡系统','改IC']];
//不采用后端台账的已有数据，可能不仅仅标记楼盘性质；
export const 楼盘地点性质= ["／", "拆迁安置房", "经济适用房", "限价房", "廉租房", "商品房", "棚户区", "公众聚集场所（学校）", "公众聚集场所（幼儿园）", "公众聚集场所（医院）", "公众聚集场所（车站）",
        "公众聚集场所（客运码头）", "公众聚集场所（商场）", "公众聚集场所（体育场馆）", "公众聚集场所（展览馆）", "公众聚集场所（公园）", "公众聚集场所（其它）", "住宅"];
const 施工许可证子项选=['曳引驱动乘客电梯','曳引驱动载货电梯','曳引驱动乘客电梯（含消防员电梯）'];
const 施工许可证级选=['A1','A2','A','B','C','不分级','/'];

export const config设备概况 = [
    [['设备名称', '_$设备名称'], ['设备所在区域', '_$使用地区域']],
    [['使用登记证编号', '_$使用证号'], ['注册代码', '_$注册代码']],
    [['楼盘名称', '_$楼盘'], ['楼盘性质', {n: '楼地性质', t: 'l', l: 楼盘地点性质}]],
    [['楼盘地址', '_$楼盘地址']],
    [['管理部门类型','_$使管部类型'],['分支机构/安管部门', '_$分支机构'],],
    [['使用单位地址', '_$使用单位地址']],
    [['分支机构地址', '_$分支机构地址']],
    [['使用单位联系人', '_$单位联系人'], ['管理单位电话', '管单位电']],
    [['联系电话1', '联系电话'],['联系人手机', '联系手机']],
    [['使用地点', '_$设备使用地点'],['单位内编号', '_$单位内部编号']],
    [['型号', '_$型号'], ['产品出厂编号', '_$出厂编号']],
    [['额定载重量', '_$额定载荷', 'kg'], ['额定速度', '_$运行速度', 'm/s']],
    [['制造日期', '_$制造日期'], ['改造日期', {n:'改造日期', t:'d'} ]],
    [['开门方式','_$开门方式'],['控制方式', '_$控制方式'] ],
    [['层数', '_$电梯层数', '层'], ['站数', '_$电梯层数', '站'] ],
    [['门数', '_$电梯门数', '门'], ['进口情况', '_$进口类型'] ],
    [['控制屏型号', '_$控制屏型号'], ['控制屏编号', '_$控制屏编号'] ],
    [['曳引机型号', '_$曳引机型号'], ['曳引机编号', '_$曳引机编号'] ],
    [['电动机型号', '_$电动机型号'], ['层门型号', '_$层门型号'] ],
    [['轿厢限速器型号', '_$限速器型号'], ['轿厢限速器编号', '_$限速器编号'] ],
    [['对重限速器型号', '_$对限速型号'], ['对重限速器编号', '_$对限速编号'] ],
    [['上行超速保护装置型号', '_$上行保护型号'], ['轿厢意外移动保护装置型号', '_$意外保护型号'] ],
    //没用pa.安全钳型号
    [['轿厢安全钳型号', '轿厢钳型'], ['对重安全钳型号', '对重钳型']],
    [['缓冲器型号', '_$缓冲器型号'], ['缓冲器形式', '_$缓冲器形式'] ],
    [['层门锁型号', '层门锁型'], ['轿门锁型号', '轿门锁型']],
    [['对重块数量', '_$对重块数量', '块'], ['轿厢装修状态', '_$轿厢装修']],
    [['对重块总高度', {n:'对重高',  u:'m'}, 'm'], ['是否设置附加装置', {n: '是附加装', t: 'b'}]],
    [['制造单位名称', '_$制造单位']],
    [['安装施工单位', '安装施单']],
    [['改造施工单位', '改造施单']],
    [['大修施工单位', '大修施单']],
    [['施工单位许可证子项目', {n: '施许子项', t: 'l', l: 施工许可证子项选}], ['施工单位许可证编号', '施许可号']],
    [['施工单位许可证级别', {n: '施许可级', t: 'l', l: 施工许可证级选}], ['', {r: ''}]],
    [['维保电话', '维保电话']],
    [['维保单位', '_$维保单位']],
    [['现场检验条件', {r: '见附录F'}]],
    [['重大维修（改造）项目','',multiCheckMany(daL重大修理内容,'重大维修（改造）项目')]],
    [['下次检验日期', '_$新下检日']],
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
        const impressionismAs = setupItemAreaRoute({verId: verId!, repId: repId!, noDefault: true, theme});
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'}, {value: config观测数据A, type: 'mesB'},
            {value:config设备概况, type:'esnt'},{value:itemA结论},
            {value:[...itemA见证Jj1,...itemA导轨,...itemn空间,...itemn底坑,...itemn间隙61,...itemn平衡 ]},
            {value:['unq','仪器表','检验条件', ]} ]);
        toast({title: "完成！", subtitle: result ? "没发现冲突" : "测试开关没开", intent: "success"});
    }, [rep?.tzFields,repId,theme,toast]);
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
    [{n: '高出平', t: ['2.1C','(1)',<Text>采用梯子作为通道时，必须符合以下条件：①通往机房(机器设备间)的通道不应当高出楼梯所到平面4m；②梯子必须固定在通道上而不能被移动；
                ③梯子高度超过1.50m时，其与水平方向的夹角 应当在65°～75°之间，并不易滑动或者翻转；④靠近梯子顶端应当设置容易握 住的把手</Text>],
              x:'高出平面', u: 'm', },
      {n: '水平角', t: [undefined,undefined,null],
              x:'水平方向夹角', u:'(°)', c: '四', d: '1', save: false},
    ],
    [{check: '2.1C(1)', sync:'通道设置'}],
    [{n: '深度柜', t: ['2.3C','(1)',<Text>在控制柜前有一块净空面积，其深度不小于0.70m，宽度为0.50 m或者控制柜全宽（两者中的大值），净高度不小于2m</Text>], x:'深度', u: 'm'},
        {n: '宽度柜', t: [undefined,undefined,undefined], x:'宽度', },
        {n: '高度柜', t: [undefined,undefined,undefined], x:'高度', c: '四', d: '2', save: true},
    ],
    [{check: '2.3C(1)'}],
    [{n: '净空面', t: [undefined,'(2)',<Text>对运动部件进行维修和检查以及紧急操作的地方有一块不小于0.50m×0.60m的水平净空面积，其净高度不小于2m</Text>], x:'水平净空面积', u: 'm²'},
        {n: '高度修', t: [undefined,undefined,undefined], x:'高度', u: 'm', c: '四', d: '2', save: true},
    ],
    [{check: '2.3C(2)'}],
    [{n: '电路动', t: ['2.11C','(1)',<div><Text>（1）动力电路、照明电路和电气安全装置电路的绝缘电阻应当符合下述要求：</Text>
            <Table tight  miniw={800}><TableBody>
                <TableRow>
                    <CCell>标称电压/V</CCell><CCell>测试电压（直流）/V</CCell><CCell>绝缘电阻/MΩ</CCell>
                </TableRow>
                <TableRow>
                    <CCell>安全电压</CCell><CCell>250</CCell><CCell>≥0.25</CCell>
                </TableRow>
                <TableRow>
                    <CCell>≤500</CCell><CCell>500</CCell><CCell>≥0.50</CCell>
                </TableRow>
                <TableRow>
                    <CCell>＞500</CCell><CCell>1000</CCell><CCell>≥1.00</CCell>
                </TableRow>
            </TableBody></Table></div>], x:'动力电路', u: 'MΩ', c: '四',},
        {n: '电路照', t: [undefined,undefined,null], x:'照明电路', },
        {n: '电路全', t: [undefined,undefined,null], x:'安全装置电路', c: '四', d: '2', save: true},
    ],
    [{check: '2.11C(1)'}],
    [{n: '制导行', t: ['3.2C','(2)',<Text>当轿厢完全压在缓冲器上时，对重导轨有不小于0.1+0.035v2（m）的制导行程。</Text>], x:'计算制导行程', u: 'm', c: '四',d: '3', save:false},
        {n: '测行程', t: [undefined,undefined,undefined], x:'测量值',  c: '四', d: '3'},
    ],
    [{check: '3.2C(2)', sync:'制导程'}],
    [{n: '安门高', t: ['3.4C','(1)',<Text>当相邻两层门地坎的间距大于11m时，其间应当设置高度不小于1.80m、宽度不小于0.35m的井道安全门（使用轿厢安全门时除外）。</Text>], x:'高度',},
        {n: '安门宽', t: [undefined,undefined,undefined],  x:'宽度',  c: '四', d: '2'},
    ],
    [{check: '3.4C(1)'}],
    [{n: '修门高', t: ['3.5C','(1)',<Text>井道检修门高度不小于1.40m，宽度不小于0.60m。</Text>], x:'高度',},
        {n: '修门宽', t: [undefined,undefined,undefined],  x:'宽度',  c: '四', },
    ],
    [{check: '3.5C(1)'}],
    [{n: '厢壁间大', t: ['3.7B','(1)',<Text>轿厢与面对轿厢入口的井道壁的间距不大于0.15m，对于局部高度小于0.50m或者采用垂直滑动门的载货电梯，该间距可以增加到0.20m。</Text>,
                    '局部高度>0.5m时，'], x:'间距',},
        {n: '厢壁间小', t: [undefined,undefined,null,'局部高度≤0.5m时或采用垂直滑动门的载货电梯时，'],  x:'间距', },
    ],
    [{check: '3.7B(1)'}],
    [{n: '薄板高', t: ['3.8C','(1)',<Text>形成一个与层门地坎直接连接的连续垂直表面，由光滑而坚硬的材料构成（如金属薄板）；其高度不小于开锁区域的一半加上50mm，宽度不小于门入口的净宽度两边各加25mm。
                     </Text>], x:'高度', u: 'mm'},
        {n: '薄板宽', t: [undefined,undefined,null],  x:'宽度',  c: '四', save: true},
    ],
    [{check: '3.8C(1)'}],
] as EachMeasureItemConfig[][];

export const config观测数据2 = [
    [{n: '隔下高', t: ['3.9C','(1)',<Text>对重（平衡重）的运行区域应当采用刚性隔障保护，该隔障从底坑地面上不大于0.30m处，向上延伸到离底坑地面至少2.50m的高度，宽度应当至少等于对重（平衡重）宽度两边各加0.10m
                  </Text>], x:'隔障下高度', u: 'm'},
        {n: '隔上高', t: [undefined,undefined,null], x:'隔障上高度',  c: '弃', d: '2', save: false},
        {n: '隔边宽', t: [undefined,undefined,null], x:'隔障两边宽度', c: '弃', d: '2', },
    ],
    [{check: '3.9C(1)', }],
    [{n: '障上高', t: [undefined,'(2)',<Text>在装有多台电梯的井道中，不同电梯的运动部件之间应当设置隔障，隔障应当至少从轿厢、对重行程的最低点延伸到最低层站楼面以上2.50m高度，并且有足够的宽度以防止人员从一个底坑通往另一个底坑，
            如果轿厢顶部边缘和相邻电梯的运动部件之间的水平距离小于0.50m，隔障应当贯穿整个井道，宽度至少等于运动部件或者运动部件的需要保护部分的宽度每边各加0.10m。
             </Text>], x:'隔障上高度', u: 'm'},
        {n: '部件距', t: [undefined,undefined,null], x:'运动部件距离',  c: '四',  },
        {n: '障边宽', t: [undefined,undefined,null], x:'隔障两边宽度', c: '四', },
    ],
    [{check: '3.9C(2)', }],
    [{n: '撞缓许', t: ['3.15B','(5)',<Text>对重缓冲器附近应当设置永久性的明显标识，标明当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的最大允许垂直距离；并且该垂直距离不超过最大允许值。
              </Text>], x:'最大允许值', u: 'mm',c: '四', d: '0',save: false},
        {n: '撞缓距', t: [undefined,undefined,null], x:'测量值', c: '四', d: '0'},
    ],
    [{check: '3.15B(5)', }],
    [{n: '脚板高', t: ['4.2C','(1)',<Text>由扶手、0.10m高的护脚板和位于护栏高度一半处的中间栏杆组成</Text>], x:'护脚板高度', u: 'm'},],
    [{check: '4.2C(1)', }],
    [{n: '扶手高', t: [undefined,'(2)',<Text>当护栏扶手外缘与井道壁的自由距离不大于0.85m时，扶手高度不小于0.70m，当该距离大于0.85m时，扶手高度不小于1.10m</Text>], x:'扶手高度', },],
    [{check: '4.2C(2)', }],
    [{n: '顶边距', t: [undefined,'(3)',<Text>护栏装设在距轿顶边缘最大为0.15m之内，并且其扶手外缘和井道中的任何部件之间的水平距离不小于0.10m。
        </Text>], x:'轿顶边缘距离', },
        {n: '手件距', t: [undefined,undefined,null], x:'扶手与部件距离', },
    ],
    [{check: '4.2C(3)', }],
    [{n: '与重离', t: ['4.4C','(1)',<Text>轿厢及关联部件与对重之间的距离应当不小于50mm。</Text>], x:'距离', u: 'mmm'},],
    [{check: '4.4C(1)', }],
    [{n: '轿深度', t: ['4.6C','(1)',<Text>轿厢有效面积测量计算。</Text>], x:'轿厢深度', u: 'm'},
        {n: '轿宽度', t: [undefined,undefined,null], x:'轿厢宽度', },
        {n: '轿面积', t: [undefined,undefined,null], x:'面积', u: 'm²' },
    ],
    [{check: '4.6C(1)', }],
    [{n: '护板高', t: ['4.9C','(1)',<Text>轿厢地坎下应当装设护脚板，其垂直部分的高度不小于0.75m，宽度不小于层站入口宽度。</Text>], x:'护脚板高度', u: 'm'},],
    [{check: '4.9C(1)', }],
    [{n: '断丝数', t: ['5.1C','②',<Text>一个捻距内出现的断丝数</Text>], x:'断丝数', u: '根'},],
    [{check: '5.1C②', }],
    [{n: '丝直径', t: [undefined,'③',<Text>磨损后的钢丝绳直径小于钢丝绳公称直径的90%</Text>], x:'钢丝绳直径', u: 'mm'},
        {n: '丝公称', t: [undefined,undefined,null], x:'公称直径', },
    ],
    [{check: '5.1C③', }],
] as EachMeasureItemConfig[][];

export const config观测数据A= config观测数据.concat(config观测数据2);
