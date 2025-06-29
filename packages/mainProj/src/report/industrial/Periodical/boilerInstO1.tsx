import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {createItem} from "@/report/common/eHelper";
import {DeviceSurveyD} from "@/report/common/survey";
import {EntranceSetup, config设备概况, config证书概要,} from "./orcBase";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {Explanatory} from "@/report/power/boilInstall/Explanatory";
import {ConclusionBoiler} from "@/report/power/boilInstall/Conclusion";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {BoilerDiagram} from "@/report/power/boilInstall/BoilerDiagram";


/**有的 是非Pdf的原始记录 *.doc附件形式：
 * */
export const Projects记录 = [
    {name: '目录', ha: 'ProjectList', na: true},
    //嵌套的目录构建形式？？ 大标题 一、 立刻跟随的 1.1
    // 一、锅炉安装监督检验综合报告
    // 1.1锅炉安装监督检验结论报告
    {name: '综合报告', ml: '一、锅炉安装监督检验综合报告', ha: 'Conclusion', do: true},
    {name: '结论报告', ml: '1.1锅炉安装监督检验结论报告', ha: 'Conclusion', do: true},
    {name: '锅炉简图', ha: 'BoilerDiagram', ml: '1.2锅炉结构简图'},
    //pdf模板问题？ 应该是大文本的，非上传图片
    {name: '检验过程概述', ha: "Explanatory", ml: '1.3锅炉安装施工及监督检验过程概述'},
    {name: '1.4主要受压元件一览表', ha: ''},
    {name: '二、锅炉安装监督检验分项报告', ha: ''},
    {name: '安装单位审查', ml: '2.1安装单位资源条件审查报告', ha: ''},
    {name: '2.2锅炉出厂资料审查报告', ha: ''},
    {name: '2.3工艺文件审查报告', ha: ''},
    {name: '2.4材料管理监检报告', ha: ''},
    {name: '基础、钢结构安装', ml: '2.5锅炉基础、钢结构安装监检报告', ha: ''},
    {name: '锅筒汽水分离器', ml: '2.6锅筒、汽水分离器安装监检报告', ha: ''},
    {name: '2.7集箱、减温器安装监检报告', ha: ''},
    {name: '受热面及其附件', ml: '2.8受热面及其附件安装监督检验报告', ha: ''},
    {name: '管道、主要连接管', ml: '2.9锅炉范围内管道、主要连接管道安装监检报告', ha: ''},
    {name: '2.9.1锅炉范围内管道特性表', ha: ''},
    {name: '2.9.2锅炉范围内管道单线图', ha: ''},
    {name: '蒸汽吹灰系统', ml: '2.10蒸汽吹灰系统、锅炉本体其他装置安装监检报告', ha: ''},
    {name: '2.11锅炉水压试验现场监督报告', ha: ''},
    {name: '炉墙保温防腐', ml: '2.12炉墙保温防腐、安全保护装置安装监检报告', ha: ''},
    {name: '炉水处理、调试', ml: '2.13锅炉水处理、调试及试运行安装监检报告', ha: ''},
    {name: '三、锅炉安装监检见证资料', ha: ''},
    {name: '安全性能监督检验证', ml: '3.1锅炉产品安全性能监督检验证书', ha: ''},
    {name: '3.2锅炉产品合格证', ha: ''},
    {name: '3.3锅炉安装许可证', ha: ''},
    {name: '3.4锅炉安装质量证明书', ha: ''},
    {name: '3.5特种设备监督检验工作联络单', ha: ''},
    {name: '检验工作意见通知书', ml: '3.6特种设备监督检验工作意见通知书', ha: ''},
    {name: '检验证书', ha: 'Certificate', do: true, na: true},
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'检验结论报告-概况'}/>),
    createItem('CertificateSummary', <DeviceSurveyD config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),
    createItem('Conclusion', <ConclusionBoiler startd cjry label={'检验结论报告-下结论'}/>),
    createItem('BoilerDiagram', <BoilerDiagram label="1.2锅炉结构简图"/>),
    createItem('Explanatory', <Explanatory label={'1.3锅炉安装施工过程概述'} />),
];

export const OriginalView=({ action, verId, rep}:OriginalViewProps)=>{
    const {list}=useRecordListSubr(rep,recordPrintList,action,verId);
    return <>
          {list}
    </>;
}
