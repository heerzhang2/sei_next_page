import * as React from "react";

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

