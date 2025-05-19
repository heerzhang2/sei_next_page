import * as React from "react";
import {ModelTypeArr} from "../report/modelConfigs";
// import {isNumber} from "util";
// import {isBooleanObject} from "util/types";

/**转换单位; 把输出的单位对象模型字段提取，转换为可以直接给编辑器的输入参数id+name对。
 * 初始化编辑器的关联对象编辑模式映射字段：【graphQL输入不能直接挪用输出的数据模型啊】编辑显示要统一化成输入模式。
 *例子 insu:{id:eqp.insu?.id, name: eqp.insu?.company? eqp.insu?.company?.name : eqp.insu?.person?.name};
 * Assignments to the 'result' variable from inside React Hook React.useEffect will be lost after each render.
 To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property.
 * */
export function useUnitObjToInput(eqp: any, unitvar: string) {
    const result= React.useMemo( () => {
        return {
            id: eqp[unitvar]?.id,
            name: eqp[unitvar]?.company? eqp[unitvar]?.company?.name : eqp[unitvar]?.person?.name
        };
    }, [ eqp, unitvar ]);
    return result;
}
//多个单位Units一起转换 的版本
/**把Unit模型graphQL对象转换成{id,name}简单对象
 * eqp是父辈对象，unitvars是关联的单位Unit字段属性名。
 * unitvars 是数组啊，比如这丫的['makeu','owner','remu','repu','insu','mtu','ispu','useu']；
 * */
export function useUnitObjToInputs(eqp: any, ...unitvars: Array<string>) {
    return React.useMemo( () => {
        const result={} as any;
        unitvars.forEach(unitvar => {
            let obj={
                id: eqp[unitvar]?.id,
                name: eqp[unitvar]?.company? eqp[unitvar]?.company?.name : eqp[unitvar]?.person?.name
            };
            result[unitvar]=obj.id && obj.name && obj;
        });
        return  result;
    }, [ eqp, unitvars ]);
}

/**
 *
 * @param {number|string} f 需要处理的数字
 * @param {number} n 保留位数,默认1
 * @param {string} flag = 'ceil' || 'floor' 向上 或 向下保留，默认四舍五入
 * @returns {string}
 */
export  function floatInterception(f: number, n = 4, flag?: string)
    : string|undefined
{
    if (isNaN(f)) {
        return  undefined;
    }
    if (flag === 'ceil') {
        f = Math.ceil(f * Math.pow(10, n)) / Math.pow(10, n); // n 幂
    } else if (flag === 'floor') {
        f = Math.floor(f * Math.pow(10, n)) / Math.pow(10, n); // n 幂
    } else {
        f = Math.round(f * Math.pow(10, n)) / Math.pow(10, n);  // n 幂 四舍五入
    }
    var s = f.toString();
    var rs = s.indexOf('.');
    //判定如果是整数，增加小数点再补0
    if(n<=0)  return s;
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + n) {
        s += '0';
    }
    return s;
}
/** 输出正规日期给Input
 * @param {number|string} dateOf 需要处理的日期
 * @returns {string}
 */
export function getFormatDate(dateOf?: Date) : string
{
    var date = dateOf?? new Date();
    /*var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    */
    return date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate();
}

/**方便多选的Select找出已经选中的源对象。
 * @param ids 多个选中的<option>的项目对应key value; 不允许重复id。
 * @param objs 原始对象数组 列表形式,不允许重复：对象必须有个字段是id的。
 * @returns 选中对象数组
 */
export  function idsSelectMapper(ids: string[], objs: any[])
    : any[]
{
    let out=[] as any;
    let i=0, m=0;
    while (i < objs.length) {
        let safei =i, safem= m;
        ids.forEach((value, index, array) =>{
            if(objs[safei].id === value)
                out[safem++]=objs[safei];
        } );
        m= safem;
        i++;
    }
    return out;
}

/**部门科室职工树形分裂的列表多人选择： 当前一次Select多选，不代表整个用户列表的全部重置了。
 * @param oldSobs 旧的原选中对象数组, 运行本函数后oldSobs应该保证不变的。对象必须有个字段是id的。
 * @param ids 当前列表待选列表的 多个选中的<option>的项目对应key value; 不允许重复id。
 * @param objs 当前列表待选列表的  原始对象数组,不允许重复：对象必须有个字段是id的。
 * @returns  最新的选中对象数组
 */
export  function idsTreeSelectMapper(oldSobs:any[], ids: string[], objs: any[])
    : any[]
{
    let out=[] as any;
    let delObjix=[] as boolean[];
    let i=0, m=0;
    while (i < objs.length) {
        let safei =i, safem= m;
        ids.forEach((value, index, array) =>{
            if(objs[safei].id === value){
                out[safem++]=objs[safei];
            }
        } );
        m= safem;
        //有没有在当前选择之中：实际都得从旧的选中列表清空
        oldSobs?.forEach((value, index, array) =>{
            if(objs[safei].id === value.id){
                delObjix[index]= true;
            }
        } );
        i++;
    }
    //整合剩下的旧选择中的对象
    oldSobs?.forEach((value, index, array) =>{
        if(!delObjix[index]){
            out[m++]=value;
        }
    } );
    return out;
}

/**获取模板版本号并排序。
 * @param typem 选中的模板类型编码。
 * @returns  排序后版本数组 ,如 [['6',['2022福建版本','2022-08-09']], [ ]，] ； 特别注意日期字段所在数组的位置[1][1]。
 */
export  function getSortedModelVersions(typem: keyof typeof ModelTypeArr)
    : [string,[string,Date]][]
{
    if(!typem)  return [];
    let arv=Object.entries((ModelTypeArr[typem] as any).vers || {});
    if(!(ModelTypeArr[typem] as any).vers)  return [];
    arv?.sort(function(a :any, b:any) {
        if (a[1][1] > b[1][1]) {         //定位到Date类型的? ：any问题？ 配置参数字段。#并不是字符串方式的比较大小！
            return  -1      //返回，a排列在b之前
        } else {
            return  1      //返回，b排列在a之前
        }
    });     //原数据变动。   return arv as unknown as [string,[string,Date]];
    return arv as [string,[string,Date]][];
}

/**把{id,name}对象转换成graphQL Input简单ID变量字段；
 * varset是父辈对象，objvars是关联的{id,name}对象字段属性名。
 * objvars 是数组啊，比如这丫的['makeu','owner','remu','repu','insu','mtu','ispu','useu']；
 * */
export function useObjToInputs(varset: any, ...objvars: Array<string>) {
    return React.useMemo( () => {
        const result={} as any;
        objvars.forEach(onevar => {
            result[onevar]= varset[onevar]?.id;
        });
        return  {...varset, ...result};
    }, [ varset, objvars ]);
}
/** 类似 useObjToInputs ，但不是Hook版本，用于纯粹外部执行的代码和React无瓜葛，不是组件函数中的。
Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
 只留下ID；不要其它字段。
* */
export function fromObjToInput(varset: any, ...objvars: Array<string>) {
    const result={} as any;
    objvars.forEach(onevar => {
        result[onevar]= varset[onevar]?.id;
    });
    return  {...varset, ...result};
}
/**剔除数组中无效值
 */
export  function omitArnull(arr:any[])
    : any[]
{
    if(!arr)    return [];
    let out=[] as any;
    let i=0, m=0;
    while(i < arr.length) {
        if(arr[i])    out[m++]=arr[i];
        i++;
    }
    return out;
}
/**三态逻辑转映射 false='0' , true='1'， 任意的ANY=null='2';
 */
export  function bool3t(boolnumb?:string)
    : boolean|null
{
    if(boolnumb===undefined || boolnumb==='2')    return null;
    else return (boolnumb==='1')
}
/**把<select />多选形态的选择事件转成 []选择值。
 * 输入 e: onChange={e => {}}的事件 e;
 * 但是Select<>多选的<option value={''}></option>默认空选择为""需要剔除掉
 */
export  function mutiSelectedArr(e: any)
    : string[]
{
    const selects=[];
    for (let i = 0; i < e.currentTarget.selectedOptions.length; i++) {
        let selectOne=e.currentTarget.selectedOptions[i].value;
        if(selectOne!=="")
            selects.push(selectOne);
    }
    return selects;
}
/**把对象简化，便于存储。  只留下id + name；不要其它字段。
 * */
export function idNameOf(obj: any) {
    return  {id: obj?.id,  name: obj?.name};
}
/**把User版的对象简化，便于存储。  只留下id + name；不要其它字段。
 * */
export function userIdName(obj: any) {
    return  {id: obj?.id,  person: obj?.person&&{name: obj?.person?.name} };
}
/**Relay日期转为中文年月日。
 * */
export function dateToChinese(org: string) {
    let date=new Date(org);
    return date.getFullYear() + "年"+ (date.getMonth() + 1) +"月"+ date.getDate() +"日";
}

/**对象数组的平均值计算：平均速度 需两个字段相除。
 *@param callback 注入逻辑=到底如何处理除数的。callback：处理嵌套的对象结构。
 * @param maxSize 计算数组的几个。
 */
export  function calcAverageArrObj(arr: any[], callback:(curObj:any)=>number, reservDigit:number, maxSize?:number)
    : string|undefined
{
    const validValues = (arr||[]).slice(0,maxSize)
        .filter((item) => item !== "" && item !== null && item !== undefined)
        .map((item) => Number(callback(item)))
    if (validValues.length < 1)   return undefined;
    const sum = validValues.reduce((acc, val) => acc + val, 0)
    return (sum / validValues.length).toFixed(reservDigit)
}

/**对象数组的平均值计算：和最大值。
 *@param callback 注入逻辑=到底如何处理除数的。callback：处理嵌套的对象结构。
 * @param maxSize 计算数组的几个。
 */
export  function calcAverMaxArrObj(arr: any[], callback:(curObj:any)=>number|string, reservDigit:number, maxSize?:number)
{
    let countavspeed=0;
    let  consumeAr=maxSize? arr?.slice(0,maxSize) : arr;
    const avspeed1 =consumeAr?.reduce((prev : number, row:any, i:number) => {
        let  one=callback(row);
        if(one!=='' && one!==null && !isNaN(one as number)){
            prev= prev+ Number(one);      //可能是string++的，就会执行拼接字符串而非加法的;
            //console.log("calcAverageArrObj",one,"prev=",prev,"countavspeed",countavspeed);
            countavspeed++;
        }
        return prev;
    }, 0 );
    if(countavspeed<1)  return [undefined, undefined];
    else{
        const average=floatInterception(avspeed1/countavspeed, reservDigit);
        let maxVal : number;
        consumeAr?.forEach((row: any, i:number)=> {
            let  one=Number(callback(row));
            if(one>maxVal || maxVal===undefined)  maxVal=one;
        });
        return [average, maxVal!];
    }
}

/**把聚合多次的输入字段，field自身是数组模式的。
 * 改成数组形式的存储，空间省一点可是操作麻烦了！  相反地，若平铺对象会更简单但是字段数多了存储浪费一点。
 * @param field: inp里面的某个属性字段名{field本书是数组类型的存储}。
 * @param index: 当前针对哪一个索引的，field存储的数组[]的下标位置就是，本次的Input储存最终数据所在位置。
 * @param txt: Input组件的onSave()输入。
 * @param inp: 整个存储变量;  结构是这样的: const { field: [ ,#index, ] }=inp;   inp是聚合的JSON全字段的状态存储。
 * @param setInp: 和 inp 配对的状态操作变量。
 * */
export const arraySetInp =(field:string, index:number, txt:any, inp: any, setInp:React.Dispatch<React.SetStateAction<any>>
) => {
    if(inp?.[field]){
        inp[field][index]= txt || undefined;
        setInp({...inp,[field]: inp?.[field] });
    }else{
        let inits=new Array(index+1);    //.fill(null);
        inits[index]=txt || undefined;
        setInp({...inp,[field]: inits });
    }
}
/**嵌套对象的属性是数组形式的： field属性是对象，对象底下的其中某一个字段是数组形式的。
 * @param field: inp里面的某个属性字段名{field本书是数组类型的存储}。
 * @param sub: 嵌套的对象的第二层次的字段名。
 * @param index: 当前针对哪一个索引的，field存储的数组[]的下标位置就是，本次的Input储存最终数据所在位置。
 * @param txt: Input组件的onSave()输入。
 * @param inp: 整个存储变量;  结构是这样的: const { sub: [ ,#index, ] }=inp.field;   inp是聚合的JSON全字段的状态存储。
 * @param setInp: 和 inp 配对的状态操作变量。
 * */
export const objNestArrSetInp =(field:string, sub:string, index:number, txt:any, inp: any, setInp:React.Dispatch<React.SetStateAction<any>>
) => {
    if(inp?.[field]?.[sub]){
        inp[field][sub][index]= txt || undefined;
        setInp({...inp,[field]: {...inp?.[field], [sub]: inp?.[field]?.[sub]} });
    }else{
        let inits=new Array(index+1);
        inits[index]=txt || undefined;
        setInp({...inp,[field]:{...inp?.[field] , [sub]: inits} });
    }
}
/**二维表格用的 状态变更：某一行的单一个字段变更，删除一整行，？新增加一行（直接变更指定的最后新加的索引的那一行的每一个字段）。
 * @param table: 嵌套的对象的第二层次的字段名。
 * @param row: 当前针对哪一个索引的，field存储的数组[]的下标位置就是，本次的Input储存最终数据所在位置。
 * @param field: inp里面的某个属性字段名{field本书是数组类型的存储}。
 * @param txt: Input组件的onSave()输入。
 * @param inp: 整个存储变量;  结构是这样的: const { field: [ ,#index, ] }=inp;   inp是聚合的JSON全字段的状态存储。
 * @param setInp: 和 inp 配对的状态操作变量。
 * @param delRow: 删除这一行。
 * */
export const tableSetInp =(table:string, row:number, inp: any, setInp:React.Dispatch<React.SetStateAction<any>>,field?:string, txt?:any,delRow?: boolean
) => {
    if(delRow){
        inp?.[table]?.splice(row, 1);
        setInp({...inp});
    }
    else{
        if(inp?.[table]?.[row]){
            inp[table][row][field!]= txt || undefined;
            setInp({...inp});
        }else if(field){       //新增加一行?
            let inits={ [field]: (txt || undefined) };
            if(!(inp[table]))   inp[table]=[];
            inp[table][row]=inits;
            setInp({...inp});
        }
    }
}
/**嵌套对象的属性二层简单平铺的形式的： inp{ ,field：{ sub：#，},} 优势：避免第一层的字段太多了。
 * @param field: inp里面的某个属性字段名{field本书是数组类型的存储}。
 * @param sub: 嵌套的对象的第二层次的字段名。
 * @param txt: Input组件的输入。
 * @param inp: 整个存储变量;  结构是这样的: const { sub: txt }=inp.field;   inp是聚合的JSON全字段的状态存储。
 * @param setInp: 和 inp 配对的状态操作变量。
 * */
export const objNestSet =(field:string, sub:string,  txt:any, inp: any, setInp:React.Dispatch<React.SetStateAction<any>>
) => {
        setInp({...inp,[field]:{...inp?.[field] , [sub]: txt || undefined} });
}

/**观测 测量 到 结果 有哪些的转换规则
 * */
export function convertMeasureType(vale:any, type :string, d:string|number) {
    if('四'===type){
        let digits =0===d? 0 : d? Number(d) : 1;
        return floatInterception(vale,digits,);
    }
    else if('弃'===type){
        let digits =0===d? 0 : d? Number(d) : 1;
        return floatInterception(vale,digits, 'floor');
    }
}

/**二维表格用的 移动
 * @param table: 嵌套的对象的第二层次的字段名。
 * @param row: 当前针对哪一个索引的，field存储的数组[]的下标位置就是，本次的Input储存最终数据所在位置。
 * @param inp: 整个存储变量;  结构是这样的: const { field: [ ,#index, ] }=inp;   inp是聚合的JSON全字段的状态存储。
 * @param setInp: 和 inp 配对的状态操作变量。
 * @param desRow: 移动到位置索引。
 * @param size: 合计移动几行的。
 * */
export const tableMoveRows =(table:string, tableIdx:number, inp: any, setInp:React.Dispatch<React.SetStateAction<any>>,desRow:number,size:number=1
) => {
    if( desRow >=tableIdx  &&  desRow<=tableIdx+size)
        return false;
    else {
               //const movpart = inp?.单元表?.slice(tableIdx, tableIdx + size);
        //相对于目标位置：在前面，在后面的？
        if(tableIdx > desRow ){
            const movpart = inp?.[table]?.splice(tableIdx, size);
            inp?.[table]?.splice(desRow, 0, ...movpart);
        }else if(tableIdx < desRow ) {
            const movpart = inp?.[table]?.splice(tableIdx, size);
            inp?.[table]?.splice(desRow-size, 0, ...movpart);
        }
        setInp({...inp, [table]: inp?.[table]});
        return true;
    }
}
/**数组 扩维度 转换
 * @param gsize : 约定每几个为一组的;
 * */
export const expandDimension=(config:any[], gsize:number=2
) => {
    const newcfgs = config.reduce((acc:any, curr:any, index:number) => {
        const chunkIndex = Math.floor(index / gsize);
        if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
        }
        acc[chunkIndex].push(curr);
        return acc;
    }, []);
    return newcfgs;
}
/**表单初始化
 * @param arr
 * @param maxSize 计算数组的几个。
 */
export  function initialFormArr(arr: any[], maxSize?:number)
    : any[]
{
    const array=arr || [];
    if(!maxSize)   return array
    const currentLength = array.length
    if (currentLength < maxSize) {
        for (let i = currentLength; i < maxSize; i++) {
            array.push("")
        }
    } else if (currentLength > maxSize) {
        for (let i = currentLength - 1; i >= maxSize; i--) {
            array.pop()
        }
    }
    return array
}

