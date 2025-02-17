/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps } from "../../common/base";
import {
    ItemConclusion,
    ItemInstrumentTable,
    DeviceSurvey,
    ObservationRoom,
    DoorGap,
    Witness
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {useTheme} from "customize-easy-ui-component";
import {ItemRecheckResult} from "../../common/editor";
import {ActionMapItemLikeElvPeriodical} from "../ActionMapItemLikeElvPeriodical";

//原始记录，一一对应的报告的录入编辑数据，可打印。
const recordPrintList =[
    createItem('Survey', <DeviceSurvey/>),
    createItem('Instrument', <ItemInstrumentTable/>),
    createItem('Item', null),
    createItem('ReCheck', <ItemRecheckResult label={'四、检验不合格记录'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ItemConclusion/>),
    createItem('Witness', <Witness/>),
    createItem('ObservationRoom', <ObservationRoom/>),
    createItem('Gap', <DoorGap/>),
];


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
              const rowHead =<ActionMapItemLikeElvPeriodical key={seq} alone={false} editAreasConf={itemConfigs} index={x} />;
              moreItems.push(createItem(area.tag, rowHead));
            });
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId, theme]);

    const {list}=useRecordList(ref,repId!,recordPrintListNow,action,verId);

    return <React.Fragment>
      {list}
    {/*      <Button  intent="primary"
               onPress={(e) => { handleSubmit!();
               }}
      >送打印转换器
      </Button>*/}
    </React.Fragment>;
  } );
