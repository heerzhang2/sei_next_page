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

const defFrameM={
    'CmnTowerCrane': `{ "mg":2, "dcl":"K","cl":"K",
        "sk":[ {"pr":"※","no":"5.5.1","r":0,"bs":[3],"ss":[3],"ts":[1]}, 0,0
     ] }`,
};
//复制项目描述的核心栏目，但是不包含项目区前缀标题栏目的。
const defaultTitle=`安全距离
进出口距站台高度
转动平台台面及其间隙
`;

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
    createItem('Instrument', <ItemInstrumentTable label={'一、主要测量设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Conclusion', <ConclusionWaterJj startd label={'五、现场检验意见'}/>),

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
