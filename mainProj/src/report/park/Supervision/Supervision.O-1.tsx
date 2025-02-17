/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps } from "../../common/base";
import {
    Witness,
    EntranceSetup,
    ObservationMeasure,
    SafeDistance,
    Geometric, Braking, InstitutionSync, ParkSpecial, config设备概况,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import { useTheme} from "customize-easy-ui-component";
import {ItemRecheckOmni, } from "../../common/editor";
import {ItemInstrumentTable} from "../../common/Instrument";
import {ActionMapItemLikeParkJj} from "../ActionMapItemLikeParkJj";
import {
    DeviceSurvey, FrontCover,
    ItemConclusion,
    Ladder,
    MagneticLeak,
    MoveSpeed,
    SiteConditionPark,
    Thickness
} from "../editor";
// import {FrontCover} from "../../crane/singleBeam/orcBase";   //PARK-JJ模板真引用到了singleBeam的/orcBase文件，报错！Cannot access 'DeviceSurvey' before initialization"


const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurvey config={config设备概况}/>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion label={'四、检验结论'}/>),
    createItem('Witness', <Witness/>),
    createItem('Measure', <ObservationMeasure/>),
    createItem('SafeDistance', <SafeDistance/>),
    createItem('Geometric', <Geometric/>),
    createItem('Thickness', <Thickness label={'附录4：C3.7.3主要受力结构件断面有效厚度观测值及测量结果记录表'}/>),
    createItem('Ladder', <Ladder label={'附录5：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>),
    createItem('MoveSpeed', <MoveSpeed label={'附录6：C4.3.2.1各机构运行速度记录表'}/>),
    createItem('Braking', <Braking/>),
    createItem('InstitutionSync', <InstitutionSync/>),
    createItem('ParkSpecial', <ParkSpecial/>),
    createItem('MagneticLeak', <MagneticLeak label={'附录10：C4.9.8.1漏磁检查记录表'}/>),
    createItem('SiteCondition', <SiteConditionPark label={'附录11：现场检验条件确认'}/>),
    createItem('ReCheck', <ItemRecheckOmni label={'附录12、检验不合格项目内容'} setup={setupItemAreaRoute}/>),
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
      const impressionismAs =setupItemAreaRoute({verId, repId, theme});
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
              const rowHead =<ActionMapItemLikeParkJj key={seq} alone={false} editAreasConf={itemConfigs}
                                                       index={x} />;
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

