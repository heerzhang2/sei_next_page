import * as React from "react";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {RepLink, twoForkSelectS} from "@/report/common/base";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {DirectLink} from "@/routing/Link";
import {EachObserveConfig, useObserveTable} from "@/report/hook/useObserve";
import {JumpTab} from "@/report/common/JumpTab";

/**设备概况表,在原始记录使用的：
这里并没有设置字体大小的。 =浏览器默认字体的大小的。
* */
export const DeviceServeyView = ({orc, rep, config, fixed = ["4.2%", "12.1%", "39%", "9%", "11.1%", "%"], fromHead, label}
                           : { orc: any, rep: any, config: any[], fixed?: string[], fromHead?: boolean, label: any }
) => {
    const renderUpper = usePrefixDataTable({config, orc, rep, slash: true});
    return <PrintReserveLeast fromHead={fromHead} reserve="8rem"
                              title={<RepLink rep={rep} ori tag="Survey">
                                  <h2 className={`text-2xl ${!fromHead ? 'mt-4' : ''}`}>
                                      {label}
                                  </h2>
                              </RepLink>
                              }>
        <FlexibleTable id="Survey" columnWidths={fixed}>
            <TableBody>
                <RepLink rep={rep} ori tag="Survey">
                    {renderUpper}
                </RepLink>
            </TableBody>
        </FlexibleTable>
    </PrintReserveLeast>
}
/**较为常见的  现场条件： 标题带入，避免于孤立页尾巴。
 * 允许设置 children:' '；
 * @param dcln 布局日期列数正常=5；或3;
 * */
export const 常用现场条件 = ({orc, rep, config, label = '附录B：现场检验条件确认', children, dcln = 5, jyt = '检验',fixed}:
                             {
                                 orc: any,
                                 rep: any,
                                 config: any[],
                                 label?: any,
                                 children?: React.ReactNode,
                                 dcln?: number,
                                 jyt?: string
                                 fixed?: string[]
                             }
) => {
    const fixwidths =fixed? fixed :
                (3 === dcln ? ["%", "10.4%", "10.4%", "10.4%"] : ["%","9.1%","9.1%","9.1%","9.1%","9.1%"]);
    if (dcln !== 5 && dcln !== 3) throw new Error("非法列数");
    const recNums = orc?.检验条件?.length;
    const blocks = Math.ceil(recNums / dcln) || 1;     //倒转的，每dcln行的一块块布局:固定的dcln个日期汇集打印的一行。
    return <>
        <h2 className="text-2xl mt-4">{label!}</h2>
        <FlexibleTable id={'SiteCondition'} columnWidths={fixwidths} className="text-sm">
            <TableHeader>
                <TableRow>
                    <CCell>现场{jyt}条件</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
                    {5 === dcln && <><CCell>确认结果</CCell><CCell>确认结果</CCell></>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {(new Array(blocks)).fill(null).map((_, b: number) => {
                    const SumRowB = config.length;
                    const dates = [] as any;      // const condits=[][] as any[];
                    //底下condits[i].concat 不能用push函数来替代的：        let condit1: JSX.Element[]=[];
                    let condits = Array(SumRowB).fill([]);
                    (new Array(dcln)).fill(null).forEach((_, d: number) => {
                        if (b * dcln + d >= recNums) {
                            //空白
                            config.forEach(([title, {f: field, N: descnode}]: any, i: number) => {
                                condits[i] = condits[i].concat(<CCell key={b * dcln + d + '' + i}></CCell>);
                            });
                            dates.push(<CCell key={b * dcln + d}></CCell>);
                        } else {
                            const row = orc?.检验条件?.[b * dcln + d];
                            config.forEach(([title, {f: field, N: descnode}]: any, i: number) => {
                                condits[i] = condits[i].concat(<CCell
                                    key={b * dcln + d + '' + i}>{twoForkSelectS(row?.[field])}</CCell>);
                            });
                            dates.push(<CCell key={b * dcln + d}>{row?.d}</CCell>);
                        }
                    });

                    return <JumpTab key={b}
                                       href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SiteCondition#SiteCondition`}>
                        {config.map(([title, {f: field, N: descnode}]: any, i: number) => {
                            return <TableRow key={i}>
                                <CCell>{descnode}</CCell>
                                {condits[i]}
                            </TableRow>
                        })}
                        <TableRow>
                            <CCell>确认时间</CCell>
                            {dates}
                        </TableRow>
                    </JumpTab>;
                })}
            </TableBody>
        </FlexibleTable>
        {children ? children :
            <div className={"text-[0.75rem]"}>
                注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
            </div>
        }
    </>;
};

/*@param fromHead :打印时需要断开页的也就是页首打印。
* */
export const tail测仪器 = <div className="text-xs">
    注：1、性能状态一栏中用“✔”表示正常，用“✘”表示不正常。
    <p className="text-xs ml-6">
        2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
        3、新增使用的仪器设备应填写在预留栏中。<br/>
        4、未使用的仪器设备可不填写。
    </p>
</div>;
export const InstrumentVw = ({orc, rep, label, fromHead}: {
    orc: any
    rep: any
    label: any
    fromHead?: boolean
}) => {
    return (
        <>
            <PrintReserveLeast fromHead={fromHead} reserve="13.3rem"
                               title={<RepLink rep={rep} ori tag="Instrument">
                                   <h2 className="text-2xl">{label}</h2>
                               </RepLink>
                               }>
                <FlexibleTable id="Instrument" columnWidths={["%", "24%", "22%", "8%", "8%"]}>
                    <TableHeader>
                        <RepLink rep={rep} ori tag="Instrument">
                            <TableRow>
                                <CCell className="text-sm" rowSpan={2}>测量设备名称</CCell>
                                <CCell className="text-sm" rowSpan={2}>规格型号</CCell>
                                <CCell className="text-sm" rowSpan={2}>仪器设备编号</CCell>
                                <CCell className="text-sm" colSpan={2}>仪器设备状态</CCell>
                            </TableRow>
                            <TableRow>
                                <CCell className="text-sm">开机后</CCell>
                                <CCell className="text-sm">关机前</CCell>
                            </TableRow>
                        </RepLink>
                    </TableHeader>
                    <TableBody>
                        <RepLink rep={rep} ori tag="Instrument">
                            {orc.仪器表?.map((o: any, i: React.Key) => (
                                <TableRow key={i}>
                                    {/* 表格数据单元格 */}
                                    <CCell className="break-all text-sm">{o.n}</CCell>
                                    <CCell className="break-all text-sm">{o.t}</CCell>
                                    <CCell className="break-all text-sm">{o.i}</CCell>
                                    <CCell>{o.o}</CCell>
                                    <CCell>{o.f}</CCell>
                                </TableRow>
                            ))}
                        </RepLink>
                    </TableBody>
                </FlexibleTable>
            </PrintReserveLeast>
            {tail测仪器}
        </>
    )
}
/*单一个编辑区的, 有设计值列；
* */
export const MeasureAllowTest = ({
                                 orc,
                                 rep,
                                 label,
                                 config,
                                 fixed = ["4.1%", "16%", "9%", "6%", "%", "19%", "6%", "10%", "9%", "11%", "8%"],
                                 children,
                                 mem,
                                 tag = 'Measure'
                             }
                             : {
                                 orc: any, rep: any, label: string, fixed?: string[], children?: React.ReactNode,
                                 config: EachObserveConfig[][]; mem?: string; tag?: string
                             }
) => {
    const [render1,] = useObserveTable({rep, orc, config: config, tag, allowableV: true});
    return <>
        <PrintReserveLeast reserve="7rem"
                title={<h2 className="text-2xl mt-4">{label}</h2>}
        >
            <FlexibleTable columnWidths={fixed}>
                <TableHeader>
                    <TableRow className="text-sm">
                        <CCell className="text-xs">序号</CCell><CCell colSpan={5}>检测项目</CCell>
                        <CCell>单位</CCell><CCell>观测数据</CCell>
                        <CCell>测量结果</CCell><CCell>设计值</CCell><CCell>结果判定</CCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <RepLink ori rep={rep} tag={tag}>
                        {render1}
                        {mem && <TableRow>
                            <CCell className="text-sm">备注</CCell>
                            <TableCell colSpan={10} className="border border-gray-700">
                                <div className="text-sm min-h-4 whitespace-pre-wrap">{orc?.[mem] || '／'}</div>
                            </TableCell>
                        </TableRow>
                        }
                    </RepLink>
                </TableBody>
            </FlexibleTable>
        </PrintReserveLeast>
        {children ? children :
            <div>
                注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
            </div>
        }
    </>;
};
//【表格工具】 JSON.parse(orc?._tblFixed??'[]'); 编辑器3段式窗口总宽度1595px；
//有备注列的： 拆解成2个部分编辑器的。
export const MeasureMemoTwoRaft = ({
                                 orc, rep, label, config,
                                 fixed = ["2.8%", "6.2%", "3.3%", "9%", "%", "12%", "5%", "9%", "8%", "6.1%", "10%"]
                                 , children, config2, mem
                             }
                             : {
                                 orc: any, rep: any, label: string, fixed?: string[], children?: React.ReactNode,
                                 config: EachObserveConfig[][]; config2: EachObserveConfig[][]; mem?: string;
                             }
) => {
    const [render1, seq1e] = useObserveTable({rep, orc, config: config, memoF: true, tag: 'Measure'});
    const [render2,] = useObserveTable({rep, orc, config: config2, memoF: true, seqOfs: seq1e, tag: 'Measure2'});
    return <>
        <PrintReserveLeast reserve="7rem"
             title={<h2 className="text-2xl mt-4">{label}</h2>}
        >
            <FlexibleTable columnWidths={fixed}>
                <TableHeader>
                    <TableRow>
                        <CCell className="text-xs">序号</CCell>
                        <CCell colSpan={2} className="text-sm">项目编号</CCell>
                        <CCell colSpan={2}>检验内容与要求</CCell>
                        <CCell>检测项目</CCell>
                        <CCell className="text-sm">单位</CCell><CCell className="text-sm">观测数据</CCell>
                        <CCell className="text-sm">测量结果</CCell>
                        <CCell className="text-xs">结果判定</CCell><CCell>备注</CCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <RepLink ori rep={rep} tag='Measure'>
                        {render1}
                    </RepLink>
                    <RepLink ori rep={rep} tag='Measure2'>
                        {render2}
                        {mem && <TableRow>
                            <CCell colSpan={2}>备注</CCell>
                            <TableCell colSpan={9} className="border border-gray-700">
                                <div className="text-sm min-h-4 whitespace-pre-wrap">{orc?.[mem] || '／'}</div>
                            </TableCell>
                        </TableRow>
                        }
                    </RepLink>
                </TableBody>
            </FlexibleTable>
        </PrintReserveLeast>
        {children ? children :
            <div>注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。</div>
        }
    </>;
};
