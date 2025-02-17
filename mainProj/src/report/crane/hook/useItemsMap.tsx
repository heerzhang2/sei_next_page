/** @jsxImportSource @emotion/react */
import * as React from "react";
import {RecordInputConfig, RecordIspArea} from "../bridge/orcIspConfig";

/**构建允许反方向 搜索tag no的Map对象。
 * @param noCB  特别项目编码的处理回调函数。
 * @param ItemArs  全体检验项目的配置表
 * */
export const useItemsMap= ({ ItemArs, noCB }
         :{ ItemArs:RecordIspArea[], noCB?:(no:string,et:RecordInputConfig)=>string }
) => {
    const itemsMap =React.useMemo(() => {
        const itemsMap = new Map<string,string>();
        let ox: number=0;
        let oy: number=0;
        let oz: number=0;
        ItemArs?.forEach((area, b) => {
            area && area.items.forEach((et:RecordInputConfig, n:number) => {
                if(et){
                    let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                    if(et.t) nowColumns=4;
                    else if(et.z) nowColumns=3;
                    else if(et.y) nowColumns=2;
                    else if(et.x) nowColumns=1;
                    else throw new Error(`非法列设置`);
                    ox=et.x??ox;
                    oy=et.y??oy;
                    oz=(et.z!)>0? et.z! : oz;
                    let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
                    //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
                    stno=noCB!(stno, et);
                    itemsMap.set(stno, area.tag);
                }
            });
        });
        return  itemsMap;
    }, [ItemArs,noCB]);

    return [itemsMap];
};

