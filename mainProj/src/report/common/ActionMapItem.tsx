
import * as React from "react";
import {InspectRecordLayout, SelectHookfork, SelectInput, useItemInputControl,} from "../common/base";
import {
    BlobInputList, Input, InputDatalist, InputLine,
} from "customize-easy-ui-component";
import {RecordOmniArea} from "../common/omni";
import {Column_Setting} from "./useFormatOmni";
import {MemoDateInput, MemoDatesInput} from "../../comp/base";
import {CollapsibleFormSection, LineColumn} from "@/components/chub";
import {FormField} from "@/components/shub";

//检验项目的标准化展示组件, 多了2列”工作见证，确认方式“
interface Props  extends React.HTMLAttributes<HTMLDivElement>{
    editAreasConf: RecordOmniArea[];
    /**单一个路由可编辑区域对应的 一部分项目列表的 配置*/
    index: number;
    show?: boolean;
    alone?: boolean;
    ref?: any;
    refWidth?: number;
    /**后面两个参数：定制 ，确认日期字段 有些项目需要拆分为两个日期输入的情况；
     * */
    // custST?: (area:RecordOmniArea,par:any,fields:any)=>any;

    //确认 字段的：确认日期 需要拆分为两个日期输入
    // sureCB?: ({inp,setInp,config,tago,addMemo,icname} :any)=>React.ReactNode;
    /** '资料确认描述或存在问题描述' 输入框的可选择的列表文本。
     * */
    sureList?: string[];
    //是否需确认日期录入， 默认自拆分项目只有一个日期的。
    sureD?: boolean;
    editIts: Column_Setting[];
    //报告ID
    repId?: string;
}
//假如分项报告情况：原来inp:,setInp：是针对局部的存储做修改的。
//普通输入：    //text
//支持 t类型：'',B,l,d,C,S;
const innerRender=(inp: any,setInp: React.Dispatch<React.SetStateAction<any>>,zdCfg:Column_Setting,idx:number,
                   namepr:string,label?:string,refWidth?:number)=>{
    const {n, x, m, t, l, z}=zdCfg;
    let input=null;
    if(t==='d')
        input=<Input value={(inp?.[`${namepr}_`+n]) ?? ''} type='date'
                 onChange={e => setInp({ ...inp, [`${namepr}_`+n]: e.currentTarget.value || undefined})}/>;
    else if(t==='B')
        input=<BlobInputList value={(inp?.[`${namepr}_`+n]) ?? ''} rows={z??2}  datalist={l}
                    onListChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />
    else if(t==='l' && l)
        input=<InputDatalist value={(inp?.[`${namepr}_`+n]) ?? ''}  datalist={l}
                    onListChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />
    else if(t==='C')
        input=<MemoDateInput value={(inp?.[`${namepr}_`+n]) ?? ''}  rows={z??2}
                             onChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />;
    else if(t==='S')
        input=<MemoDatesInput value={(inp?.[`${namepr}_`+n]) ?? ''}  rows={z??2}  refWidth={refWidth}
                             onChange={v => setInp({...inp, [`${namepr}_`+n]: v || undefined}) } />;
    else
        input=<Input value={(inp?.[`${namepr}_`+n]) ?? ''}  size={z}
                    onChange={e => setInp({ ...inp, [`${namepr}_`+n]: e.currentTarget.value || undefined})} />;

    return <InputLine key={idx} label={label??x}>
        {input}
    </InputLine>;
}
/**编辑区：【单一个index=？编辑区域的】 全部项目。  当前editAreasConf[index]是可以动态的。
 * @param editIts   支持是可变的情况: 可能外部需要注入动态的输入列表情况：
    const witnessNos =React.useMemo(() => {
        return storage.见证表?.map((a:any, i:number) => a && a.no);
    }, [storage.见证表]);
    *  _M`];      //备注; _Z`];      //工作见证; _S`];      //确认日期
* 若想orc?._Oitems用户输入的文本有格式化换行效果等，只能在记录编辑的2个解析器这里特殊对待来做。？特殊标记，特定标签的tag '_其它'+i。<br/>替换\n;
 * refWidth：抛弃不用了？ 没必要用LineColumn布局，直接多列的做。
* */
export const ActionMapItem=
React.forwardRef((
    { children, show=true, alone=true,editAreasConf,index,refWidth,sureList,editIts,sureD,repId}:Props, ref
) => {
    const config=editAreasConf[index];
    //汇总结论那一列除外：【规矩】结论是生成的就没有存储。
    const getInpFilter = React.useCallback((par: any) => {
        let fields={} as any;
        //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
        config.items?.forEach((tago, i) => {
            editIts?.forEach(({n, x, m, t, l, z}: Column_Setting, en: number) => {
                //2个特殊，剩下是常规字段
                if(n===null) return;
                else if(!m){
                    if(tago.name){          //全部都会有的编辑项目；除了纯文本的行；
                        if(n==='')
                            fields[tago.name] =par[tago.name];
                        else
                            fields[`${tago.name}_`+n]= par[`${tago.name}_`+n];
                    }
                }else{
                    if(!tago.nconcl){       //归并的那一行位置。：普通项目，自拆分最后合并项。
                        const mergeName=tago.mergName??tago.name;           //itemMergReverseSearch(config, i);
                        if(mergeName){
                            fields[`${mergeName}_`+n]= par[`${mergeName}_`+n];
                        }
                    }
                }
            });
        });
        // if(custST) fields=custST(config, par, fields);  特殊： 附加的存储字段
        // const {见证资料表 }= par;
        return fields;
    }, [config,editIts]);
    const {inp, setInp} = useItemInputControl({ ref });
    //【注意】React.useMemo必须将 <LineColumnFlex> 所依赖的变量refWidth作为依赖项之一，否则否则丢失跟踪的目标，否则无法立刻自适应宽度变化。
    const render =React.useMemo(() => {
        let htmlTxts =[] as any[];
        //允许本编辑区的配置继承来自前面的编辑区。反方向去搜索配置。【前提】最低一级或者第四级别必然做配置的。 x y z可能省略配置。editAreasConf[0]第一个必然会配置全套的。
        //【不同点】允许相等检验项目栏目编码串的，直接融合正在编辑的项目区域显示。
        for(let wf=0; wf<config.items?.length; ){
            const tago=config.items[wf];
            //连续跟随的几个项目是否 ？多个具有相同的项目编码串 alikeSize=相同的个数 项目栏目编码串判定一摸一样横跨剩下几个行的；
            if(tago) {
                let mergLastEt=tago;    //归并区的最后一行
                if(tago.offset){
                    mergLastEt= config.items[wf + tago.offset];
                }
                if(!mergLastEt)  throw new Error(`或没最后一行配置`);
                const icname= mergLastEt.mergName??mergLastEt.name;
                if(!tago.nconcl && !icname)  throw new Error(`或没最后一行配置名`);
                // let mergeName=mergLastEt.mergName;      //itemMergReverseSearch(config, wf); 相反反向的 搜寻存储字段
                let labelStr='' as string;
                if(tago.name){       //优先采用的recap  tips  nos
                    if(tago.nconcl && tago.recap && typeof tago.recap==='string'){
                        if(tago.tips && tago.tips.length<tago.recap.length)
                            labelStr=tago.tips;         //太多了文字！
                        else
                            labelStr=tago.recap as string;
                    }
                    else{
                        //正式默认都只会显示一个合并项目，没有显示拆分项目的： 自拆分的合并，也不好直接用recap。
                        // if(!tago.nconcl && !tago.tips && tago.recap && typeof tago.recap==='string')
                        //     labelStr=tago.recap;
                        // else
                        labelStr=tago.tips? tago.tips: tago.nos? tago.nos+'-结果' : '检验结果';
                    }
                }
                const addMemo= (tago.name && !tago.nconcl) || (tago.mergName && !tago.nconcl);
                //注意 ?? 只能对null undefined有反应，对于 '' 以及 0 都是不会测试成功的。 所以 '' 不能用来替代undefined的位置。
                // const mergLabel=mergLastEt.mergLabel??mergLastEt.mergNos??tago.tips??(typeof tago.recap==='string'? tago.recap:null)??tago.nos;
                //前半部分的 必须使用这个方式添加nodes;否则<LineColumn >无法穿透。
                const headNoLabel=tago.nos? `${tago.pre||''}${tago.iclas||''}${tago.nos}` : `${mergLastEt.pre||''}${mergLastEt.iclas||''}${mergLastEt.mergNos??mergLastEt.nos}`;
                const rowHead =<div key={wf} className="mt-4 @container">
                    { (tago===mergLastEt && mergLastEt.name===undefined)? null
                        :
                        <div className="flex justify-around">
                            <h6>{headNoLabel}</h6>
                            <h6>{tago.rec?.big}&nbsp;&nbsp;{tago.rec?.seco}</h6>
                            <h6>{tago.rec?.third}&nbsp;&nbsp;{tago.rec?.four}</h6>
                        </div>
                    }
                    <div className="flex justify-around">
                                { typeof tago.desc === "string"?
                                    <h5>{tago.desc}</h5>
                                    :
                                    tago.desc
                                }
                    </div><hr/>
                    <div  className="columns-1 @lg:columns-2 @4xl:columns-3 @7xl:columns-4">
                        {
                            tago.name && editIts.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n===null) return null;
                                else if(n===''){
                                    if(l) return <InputLine key={i} label={labelStr}>
                                                <SelectInput value={(inp?.[tago.name!]) ?? ''}  list={l}
                                                             onChange={e => setInp({ ...inp, [tago.name!]: e.currentTarget.value||undefined }) }/>
                                            </InputLine>;
                                    return <InputLine key={i} label={labelStr}>
                                            <SelectHookfork value={(inp?.[tago.name!]) ?? ''} onChange={e => {
                                                setInp({ ...inp, [tago.name!]: e.currentTarget.value || undefined}); }} />
                                        </InputLine>;
                                }
                                else if(!m){
                                    return innerRender(inp,setInp,editIts[i],i, tago.name!,undefined,refWidth);
                                }
                                return null;
                            })
                        }
                        {
                            addMemo && editIts.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n===null) return null;
                                else if(m){
                                    const label=`${tago.mergNos??tago.nos??''}`+x;
                                    return innerRender(inp,setInp,editIts[i],i, icname!,label,refWidth);
                                }
                                return null;
                            })
                        }
                    </div>
                </div>;

                htmlTxts.push(rowHead);
            }
            wf+= 1;
        }

        return  htmlTxts;
    }, [config,inp,setInp, editIts]);

    return  <CollapsibleFormSection title={`${config.name??config.tag}`} defaultOpen={show}>
        {render}
    </CollapsibleFormSection>;

    // <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
    //                              alone={alone} label={`${config.name??config.tag}`} repId={repId}>
    //     {render}
    // </InspectRecordLayout>;
} );

