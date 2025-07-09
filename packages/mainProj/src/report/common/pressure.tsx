import * as React from "react";
import {SubReportConfig} from "@/component/rep/sub-rep";
import {SUBREP_CONFIG} from "@/report/industrial/Periodical/boilerInstR1";

//承压类的，较为常用的：
export type PressureLayout = {
    //关键：
    name: string;       //结论页附录的描述
    //要不要显示，做了吗
    do: boolean;
    ml?: string;        //目录上的显示文字
    ha: string;      //URL路由定位
    //用户编辑设置：
    page?: string;
    //打印的顺序？
    //是否新开一个页来打印。
    //动态的数据: push(Node) 排序打印
    //renderDom: any;
};

/**构建反方向 搜索tag name的Map对象。
 * @param projects: 实际存储的分项配置数组。
 * @return Map 可按照名字检索对应的配置对象。 数组[]转成Map
 * */
export const useItemsMapPressure= ({ projects, }:{ projects:PressureLayout[], }
) => {
    const itemsMap =React.useMemo(() => {
        const itemsMap = new Map<string,PressureLayout>();
        projects?.forEach((area, b) => {
            if(area?.name)
                itemsMap.set(area?.name, {...area});
        });
        return  itemsMap;
    }, [projects]);
    return [itemsMap];
};

export type HashConfig = {
    title: string;
    url: string;
};
export function redoProjHash(
    ids: string[],
    navRow: HashConfig[]
): Array<{
    title: string;
    url: string;
}> {
    if (!Array.isArray(ids) || !Array.isArray(navRow)) return [];
    return ids.flatMap((idno, k) =>
        navRow.map(({ title, url }, i) => ({
            title: `${title}-${k + 1}`,
            url: `${url}_${idno}`
        }))
    );
}
/**动态添加子报告的目录项
 * 弥补：无法感知下一级组件的具体的折叠状态变量的变动。 免去用Url search param? 或者use context ?
* */
export function subRepHash(
    config: Record<string, SubReportConfig>,
    mapFxian: Map<string, PressureLayout>,
    storage: any
): Array<{
    title: string;
    url: string;
}> {
    let tmpAr: Array<{ title: string; url: string; }> = [];
    Object.entries(config)
        .filter(([modType, config]) => mapFxian.get(config.catKey)?.do)
        .forEach(([modType, config]) => {
            tmpAr.push({
                title: `${config.catKey ?? config.title}报告`,
                url: `#_${modType}_`,
            });
            const localIdx = storage?.[`_${modType}`] ?? [];
            //真的有必要：隐藏折叠 hash定位无效
            if (localIdx?.length === 1 && !config.collapse) {
                tmpAr.push(...redoProjHash([localIdx[0]], config.cat));
            }
        });
  return tmpAr;
}

