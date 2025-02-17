/** @jsxImportSource @emotion/react */
import * as React from "react";
import {OriginalViewProps } from "../../common/base";
import {
    ItemConclusion,
    DeviceSurvey,
    FrontCover, Stiffness, Witness, SiteCondition, EntranceSetup,
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {useRecordList} from "../../hook/useRecordList";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {Text, useTheme} from "customize-easy-ui-component";
import {ItemRecheckOmni, ObservationMeasure} from "../../common/editor";
import {ItemInstrumentTable} from "../../common/Instrument";
import {ActionMapItemLikeCraneSi} from "../ActionMapItemLikeCraneSi";


/** param t: string,小小项也即每一个行的输入的标题叙述。
 *  param n: 每个字段存储名。
* */
export const config观测数据=[
    [[{n:'物净距',t:'(1)所有运动部分与建筑物净距：a)距固定部分不小于0.05m，b)距栏杆或扶手不小于0.10m，c)距出入区0.50m',u:'m'},
        {n:'限直距',t:'(2)-1各运动部分的下界限线与下方的一般出入区之间的垂直距离不应小于1.7m',u:'m'},
        {n:'准杆垂距',t:'(2)-2各运动部分的下界限线与通常不准人出入的下方的固定或活动部分及与栏杆顶部的垂直距离不应小于0.5m',u:'m'},
        {n:'上固垂距',t:'(3)各运动部分的上界限线与上方的固定或活动部分之间的垂直距离',u:'m'},
        {n:'输电小距',t:'(4)与输电线最小距离',u:'m'}, {n:'裸滑围距',t:'(5)起重机械馈电裸滑线与周围设备的安全距离',u:'m'},
        ],  '2.2',undefined,undefined,<Text>2.2有6个小项目：</Text>],
    [[{n:'大车轨间',t:'大车',u:'mm'},{n:'小车轨间',t:'小车',u:'mm'}],'5.11',undefined,'(1)',<Text>扫轨板下端距轨面间隙不大于10mm：</Text>],
    [[{n:'TN接Ω',t:'(1)TN接地系统零线重复接地接地电阻不大于10Ω',u:'Ω'},{n:'TT接Ω',t:'(2)TT接地系统接地电阻不大于4Ω',u:'Ω'},
        {n:'IT接Ω',t:'(2)IT接地系统接地电阻不大于4Ω',u:'Ω'}
        ],  '8.9.2.2',undefined,'(1)',<Text>8.9.2.2有3个小项目：</Text>],
    [[{n:'对地阻',t:'对地绝缘电阻',u:'MΩ'}],'8.10',undefined,'(1)',<Text>电气线路对地绝缘电阻,额定电压不大于500V时,不低于 1.0MΩ。防爆起重机不低于1.5MΩ。</Text>],
    [[{n:'绝绝缘',t:'绝缘起重的绝缘值',u:'MΩ'}],'8.10',undefined,'(2)',<Text>绝缘起重机械，电气线路对地、吊钩与滑轮、起升机构 与小车架、小车架与大车的绝缘值均不低于1.0 MΩ。</Text>],
    [[{n:'安电压',t:'安全电压',u:'V'}],'8.11',undefined,'(1)',<Text>可移动式照明安全电压。</Text>],
    [[{n:'净空高',t:'11.2.1(1)斜梯、通道和平台的净空高度',u:'m'},
        {n:'净宽',t:'11.2.1(1)运动部分附近的通道和平台的净宽度',u:'m'},
        {n:'道净宽',t:'11.2.1(1)固定部分通道净宽度',u:'m'},
        {n:'杆上高',t:'11.2.3(2)栏杆上部表面高度',u:'m'},
        {n:'杆下高',t:'11.2.3(2)栏杆下部踢脚板高度',u:'m'},
    ],  '11.2.1/11.2.3',undefined,undefined,<Text>11.2有3+2共5个小项目：</Text>],
];


//原始记录，一一对应的报告的录入编辑数据，可打印。
const 观测tail=<div>
    <Text>注1：对于2.2项、11.2项，只有在宏观检查初步判定结果不符合要求时，才需测量相关数据。<br/>
    注2：本表未测量的，观测数据和结果值可不填，检验结果应填。对不适用项填 /。</Text>
</div>;
const recordPrintList =[
    createItem('Entrance', <EntranceSetup/>),
    createItem('FrontCover', <FrontCover/>),
    createItem('Instrument', <ItemInstrumentTable label={'一、主要检验仪器设备性能检查'} />),
    createItem('Survey', <DeviceSurvey/>),
    createItem('Item', null),
    createItem('Conclusion', <ItemConclusion/>),
    createItem('Witness', <Witness/>),
    createItem('ReCheck', <ItemRecheckOmni  label={'四、检验不合格记录'} setup={setupItemAreaRoute}/>),
    createItem('Measure', <ObservationMeasure config={config观测数据} label={'九、观测数据及测量结果记录'} tailview={观测tail}/>),
    createItem('Stiffness', <Stiffness/>),
    createItem('SiteCondition', <SiteCondition/>),
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
              const rowHead =<ActionMapItemLikeCraneSi key={seq} alone={false} editAreasConf={itemConfigs}
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

