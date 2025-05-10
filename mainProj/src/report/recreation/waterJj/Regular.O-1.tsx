/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {EntranceSetup, config设备概况, config观测数据, tail观测, config观测数据2, config观测数据3} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {config检测复检表, RecheckEditor, SiteConditionSund, WitnessSimple} from "../../common/editor";
import {ConclusionWaterJj} from "./Conclusion";
import {ObserveEdit} from "../../hook/useObserve";
import {config主技术, tail主技} from "./MainTechnical";
import {StrainStress} from "./StrainStress";
import {Acceleration} from "./Acceleration";
import {config格栅流} from "./Safetygap";
import {config最驶速} from "./Maxspeed";
import {FrontCover, } from "../../mobilecr/editorIN";
import {DeviceSurveyD} from "@/report/common/survey";

//模型参数 "pr":"※", "r":3,"s":1, "big":"", "ts":[13,14] ,"vx":1 ,"ss":[1]
//这个报告特例 nos：没有区分开啊。 【看着像】自采分项目的但是全部算成独立的结论。 生成假定是nos连续的编码，然后【手动进一步做修改】nos:
const defFrameM={
    'CmnTowerCrane': `{ "mg":2, "dcl":"K","cl":"K",
        "sk":[{"no":"8.25(1)","r":0,"bs":[13],"ss":[13]},0,0,0,0,0,0 ,0,0,0,0,0,0
     ] }`,
};
//复制项目描述的核心栏目，但是不包含项目区前缀标题栏目的。
const defaultTitle=`（1）区域隔离与防护措施检查
（2）水量、水深及水位刻度尺
（3）水道与水循环系统检查
（4）漂流筏的筏体
（5）运行试验
（6）电气控制系统与自动控制功能
`;
//分隔开两个子项目的文本： 一个空行！【特别小心】有没有空格的的看起来像空行!!!
const defaultDesc=
    `
`;
export const tItems现场=[
    ['1、温度、湿度、照明及气候',{f:'T',
        N: <Text>1、温度、湿度、照明及室外气候条件能满足游乐设施正常运行及检验作业要求；</Text>},],
    ['2、供电电压波动',{f:'V',
        N: <Text>2、输入电气系统的电压正常，电压波动在允许值以内；</Text>},],
    ['3、现场不应有与检验无关的',{f:'x',
        N: <Text>3、检验现场不应有与游乐设施工作无关的物品和设备，并应放置表明现场正在进行检验的警示牌。</Text>},],
];

const 记事选=["检验过程共开出《特种设备检验意见通知书》xx份： 第x份编号为xxxxxx，整改确认时间为xxxx-xx-xx；第x份编号为xxxxxx，整改确认时间为xxxx-xx-xx。",
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要测量设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('ReCheck', <RecheckEditor config={config检测复检表} label={'四、检验不符合项目记录及复检结果'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ConclusionWaterJj startd label={'五、现场检验意见'}/>),
    createItem('Witness', <WitnessSimple label={'六、 备注 七、记事'} titles={['七、记事','六、备注']} witlist={记事选}
                                         children={[null,
                             <React.Fragment key={12}>注：特殊情况，应在备注中说明检验人员所负责检验的项目编号。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <ObserveEdit memoF config={config观测数据} mem={'观备注'} label={'八、观测数据及测量结果记录(上)'} children={tail观测}/>),
    createItem('Measure2', <ObserveEdit memoF config={config观测数据2} mem={'观备注'} label={'八、观测数据及测量结果记录(中)'} children={tail观测}/>),
    createItem('Measure3', <ObserveEdit memoF config={config观测数据3} mem={'观备注'} label={'八、观测数据及测量结果记录(下)'} children={tail观测}/>),

    createItem('MainTechnical', <ObserveEdit config={config主技术} allowableV mem={'主技备注'} label={'附录A K7.5 主要技术参数测试'} children={tail主技}/>),
    createItem('StrainStress', <StrainStress label='附录B K7.6应力测试记录'/>),
    createItem('Acceleration', <Acceleration sseq={4} stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>),
    createItem('Safetygap', <ObserveEdit config={config格栅流}  mem={'格栅备注'} label={'附录D K8.19 安全格栅间隙流速'} children={''}/>),
    createItem('Maxspeed', <ObserveEdit config={config最驶速}  mem={'最驶备注'} label={'附录E K8.25 碰碰船最大行驶速度'} />),

    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录F：现场检验条件确认'}/>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='CmnTowerCrane' frameMod={defFrameM} defTitle={defaultTitle} defDesc={defaultDesc}/>));


export const OriginalView=
  React.forwardRef((
    { action,  verId, repId='', rep,}
    :OriginalViewProps, ref
  ) => {
    const context =React.useContext(EditStorageContext);
    if(context == null)    throw new Error("EditStorageContext没有提供");
    const {storage, } =context;
    const theme = useTheme();
    const recordPrintListNow =React.useMemo(() => {
      let routeAreas=[] as any[];
      const impressionismAs =setupItemAreaRoute({rep, orc:storage, theme});
      let extendTags =Reflect.ownKeys(impressionismAs) as string[];
      const oldItCount=recordPrintList.length;
      let prevpos=0;
      for(let p=0; p<oldItCount; p++){
        if(extendTags.indexOf(recordPrintList[p].itemArea)>=0){     //需要展开 扩充的标签
            routeAreas=routeAreas.concat(recordPrintList.slice(prevpos,p));
            const itemConfigs= impressionismAs?.[recordPrintList[p].itemArea];
            let seq = 0;
            let moreItems = [] as any;
            itemConfigs.forEach((area, x) => {
              seq += 1;
              const rowHead =<ActionMapItem key={seq} alone={false} editAreasConf={itemConfigs}
                                                    index={x} sureD editIts={config记录} />;
              moreItems.push(createItem(area.tag, rowHead));
            });
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId,rep, storage?._Oitems, theme]);

    const {list}=useRecordList(ref,rep,recordPrintListNow,action,verId);
    return <React.Fragment>
      {list}
        {/*      <Button  intent="primary"
                   onPress={(e) => { handleSubmit!();
                   }}
          >送打印转换器
          </Button>*/}
    </React.Fragment>;
  } );
