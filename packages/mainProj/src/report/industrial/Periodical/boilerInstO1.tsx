import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {aggregateProj, createItem} from "@/report/common/eHelper";
import {DeviceSurveyD} from "@/report/common/survey";
import {EntranceSetup, config设备概况, config证书概要,} from "./orcBase";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {Explanatory} from "@/report/power/boilInstall/Explanatory";
import {ConclusionBoiler} from "@/report/power/boilInstall/Conclusion";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {BoilerDiagram} from "@/report/power/boilInstall/BoilerDiagram";
import {config壁厚测仪, ThkmsInstrument} from "@/report/cm/thickm/ThickMs1";
import {titleRenders} from "@/report/industrial/Periodical/rarelyVary";


/**有的 是非Pdf的原始记录 *.doc附件形式：
 * */
export const Projects记录 = [
    {name:'资料审查',do:true,ha:'MaterialReview'},
    {name:'宏观检验',do:true,ml:'工业管道宏观检验报告',ha:'Structural'},
    {name:'安全附件与仪表检验',do:false,ml:'安全附件与仪表检验报告',ha:'AdditionalTest'},
    // {name:'压力容器资料审查',do:true,ha:'Conclusion'},   {name:'衍射时差法（TOFD）超声检测',ha:'rp_tofd_'},
    {name:'壁厚测定',ha:'rp_thickm_'},
    {name:'渗透检测',ha:'rp_permeation_'},
    {name:'射线检测',ha:'rp_radio_'},
    {name:'磁粉检测',ml:'磁粉检测报告',ha:'rp_magnetic_'},
    {name:'超声波检测',ml:'超声波检测报告',ha:'rp_sonic_'},
    {name:'光谱分析',ml:'材料成分分析（光谱分析）报告',ha:'rp_spectrA_'},
    {name:'光谱检测',ha:'rp_optical_'},
    {name:'硬度检测',ha:'rp_hardness_'},
    {name:'金相分析'},
    {name:'泄漏试验'},
    {name:'耐压试验'},
    {name:'管道特性表',ml:'管道特性表',ha:'Characteristics',na:true},
    {name:'管道单线图',ml:'管道单线图',ha:'PipeLineDiagram',na:true},
    {name:'耐压强度校核',ml:'耐压强度校核报告'},
];


const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'}/>),
    createItem('CertificateSummary', <DeviceSurveyD config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),
    createItem('Conclusion', <ConclusionBoiler startd cjry label={'检验结论报告-下结论'}/>),
    createItem('BoilerDiagram', <BoilerDiagram label="1.2锅炉结构简图"/>),

    // createItem('_Controller',  <></>),
    //thickm 侧壁厚部分： 没有独立流转子报告的版本号，依附于主报告。
    aggregateProj('壁厚测定', 'THICK_MS', [
        createItem('ThkmsInstrument', <DeviceSurveyD config={config壁厚测仪} label={'壁厚测定-概要仪器'}/>),
        createItem('ThkmsInstrument2', <ThkmsInstrument label={'壁厚测定-概要仪器'}/>),
        createItem('ThkmsCertMemo', <CertMemo label={'壁厚测定ThkmsThkms-说明'} />),
    ]),
    aggregateProj('渗透检测', 'PERME_TS', [
        createItem('PERME_TSInstrument', <ThkmsInstrument label={'渗透检测-概要仪器'}/>),
        createItem('PERME_TSCertMemo', <CertMemo label={'渗透888检测-说明'} />),
    ]),
    createItem('Explanatory', <Explanatory label={'8.3锅炉安装施工过程概述'}/>),
];


export const OriginalView=({ action, verId, rep}:OriginalViewProps)=>{
    const {list}=useRecordListSubr(rep,recordPrintList,action,verId,titleRenders);
    return <>
          {list}
    </>;
}
