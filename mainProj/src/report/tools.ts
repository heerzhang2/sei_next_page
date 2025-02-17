import * as React from "react";
import {Ref,} from "react";

//把子组件的输入全部合并，准备好数据给后端。 inp参数固定。
export const mergeSubitemRefs = <T>(...refs: Array<Ref<T>>) => {
  let all={};
  refs.forEach(resolvableRef => {
    if ((resolvableRef as any).current) {
      all = {...all,   ...(resolvableRef as any).current.inp };
    }
  });
  return all;
};

//汇总回流数据 把每个编辑器组件的局部化的状态inp对象全部合并汇总给全局。
//主报告版本的 回流；
export const mergeEditorItemRefs = <T>(...refs: Array<Ref<T>>) => {
  let all=null as any;
  refs.forEach(resolvableRef => {
    if ((resolvableRef as any).current?.inp) {
      const inp=(resolvableRef as any).current?.inp;
      all = {...all,   ...inp };
    }
  });
  return all;
};
//分项报告版本的 汇总回流数据 ;考虑 分项报告 重复出现的分项； recordPrintList；不管是不是嵌入到主报告模式还是独立流转的分项报告采取统一处理模式，存储统一。
export const mergeEditorItemSubRefs = <T>(refs: Array<Ref<T>>, redIds: [string], mobang:string, listCount:number,storage:any,onlyRedId?:string) => {
  if(onlyRedId){
    let all=null as any;
    for (let i = 0; i < listCount; i++) {
      const aRef= refs[i];
      if ((aRef as any).current?.inp) {
        const inp=(aRef as any).current?.inp;
        all = {...all,   ...inp };
      }
    }
    const rskey='_'+mobang+'_'+onlyRedId;
    return {[rskey]: all};      //单独一份分项报告
  }
  else{
    let allSub=null as any;     //每一份分项报告都要合并
    if(!refs)  return {};
    //k 重复的分项报告： i 各个编辑区块的项目表；
    redIds?.map((redId: string, k: number)=>{
      const rskey='_'+mobang+'_'+redId;
      //在分项编辑器的ALL右页面全列出时，那些没有点击加载过的编辑器，其数据被偷偷清除。所以all要继承storage旧的！
      let all=storage[rskey];
      for (let i = 0; i < listCount; i++) {
        const aRef= refs[i+ k*listCount];
        if ((aRef as any).current?.inp) {
          const inp=(aRef as any).current?.inp;
          all = {...all,   ...inp };
        }
      }
      allSub = {...allSub,   [rskey]: all };
      return null;
    });
    return allSub;
  }
};

//执行回调 所有项目 都显示的。
export const callSubitemShow = <T>(show:boolean, ...refs: Array<Ref<T>>) => {
  refs.forEach(resolvableRef => {
    if ((resolvableRef as any).current) {
     // console.log("callSubitemShow 执行 ", (resolvableRef as any).current!.onParChange, "itemVal?=",  (resolvableRef as any).current!.itemVal );
      (resolvableRef as any).current!.setShow(show);
    }
  });
};

/*
const callSubitemShow =<MutableRefObject<InternalItemHandResult>> (...refs: Array<Ref<MutableRefObject<InternalItemHandResult>>) => {
  refs.forEach(resolvableRef => {
    if ((resolvableRef as any).current) {
      (resolvableRef).current.setShow();
    }
  });
};
*/

export const callSubitemChangePar= <T>(par:any, ...refs: Array<Ref<T>>) => {
  refs.forEach(resolvableRef => {
    if ((resolvableRef as any).current) {
      //console.log("callSubitemChangePar 执行 ", (resolvableRef as any).current!.onParChange, "itemVal?=",  (resolvableRef as any).current!.itemVal );
      (resolvableRef as any).current!.onParChange(par);
    }
  });
};

/**[淘汰了] 多行文本输入后的Html正常换行显示：存储保持不变。
 * wrapper修改输出格式用；
*    <Cell colSpan={2}>{multilines2Html(orc.大备注,  (txt,i)=>{
*        return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
*    })}</Cell>
 * */
export const multilines2Html =(liensstr: string, wrapper:(orc: string,i:number)=>React.ReactNode
) => {
  const lines= liensstr?.split(/\r?\n/) || [];
  return lines.map((onel: string,i:number) =>
          wrapper(onel,i)
  );
}

/**两个字段合体显示的。split是插入分割符号
 * */
export const zdBoth =(one: string, two: string, split?: string) => {
  if(one && two)   return  one+(split??' / ')+two;
  else if(one)  return one;
  else if(two)  return two;
  else  return  null;
}
/**表格Row的Span跨行,可能选中了条件：
 * @param rowSpan <TD TR>的行数横跨几个行。默认=1；
 * @param splitor 相隔多少行要启用生效一行的。 几个行才允许显示出标题。
 * @param sumseq 当前是第几行的<Cell>。
 * */
export const scopeRowSp =(sumseq: number,splitor: number, rowSpan?: number) => {
  let nowp=sumseq%splitor;     //模数
  if(nowp===1)  return true;
  if(!rowSpan)  return false;
  if(nowp===0){
    if(rowSpan>1)  return true;
  }else{     //绕一圈的；
    if(nowp+rowSpan -1 > splitor)   return true;
  }
  return false;
}

export const 检查结论选 = ['√', '×', '—'];
/**转换： 检查结论选
 * */
export const concluF3Tran =(ch: string) => {
  return '√'===ch? '合格' : '×'===ch? '不合格' : '—';
}
//定义一个函数来找到Table特定字段的最大值:数字的；
export function findMaxByField(arr:any[], field:string) {
  return arr.reduce((max, obj) => {
    return (Number(obj[field]) > max) ? Number(obj[field]) : max;
  }, -Infinity);      // 使用 -Infinity 作为初始值，确保任何数字都会大于它
}

