import * as React from "react";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {DirectLink} from "../../routing/Link";
import {multilines2Html} from "../tools";
import {CCellUnit, InternalItemProps} from "../common/base";


/**可用于分项报告模板的非主报告版本；【局限性】分项报告版； 三列组合的 可编辑 检验概况 ，适合1-3俩列的设备概况布局。 约束性：表格各列外部限制了各列排版比例！
 * @property  orc ：分项的数据。
 * @property  parentOrc : 主报告的记录，允许直接引用父报告的台账字段。
 * @property  split : 支持按照一行做拆分config的，分成2半，或更多分区作独立输出分解的。默认是整个输出的。 split[]的内容是config数组的0开始的顺序序号必须排序好了。意思：拆分到了为止，序号后面的行要分离出去。
 * @property href ：只考虑针对同一个编辑器导航的。
 * @return  node parts[] ：不拆分的只有一个[node] ,拆分个数不能动态。 可直接按行分解变身几个部分！每个独立再来拼装的。
 * @param slash  需斜杠替换空白的。的可能多个;(规定分成6列)
 * 【新特点】 可以理顺 异构表格的配置和展示模式。 注意参数 split 不能作动态。
 * 问题： colSpan无法自己注入？ 思虑：回调注入配置的？； 【还是用了】数据隐含的事实的约定俗成模式(规定分成6列)。
 * 第一列的 desc?.view(orc)：还做了定制字体的注入。
 * 通用性好的，#可惜【不够灵活】 外部很难去修正<CCell>的样式 colSpan fontSize了。
 * */
export function useThreeColumnSubr({orc, config, parentOrc,href, split, slash}
   : {orc: any,config:any[][][], parentOrc: any,href:string, split?:number[],slash?:boolean}
) {
    const newCfgs= React.useMemo( () => {
        const MaxIdx=config.length-1;
        if(split && split.length>0){
            let newCfgs=[];
            let front=0;
            for(let tailIdx of split){
                if(tailIdx<0 || tailIdx>MaxIdx)    throw new Error("超范围");
                newCfgs.push( config.slice(front, tailIdx) );           //不包含tailIdx
                front=tailIdx;
            }
            //剩下末尾部分
            if(front<=MaxIdx){
                newCfgs.push( config.slice(front, MaxIdx+1) );
            }
            return newCfgs;
        }
        else
            return [config];
    }, [split, config]);
    //可直接按行分解变身几个部分的：
    const parts= newCfgs?.map(( config : any[][][], i:number)=> {
        if(config.length<1)   throw new Error("配置错");
        return <>
            <DirectLink  href={href}>
                {
                    config?.map(([[desc,name,cb],add2p,thirdP] : any, i:number)=> {
                        const [desc2,name2,cb2]= add2p||[];
                        //<CCell colSpan={desc2? 1 : 3}>{typeof desc==='string'? name: desc?.view(orc)}</CCell>  '见附录13'
                        //附加单位的两个形式：第三位置自带单位的， 或第二对象内部u字段指明单位。
                        // console.log("检验设备情况3 faxian=", name2,'sdfds',typeof orc?.[name2]);
                        const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
                        const txtnode1=cb&&cb.view? cb.view(orc, parentOrc) :
                            typeof name==='string'? (name?.startsWith('_$')? parentOrc?.[name.substring(2)] : orc?.[name]) :
                                name.r? name.r :
                                    name.t==='b'? (orc?.[name.n]? '是':'否') :
                                        name.t==='m'? <div css={{textAlign: 'left'}}>
                                                {multilines2Html(orc?.[name.n],  (txt,i)=>{
                                                    return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                                                })}</div>  :
                                            orc?.[name.n];
                        const tailUnit2=!desc2? undefined :
                            typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
                        const txtnode2=!desc2? undefined :
                            cb2&&cb2.view? cb2.view(orc, parentOrc) :
                                typeof name2==='string'? (name2?.startsWith('_$')? parentOrc?.[name2.substring(2)] : orc?.[name2]) :
                                    name2.r? name2.r :
                                        name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                                            orc?.[name2.n];
                        const [desc3,name3,cb3]= thirdP||[];
                        const tailUnit3=!desc3? undefined :
                            typeof cb3==='string'? cb3 : (typeof name3==='object' && name3.u)? name3.u:undefined;
                        const txtnode3=!desc3? undefined :
                            cb3&&cb3.view? cb3.view(orc, parentOrc) :
                                typeof name3==='string'? (name3?.startsWith('_$')? parentOrc?.[name3.substring(2)] : orc?.[name3]) :
                                    name3.r? name3.r :
                                        name3.t==='b'? (orc?.[name3.n]? '是':'否') :
                                            orc?.[name3.n];
                        return <React.Fragment key={i}>
                            <TableRow>
                                <CCell>{typeof desc==='string'? desc: desc?.view(orc)}</CCell>
                                { tailUnit1?
                                    <CCellUnit unit={tailUnit1} colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCellUnit>
                                    :
                                    <CCell colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCell>
                                }
                                {desc2 && <>
                                    <CCell>{desc2}</CCell>
                                    { tailUnit2?
                                        <CCellUnit unit={tailUnit2} colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCellUnit>
                                        :
                                        <CCell colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCell>
                                    }
                                  </>
                                }
                                {desc3 && <>
                                    <CCell>{desc3}</CCell>
                                    { tailUnit3?
                                        <CCellUnit unit={tailUnit3}>{txtnode3??(slash&&'／')}</CCellUnit>
                                        :
                                        <CCell>{txtnode3??(slash&&'／')}</CCell>
                                    }
                                  </>
                                }
                            </TableRow>
                        </React.Fragment>;
                    })
                }
            </DirectLink>
        </>;
    });
    return  parts;
}

interface ThreeColumnViewProps {
    orc: any;
    // href: string;
    split?: number[];
    slash?: boolean;
    // config: ( (verId:string)=>any[][][] ) | any[][][];  还是需外部上一级准备
    config: any[][][];
    //必须和拆分组数保证一一对应{不是第几行}。 在该区域的第一行Row头部第一列前面做嵌入的。
    embedCol?: any[];
}
/**仅适应于主报告的版本;   三列组合的 可编辑 检验概况 ，可类比usePrefixDataReviewTbl，这里是支持3列的；【可以】支持拆分区块，支持嵌入列；
 * @property  orc ：记录数据。
 * @property  split : 支持按照一行做拆分config的，分成2半，或更多分区作独立输出分解的。默认是整个输出的。 split[]的内容是config数组的0开始的顺序序号必须排序好了。意思：拆分到了为止，序号后面的行要分离出去。
 * @property href ：只考虑针对同一个编辑器导航的。
 * @return  node parts[] ：不拆分的只有一个[node] ,拆分个数不能动态。 可直接按行分解变身几个部分！每个独立再来拼装的。
 * @param slash  需斜杠替换空白的。的可能多个;(规定分成6列)
 * 【新特点】 可以理顺 异构表格的配置和展示模式。 注意参数 split 不能作动态。
 * 问题： colSpan无法自己注入？ 思虑：回调注入配置的？； 【还是用了】数据隐含的事实的约定俗成模式(规定分成6列)。
 * 第一列的 desc?.view(orc)：还做了定制字体的注入。
 * 通用性好的，#可惜【不够灵活】 外部很难去修正<CCell>的样式 colSpan fontSize了。
 * 第一个配置项desc:以支持{desc?.view(orc)}形式，#特别地#回调函数必须自带<CCell></CCell>;
 * */
export function useThreeColumnView({orc, config, split, slash,embedCol}: ThreeColumnViewProps
) {
    const newCfgs= React.useMemo( () => {
        const MaxIdx=config.length-1;
        if(split && split.length>0){
            let newCfgs=[];
            let front=0;
            for(let tailIdx of split){
                if(tailIdx<0 || tailIdx>MaxIdx)    throw new Error("超范围");
                newCfgs.push( config.slice(front, tailIdx) );           //不包含tailIdx
                front=tailIdx;
            }
            //剩下末尾部分
            if(front<=MaxIdx){
                newCfgs.push( config.slice(front, MaxIdx+1) );
            }
            return newCfgs;
        }
        else
            return [config];
    }, [split, config]);
    //可直接按行分解变身几个部分的：[ [Row1,Row2...] , ??可能拆解成了多个分区]
    const parts= newCfgs?.map(( aconfig : any[][][], p:number)=> {
        if(aconfig.length<1)   throw new Error("配置错");
        return aconfig?.map(([[desc,name,cb],add2p,thirdP] : any, i:number)=> {
                const [desc2,name2,cb2]= add2p||[];
                const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
                const txtnode1=cb&&cb.view? cb.view(orc) :
                    typeof name==='string'? (name?.startsWith('_$')? orc?.[name.substring(2)] : orc?.[name]) :
                        name.r? name.r :
                            name.t==='b'? (orc?.[name.n]? '是':'否') :
                                name.t === 'm' ?
                                    <div css={{textAlign: 'left', whiteSpace: 'pre-wrap'}}>{orc?.[name.n] ?? '／'}</div>
                                     :
                                    orc?.[name.n];
            const tailUnit2=!desc2? undefined :
                    typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
                const txtnode2=!desc2? undefined :
                    cb2&&cb2.view? cb2.view(orc) :
                        typeof name2==='string'? (name2?.startsWith('_$')? orc?.[name2.substring(2)] : orc?.[name2]) :
                            name2.r? name2.r :
                                name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                                    orc?.[name2.n];
                const [desc3,name3,cb3]= thirdP||[];
                const tailUnit3=!desc3? undefined :
                    typeof cb3==='string'? cb3 : (typeof name3==='object' && name3.u)? name3.u:undefined;
                const txtnode3=!desc3? undefined :
                    cb3&&cb3.view? cb3.view(orc) :
                        typeof name3==='string'? (name3?.startsWith('_$')? orc?.[name3.substring(2)] : orc?.[name3]) :
                            name3.r? name3.r :
                                name3.t==='b'? (orc?.[name3.n]? '是':'否') :
                                    orc?.[name3.n];
                return <React.Fragment key={i}>
                    <TableRow >
                        {0===i && embedCol && embedCol[p] }
                        {typeof desc!=='object'? <CCell>{desc}</CCell> : desc?.view(orc)}
                        { tailUnit1?
                            <CCellUnit unit={tailUnit1} colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCellUnit>
                            :
                            <CCell colSpan={desc3? 1 : desc2? 2: 5}>{txtnode1??(slash&&'／')}</CCell>
                        }
                        {desc2 && <>
                            {typeof desc2!=='object'? <CCell>{desc2}</CCell> : desc2?.view(orc)}
                            { tailUnit2?
                                <CCellUnit unit={tailUnit2} colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCellUnit>
                                :
                                <CCell colSpan={desc3? 1 : 2}>{txtnode2??(slash&&'／')}</CCell>
                            }
                        </>
                        }
                        {desc3 && <>
                            {typeof desc3!=='object'? <CCell>{desc3}</CCell> : desc3?.view(orc)}
                            { tailUnit3?
                                <CCellUnit unit={tailUnit3}>{txtnode3??(slash&&'／')}</CCellUnit>
                                :
                                <CCell>{txtnode3??(slash&&'／')}</CCell>
                            }
                        </>
                        }
                    </TableRow>
                </React.Fragment>;
            });
    });
    return  parts;
}
/**@Deprecated
 * 淘汰：  列区组合的 可编辑 检验概况
 * @property  orc ：记录数据。
 * @property  split : 支持按照一行做拆分config的，分成2半，或更多分区作独立输出分解的。默认是整个输出的。 split[]的内容是config数组的0开始的顺序序号必须排序好了。意思：拆分到了为止，序号后面的行要分离出去。
 * @return  node parts[] ：不拆分的只有一个[node] ,拆分个数不能动态。 可直接按行分解变身几个部分！每个独立再来拼装的。
 * @param slash  需斜杠替换空白的。的可能多个;(规定分成6列)
 *【对比】和useThreeRaftSurveyTbl类似的，但是这个支持分config配置区块的。
 * */
export function useTwoColumnView({orc, config, split, slash}: ThreeColumnViewProps
) {
    const newCfgs= React.useMemo( () => {
        const MaxIdx=config.length-1;
        if(split && split.length>0){
            let newCfgs=[];
            let front=0;
            for(let tailIdx of split){
                if(tailIdx<0 || tailIdx>MaxIdx)    throw new Error("超范围");
                newCfgs.push( config.slice(front, tailIdx) );           //不包含tailIdx
                front=tailIdx;
            }
            //剩下末尾部分
            if(front<=MaxIdx){
                newCfgs.push( config.slice(front, MaxIdx+1) );
            }
            return newCfgs;
        }
        else
            return [config];
    }, [split, config]);
    //可直接按行分解变身几个部分的：
    const parts= newCfgs?.map(( aconfig : any[][][], i:number)=> {
        if(aconfig.length<1)   throw new Error("配置错");
        return aconfig?.map(([[desc,name,cb],add2p,] : any, i:number)=> {
                const [desc2,name2,cb2]= add2p||[];
                const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
                const txtnode1=cb&&cb.view? cb.view(orc) :
                    typeof name==='string'? (name?.startsWith('_$')? orc?.[name.substring(2)] : orc?.[name]) :
                        name.r? name.r :
                            name.t==='b'? (orc?.[name.n]? '是':'否') :
                                name.t==='m'? <div css={{textAlign: 'left'}}>
                                        {multilines2Html(orc?.[name.n],  (txt,i)=>{
                                            return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                                        })}</div>  :
                                    orc?.[name.n];
                const tailUnit2=!desc2? undefined :
                    typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
                const txtnode2=!desc2? undefined :
                    cb2&&cb2.view? cb2.view(orc) :
                        typeof name2==='string'? (name2?.startsWith('_$')? orc?.[name2.substring(2)] : orc?.[name2]) :
                            name2.r? name2.r :
                                name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                                    orc?.[name2.n];
                return <React.Fragment key={i}>
                    <TableRow>
                        {typeof desc!=='object'? <CCell>{desc}</CCell> : desc?.view(orc)}
                        { tailUnit1?
                            <CCellUnit unit={tailUnit1} colSpan={desc2? 1: 3}>{txtnode1??(slash&&'／')}</CCellUnit>
                            :
                            <CCell colSpan={desc2? 1: 3}>{txtnode1??(slash&&'／')}</CCell>
                        }
                        {desc2 && <>
                            {typeof desc2!=='object'? <CCell>{desc2}</CCell> : desc2?.view(orc)}
                            { tailUnit2?
                                <CCellUnit unit={tailUnit2}>{txtnode2??(slash&&'／')}</CCellUnit>
                                :
                                <CCell>{txtnode2??(slash&&'／')}</CCell>
                            }
                        </>
                        }
                    </TableRow>
                </React.Fragment>;
            });
    });
    return  parts;
}
