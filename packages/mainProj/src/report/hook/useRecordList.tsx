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
                              modAction: string, verId: string, nestMdConfig?: string, titleRender?: (store: any) => React.ReactNode
) {
    const {redId,nestMd,action}=useSubNestAcion(modAction);   //动态解析URL路由转换可能出现的分项报告模板
    // const qs= queryString.parse(window.location.search);   //确保点击?&from=X 参数变动也能够刷新。
    const {storage, setStorage} =useStorage();
    const iDskey= '_'+nestMdConfig;
    // const rskey= '_'+nestMdConfig+'_'+redId;  带分项报告的机制：
    const { [iDskey]: SubRepIds }=storage;
    //印象派的项目列表需对应Ref=[...recordPrintList.length, 后面的]  ？分项报告有redoId重复的倍数。
    // let editorRefCount=recordPrintList.length;      //+maxItemsSeq 伸展开的电梯item1.1列表编辑区域数量;
    //【奇怪】有时重启才会报错：违反hook规则？useProjectListAs因为是hook函数不能放在三元表达式中，但是参数就不管了。
    // const refCount=(action==='ALL')? editorRefCount*(nestMdConfig? (SubRepIds?.length||1) : 1)  : 0;
    // const clRefs =useProjectListAs({count: refCount } );
    //同名字的字段：清除／覆盖，编辑器未定义的字段数据可保留。[分项_2]{}如何正常合并？只有ALL printAll才会用到这的。
    // const outCome=(action==='ALL')? (
    //         nestMdConfig? mergeEditorItemSubRefs([], SubRepIds, nestMdConfig!, editorRefCount,storage, redId)
    //             : storage
    //     )
    //     : null;
    //旧模式两次暴露传递，返回给爷辈组件。
    const [doConfirmModify, setDoConfirmModify] = React.useState(false);
    //这个用在：框架右边页面菜单上"全部项目一起确认" 点击收集数据setDoConfirmModify=。然后底下的副作用React.useEffect(自动收集存储。”确认“后再保存。当一个区块不允许点击因ref空的!
    // React.useImperativeHandle( ref,() => ({
    //     doConfirm: (action==='ALL')? setDoConfirmModify: noOp
    // }), [setDoConfirmModify, action] );
    const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);
    //点按钮后outCome先要render一次获得最新值；必须从false到true的变化才能触发执行。 true->true不能执行的。 useLayoutEffect
    // React.useEffect(() => {
    //     if(doConfirmModify){
    //         setStorage({...storage, ...outCome});
    //         setDoConfirmModify(false);
    //     }
    // }, [doConfirmModify, outCome, storage, setStorage] );

    const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
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
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            alone: true,
                            // refWidth: widthMyLinec,
                            rep,
                        })
                    }
                </React.Fragment>;
            }else if(action==='ALL'){
                if(redId || !nestMdConfig)
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
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            // refWidth: widthMyLinec,
                            rep,
                        });
                    });
                else return  SubRepIds?.map((redId: string, k: number)=>{
                    //可重复的分项报告 k个；  暂不考虑印象派模式的；
                    return recordPrintList.map((each, i) => {
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            // ref: clRefs.current![i+ k*editorRefCount],
                            show: false,
                            alone: false,
                            repId: rep?.id,
                            key: i,
                            redId,
                            nestMd: nestMdConfig,
                            verId,       //内嵌模式的分项模式的版本号只能听从主报告配置的。
                            // refWidth: widthMyLinec,
                            rep,
                        });
                    });
                });
            }else if(action==='_Controller'){
                return <> {view} </>;
            }
            return  null;
        }
        ,[action, rep, SubRepIds,nestMdConfig,redId, verId,recordPrintList,view]);

    const list=(
     <div id="allOrgEdt">
         {recordList}
     </div>
  );
  return { list };
}
