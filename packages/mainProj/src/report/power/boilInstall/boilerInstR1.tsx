"use client"
import * as React from "react"
import {useSearchParams} from "next/navigation"
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {RepLink, ReportViewProps, RepTitleUpdate} from "@/report/common/base"
import { 落款单位地址 } from "@/report/common/rarelyVary"
import type { Column_Setting } from "@/report/common/useFormatOmni"
import { useOfficialOmni } from "@/report/common/useOfficialOmni"
import { UnqualifiedIspTable } from "@/report/common/general"
import { useItemsMapOmni } from "@/report/common/omni"
import { 检验核准WaterJj, 注意事项WaterJj } from "@/report/recreation/waterJj/rarelyVary"
// import { RepDeviceDetail } from "./repView"
// import { setupItemAreaRoute } from "./orcIspConfig"
// import { FormatOriginal } from "./FormatOriginal"
import {首页概况recr} from "@/report/recreation/slidingJj/rarelyVary";
import {ReportFirstPageHeadJd} from "@/report/common/head";
import {createPdfJob} from "@/report/footer/job";
import {RepFootLink} from "@/report/common/repFootLink";
import {RepHeadLink} from "@/report/common/repHeadLink";
import {JumpTab} from "@/report/common/JumpTab";
import {RepDeviceDetail} from "@/report/recreation/slidingJj/repView";
import {useItemsMapPressure} from "@/report/common/pressure";
import {DirectoryPagePress} from "@/report/common/directory";
import {ExplanatoryVw} from "@/report/power/boilInstall/Explanatory";


export const ReportView = ({ rep }: any) => {
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const { storage } = useStorage()
    const Component = OfficialReport
    const pdf_job = createPdfJob(rep, original);
    return (
        <>
            <div id="PHEAD" />
            <RepHeadLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep} />
            <RepTitleUpdate code={storage?.eqpcod} original={original} />
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
const config报告: Column_Setting[] = [
    {n: "", x: "检验结果"},
    {n: null, x: "结论"},
    {n: "M", x: "备注", m: true},
]
/*有些内容放页眉页脚：<span>报告编号：{rep.isp.no}</span>页号安排放入页眉页脚。
* */
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({source: orc, rep}) => {
    const [mapFxian]=useItemsMapPressure({ projects:orc.Projects });
    return (
        <React.Fragment>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadJd({rep, mbbm: "FJB/YB-1002-1-2024"})}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                          <h1 className="text-3xl text-center print:mt-6">电站锅炉安装监检报告</h1>
                        </JumpTab>
                        {首页概况recr(orc,rep,)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {注意事项WaterJj({ rep,
                  comply: "依据《大型游乐设施安全技术规程》（TSG 71-2023）制定，适用于大型游乐设施监督检验",
                })}

                {mapFxian.get('目录')?.do && <DirectoryPagePress orc={orc} rep={rep}/>}
                <div className="h-[13.8rem]">dfgfdcxvxc</div>




                {mapFxian.get('检验过程概述')?.do &&
                    <ExplanatoryVw orc={orc} rep={rep} title='1.3锅炉安装施工过程概述' />
                }
                <h2 className="text-xl text-center mt-4 print:mt-0 print:break-before-page">
                    电站锅炉安装监检报告
                </h2>
                {RepDeviceDetail({orc, rep})}
                {检验核准WaterJj({orc, rep})}
                <PrintReserveLeast reserve="13rem"
                       title={<h2 className="text-xl text-center mt-4 print:mt-24">
                           大型游乐设施监督检验报告附页
                       </h2>}
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
                    </FlexibleTable>
                </PrintReserveLeast>
            </div>
            <div className="print:hidden">
                <RepLink ori rep={rep} tag={'ProjectList'}>
                    <div>目录列表编辑器</div>
                </RepLink>
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

//【表格工具】  JSON.parse(orc?._tblFixed??'[]')  ; 编辑器3段式窗口总宽度1595px；
