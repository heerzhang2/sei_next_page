import * as React from "react";
import {useProjectListAs} from "../common/base";
import {mergeEditorItemRefs, mergeEditorItemSubRefs} from "../tools";
import {useThrottle} from "../../hooks/useHelpers";
import {useSubNestAcion} from "../common/helper";
// import {EditStorageContext} from "../StorageContext";
import {EditorAreaConfig} from "../common/eHelper";
import {useSubRepController} from "./useSubRepController";
import {useStorage} from "@/report/StorageContext";


/**【代码复用】分项报告的原始记录 右半边页面内容组织
 * 标签 “_Controller” 是隐含的分项管理。 const { [iDskey]: SubRepIds }=storage;若storage={}为空的必须懒加载下级组件，否则等来了数据导致refCount计算跳变，最后hook爆错
 * */
// export function useRecordListSub(ref: React.Ref<unknown>, repId: string, recordPrintList: EditorAreaConfig[],
//                                  modAction: string, verId: string, nestMdConfig?: string,titleRender?: (store: any) => React.ReactNode
// ) {
//     const {redId,action}=useSubNestAcion(modAction);   //动态解析URL路由转换可能出现的分项报告模板
//     // const qs= queryString.parse(window.location.search);   //确保点击?&from=X 参数变动也能够刷新。
//     const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//     const iDskey= '_'+nestMdConfig;
//     // const rskey= '_'+nestMdConfig+'_'+redId;  带分项报告的机制：
//     const { [iDskey]: SubRepIds }=storage;
//     let editorRefCount=recordPrintList.length;      //+maxItemsSeq 伸展开的电梯item1.1列表编辑区域数量;
//     //【奇怪】有时重启才会报错：违反hook规则？useProjectListAs因为是hook函数不能放在三元表达式中，但是参数就不管了。
//     const refCount=(action==='ALL' || action==='printAll')? editorRefCount*(nestMdConfig? (SubRepIds?.length||1) : 1)  : 0;
//     const clRefs =useProjectListAs({count: refCount } );
//     //同名字的字段：清除／覆盖，编辑器未定义的字段数据可保留。[分项_2]{}如何正常合并？只有ALL printAll才会用到这的。
//     const outCome=(action==='ALL' || action==='printAll')? (
//             nestMdConfig? mergeEditorItemSubRefs(clRefs.current!, SubRepIds, nestMdConfig!, editorRefCount,storage, redId)
//                 : mergeEditorItemRefs( ...clRefs.current! )
//         )
//         : null;
//     //旧模式两次暴露传递，返回给爷辈组件。
//     const [doConfirmModify, setDoConfirmModify] = React.useState(false);
//     //这个用在：框架右边页面菜单上"全部项目一起确认" 点击收集数据setDoConfirmModify=。然后底下的副作用React.useEffect(自动收集存储。”确认“后再保存。当一个区块不允许点击因ref空的!
//     React.useImperativeHandle( ref,() => ({
//         doConfirm: (action==='ALL' || action==='printAll')? setDoConfirmModify: noOp
//     }), [setDoConfirmModify, action] );
//     const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);
//     //点按钮后outCome先要render一次获得最新值；必须从false到true的变化才能触发执行。 true->true不能执行的。 useLayoutEffect
//     React.useEffect(() => {
//         if(doConfirmModify){
//             setStorage({...storage, ...outCome});
//             setDoConfirmModify(false);
//         }
//     }, [doConfirmModify, outCome, storage, setStorage] );
//
//     const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
//     //去掉了qs,依赖项；
//     //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
//     const recordList= React.useMemo(() =>
//         {
//             //【路由器分解】明面上最直观的路由部分，[action]==createItem(itemArea?)。
//             const itemA=recordPrintList.find((one)=>one.itemArea===action);
//             if(itemA){
//                 return <React.Fragment>
//                     {
//                         React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
//                             ref: null,
//                             key: itemA.itemArea,
//                             repId,
//                             show: true,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,
//                         })
//                     }
//                 </React.Fragment>;
//             }else if(action==='ALL' || action==='printAll'){
//                 if(redId || !nestMdConfig)
//                     return recordPrintList.map((each, i) => {
//                         return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
//                             ref: clRefs.current![i],
//                             show: action==='printAll',
//                             alone: false,
//                             repId,
//                             key: i,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,
//                         });
//                     });
//                 else return  SubRepIds?.map((redId: string, k: number)=>{
//                     return recordPrintList.map((each, i) => {
//                         return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
//                             ref: clRefs.current![i+ k*editorRefCount],
//                             show: action==='printAll',
//                             alone: false,
//                             repId,
//                             key: i,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,       //内嵌模式的分项模式的版本号只能听从主报告配置的。
//                         });
//                     });
//                 });
//             }else if(action==='_Controller'){
//                 return <> {view} </>;
//             }
//             return  null;
//         }
//         ,[action, clRefs,repId, SubRepIds,nestMdConfig,redId, verId,recordPrintList,editorRefCount, view]);
//
//     const list=(
//      <>
//          {recordList}
//          { (action==='ALL' || action==='printAll') &&
//              <Button size="lg" intent={'primary'}  disabled ={!ready}
//                      onPress={() =>{
//                          //这里派发出去editorSnapshot: outCome {...storage, ...outCome}都是按钮捕获的值，还要经过一轮render才会有最新值。
//                          throttledSetDoConfirmModify!(true);
//                      }
//                      }>
//                  全部已编辑项目一起确认
//              </Button>
//          }
//      </>
//   );
//
//   return { list };
// }


/**【代码复用】分项报告的原始记录 右半边页面内容组织 :类似于useRecordListSub,参数变化修改名字
 * rep 替代repId;
 * 增加 refWidth 的支持；依靠useSubNestAcion分解出URL的模板+redId+[action];用可重复分项框架模式的只能走动态加载某个路径的组件入口代码。
 * 【实际上】只有正式报告的才会动态加载可重复分项框架模式的代码的；原始记录编辑器部分的就不会这样。【关键】依赖URL分解路由，跳转去不同的子报告单独编辑状态和相应的左边页面以及右边编辑器页面。是拆分掉的独立的模板代码。
 * 因此，可重复分项框架模式下的，也需要像普通报告模板一样必须能从路由器开启的。
 * */
export function useRecordListSubr(rep: any, recordPrintList: EditorAreaConfig[],
                                 modAction: string, verId: string, nestMdConfig?: string,titleRender?: (store: any) => React.ReactNode
) {
    const {redId,action}=useSubNestAcion(modAction);   //动态解析URL路由转换可能出现的分项报告模板
    // const qs= queryString.parse(window.location.search);   //确保点击?&from=X 参数变动也能够刷新。
    const {storage, setStorage} =useStorage();
    const iDskey= '_'+nestMdConfig;
    // const rskey= '_'+nestMdConfig+'_'+redId;  带分项报告的机制：
    const { [iDskey]: SubRepIds }=storage;

    const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
    //去掉了qs,依赖项；
    //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
    const recordList= React.useMemo(() =>
        {
            //【路由器分解】明面上最直观的路由部分，[action]==createItem(itemArea?)。
            const itemA=recordPrintList.find((one)=>one.itemArea===action);
            if(itemA){
                return <React.Fragment>
                    {
                        React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
                            key: itemA.itemArea,
                            repId: rep?.id,
                            show: true,
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            rep,
                        })
                    }
                </React.Fragment>;
            }else if(action==='ALL' || action==='printAll'){
                if(redId || !nestMdConfig)
                    return recordPrintList.map((each, i) => {
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            show: action==='printAll',
                            alone: false,
                            repId: rep?.id,
                            key: i,
                            redId,
                            nestMd: nestMdConfig,
                            verId,
                            rep,
                        });
                    });
                else return  SubRepIds?.map((redId: string, k: number)=>{
                    return recordPrintList.map((each, i) => {
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            show: action==='printAll',
                            alone: false,
                            repId: rep?.id,
                            key: i,
                            redId,
                            nestMd: nestMdConfig,
                            verId,       //内嵌模式的分项模式的版本号只能听从主报告配置的。
                            rep,
                        });
                    });
                });
            }else if(action==='_Controller'){
                return <> {view} </>;
            }
            return  null;
        }
        ,[action, rep, SubRepIds,nestMdConfig,redId, verId,recordPrintList, view]);

    const list=(
        <div id="allOrgEdt" className={"mt-4 mb-8"}>
            {recordList}
        </div>
    );
    return { list };
}


/**类似于useRecordListSub, rep也要传递的，但是独立流转的分项报告的 两个报告ID不同？：不考虑替代repId; rep.id!=repId
 * */
// export function useRecordListSubX(ref: React.Ref<unknown>,rep: any, repId: string, recordPrintList: EditorAreaConfig[],
//                                  modAction: string, verId: string, nestMdConfig?: string,titleRender?: (store: any) => React.ReactNode
// ) {
//     const {redId,action}=useSubNestAcion(modAction);   //动态解析URL路由转换可能出现的分项报告模板
//     // const qs= queryString.parse(window.location.search);   //确保点击?&from=X 参数变动也能够刷新。
//     const {storage, setStorage} =React.useContext(EditStorageContext) as any;
//     const iDskey= '_'+nestMdConfig;
//     // const rskey= '_'+nestMdConfig+'_'+redId;  带分项报告的机制：
//     const { [iDskey]: SubRepIds }=storage;
//     let editorRefCount=recordPrintList.length;      //+maxItemsSeq 伸展开的电梯item1.1列表编辑区域数量;
//     //【奇怪】有时重启才会报错：违反hook规则？useProjectListAs因为是hook函数不能放在三元表达式中，但是参数就不管了。
//     const refCount=(action==='ALL' || action==='printAll')? editorRefCount*(nestMdConfig? (SubRepIds?.length||1) : 1)  : 0;
//     const clRefs =useProjectListAs({count: refCount } );
//     //同名字的字段：清除／覆盖，编辑器未定义的字段数据可保留。[分项_2]{}如何正常合并？只有ALL printAll才会用到这的。
//     const outCome=(action==='ALL' || action==='printAll')? (
//             nestMdConfig? mergeEditorItemSubRefs(clRefs.current!, SubRepIds, nestMdConfig!, editorRefCount,storage, redId)
//                 : mergeEditorItemRefs( ...clRefs.current! )
//         )
//         : null;
//     //旧模式两次暴露传递，返回给爷辈组件。
//     const [doConfirmModify, setDoConfirmModify] = React.useState(false);
//     //这个用在：框架右边页面菜单上"全部项目一起确认" 点击收集数据setDoConfirmModify=。然后底下的副作用React.useEffect(自动收集存储。”确认“后再保存。当一个区块不允许点击因ref空的!
//     React.useImperativeHandle( ref,() => ({
//         doConfirm: (action==='ALL' || action==='printAll')? setDoConfirmModify: noOp
//     }), [setDoConfirmModify, action] );
//     const {doFunc:throttledSetDoConfirmModify, ready} = useThrottle(setDoConfirmModify,1500);
//     //点按钮后outCome先要render一次获得最新值；必须从false到true的变化才能触发执行。 true->true不能执行的。 useLayoutEffect
//     React.useEffect(() => {
//         if(doConfirmModify){
//             setStorage({...storage, ...outCome});
//             setDoConfirmModify(false);
//         }
//     }, [doConfirmModify, outCome, storage, setStorage] );
//
//     const {view} =useSubRepController(nestMdConfig!, titleRender!); //callback: (store: any) => React.ReactNode
//     //去掉了qs,依赖项；
//     //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
//     const recordList= React.useMemo(() =>
//         {
//             //【路由器分解】明面上最直观的路由部分，[action]==createItem(itemArea?)。
//             const itemA=recordPrintList.find((one)=>one.itemArea===action);
//             if(itemA){
//                 return <React.Fragment>
//                     {
//                         React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
//                             ref: null,
//                             key: itemA.itemArea,
//                             repId,
//                             show: true,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,
//                             rep,
//                         })
//                     }
//                 </React.Fragment>;
//             }else if(action==='ALL' || action==='printAll'){
//                 if(redId || !nestMdConfig)
//                     return recordPrintList.map((each, i) => {
//                         return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
//                             ref: clRefs.current![i],
//                             show: action==='printAll',
//                             alone: false,
//                             repId,
//                             key: i,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,
//                             rep,
//                         });
//                     });
//                 else return  SubRepIds?.map((redId: string, k: number)=>{
//                     return recordPrintList.map((each, i) => {
//                         return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
//                             ref: clRefs.current![i+ k*editorRefCount],
//                             show: action==='printAll',
//                             alone: false,
//                             repId,
//                             key: i,
//                             redId,
//                             nestMd: nestMdConfig,
//                             verId,       //内嵌模式的分项模式的版本号只能听从主报告配置的。
//                             rep,
//                         });
//                     });
//                 });
//             }else if(action==='_Controller'){
//                 return <> {view} </>;
//             }
//             return  null;
//         }
//         ,[action, clRefs,rep,repId, SubRepIds,nestMdConfig,redId, verId,recordPrintList,editorRefCount, view]);
//
//     const list=(
//         <>
//             {recordList}
//             { (action==='ALL' || action==='printAll') &&
//                 <Button size="lg" intent={'primary'}  disabled ={!ready}
//                         onPress={() =>{
//                             //这里派发出去editorSnapshot: outCome {...storage, ...outCome}都是按钮捕获的值，还要经过一轮render才会有最新值。
//                             throttledSetDoConfirmModify!(true);
//                         }
//                         }>
//                     全部已编辑项目一起确认
//                 </Button>
//             }
//         </>
//     );
//
//     return { list };
// }

