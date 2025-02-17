import {RecordInputConfig, RecordIspArea, } from "./bridge/orcIspConfig";
import {itemResTransform} from "./hook/useRecordListSub";

/**寻找不合格项目的全貌：x.y.z iClass 原因。
 * 依据记录来初始化 检验不合格项目[] ,
 * @param ItemArs 全体项目配置
 * @param options { noCB : 有些项目编码重复的需要额外做区分； }
 * 剔除不合格后端对象存储t:area.tag的要求，改为动态生成，破除依赖性，增强强强壮性，保证版本旧数据迁移升级无忧。
 * @return 直接给不合格列表用的对象
 * */
export const itemResultUnqualified =(orc: any, ItemArs:RecordIspArea[], options:{ noCB?:(no:string,et:RecordInputConfig)=>string }
) => {
  let failure: any[]=[];          //存储的是 标签 no:? 项目URL定位？ key还需要用于获取结果对象。
  let seq = 0;
  let ox: number;
  let oy: number;
  let oz: number;
  let iclas: string;
  let big: string;
  let titl: string;
  let sub: string;
  ItemArs?.forEach((area, b) => {
    iclas= area.iclas??iclas;
    //列跨 span X.y的X列这里就不要跨越area范围了；以一个tag对应的area.items最大搜索区域来决定各个列span;当前已经为x,y,z,t分配的具体行数多少。
    //配置已经敲定了有几行， td跨越几行 【前提】假设：一个结论对照这里一个items[?]; 随后一一对应一个不合格项目。
    area && area.items.forEach((et:RecordInputConfig, n:number) => {
      if(et){
        seq += 1;
        let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
        if(et.t) nowColumns=4;
        else if(et.z) nowColumns=3;
        else if(et.y) nowColumns=2;
        else if(et.x) nowColumns=1;
        else throw new Error(`非法列设置`);
        big=et.big??big;        //像缓存一样 传递下去，按最左边序号顺序上托没改动的就是不变。
        ox=et.x??ox;
        oy=et.y??oy;
        titl=et.titl??titl;
        oz=(et.z!>0? et.z : oz)??0;
        sub=et.sub??sub;
        let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
        //【自拆分项目】必须在同一个区块都配置上；不能跨越２个编辑区。
        let res=itemResTransform(orc, et);
        if(res==='不合格'){
          //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
          stno=options.noCB!(stno, et);
          failure.push({no:stno, c:et.iclas??area.iclas, b: orc[et.name+'_D']});
        }
      }
    });
  });
  // if(特殊替换)  特殊替换(orc, out);
    //返回  存储数据库的对象{no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; } + 前端的导航点击URL跳转编辑器关联的tag；
  return failure;
}

/**@param atclass  针对的是第几个级别的显示内容
 * @param index  处于第几个编辑区。
 * @param ceseq   当前编辑区内部舒徐序号。
 * */
export const backItemsConfigSearch =(editAreasConf: RecordIspArea[], index:number, ceseq:number, atclass:number
) => {
  let id: number;
  let name: string;
  if(index===0 && ceseq===0)   return {id: 0, name: ''};
  let k=index;  //不能从自己 位置顺序的之下做反向搜索；只能小序号的。
  for(;k>=0;k--){
    let q=editAreasConf[k]?.items.length-1;
    if(k===index){
      if(ceseq>0)     q=ceseq-1;
      else   continue;
    }
    for(;q>=0;q--) {
      let et=editAreasConf[k]?.items[q] as RecordInputConfig;
      if(atclass===1){
        if((et.x!)>0){
          return {id: et.x, name: et.big};
        }
      }
      else if(atclass===2){
        if((et.y!)>0){
          return {id: et.y, name: et.titl};
        }
      }
      else if(atclass===3){
        if((et.z!)>0){
          return {id: et.z, name: et.sub};
        }
      }
    }
  }
  // console.log("模板配置问题backItemsConfigSearch当前Config=",editAreasConf ,"k=",k,atclass,"index=",index,ceseq);
  throw new Error(`搜索不到模板配置问题`+JSON.stringify(editAreasConf));
}

