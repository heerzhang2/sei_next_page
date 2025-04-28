"use client"
import { usePathname,useSearchParams,useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"
import type { ReportViewProps } from "../../common/base"
import { 末尾链接, 落款单位地址 } from "../../common/rarelyVary"
import { 报告设备详情 } from "./repView"
import { setupItemAreaRoute } from "./orcIspConfig"
import { FormatOriginal } from "./FormatOriginal"
import type { Column_Setting } from "../../common/useFormatOmni"
import { useOfficialOmni } from "../../common/useOfficialOmni"
import { ReportFirstPageHeadJd } from "../../park/rarelyVary"
import { UnqualifiedIspTable } from "../../common/general"
import { useItemsMapOmni } from "../../common/omni"
import { 检验核准WaterJj, 注意事项WaterJj, 首页概况WaterJj } from "../waterJj/rarelyVary"
import Link from "next/link"
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow} from "@/components/flexible-table";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {useCreateQueryString} from "@/hooks/useCreateQueryString";
import {Button} from "@/components/ui";
import {useStorage} from "@/report/StorageContext";

export const ReportView = ({ rep }: any) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const original = "1"===searchParams!.get("original")
    const createQueryString = useCreateQueryString()
    const {storage, } =useStorage();
    const Component = original ? FormatOriginal : OfficialReport
    return (
        <>
            <Component source={storage} rep={rep} />
            <div className="m-2 print:hidden">
                <Button
                    variant="outline"
                    onClick={() =>{
                        router.push(pathname + '?' + createQueryString('original', original ? '' : "1"))
                    } }
                >
                    {original ? "正式报告" : "格式化版原始记录"}
                </Button>
            </div>
        </>
    )
}

const 检验结果替换 = (orc: { [x: string]: any }) => {
    const out = { ...orc }
    // if(undefined!==orc?.绝缘阻o)  out.绝缘阻检=<div>电阻值{floatInterception(orc?.绝缘阻o,1)}MΩ</div>;
    return out
}
const config报告: Column_Setting[] = [
    { n: "", x: "检验结果" },
    { n: null, x: "结论" },
    { n: "M", x: "备注", m: true },
]

const OfficialReport: React.FunctionComponent<ReportViewProps> = ({ source: orc, rep }) => {
    const searchParams = useSearchParams()
    const [printing, setPrinting] = useState(false)
    useEffect(() => {
        const printing = searchParams.get("print")
        setPrinting(!!printing)
    }, [searchParams])
    const impressionismAs = React.useMemo(() => {
        return setupItemAreaRoute({ rep, orc })
    }, [rep, orc?._Oitems])
    const { renderIspContent } = useOfficialOmni({
        orc,
        ItemArs: impressionismAs?.Item,
        rep,
        config: config报告,
        itResCB: 检验结果替换,
    })
    const [mapNoTag] = useItemsMapOmni({ ItemArs: impressionismAs?.Item, notCheckNo: false })
    return (
        <React.Fragment>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadJd({rep, mbbm: "FJJ/YB-1009-1-2024"})}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <h1 id={"Conclusion"} className="text-3xl text-center print:mt-6">
                            滑行车类游乐设施监督检验报告
                        </h1>
                        {首页概况WaterJj(orc,rep,)}
                        <div
                            className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址}</div>
                    </div>
                </div>
                {注意事项WaterJj({
                    rep,
                    comply: "依据《大型游乐设施安全技术规程》（TSG 71-2023）制定，适用于大型游乐设施监督检验",
                })}

                <div className="flex flex-col justify-center">
                    <h4 className="text-xl text-center print:break-before-page">
                        <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Instrument`}
                              className="print:no-underline break-before-page">
                            大型游乐设施监督检验报告
                        </Link>
                    </h4>
                </div>
                <div className="flex justify-between">
                    <span></span>
                    <span>报告编号：{rep.isp.no}</span>
                </div>
                {报告设备详情({orc, rep})}
                {检验核准WaterJj({orc, rep})}
                <PrintReserveLeast reserve="13.3rem"
                      title={<><h4 className="text-center mt-4 print:mt-24">
                              大型游乐设施监督检验报告附页
                          </h4>
                              <div className="flex justify-between">
                                  <span></span>
                                  <span>报告编号：{rep.isp.no}</span>
                              </div>
                          </>}
                >
                    <FlexibleTable className="border-collapse"
                                   columnWidths={["3.5%", "6.4%", "8.3%", "5.3%", "5%", "%", "12.6%", "6.2%", "9.8%"]}>
                        <TableHeader>
                            <TableRow className={"text-sm"}>
                                <CCell id={"T5-1"}>
                                    <span className="text-[0.7rem]">序号</span>
                                </CCell>
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

                <span className="print:text-[0.75rem]"></span>
                <UnqualifiedIspTable
                    rep={rep}
                    orc={orc}
                    mapNoTag={mapNoTag}
                    printing={printing}
                    titles={["序号", "项目编号", "检验不符合内容记录", "复检结果", "复检日期"]}
                    label={<h4>检验不符合项目内容及复检结果</h4>}
                />
            </div>
            <div>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Instrument?original=1#Instrument`}>
                    <h4 className="print:hidden">
                        主要测量设备性能检查
                    </h4>
                </Link>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Witness#Witness`}>
                    <h4  className="print:hidden">
                        记事 、 备注
                    </h4>
                </Link>
                <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/SiteCondition#SiteCondition`}>
                    <h4 id={"SiteCondition"}  className="print:hidden">
                        附录：现场检验条件确认
                    </h4>
                </Link>
            </div>
            {末尾链接({rep, template: rep?.modeltype, verId:rep?.modelversion, repId: rep?.id})}
        </React.Fragment>
    )
}


export const contentItems = [
    {title: "设备概况", url: "#Survey"},
    {title: "结论概要的页", url: "#Conclusion"},
    {title: "K1资料审查", url: "#T1-1"},
    {title: "电气及控制系统", url: "#T4-1"},
    {title: "K5乘载系统检验  K5.1", url: "#T5-1"},
    {title: "K7载荷试验", url: "#T7-1"},
    {title: "系留式观光气球专项", url: "#T13-6"},
    {title: "附录：现场检验条件确认", url: "#SiteCondition"},
    {title: "K7载荷4试验", url: "#T7-4"},
    {title: "系留式观光气球4专项", url: "#T13-4"},
    {title: "K7载荷42试验", url: "#T7-42"},
    {title: "系留式观光气球42专项", url: "#T13-42"},
    {title: "K7载荷43试验", url: "#T7-43"},
    {title: "--系留式观光气球43专项", url: "#T13-43"},
]

//5.1?make=1#5.1
//#5.1 #51 #5-1都会报错的。 const friendlyId = originalId.replace(/\./g, '-');
//表头不能加上<DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}> 传递各列宽度？