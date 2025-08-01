import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {aggregateProj, createItem} from "@/report/common/eHelper";
import {DeviceSurveyD, DeviceSurveyFx} from "@/report/common/survey";
import {EntranceSetup, config设备概况, config证书概要,} from "./orcBase";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {config壁厚测仪, TkmsConclusion, TkmsMeasurement, TkmsPartSummary} from "@/report/cm/thickm/ThickMs1";
import {titleRenders} from "@/report/industrial/Periodical/rarelyVary";
import {FxDiagram} from "@/report/cm/thickm/FxDiagram";
import {config磁粉仪概, MangPartSummary, mang示说选} from "@/report/cm/magnetic/Magnetic1";
import {FxSimpConclus} from "@/report/cm/magnetic/FxSimpConclus";
import {PropertySolidify} from "@/report/industrial/property-solidify";
import {SingleLineDiagram} from "@/report/industrial/diagram-manager";
import {LineDiagramFile} from "@/report/industrial/diagram-file";
import {Macroscopic} from "@/report/industrial/Periodical/Macroscopic";
import {Accessories} from "@/report/industrial/Periodical/Accessories";
import {MaterialReview} from "@/report/industrial/Periodical/MaterialReview";
import {ConcAppendix} from "@/report/industrial/Periodical/ConcAppendix";
import {ConclusionIndPer} from "@/report/industrial/Periodical/Conclusion";
import {config超声仪概, SoniEvaluation, soni结果选} from "@/report/cm/sonic/Ultrasound1";
import {HydrostaticTest} from "@/report/industrial/Periodical/HydrostaticTest";
import {config硬度仪, HardEvaluation, hard示说选} from "@/report/cm/hardness/Hardness1";
import {config光谱测仪, OptcEvaluation, optc示说选} from "@/report/cm/optical/Optical1";
import {config强度核概, CpsvCalculation, cpsv结果选} from "@/report/cm/cpStrength/csVerification1";
import {LongArticleFx} from "@/report/cm/cpStrength/LongArticleFx";
import {
    config射线仪概,
    config射线测仪,
    RadoEvaluation,
    RadoWorkpiece, rado示说选,
    rado结果选
} from "@/report/cm/radio/Radiography1";
import {config渗透仪概, PermEvaluation, perm示说选, perm结果选} from "@/report/cm/permeation/PermTest1";


/**有的 是非Pdf的原始记录 *.doc附件形式：
 *  因为模板已经里另外做一个ConcAppendix附页编辑器了，参数na:不需要再设置了 ha:也不要用;
 *  这里缺少关联 modType :
 * */
export const Projects记录 = [
    {name:'工业管道定期检验结论',do:true},
    {name:'资料审查',do:true,ml:'工业管道资料审查报告'},
    {name:'宏观检验',do:true,ml:'工业管道宏观检验报告'},
    {name:'安全附件与仪表检验',do:false,ml:'安全附件与仪表检验报告'},
    // {name:'压力容器资料审查',do:true,ha:''},   {name:'衍射时差法（TOFD）超声检测',ha:''},
    {name:'壁厚测定',},
    {name:'渗透检测',},
    {name:'射线检测'},
    {name:'磁粉检测',ml:'磁粉检测报告',},
    {name:'超声波检测',ml:'超声波检测报告'},
    {name:'光谱分析',ml:'材料成分分析（光谱分析）报告'},
    {name:'光谱检测',},
    {name:'硬度检测',},
    {name:'金相分析'},
    {name:'泄漏试验'},
    {name:'耐压试验'},
    {name:'管道特性表',ml:'管道特性表',na:true},
    {name:'管道单线图',ml:'管道单线图',na:true},
    {name:'耐压强度校核',ml:'耐压强度校核报告'},
];


const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'} comment={{8:"以下8个性能参数"}}/>),
    createItem('CertificateSummary', <DeviceSurveyD config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),

    createItem('Conclusion', <ConclusionIndPer startd cjry label={'检验结论报告-下结论'}/>),
    createItem('ConcAppendix', <ConcAppendix label="工业管道定期检验结论报告附页"/>),
    createItem('MaterialReview', <MaterialReview label="工业管道资料审查报告"/>),
    createItem('Macroscopic', <Macroscopic label="宏观检验报告"/>),
    createItem('Accessories', <Accessories label="安全附件与仪表检验报告"/>),
    createItem('Solidify', <PropertySolidify />),
    createItem('LineDiagram', <SingleLineDiagram />),
    createItem('LineDiagramFile', <LineDiagramFile />),
    //侧壁厚： 没有独立流转子报告的版本号，依附于主报告。 确保名称与 Projects记录 中的一致；可重复分项的name命名冲突检查是独立于主报告的。没有独立的Entrance初始化和原始记录列表。
    aggregateProj('壁厚测定', 'THICK_MS', [
        createItem('TkmsInstrument', <DeviceSurveyFx config={config壁厚测仪} label='壁厚测定-概要仪器'/>),
        createItem('TkmsPartSummary', <TkmsPartSummary label='壁厚各部位测点和最小壁厚'/>),
        createItem('TkmsDiagram', <FxDiagram label="测厚点位置示图" pic='_FILE_S部位' memo='点图说明' maxFile={3}/>),
        createItem('TkmsMeasurement', <TkmsMeasurement label='测厚表'/>),
        createItem('TkmsConclusion', <TkmsConclusion label={'壁厚测定-结果'} />),
    ]),
    aggregateProj('磁粉检测', 'MAGNT_TS', [
        createItem('MangInstrument', <DeviceSurveyFx config={config磁粉仪概} label='磁粉检测-概要仪器'/>),
        createItem('MangDiagram', <FxDiagram label="磁粉检测部位缺陷位置图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={mang示说选}/>),
        createItem('MangPartSummary', <MangPartSummary label='磁粉检测结果评定表'/>),
        createItem('MangConclusion', <FxSimpConclus label={'磁粉检测-检测结果'} clc="结果" clist={["1级"]}/>),
    ]),
    aggregateProj('超声波检测', 'SONIC_TS', [
        createItem('SoniInstrument', <DeviceSurveyFx config={config超声仪概} label='超声波检测-概要仪器'/>),
        createItem('SoniEvaluation', <SoniEvaluation label='焊接接头超声检测结果评定'/>),
        createItem('SoniConclusion', <FxSimpConclus label={'超声波检测-检测结果'} clc="结果" clist={soni结果选}/>),
    ]),
    aggregateProj('硬度检测', 'HARD_TS', [
        createItem('HardInstrument', <DeviceSurveyFx config={config硬度仪} label='磁粉检测-概要仪器'/>),
        createItem('HardDiagram', <FxDiagram label="磁粉检测部位、缺陷位置示意图" pic='_FILE_S部位' memo='点图说明' maxFile={10} dlist={hard示说选}/>),
        createItem('HardEvaluation', <HardEvaluation label='硬度检测分析结果表'/>),
        createItem('HardConclusion', <FxSimpConclus label={'硬度检测-备注检测结果'} clc="结果" memo='备注'
                                                    clist={['所检项目未见异常。']} mlist={['试验部位为硬度检测附图中编号处的管件。']}/>),
    ]),
    aggregateProj('光谱检测', 'OPTIC_TS', [
        createItem('OptcInstrument', <DeviceSurveyFx config={config光谱测仪} label='光谱检测-概要仪器'/>),
        createItem('OptcEvaluation', <OptcEvaluation label='光谱检测分析结果表'/>),
        createItem('OptcDiagram', <FxDiagram label="光谱检测位置示意图" pic='_FILE_S部位' memo='点图说明' maxFile={10} dlist={optc示说选}/>),
        createItem('OptcConclusion', <FxSimpConclus label={'光谱检测-检测结果'} clc="结果"
                                                    clist={['对管件进行光谱复核，经检测，管件的Mn元素含量符合母材20钢的标准范围。']} />),
    ]),
    aggregateProj('耐压强度校核', 'CPSTR_VR', [
        createItem('CpsvInstrument', <DeviceSurveyFx config={config强度核概} label='耐压强度校核-概要'/>),
        createItem('CpsvParMemo', <CpsvCalculation label='校核参数取值说明'/>),
        createItem('CpsvCalculation', <LongArticleFx label='耐压强度校核-计算' wsPre/>),
        createItem('CpsvConclusion', <FxSimpConclus label={'强度校核-校核结果'} clc="结果" clist={cpsv结果选} ticlc='校核结果'/>),
    ]),
    createItem('HydrostaticTest', <HydrostaticTest label='耐压试验报告'/>),
    aggregateProj('射线检测', 'RADIO_TS', [
        createItem('RadoInstrument', <DeviceSurveyFx config={config射线仪概} label='射线检测-概要仪器'/>),
        createItem('RadoWorkpiece', <RadoWorkpiece label='射线检测-工件编号'/>),
        createItem('RadoEvaluation', <RadoEvaluation label='射线检测底片评定表'/>),
        createItem('RadoDiagram', <FxDiagram label="检测部位（布片示意图）" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={rado示说选}/>),
        createItem('RadoConclusion', <FxSimpConclus label={'射线检测-检测结果'} clc="结果" clist={rado结果选} />),
    ]),
    aggregateProj('渗透检测', 'PERME_TS', [
        createItem('PermInstrument', <DeviceSurveyFx config={config渗透仪概} label='渗透检测-概要仪器'/>),
        createItem('PermDiagram', <FxDiagram label="渗透检测部位及缺陷位置图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={perm示说选}/>),
        createItem('PermEvaluation', <PermEvaluation label='渗透检测结果评定表'/>),
        createItem('PermConclusion', <FxSimpConclus label={'渗透检测-检测结果'} clc="结果" clist={perm结果选} />),
    ]),
    //光谱分析报告 ,
];


export const OriginalView=({action, verId, rep}:OriginalViewProps)=>{
    const {list}=useRecordListSubr(rep,recordPrintList,action,verId,titleRenders);
    return <>
          {list}
    </>;
}
