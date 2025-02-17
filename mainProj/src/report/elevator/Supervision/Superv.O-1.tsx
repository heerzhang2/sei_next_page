/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps } from "../../common/base";
import {
    ItemConclusionCr,
    ItemInstrumentTable,
    DeviceSurvey,
    ObservationRoom,
    ObservationSheet,
    GuideRail,
    Headspace,
    Pitspace,
    DoorGap,
    Equilibrium, Witness
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Input, InputLine, LineColumn, useTheme} from "customize-easy-ui-component";
import {ActionMapItemLikeElevator} from "../ActionMapItemLikeElevator";
import {RecordIspArea} from "../../common/config";
import {ItemRecheckResult} from "../../common/editor";

//原始记录，一一对应的报告的录入编辑数据，可打印。
const recordPrintList =[
    createItem('Survey', <DeviceSurvey/>),
    createItem('Instrument', <ItemInstrumentTable/>),
    createItem('Item', null),
    createItem('ReCheck', <ItemRecheckResult label={'四、检验不合格记录'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ItemConclusionCr/>),
    createItem('Witness', <Witness/>),
    createItem('ObservationRoom', <ObservationRoom/>),
    createItem('ObservationSheet', <ObservationSheet/>),
    createItem('GuideRail', <GuideRail/>),
    createItem('Headspace', <Headspace/>),
    createItem('Pitspace', <Pitspace/>),
    createItem('Gap', <DoorGap/>),
    createItem('Equilibrium', <Equilibrium/>),
];

/**自定义的 附加存储字段： 多余的‘确认日期录入’
 * */
export const 特殊项目存储 =((area:RecordIspArea,par:any,fields:any) => {
    if("1.1"===area?.tag)
        fields[`安装资料_S2`]= par[`安装资料_S2`];
  return fields;
});
/**存在？ 特别的输入和显示安排的情况： 避免大规模的组件复用组合的 逻辑判定的参数？
 * 直接修改通用的hook函数内部逻辑； 1.2确认日期拆分成了两个一半做一个日期
 * @return :DOM数组  React.ReactNode；
 * */
const 确认日期录入 =(({inp,setInp,tago, tagX,tagY,tagZ} :any) => {
    const nodes=<>
        { tagX===1 && tagY===2 ? <>
             <LineColumn column={4} >
                <InputLine label={`1.2（1-3）确认日期`}>
                    <Input type='date' value={(inp?.[`${tago.name}_S`]) || ''} onChange={e => {
                        inp[`${tago.name}_S`] = e.currentTarget.value || undefined;
                        setInp({ ...inp });
                    }}
                    />
                </InputLine>
                <InputLine label={`1.2（4-6）确认日期`}>
                    <Input type='date' value={(inp?.[`${tago.name}_S2`]) || ''} onChange={e => {
                        inp[`${tago.name}_S2`] = e.currentTarget.value || undefined;
                        setInp({ ...inp });
                    }}
                    />
                </InputLine>
             </LineColumn>
            </>
            :
            <InputLine label={`${tagX}${tagY>0&&('.'+tagY)}${tagZ>0&&('.'+tagZ)||''}${(tago.t!)>0&&('.'+tago.t)||''} 确认日期`}>
                <Input type='date' value={(inp?.[`${tago.name}_S`]) || ''} onChange={e => {
                    inp[`${tago.name}_S`] = e.currentTarget.value || undefined;
                    setInp({ ...inp });
                }}
                />
            </InputLine>
        }
    </>
    return nodes;
});

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
              const rowHead =<ActionMapItemLikeElevator key={seq} alone={false} editAreasConf={itemConfigs} index={x}
                                                        custST={特殊项目存储}  sureCB={确认日期录入}
                  />;
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
