/** @jsxImportSource @emotion/react */
import * as React from "react";
import {  OriginalViewProps,  } from "../../common/base";
import {
  ItemConclusionCr,
  ObservationDrum,
  ItemInstrumentTable,
  DeviceSurvey,
  Evaluation,
  ObservationInsula,
  SafetyDistance, Thickness, Monitoring, Speed, Braking, Stiffness, Magnetic
} from "./orcBase";
import {createItem, } from "../../common/eHelper";
import {ActionMapItems, ActionMapItemsDj, useRecordListSub} from "../hook/useRecordListSub";
import {setupItemAreaRoute} from "./orcIspConfig";
import {EditStorageContext} from "../../StorageContext";
import {useTheme } from "customize-easy-ui-component";
import {ItemRecheckResult} from "../../common/editor";
import {特殊项目编码} from "./FormatOriginal";


//原始记录，一一对应的报告的录入编辑数据，可打印。
//不需要每个verId新搞一个文件的，甚至不需要搞新的组件，可以只需内部逻辑处理。
//分离模式，编辑器脱离不在报告项目文本页面上面组装也就是原位置变换编辑框框或弹出模态对话框来输入的，把编辑器独立分离，点击一块区域路由器跳转独立的编辑页面，不一定一次跳转只针对单一行也能合并多行一起来编辑的。
//自定义路由器的配置拆分URL?action映射到页面组件；对应某报告模板下所有编辑修改组件；原始记录打印展示全部列表。項目標記符不能用ALL none preview printAll item1.1保留字。
//路由名字是非中文的且不可以包含"/"保留符号的。【通常的】用正式报告做导航，所有原始记录编辑区块都能够链接上。而格式化版本原始记录目标是打印用途的可不涉及此类功能。
const recordPrintList =[
  createItem('Instrument', <ItemInstrumentTable/>),
  createItem('Survey', <DeviceSurvey/>),
  createItem('Item', null),
  createItem('Conclusion', <ItemConclusionCr/>),
  createItem('Evaluation', <Evaluation/>),
  createItem('ObservationDrum', <ObservationDrum/>),
  createItem('ObservationInsula', <ObservationInsula/>),
  createItem('SafetyDistance', <SafetyDistance/>),
  createItem('Thickness', <Thickness/>),
  createItem('Monitoring', <Monitoring/>),
  createItem('Speed', <Speed/>),
  createItem('Braking', <Braking/>),
  createItem('Stiffness', <Stiffness/>),
  createItem('Magnetic', <Magnetic/>),
  createItem('ReCheck', <ItemRecheckResult label={'附录13、检验不合格项目内容'} setup={setupItemAreaRoute} noCB={特殊项目编码}/>),
];


//【自定义分区块或分项目编辑器的拼凑】对recordPrintList扩展的;inspectionContent检验项目数量 rowBigItem.items[]每一个items都算单独一个； subItems[],names[''] addNames['']就不算独立的了。
// const maxItemsSeq=getInspectionItemsLength(inspectionContent);

//forwardRef实际上已经没用了，ref，也可改成简易组件模式。
//编辑器右半边页面的组织显示，可自定义，action路由自己构造。编辑器保存通过EditStorageContext来统一做。
//注意storage,outCome的报告存储字段名称唯一性要求！【实际上】单个区单项目编辑没必要加ref=clRefs[]就能够保存数据，全部ALL显示的才用到传递和保存。
//从RecordStarter延续来这里增加态路由赋值的qs参数，recordList= React.useMemo([,qs])配合更新，才能够真正做到点击切换ProjectList?from=5后面的from参数变动可以立刻引起编辑器组件显示内容的render立刻同步变化显示。
export const OriginalView=
  React.forwardRef((
    { action,  verId, repId='', rep,}
    :OriginalViewProps, ref
  ) => {
    const context =React.useContext(EditStorageContext);
    if(context == null)    throw new Error("EditStorageContext没有提供");
    // const {impressionism, setImpressionism} =context;
    // const {generalFormat} =useItemNoRoutePercept({verId:'1', repId:'2'});
    const theme = useTheme();
    //【严重不同于】旧版本：这里动态生成recordPrintList的可扩充项目区组件数组，原先版本是动态解析的做法。
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
            //动态 扩充编辑区： 目前只有一个的印象派扩展标签ItemArs对应的是'Item-'。 ['Item-', ]
            itemConfigs.forEach((area, x) => {
              seq += 1;
              const rowHead =<ActionMapItemsDj key={seq} alone={false} editAreasConf={itemConfigs} index={x}/>;
              moreItems.push(createItem(area.tag, rowHead));
            });
            routeAreas=routeAreas.concat(moreItems);
            prevpos=p+1;
        }
      }
      routeAreas=routeAreas.concat(recordPrintList.slice(prevpos));
      return routeAreas;
    }, [verId, repId, theme]);



    const {list}=useRecordListSub(ref,repId!,recordPrintListNow,action,verId);
    // const urlPrintV=`/originalView/CR-DJ/ver/${verId}/`+ repId+'/printAll';
    // function newJob() {
    //   const urlouter=`${process.env.REACT_APP_WEB}`+ urlPrintV;
    //   const job = {
    //     name: "报告-" + (rep?.isp?.no || '默认报告号的'),
    //     singleTab: true,
    //     lay: {
    //       head: [
    //         '<div style=\\"position: relative; width:100%; text-align:center; border-bottom: 1pt solid #eeeeee; margin: 3.5mm 0px 10px; font-size: 8pt\\"></span>',
    //         '<div style=\\"position: absolute; width:100%; text-align: center; bottom: 5px;\\"><span id=\\"titlespan\\" class=title></div>',
    //         '<div style=\\"-NOT_DISPLAY- position: absolute; text-align: right; bottom: 5px;right: 20px;\\">',
    //         "<span>${pageNumber}</span> / <span>${totalPages}</span></div>",
    //         "</div>",
    //       ],
    //       foot: [
    //         '<div style=\\"position: relative; width: 100%; text-align: left; border-top: 1pt solid #eeeeee; margin:  10px 0px 1.5mm; font-size: 8pt;\\">',
    //         '<div style=\\"position: absolute; text-align: left; top: 5px;left: 60px;\\">YYYY-MM-DD</div>',
    //         '<div style=\\"position: absolute; width: 100%; text-align: center; top: 5px;\\">&copy;2022 ABCD</div>',
    //         '<div style=\\"-NOT_DISPLAY- position: absolute; text-align: right;top: 5px;right: 20px;\\"> <span>${pageNumber}</span> / <span>${totalPages}</span></div>',
    //         "</div>",
    //       ],
    //     },
    //     files: [
    //       {
    //         url: urlouter,
    //         out: "testHtmlPrint转",
    //         headFrom: 2,
    //         frNo: 2,
    //       },
    //     ],
    //   } as unknown as ConfigRoot<FileTransform>;
    //
    //   return job;
    // }
    // const [handleSubmit] = usePrintPdf(newJob);

    return <React.Fragment>
      {list}
    {/*      <Button  intent="primary"
               onPress={(e) => { handleSubmit!();
               }}
      >送打印转换器
      </Button>*/}
    </React.Fragment>;
      //只能用两层嵌套封装，来规避hook遇见条件render的需求。  impressionism &&<>;
      // return  <OriginalViewInner  action={action} verId={verId} repId={repId} ref={ref} recordPrintList={recordPrintListNow}/>;
  } );


