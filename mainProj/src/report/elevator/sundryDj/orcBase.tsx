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
import {itemA技术见证} from "./editor";


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
    [['悬挂钢丝绳公称直径','_$钢丝绳直径','mm'], ['顶升型式', '_$顶升形式'] ],
    [['油缸数量','_$油缸数量','个'], ['油缸型式', '_$油缸形式'] ],
    [['液压泵型号','_$液泵型号',], ['液压泵编号', '_$液泵编号'] ],
    [['液压泵流量','_$液泵流量','L/min'], ['液压泵功率', '_$液泵功率','KW'] ],
    [['整机防爆标志','_$防爆标志',], ['区域防爆等级', '_$防爆等级'] ],
    [['安全管理人员', '安全员'], ['使用单位联系电话', '_$使用单位电话'] ],
    // ?设备联系人的手机
    [['使用单位联系人手机', '_$设备联系手机'], ['维保电话', '维保电话'] ],
    [['使用单位地址', '_$使用单位地址'] ],
    [['分支机构名称', '_$分支机构'] ],
    [['分支机构地址', '_$分支机构地址'] ],
    [['楼盘地址', '_$楼盘地址'] ],
    [['制造单位名称', '_$制造单位'] ],
    [['改造单位名称','_$改造单位']],
    [['维保单位名称', '_$维保单位']],
    [['整改情况反馈期限',{n:'改反馈期',t:'d'}], ['下次检验(检测)日期','_$新下检日'] ],
    [['检验意见通知书编号','意通知号'], ],
    [['现场检验条件',{r:'见附录A'}]],
    [['检验依据',{r:'《电梯监督检验和定期检验规则》（TSG T7001—2023）'}]],
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
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论,...itemA技术见证] },
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
    [{n: '定压力', t: ['A3.2.2.6', '(2)',
                <Text>通常情况下溢流阀的调定工作压力不超过满载压力的140%，最大不高于满载压力的170%[在此情况下需提供相应的液压管路（包括液压缸）计算说明]；</Text>
            ],
            x: '调定压力', u: 'Mpa', c: '四', d: '0',
        },
        {n: '满压力', t: [undefined, undefined, undefined], x: '满载压力', c: '四', d: '0',},
        {n: '阀计算', t: [undefined, undefined, undefined], x: '计算结果', u: '%', c: '四', d: '0',},
    ],
    [{check: '3.2.2.6'}],

] as EachMeasureCritConfig[][];

