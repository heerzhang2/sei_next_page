import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {aggregateProj, createItem} from "@/report/common/eHelper";
import {DeviceSurveyD, DeviceSurveyFx} from "@/report/common/survey";
import {EntranceSetup, config设备概况, config证书概要,} from "./orcBase";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {Explanatory} from "@/report/power/boilInstall/Explanatory";
import {ConclusionBoiler} from "@/report/power/boilInstall/Conclusion";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {BoilerDiagram} from "@/report/power/boilInstall/BoilerDiagram";
import {config壁厚测仪, TkmsConclusion, TkmsMeasurement, TkmsPartSummary} from "@/report/cm/thickm/ThickMs1";
import {titleRenders} from "@/report/industrial/Periodical/rarelyVary";
import {FxDiagram} from "@/report/cm/thickm/FxDiagram";
import {config磁粉仪概, MangPartSummary, mang示说选} from "@/report/cm/magnetic/Magnetic1";
import {FxSimpConclus} from "@/report/cm/magnetic/FxSimpConclus";
import {PropertySolidify} from "@/report/industrial/property-solidify";
import {SingleLineDiagram} from "@/report/industrial/diagram-manager";
import {LineDiagramFile} from "@/report/industrial/diagram-file";
import {Macroscopic} from "@/report/industrial/Periodical/Macroscopic";


/**有的 是非Pdf的原始记录 *.doc附件形式：
 * */
export const Projects记录 = [
    {name:'资料审查',do:true},
    {name:'宏观检验',do:true,ml:'工业管道宏观检验报告'},
    {name:'安全附件与仪表检验',do:false,ml:'安全附件与仪表检验报告'},
    // {name:'压力容器资料审查',do:true,ha:'Conclusion'},   {name:'衍射时差法（TOFD）超声检测',ha:'rp_tofd_'},
    {name:'壁厚测定',},
    {name:'渗透检测',},
    {name:'射线检测'},
    {name:'磁粉检测',ml:'磁粉检测报告',},
    {name:'超声波检测',ml:'超声波检测报告',ha:'rp_sonic_'},
    {name:'光谱分析',ml:'材料成分分析（光谱分析）报告',ha:'rp_spectrA_'},
    {name:'光谱检测',ha:'rp_optical_'},
    {name:'硬度检测',ha:'rp_hardness_'},
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
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'}/>),
    createItem('CertificateSummary', <DeviceSurveyD config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),
    createItem('Conclusion', <ConclusionBoiler startd cjry label={'检验结论报告-下结论'}/>),
    createItem('BoilerDiagram', <BoilerDiagram label="xxx锅炉结构简图"/>),
    createItem('Macroscopic', <Macroscopic label="宏观检验报告"/>),
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
        createItem('MangDiagram', <FxDiagram label="检测部位、缺陷位置示意图" pic='_FILE_S部位' memo='点图说明' maxFile={5} dlist={mang示说选}/>),
        createItem('MangPartSummary', <MangPartSummary label='磁粉检测结果评定表'/>),
        createItem('MangConclusion', <FxSimpConclus label={'磁粉检测-检测结果'} clc="结果" clist={["1级"]}/>),
    ]),
    createItem('Explanatory', <Explanatory label={'YY.3锅炉安装施工过程概述'}/>),
];


export const OriginalView=({action, verId, rep}:OriginalViewProps)=>{
    const {list}=useRecordListSubr(rep,recordPrintList,action,verId,titleRenders);
    return <>
          {list}
    </>;
}
