"use client"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useStorage } from "@/report/StorageContext"
import { RepLink, type ReportEntryProps, type ReportViewFxProps, RepTitleUpdate } from "@/report/common/base"
import { 落款单位地址 } from "@/report/common/rarelyVary"
import { 检验核准WaterJj } from "@/report/recreation/waterJj/rarelyVary"
import { ReportFirstPageHeadNmaNmbm } from "@/report/common/head"
import { createPdfJob } from "@/report/footer/job"
import { RepFootLink } from "@/report/common/repFootLink"
import { RepHeadLink } from "@/report/common/repHeadLink"
import { JumpTab } from "@/report/common/JumpTab"
import {caseMapFx, redoProjHash, subRepHash, useItemsMapPressure} from "@/report/common/pressure"
import { DirectoryPagePress } from "@/report/common/directory"
import { ExplanatoryVw } from "@/report/power/boilInstall/Explanatory"
import { CertificatePage } from "@/report/power/boilInstall/CertificatePage"
import { BoilerDiagramVw } from "@/report/power/boilInstall/BoilerDiagram"
import { 注意事项GasC } from "@/report/gas/rarelyVary"
import { 首页设备概况BoilI } from "@/report/power/boilInstall/rarelyVary"
import { ConclusionVw } from "@/report/industrial/Periodical/Conclusion"
import { cat_Thickms, ThickMsVw } from "@/report/cm/thickm/ThickMs1"
import SubRep, {SingeSubRep, SubReportConfig} from "@/component/rep/sub-rep"
import {cat_Magne, MagneticVw} from "@/report/cm/magnetic/Magnetic1"
import {PipelineCharacteristics} from "@/report/industrial/pipe-feature";
import {PipeLineDiagram} from "@/report/industrial/pipeline-diagram";
import {MacroscopicVw} from "@/report/industrial/Periodical/Macroscopic";
import {AccessoriesVw} from "@/report/industrial/Periodical/Accessories";
import {MaterialReviewVw} from "@/report/industrial/Periodical/MaterialReview";
import {ConcAppendixVw} from "@/report/industrial/Periodical/ConcAppendix";
import {注意事项IndPl, 首页设备IndPer} from "@/report/industrial/Periodical/rarelyVary";
import {cat_Sonic, UltrasoundVw} from "@/report/cm/sonic/Ultrasound1";
import {HydrostaticTestVw} from "@/report/industrial/Periodical/HydrostaticTest";
import {cat_Hard, HardnessVw} from "@/report/cm/hardness/Hardness1";
import {cat_Optc, OpticalVw} from "@/report/cm/optical/Optical1";
import {CsVerificationVw} from "@/report/cm/cpStrength/csVerification1";

//确保预定的渲染顺序: 这里不要用数字的key； 避免用整数键（或可转换为整数的字符串）;
export const SUBREP_CONFIG: Record<string, SubReportConfig> = {
    THICK_MS: {
        catKey: "壁厚测定",
        component: ThickMsVw,
        collapse: false,
        cat: cat_Thickms
    },
    MAGNT_TS: {
        catKey: "磁粉检测",
        component: MagneticVw,
        cat: cat_Magne
    },
    SONIC_TS: {
        catKey: "超声波检测",
        component: UltrasoundVw,
        //【不要复制这个】报错Encountered two children with the same key, `#MangInstrument_1`. Keys should be unique冲突的ID
        cat: cat_Sonic
    },
    HARD_TS: {
        catKey: "硬度检测",
        component: HardnessVw,
        cat: cat_Hard
    },
    OPTIC_TS: {
        catKey: "光谱检测",
        component: OpticalVw,
        cat: cat_Optc
    },
    CPSTR_VR: {
        catKey: "耐压强度校核",
        component: CsVerificationVw,
    },
}

/**原始记录 模板缺失，可能是*.doc补充的附件。
 * */
export const ReportView = ({ rep, printMode }: ReportEntryProps) => {
    const searchParams = useSearchParams()
    const original = "1" === searchParams!.get("original")
    const { storage, parrepfs } = useStorage()
    const Component = OfficialReport
    const [mapFxian] = useItemsMapPressure({ projects: storage.Projects })
    //若目录页的页号不计算的：需要判别mapFxian.get('目录')?.do来剔除； #且满足目录页预计只打印一张纸；干脆用户录入?
    const pdf_job = createPdfJob(rep, original, 4)
    const subrid = searchParams!.get("subrid")
    return (
        <>
            <div id="PHEAD" />
            {subrid ? (
                <>
                    <RepTitleUpdate code={parrepfs?.eqpcod + "子报告的"} />
                    <Component source={storage} rep={rep} mapFxian={mapFxian} subrid={subrid} printMode={printMode} />
                    <RepFootLink
                        template={rep?.modeltype}
                        verId={rep?.modelversion}
                        repId={rep?.id}
                        rep={rep}
                        pdf_job={pdf_job}
                        single
                        subrid={subrid}
                    />
                </>
            ) : (
                <>
                    <RepHeadLink template={rep?.modeltype} verId={rep?.modelversion} repId={rep?.id} rep={rep} single />
                    <RepTitleUpdate code={storage?.eqpcod} />
                    <Component source={storage} rep={rep} mapFxian={mapFxian} printMode={printMode} />
                    <RepFootLink
                        template={rep?.modeltype}
                        verId={rep?.modelversion}
                        repId={rep?.id}
                        rep={rep}
                        pdf_job={pdf_job}
                        single
                    />
                </>
            )}
            <div id="PTAIL" />
        </>
    )
}

const OfficialReport: React.FunctionComponent<ReportViewFxProps> = ({
                                                                        source: orc,
                                                                        rep,
                                                                        subrid,
                                                                        mapFxian,
                                                                        printMode,
                                                                    }) => {
    const { subrType } = useStorage()
    //单个子报告
    const renderSingleSubReport = () => {
        if (!subrType) return null
        const config = SUBREP_CONFIG[subrType]
        if (!config) {
            console.warn(`未找到 ${subrType} 的配置`)
            return null
        }
        const Component = config.component
        return (
            <SingeSubRep rep={rep} subrid={subrid!} title={config.title?? config.catKey}>
                <Component rep={rep} subrid={subrid} />
            </SingeSubRep>
        )
    }
    //渲染子报告
    const renderSub = (modType: keyof typeof SUBREP_CONFIG) => {
        const config=SUBREP_CONFIG[modType]
        if (!mapFxian.get(config.catKey)?.do) return null
        const Component = config.component
        return (
            <SubRep key={modType} modType={modType} rep={rep} title={config.title?? config.catKey} collapse={config.collapse}>
                <Component orc={orc} rep={rep} printMode={printMode} />
            </SubRep>
        )
    }
    //走独立流转分项报告模式的情况
    if (subrType) {
        return renderSingleSubReport()
    }
    return (
        <>
            <div className="not-print:my-4">
                <div className="print:h-screen">
                    {ReportFirstPageHeadNmaNmbm({ rep })}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <div>
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                                <h1 className="text-3xl text-center print:mt-6">工业管道定期检验报告</h1>
                            </JumpTab>
                            <span className="block text-center text-sm print:mt-4"> （ FJB/DC-1040-0-2018 ）</span>
                        </div>
                        {首页设备IndPer(orc, rep)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {注意事项IndPl({ rep,
                    comply: '书为依据《压力管道安全技术监察规程——工业管道》（TSG D0001-2009）、《压力管道定期检验规则——工业管道》（TSG D7005-2018）制定，适用于工业管道定期检验报告的结论报告，检验结论仅代表该设备在检验时的安全状况'
                })}
                <DirectoryPagePress orc={orc} rep={rep} nApxc suffix/>

                <ConclusionVw orc={orc} rep={rep}/>
                {检验核准WaterJj({ orc, rep, jyt: "编制" })}


                <ConcAppendixVw orc={orc} rep={rep}/>
                <MaterialReviewVw orc={orc} rep={rep}/>
                <MacroscopicVw orc={orc} rep={rep}/>
                {mapFxian.get('安全附件与仪表检验')?.do && <AccessoriesVw orc={orc} rep={rep}/>}
                {renderSub('THICK_MS')}
                {renderSub('CPSTR_VR')}

                {renderSub('MAGNT_TS')}
                {renderSub('OPTIC_TS')}

                {renderSub('SONIC_TS')}
                {renderSub('HARD_TS')}

                {mapFxian.get('耐压试验')?.do && <HydrostaticTestVw orc={orc} rep={rep}/>}
                {mapFxian.get('管道特性表')?.do &&
                    <PipelineCharacteristics orc={orc} rep={rep}/>
                }
                {mapFxian.get('管道单线图')?.do &&
                    <PipeLineDiagram orc={orc} rep={rep} title={'工业管道单线图'} printMode={printMode}/>
                }
            </div>
            <div className="print:hidden">
                <RepLink ori rep={rep} tag={"ProjectList"}>
                    <div>目录列表编辑器</div>
                </RepLink>
            </div>
        </>
    )
}

//原始记录的导航该放在后面：
//因为Collapse没有显示出来的情况下，会导致无法跳转到导航锚点，所以还是不要添加导航项了。
export function useCatalog() {
    const { storage, subrType: mod } = useStorage()
    const [mapFxian] = useItemsMapPressure({ projects: storage.Projects })
    const head = [
        { title: "页面头部", url: "#PHEAD" },
        { title: "页面尾巴", url: "#PTAIL" },
    ]
    const dirs = React.useMemo(() => {
        if (mod && SUBREP_CONFIG[mod]) {
            return [...head, ...redoProjHash(storage?.[`_${mod}`], SUBREP_CONFIG[mod].cat)]
        }
        // 主报告的目录
        const mainReportDirs = [
            { title: "检验证书", url: "#Certificate" },
            { title: "目录", url: "#ProjectList" },
            { title: "设备概况", url: "#Survey" },
            { title: "1.1锅炉安装监督检验结论报告", url: "#Conclusion" },
            { title: "宏观检验报告", url: "#Macroscopic" },
            { title: "安全附件与仪表检验", url: "#Accessories" },
            { title: "1.3锅炉安装施工及监督检验过程概述", url: "#Explanatory" },
        ]
        return [...head, ...mainReportDirs, ...subRepHash(SUBREP_CONFIG,mapFxian,storage),
            ...caseMapFx(mapFxian,'耐压试验',[{ title: "耐压试验报告", url: "#HydrostaticTest" }]),
            { title: "特性表-管道单元", url: "#Characteristics" },
            { title: "管道单线图", url: "#LineDiagram" },
        ].filter(Boolean)
    }, [mod, storage, mapFxian])
    return dirs
}
