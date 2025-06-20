import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {createItem} from "@/report/common/eHelper";
import {useRecordList} from "@/report/hook/useRecordList";
import {useStorage} from "@/report/StorageContext";
import {ItemInstrumentTable} from "@/report/common/Instrument";
import {GenCode} from "@/report/common/GenCode";
import {ActionMapItem} from "@/report/common/ActionMapItem";
import {DeviceSurveyD} from "@/report/common/survey";
import {ObserveEdit} from "@/report/hook/useObserve";
// import {ConclusionWaterJj} from "../waterJj/Conclusion";
import {StrainStress} from "../waterJj/StrainStress";
import {Acceleration} from "../waterJj/Acceleration";
import {config记录} from "./FormatOriginal";
import {config主技术, tail主技} from "./MainTechnical";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EntranceSetup, config设备概况,} from "./orcBase";
import {ConclusionWaterJj} from "@/report/recreation/waterJj/Conclusion";
import {useRecordListSubr} from "@/report/hook/useRecordListSub";
import {ProjectR} from "@/report/common/ProjectR";
import {Explanatory} from "@/report/power/boilInstall/Explanatory";
import {ConclusionBoiler} from "@/report/power/boilInstall/Conclusion";
import {CertMemo} from "@/report/power/boilInstall/CertMemo";
import {BoilerDiagram} from "@/report/power/boilInstall/BoilerDiagram";


/**有的 是非Pdf的原始记录 *.doc附件形式：
 * 极为特殊的 @目录构造@
 *【特别重要！】 name的汉字个数限制：最好不超过12个汉字的菜单标题文。 太长的，在竖屏小手机不好操作！
 * 【@问题!】 目录页若超过一张纸？的: ‘目录页VS’ 通用组件还未支持。
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


export const tItems现场=[
    ['1、温度、湿度、照明及气候',{f:'T',
        N: <span>1、温度、湿度、照明及室外气候条件能满足游乐设施正常运行及检验作业要求；</span>},],
    ['2、供电电压波动',{f:'V',
        N: <span>2、输入电气系统的电压正常，电压波动在允许值以内；</span>},],
    ['3、现场不应有与检验无关的',{f:'x',
        N: <span>3、检验现场不应有与游乐设施工作无关的物品和设备，并应放置表明现场正在进行检验的警示牌。</span>},],
];

const 记事选=["检验过程共开出《特种设备检验意见通知书》xx份： 第x份编号为xxxxxx，整改确认时间为xxxx-xx-xx；第x份编号为xxxxxx，整改确认时间为xxxx-xx-xx。",
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('ProjectList', <ProjectR nRec defaultProj={Projects记录} label={'记录的目录页'}/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要测量设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Conclusion', <ConclusionBoiler startd cjry label={'检验结论报告-下结论'}/>),
    createItem('BoilerDiagram', <BoilerDiagram label="1.2锅炉结构简图"/>),
    createItem('Explanatory', <Explanatory label={'1.3锅炉安装施工过程概述'} />),
    createItem('CertMemo', <CertMemo label={'证书-说明'} />),
    // createItem('MainTechnical', <ObserveEdit config={config主技术} allowableV mem={'主技备注'} label={'附录A K7.5 主要技术参数测试'}>{tail主技}</ObserveEdit>),
    // createItem('StrainStress', <StrainStress sensit label='附录B K7.6应力测试记录'/>),
    // createItem('Acceleration', <Acceleration sseq={4} stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>),
];


export const OriginalView=({ action,  verId, repId='', rep}:OriginalViewProps)=>{
    const {storage, setStorage} =useStorage();
    // console.log("OriginalViewaction=", action);
    const {list}=useRecordListSubr(rep,recordPrintList,action,verId);
    return <>
          {list}
    </>;
}
