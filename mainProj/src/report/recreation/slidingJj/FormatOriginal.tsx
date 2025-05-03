"use client"
import * as React from "react";
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow,TableCell} from "@/components/flexible-table";
import {RepLink, ReportViewProps,} from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import queryString from "query-string";
import {config观测数据, config观测数据2, config设备概况, tail观测} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {设备概况页} from "../../park/views";
import {常用现场条件} from "../../park/viewX";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {UnqualifiedIspTable} from "../../common/general";
import {InstrumentVw, 测量允许检测, 测量备注两半, } from "../waterJj/repView";
import {config主技术, tail主技} from "./MainTechnical";
import {填写须知} from "../../escalator/rarelyVary";
import {StrainStressVw} from "../waterJj/StrainStress";
import {AccelerationVw} from "../waterJj/Acceleration";
import {DirectLink} from "@/routing/Link";
import {Table} from "@/components/ui/table";
import {首页概况WaterJj} from "@/report/recreation/waterJj/rarelyVary";
import {填写须知recr} from "@/report/recreation/slidingJj/rarelyVary";
import {undefined} from "zod";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import PageSectionOrientation from "@/components/page-section-orientation";


export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'M',x:'备注',t:'B',m:true},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    source: orc, rep,
}) => {
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc});
    }, [rep,orc?._Oitems]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:true,dfsz:'0.75',ltsz:'0.75',qtsz:'0.75'});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
  return (
    <React.Fragment>
        <div className="mt-4 mb-4 print:mt-0 print:mb-0">
            <div className="print:h-screen print:break-after-page flex flex-col justify-evenly">
                <div>
                    <div className="mx-auto md:m-2 text-right md:flex md:justify-end md:flex-wrap">
                        <span className="underline">FJJ/YB-1009-1-2024</span>
                    </div>
                    <h1 className="text-center mt-8 text-3xl md:print:text-5xl">
                      大型游乐设施监督检验原始记录
                    </h1>
                    <span className="block text-center text-xl mt-4">（适用于系留式观光气球）</span>
                </div>
                <div>
                    {首页概况WaterJj(orc,rep,true)}
                </div>
                <div className="text-center ">
                    <span className="text-center text-2xl">福建省特种设备检验研究院编制</span>
                </div>
            </div>
            {填写须知recr}
            <InstrumentVw orc={orc} rep={rep} label={'一、主要测量设备性能检查'}/>
            {设备概况页({label:'二、设备概况', orc, rep, config: config设备概况, fixed: ["5%", "13.5%", "32%", "8%", "9%", "%"] })}
            <PageSectionOrientation orientation="landscape">
                <RepLink rep={rep} ori tag="ALL">
                    <h2 className={`text-2xl`}>三、检验记录</h2>
                </RepLink>
                <FlexibleTable columnWidths={ ["2%", "3.8%", "4.3%", "4.3%", "1%", "7%", "%","4.5%", "4.3%","4.1%","9.1%"] }>
                    <TableHeader>
                        <RepLink rep={rep} ori tag="ALL">
                            <TableRow>
                                <CCell className="print:whitespace-nowrap"><span className="text-xs">序号</span></CCell>
                                <CCell colSpan={5}>检验项目</CCell>
                                <CCell>检验内容和要求</CCell>
                                <CCell><span className="text-[0.7rem]">检验结果</span></CCell>
                                <CCell>结论</CCell>
                                <CCell>备注</CCell>
                                <CCell><span className="text-[0.7rem]">存在问题描述</span></CCell>
                            </TableRow>
                        </RepLink>
                    </TableHeader>
                    <TableBody>
                        {renderIspContent}
                    </TableBody>
                </FlexibleTable>
                <span id={'_See_Memo1'} className="text-sm">注：※为重要项，其它为一般项。</span>
            </PageSectionOrientation>

            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} titles={['序号','项目编号','不合格内容描述','复检结果','复检日期']}
                    label={<h2 className="text-left">四、检测不合格记录及复检结果</h2>}
            />
 {/*
            <h4 className="mt-4 print:mt-0 print:break-before-all">五、现场检验意见</h4>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
                <h1 className={`text-center ${orc?.检验结论?.length > 12 ? 'text-2xl' : 'text-4xl'} `}>
                    {orc?.检验结论}
                </h1>
            </DirectLink>
            <FlexibleTable columnWidths={["15%", "%", "15%", "20%"]}>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
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
                    </DirectLink>
                </TableBody>
            </FlexibleTable>
            <span>注：特殊情况，应在备注中说明检验员所负责检验的项目编号。</span>
            <h4 className="mt-4">六、备注</h4>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><TableCell>
                       <div className="min-h-4 whitespace-pre-wrap">{orc.大备注 ?? '／'}</div>
                    </TableCell></TableRow>
                </RepLink>
            </TableBody></Table>
            <span className="text-[0.75rem]">注：本备注的内容在报告中体现。</span>
            <h4 className="mt-4">七、记事</h4>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><TableCell>
                        <div className="min-h-4 whitespace-pre-wrap">{orc.资料编号 || '／'}</div>
                    </TableCell></TableRow>
                </RepLink>
            </TableBody></Table>

            {测量备注两半({orc, rep, config:config观测数据(orc),config2:config观测数据2,mem:'观备注',label:'八、观测数据及测量结果记录',children:tail观测})}
            {测量允许检测({orc, rep, config:config主技术,tag:'MainTechnical',mem:'主技备注',label:'附录A K7.5 主要技术参数测试',children:tail主技})}
            <StrainStressVw orc={orc} rep={rep} sensit label={'附录B K7.6应力测试记录'}/>
            <AccelerationVw orc={orc} rep={rep}  stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>
            {常用现场条件({orc, rep, config: tItems现场,dcln:5,label:'附录D：现场检验条件确认'})}*/}
        </div>
    </React.Fragment>
  );
}

//text-[0.7rem] print: