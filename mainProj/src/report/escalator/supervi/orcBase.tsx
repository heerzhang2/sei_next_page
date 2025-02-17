/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, useTheme, Button, useToast, TextArea, TableBody, TableRow, CCell, Table,
} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, useItemInputControl} from "../../common/base";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useMedia} from "use-media";
import {assertNamesUnique} from "../../common/eHelper";
import {itemA结论,} from "../../mobilecr/editorIN";
import {EachMeasureCritConfig} from "../../common/msCriteria";
import {EditStorageContext} from "../../StorageContext";
import {itemA技术见证} from "../../elevator/sundryDj/editor";
import {itemA扶速差, itemA监控设施} from "./editor";

export const render交通型 = {
    view: (orc: any) => <>{orc.是公共交通 ? '是' : '否'}</>,
};
const 施工许可证子级=['A1','A2','A','B','C','不分级'];
export const config设备概况 = [
    [['统一社会信用代码', '_$使用单位信用码'], ['设备所在区域', '_$使用地区域']  ],
    [['注册代码', '_$注册代码'], ['使用登记证编号', '_$使用证号'] ],
    [['楼盘名称', '_$楼盘'], ['楼盘性质', '_$楼盘性质'] ],
    [['楼盘地址', '_$楼盘地址'] ],
    [['分支机构名称','_$分支机构']],
    [['分支机构地址','_$分支机构地址']],
    [['使用单位地址', '_$使用单位地址'] ],
    [['安装地点', '_$设备使用地点'], ['单位内编号','_$单位内部编号']],
    [['产品型号', '_$型号'], ['产品编号', '_$出厂编号'] ],
    [['制造日期', '_$制造日期'] ,['改造日期', {n:'改造日期',t:'d'}] ],
    [['驱动主机型号', '_$主机型号'], ['驱动主机编号', '_$主机编号'] ],
    [['控制屏型号', '_$控制屏型号'], ['控制屏编号', '_$控制屏编号'] ],
    [['名义速度', '_$运行速度', 'm/s'], ['名义宽度', '_$名义宽度', 'mm'] ],
    [['倾斜角', '_$倾斜角度', '°'], ['输送能力', {n:'输送能',u:'P/h'}, ] ],
    [['（自动扶梯）提升高度', '_$提升高度', 'm'], ['（自动人行道）使用区长度', '_$使用区长度', 'm']  ],
    [['进口情况','_$进口类型'],['是否公共交通型', '_$是公共交通',render交通型], ],
    [['使用单位联系人', '_$单位联系人'],  ],
    [['使用单位联系人手机', '联手机'], ['使用单位联系电话', '_$使用单位电话'] ],
    [['制造单位名称', '_$制造单位'] ],
    [[{pr:'施工单位名称', span:3, t:'安装单位'}, '安装单'],   ],
    [[{t:'改造单位'}, '改造单'],  ],
    [[{t:'重大修理单位'}, '大修单'],  ],
    // [['改造单位名称','_$改造单位']],
    [['施工单位生产许可证编号','生产许号'],['施工单位许可子项目(级别)',{n: '制许可子', t: 'l', l: 施工许可证子级}], ],
    [['维护保养单位名称','_$维保单位'] ],
    [['维护保养单位电话','维保电话'] ],
    [['下次检验(检测)日期','_$新下检日'] ],
    [['现场检验条件',{r:'见附录B'}]],
    [['检验依据',{r:'《电梯监督检验和定期检验规则》（TSG T7001-2023）'}]],
];

/**拆分1-6, 三个编辑域:
 * */
export const config观测数据 = [
    [{n: '立面积', t: ['A2.2.1.5', '(1)',
                <Text>在机房、桁架内部的驱动站和转向站内，具有一个无任何永久固定设备的、站立面积足够大的空间，站立面积不小于0.30m2，其较短一边的长度不小于0.50m</Text>
            ],
            x: '站立面积', u: 'm²', c: '四', d: '1',
        },
        {n: '短边长', t: [undefined, undefined, null], x: '较短边长度',u: 'm', c: '四', d: '1',},
    ],
    [{check: '2.2.1.5(1)'}],
    [{n: '立足面积', t: [undefined, '(2)',
            <Text>主驱动装置或者工作制动器装在梯级、踏板或者胶带的载客分支和返回分支之间时，在工作区段具有一个水平的立足区域，其面积不小于0.12m2，最小边尺寸不小于0.30m</Text>
            ],
            x: '立足区域面积', u: 'm²', c: '四', d: '1',
       },
        {n: '小边尺', t: [undefined, undefined, null], x: '最小边尺寸',u: 'm', c: '四', d: '1',},
    ],
    [{check: '2.2.1.5(2)'}],
    [{n: '柜深度', t: [undefined, '(3)',
            <Text>在分离机房内的控制柜前有一块净空间，其深度不小于0.70m，宽度不小于0.50m 与控制柜全宽的较大者，净高度不小于2.00m</Text>
        ],
        x: '深度', u: 'm', c: '四', d: '1',
      },
        {n: '柜宽度', t: [undefined, undefined, null], x: '宽度', c: '四', d: '1',},
        {n: '柜净高', t: [undefined, undefined, null], x: '净高度',  c: '四', d: '1',},
    ],
    [{check: '2.2.1.5(3)'}],
    [{n: '水平净空', t: [undefined, '(4)',
            <Text>在分离机房内对运动部件进行维护和检查以及紧急操作的地方有一块不小0.50m×0.60m的水平净空间，其净高度不小于2.00m</Text>
            ],
            x: '水平净空间', u: 'm×m',
        },
        {n: '检净高', t: [undefined, undefined, null], x: '净高度',u: 'm', c: '四', d: '1',},
    ],
    [{check: '2.2.1.5(4)'}],
    [{n: '照度', t: ['A2.2.2.1', '(1)',
            <Text>测量在楼层板平面的梳齿与踏面相交线位置的照度是否至少为50lx</Text>
        ],
        x: '照度', u: 'lx', c: '四', d: '1',
       },
    ],
    [{check: '2.2.2.1'}],
    [{n: '口区宽', t: ['A2.2.2.2', '(1)',
            <Text>检查出入口区域是否充分畅通，其宽度至少等于扶手带外缘距离加上每边各80mm，纵深尺寸从扶手装置端部算起至少为2.50m；该区域的宽度不小于扶手带外缘之间距离的2倍加上每边各80mm时，其纵深尺寸允许减少至2.00m</Text>
        ],
        x: '出入口区域宽度', u: 'mm', c: '四', d: '1',
      },
      {n: '口区深', t: [undefined, undefined, null], x: '出入口区域纵深尺寸',u: 'm', c: '四', d: '1',},
    ],
    [{check: '2.2.2.2'}],
    [{n: '高出扶', t: ['A2.2.2.3', '(1)',
            <Text>出入口防护装置至少高出扶手带100mm，位于扶手带外缘80mm～120mm处</Text>
        ],
        x: '高出扶手带的距离', u: 'mm', c: '四', d: '1',
      },
        {n: '扶带外', t: [undefined, undefined, undefined], x: '与扶手带外缘距离', c: '四', d: '1',},
    ],
    [{check: '2.2.2.3(1)'}],
    [{n: '楼层起高', t: [undefined, '(2)',
            <Text>出入口防护装置从楼层板起高度不小于1100mm</Text>
        ],
        x: '从楼层板起的高度', u: 'mm', c: '四', d: '1',
      },
    ],
    [{check: '2.2.2.3(2)'}],
    [{n: '直净高', t: ['A2.2.2.4', '(1)',
            <Text>检查梯级、踏板或者胶带上方的垂直净高度是否不小于2.30m，并且该净高度延续到扶手转向端端部</Text>
        ],
        x: '垂直净高度', u: 'm', c: '四', d: '1',
      },
    ],
    [{check: '2.2.2.4'}],
    [{n: '挡板高', t: ['A2.2.2.5', '(2)',
            <Text>受检设备与楼板有交叉或者受检设备之 间有交叉的，检查交叉处是否设有垂直 固定、无锐利边缘的封闭防护挡板，其 位于扶手带上方的防护高度不小于
                0.30m，并且延伸至扶手带下缘以下至 少25mm（扶手带外缘与任何障碍物之 间的距离不小于400mm的，可以不设置 防护挡板）</Text>
        ],
        x: '防护挡板高度', u: 'm', c: '四', d: '1',
      },
      {n: '缘下距', t: [undefined, undefined, null], x: '扶手带下缘以下距离', u: 'mm', c: '四', d: '1',},
    ],
    [{check: '2.2.2.5'}],
] as EachMeasureCritConfig[][];

export const config观测数据2 = [
    [{n: '平距离', t: ['A2.2.2.6', '(1)',
            <Text>墙壁或者障碍物与扶手带外缘之间的水平距离不小于80mm，与扶手带下缘的垂直距离不小于25mm</Text>
            ],
            x: '水平距离', u: 'mm', c: '四', d: '1',
        },
        {n: '垂直距', t: [undefined, undefined, null], x: '垂直距离', c: '四', d: '1',},
    ],
    [{check: '2.2.2.6(1)'}],
    [{n: '外缘距离', t: [undefined, '(2)',
            <Text>对于邻近布置的受检设备，其扶手带外缘之间的距离不小于160mm</Text>
        ],
        x: '邻近扶手带外缘距离', c: '四', d: '1',
     },
    ],
    [{check: '2.2.2.6(2)'}],
    [{n: '开关距', t: ['A2.2.2.7', '(2)',
            <Text>多台连续并且无中间出口的受检设备在梯级、踏板或者胶带到达梳齿与踏面相交线之前2.00m～3.00m处，设有乘客易于触及的附加紧急停止开关</Text>
        ],
        x: '附加紧急停止开关与踏面相交线的距离', u: 'm',c: '四', d: '1',
     },
    ],
    [{check: '2.2.2.7'}],
    [{n: '啮合深度', t: ['A2.2.2.9', '(2)',
            <Text>梳齿板梳齿与踏面齿槽的啮合深度至少为4mm，梳齿槽根部与踏面的间隙不超过4mm</Text>
        ],
        x: '啮合深度', u: 'mm', c: '四', d: '1',
      },
        {n: '槽间隙', t: [undefined, undefined, null], x: '间隙', c: '四', d: '1',},
    ],
    [{check: '2.2.2.9'}],
    [{n: '开关间距', t: ['A2.2.2.10', '(1)',
            <Text>受检设备出入口附近设有紧急停止开关，必要时增设附加紧急停止开关，以使紧急停止开关之间的距离不超过30m(适用于自动扶梯)或者40m(适用于自动人行道)</Text>
        ],
        x: '紧急停止开关之间的距离', u: 'm',c: '四', d: '1',
     },
    ],
    [{check: '2.2.2.10(1)'}],
    [{n: '标记径', t: [undefined, '(2)',
            <Text>各紧急停止开关标识清晰，对于位于扶手装置高度1/2以下的紧急停止开关，在扶手装置高度1/2以上的醒目位置还设有直径至少为80mm的红底白字“急停”指示标记，箭头指向该开关</Text>
        ],
        x: '指示标记直径', u: 'mm',c: '四', d: '1',
      },
    ],
    [{check: '2.2.2.10(2)'}],
    [{n: '裂纹宽', t: ['A2.2.3.1', '(1)',
            <Text>扶手带完好，表面无龟裂、剥离、严重磨损，扶手带单一开裂处最大裂纹宽度不大于3mm</Text>
        ], x: '最大裂纹宽度', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.1(1)'}],
    [{n: '转垂直距', t: [undefined, '(2)',
            <Text>扶手转向端入口处的最低点与地板之间的垂直距离不小于0.10m，并且不大0.25m</Text>
        ], x: '垂直距离', u: 'm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.1(2)'}],
    [{n: '凸出高', t: [undefined, '(3)',
            <Text>朝向梯级、踏板或者胶带一侧的部分光滑、平齐；装设方向与运行方向不一致的压条或者镶条凸出高度不大于3mm，其边缘呈圆角或者倒角状；沿运行方向的盖板连接处结构能够防止勾绊</Text>
        ], x: '凸出高度', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.1(3)'}],
    [{n: '防爬装离', t: ['A2.2.3.3', '(1)',
            <Text>防爬装置在位于地平面上方1000mm土50mm处</Text>
        ], x: '防爬装置离地平面距离', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.3(1)'}],
    [{n: '防爬伸长', t: [undefined, '(2)',
            <Text>防爬装置高度至少与扶手带表面齐平，下部与外盖板相交，平行于外盖板方向上的延伸长度不小于1000mm，并且在此长度范围内无踩脚处</Text>
        ], x: '防爬装置延伸长度', c: '四', d: '1',},
    ],
    [{check: '2.2.3.3(2)'}],
    [{n: '外盖宽', t: ['A2.2.3.4', '(1)',
            <Text>对于与墙相邻并且外盖板的宽度大于125mm的受检设备，或者相邻平行布置并且共用外盖板的宽度大于125mm的自
                动扶梯或者倾斜的自动人行道，检查在上、下端部装设的阻挡装置是否能够防止人员进入外盖板区域，并且延伸到高度距离扶手带下缘25mm～150mm处</Text>
        ], x: '外盖板宽度', u: 'mm', c: '四', d: '1',},
        {n: '挡下缘距', t: [undefined, undefined, null], x: '阻挡装置与扶手带下缘的距离', c: '四', d: '1',},
    ],
    [{check: '2.2.3.4'}],
] as EachMeasureCritConfig[][];

export const config观测数据3 = [
    [{n: '带中线距', t: ['A2.2.3.5', '(1)',
          <Text>自动扶梯或者倾斜的自动人行道和相邻的墙之间装有接近扶手带高度的扶手盖板，并且建筑物(墙)和扶手带中心线之间的距离大于300mm时，或者相邻自动扶梯或者倾斜的自动人行道的扶手带中心
            线之间的距离大于400mm时，检查在扶手盖板上装设的防滑行装置是否无锐角或者锐边，与扶手带的距离不小于100mm，并且防滑行装置之间的间隔距离不大于1800mm，高度不小于20mm</Text>
        ], x: '建筑物（墙）和扶手带中心线或者相邻设备扶手带中心线之间的距离', u: 'mm', c: '四', d: '1',},
        {n: '滑行带距', t: [undefined, undefined, null], x: '防滑行装置与扶手带距离', c: '四', d: '1',},
        {n: '滑行间距', t: [undefined, undefined, null], x: '防滑行装置之间的间隔距离', u: 'mm',c: '四', d: '1',},
        {n: '滑行高', t: [undefined, undefined, null], x: '防滑行装置的高度', c: '四', d: '1',},
    ],
    [{check: '2.2.3.5'}],
    [{n: '壁板间', t: ['A2.2.3.6', '(1)',
            <Text>检查护壁板之间的间隙是否不大于4mm，其边缘是否呈圆角或者倒角状</Text>
        ], x: '护壁板间隙', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.6'}],
    [{n: '单侧水间', t: ['A2.2.3.7', '(1)',
            <Text>任何一侧的水平间隙不大于4mm，并且两侧对称位置处的间隙总和不大于7mm</Text>
        ], x: '单侧水平间隙', u: 'mm', c: '四', d: '1',},
        {n: '两侧间', t: [undefined, undefined, null], x: '两侧间隙总和', c: '四', d: '1',},
    ],
    [{check: '2.2.3.7(1)'}],
    [{n: '板下垂间', t: [undefined, '(2)',
            <Text>围裙板设置在踏板之上时，踏板表面与围裙板下端的垂直间隙不大于4mm，踏板侧边与围裙板垂直投影间不产生间隙</Text>
        ], x: '踏板表面与围裙板下端的垂直间隙', c: '四', d: '1',},
    ],
    [{check: '2.2.3.7(2)'}],
    [{n: '防夹端点', t: ['A2.2.3.9', '(2)',
            <Text>围裙板防夹装置端点位于梳齿与踏面相交线前(梯级侧)不小于50mm，但不大于150mm的位置</Text>
        ], x: '防夹装置端点位置', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.3.9'}],
    [{n: '踏板间隙', t: ['A2.2.4.1', '(2)',
            <Text>在工作区段内的任何位置，从踏面测得的两个相邻梯级或者踏板之间的间隙不大于6mm；在自动人行道过渡曲线区段、如果踏板的前缘和相邻踏板的后缘啮合，其间隙允许增至8mm</Text>
        ], x: '相邻梯级或者踏板间隙（填写抽测数据的最大值）', u: 'mm',c: '四', d: '1',},
    ],
    [{check: '2.2.4.1'}],
    [{n: '自停行时', t: ['A2.3.1', '(2)',
            <Text>对于由使用者的进入而自动启动的受检设备，观察、测量当使用者从预定运行方向进入时，是否经过足够的时间(至少为预期输送时间再加上10s)才能自动停
                止运行；当使用者从预定运行方向相反的方向进入时，是否仍按照预先确定的方向启动，运行时间不少于10s</Text>
        ], x: '自动停止运行时间', u: 's', c: '四', d: '1',},
        {n: '自启行时', t: [undefined, undefined, null], x: '自动启动运行时间', u: 's',c: '四', d: '1',},
    ],
    [{check: '2.3.1'}],
    [{n: '下行制停', t: ['A2.3.3', '(1)',
            <Table tight miniw={800}><TableBody>
                <TableRow><CCell colSpan={2}>表A2-1 自动扶梯制停距离</CCell></TableRow>
                <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
            </TableBody></Table>
        ], x: '有载下行制停距离', u: 'm',c: '四', d: '1',},
    ],
    [{check: '2.3.3(1)'}],
    [{n: '空上制停', t: [undefined, '(2)',
            <Table tight miniw={800}><TableBody>
                <TableRow><CCell colSpan={2}>表A2-2 自动人行道制停距离</CCell></TableRow>
                <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                <TableRow><CCell>0.90m/s</CCell><CCell>0.55m～1.70m</CCell></TableRow>
            </TableBody></Table>
        ], x: '空载上行制停距离', u: 'm',c: '四', d: '1',},
        {n: '空下制停', t: [undefined, undefined, null], x: '空载下行制停距离', c: '四', d: '1',},
    ],
    [{check: '2.3.3(2)'}],
] as EachMeasureCritConfig[][];


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
            {value: config设备概况, type:'esnt'}, {value:[...itemA结论, ...itemA技术见证,  ] },
            {value: config观测数据, type:'mesB'}, {value: config观测数据2, type:'mesB'}, {value: config观测数据3, type:'mesB'},
            {value:[...itemA扶速差, ...itemA监控设施 ] },
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
