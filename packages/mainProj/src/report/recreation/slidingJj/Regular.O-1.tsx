import * as React from "react";
import {OriginalViewProps} from "@/report/common/base";
import {createItem} from "@/report/common/eHelper";
import {useRecordList} from "@/report/hook/useRecordList";
import {useStorage} from "@/report/StorageContext";
import {ItemInstrumentTable} from "@/report/common/Instrument";
import {GenCode} from "@/report/common/GenCode";
import {ActionMapItem} from "@/report/common/ActionMapItem";
import {DeviceSurveyD} from "@/report/common/survey";
import {config检验复检表, RecheckEditor, SiteConditionSund, WitnessSimple} from "@/report/common/editor";
import {ObserveEdit} from "@/report/hook/useObserve";
import {ConclusionWaterJj} from "../waterJj/Conclusion";
import {StrainStress} from "../waterJj/StrainStress";
import {Acceleration} from "../waterJj/Acceleration";
import {config记录} from "./FormatOriginal";
import {config主技术, tail主技} from "./MainTechnical";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EntranceSetup, config设备概况, config观测数据, tail观测, config观测数据2} from "./orcBase";

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
    createItem('Item', null),
    createItem('ReCheck', <RecheckEditor config={config检验复检表} label={'四、检验不符合项目记录及复检结果'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ConclusionWaterJj startd label={'五、现场检验意见'}/>),
    createItem('Witness', <WitnessSimple label={'六、 备注 七、记事'} titles={['七、记事','六、备注']} witlist={记事选}
                                         tails={[null,
                             <React.Fragment key={12}>注：特殊情况，应在备注中说明检验人员所负责检验的项目编号。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <ObserveEdit memoF config={config观测数据} mem={'观备注'} label={'八、观测数据及测量结果记录(上)'}>{tail观测}</ObserveEdit>),
    createItem('Measure2', <ObserveEdit memoF config={config观测数据2} mem={'观备注'} label={'八、观测数据及测量结果记录(下)'}>{tail观测}</ObserveEdit>),
    createItem('MainTechnical', <ObserveEdit config={config主技术} allowableV mem={'主技备注'} label={'附录A K7.5 主要技术参数测试'}>{tail主技}</ObserveEdit>),
    createItem('StrainStress', <StrainStress sensit label='附录B K7.6应力测试记录'/>),
    createItem('Acceleration', <Acceleration sseq={4} stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录D：现场检验条件确认'}/>),
];
if(process.env.NEXT_PUBLIC_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='CmnTowerCrane' frameMod={defFrameM} defTitle={defaultTitle}/>));

//repId传递无效： 实际最后还用rep动态克隆配置的。
export const OriginalView=({ action,  verId, repId='', rep}:OriginalViewProps)=>{
    const {storage, setStorage} =useStorage();
    console.log("OriginalViewaction=", action);
    const recordPrintListNow =React.useMemo(() => {
      let routeAreas=[] as any[];
      const impressionismAs =setupItemAreaRoute({rep, orc:storage});
      let extendTags =Reflect.ownKeys(impressionismAs) as string[];
      const oldItCount=recordPrintList.length;
      let prevpos=0;
      for(let p=0; p<oldItCount; p++){
          //机电常用的会遇到：规定好的标签记号： 关键的标签匹配 extendTags：[ 'Item', ]
        if(extendTags.indexOf(recordPrintList[p].itemArea)>=0){
            routeAreas=routeAreas.concat(recordPrintList.slice(prevpos,p));
            const itemConfigs= impressionismAs?.[recordPrintList[p].itemArea];
            let seq = 0;
            let moreItems = [] as any;
            itemConfigs.forEach((area, x) => {
              seq += 1;
              const rowHead =<ActionMapItem key={seq} repId={repId} alone={false} editAreasConf={itemConfigs}
                                                    index={x} sureD editIts={config记录} />;
              moreItems.push(createItem(area.tag, rowHead));
            });
            //机电impressionismAs项目列表形式的，需要展开 扩充的标签 createItem('Item', null),
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId,rep, storage?._Oitems]);

    const {list}=useRecordList(rep,recordPrintListNow,action,verId);
    return <React.Fragment>
            {list}
    </React.Fragment>;
}
