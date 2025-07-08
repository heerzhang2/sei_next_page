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
import { redoProjHash, useItemsMapPressure } from "@/report/common/pressure"
import { DirectoryPagePress } from "@/report/common/directory"
import { ExplanatoryVw } from "@/report/power/boilInstall/Explanatory"
import { CertificatePage } from "@/report/power/boilInstall/CertificatePage"
import { BoilerDiagramVw } from "@/report/power/boilInstall/BoilerDiagram"
import { 注意事项GasC } from "@/report/gas/rarelyVary"
import { 首页设备概况BoilI } from "@/report/power/boilInstall/rarelyVary"
import { ConclusionVw } from "@/report/industrial/Periodical/Conclusion"
import { cat_Thickms, ThickMsVw } from "@/report/cm/thickm/ThickMs1"
import SubRep, {SingeSubRep, SubReportConfig} from "@/component/rep/sub-rep"
import { MagneticVw } from "@/report/cm/magnetic/Magnetic1"

//确保预定的渲染顺序: 这里不要用数字的key； 避免用整数键（或可转换为整数的字符串）;
const SUB_REPORT_CONFIG: Record<string, SubReportConfig> = {
    THICK_MS: {
        title: "壁厚测定",
        component: ThickMsVw,
        catalogKey: "壁厚测定",
    },
    MAGNT_TS: {
        title: "磁粉检测",
        component: MagneticVw,
        catalogKey: "磁粉检测",
    },
    // 可以继续添加其他子报告配置
    // 'OTHER_TYPE': {
    //   title: '其他检测',
    //   component: OtherVw,
    //   catalogKey: '其他检测'
    // }
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

    // 渲染单个子报告
    const renderSingleSubReport = () => {
        if (!subrType) return null

        const config = SUB_REPORT_CONFIG[subrType]
        if (!config) {
            console.warn(`未找到 ${subrType} 的配置`)
            return null
        }

        const Component = config.component
        return (
            <SingeSubRep rep={rep} subrid={subrid!} title={config.title}>
                <Component rep={rep} subrid={subrid} />
            </SingeSubRep>
        )
    }

    // 渲染所有子报告（用于主报告）
    const renderAllSubReports = () => {
        //避免使用数字或可转换为数字的字符串作为键名，改用非数字字符串; 数字键优先按数值排序，非数字键按插入顺序
        return Object.entries(SUB_REPORT_CONFIG)
            .map(([modType, config]) => {
                if (!mapFxian.get(config.catalogKey)?.do) return null

                const Component = config.component
                return (
                    <SubRep key={modType} modType={modType} rep={rep} title={config.title}>
                        <Component orc={orc} rep={rep} printMode={printMode} />
                    </SubRep>
                )
            })
            .filter(Boolean)
    }

    //走独立流转分项报告模式的情况
    if (subrType) {
        return renderSingleSubReport()
    }

    return (
        <>
            <div className="not-print:my-4">
                <CertificatePage orc={orc} rep={rep} />

                <div className="print:h-screen">
                    {ReportFirstPageHeadNmaNmbm({ rep })}
                    <div className="print:flex print:flex-col print:justify-between print:h-[calc(100vh-8.5rem)]">
                        <div>
                            <JumpTab href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Entrance#Entrance`}>
                                <h1 className="text-3xl text-center print:mt-6">电站锅炉安装监检报告</h1>
                            </JumpTab>
                            <span className="block text-center text-sm print:mt-4"> （ FJB/GB 10082-0-2021 ）</span>
                        </div>
                        {首页设备概况BoilI(orc, rep)}
                        <div className="text-center print:break-after-page print:break-inside-avoid">{落款单位地址()}</div>
                    </div>
                </div>
                {注意事项GasC({ rep, comply: "书为依据《锅炉安全技术规程》制定，适用于电站锅炉安装监督检验的结论报告" })}
                {mapFxian.get("目录")?.do && <DirectoryPagePress orc={orc} rep={rep} />}

                <ConclusionVw orc={orc} rep={rep} subrid={subrid!} />
                {检验核准WaterJj({ orc, rep, jyt: "编制" })}

                {mapFxian.get("锅炉简图")?.do && <BoilerDiagramVw orc={orc} rep={rep} />}
                {mapFxian.get("检验过程概述")?.do && <ExplanatoryVw orc={orc} rep={rep} title="1.3锅炉安装施工过程概述" />}

                {/* 渲染所有配置的子报告 */}
                {renderAllSubReports()}
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
        if (mod && SUB_REPORT_CONFIG[mod]) {
            return [...head, ...redoProjHash(storage?.[`_${mod}`], cat_Thickms)]
        }
        // 主报告的目录
        const mainReportDirs = [
            { title: "检验证书", url: "#Certificate" },
            { title: "目录", url: "#ProjectList" },
            { title: "设备概况", url: "#Survey" },
            { title: "1.1锅炉安装监督检验结论报告", url: "#Conclusion" },
            { title: "1.2锅炉结构简图", url: "#BoilerDiagram" },
            { title: "1.3锅炉安装施工及监督检验过程概述", url: "#Explanatory" },
        ]
        // 动态添加子报告的目录项
        const subReportDirs = Object.entries(SUB_REPORT_CONFIG)
            .filter(([modType, config]) => mapFxian.get(config.catalogKey)?.do)
            .map(([modType, config]) => ({
                title: `${config.title}报告`,
                url: `#_${modType}_`,
            }))

        return [...head, ...mainReportDirs, ...subReportDirs,
            { title: "设erewrwe备概况", url: "#Survddey2" }
        ].filter(Boolean)
    }, [mod, storage, mapFxian])
    return dirs
}

// 导出配置供其他地方使用
export { SUB_REPORT_CONFIG }
