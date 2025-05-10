/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps, } from "../../common/base";
import {EntranceSetup, config设备概况, config观测数据, config梯子, } from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemInstrumentTable} from "../../common/Instrument";
import {FrontCover, WitnessCraTwo} from "../../mobilecr/editorIN";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {config检验复检表, RecheckEditor, SiteConditionSund} from "../../common/editor";
import {ConclusionHydlic} from "../../lift/hydlicDj/editor";
import {config距离, SafeDistance} from "../Intial/orcBase";
import {MeasureCritMem} from "../../hook/useMeasure";
import {tail观测} from "../../bridge/erectingDj/orcBase";
import {tail安距, } from "../../gantry/portalJj/orcBase";
import {Thickness} from "../../tower/craneJj/editThicknes";
import {config运行速度, MoveSpeed, tail速度} from "./MoveSpeed";
import {Braking, tail制距} from "./Braking";
import {SpecialTopic, tail流动专} from "./SpecialTopic";
import {MagneticLeak} from "./MagneticLeak";
import {DeviceSurveyD} from "@/report/common/survey";


/*快组织代码的 CmnTowerCrane配置例子， 整个编辑区块统筹：
"sk":[ {"no":"2.1.2(1)", "r":0, "bs":[5],"ss":[2],"ts":[2]},  {"no":"2.1.2(4)","r":0,"ts":[-1]}, {"no":"2.2.4", "r":0, "ss":[3],"ts":[1]}, {"no":"2.2.6", "r":0}, {"no":"2.2.8", "r":0}
"sk":[ {"no":"3.3", "r":0, "bs":[5],"ss":[1] }, 0, {"no":"3.5.1","r":0,"ss":[3],"ts":[1]},0,0      #
"sk":[ {"no":"3.7.1", "r":0, "bs":[8],"ss":[4],"ts":[1]}, 0,0,0, {"no":"3.8.1(1)","r":0,"ss":[4],"ts":[4]},0,0,0    #
"sk":[ {"no":"3.11.3","r":10,"bs":[10,11],"ss":[10,11],"ts":[10,11],"s":9} 【特例】自拆分改成普通项 3.12.4 #关键"s":9参数。
"sk":[ {"no":"3.11.4","r":0,"bs":[13],"ss":[13],"ts":[1]},0,0,0, {"no":"3.11.9","r":9,"ts":[9],"fs":[1],"vx":1} # 普通项改成自拆分；
"sk":[ {"no":"3.12.1","r":0,"bs":[5],"ss":[5],"ts":[1]},0, {"no":"3.12.3.1","r":0,"ts":[3],"fs":[1]},0,0
"sk":[{"no":"4.2.2.1", "r":0, "bs":[5],"ss":[5],"ts":[5],"fs":[1]},0,0,0,0
"sk":[{"no":"4.4.2.1","r":0, "bs":[7],"ss":[3],"ts":[3],"fs":[1]},0,0 , {"no":"4.5.2.1","r":0,"ss":[4],"ts":[4],"fs":[1]},0,0,0
"sk":[{"no":"4.9.7.1", "r":7, "bs":[7],"ss":[7],"ts":[7],"fs":[1],"vx":1} 普通项改自拆分项(旧方案)：手动再修正nos！每行都缺{ four:'C',}
"sk":[{"no":"4.9.8.1","r":0, "bs":[8],"ss":[8],"ts":[7],"fs":[1],"cts":1},0,0,0,0,0, {"Mno":"4.9.8","r":0}, {"no":"4.9.9", "r":0,"ts":[1]} 【特例】普通项改自拆分项
* */
//"pr":"*", "r":3,"s":1, "big":"","bs":[10],"ss":[5,6],"ts":[13,14] ,"vx":1
const defFrameM={
    'CmnTowerCrane': `{ "mg":2, "dcl":"C","cl":"C",
           "sk":[{"big":"", "no":"5", "r":3, "bs":[2,3],"s":1,"vx":1}
     ] }`,
};
//正式报告的PDF直接复制出来的：
const defTitle=
    `(1)主要零部
(2)需要增加
`;
//原始记录复制来的; 分隔开两个子项目的文本： 一个空行！【特别小心】有没有空格的的看起来像空行!!!
const defDesc=
    `（1）特种设
（4）整机型式

整机配套

整机出厂
`;

export const tItems现场=[
    ['1、试验的动力源、环境',{f:'T',
        N: <Text>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</Text>},],
    ['2、现场不得易燃、易爆',{f:'X',
        N: <Text>2、检验现场不得有易燃、易爆以及腐蚀性气体。</Text>},],
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    // createItem('CertificateSummary', <DeviceSurvey config={config证书概要} label={'证书的设备概况部分'}/>),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('Conclusion', <ConclusionHydlic label={'五、综合结论'}/>),
    createItem('Witness', <WitnessCraTwo label={'五、技术资料和工作见证材料 六、备注'} titles={['五','六']}>
            注：本备注栏的内容在检验报告附件的备注栏内体现。
    </WitnessCraTwo>),

    // createItem('Measure', <MeasureJudgmentMem config={config观测数据}  label={'七、观测数据及测量结果记录'}></MeasureJudgmentMem>),
    // createItem('Measure', <ObservationMeasure config={config观测数据} label={'附录1 观测值及测量结果记录表'}/>),
    createItem('Measure', <MeasureCritMem config={config观测数据} mem='观测备注' children={tail观测} label={'附录1 观测值及测量结果记录表'}/>),

    createItem('SafeDistance', <SafeDistance config={config距离} label={'附录2：C3.3 安全距离观测值及测量结果记录表'}>
        {tail安距}
    </SafeDistance>),
    createItem('Thickness', <Thickness nomm label={'附录3：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录'}/>),
    createItem('Ladder', <MeasureCritMem config={config梯子} mem='梯子备注' label={'附录4：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}>
        注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
        2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
    </MeasureCritMem>),
    createItem('MoveSpeed', <MoveSpeed config={config运行速度} sseq={4} children={tail速度} label={'附录5：C4.3.2.1各机构运行速度记录表'}/>),
    createItem('Braking', <Braking children={tail制距} label={'附录6：C4.3.2.2起升机构制动距离记录表'}/>),
    createItem('SpecialTopic', <SpecialTopic children={tail流动专} label={'附录7 C4.3.2.5.4 流动式起重机专项试验'}/>),
    createItem('MagneticLeak', <MagneticLeak label={'附录8：C4.9.8.1漏磁检查记录表'}/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录9：现场检验条件确认'}/>),
    createItem('ReCheck', <RecheckEditor config={config检验复检表} label={'附录10 检验不合格项目内容'} setup={setupItemAreaRoute}/>),
];
if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='CmnTowerCrane' frameMod={defFrameM} defTitle={defTitle} defDesc={defDesc}/>));


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
