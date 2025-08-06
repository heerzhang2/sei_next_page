"use client"
import * as React from "react"
import {useSearchParams} from "next/navigation"
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {RepLink, ReportEntryProps, ReportViewProps, RepTitleUpdate} from "@/report/common/base"
import {落款单位地址} from "@/report/common/rarelyVary"
import {Column_Setting, useFormatOmni} from "@/report/common/useFormatOmni"
import {useOfficialOmni} from "@/report/common/useOfficialOmni"
import {UnqualifiedIspTable} from "@/report/common/general"
import {useItemsMapOmni} from "@/report/common/omni"
import {检验核准WaterJj, 注意事项WaterJj} from "@/report/recreation/waterJj/rarelyVary"
import {RepDeviceDetail} from "./RepDeviceDetail"
import {tItems现场, 填写须知recr, 首页概况recr} from "@/report/recreation/slidingJj/rarelyVary";
import {ReportFirstPageHeadJd} from "@/report/common/head";
import {createPdfJob} from "@/report/footer/job";
import {RepFootLink} from "@/report/common/repFootLink";
import {RepHeadLink} from "@/report/common/repHeadLink";
import {JumpTab} from "@/report/common/JumpTab";
import {DeviceServeyView, InstrumentVw, MeasureAllowTest, MeasureMemoTwoRaft, 常用现场条件} from "@/report/common/view";
import PageSectionOrientation from "@/components/page-section-orientation";
import {config主技术, tail主技} from "@/report/recreation/slidingJj/MainTechnical";
import {StrainStressVw} from "@/report/recreation/waterJj/StrainStress";
import {AccelerationVw} from "@/report/recreation/waterJj/Acceleration";
import {config观测数据, config观测数据2, config设备概况, setupItemAreaRoute, tail观测} from "@/report/recreation/slidingJj/slidingJjO1";

export const ReportView = ({ rep }: ReportEntryProps) => {
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const { storage } = useStorage()
    const Component = original ? FormatOriginal : OfficialReport
    const pdf_job = createPdfJob(rep, original);
    return (
        <>
            <div id="PHEAD" />
            <RepHeadLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep} />
            <RepTitleUpdate code={storage?.eqpcod}/>
            <Component source={storage} rep={rep} />
            <RepFootLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep}
                         pdf_job={pdf_job} />
            <div id="PTAIL" />
        </>
    )
}

const 检验结果替换 = (orc: { [x: string]: any }) => {
    const out = {...orc}
    // if(undefined!==orc?.绝缘阻o)  out.绝缘阻检=<div>电阻值{floatInterception(orc?.绝缘阻o,1)}MΩ</div>;
    return out
}
const config报告: Column_Setting[] = [{n: "", x: "检验结果"}, {n: null, x: "结论"}, {n: "M", x: "备注", m: true},]

/*有些内容放页眉页脚：<span>报告编号：{rep.isp.no}</span>页号安排放入页眉页脚。
* */
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({source: orc, rep}) => {
    const impressionismAs = React.useMemo(() => {
        return setupItemAreaRoute({ rep, orc })
    }, [rep, orc?._Oitems])
    const { renderIspContent } = useOfficialOmni({orc,rep, ItemArs: impressionismAs?.Item, config: config报告, itResCB: 检验结果替换,})
    const [mapNoTag] = useItemsMapOmni({ ItemArs: impressionismAs?.Item, notCheckNo: false })
    return (
        <React.Fragment>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadJd({rep, mbbm: "FJB/YB-1002-1-2024"})}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                          <h1 className="text-3xl text-center print:mt-6">滑行车类游乐设施监督检验报告</h1>
                        </JumpTab>
                        {首页概况recr(orc,rep,)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {注意事项WaterJj({ rep,
                  comply: "依据《大型游乐设施安全技术规程》（TSG 71-2023）制定，适用于大型游乐设施监督检验",
                })}
                <h4 className="text-xl text-center mt-4 print:mt-0 print:break-before-page">
                   大型游乐设施监督检验报告
                </h4>
                {RepDeviceDetail({orc, rep})}
                {检验核准WaterJj({orc, rep})}
                <PrintReserveLeast reserve="13rem"
                       title={<h4 className="text-xl text-center mt-4 print:mt-24">
                           大型游乐设施监督检验报告附页
                       </h4>}
                >
                    <FlexibleTable className="text-sm"
                                   columnWidths={["3.5%", "6.3%", "6.3%", "5%", "5%", "%", "12.6%", "7.1%", "11.5%"]}>
                        <TableHeader>
                            <TableRow>
                                <CCell className="text-[0.7rem] !p-0">序号</CCell>
                                <CCell colSpan={5}>检验项目及内容</CCell>
                                <CCell>
                                    <span className="text-[0.8rem]">检验结果</span>
                                </CCell>
                                <CCell>结论</CCell>
                                <CCell>备注</CCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>{renderIspContent}</TableBody>
                    </FlexibleTable>
                </PrintReserveLeast>
                <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag}
                    titles={["序号", "项目编号", "不合格内容描述", "复检结果", "复检日期"]}
                    label={<h2 id='ReCheck' className="text-center text-2xl mb-2 mt-4 print:mt-0">检验不合格项目内容及复检结果</h2>}
                />
            </div>
            <div className="print:hidden">
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Instrument?original=1#Instrument`} tab="preview">
                    <div className="block">主要测量设备性能检查</div>
                </JumpTab>
                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Witness#Witness`}>
                    <span className="block">记事 、 备注</span>
                </JumpTab>
                <JumpTab id="SiteCondition" href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SiteCondition?original=1#SiteCondition`} tab="preview">
                    <span className="block">附录：现场检验条件确认</span>
                </JumpTab>
            </div>
        </React.Fragment>
    )
}

//原始记录的导航该放在后面：
export function useCatalog() {
    const {storage} = useStorage()
    const dirs = React.useMemo(() => {
        let list =[
            {title: "页面头部", url: "#PHEAD"},
            {title: "页面尾巴", url: "#PTAIL"},
            {title: "设备概况", url: "#Survey"},
            {title: "检验结论", url: "#Conclusion"},
            {title: "K1资料审查", url: "#T1-1"},
            {title: 'K2机械与结构检验', url: "#T2-1"},
            {title: 'K3传动系统检验', url: "#T3-1"},
            {title: 'K4电气及控制系统检验', url: "#T4-1"},
            {title: "K5乘载系统检验", url: "#T5-1"},
            {title: 'K6安全保护装置和防护措施检验', url: "#T6-1"},
            {title: "K6.14安全网或者其他措施", url: "#T6-14"},
            {title: 'K7载荷试验与测试', url: "#T7-1"},
            {title: '检验不合格项目内容及复检结果', url: "#ReCheck"},
            {title: "附录D：现场检验条件", url: "#SiteCondition"},
            {title: "记事 备注", url: "#Witness"},
            {title: "主要测量设备性能检查", url: "#Instrument"},
            {title: "观测数据及测量结果记录", url: "#Measure"},
            {title: "附录A主要技术参数测试", url: "#MainTechnical"},
            {title: "附录B应力测试记录", url: "#StrainStress"},
            {title: "附录C加速度检测记录", url: "#Acceleration"},
        ]
        return list
    }, [storage])
    return dirs
}

export const config记录: Column_Setting[] = [{n: '', x: '检验结果',}, {n: null, x: '结论'},
          {n: 'M', x: '备注', t: 'B', m: true}, {n: 'D', x: '不合格内容', t: 'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
                                                                             source: orc, rep,
                                                                         }) => {
    const impressionismAs = React.useMemo(() => {
        return setupItemAreaRoute({rep, orc});
    }, [rep, orc?._Oitems]);
    const {renderIspContent} = useFormatOmni({
        itRes: orc,
        ItemArs: impressionismAs?.Item,
        config: config记录,
        rep,
        rcc: true
    });
    const [mapNoTag] = useItemsMapOmni({ItemArs: impressionismAs?.Item, notCheckNo: true});
    return <>
        <div className="mt-4 mb-4 print:mt-0 print:mb-0">
            <div className="print:h-screen print:break-after-page flex flex-col justify-evenly">
                <div>
                    <div className="mx-auto md:m-2 text-right md:flex md:justify-end md:flex-wrap">
                        <span className="underline">FJJ/YB-1009-1-2024</span>
                    </div>
                    <h1 className="text-center mt-8 text-3xl print:text-4xl">
                        大型游乐设施监督检验原始记录
                    </h1>
                    <span className="block text-center text-xl mt-4">（适用于滑行车类、架空游览车类）</span>
                </div>
                <div>
                    {首页概况recr(orc, rep, true)}
                </div>
                <div className="text-center ">
                    <span className="text-center text-2xl">福建省特种设备检验研究院编制</span>
                </div>
            </div>
            {填写须知recr}
            <InstrumentVw orc={orc} rep={rep} label={'一、主要测量设备性能检查'}/>
            {DeviceServeyView({
                label: '二、设备概况',
                orc,
                rep,
                config: config设备概况,
                fixed: ["5%", "13.5%", "32%", "8%", "9%", "%"]
            })}
            <PageSectionOrientation orientation="landscape">
                <RepLink rep={rep} ori tag="ALL">
                    <h2 className={`text-2xl`}>三、检验记录</h2>
                </RepLink>
                <FlexibleTable
                    columnWidths={["2%", "3.2%", "3.8%", "4%", "1%", "7%", "%", "4.5%", "4.3%", "4.1%", "10.9%"]}>
                    <TableHeader>
                        <RepLink rep={rep} ori tag="ALL">
                            <TableRow>
                                <CCell className="text-xs leading-[1] p-0">序号</CCell>
                                <CCell colSpan={5}>检验项目</CCell>
                                <CCell>检验内容和要求</CCell>
                                <CCell className="text-xs leading-[1] p-0">检验结果</CCell>
                                <CCell>结论</CCell>
                                <CCell>备注</CCell>
                                <CCell><span className="text-sm">存在问题描述</span></CCell>
                            </TableRow>
                        </RepLink>
                    </TableHeader>
                    <TableBody>
                        {renderIspContent}
                    </TableBody>
                </FlexibleTable>
                <span id={'_See_Memo1'} className="text-sm">注：※为重要项，其它为一般项。</span>
            </PageSectionOrientation>

            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag}
                                 titles={['序号', '项目编号', '不合格内容描述', '复检结果', '复检日期']}
                                 label={<h2 id='ReCheck'
                                            className="text-left text-xl mb-2">四、检测不合格记录及复检结果</h2>}
            />
            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ALL`}>
                <div>
                    <h2 id='Conclusion' className="mt-4 print:mt-0 text-2xl break-before-page">五、现场检验意见</h2>
                    <div
                        className={`text-center ${orc?.检验结论?.length > 12 ? 'text-2xl' : 'text-4xl'} w-full border-1 border-solid border-black rounded-lg p-4`}>
                        {orc?.检验结论}
                    </div>
                </div>
            </JumpTab>
            <FlexibleTable columnWidths={["15%", "%", "15%", "20%"]}>
                <TableBody>
                    <JumpTab href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
                        <TableRow>
                            <CCell className="border-none">检验</CCell>
                            <CCell className="border-none"></CCell>
                            <CCell className="border-none">日期</CCell>
                            <CCell className="border-none">2020-01-02</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell className="border-none">校核</CCell>
                            <CCell className="border-none"></CCell>
                            <CCell className="border-none">日期</CCell>
                            <CCell className="border-none"></CCell>
                        </TableRow>
                    </JumpTab>
                </TableBody>
            </FlexibleTable>
            <RepLink ori rep={rep} tag={'Witness'}>
                <div>
                    <h2 id='Witness' className="mt-4 text-2xl">六、备注</h2>
                    <div
                        className={`text-sm min-h-4 whitespace-pre-wrap w-full border-1 border-solid border-black p-1`}>
                        {orc.大备注 ?? '／'}
                    </div>
                </div>
            </RepLink>
            <span className="text-[0.75rem]">注：本备注的内容在报告中体现。</span>
            <RepLink ori rep={rep} tag={'Witness'}>
                <div>
                    <h2 className="mt-4 text-2xl">七、记事</h2>
                    <div
                        className={`text-sm min-h-4 whitespace-pre-wrap w-full border-1 border-solid border-black p-1`}>
                        {orc.资料编号 ?? '／'}
                    </div>
                </div>
            </RepLink>
            {MeasureMemoTwoRaft({orc, rep, config: config观测数据(orc), config2: config观测数据2(orc), mem: '观备注', label: '八、观测数据及测量结果记录', children: tail观测})}
            {MeasureAllowTest({orc, rep, config: config主技术, tag: 'MainTechnical', mem: '主技备注', fixed: ["4.1%", "16%", "9%", "6%", "%", "19%", "9%", "10%", "9%", "11%", "10%"], label: '附录A K7.5 主要技术参数测试', children: tail主技})}
            <StrainStressVw orc={orc} rep={rep} sensit label={'附录B K7.6应力测试记录'}/>
            <AccelerationVw orc={orc} rep={rep} stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>
            {常用现场条件({orc, rep, config: tItems现场, dcln: 5, label: '附录D：现场检验条件确认'})}
        </div>
    </>
}
