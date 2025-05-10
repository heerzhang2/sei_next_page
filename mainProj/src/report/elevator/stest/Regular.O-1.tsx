/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {EntranceSetup, config设备概况, config观测数据,} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {FrontCover } from "../../mobilecr/editorIN";
import {ConclusionTest, } from "./editor";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {MeasureCritMem} from "../../hook/useMeasure";
import {config检测复检表, RecheckEditor, SiteConditionSund, WitnessSimple} from "../../common/editor";
import {DoorGap} from "./DoorGap";
import {Equilibrium} from "./Equilibrium";
import {DzLimiterSpeed, LimiterSpeed,} from "./LimiterSpeed";
import {DeviceSurveyD} from "@/report/common/survey";

export const tItems现场=[
    ['1、井道和机器空间内温度',{f:'T',
        N: <Text>1、井道和机器空间内的环境温度保持在5℃～40℃之间；（单位：℃）</Text>},],
    ['2、供电电压波动范围',{f:'V',
        N: <Text>2、供电电压波动在额定电压值±7％的范围内；（单位：V）</Text>},],
    ['3、湿度不影响运行',{f:'s',
        N: <Text>3、湿度不影响设备正常运行，电器设备无凝露；</Text>},],
    ['4、进行必要的封闭防护',{f:'b',
        N: <Text>4、相关区域没有与电梯运行无关的物品和设备，进行了必要的封闭和防护，放置表明正在进行检测的警示标志。</Text>},],
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('ReCheck', <RecheckEditor config={config检测复检表} label={'四、检测不符合记录及整改情况确认'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ConclusionTest  label={'五、检测结论'}/>),
    createItem('Witness', <WitnessSimple label={'六、见证材料 七、备注'} titles={['六、见证材料','七、备注']}
                                         children={[null,
                             <React.Fragment key={12}>注：特殊情况，应在备注中说明检测人员所负责检验的项目编号。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <MeasureCritMem config={config观测数据}  label={'八、观测数据及测量结果记录'}>
        注：1、本表所列项目未测量时，相关数据可不填，结果判定应填，对不适用项填“/”。
        2、A1.3.14项“噪声测试”每项测量结果均符合要求时，“观测数据”栏可不填写测量数值，直接在“结果判定”栏打“√”；测量结果有不符合要求时，需在相应项目“观测数据”栏填写具体测量值。
        </MeasureCritMem>),
    createItem('Gap', <DoorGap label='附录A 电梯层门和轿门间隙、门锁啮合长度及门刀、滚轮与地坎间距检测记录'/>),
    createItem('Equilibrium', <Equilibrium label={'附录B A1.3.2平衡系数测试'} config={[30,40,45,50,60]}>
       </Equilibrium>),
    createItem('Limiter', <LimiterSpeed label='附录C：限速器动作速度校验'/>),
    createItem('DzLimiter', <DzLimiterSpeed label='附录C：限速器动作速度校验'/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录D：现场检测条件确认'}/>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='New2ColBigSpl'/>));


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
