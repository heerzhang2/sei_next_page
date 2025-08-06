import {OriginalViewProps} from "@/report/common/base";
import {useStorage} from "@/report/StorageContext";
import * as React from "react";
import {ActionMapItem} from "@/report/common/ActionMapItem";
import {createItem, EditorAreaConfig} from "@/report/common/eHelper";
import {useRecordList} from "@/report/hook/useRecordList";
import {Column_Setting} from "@/report/common/useFormatOmni";

// 定义参数类型
type RouteConfig = {
    rep: any;       // 根据实际类型替换为具体类型
    orc?: any;      // 可选参数
    noDefault?: boolean;
};
// 定义返回值类型
type RouteResult = {
    Item: any[];    // 根据实际类型替换为具体类型
};
// 完整函数类型声明
type RouteSetupFunction = (
    config: RouteConfig
) => RouteResult;

export interface CommonOriginalProps extends OriginalViewProps {
    //原始记录页面的布局安排
    config: Column_Setting[];
    //编辑区的总体配置表，附加的编辑区域项目
    rlist: EditorAreaConfig[];
    //机电类的项目列表的主要构建函数。
    areaFn: RouteSetupFunction;
}
//太多类似的代码： Omni常见版本的记录列表显示
export const CommonOriginal=({action, verId, rep,config,rlist,areaFn}:CommonOriginalProps)=>{
    const {storage,} =useStorage();
    const recordPrintListNow =React.useMemo(() => {
        let routeAreas=[] as any[];
        const impressionismAs =areaFn({rep, orc:storage});
        let extendTags =Reflect.ownKeys(impressionismAs) as string[];
        const oldItCount=rlist.length;
        let prevpos=0;
        for(let p=0; p<oldItCount; p++){
            //机电常用的会遇到：规定好的标签记号： 关键的标签匹配 extendTags：[ 'Item', ]
            if(extendTags.indexOf(rlist[p].itemArea)>=0){
                routeAreas=routeAreas.concat(rlist.slice(prevpos,p));
                const itemConfigs= impressionismAs?.[rlist[p].itemArea];
                let seq = 0;
                let moreItems = [] as any;
                itemConfigs.forEach((area, x) => {
                    seq += 1;
                    const rowHead =<ActionMapItem key={seq} repId={rep?.id} alone={false} editAreasConf={itemConfigs}
                                                  index={x} sureD editIts={config} />;
                    moreItems.push(createItem(area.tag, rowHead));
                });
                //机电impressionismAs项目列表形式的，需要展开 扩充的标签 createItem('Item', null),
                routeAreas=routeAreas.concat(moreItems);
                prevpos=p+1;
            }
        }
        routeAreas=routeAreas.concat(rlist.slice(prevpos));
        return routeAreas;
    }, [verId, rep, storage?._Oitems]);

    const {list}=useRecordList(rep,recordPrintListNow,action,verId);
    return <React.Fragment>
        {list}
    </React.Fragment>;
}

