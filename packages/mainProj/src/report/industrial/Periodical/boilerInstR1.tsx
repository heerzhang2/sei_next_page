"use client"
import * as React from "react"
import {useSearchParams} from "next/navigation"
import {useStorage} from "@/report/StorageContext";
import {RepLink, ReportViewFxProps, RepTitleUpdate} from "@/report/common/base"
import { 落款单位地址 } from "@/report/common/rarelyVary"
import { 检验核准WaterJj } from "@/report/recreation/waterJj/rarelyVary"
import {ReportFirstPageHeadNmaNmbm} from "@/report/common/head";
import {createPdfJob} from "@/report/footer/job";
import {RepFootLink} from "@/report/common/repFootLink";
import {RepHeadLink} from "@/report/common/repHeadLink";
import {JumpTab} from "@/report/common/JumpTab";
import {useItemsMapPressure} from "@/report/common/pressure";
import {DirectoryPagePress} from "@/report/common/directory";
import {ExplanatoryVw} from "@/report/power/boilInstall/Explanatory";
import {CertificatePage} from "@/report/power/boilInstall/CertificatePage";
import {BoilerDiagramVw} from "@/report/power/boilInstall/BoilerDiagram";
import {注意事项GasC} from "@/report/gas/rarelyVary";
import {首页设备概况BoilI} from "@/report/power/boilInstall/rarelyVary";
import {ConclusionVw} from "@/report/industrial/Periodical/Conclusion";
import {ThickMsVw} from "@/report/industrial/Periodical/ThickMs";
import SubRep, {SingeSubRep} from "@/component/rep/sub-rep";

/**原始记录 模板缺失，可能是*.doc补充的附件。
* */
export const ReportView = ({ rep }: any) => {
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const { storage } = useStorage()
    const Component = OfficialReport
    const [mapFxian]=useItemsMapPressure({projects: storage.Projects});
    //若目录页的页号不计算的：需要判别mapFxian.get('目录')?.do来剔除； #且满足目录页预计只打印一张纸；干脆用户录入?
    const pdf_job = createPdfJob(rep, original,4);
    const subrid = searchParams!.get("subrid")
    if(subrid) return (
        <>
            <div id="PHEAD" />
            <RepHeadLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep} single/>
            <RepTitleUpdate code={storage?.eqpcod} original={original} />
            <Component source={storage} rep={rep} mapFxian={mapFxian} subrid={subrid}/>
            <RepFootLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep}
                         pdf_job={pdf_job} single/>
            <div id="PTAIL" />
        </>
    )
    return (
        <>
            <div id="PHEAD" />
            <RepHeadLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep} single/>
            <RepTitleUpdate code={storage?.eqpcod} original={original} />
            <Component source={storage} rep={rep} mapFxian={mapFxian}/>
            <RepFootLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep}
                         pdf_job={pdf_job} single/>
            <div id="PTAIL" />
        </>
    )
}

const OfficialReport: React.FunctionComponent<ReportViewFxProps> = ({source: orc, rep,subrid,mapFxian}) => {
    const { subrType } = useStorage()
    if(subrType){
      return (
        <SingeSubRep rep={rep}>
          {subrType==='THICK_MS' && <ThickMsVw orc={orc} rep={rep} subrid={subrid}/>}
        </SingeSubRep>
        )
    }
    return (
        <>
            <div className="not-print:my-4">
                <CertificatePage orc={orc} rep={rep}/>

                <div className="print:h-screen">
                    {ReportFirstPageHeadNmaNmbm({rep })}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <div>
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                              <h1 className="text-3xl text-center print:mt-6">电站锅炉安装监检报告</h1>
                            </JumpTab>
                            <span className="block text-center text-sm print:mt-4"> （ FJB/GB 10082-0-2021 ）</span>
                        </div>
                        {首页设备概况BoilI(orc,rep,)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {注意事项GasC({rep,
                    comply: '书为依据《锅炉安全技术规程》制定，适用于电站锅炉安装监督检验的结论报告'
                })}
                {mapFxian.get('目录')?.do && <DirectoryPagePress orc={orc} rep={rep}/>}

                <ConclusionVw orc={orc} rep={rep} subrid={subrid!}/>
                {检验核准WaterJj({orc, rep, jyt:'编制'})}

                {mapFxian.get('锅炉简图')?.do && <BoilerDiagramVw orc={orc} rep={rep}/>}
                {mapFxian.get('检验过程概述')?.do &&
                    <ExplanatoryVw orc={orc} rep={rep} title='1.3锅炉安装施工过程概述' />
                }
                {/*多个部分的多个子报告+主报告也可能存储的*/}

                {mapFxian.get('壁厚测定')?.do && <SubRep modType="THICK_MS" rep={rep}>
                    <ThickMsVw orc={orc} rep={rep} />
                </SubRep>}

            </div>
            <div className="print:hidden">
                <RepLink ori rep={rep} tag={'ProjectList'}>
                    <div>目录列表编辑器</div>
                </RepLink>
            </div>
        </>
    )
}

//原始记录的导航该放在后面：
export function useCatalog(mod: string) {
    const {storage} = useStorage()
    const [mapFxian]=useItemsMapPressure({projects: storage.Projects});
    const head=[{title: "页面头部", url: "#PHEAD"},
        {title: "页面尾巴", url: "#PTAIL"}]
    const dirs = React.useMemo(() => {
        if(mod==='THICK_MS') return [...head,
            {title: "1.1锅炉安装监督检验结论报告", url: "#Conclusion"},
            {title: "1.2锅炉结构简图", url: "#BoilerDiagram"},
            {title: '1.3锅炉安装施工及监督检验过程概述', url: "#Explanatory"},
        ]
        return [...head,
            {title: "检验证书", url: "#Certificate"},
            {title: "目录", url: "#ProjectList"},
            {title: "设备概况", url: "#Survey"},
            {title: "1.1锅炉安装监督检验结论报告", url: "#Conclusion"},
            {title: "1.2锅炉结构简图", url: "#BoilerDiagram"},
            {title: '1.3锅炉安装施工及监督检验过程概述', url: "#Explanatory"},
        ]
    }, [mod,storage])
    return dirs
}
