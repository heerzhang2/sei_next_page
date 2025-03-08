import * as React from "react";
//单个项目整体检验结论；没输入的也算不合格， 但是：无此项／如都是／合并也是／。多个小项统筹判定。
import {useCallback, useContext} from "react";
import RoutingContext from "../../routing/RoutingContext";
import queryString from "query-string";
import {useMedia} from "use-media";
import {usePressable} from "customize-easy-ui-component";

export const aItemTransform = (orc: any, iClass:string,  ...ns:any[]) => {
  let size=ns.length;
  let amazing=[];
  if(size<1)  throw new Error(`没项目参数`);
  let result='合格';
  let i=0;
  //一个项目可以有几个子项目的=配置对象的{bigLabel,items:[ item:{names:[子项目1,子项目2]}, ], };
  let bugs=[];    //多个问题？
  for(; i<size; i++){
    if(!orc[ns[i]] || orc[ns[i]]==='' || orc[ns[i]]==='△'){
      amazing[i]='未检测';
      if(result!=='不合格')  result='不合格';
    }
    else if(orc[ns[i]]==='×'){
      amazing[i]='不符合';
      if(result!=='不合格')  result='不合格';
    }
    else if(orc[ns[i]]==='√'){
      amazing[i]='符合';
    }
    else if(orc[ns[i]]==='／'){
      amazing[i]='／';
      if(result!=='不合格' && result!=='／')   result='／';
    }
    else if(orc[ns[i]]==='▽'){
      amazing[i]='资料确认符合';
    }
    else
      throw new Error(`非法结果${orc[ns[i]]}`);
    if(orc[ns[i]]==='×' || orc[ns[i]]==='△'){
      let objKey = ns[i]+'_D';
      if(orc[objKey])  bugs.push(orc[objKey]);
    }
  }
  if(result==='／'){
    for(i=0; i<size; i++){
      if(orc[ns[i]]==='√')   result='合格';
    }
  }
  let fdesc='';
  for(i=0; i<bugs.length; i++){
    if(i>0)   fdesc+='；'+bugs[i];
    else  fdesc+=bugs[i];
  }
  if(bugs.length>0)  fdesc+='。';
  //amazing按顺序把小项目的转换结果同时要输出的。
  return {...amazing, result, iClass, fdesc};
}


//仪器表：临时的显示表生成;一行2列并排风格的。
//报告视图要转化为每一行布局两个小块对称的是子列表并排风格的。
export const getInstrument2xColumn = (instbl: [any]) => {
  let newT=[] as any[];
  if(!instbl)  return newT;
  let size=instbl.length;
  let lines=size/2, i=0;
  if(lines===0)  newT[0]={s1:'', name1:'', no1:'', s2:'', name2:'', no2:''};
  for(; i<lines; i++){
    if(2*i+2 <= size)
      newT[i]={s1:2*i+1, name1:instbl[2*i].name, no1:instbl[2*i].no, s2:2*(i+1), name2:instbl[2*i+1].name, no2:instbl[2*i+1].no};
    else
      newT[i]={s1:2*i+1, name1:instbl[2*i].name, no1:instbl[2*i].no, s2:'', name2:'', no2:''};
  }
  return newT;
}
//报告视图要转化为每一行布局两个小块对称的是子列表并排风格的。
export const getInstrument2xCol = (instbl: [any]) => {
  let newT=[] as any[];
  if(!instbl)  return newT;
  let size=instbl.length;
  let lines=size/2, i=0;
  if(lines===0)  newT[0]={s1:'', name1:'', no1:'', s2:'', name2:'', no2:''};
  for(; i<lines; i++){
    if(2*i+2 <= size)
      newT[i]={s1:2*i+1, name1:instbl[2*i].n, no1:instbl[2*i].i, s2:2*(i+1), name2:instbl[2*i+1].n, no2:instbl[2*i+1].i};
    else
      newT[i]={s1:2*i+1, name1:instbl[2*i].n, no1:instbl[2*i].i, s2:'', name2:'', no2:''};
  }
  return newT;
}

//很多年前的版本： 变换给正式报告的orc=>itRes:{ 'x.y.z':{"0":分项目1,"1":"分项目2的显示"}， failure：['x.y.z',]}；新版本省略这个转换？
//把原始记录的数据转换成报告的各个项目的结论。测量字段项目级别B以上的测量数才需要显示。
//牵涉到不合格的描述自动生成； out是汇总输出结果（不是直接采用的原始记录输入数据是做了数据变换处理或多个输入项目映射到一个报告上面输出项目的）。
//item.names[]是汇总转换映射集合。
//电梯的 不合格复检列表项目是自动生成的：没有锚定，要依据"no"关键字配对："unq": [{"desc": "？", "no": "C/2.1", "rdate": "2023-11-03", "rres": "√"}],
//复检的 不合格列表 也是依据整个项目表的 旧的检验结论映射出来的 动态的failure[]来显示的：没有额外做存储的；"no"关键字对应复检的unq输入对象表。out[`${x+1}.${y+1}`]
export const itemResultTransform =(orc: any, inspectionContent:any[],
             特殊替换?:(orc:any,out:any)=>void
) => {
  let out={} as any;
  inspectionContent.forEach((rowBigItem, x) => {
    rowBigItem && rowBigItem.items.forEach((item:any, y:number)=> {
      if(item)   out[`${x+1}.${y+1}`] =aItemTransform(orc, item.iClass,  ...item.names);
    });
  });
  let failure=[];
  for(let key  in out){
    if(out[key].result==='不合格')  failure.push(key);
  }
  if(特殊替换)  特殊替换(orc, out);
  return {...out, failure};
}

//console.log("特殊替换-  -out=",out);

//嵌入式 重复可添加 分项报告 变换URL解析。
/**动态解析URL路由转换可能出现的分项报告模板;
 * 模板编码template不一定就是主报告的，嵌入式的分项报告也有。
 * 原始记录的预览打印 /originalView/:template/ver/
 * 正常的是  /report/:template/ver/
 * 【子报告】 /0/Corrosive  可重复分项
 * 【主报告】 /THICK_MS/0/Remark 可重复分项
 * */
export function useSubNestAcion(modAction :string) {
  return {  action: modAction };
  const { get:getRouteUrl } = useContext(RoutingContext);
  const routeLevels=getRouteUrl().entries.length;      //3层次/report/:template ；原始记录的预览打印场景的是 2层次的/originalView/:template
  const routePath =getRouteUrl().entries[routeLevels-1]?.routeData?.url;
  const leftPath=window.location.pathname.substring(routePath.length);
  const leftPathAr=leftPath.split('/');
  // console.log(`动太嵌套的为部:`, modAction,leftPath,leftPathAr);  //THICK_MS 剩下 /0/Corrosive
  //  /report/THICK_MS/ver/1/akDHJi77Qh2xTd4BJwdb5FJlcG9ydA/0/Corrosive
  //  /report/VS-DJ/ver/1/akDHJi77Qh2xTd4BJwdb5FJlcG9ydA/THICK_MS/0/Remark"
  if(leftPathAr.length<=1)   return {  action: modAction };
  else if(leftPathAr.length<=2)  return {  action: leftPathAr[1], redId: modAction};
  else {
    const action=leftPathAr[2];
    const redId=leftPathAr[1];
    const nestMd=modAction;
    return { redId,nestMd,action };
  }
}

//报告太大了：部分区域局部化可折叠形式；initArr数组可以支持多个状态变量一起封装生成的。
//【关键原因】initArr的数组大小变动导致的：hook错误抛出！！
export function useAreaFoldable(viewALL:boolean, initArr: any[]) {
  const notSmallScr = useMedia('(min-width:800px),print');    //较大屏幕的或者正式打印机打印的两种；
  const qs= queryString.parse(window.location.search);
  const prPreview =qs && !!qs.print;      //打印预览，或者正式报告客户查阅。
  //【严重问题！】；浏览器打印只能快照当前页面状态，不能依赖后续的useEffect继续变更状态来展开页面，浏览器打印只能提取第一次render，后续页面无法捕捉被浏览器打印出来了。
  // const realPrint = useMedia('print');    //真实打印机打印，浏览器打印预览和转pdf的； 【没办法】只能依赖qs.print，打印需要特别添加URL参数?&print=*才能完全显示。
  //【关键问题】能够返回多个状态管理器具；React？内部能够支持的。不会报hook错误？initArr的数组大小运行render前就能固定下来了,initArr.map。
  function WrappedComp(init?: boolean) {
    //默认的：打印机打印的就不隐藏。
    const [redundance, setRedundance] =React.useState((init===undefined || init===null)? (notSmallScr||prPreview||viewALL) : (init||prPreview||viewALL));
    React.useEffect(() => {
      if(viewALL || prPreview)
         setRedundance(true);
      else{
        if(init===undefined || init===null)
          setRedundance(notSmallScr||prPreview);     //但是viewALL变更情况是没法保持旧的状态
        else  setRedundance(init);        //恢复默认的，但是viewALL按钮切换的含义：只有放大才是真的，缩小是恢复默认取值的意思，而不是#最小化的意图@ ！
      }
    }, [init, viewALL, notSmallScr, prPreview] );
     //【特别注意】不加依赖项notSmallScr, prPreview 有点问题；

    const onPress = useCallback(
        (e:any) => {
          setRedundance(!redundance);
          e.preventDefault();
        },
        [redundance, setRedundance]
    )

    const {bind ,} =usePressable({ onPress,  behavior: "button", noHover:true});
    return [redundance, bind];
  }
  //这样的WrappedComp是 react 内部做法？hook规则不报错的；
  return initArr.map((init) => WrappedComp(init)  as [boolean,any]);
}
/**通用结果字段的转换
 * 【前提约束】 特殊情况要将测量数据转换给正式报告对应位置直接显示的场景，需要规避治理几个预定义的result[]的取值的！
 * */
export const resTranslCm = (result:string) => {
  if(!result || result==='' || result==='△'){
    return '未检测';
  }
  else if(result==='×'){
    return '不符合';
  }
  else if(result==='√'){
    return '符合';
  }
  else if(result==='／'){
    return '／';
  }
  else if(result==='▽'){
    return '资料确认符合';
  }
  else return result;
}
export const resTranslJd = (result:string) => {
  if(result==='×'){
    return '不合格';
  }
  else if(result==='√'){
    return '合格';
  }
  else if(result==='／'){
    return '／';
  }
  else return result;
}
/**选择结果转换； 评估报告 检测结果用的，
 * */
export const resTranslCheck = (result:string) => {
  if(!result || result==='' || result==='△'){
    return '未检测';
  }
  else if(result==='×'){
    return '不符合要求';
  }
  else if(result==='√'){
    return '符合要求';
  }
  else if(result==='／'){
    return '无此项';
  }
  else if(result==='▽'){
    return '符合要求';
  }
  else return result;
}

function extractAndRemoveNumberInParentheses(str:string) {
  // 使用正则表达式找到并捕获括号内的数字
  // (\d+) 捕获一个或多个数字，并将它们作为一个组
  // \( 和 \) 分别匹配字面量的小括号 '(' 和 ')'
  // 注意：由于我们只关心括号内的数字，所以只提取第一个匹配项
  const match = str.match(/\((\d+)\)$/);
  // 如果找到了匹配项，则提取捕获组（即括号内的数字）
  // 并使用 replace 方法切除末尾的括号及其内容
  if (match) {
    const number = match[1]; // match[1] 是第一个（也是唯一一个）捕获组的内容
    const newStr = str.replace(/\(\d+\)$/, ''); // 切除末尾的括号及其内容
    return { number, newStr };
  }
  // 如果没有找到匹配项，则返回一个表示未找到的数字和原字符串
  return { number: null, newStr: str };
}

/**项目编号:nos分解， 反方向从尾巴搜索字符串的一个. 并截取把字符串为两个部分
 * 支持这样的项目编号 1.1(1)  判别特征:是最后一个必须是“)” 前面处在配套的"("；
 * */
export function splitNosByLastDotPan(str:string) {
  const {number, newStr}=extractAndRemoveNumberInParentheses(str);
  let panSeq=Number(number);
  if(panSeq>0 && newStr){
    return [newStr, panSeq, true];      //尾部是(1)的情况
  }
  // 查找'.'在字符串中最后一次出现的位置
  const lastIndex = str.lastIndexOf('.');

  // 如果'.'不存在于字符串中，则返回原字符串和空字符串
  if (lastIndex === -1) {
    return [str, '', false];
  }

  // 使用substring方法分割字符串
  // substring(start, end) 方法提取字符串的某个部分，并返回一个新字符串，且不会改变原字符串
  // 这里从0到lastIndex（不包括）是第一部分，从lastIndex到字符串末尾是第二部分
  const headNos = str.substring(0, lastIndex);
  const lastNo = str.substring(lastIndex + 1) as unknown as number;  // 加1是因为要排除'.'本身

  return [headNos, lastNo, false];
}
export function splitNosByLastDot(str:string) {
  // 查找'.'在字符串中最后一次出现的位置
  const lastIndex = str.lastIndexOf('.');

  // 如果'.'不存在于字符串中，则返回原字符串和空字符串
  if (lastIndex === -1) {
    return [str, ''];
  }

  // 使用substring方法分割字符串
  // substring(start, end) 方法提取字符串的某个部分，并返回一个新字符串，且不会改变原字符串
  // 这里从0到lastIndex（不包括）是第一部分，从lastIndex到字符串末尾是第二部分
  const headNos = str.substring(0, lastIndex);
  const lastNo = str.substring(lastIndex + 1) as unknown as number;  // 加1是因为要排除'.'本身

  return [headNos, lastNo];
}

