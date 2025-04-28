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


export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'M',x:'备注',t:'B',m:true},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc});
    }, [rep,orc?._Oitems]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:true,dfsz:'0.75',ltsz:'0.75',qtsz:'0.75'});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
  return (
    <React.Fragment>
        <div className="mt-4 mb-4 print:mt-0 print:mb-0 text-center md:flex md:justify-between md:flex-wrap print:min-w-[538px]:flex print:min-w-[538px]:justify-between print:min-w-[538px]:flex-wrap">
            <div className="mx-auto md:m-2 print:min-w-[538px]:m-2">
                <h5 className="underline">FJJ/YB-1009-1-2024</h5>
            </div>
            <h3 className="text-center md:print:text-4xl mt-8">
              大型游乐设施监督检验原始记录
            </h3>
            <h5 className="text-center">（适用于系留式观光气球）</h5>
            <div className="print:h-16"/>
            <div className="print:min-h-full">
                { 首页设备概况Cr( {orc, original:true, } ) }
            </div>
            <div className="print:h-20"/>
            <div className="text-center print:break-after-always print:break-inside-avoid">
                <h4 className="text-center">福建省特种设备检验研究院编制</h4>
            </div>
            {填写须知}
            <InstrumentVw orc={orc} rep={rep} label={'一、主要测量设备性能检查'}/>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey`}>
                <h4 className="mt-4">二、设备概况</h4>
            </DirectLink>
            {设备概况页({orc, rep, config: config设备概况, fixed: ["5%", "13.5%", "32%", "8%", "9%", "%"] })}
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <h4 className="mt-4">三、检验记录</h4>
            </DirectLink>
 {/*           <FlexibleTable columnWidths={ ["2%", "3.8%", "4.3%", "4.3%", "1%", "7%", "%","4.5%", "4.3%","4.1%","9.1%"] }>
                <TableHeader>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><span className="text-[0.7rem]">序号</span></CCell>
                            <CCell colSpan={5}>检验项目</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell><span className="text-[0.7rem]">检验结果</span></CCell>
                            <CCell>结论</CCell>
                            <CCell>备注</CCell>
                            <CCell><span className="text-[0.75rem]">存在问题描述</span></CCell>
                        </TableRow>
                    </DirectLink>
                </TableHeader>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </FlexibleTable>
            <span id={'_See_Memo1'} className="print:text-[0.75rem]">
                注： 以下为项目为Ⅰ类监督检验项目：K1.1※、K1.2（2）※（3）、K1.5、K1.8※、K1.9※；其余项目均为Ⅱ类监督检验项目。
            </span>
            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','不合格内容描述','复检结果','复检日期']}
                    label={<h4 className="text-left">四、检测不合格记录及复检结果</h4>}
            />
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
        {末尾链接({rep, template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
