"use client"
import * as React from "react"
import Link from "next/link"
import {useSearchParams} from "next/navigation"
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useStorage} from "@/report/StorageContext";
import {OriginalDataMutation, ReportViewProps, RepTitleUpdate} from "@/report/common/base"
import { RepFootLink, 落款单位地址 } from "@/report/common/rarelyVary"
import type { Column_Setting } from "@/report/common/useFormatOmni"
import { useOfficialOmni } from "@/report/common/useOfficialOmni"
import { UnqualifiedIspTable } from "@/report/common/general"
import { useItemsMapOmni } from "@/report/common/omni"
// import { ReportFirstPageHeadJd } from "@/report/park/rarelyVary"
import { 检验核准WaterJj, 注意事项WaterJj, 首页概况WaterJj } from "@/report/recreation/waterJj/rarelyVary"
import { RepDeviceDetail } from "./repView"
import { setupItemAreaRoute } from "./orcIspConfig"
import { FormatOriginal } from "./FormatOriginal"
import {首页概况recr} from "@/report/recreation/slidingJj/rarelyVary";
import {DirectLink} from "@/routing/Link";
import {useFieldArray, useForm} from "react-hook-form";
import type {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@urql/next";
import {toast} from "sonner";
import {Button, CardFooter, Form} from "@/components/ui";
import {ReportFirstPageHeadJd} from "@/report/common/head";
import {ConfigRoot, FileTransform} from "page2pdf_server/src";
import {usePrintPdf} from "@/hooks/usePrintPdf";

export const ReportView = ({ rep }: any) => {
    const searchParams = useSearchParams()
    const original = "1"===searchParams!.get("original")
    const {storage, } =useStorage();
    const Component = original ? FormatOriginal : OfficialReport
    const urlPrn=`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/?print=1`+(original? "&original=1" : "");
    //组装正式报告：可能有多个子报告和目录及封面的，拼装一份pdf;       【全部展开显示的报告】?print=1
    function newJob() {
        const url = `${process.env.NEXT_PUBLIC_APP_WEB}` + urlPrn;
        //报告No:',
        //                     notext,      <span id=\"titlespan\" class=title>
        const job = {
            name: (original ? "记录" : "报告") + rep?.isp?.no,
            singleTab: true,
            lay: {
                head: [
                    '<div style=\\"position: relative; width:100%; text-align:center; border-bottom: 1pt solid #eeeeee; margin: 3.5mm 0px 10px; font-size: 10pt\\">',
                    `<div style=\\"position: absolute; width:100%; text-align:left; bottom: 5px; left: 50px;\\">报告No: ${rep?.isp?.no}</div></div>`
                ],
                foot: [
                    '<div style=\\"position: relative; width: 100%; text-align: left; border-top: 1pt solid #eeeeee; margin:  10px 0px 1.5mm; font-size: 8pt;\\">',
                    '<div style=\\"position: absolute; width: 100%; text-align: center; top: 5px;\\">共<span>~pageNumber~</span>页 / 第<span>~totalPages~</span>页</div></div>'
                ],
            },
            files: [
                {
                    url,
                    out: `tmp-${rep?.isp?.no}` + (original ? "-O" : ""),
                    headFrom: 3,
                    frNo: 3,
                },
            ],
        } as ConfigRoot<FileTransform>;
        return job;
    }

    const [handleSubmit] = usePrintPdf(newJob);
    const toPDF = () => {
        handleSubmit!();
    }
    return <>
        <div id='PHEAD'/>
        <RepTitleUpdate code={storage?.eqpcod} original={original}/>
        <Component source={storage} rep={rep}/>
        {RepFootLink({rep, template: rep?.modeltype, verId:rep?.modelversion, repId: rep?.id,toPDF})}
        <div id='PTAIL'/>
    </>
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
                        <h1 className="text-3xl text-center print:mt-6">
                            滑行车类游乐设施监督检验报告
                        </h1>
                        {首页概况recr(orc,rep,)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                <DirectLink href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`} className="no-underline hover:underline">
                    <div>
                        {注意事项WaterJj({
                            rep,
                            comply: "依据《大型游乐设施安全技术规程》（TSG 71-2023）制定，适用于大型游乐设施监督检验",
                        })}
                    </div>
                </DirectLink>
                <h4 className="text-xl text-center mt-4 print:mt-0 print:break-before-page">
                    <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Instrument`}
                          className="print:no-underline">
                        大型游乐设施监督检验报告
                    </Link>
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
            <div>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Instrument?original=1#Instrument`}>
                    <h3 id='Instrument' className="print:hidden">主要测量设备性能检查</h3>
                </Link>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Witness#Witness`}>
                    <h3 id="Witness" className="print:hidden">记事 、 备注</h3>
                </Link>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SiteCondition#SiteCondition`}>
                    <h3 id="SiteCondition" className="print:hidden">附录：现场检验条件确认</h3>
                </Link>
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
//5.1?make=1#5.1       {title: "K5乘载系统检验  K5.1", url: "#T5-1"},
//#5.1 #51 #5-1都会在document.querySelector(item.url)?.scrollIntoView({报错的。  const friendlyId = originalId.replace(/\./g, '-');
//表头不能加上<DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}> 传递各列宽度？