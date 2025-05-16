import * as React from "react";

/**可复用代码: 观测数据表格编辑时用； 太多的 getInpFilter 重复了。
 * @param pairNames 测量的：有两个字段 ?o  ?v 存储到了数据库。【若没有的】应用null不能用[]带入；
 * @param alones 其它附带的存储字段。
 * 前面的pairNames参数是可以一个变换2个的字段 xxo xxv的。 测量值 结果值一对的。
 * @param defaultV : 可提供缺省取值注入的回调函数 执行()修改机会。【注意】字段名必须在前面俩个数组当中的。
 * 但是若defaultV的默认值对应几列数据全部是没必要存储给后端的情况，就没必要提供回调修改机会了。
 * 注意pairNames若为空不要用[]来注入参数；defaultV：也必须不可变的useCallbakc()来包裹的，不能直接匿名函数做参数注入。
 * 【异常】 hook循环次数超了； 字段取值没法变更成功的。
 * 【重大问题】第一个pairNames [] 第三个参数defaultV 不用useCallBack 都可能导致异常，需要不可变的。
   const defvcbFunc = React.useCallback((par: any) => {
     const { 见证表,记事表 }=par||{};
     if(!(记事表?.length>=1))   par.记事表=default记事;
     return  par;
   }, []);
   const [getInpFilter]=useMeasureInpFilter(null,itemA技术见证,defvcbFunc);
 * */
export const useMeasureInpFilter= (pairNames:string[]|null, alones:string[], defaultV?: (par: any) => any
) => {
  const getInpFilter = React.useCallback((par: any) => {
    let fields={} as any;
    pairNames?.forEach((aName, i:number)=> {
      const nameO = `${aName}o`;
      const nameV = `${aName}v`;
      fields[nameO] =par[nameO];
      fields[nameV] =par[nameV];
    });
    alones.forEach((name, i:number)=> {
      fields[name] =par[name];
    });
    if(defaultV)  return  defaultV(fields);
    else return fields;
  }, [pairNames,alones,defaultV]);
  //@但是加上, [alones,pairNames,defaultV]); 会导致副作用死循环 输入变量有些 [] 可变的。
  return [getInpFilter];
};

