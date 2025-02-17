/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {EntranceSetup, config设备概况, config观测数据, config观测数据2,} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {FrontCover } from "../../mobilecr/editorIN";
import {ConclusionEscaTest, } from "./editor";
import {SiteConditionSund,} from "../../elevator/sundryDj/editor";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {MeasureCritMem} from "../../hook/useMeasure";
import {config检测复检表, RecheckEditor} from "../../common/editor";
import {DeviceSurveyD} from "../../crane/editor";
import {HandrailBias} from "../supervi/editor";
import {WitnessSimple} from "../../elevator/stest/editor";

//【可直接】在这里改： "pr":"*","ses":6  "r":3,"s":1, "big":"",
const defFrameM={
    'New2ColBigSpl': `{ "mg":2, "dcl":"","cl":"",
         "sk":[ {"no":"A1.2.2.1", "r":0},  0,  {"no":"6.33.1", "r":[ 3] }, 0 
     ]}`,
    'Rec3ClRep2Cl': `{ "mg":2, "dcl":"A","cl":"A",
         "sk":[{"no":"2.3.3","pr":"*", "r":3,"s":1}, 
        {"big":"","pr":"*","r":3}
    ]}`,
};

export const tItems现场=[
    ['1、供电电压及温度、湿度',{f:'T',
        N: <Text>1、进行整机检测时，供电电压及温度、湿度等环境条件符合相关规定；</Text>},],
    ['2、没有无关的物品和设备',{f:'C',
        N: <Text>2、相关区域没有与自动扶梯与自动人行道运行无关的物品和设备；</Text>},],
    ['3、出入口进行封闭',{f:'f',
        N: <Text>3、出入口进行了必要的封闭和防护；</Text>},],
    ['4、检测现场警示标志',{f:'b',
        N: <Text>4、检测现场放置表明正在进行检测的警示标志。</Text>},],
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('ReCheck', <RecheckEditor config={config检测复检表} label={'四、检测不符合记录及整改情况确认'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ConclusionEscaTest label={'五、检测结论'}/>),
    //原版没有： 六、见证材料，  ?还是留着。
    createItem('Witness', <WitnessSimple label={'六、见证材料 七、备注'} titles={['六、见证材料','七、备注']}
                                         children={[null,
                             <React.Fragment key={12}>注：特殊情况，应在备注中说明检测人员所负责检验的项目编号。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <MeasureCritMem config={config观测数据}  label={'八、观测数据及测量结果记录(上)'}>
        注：本表所列项目无测量时，观测数据和测量结果可不填写，但结果判定应填写，对不适用项填“/"。
        </MeasureCritMem>),
    createItem('Measure2', <MeasureCritMem config={config观测数据2}  label={'八、观测数据及测量结果记录(下)'}>
        注：本表所列项目无测量时，观测数据和测量结果可不填写，但结果判定应填写，对不适用项填“/"。
    </MeasureCritMem>),
    createItem('HandrailBias', <HandrailBias label='附录A：扶手带运行速度偏差试验'/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录B：现场检测条件确认'}> </SiteConditionSund>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='Rec3ClRep2Cl' frameMod={defFrameM}/>));


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
