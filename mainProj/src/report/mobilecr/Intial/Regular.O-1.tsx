/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {
    EntranceSetup, config设备概况, config观测数据, ObservationMeasure, SafeDistance, config距离, SpecialExperm,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Input, InputLine, useTheme} from "customize-easy-ui-component";
import { ItemRecheckOmniR,} from "../../common/editor";
import {ItemInstrumentTable} from "../../common/Instrument";
import {
    Ladder, MagneticLeak, Thickness,} from "../../park/editor";
import {RecordOmniArea} from "../../common/omni";
import {DeviceSurvey, } from "../../elevator/editor";
import {ActionMapItemLikeMobCrIn} from "../ActionMapItemLikeMobCrIn";
import {Braking, FrontCover, ItemConclusion, MoveSpeed, SiteConditionMbcr, WitnessCraTwo} from "../editorIN";


const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurvey config={config设备概况} label={'二、设备概况'}></DeviceSurvey>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion startd={false} label={'四、结论'}/>),
    createItem('Witness', <WitnessCraTwo label={'五、技术资料和工作见证材料 六、备注'} titles={['五','六']}>
            注：本备注栏的内容在检验报告附件的备注栏内体现。
            </WitnessCraTwo>),
    createItem('Measure', <ObservationMeasure config={config观测数据} label={'附录1 观测值及测量结果记录表'}/>),
    createItem('SafeDistance', <SafeDistance config={config距离} label={'附录2：C3.3 安全距离观测值及测量结果记录表'}>
                注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
                </SafeDistance>),
    createItem('Thickness', <Thickness label={'附录3：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表'}/>),
        //第一列29 30小项的围栏为何不见？停车设备才加的"围栏"
    createItem('Ladder', <Ladder label={'附录4：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>),
    createItem('MoveSpeed', <MoveSpeed label={'附录5：C4.3.2.1各机构运行速度记录表'}/>),
    createItem('Braking', <Braking label={'附录6：C4.3.2.2起升机构制动距离记录表'}>
            注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动 距离都没有规定的，相应的制动距离可不测量。
            2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在 备注栏。
            3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            4、未检查或无需检验的，仅填检验结果栏。
            </Braking>),
    createItem('SpecialExperm', <SpecialExperm label={'附录7 C4.3.2.5.4 流动式起重机专项试验'}/>),
    createItem('MagneticLeak', <MagneticLeak label={'附录8：C4.9.8.1漏磁检查记录表'}>
            注：未检查或无需检验的，仅填检验结果栏。
        </MagneticLeak>),
    createItem('SiteCondition', <SiteConditionMbcr label={'附录9：现场检验条件确认'}/>),
    createItem('ReCheck', <ItemRecheckOmniR label={'附录10 检验不合格项目内容'} setup={setupItemAreaRoute}/>),
];


//接收的rep对象这里并没有继续传递给编辑区页面组件。后端IspTzFieldSnapshot数据只能在EditStorageContext提取。
//后端的台账业务信息字段存储会优先被采信 setStorage({...dat, ...snap, _version: items?.version}); 注意字段名字唯一性。
export const OriginalView=
  React.forwardRef((
    { action,  verId, repId='', rep,}
    :OriginalViewProps, ref
  ) => {
    const context =React.useContext(EditStorageContext);
    if(context == null)    throw new Error("EditStorageContext没有提供");
    const theme = useTheme();
    //初始化，印象派形式的动态构建的项目列表： 目前只有一个的印象派扩展标签。
    const recordPrintListNow =React.useMemo(() => {
      let routeAreas=[] as any[];
      const impressionismAs =setupItemAreaRoute({rep, theme});
      let extendTags =Reflect.ownKeys(impressionismAs) as string[];
      const oldItCount=recordPrintList.length;
      let prevpos=0;
      for(let p=0; p<oldItCount; p++){
        if(extendTags.indexOf(recordPrintList[p].itemArea)>=0){     //需要展开 扩充的标签
            routeAreas=routeAreas.concat(recordPrintList.slice(prevpos,p));
            const itemConfigs= impressionismAs?.[recordPrintList[p].itemArea];
            let seq = 0;
            let moreItems = [] as any;
            //动态 扩充{检验项目配置办法的}编辑区： 目前只有一个的印象派扩展标签ItemArs对应的是'Item-'。 ['Item-', ]
            itemConfigs.forEach((area, x) => {
              seq += 1;
              const rowHead =<ActionMapItemLikeMobCrIn key={seq} alone={false} editAreasConf={itemConfigs}
                                                       index={x}   />;
              moreItems.push(createItem(area.tag, rowHead));
            });
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId, theme]);

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

