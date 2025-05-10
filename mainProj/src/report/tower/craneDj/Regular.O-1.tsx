/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps, } from "../../common/base";
import {EntranceSetup, config设备概况, config观测数据,} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {FrontCover, ItemConclusion} from "../../mobilecr/editorIN";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {RecheckEditor, SiteConditionSund} from "../../common/editor";
import {MeasureJudgmentMem, } from "../../amusement/editor";
import {WitnessParkDj} from "../../park/Periodical/editor";
import {Thickness} from "../../tower/craneJj/editThicknes";
import {config梯子, Ladder} from "../craneJj/Ladder";
import {MonitoringSys} from "../../tower/craneJj/editMonitori";
import {config距离, SafeDistance} from "../../tower/craneJj/editSafDist";
import {AxisVert} from "../../tower/craneJj/editAxisVert";
import {AttachmentDevice} from "../../tower/craneJj/editAttachD";
import {DeviceSurveyD} from "@/report/common/survey";

//方便调试和生成代码：   ,"pr":"※","ses":6  "r":3,"s":1,  ## "s":9非自拆分的同一个项目编号有多行小项目。
const defFrameM={
    'Rec3ClRep2Cl': `{ "mg":2, "dcl":"","cl":"",
         "sk":[ {"no":"2.2.8", "r":0 },  
           { "no":"3.4", "r":0 ,"big":"HH"},  
           { "no":"3.5.3", "r":0 ,"ses":1}
         ]
    }`,
    'New2ColBigSpl': `{ "mg":2, "dcl":"","cl":"",
         "sk":[ {"no":"11.10", "r":0 }, { "r":[2] },  {"big":"","no":"12.1", "r":0 }, 
             {"no":"12.4", "r":0 }
         ]
    }`,
    'CmnTowerCrane': `{ "mg":2, "dcl":"C","cl":"C",
           "sk":[ {"no":"5.1", "r":6, "bs":[6], "vx":1 }
           ]
      }`,
};
//三个正式报告的项目：
const defTitle=
    `安全监控管理系统信息采集源
控制
零件状况
`;
//分隔开两个子项目的文本： 一个空行！【特别小心】有没有空格的的看起来像空行!!!
const defDesc=
    `电气的配置应符合以下的规定和设计文件的要求。
(12)电动保护 
(13）电气保护装置的配置应符合设计文件的要求。
`;

export const tItems现场=[
    ['1、动力源、环境温度、海拔高度、风速',{f:'T',
        N: <Text>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</Text>},],
    ['2、不得有易燃、易爆以及腐蚀性',{f:'y',
        N: <Text>2、检验现场不得有易燃、易爆以及腐蚀性气体。</Text>},],
];

//原版本记录比较怪异： 八、复检记录和不合格表分离，复检结果 结论还单独设立的，而且仪器表2份，附录A1 A2现场检测条件2份；四、首次检验不合格项目记录
//另外还附上： 九、复检综合结论 十、复检备注 “？？” 像是：复检的没有重新做一份报告的模式。五、综合结论六、备注
const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion startd={false} label={'四、结论'} nxtstyp={'检验'}/>),
    createItem('Witness', <WitnessParkDj titles={['五、技术资料和工作见证材料','六、备注']} bhTil='编号'
                                         children={[null,<Text key={2}>注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>]}/>),
    createItem('Measure', <MeasureJudgmentMem config={config观测数据}  mem='观测备注'  label={'附录1 观测值及测量结果记录表'}>
            注：1、未测量或无需测量的，仅填检验结果栏。
            2、其他需记录的测量值和结果值填在备注栏中。
            3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
            4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
        </MeasureJudgmentMem>),
    createItem('Thickness', <Thickness label={'附录2：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表'}/>),
    createItem('Ladder', <Ladder config={config梯子} label={'附录3：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>),
    createItem('Monitoring', <MonitoringSys label={'附录4：C4.2.2.5和C4.9.7安全监控管理系统参数验证表'}/>),
    createItem('SafeDistance', <SafeDistance config={config距离} label={'附录5：C5.(3) 安全距离观测值及测量结果记录表'}/>),
    createItem('AxisVert', <AxisVert noZj label={'附录6：C5.(5)塔身轴心线的垂直度测值及测量结果记录表'}/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录7：现场检验条件确认'}/>),
    createItem('Attachment', <AttachmentDevice nos={'8'} label={'附录8 C3.4附设装置检验项目'}/>),
    createItem('ReCheck', <RecheckEditor  label={'附录9 检验不合格项目内容'} setup={setupItemAreaRoute}/>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='CmnTowerCrane'
                                             frameMod={defFrameM} defTitle={defTitle} defDesc={defDesc}/>));


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
