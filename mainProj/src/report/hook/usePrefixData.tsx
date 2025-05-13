import * as React from "react";
import { BlobInputList,InputDatalist,SuffixInput,} from "@/components/chub";
import {FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea,Input, Switch} from "@/components/ui"
import {CCell, TableRow} from "@/components/flexible-table";
import {CCellUnit, } from "../common/base";
import type { UseFormReturn } from "react-hook-form"


/**给usePrefixDataTable配套的， 2排编辑器。 【缺点】只能最多支持2排的布局的。支持配置方式的pr:""前缀列。不支持直接拆分的。 不支持分项报告；
 * 对比（useThreeColumnView、）它是支持直接拆分支持3排的布局；
 * 类似设备概况的：支持'_$'开头的字段：无需编辑输入的配置情形。`
 * @param config  范式模型配置; 基础配置统一为[desc, name, cb] 3元组合的。`
 * @param itemA  外部需要的在inp体现字段。  inp:any,setInp:React.Dispatch<React.SetStateAction<any>>,
 *预定义编辑器的render回调 cb.edit(inp, setInp) 也必需要修改了： cb.edit(form: UseFormReturn<any, any, any>)
 * 【注意】上级定义样式 @container ；
 * */
export const usePrefixDataEdit= ({ config,itemA, form }  :
                             {  config:any[][][], itemA?:string[], form: UseFormReturn<any, any, any> }
) => {
    //surveyItems: 2大列布局映射成： 统一1个列表的。 编辑器没有考虑左边还是右边的那一列位置关系。
    const [surveyItems,] = React.useMemo(() => {
        const surveyItems = [] as any;          //原本布局2排或1排的，需首先转为正常的1排列表，若desc有前缀的首先预处理！
        let oldPref1='';
        let oldPref2='';
        config?.forEach(([[desc, name, cb], add2p]: any, i: number) => {
            let [desc2, name2, cb2] = add2p || [];
            if (typeof desc === 'object'){
                oldPref1= desc?.pr===null? '' : desc?.pr? desc?.pr : oldPref1;
                desc=oldPref1 +' > '+ desc?.t;
            }else{
                oldPref1='';         //继承性中断
            }
            if (typeof desc2 === 'object'){
                oldPref2= desc2?.pr===null? '' : desc2?.pr? desc2?.pr : oldPref2;
                desc2=oldPref2 +' > '+ desc2?.t;
            }else{
                oldPref2='';         //继承性中断
            }
            if (typeof name === 'string' && !name?.startsWith('_$')) surveyItems.push({name, desc, cb});
            else if (typeof name === 'object' && name.n && !name.r && !name.n.startsWith('_$')) surveyItems.push({name: name.n, desc, cb, type: name.t, unit: name.u, list: name.l});
            if (typeof name2 === 'string' && name2 && !name2.startsWith('_$')) surveyItems.push({name: name2, desc: desc2, cb: cb2});
            else if (typeof name2 === 'object' && name2.n && !name2.r && !name2.n.startsWith('_$')) surveyItems.push({name: name2.n, desc: desc2, cb: cb2, type: name2.t, unit: name2.u, list: name2.l});
        });
        return [surveyItems,];
    }, [config,itemA]);
    //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
    const render= React.useMemo(() =>
        {
            const lastAiObj=surveyItems[surveyItems.length-1];
            const isMemoLast= lastAiObj?.type==='m';
            const toTailNodes: React.ReactNode[]=[];         //支持有些DOM溢出移动到了<LineColumn外部做布局的。 cb?.{toTail, edit};
            //这里假定上层表单<form >有设置 @container 样式。
         return <>
             <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-4">
                 {
                     surveyItems.map(({name, desc:orgDesc, cb, type, unit, list}: any, i: number) => {
                         if(isMemoLast && (surveyItems.length-1)===i)  return null;
                         let desc;
                         if (typeof orgDesc === 'object'){
                             desc=orgDesc?.pr + orgDesc?.t;
                         }
                         else desc=orgDesc;
                         if (cb?.edit) {
                             if(!cb?.toTail)
                                 return <React.Fragment key={i}>{ cb.edit(form) }</React.Fragment>;
                             else{
                                 const aNode=<React.Fragment key={i}>
                                     <h6>{cb?.toTail}：</h6>
                                     { cb.edit(form) }
                                 </React.Fragment>;
                                 toTailNodes.push(aNode);
                                 return null;
                             }
                         } else if (type === 'l') return <FormField
                                         key={name}
                                         control={form.control}
                                         name={name  as any}
                                         render={({ field }) => (
                                             <FormItem className="pt-2 w-full break-inside-avoid">
                                                 <FormLabel>{desc}</FormLabel>
                                                 <FormControl className="w-full">
                                                     <InputDatalist  datalist={list} unit={unit}  {...field}  />
                                                 </FormControl>
                                                 <FormMessage />
                                             </FormItem>
                                         )}
                                     />;
                         else if (type === 'd') return <FormField
                                             key={name}
                                             control={form.control}
                                             name={name  as any}
                                             render={({ field }) => (
                                                 <FormItem className="pt-2 w-full break-inside-avoid">
                                                     <FormLabel>{desc}</FormLabel>
                                                     <FormControl  className="w-full">
                                                         <Input type='date'   {...field}  />
                                                     </FormControl>
                                                     <FormMessage />
                                                 </FormItem>
                                             )}
                                         />;
                         else if (type === 'b') return <FormField
                                         key={name}
                                         control={form.control}
                                         name={name  as any}
                                         render={({ field }) => (
                                             <FormItem className="pt-2 w-full break-inside-avoid">
                                                 <FormLabel>{desc}</FormLabel>
                                                 <FormControl  className="w-full">
                                                     <Switch   {...field}  />
                                                 </FormControl>
                                                 <FormMessage />
                                             </FormItem>
                                         )}
                                     />;
                         else if (type === 'B') return <FormField
                                         key={name}
                                         control={form.control}
                                         name={name  as any}
                                         render={({ field }) => (
                                             <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2">
                                                 <FormLabel>{desc}</FormLabel>
                                                 <FormControl className="w-full">
                                                     <BlobInputList datalist={list} unit={unit}  {...field}  />
                                                 </FormControl>
                                                 <FormMessage />
                                             </FormItem>
                                         )}
                                     />;
                         else if (type === 'm') return <FormField
                                             key={name}
                                             control={form.control}
                                             name={name  as any}
                                             render={({ field }) => (
                                                 <FormItem className="pt-2 w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                                     <FormLabel>{desc}:</FormLabel>
                                                     <FormControl  className="w-full">
                                                         <Textarea rows={4}  {...field} />
                                                     </FormControl>
                                                     <FormMessage />
                                                 </FormItem>
                                             )}
                                         />;
                         else if (unit) return <FormField
                                         key={name}
                                         control={form.control}
                                         name={name  as any}
                                         render={({ field }) => (
                                             <FormItem className="pt-2 w-full break-inside-avoid">
                                                 <FormLabel>{desc}：</FormLabel>
                                                 <FormControl className="w-full">
                                                     <SuffixInput  unit={unit}  {...field}  />
                                                 </FormControl>
                                                 <FormMessage />
                                             </FormItem>
                                         )}
                                     />;
                         else return <FormField
                                 key={name}
                                 control={form.control}
                                 name={name  as any}
                                 render={({ field }) => (
                                     <FormItem className="pt-2 w-full break-inside-avoid">
                                         <FormLabel>{desc + `:`}</FormLabel>
                                         <FormControl  className="w-full">
                                             <Input type={type === 'n' ? "number" : undefined}   {...field}  />
                                         </FormControl>
                                         <FormMessage />
                                     </FormItem>
                                 )}
                             />;
                     })
                 }
             </div>
             {toTailNodes}
             { isMemoLast && <>
                 {lastAiObj.desc}:
                 <FormField
                     key={lastAiObj.name}
                     control={form.control}
                     name={lastAiObj.name  as any}
                     render={({ field }) => (
                         <FormItem className="pt-2 w-full break-inside-avoid">
                             <FormLabel></FormLabel>
                             <FormControl  className="w-full">
                                 <Textarea rows={5}  {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                     )}
                 />
             </>
             }
        </>;
        }
        ,[surveyItems]);
  return [render];
}

// export type AdditionalCc = {
//     [number]: any;
// };
interface PrefixDataTableProps {
    orc: any;
    parentOrc?: any;
    config: any[][][];
    rep: any;
    slash?: boolean;
    //【规定】字典类型的 类似于{ 0:  <CCell rowSpan={3}>性能参数</CCell>, } 说明附加的列的第几行在第一列的位置去插入的；插入位置固定在第一列的。 “0”标识第一行的；
    embed?: any;
}
/**和usePrefixDataEdit对应的 配套，可兼容分项报告展示。 【缺点】最多支持2排的/俩个大区列布局的。
 * 【局限性】：不支持3大列组合的，也即有desc3的情况。这只考虑1个2个的大列，2排的设备概要形式。
 * 都安排（2+1）*2大的Cell； 预留单元格布局 6列;
 * 设备概况，还会支持有多各行共有的列标题，前缀性质的汇总列。不能支持3个字段组合区形式。
 * @param config: 配置。
 * @param  slash 打斜杠
 * @param  parentOrc  和 orc对应， 分项报告的情形用的。
 * @return  不能用DOM<></>在做一次包裹的，否则hhref无法点击生效。
 * 空白用 [' ',{r:' '}]
 *用例  [ [{pr:'性能参数', span:2, t:'额'}, '_$量', 't/h'],   [],  ],
 *      [[{t:'锅筒工作压力'}, '_$锅', 'MPa'],  ['锅',{n:'筒工温', u:'℃'}, input工作温],   ],
 * className="text-sm" 外部表格定义？
 * */
export const usePrefixDataTable= ({orc, config, rep, parentOrc:orgParOrc, slash,embed} : PrefixDataTableProps
) => {
    const parentOrc=orgParOrc? orgParOrc : orc;         //兼容分项报告的情形
    let prefix1='',     prefix2='';
    const nodes=config?.map(([[desc,name,cb],add2p] : any, i:number)=> {
        const [desc2,name2,cb2]= add2p||[];
        //<CCell colSpan={desc2? 1 : 3}>{typeof desc==='string'? name: desc?.view(orc)}</CCell>  '见附录13'
        //附加单位的两个形式：第三位置自带单位的， 或第二对象内部u字段指明单位。
        // console.log("检验设备情况3 faxian=", name2,'sdfds',typeof orc?.[name2]);
        const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
        const txtnode1=cb&&cb.view? cb.view(orc, parentOrc,rep) :
            typeof name==='string'? (name?.startsWith('_$')? parentOrc?.[name.substring(2)] : orc?.[name]) :
                name.r? name.r :
                    name.t==='b'? (orc?.[name.n]? '是':'否') :
                        name.t === 'm' ? <div css={{textAlign: 'left', whiteSpace: 'pre-wrap'}}>{orc?.[name.n] ?? '／'}</div>
                            :
                            name.n.startsWith('_$') ? parentOrc?.[name.n.substring(2)] :
                                orc?.[name.n];

        const tailUnit2=!desc2? undefined :
            typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
        const txtnode2=!desc2? undefined :
            cb2&&cb2.view? cb2.view(orc, parentOrc,rep) :
                typeof name2==='string'? (name2?.startsWith('_$')? parentOrc?.[name2.substring(2)] : orc?.[name2]) :
                    name2.r? name2.r :
                        name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                            name2.n.startsWith('_$')? parentOrc?.[name2.n.substring(2)] :
                                orc?.[name2.n];

        if(typeof desc==='object')
            prefix1=desc?.pr===null? '' : desc?.pr? desc?.pr : prefix1;
        else prefix1='';
        if(typeof desc2==='object')
            prefix2=desc2?.pr===null? '' : desc2?.pr? desc2?.pr : prefix2;
        else prefix2='';

        return <React.Fragment key={i}>
            <TableRow className={"break-all"}>
                { embed && embed[i] }
                { (typeof desc==='object' && desc.span) && <CCell rowSpan={desc.span}>{desc?.prview? desc?.prview(orc,parentOrc) : desc?.pr}</CCell> }
                <CCell colSpan={prefix1 ? 1 : 2}>{typeof desc==='string'? desc: desc?.view? desc?.view(orc,parentOrc,rep) : desc?.t}</CCell>
                { tailUnit1?
                    <CCellUnit unit={tailUnit1} colSpan={name2? 1:4}>{txtnode1??(slash&&'／')}</CCellUnit>
                    :
                    <CCell colSpan={name2? 1:4}>{txtnode1??(slash&&'／')}</CCell>
                }
                {desc2 && <>
                    { (typeof desc2==='object' && desc2.span) && <CCell rowSpan={desc2.span}>{desc2?.prview? desc2?.prview(orc,parentOrc) : desc2?.pr}</CCell> }
                    <CCell colSpan={prefix2 ? 1 : 2}>{typeof desc2==='string'? desc2: desc2?.view? desc2?.view(orc,parentOrc,rep) : desc2?.t}</CCell>
                    { tailUnit2?
                        <CCellUnit unit={tailUnit2} >{txtnode2??(slash&&'／')}</CCellUnit>
                        :
                        <CCell >{txtnode2??(slash&&'／')}</CCell>
                    }
                </>
                }
            </TableRow>
        </React.Fragment>;
    });
    return  nodes;
};
