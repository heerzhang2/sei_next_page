"use client"
import type React from "react"
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";
import {ReportFirstPageHeadCyCert} from "@/report/common/head";
import {JumpTab} from "@/report/common/JumpTab";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {config证书概要} from "@/report/power/boilInstall/orcBase";
import {RepLink} from "@/report/common/base";

interface CertificatePageProps {
    orc: any
    rep: any
    children?: React.ReactNode
}

export const CertificatePage = ({ orc, rep, children }: CertificatePageProps) => {
    const renderUpper=usePrefixDataTable({config: config证书概要, orc, rep, slash:true});
    const callback = () => {
        return (
            <div className="print:h-screen print:overflow-y-hidden">
                <ReportFirstPageHeadCyCert rep={rep} />
                <div className="print:flex print:flex-col print:justify-around print:h-[calc(100vh-3rem)]">
                    <h2 className="block text-center leading-[0.9] text-3xl font-normal">特种设备安装监督检验证书</h2>
                    <span className="text-center mb-0 block text-xl">（锅炉）</span>
                    <div>
                        <div className="flex justify-between">
                            &nbsp;
                            <span className="flex flex-row-reverse mr-8 text-base">证书编号：{rep.isp?.no}</span>
                        </div>
                        <FlexibleTable  columnWidths={["9.9%","6.8%","37%","12.1%","4%","%"]} className="text-sm border-collapse">
                            <TableBody>
                                <RepLink ori rep={rep} tag={'CertificateSummary'}>
                                    {renderUpper}
                                </RepLink>
                                <RepLink rep={rep} tag='CertMemo'>
                                    <TableRow>
                                        <TableCell colSpan={6} className="border border-gray-700">
                                            说明：<br/>
                                            <div className="min-h-[6rem] whitespace-pre-wrap mt-[0.2rem] p-[0.2rem] text-indent-[2rem] overflow-auto">
                                                {orc?.证书说明 || '／'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </RepLink>
                                <TableRow>
                                    <TableCell colSpan={6} className="border border-gray-700 border-collapse !p-0">
                                        <FlexibleTable className="border-none text-sm w-full h-full border-collapse" columnWidths={["24%", "41%", "7%", "%"]}>
                                            <TableBody>
                                                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Conclusion#Conclusion`}>
                                                    {(orc?.检验结论 === '符合要求' || orc?.检验结论 === '基本符合要求') && <TableRow className="border-none">
                                                        <TableCell className="text-indent-[2rem]" colSpan={4}>
                                                            按照《中华人民共和国特种设备安全法》、《特种设备安全监察条例》的规定，该锅炉的安装经我机构监督检验，
                                                            安全性能符合《锅炉安全技术规程》的要求，特发此证书。
                                                        </TableCell>
                                                    </TableRow>
                                                    }
                                                    <TableRow className="border-none">
                                                        <TableCell className="text-sm text-right">监 检：</TableCell>
                                                        <TableCell>
                                                            {orc.检验人IDs}
                                                        </TableCell>
                                                        <TableCell className="text-sm">日期：</TableCell>
                                                        <TableCell className="h-12">
                                                            {orc?.检验日期 ?? '／'}
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-none">
                                                        <TableCell className="text-sm text-right">审 核：</TableCell>
                                                        <TableCell>
                                                        </TableCell>
                                                        <TableCell className="text-sm">日期：</TableCell>
                                                        <TableCell className="h-10">
                                                            2025-06-19
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-none">
                                                        <TableCell className="text-sm text-right">批 准：</TableCell>
                                                        <TableCell>
                                                        </TableCell>
                                                        <TableCell className="text-sm">日期：</TableCell>
                                                        <TableCell className="h-10">
                                                            2025-06-19
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-none">
                                                        <TableCell className="text-sm text-right">监检机构：</TableCell>
                                                        <TableCell colSpan={2}>
                                                            {rep?.isp?.ispu?.name}
                                                        </TableCell>
                                                        <TableCell className="h-10">
                                                            （监督检验机构检验专用章）
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-none">
                                                        <TableCell className="text-sx text-right">监督检验机构核准证号：</TableCell>
                                                        <TableCell colSpan={2}>
                                                            {rep?.isp?.ispu?.agency?.apno}
                                                        </TableCell>
                                                        <TableCell className="h-10">
                                                            2025-06-19
                                                        </TableCell>
                                                    </TableRow>
                                                </JumpTab>
                                            </TableBody>
                                        </FlexibleTable>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </FlexibleTable>
                    </div>
                    <span className="text-xs">
                        注：本证书一式三份，一份监检机构存档，两份送施工单位，其中一份由施工单位随竣工资料交付使用（建设）单位。
                    </span>
                </div>
            </div>
        )
    }

    return (<>
        <div id="Certificate" />
        {callback()}
    </>)
}
