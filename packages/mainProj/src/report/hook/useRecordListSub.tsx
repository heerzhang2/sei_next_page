"use client"

import * as React from "react";
import {EditorAreaConfig, flattenEditorAreaConfig} from "../common/eHelper";
import {useSubRepController} from "./useSubRepController";
import {useStorage} from "@/report/StorageContext";
import {useSearchParams} from "next/navigation";
import {useItemsMapPressure} from "@/report/common/pressure";


/**支持可独立流转的分项。可重复分项。
 * 但是因ALL展开的右边列表形态页面中：可重复分项modelkey的对应的编辑器列表并没有合并到主报告中了。
 * */
export function useRecordListSubr(rep: any, recordPrintList: EditorAreaConfig[],
                                  modAction: string, verId: string,
                                  titleRenders?: Record<string, (store: any,index: number) => React.JSX.Element>
) {
    const searchParams = useSearchParams()
    const subrid = searchParams!.get("subrid") ?? undefined
    const redIdStr =searchParams!.get("redId")
    const redId =redIdStr? Number(redIdStr) : undefined
    //只有是控制器的编辑器 才有传递该参数的：
    const modelkey = searchParams!.get("modelkey") ?? ''
    //变化的key就能导致组件的重新加载了。引起组件旧状态刷新掉了。
    const keyRefresh=(subrid || redId)? `${subrid ??''}${redId ??''}` : undefined;
    const action=modAction;
    const {storage, setStorage, parrepfs ,subrType} =useStorage();
    //针对可独立流转的分项目情形：有subrType & subrid的;
    const [mapFxian]=useItemsMapPressure({projects: subrid? parrepfs.Projects : storage.Projects});
    const rcaList =React.useMemo(() => flattenEditorAreaConfig(recordPrintList), [recordPrintList]);

    const {view} =useSubRepController(recordPrintList,modelkey || subrType, rep, titleRenders?.[modelkey || subrType]!, subrid);
    //去掉了qs,依赖项；
    //编辑器【自定义路由】这里action是 '2.1' ALL none printAll 这样的路由参数 ?readOnly=1&。
    const recordList= React.useMemo(() =>
        {
            //【路由器分解】明面上最直观的路由部分，[action]==createItem(itemArea?)。
            const itemA=rcaList.find((one)=>one.itemArea===action);
            if(itemA){
                return <React.Fragment>
                    {
                        React.cloneElement(itemA.zoneContent as React.ReactElement<any>, {
                            key: itemA.itemArea,
                            show: true,
                            redId,
                            subrid,
                            verId,
                            rep,
                        })
                    }
                </React.Fragment>;
            }else if(action==='ALL'){
                return recordPrintList.map((each, i) => {
                    if(Array.isArray(each.zoneContent)){
                        if(mapFxian.get(each.itemArea)?.do && (subrType===each.subrType || !subrid))
                        {
                            if(!each.subrType || redId)
                                return each.zoneContent.map(({itemArea, zoneContent},m)=> {
                                    return React.cloneElement(zoneContent as React.ReactElement<any>, {
                                        key: m,
                                        redId,
                                        subrid,
                                        verId,
                                        rep,
                                    })
                                });
                            else return null;
                        }
                        else return null;
                    }
                    else if(!subrid || each.itemArea==='Entrance'){
                        return React.cloneElement(each.zoneContent as React.ReactElement<any>, {
                            key: i,
                            redId,
                            subrid,
                            verId,
                            rep,
                        });
                    }
                });
            }else if(action==='_Controller'){
                return <> {view} </>;
            }else if(action===null)
                return null;
            throw new Error("action路由不存在");
        }
        ,[action, rep, redId, verId,mapFxian, recordPrintList,rcaList, view]);

    const list=(
        <div id="allOrgEdt" key={keyRefresh} className={"mt-4 mb-8"}>
            {recordList}
        </div>
    );
    return { list };
}
