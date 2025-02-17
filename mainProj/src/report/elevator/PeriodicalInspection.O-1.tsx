/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Button,
} from "customize-easy-ui-component";
import {  OriginalViewProps,  useProjectListAs } from "../common/base";
import {  mergeEditorItemRefs  } from "../tools";
import { EditStorageContext } from "../StorageContext";
import { ItemConclusion, ItemRecheckResult, ItemUniversal } from "./Periodical/orcBase";
import { ItemAppendixB, ItemRemarks } from "./elvBase";
import { ItemGapMeasure, ItemSurveyLinkMan } from "./elvRarelyVary";
import { ItemInstrumentTable } from "./Periodical/eRarelyVary";
import { createItem, getInspectionItemsLength, verifyAction } from "../common/eHelper";
import { inspectionContent } from "./Periodical/repConfig";
import { useGeneralFormat } from "./Periodical/orcConfig";
import { useThrottle } from "../../hooks/useHelpers";

//原始记录，一一对应的报告的录入编辑数据，可打印。
//不需要每个verId新搞一个文件的，甚至不需要搞新的组件，可以只需内部逻辑处理。
//等同一个路由器，显示哪一个的数据编辑器。
//对应某报告模板下所有编辑修改组件；原始记录打印展示全部列表。項目標記符不能用ALL none preview printAll item1.1保留字。
//【显示顺序】ALL路由的情况，这里的排序就是页面列表顺序。
const recordPrintList =[
  createItem('Survey', <ItemSurveyLinkMan/>),
  createItem('Instrument', <ItemInstrumentTable/>),
    //todo:考虑复用代码？；电梯定检类似/6.9的action有大约50条木编辑区块。'item1.1'一个映射的配置指代[]做法的。应该直接生成内嵌入项目区的。
  createItem('item1.1', <ItemUniversal x={0} y={0} inspectionContent={inspectionContent}/>),
    //完全自定义完全动态加载本模板以后才会生成的URL路由：对应`/report/EL-DJ/ver/${verId}/${repId}/gap?&from=6.3`的路由入口。注意关键字"gap";配套路由器的能力。
  createItem('gap', <ItemGapMeasure/>),
  createItem('Appendix', <ItemAppendixB/>),
  createItem('Remark', <ItemRemarks/>),
  createItem('ReCheck', <ItemRecheckResult/>),
  createItem('Conclusion', <ItemConclusion/>),
];
//检验项目数量
const maxItemsSeq=getInspectionItemsLength(inspectionContent);

//forwardRef实际上已经没用了，ref，也可改成简易组件模式。
//因为大部分丢给了inspectionContent所以这里代码范围很少了，都跑到ItemUniversal的配置文件:报告inspectionContent特别是原始记录useGeneralFormat({verId, repId})去了。
export const OriginalView=
  React.forwardRef((
    { action,  verId, repId=''}
    :OriginalViewProps, ref
  ) => {
    const {storage, setStorage} =React.useContext(EditStorageContext) as any;
    const {generalFormat} =useGeneralFormat({verId, repId});
    let editorRefCount=recordPrintList.length+maxItemsSeq;
    const clRefs =useProjectListAs({count: editorRefCount});
    //同名字的字段：清除／覆盖，编辑器未定义的字段数据可保留。
    const outCome=mergeEditorItemRefs( ...clRefs.current! ) as any;
    //旧模式两次暴露传递，返回给爷辈组件。
    const [doConfirmModify, setDoConfirmModify] = React.useState(false);
    React.useImperativeHandle( ref,() => ({doConfirm: setDoConfirmModify }), [setDoConfirmModify] );
    const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);
    //点按钮后outCome先要render一次获得最新值；必须从false到true的变化才能触发执行。 true->true不能执行的。 useLayoutEffect
    React.useEffect(() => {
      if(doConfirmModify){
        setStorage({...storage, ...outCome});
        setDoConfirmModify(false);
      }
   }, [doConfirmModify, outCome, storage, setStorage] );


    const renderItemsContent =React.useMemo(() => {
      let seq = 0;
      let htmlTxts =[] as any[];
      inspectionContent.forEach((rowBigItem, x) => {
        rowBigItem && rowBigItem.items.forEach((item, y) => {
          if(item){
            seq += 1;
            const rowHead =<ItemUniversal key={seq} ref={clRefs.current![recordPrintList.length+seq-1]}  x={x}  y={y}
                                   alone={false} show={action==='printAll'} inspectionContent={inspectionContent}
                                   procedure={generalFormat[x]!.items[y]!.procedure}  details={generalFormat[x]!.items[y]!.details}
            />;
            htmlTxts.push(rowHead);
          }
        });
      });
      return ( <React.Fragment key={'item1.1'}>
        {htmlTxts}
      </React.Fragment> );
    }, [action,  clRefs, generalFormat]);

    //这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
    const recordList= React.useMemo(() =>
      {
        const {isItemNo, x, y} =verifyAction(action,generalFormat);
        if(isItemNo){
          return <React.Fragment>
            <ItemUniversal key={0} ref={null}  x={x!}  y={y!} show={true} inspectionContent={inspectionContent}
                          procedure={generalFormat[x!]!.items[y!]!.procedure}  details={generalFormat[x!]!.items[y!]!.details}
            />
          </React.Fragment>;
        }else{
          const itemA=recordPrintList.find((one)=>one.itemArea===action);
          if(itemA){
            return <React.Fragment>
              {
                React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
                  ref: null,
                  key: itemA.itemArea,
                  repId,
                  show: true
                })
              }
            </React.Fragment>;
          }else if(action==='ALL' || action==='printAll'){
            return recordPrintList.map((each, i) => {
              if(each.itemArea==='item1.1')
                return  renderItemsContent;
              else
                return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                  ref: clRefs.current![i],
                  show: action==='printAll',
                  alone: false,
                  repId,
                  key: i
                });
            });
          }
        }
        return  null;
      }
      ,[action, clRefs,renderItemsContent,generalFormat,repId]);


    return <React.Fragment>
      {recordList}
      { (action==='ALL' || action==='printAll') &&
          <Button size="lg" intent={'primary'}  disabled ={!ready}
                onPress={() =>{
                 //这里派发出去editorSnapshot: outCome {...storage, ...outCome}都是按钮捕获的值，还要经过一轮render才会有最新值。
                 throttledSetDoConfirmModify!(true);
              }
            }>
            全部已编辑项目一起确认
          </Button>
      }
    </React.Fragment>;
  } );



