/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps } from "../../common/base";
import {
    EntranceSetup,
    config设备概况,
    config观测数据2,
    config观测数据,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Input, InputLine, useTheme} from "customize-easy-ui-component";
import {ItemRecheckOmni, } from "../../common/editor";
import {ItemInstrumentTable} from "../../common/Instrument";
import {
    ItemConclusion,
} from "../../park/editor";
import {ActionMapItemLikeElevatorJj} from "../ActionMapItemLikeElevatorJj";
import {RecordOmniArea} from "../../common/omni";
import {ObservationMeasure} from "../../hook/useMeasure";
import {DeviceSurvey, GuideRail, Headspace, Pitspace, SiteConditionElev,} from "../editor";
import {DoorGap61, WitnessElevJj1} from "../editorJJ";
import {EquilibriumC} from "../editorTest";
import {FrontCover} from "../../safe/elevator/orcBase";

//编辑器的列表： 简易版原始记录打印的依据。
const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'二、主要测量设备性能检查'} />),
    createItem('Survey', <DeviceSurvey config={config设备概况} label={'一、设备概况'}>
            检验依据：1、TSG T7001-2009 《电梯监督检验和定期检验规则－曳引与强制驱动电梯》及1号、2号、3号修改单；
            2、《福建省电梯安全管理条例》
            注：“检验结果”栏：可用以下五种符号表示记录内容：：“√”表示“符合”；“/”表示“无此项”；“▽”表示“资料
            确认符合”，“×”表示“不符合”，“△”表示“无法检测”。
            </DeviceSurvey>),
    createItem('Item', null),
    createItem('ReCheck', <ItemRecheckOmni label={'四、检验不合格记录'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ItemConclusion label={'五、现场检验意见'}/>),
    createItem('Witness', <WitnessElevJj1 label={'六、见证材料 七、备注'} titles={['六','七']}/>),
    createItem('Measure', <ObservationMeasure config={config观测数据} label={'八、观测数据及测量结果记录(上)'}>
                    注：注：本表所列项目检验人员无测量的，观测数据和观测结果可不填写，但结果判定要填写，不适用的项填“/"。
                </ObservationMeasure>),
    createItem('Measure2', <ObservationMeasure config={config观测数据2} label={'八、观测数据及测量结果记录(下)'}>
                    注：注：本表所列项目检验人员无测量的，观测数据和观测结果可不填写，但结果判定要填写，不适用的项填“/"。
                </ObservationMeasure>),
    createItem('GuideRail', <GuideRail label={'附录A 电梯导轨检验记录'}/>),
    createItem('Headspace', <Headspace label={'附录B 当对重压实缓冲器时，顶部空间数据的测量记录'}/>),
    createItem('Pitspace', <Pitspace label={'附录C：当轿厢压实缓冲器时，底坑空间数据的测量记录'}/>),
    createItem('Gap', <DoorGap61 label={'附录D 电梯层门间隙、门锁啮合深度等检验记录'}/>),
    createItem('Equilibrium', <EquilibriumC label={'附录E 8.1B平衡系数试验和8.8C电梯速度检验记录'} config={[30,40,45,50,60,100,110]}/>),
    createItem('SiteCondition', <SiteConditionElev label={'附录F：现场检验条件确认'}/>),
];


/**自定义的 附加存储字段： 多余的‘确认日期录入’
 * */
export const 特殊项目存储 =((area:RecordOmniArea,par:any,fields:any) => {
    if("1.1"===area?.tag)
        fields[`自检报_S`]= par[`自检报_S`];
    return fields;
});
/**特殊的存在 1.2确认日期：拆分成了两个一半做一个日期
 * */
const 确认日期录入 =(({inp,setInp,config,tago,addMemo,icname} :any) => {
    if(config.tag==='1.1'){
        if(tago.mergNos==='1.2') {
            // console.log("Rer特殊输入显示000=", config,"seq=",tago,icname,addMemo);     【正好相反地顺序】
            return <InputLine label={`1.2 ( 4 - 6 )确认日期`}>
                <Input type='date' value={(inp?.[`自检报_S`]) || ''} onChange={e => {
                    inp[`自检报_S`] = e.currentTarget.value || undefined;
                    setInp({ ...inp });
                }}/>
            </InputLine>
        }
        else if(tago.nos==='1.2(3)') {
            // console.log("Rer特殊输入显示0WWE=", config,"seq=",tago,icname,addMemo);
            return <InputLine label={`1.2 ( 1 - 3 )确认日期`}>
                <Input type='date' value={(inp?.[`安装资料_S`]) || ''} onChange={e => {
                    inp[`安装资料_S`] = e.currentTarget.value || undefined;
                    setInp({ ...inp });
                }}/>
            </InputLine>
        }
    }
    return  addMemo && <>
        <InputLine label={`${tago.mergNos??tago.nos??''} 确认日期`}>
            <Input type='date' value={(inp?.[`${icname}_S`]) || ''} onChange={e => {
                inp[`${icname}_S`] = e.currentTarget.value || undefined;
                setInp({ ...inp });
            }}/>
        </InputLine>
    </>;
});


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
              const rowHead =<ActionMapItemLikeElevatorJj key={seq} alone={false} editAreasConf={itemConfigs}
                                                       index={x}  custST={特殊项目存储}  sureCB={确认日期录入} />;
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

