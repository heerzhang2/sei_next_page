/** @jsxImportSource @emotion/react */
import * as React from "react";
import { OriginalViewProps, } from "../../common/base";
import {
    EntranceSetup, config设备概况, config观测数据,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {DeviceSurvey, } from "../../elevator/editor";
import {FrontCover, ItemConclusion, } from "../../mobilecr/editorIN";
import {DoorGap, } from "./editor";
import {WitnessSound} from "../sundryDj/editor";
import {ActionMapItemLikeSundJj} from "../ActionMapItemLikeSundJj";
import {MeasureCritMem} from "../../hook/useMeasure";
import {SiteConditionSund} from "@/report/common/editor";


const 大备注可选: string[] | undefined=[
];
const 见证资料选=['1、资料名称《xxxx》，编号：'  ];

export const tItems现场=[
    ['1、机房或者机器设备间的空气温度',{f:'T',
        N: <Text>1、机房或者机器设备间的空气温度保持在5℃～40℃之间；（单位：℃）</Text>},],
    ['2、电源输入电压波动在额定电压值范围',{f:'y',
        N: <Text>2、电源输入电压波动在额定电压值±7％的范围内；（单位：V ）</Text>},],
    ['3、相关区域没有与电梯运行无关的物品和设备',{f:'x',
        N: <Text>3、相关区域没有与电梯运行无关的物品和设备，进行了必要的封闭和防护，放置表明正在进行检验的警示标志；</Text>},],
    ['4、施工单位安排专业技术人员配合',{f:'P',
        N: <Text>4、实施电梯安装、改造、重大修理的施工单位安排了专业技术人员，配合检验人员实施现场检验。</Text>},]
];

//【暂时考虑】 复检：主要检验仪器设备性能检查 八、复检记录 九、复检综合结论 十、复检备注 附录A2：现场检验条件 ：这几部分取舍待决定，和其它报告不统一。
//？ 监督检验:不存在复检的做法？
const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurvey config={config设备概况} label={'二、设备概况'}>
            </DeviceSurvey>),
    createItem('Item', null),
    //没有做 createItem('ReCheck', <ItemRecheckOmniOther label={'四、检验不符合项目记录及复检结果'} setup={setupItemAreaRoute}/>),
    createItem('Conclusion', <ItemConclusion startd={true} label={'四、现场检验意见'} nxtstyp={'检验（检测）'}/>),
    createItem('Witness', <WitnessSound label={'五、见证 六、备注'} titles={['五、见证资料','六、备注']} memolist={大备注可选} witnlist={见证资料选}
                         children={[null,
                             <React.Fragment key={12}>注：本备注栏的内容在检验报告附件的备注栏内体现。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <MeasureCritMem config={config观测数据} label={'七、观测数据及测量结果记录'}>
         注：本表所列项目无测量时，观测数据和测量结果可不填，但结果判定应填写，对不适用项填“/”。
          </MeasureCritMem>),
    createItem('Gap', <DoorGap/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录B：现场检验条件确认'}/>),
];


export const OriginalView=
  React.forwardRef((
    { action,  verId, repId='', rep,}
    :OriginalViewProps, ref
  ) => {
    const context =React.useContext(EditStorageContext);
    if(context == null)    throw new Error("EditStorageContext没有提供");
    const {storage, } =context;
    const theme = useTheme();
    //impressionismAs若有动态增加的编辑区就会可能出现hook报错！！干脆固定加一个空的区域（用户项目有没有都会出现的编辑区也即对应createItem()）。
    //初始化，印象派形式的动态构建的项目列表： 目前只有一个的印象派扩展标签。
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
            //动态 扩充{检验项目配置办法的}编辑区： 目前只有一个的印象派扩展标签ItemArs对应的是'Item-'。 ['Item-', ]
            itemConfigs.forEach((area, x) => {
              seq += 1;
              const rowHead =<ActionMapItemLikeSundJj key={seq} alone={false} editAreasConf={itemConfigs}
                                                     index={x}   />;
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

