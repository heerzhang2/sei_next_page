/** @jsxImportSource @emotion/react */
import * as React from "react";
import {InspectRecordLayout, SelectHookfork, useItemInputControl} from "../common/base";
import {BlobInputList, Input, InputLine, LineColumn, Text} from "customize-easy-ui-component";
import {RecordOmniArea} from "../common/omni";
import {MemoDateInput} from "../../comp/base";
import {css} from "@emotion/react";

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
    custST?: (area:RecordOmniArea,par:any,fields:any)=>any;
    //确认 字段的：确认日期 需要拆分为两个日期输入
    sureCB?: ({inp,setInp,config,tago,addMemo,icname} :any)=>React.ReactNode;
    /** '资料确认描述或存在问题描述' 输入框的可选择的列表文本。
     * */
    sureList?: string[];
}

//【单一个编辑区域的】 全部项目。
export const ActionMapItemLikeSundJj=
React.forwardRef((
    { children, show=true, alone=true,editAreasConf,index,refWidth,custST,sureCB,sureList}:Props, ref
) => {
    const config=editAreasConf[index];
    const getInpFilter = React.useCallback((par: any) => {
        let fields={} as any;
        //配置动态命名的字段获取旧的值，还想保存修改数据，还要界面同步显示变化数值的场景，就按这里做法。
        config.items?.forEach((tago, i) => {
            if(tago.name){
                fields[tago.name] =par[tago.name];
                fields[`${tago.name}_D`]= par[`${tago.name}_D`];
            }
            if(!tago.nconcl){       //归并的那一行位置。
                const mergeName=tago.mergName??tago.name;           //itemMergReverseSearch(config, i);
                if(mergeName){
                    // fields[`${mergeName}_M`]= par[`${mergeName}_M`];      //备注
                    // fields[`${mergeName}_Z`]= par[`${mergeName}_Z`];      //工作见证
                    fields[`${mergeName}_S`]= par[`${mergeName}_S`];      //确认时间
                }
            }
        });
        if(custST)
            fields=custST(config, par, fields);
        // const {见证资料表 }= par;
        return fields;
    }, [config,custST]);
    const {inp, setInp} = useItemInputControl({ ref });
    // const witnessNos =React.useMemo(() => {
    //     return storage.见证表?.map((a:any, i:number) => a && a.no);
    // }, [storage.见证表]);

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
                        if(!tago.nconcl && !tago.tips && tago.recap && typeof tago.recap==='string')
                            labelStr=tago.recap;
                        else
                            labelStr=tago.tips? tago.tips: tago.nos? tago.nos+'-结果' : '检验结果';
                    }
                }
                const addMemo= (tago.name && !tago.nconcl) || (tago.mergName && !tago.nconcl);
                //注意 ?? 只能对null undefined有反应，对于 '' 以及 0 都是不会测试成功的。 所以 '' 不能用来替代undefined的位置。
                // const mergLabel=mergLastEt.mergLabel??mergLastEt.mergNos??tago.tips??(typeof tago.recap==='string'? tago.recap:null)??tago.nos;
                //前半部分的 必须使用这个方式添加nodes;否则<LineColumn >无法穿透。
                const headNoLabel=tago.nos? `${tago.pre||''}${tago.iclas||''}${tago.nos}` : `${mergLastEt.pre||''}${mergLastEt.iclas||''}${mergLastEt.mergNos??mergLastEt.nos}`;
                const rowHead =<div key={wf} css={{marginTop: '1rem'}}>
                    { (tago===mergLastEt && mergLastEt.name===undefined)? null
                        :
                        <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Text variant="h6">{headNoLabel}</Text>
                            <Text variant="h6" css={{marginLeft: '0.5rem'}}>{tago.rec?.big}&nbsp;&nbsp;{tago.rec?.seco}</Text>
                            <Text variant="h6" css={{marginLeft: '0.5rem'}}>{tago.rec?.third}&nbsp;&nbsp;{tago.rec?.four}</Text>
                        </div>
                    }
                    <div css={{ display: 'flex', justifyContent: 'space-around' }}>
                                { typeof tago.desc === "string"?
                                    <Text  variant="h5">
                                        {tago.desc}
                                    </Text>
                                    :
                                    tago.desc
                                }
                    </div>
                    <hr/>
                    <LineColumn  column={5}>
                        { tago.name && <>
                            <InputLine label={labelStr}>
                                <SelectHookfork value={(inp?.[tago.name!]) || ''} onChange={e => {
                                    setInp({ ...inp, [tago.name!]: e.currentTarget.value || undefined}); }} />
                            </InputLine>
                            <InputLine  label='确认或问题描述'>
                                <BlobInputList value={(inp?.[`${tago.name}_D`]) || ''}   datalist={sureList}
                                               onListChange={v => setInp({...inp, [`${tago.name}_D`]: v || undefined}) } />
                            </InputLine>
                          </>
                        }
                        { sureCB? sureCB({inp,setInp,config,tago,addMemo,icname})
                            :
                            addMemo &&  <>
                                <InputLine label={`${tago.mergNos ?? tago.nos ?? ''}确认日期`} >
                                    <MemoDateInput value={inp?.[`${icname}_S`] || ''} rows={2}
                                                   onChange={v => setInp({...inp, [`${icname}_S`]: v || undefined}) } />
                                </InputLine>
                            </>
                        }
                    </LineColumn>
                </div>;

                htmlTxts.push(rowHead);
            }
            wf += 1;
        }

        return htmlTxts;
    }, [config, inp, setInp, sureList, sureCB]);

    return (<InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={`${config.name ?? config.tag}`}
    >
        {render}
    </InspectRecordLayout>);
});


//<InputLine label={`${tago.mergNos ?? tago.nos ?? ''}确认日期`} lineStyle={css`flex-wrap:nowrap;`}>
