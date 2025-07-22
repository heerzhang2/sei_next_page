import * as React from "react";
import {FlexibleTable, TableBody, TableCell, TableRow, CCell, TableHeader} from "@/components/flexible-table";
import {RepLink} from "@/report/common/base";
import {JumpTab} from "@/report/common/JumpTab";

interface InspectionApprovalProps {
    orc: any
    rep: any
    suffix?: boolean
    nApxc?: boolean     //没有附页附图列的：
}
/**允许目录内容可超过1张纸张的
 * 目录页VS
 * */
export const DirectoryPagePress= ({ orc, rep, suffix,nApxc }:InspectionApprovalProps) => {
    const fixedCw=nApxc? ["9%", "%", "18%"] : ["7%", "%", "11%", "18%"]
    let muluSn=1;       //目录显示项目序号
    //<div className="relative h-full print:h-[calc(100vh-3rem)] flex flex-col justify-center print:mb-10">  print:mt-auto
    return (
        <div id='ProjectList' className="w-full print:break-before-page print:min-h-screen flex flex-col justify-evenly">
            <RepLink rep={rep} tag={'Entrance'}>
                <h2 className="text-xl text-center mt-4">目 录</h2>
            </RepLink>
            <div className="w-full">
                <div className="flex justify-end">
                    <span className="text-sm mr-4 text-right md:text-right">报告编号：{rep.isp.no}</span>
                </div>
                <FlexibleTable className="text-sm w-full border-collapse" columnWidths={fixedCw}>
                    <TableHeader>
                        <RepLink rep={rep} ori tag="ALL">
                            <TableRow>
                                <CCell className="text-xs leading-[1] p-0">序号</CCell>
                                <CCell>项目</CCell>
                                <CCell>页号</CCell>
                                {!nApxc && <CCell><span className="text-sm">附页、附图</span></CCell>}
                            </TableRow>
                        </RepLink>
                    </TableHeader>
                    <TableBody>
                        {orc?.Projects?.map((prj: any, i: number) => {
                            if(prj?.na || prj?.om)   return null;       //na:表示不在目录中显示的分项目分页。 om：只在记录显示；
                            if(prj?.zs || prj?.dd) return null;       //特性表跟着zs证书走到前面去的，不用显示在目录；dd表示用户自定义项目不显示在目录中
                            return prj?.do && (
                                <JumpTab key={i} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList?from=${i}#ProjectList`}>
                                    <TableRow>
                                        <CCell className="text-sm">{muluSn++}</CCell>
                                        <TableCell className="text-sm border border-gray-700">{prj?.ml ? prj?.ml : suffix? (prj?.name + '报告') : prj?.name}</TableCell>
                                        <CCell className="text-sm">{prj?.page}</CCell>
                                        {!nApxc && <CCell className="text-sm">{prj?.apx??'／'}</CCell>}
                                    </TableRow>
                                </JumpTab>
                            );
                        })
                        }
                        { !(orc?.Projects?.length>0) &&
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ProjectList#ProjectList`}>
                                <TableRow>
                                    <CCell colSpan={nApxc? 3:4}>还未初始化！<br/>空目录表</CCell>
                                </TableRow>
                            </JumpTab>
                        }
                    </TableBody>
                </FlexibleTable>
            </div>
        </div>
    )
}
