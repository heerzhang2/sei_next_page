/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, useTheme, Button, useToast, TextArea,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, useItemInputControl
} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {itemA结论,} from "../../mobilecr/editorIN";
import {EachMeasureCritConfig} from "../../common/msCriteria";
import {EditStorageContext} from "../../StorageContext";
import {itemA技术见证} from "../sundryDj/editor";
import {itemA间隙} from "./editor";

//？尽量和定期检验 编排布局一致： {使用单位联系人 :改为“安全管理人员” } 施工单位名称
//台账“安全钳型号”一个输入的？  ：轿厢安全钳型号   对重安全钳型号
//台账“门锁型号(液压电梯)”一个输入的？ ： 层门门锁型号 轿门门锁型号
export const config设备概况 = [
    [['统一社会信用代码', '_$使用单位信用码'], ['设备所在区域', '_$使用地区域']  ],
    [['设备注册代码', '_$注册代码'], ['使用登记证编号', '_$使用证号'] ],
    [['楼盘名称', '_$楼盘'], ['楼盘性质', '_$楼盘性质'] ],
    [['安装地点', '_$设备使用地点'], ['单位内编号','_$单位内部编号']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['额定载重量','_$额定载荷','kg'], ['额定速度', '_$运行速度','m/s'] ],
    //台账 没上 改造日期
    [['制造日期', '_$制造日期'] ,['改造日期', {n:'改造日期',t:'d'}]  ],
    [['层数','_$电梯层数','层'], ['站数', '_$电梯站数','站'] ],
    [['门数','_$电梯门数','门'], ['控制方式', '_$控制方式',] ],
    [['驱动主机型号', '_$主机型号'], ['驱动主机编号', '_$主机编号'] ],
    //控制柜{?屏 }型号
    [['控制柜型号', '_$控制屏型号'], ['控制柜编号', '_$控制屏编号'] ],
    [['轿厢限速器型号', '_$限速器型号'], ['轿厢限速器编号', '_$限速器编号'] ],
    [['对重限速器型号', '_$对限速型号'], ['对重限速器编号', '_$对限速编号'] ],
    [['轿厢安全钳型号', '轿钳型'], ['对重安全钳型号', '对钳型'] ],
    [['缓冲器型号', '_$缓冲器型号'], ['缓冲器型式', '_$缓冲器形式'] ],
    [['层门门锁型号', '层锁型'], ['轿门门锁型号', '轿锁型'] ],
    [['悬挂钢丝绳公称直径','_$钢丝绳直径','mm'], ['顶升型式', '_$顶升形式'] ],
    [['油缸数量','_$油缸数量','个'], ['油缸型式', '_$油缸形式'] ],
    [['液压泵型号','_$液泵型号',], ['液压泵编号', '_$液泵编号'] ],
    [['液压泵流量','_$液泵流量','L/min'], ['液压泵功率', '_$液泵功率','KW'] ],
    [['整机防爆标志','_$防爆标志',], ['区域防爆等级', '_$防爆等级'] ],
    [['使用单位联系人', '安全员'], ['使用单位联系电话', '_$使用单位电话'] ],
    // ?设备联系人的手机
    [['使用单位联系人手机', '_$设备联系手机'], ['维保电话', '维保电话'] ],
    [['使用单位地址', '_$使用单位地址'] ],
    [['分支机构名称', '_$分支机构'] ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['楼盘地址', '_$楼盘地址'] ],
    [['制造单位名称', '_$制造单位'] ],
    [['维保单位名称', '_$维保单位']],
    [['施工-安装单位名称',{n:'安装单',t:'B'}] ],
    [['施工-改造单位名称',{n:'改造单',t:'B'}] ],
    [['施工-大修单位名称',{n:'大修单',t:'B'}] ],
    [['下次检验(检测)日期','_$新下检日'] ,['进口情况','_$进口类型']],
    [['检验意见通知书编号','意通知号'], ],
    [['现场检验条件',{r:'见附录B'}]],
];


/**开启编制时的：默认值初始化操作。  若打印：本编辑器全部都不显示。
 * */
export const EntranceSetup =
React.forwardRef((
    {children, show, alone = true, repId, verId, rep}: InternalItemProps, ref
) => {
    const theme = useTheme();
    const atPrint = useMedia('print');
    const toast = useToast();
    const doCheckNames = React.useCallback((verId: string) => {
        const impressionismAs = setupItemAreaRoute({rep, noDefault: true, theme});
        const result = assertNamesUnique([{value: rep?.tzFields}, {value: impressionismAs?.Item, type: 'impr'},
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论,...itemA技术见证, ...itemA间隙] },
            {value: config观测数据, type:'mesB'},
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
        <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                             alone={alone} label={'初始化本报告，默认值配置等'}>
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


/**测量表：太多了可拆成两个编辑器； 注意：t: [] 不同于 t: [undefined,undefined,undefined]；
 * 结果{check: '7.2'}只能放在外部：所以一个序号不能分拆两个的结论独立编辑的栏目；【所以】序号3有两个检验结果这里不支持的！
 * 加字段 sync: 配置的和检验项目列表是有联动。
 * */
export const config观测数据 = [
    [{n: '检修门距', t: ['A3.2.1.1', '(5)', '对于人员不可进入的机房，从检修门或者检修活板门边缘到检查、维护的任部件的水平距离不大于0.60m。'],
        x: '测量值', u: 'm', c: '四', d: '1',
      },],
    [{check: '3.2.1.1(5)'}],
    [{n: '隔障宽', t: ['A3.2.1.6', '(1)',
            <Text>采用刚性隔障防护，该隔障从对重（平衡重）位于最低位置时的最低点延伸到底坑地面以上最小2.00m处，其宽度至少等于对重（平衡重）宽度；</Text>
        ],
        x: '测量值', u: 'm', c: '四', d: '1',
    },],
    [{check: '3.2.1.6(1)'}],
    [{n: '移动装限', t: [undefined, '(2)',
            <Text>如在井道内设置可移动装置，该装置能够将对重（平衡重）的运行行程限制在底坑地面以上不小于1.80m或者行程允许最大高度处。</Text>
        ],
        x: '测量值', u: 'm', c: '四', d: '1',
    },],
    [{check: '3.2.1.6(2)'}],
    [{n: '坑厢垂距', t: ['A3.2.1.7', '(2)',
            <Text>对于人员可进入的井道，井道内设置可移动的装置，当轿厢停在其上面时，该装置保证在底坑地面与轿厢的最低部件之间的自由垂直距离至少为1.80m或者行程允许最大值；</Text>
        ],
        x: '测量值', u: 'm', c: '四', d: '1',
    },],
    [{check: '3.2.1.7(2)'}],
    [{n: '定压力', t: ['A3.2.2.6', '(3)',
                <Text>通常情况下溢流阀的调定工作压力不超过满载压力的140%，最大不高于满载压力的170%[在此情况下需提供相应的液压管路（包括液压缸）计算说明]；</Text>
            ],
            x: '调定压力', u: 'Mpa', c: '四', d: '0',
        },
        {n: '满压力', t: [undefined, undefined, undefined], x: '满载压力', c: '四', d: '0',},
        {n: '阀计算', t: [undefined, undefined, undefined], x: '计算结果', u: '%', c: '四', d: '0',},
    ],
    [{check: '3.2.2.6'}],
    [{n: '面积', t: ['A3.2.4.1', '(1)',
            <Text>轿底面积不得大于1.00m²，轿厢深度不得大于 1.00m，轿厢高度不得大于1.20m。如果轿厢由几个固定的间隔组成，且每一间隔都满足上述要求，则轿厢总高度允许大于1.20m</Text>
        ],
        x: '面积', u: <Text>m<sup>2</sup></Text>, c: '四', d: '0',
    },
        {n: '厢深', t: [undefined, undefined, undefined], x: '轿厢深度', u: 'm', c: '四', d: '1',},
        {n: '厢高', t: [undefined, undefined, undefined], x: '轿厢（间隔）高度', c: '四', d: '1',},
    ],
    [{check: '3.2.4.1(1)'}],
    [{n: '地板宽', t: ['A3.2.4.6', '(2)', '宽度不小于轿厢入口宽度，长度不小于开锁区域的1/2加50mm与轿厢地板至层门地坎的距离加20mm的较大者；'],
           x: '宽度测量值', u: 'mm', c: '四', d: '1',
        },
        {n: '地板长', t: [undefined, undefined, undefined], x: '长度测量值',  c: '四', d: '1',},
    ],
    [{n: '厢地叠', t: [undefined, '(3)', '无论轿厢在何位置，均与轿厢地板有不小于20mm的重叠。'],
        x: '测量值',  c: '四', d: '1',
    },],
    [{check: '3.2.4.6'}],
    [{n: '液压下沉', t: ['A3.3.4', '(1)',
            <Text>对于液压杂物电梯，载有额定载重量的轿厢停靠在最高服务站，停止10min，下沉应当不超过10mm。</Text>
        ],
        x: '测量值',  c: '四', d: '1',
    },],
    [{check: '3.3.4(1)'}],
] as EachMeasureCritConfig[][];

