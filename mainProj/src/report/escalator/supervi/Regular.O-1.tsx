/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {
    EntranceSetup, config设备概况, config观测数据, config观测数据3, config观测数据2,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {FrontCover, ItemConclusion, } from "../../mobilecr/editorIN";
import {HandrailBias, MonitoringFacili,} from "./editor";
import {ActionMapItemLikeYyWt} from "../../elevator/ActionMapItemLikeYyWt";
import {SiteConditionSund, WitnessSound} from "../../elevator/sundryDj/editor";
import {GenCode} from "../../common/GenCode";
import {MeasureCritMem} from "../../hook/useMeasure";
import {DeviceSurveyD} from "../../crane/editor";


const 大备注可选=[
    "1、本报告第XX、XX、XX项的检验结果为不符合，使用单位已经承诺采取安全措施，对电梯实行监护使用(见编号为XXXXXX的《特种设备检验意见通知书》)。",
    "2、本检验机构于XXXX年XX月XX日出具了编号为XXXXX的《电梯定期委托检验报告》。参照TSG T7001—2023的规定，本检验机构对该报告所对应的电梯进行了复检，出具本检验报告。"
];
const 见证资料选=['1、整改见证资料名称《xxxx》，编号：'  ];
export const tItems现场=[
    ['1、供电电压及温度、湿度等环境',{f:'T',
        N: <Text>1、进行整机检验时，供电电压及温度、湿度等环境条件符合相关规定；</Text>},],
    ['2、区域没有无关的物品和设备',{f:'w',
        N: <Text>2、相关区域没有与自动扶梯与自动人行道运行无关的物品和设备；</Text>},],
    ['3、入口进行了必要的封闭',{f:'s',
        N: <Text>3、出入口进行了必要的封闭和防护；</Text>},],
    ['4、现场放正在进行检验标志',{f:'x',
        N: <Text>4、检验现场放置表明正在进行检验的警示标志；</Text>},],
    ['5、施工单位安排人配合',{f:'P',
        N: <Text>5、施工单位安排了专业人员，配合实施现场检验。</Text>},]
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    // createItem('ReCheck', <ItemRecheckOmniOther label={'四、检验不符合项目记录及复检结果'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ItemConclusion startd  label={'四、现场检验意见'}/>),
    createItem('Witness', <WitnessSound label={'五、见证资料 六、备注'} titles={['五、见证资料','六、备注']} memolist={大备注可选} witnlist={见证资料选}
                         children={[null,
                             <React.Fragment key={12}>注：本备注栏的内容在检验报告附件的备注栏内体现。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <MeasureCritMem config={config观测数据} label={'七、观测数据及测量结果记录（上）'}/>),
    createItem('Measure2', <MeasureCritMem config={config观测数据2} label={'七、观测数据及测量结果记录（中）'}/>),
    createItem('Measure3', <MeasureCritMem config={config观测数据3} label={'七、观测数据及测量结果记录（下）'}/>),
    createItem('HandrailBias', <HandrailBias label='附录A：空载梯级（踏板、胶带）和扶手带运行速度偏差'/>),

    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录B：现场检验条件确认'}/>),
    createItem('MonitoringFacili', <MonitoringFacili label='附录C 视频监控设施、远程监测装置检查记录表'/>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='New2ColBase'/>));


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
              const rowHead =<ActionMapItemLikeYyWt key={seq} alone={false} editAreasConf={itemConfigs}
                                                    index={x} sureD />;
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
