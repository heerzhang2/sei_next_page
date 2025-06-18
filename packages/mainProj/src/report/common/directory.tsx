import * as React from "react";
import Link from "next/link"
import {FlexibleTable, TableBody, TableCell, TableRow,CCell} from "@/components/flexible-table";
import {AttentionPoint} from "../../common/rarelyVary";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import SurveyRow from "@/component/SurveyRow";
import {businessCatspMap} from "@/common/sei";
import {RepLink} from "@/report/common/base";
import {JumpTab} from "@/report/common/JumpTab";

interface InspectionApprovalProps {
    orc: any
    rep: any
    suffix?: boolean
}
export const DirectoryPagePress= ({ orc, rep, suffix }:InspectionApprovalProps) => {
    let muluSn=1;       //目录显示项目序号
    return (
        <div id='ProjectList' className="w-full print:break-before-page">
            <RepLink rep={rep} tag={'Entrance'}>
                <h2 className="text-center">目录</h2>
            </RepLink>
            <div className="relative h-[calc(100vh-3rem)] flex flex-col justify-center print:mb-10">
                {/* 页眉部分 */}
                <div className="flex justify-end print:hidden">
                    <span className="text-right md:text-right">报告编号：{rep.isp.no}</span>
                </div>

                {/* 打印内容主体 */}
                <div className="w-full print:mt-auto">
                    <FlexibleTable className="text-sm w-full border-collapse" columnWidths={["7%", "%", "11%", "18%"]}>
                        <TableBody>
                            {orc?.Projects?.map((prj: any, i: number) => {
                                if(prj?.na || prj?.om)   return null;       //na:表示不在目录中显示的分项目分页。 om：只在记录显示；
                                if(prj?.zs || prj?.dd) return null;       //特性表跟着zs证书走到前面去的，不用显示在目录；dd表示用户自定义项目不显示在目录中
                                return prj?.do && (
                                    <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList?from=${i}#ProjectList`}>
                                        <TableRow>
                                            <CCell>{muluSn++}</CCell>
                                            <TableCell>{prj?.ml ? prj?.ml : suffix? (prj?.name + '报告') : prj?.name}</TableCell>
                                            <CCell>{prj?.page}</CCell>
                                            <CCell>{prj?.apx??'／'}</CCell>
                                        </TableRow>
                                    </JumpTab>
                                );
                            })
                            }
                            { !(orc?.Projects?.length>0) &&
                                <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}>
                                    <TableRow>
                                        <CCell colSpan={4}>还未初始化！<br/>空目录表</CCell>
                                    </TableRow>
                                </JumpTab>
                            }

                            <TableRow>
                                <CCell>审核</CCell>
                                <CCell colSpan={2}></CCell>
                                <CCell className="text-xs">日期</CCell>
                                <CCell></CCell>
                            </TableRow>
                            <TableRow>
                                <CCell>批准</CCell>
                                <CCell colSpan={2}></CCell>
                                <CCell className="text-xs">日期</CCell>
                                <CCell></CCell>
                            </TableRow>

                        </TableBody>
                    </FlexibleTable>
                </div>
            </div>

        </div>
    )
}
