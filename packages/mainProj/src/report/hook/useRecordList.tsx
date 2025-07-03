"use client"
import * as React from "react";
import { useStorage} from "../StorageContext";
import {useThrottle} from "../../hooks/useHelpers";
import {useSubNestAcion} from "../common/helper";
import {EditorAreaConfig, } from "../common/eHelper";
import {useSubRepController} from "./useSubRepController";

/**起重监督检验的 范本； 支持分项报告的原始记录
 * ref: useImperativeHandle， throttledSetDoConfirmModify， doConfirm，outCome，refCount 都已经作废：
 * */
export function useRecordList(rep: any, recordPrintList: EditorAreaConfig[],
                              modAction: string, verId: string, nestMdConfig?: string
) {
    const action=modAction;   //动态解析URL路由转换可能出现的分项报告模板
    const [doConfirmModify, setDoConfirmModify] = React.useState(false);
    const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);

    // const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
    // const [refMyLineC,widthMyLinec]= useReferenceWidth();

    // const {impressionism, setImpressionism} =React.useContext(EditStorageContext) as any;
    // console.log('装配印象impressionismrecordPrintList=',recordPrintList);

    // const {generalFormat} =useItemNoRoutePercept({verId:'1', repId:'2'});
    // // console.log('装配起印象impressionism:', Reflect.ownKeys(impressionism));
    // const renderItemsContent =React.useCallback((projList: string) => {
    //     const confList=impressionism[projList] as RecordIspArea[];
    //     let seq = 0;
    //     let htmlTxts =[] as any[];
    //     confList.forEach((area, x) => {
    //         seq += 1;
    //         const rowHead =<ActionMapItems key={seq} ref={clRefs.current![recordPrintList.length+seq-1]}
    //                                       alone={false} show={[action]==='printAll'}
    //                                       config={area}
    //         />;
    //         htmlTxts.push(rowHead);
    //     });
    //     return ( <React.Fragment key={projList}>
    //         {htmlTxts}
    //     </React.Fragment> );
    // }, [[action],  clRefs, impressionism,recordPrintList.length]);

    // //一个可独立路由的编辑器区域：可能有多个的正式报告项目，其中项目有可能是自己拆分的方式做的。路由和编辑器对应。
    // const renderActionArea =React.useCallback((projList: string,prjnos: string) => {
    //     const confList=impressionism[projList] as RecordIspArea[];
    //     let seq = 0;
    //     let htmlTxts =[] as any[];
    //     confList.filter((area) => area.tag === prjnos)
    //         .forEach((area, x) => {          //正常是唯一一个：prjnos标签定位唯一性area。
    //             seq += 1;
    //             const rowHead =<ActionMapItems key={seq} ref={clRefs.current![recordPrintList.length+seq-1]}
    //                                           alone={false} show={[action]==='printAll'}
    //                                           config={area}
    //             />;
    //             htmlTxts.push(rowHead);
    //     });
    //     return ( <React.Fragment key={prjnos}>
    //         {htmlTxts}
    //     </React.Fragment> );
    // }, [[action],  clRefs, impressionism,recordPrintList.length]);

    //去掉了qs,依赖项；
    //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
    const recordList= React.useMemo(() =>
        {
            //【路由器分解】明面上最直观的路由部分，[action]==createItem(itemArea?)。  比如 /__ItemArs-2.1.2 自己做路由的？
            // let projetLists =Reflect.ownKeys(impressionism) as string[];
            // const {impresTag,prjnos} =verifyAction([action],projetLists);
            // if(impresTag)       //配置文件=印象派模式 ；通常为规整一致的项目列表 可形式化配置的，x.y.z标签对应的路由。
            //     return renderActionArea(impresTag,prjnos!);
            const itemA=recordPrintList.find((one)=>one.itemArea===action);
            if(itemA){
                return <React.Fragment>
                    {
                        React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
                            ref: null,
                            key: itemA.itemArea,
                            repId: rep?.id,
                            show: true,
                            // redId,
                            verId,
                            alone: true,
                            // refWidth: widthMyLinec,
                            rep,
                        })
                    }
                </React.Fragment>;
            }else if(action==='ALL'){
                    return recordPrintList.map((each, i) => {
                        // if(each.itemArea.startsWith("__")){         //印象派的项目列表区域:印象派模式的；
                        //     let map = new Map(Object.entries(impressionism));
                        //     for(let [key, value] of map){
                        //         if(each.itemArea=== `__${key}-`)
                        //             return  renderItemsContent(key);        //应该不止唯一个印象派key
                        //     }
                        //     throw new Error(`没做模板区`+each.itemArea);
                        // }
                        // else
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            // ref: clRefs.current![i],
                            show: false,
                            alone: false,
                            repId: rep?.id,
                            key: i,
                            // redId,
                            verId,
                            // refWidth: widthMyLinec,
                            rep,
                        });
                    });
            }
            return  null;
        }
        ,[action, rep, verId,recordPrintList]);

    const list=(
     <div id="allOrgEdt" className={"mt-4 mb-8"}>
         {recordList}
     </div>
  );
  return { list };
}
