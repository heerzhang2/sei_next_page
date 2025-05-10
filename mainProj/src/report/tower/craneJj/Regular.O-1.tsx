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
import {ItemRecheckOmniR, SiteConditionSund,} from "../../common/editor";
import {ItemInstrumentTable} from "../../common/Instrument";
import {DeviceSurvey, } from "../../elevator/editor";
import {FrontCover, ItemConclusion, } from "../../mobilecr/editorIN";
import {WitnessCr3Tower} from "../editorJj";
import {ActionMapItemLikeParkJj} from "../../park/ActionMapItemLikeParkJj";
import {AxisVert} from "./editAxisVert";
import {config距离, SafeDistance} from "./editSafDist";
import {config几何尺寸, Geometric} from "./editGeometr";
import {Thickness} from "./editThicknes";
import {config梯子, Ladder} from "./Ladder";
import {MonitoringSys} from "./editMonitori";
import {WeightCorrespond} from "./editWeight";
import {WeightAmplitude} from "./editAmplitu";
import {Braking} from "./editBraking";
import {Synchronization} from "./Synchronization";
import {Stiffness} from "./editStiffnes";
import {StrainStress} from "./editStrainS";
import {AttachmentDevice} from "./editAttachD";
import {ObservationMeasure} from "../../gantry/editorDj";


const default见证 =[{no:'ZLQR',ti:'资料审查确认单'},{no:'ZJBG',ti:'塔式起重机施工过程自检报告'},{ti:'起重机械选型和基础验收证明'},{ti:'起重机械试验载荷证明'}];
const default记事=[{nm:'检验意见通知书'},];
export const tItems现场=[
    ['1、动力源、环境温度、海拔高度、风速',{f:'T',
        N: <Text>1、试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</Text>},],
    ['2、不得有易燃、易爆以及腐蚀性',{f:'y',
        N: <Text>2、检验现场不得有易燃、易爆以及腐蚀性气体。</Text>},],
];

const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurvey config={config设备概况} label={'二、设备概况'}>
                </DeviceSurvey>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion startd={true} label={'四、结论'}/>),
    createItem('Witness', <WitnessCr3Tower label={'五、技术资料和工作见证材料 六、记事 七、备注'} titles={['五','六','七']} defWitn={default见证} defNote={default记事}>
            <></>
            <>注：本备注栏的内容在检验报告附件的备注栏内体现。</>
            </WitnessCr3Tower>),
    createItem('Measure', <ObservationMeasure config={config观测数据} label={'附录1 观测值及测量结果记录表'}>
            注：1、未测量或无需测量的，仅填检验结果栏。
            2、其他需记录的测量值和结果值填在备注栏中。
            3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
            4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
          </ObservationMeasure>),
    createItem('AxisVert', <AxisVert label={'附录2：C3.2塔身轴心线的垂直度测值及测量结果记录表'}/>),
    createItem('SafeDistance', <SafeDistance config={config距离} label={'附录3：C3.3 安全距离观测值及测量结果记录表'}/>),
    createItem('Geometric', <Geometric config={config几何尺寸} label={'附录4：C3.6主要几何尺寸观测值及测量结果记录表（适于改造监检）'}/>),
    createItem('Thickness', <Thickness label={'附录5：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表'}/>),
    createItem('Ladder', <Ladder config={config梯子} label={'附录6：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>),
    createItem('Monitoring', <MonitoringSys label={'附录7：C4.2.2.5和C4.9.7安全监控管理系统参数验证表'}/>),
    createItem('WeightCorrespond', <WeightCorrespond label={'附录8：表一：最大幅度相应的额定起重量'}/>),
    createItem('WeightAmplitude', <WeightAmplitude label={'附录8：表二：最大额定起重量相应的最大幅度'}/>),
    createItem('Braking', <Braking label={'附录9：C4.3.2.2起升机构制动距离记录表'}/>),
    createItem('Synchronization', <Synchronization label={'附录10：C4.3.2.3各机构同步性能记录表'}/>),
    createItem('Stiffness', <Stiffness label={'附录11 C4.3.2.5塔式起重机静态刚度测量记录'}/>),
    createItem('StrainStress', <StrainStress label={'附录12：C4.8.1应变应力测试记录表'}/>),
    createItem('SiteCondition', <SiteConditionSund config={tItems现场} label={'附录13：现场检验条件确认'}/>),
    createItem('Attachment', <AttachmentDevice nos={'14'} label={'附录14 C3.4附设装置检验项目'}/>),
    createItem('ReCheck', <ItemRecheckOmniR label={'附录8 检验不合格项目内容'} setup={setupItemAreaRoute}/>),
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
              const rowHead =<ActionMapItemLikeParkJj key={seq} alone={false} editAreasConf={itemConfigs}
                                                       index={x}   />;
              moreItems.push(createItem(area.tag, rowHead));
            });
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId,rep, theme]);

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
