import * as React from "react";
import {ItemOmniConfig} from "./omni";
// import {itemA附页本体, items工作内容} from "../furnace/External/AttachInspectItem";
// import {string} from "prop-types";
//通用处理函数。

  //仅支持最多2层的EditorAreaConfig嵌套类型：
export type EditorAreaConfig = {
  itemArea: string;
  zoneContent: React.ReactNode | EditorAreaConfig[];
  //聚合项才有的：createItem没有这个参数。
  subrType?: string;
};
export function createItem(itemArea: string, zoneContent: React.ReactNode) {
  return {itemArea,  zoneContent} as EditorAreaConfig;
}
/**目标：承压类依据项目目录表实际需执行的检验项，来隐藏要显示的编辑器部分列表项。
 * 需传递给 编辑区的 modType：可重复分项的模板类型，存储路径。
* */
export function aggregateProj(
    project: string,
    subrType: string,
    edAreas: EditorAreaConfig[]
) {
  // 递归处理嵌套结构的辅助函数
  const processContent = (content: React.ReactNode | EditorAreaConfig[]) => {
    if (Array.isArray(content)) {
      return content.map(({itemArea, zoneContent}) => {
        if (React.isValidElement(zoneContent)) {
          // 克隆元素并注入subrType参数
          return {
            itemArea,
            zoneContent:  React.cloneElement(zoneContent, { modType: subrType } as any),
          };
        }
        return {itemArea, zoneContent};
      });
    }
    return content;
  };

  return {
    itemArea: project,
    subrType,
    zoneContent: processContent(edAreas) as EditorAreaConfig[]
  };
}

// 平铺后的类型
export type FlattenedEditorAreaConfig = {
  itemArea: string;
  zoneContent: React.ReactNode;
  subrType?: string;
};

// 类型守卫：判断是否为 EditorAreaConfig 数组
const isEditorAreaConfigArray = (
    value: React.ReactNode
) => {
  return (
      Array.isArray(value) &&
      value.every(item =>
          'itemArea' in item &&
          typeof item.itemArea === 'string' &&
          ('zoneContent' in item)
      )
  );
};

// 平铺函数
export const flattenEditorAreaConfig = (
    data: EditorAreaConfig[],
    maxDepth: number = 2
): FlattenedEditorAreaConfig[] => {
  // @ts-ignore
  return data.reduce<FlattenedEditorAreaConfig[]>((acc, item) => {
    const { zoneContent, ...rest } = item;

    // 处理嵌套数组
    if (isEditorAreaConfigArray(zoneContent as any) && maxDepth > 0) {
      const children = flattenEditorAreaConfig(zoneContent as any, maxDepth - 1);
      return [...acc, ...children];
    }

    // 处理简单类型
    return [...acc, { ...rest, zoneContent }];
  }, []);
};
/**映射subrType 到 itemArea
* */
export const subrType2ProjTitle = <T extends EditorAreaConfig>(
    configs: T[],
    targetSubrType: string
): Extract<T, { subrType: string }>["itemArea"][] => {
  return configs
      .filter((config): config is Extract<T, { subrType: string }> =>
          config.subrType === targetSubrType
      )
      .map((config) => config.itemArea);
};

//通用的检验项目模板配置格式的：
export function getInspectionItemsLength(inspectionContent :any[]){
  let seq = 0;
  inspectionContent.forEach((rowBigItem, x) => {
    rowBigItem && rowBigItem.items.forEach((item:any, y:number) => {
      if(item)   seq += 1;
    });
  });
  return seq;
};

//x.y下标分解： 电梯 机电使用的；
//校验URL的action字段能否匹配项目编号? 2.4。 / 6.9 ;
export function verifyAction( action:  string, generalFormat: any[]) {
  let itemNums=action.split(".");
  if(itemNums.length!==2)   return {isItemNo: false};
  let x=parseInt(itemNums[0]);
  let y=parseInt(itemNums[1]);
  if(generalFormat[x-1]?.items[y-1]?.procedure)
    return {isItemNo:true, x:x-1, y:y-1};
  else
    return {isItemNo: false};
}

export type PlainArConfigs= {
  //解析配置的可能类型是 impr  esnt  mesB  omPf s2Lu moAR mesA； 互不兼容的。
  type?: string;
  value: any[];       //实际传参数 依旧允许 value=undefined
};

function lookThisName(nameMap:Map<string,undefined>,name:string, caseof?:string) :boolean {
  if(!nameMap.has(name))    nameMap.set(name,undefined);
  else if(process.env.REACT_APP_TEST==='true')   throw new Error(`${caseof??''}字段重复 ${name}`);
  else return false;
  return true;
}

/**校验这个模板范围内的 name 唯一性。
 * @param arr {type } : type='impr'是机电的项目列表配置数组.Item。 type='mesA' 观测数据配置的[[[{n:'物净距',}； type=空的=是最简易名字数组；
 * type='mesB'新版观测数据配置； type='esnt' 设备概况；;   's2Lu'简况2层次配置{在容器的附加检验报告用到}。 'moAR' 'omPf'
 * 【过时的type】mesA,s2Lu两种最好不用。
 * 另外关于useMeasureInpFilter(item受力结构, itemA受力结构,)前面哪一个测量派生存储字段名的，附加的后缀o？或者v的；在正常使用规范底下不会冲突的，只检查前面前缀名部分。
 * 所以：【需确保】正常存储字段名字起名的约束：名字后面不要用o或v为结束的。
 * 存储检查约定['小下滑o','大下滑o']实际检查的是'小下滑','大下滑'：【前提条件】名字最后是o或v的自定义名字的务必避免使用！！
 * */
export function assertNamesUnique(arr: PlainArConfigs[]) :boolean {
  const nameMap = new Map();      //只有对象可以作为键。不能使用基本类型作为WeakMap的键。
  arr.forEach(({type,value}, l:number)=>{
    if(!value || value.length<=0)  throw new Error(`空数组啊${l}`);
    if(!type){
      value.forEach((tzName:string, l:number)=>{
        if(!lookThisName(nameMap,tzName))  return false;
      });
    }else if('impr'===type){
      value.forEach((area, b) => {
        area.items.forEach((et:ItemOmniConfig, n:number) => {
          if(et.name){
            if(!lookThisName(nameMap,et.name))  return false;
          }
          if(et.mergName){
            if(!lookThisName(nameMap,et.mergName,'合并'))   return false;
          }
        });
      });
    }
    else if('esnt'===type){    //设备概况像是[ [{n:'大车轨间',}, ],[ {check: 'C3.8.1'}], 最大3列组合
      const surveyItems = [] as any;          //布局2排的，转为正常的1排列表
      value?.forEach(([[desc, name, cb], add2p, add3p]: any, i: number) => {
        const [desc2, name2, cb2] = add2p || [];
        if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, cb});
        else if (typeof name === 'object' && name.n && !name.r && !name.n.startsWith('_$')) surveyItems.push({name: name.n, cb});
        if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, cb: cb2});
        else if (typeof name2 === 'object' && name2.n && !name2.r && !name2.n.startsWith('_$')) surveyItems.push({name: name2.n, cb: cb2});
        const [desc3, name3, cb3] = add3p || [];
        if (typeof name3 === 'string' && name3 && !name3.startsWith('_$'))  surveyItems.push({name: name3, cb: cb3});
        else if (typeof name3 === 'object' && name3.n && !name3.r && !name3.n.startsWith('_$'))  surveyItems.push({name: name3.n, cb: cb3});
      });
      const itemA设备概况: string[] = [];
      surveyItems.forEach(({name,cb}: any, i: number) => {
        if(cb?.names){
          let newArr = cb?.names.map((item: string) => {
            if(item.startsWith('_$')) return null;
            else return item;
          }).filter((item: any) => item !== null);
          itemA设备概况.push(...newArr);
        }
        else  itemA设备概况.push(name);
      });
      itemA设备概况.forEach((name: string, k:number)=> {
          if(!lookThisName(nameMap,name,'概况'))   return false;
      });
    }
    else if('mesB'===type){    //观测数据像是[ [{n:'大车轨间',}, ],或者 [{n:'N',cbo:{names:['c']} }, ],
      value.forEach((cfObjArr : any, i:number)=> {
        if(!cfObjArr || cfObjArr.length<1)    throw new Error("没提供测量子项");
        cfObjArr.forEach(({n,cbo}: any, k:number)=> {
          if(n){
            if(!lookThisName(nameMap,n,'观测'))   return false;
          }
          if(cbo?.names){
            let adnArr = cbo?.names.map((item: string) => {
              if(item.startsWith('_$')) return null;
              else return item;
            }).filter((item: any) => item !== null);
            adnArr.forEach((name: string, k:number)=> {
              if(!lookThisName(nameMap,name,'回调'))   return false;
            });
          }
        });
      });
    }
    else if('omPf'===type){       //value像是 [ ['改', [{t:'前缀1', s:10},{ },], '项目1', ] , ]
      value.forEach(([name, title, initIsp], i: number) => {
        if(!lookThisName(nameMap,name,'万能前缀'))   return false;
      });
    }
    else if('moAR'===type){       //value像是 [ ['name',title,...] , ]
      value.forEach(([name, title], i: number) => {
        if(!lookThisName(nameMap,name,'对象结论') || !lookThisName(nameMap,name+'r','对象结论'))    return false;
      });
    }
    else if('s2Lu'===type){     //分项报告用:像[ ['测试仪器型号','静电测试仪器'], ['连接处电阻',{n:'连接处电阻',u:'Ω'}], ['Title/Name',] ],
      const surveyItems = [] as any;
      value?.forEach(([desc, name, cb]: any, i: number) => {
        if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, cb});
        else if (typeof name === 'object' && name.n && !name.r && !name.n.startsWith('_$')) surveyItems.push({name: name.n, cb});
        else if (undefined===name) surveyItems.push({name: desc, cb});
      });
      const itemA设备概况: string[] = [];
      surveyItems.forEach(({name,cb}: any, i: number) => {
        if(cb?.names)   itemA设备概况.push(...cb?.names);
        else  itemA设备概况.push(name);
      });
      if(itemA设备概况.length===0 && process.env.REACT_APP_TEST==='true'){
        console.error("不该配s2Lu的", value);
        throw new Error(`配置s2Lu错：`);
      }
      itemA设备概况.forEach((name: string, k:number)=> {
        if(!lookThisName(nameMap,name,'简况'))   return false;
      });
    }
    else if('mesA'===type){    //观测数据像是[ [[{n:'大车轨间',t:'',u:''},{n:'小车轨间',t:'',u:''}] ,'5.1',,'1)',<Text></Text>],的配置模式的。第一项是子项目的项目定义[];
      value.forEach(([_fxArr, _] : any, i:number)=> {
        if(!_fxArr || _fxArr.length<1)    throw new Error("没提供测量子项");
        _fxArr.forEach(({n,}: any, k:number)=> {
          if(!lookThisName(nameMap,n,'观测'))   return false;
        });
      });
    }
    else throw new Error(`不识别${type}`);
  });
  console.log("assertNamesUnique:", nameMap.keys());
  return true;    //全部 没冲突的！
}

//根据recordPrintList和itemActions生成registerUrl函数，供 PWA预缓存 页面生成该报告的URL列表。
export function crtUrlRegistGen(recordPrintList: EditorAreaConfig[], itemActions: string[]) {
    return function registerUrl(template: string, version: string): string[] {
        const baseUrl = `/rep/*/${template}/${version}`;

        const extractAllItemAreas = (items: EditorAreaConfig[]): string[] => {
            const areas: string[] = [];
            const stack = [...items];

            while (stack.length > 0) {
                const item = stack.pop()!;
                if (item.subrType && Array.isArray(item.zoneContent)) {
                    stack.push(...(item.zoneContent as EditorAreaConfig[]));
                }
                else
                    areas.push(item.itemArea);
            }

            return areas;
        };

        const allAreas = extractAllItemAreas(recordPrintList);
        const plainrs = allAreas.filter(itemArea => itemArea !== "Item");

        const actions = [
            "ALL",
            ...plainrs,
            ...itemActions,
        ];
        const urls = actions.map((action) => `${baseUrl}/${action}`);
        return [baseUrl, ...urls];
    };
}
