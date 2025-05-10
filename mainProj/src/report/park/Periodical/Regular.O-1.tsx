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
import {FrontCover, ItemConclusion, } from "../../mobilecr/editorIN";
import {WitnessParkDj,} from "./editor";
import {GenCode} from "../../common/GenCode";
import {ActionMapItem} from "../../common/ActionMapItem";
import {config记录} from "./FormatOriginal";
import {MeasureCritMem} from "../../hook/useMeasure";
import {Thickness} from "../../tower/craneJj/editThicknes";
import {config梯子, MagneticLeak, MoveSpeed} from "../editor";
import {Braking} from "../../tower/craneJj/editBraking";
import {Synchronization} from "./Synchronization";
import {ParkSpecial} from "./ParkSpecial";
import {ItemRecheckOmniOther, SiteConditionSund} from "../../common/editor";


import {DeviceSurveyD} from "@/report/common/survey";


export const tItems现场=[
    ['1、动力源、环境温度、风速',{f:'T',
        N: <Text>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</Text>},],
    ['2、不得有易燃、易爆',{f:'y',
        N: <Text>2、检验现场不得有易燃、易爆以及腐蚀性气体</Text>},],
];


const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurveyD config={config设备概况} label={'二、设备概况'}/>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion startd={false} label={'四、现场检验意见'}/>),
    createItem('Witness', <WitnessParkDj label={'五、见证资料 六、备注'} titles={['五、技术资料和工作见证材料','六、备注']}
                         children={[null,
                             <React.Fragment key={12}>注：本备注栏的内容在检验报告附件的备注栏内体现。</React.Fragment>
                         ]}
                    />),
    createItem('Measure', <MeasureCritMem config={config观测数据} mem='观测备注' label={'附录1 观测值及测量结果记录表'}>
            注：1、未测量或无需测量的，仅填检验结果栏。
            2、其他需记录的测量值和结果值填在备注栏中。
            3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
            4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
        </MeasureCritMem>),
    createItem('Thickness', <Thickness label={'附录2：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表'}/>),
    createItem('Ladder', <MeasureCritMem config={config梯子} mem='梯子备注' label={'附录3：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}>
        注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
        2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
        </MeasureCritMem>),
    createItem('MoveSpeed', <MoveSpeed label={'附录4：C4.3.2.1各机构运行速度记录表'}/>),
    createItem('Braking', <Braking noAux label={'附录5：C4.3.2.2起升机构制动距离记录表'}>
        注：1、对于产品标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对制动距离都没有规定的，相应的制动距离可不测量。
        2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
        </Braking>),
    createItem('Synchronization', <Synchronization label={'附录6：C4.3.2.3各机构同步性能记录表'}/>),
    createItem('ParkSpecial', <ParkSpecial/>),
    createItem('MagneticLeak', <MagneticLeak label={'附录8：C4.9.8.1漏磁检查记录表'}/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录9：现场检验条件确认'}/>),
    createItem('ReCheck', <ItemRecheckOmniOther label={'附录10、检验不合格项目内容'} setup={setupItemAreaRoute}/>),
];
// if(process.env.REACT_APP_TEST==='true')  recordPrintList.splice(0,0,createItem('GenCode', <GenCode type='两栏新常态'/>));


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
