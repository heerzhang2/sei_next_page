/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Text, InputLine, SuffixInput,
  LineColumn,
} from "customize-easy-ui-component";

/**针对性优化：measurementRender新版本：不拍外面用<LineColumn column={3}>嵌套后的效果也不错。
 * @param only : 只有一个测量字段的情形，否则是俩个字段。 【注意】only=false的情况在上面不要嵌套<LineColumn；嵌套两层的LineColumn布局不好。
 * */
export const measurementRender=(label: string,nameH:string,unit:string,inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,only?:boolean
)=> {
  const oName=nameH+'o';
  const vName=nameH+'v';
  if(only){
    return <div css={{display: 'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap: 'wrap'}}>
        <Text css={{marginLeft: '3rem'}}>{label}：</Text>
        <InputLine  label='观测值' >
          <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
        </InputLine>
      </div>;
  }
  else return <div>
      <Text css={{marginLeft: '3rem'}}>{label}：</Text>
       {/*这里 column=一行最多就2列布局的  !important */}
      <LineColumn column={7}  >
        <InputLine  label='观测值' >
          <SuffixInput  value={inp?.[oName] ||''} onSave={txt=> setInp({...inp,[oName]: txt || undefined })}>{unit}</SuffixInput>
        </InputLine>
        <InputLine  label='结果值' >
          <SuffixInput  value={inp?.[vName] ||''} onSave={txt=> setInp({...inp,[vName]: txt || undefined })}>{unit}</SuffixInput>
        </InputLine>
      </LineColumn>
   </div>;
}

/**可复用代码: 观测数据表格编辑时用； 太多的 getInpFilter 重复了。
 * 前面的pairNames参数是可以一个变换2个的字段 xxo xxv的。 测量值 结果值一对的。
 * @param defaultV : 可提供缺省取值注入的回调函数 执行()修改机会。【注意】字段名必须在前面俩不数组当中的。
 * 但是若defaultV的默认值对应几列数据全部是没必要存储给后端的情况，就没必要提供回调修改机会了。
 * */
//旧版本 没有依赖 'alones', 'defaultV', and 'pairNames'.
// export const useMeasureInpFilter= (pairNames:string[], alones:string[], defaultV?: (par: any) => any
// ) => {
//   const getInpFilter = React.useCallback((par: any) => {
//     let fields={} as any;
//     pairNames.forEach((aName, i:number)=> {
//       const nameO = `${aName}o`;
//       const nameV = `${aName}v`;
//       fields[nameO] =par[nameO];
//       fields[nameV] =par[nameV];
//     });
//     alones.forEach((name, i:number)=> {
//       fields[name] =par[name];
//     });
//     if(defaultV)  return  defaultV(fields);
//     else return fields;
//   }, []);
//   return [getInpFilter];
// };

