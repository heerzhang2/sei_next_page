/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, TableRow,} from "customize-easy-ui-component";
import {CCellUnit,} from "../common/base";
import { JSX } from "@emotion/react/jsx-runtime";

interface Props {
    orc: any;
    rep?: any;
    //基本配置： 只能是静态大小的。
    config: any[][];
    /**剩下的各列展示：只能放在预定义设定列的后面的。
     orc
     name :存储字段名
     */
    tailRender: (orc: any, name:string) => React.ReactNode;
    /**拆分的序号，0开始的，1个变成++区域的显示输出
     * 序号必须要从小大大的排序, 且满足 >=0 && <config.length；
     * 拆分含 split[ptr]对应的哪一个， 也就是若split=[0]那代表是0行独区域，1行之后另外一个独立区域。大于序号的是下一个区域
     * */
    split?: number[];
    //【凭name插入栏目】单位栏目列前面插入一个内容列：其存储名字是contc 这个列是在单位栏目列之前的布局; 而tailRender()只能放在单位列后面的布局栏目。
    contc?: string;
    //单位不是作为独立的列出现的， 而是合并给 contc 栏目列的。 这个场景contc就必须设置上。附加给了contc；所以列数少一列！
    unitCel?:boolean;
    //没有显示序号的栏目
    noNo?:boolean;
    //允许修改标题栏目的span: 默认值是=1;
    tspan?: number;
}

/**@Deprecated  用useOmnipotentPref可替代；    @@ 可相应得配置也要改造！
 * 承压常用的：前几规定文本，后几列输入的。 注意 输出的列数看配置可变动！
 * 淘汰模型：承压类的宏观检查 {特别的配置 } ，后的第三个字段标识：是否标题也是手工录入的？
 * items工作内容 = [['上次问', {t: '1 上次报告提出问题整改情况', pr: '锅炉管理、运行情况', span: 4, }, true],
 * 替代原本的const somepartOf =React.useCallback((part: number) => { },[rep,orc]);
 * 【约定】 模型可有可无的列：第一行必须配置=null不能undefined; 用来简单地判别是否存在这个列栏目！
 * @特殊化地 用户自定义录入标题模式： adddesc? orc?.[name]?.a 特定存储；
 * */
export function useFixRowPrefUnt({orc, rep, config, tailRender, split, contc,unitCel,noNo}: Props
) {
    let inherSpan = 0;     //每一行配置可能继承上面的行配置受到前面span所影响：item宏观检验o 配置模型的
    let oldunit = '';
    let outnode = [];        //根据split[] 拆分多个的。默认一个
    let morenode: JSX.Element[]=[];
    let splitptr=0;
    //let hasPref=config[0]?.[1]?.pr!==undefined;  # 前缀栏目作为必选Cell占位的 【计算】colSpan当中；
    let hasUnit=config[0]?.[1]?.u!==undefined;          //直接依据第一行的配置的单位栏目: 没有Cell占位计算；
    config.forEach(([name,conf,adddesc]: any, i:number) => {
        //遇到了拆分哪一个输赢序号了：
        if(split && i>split[splitptr]){
            outnode.push(morenode);
            morenode=[];
            splitptr++;
        }
        const {t: title, pr: prefix, span, u:unit}=conf;     //【隐含模型定义字段】从模型提取参数
        oldunit=unit===null? '' : unit? unit:oldunit;
        if(span)  inherSpan=span;
        else if(inherSpan>0)  inherSpan--;
        morenode.push(<TableRow key={i}>
            {!noNo && <CCell>{i+1}</CCell>}
            {prefix && <CCell split={true} rowSpan={span??1}>{prefix}</CCell>}
            {inherSpan>0?
                <CCell>{adddesc? orc?.[name]?.a??'／' : title}</CCell>
                :
                <CCell colSpan={2}>{adddesc? orc?.[name]?.a??'／' : title}</CCell>
            }

            { (unitCel && contc)? <>
                    {hasUnit && <>
                        {oldunit ?
                            <CCellUnit unit={oldunit}>{orc?.[name]?.[contc]??'／'}</CCellUnit>
                              :
                            <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
                        }
                     </>
                    }
                </>
                :
                <>
                    { contc &&
                        <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
                    }
                    {hasUnit && <>
                        {oldunit ?
                            <CCell>{oldunit}</CCell>
                            :
                            <CCell></CCell>
                        }
                     </>
                    }
                </>
            }

            {tailRender(orc, name)}
        </TableRow>);
    });
    outnode.push(morenode);
  return [ outnode ];
}

/**@Deprecated      用 useOmnipotentPref 可替代；useOmnipotentPrefCs可相应得配置也要改造！ 改造例子/gas/ldistanceJj/JobResponsibili.tsx
 * 【淘汰】做法；  useFixRowPrefUnt也淘汰了；
 * 单位字段允许null配置从而支持可修改单位情况。
 * 【事先约定】用户自定义的单位的存储字段：t; 底下<CCell>{orc?.[name]?.t}</CCell>
 * @property tspan: 标题主栏目对应实际列数，默认=1;
 * */
export function useFixRowPrefUntChU({orc, rep, config, tailRender, split, contc,unitCel,noNo,tspan=1}: Props
) {
    let inherSpan = 0;     //每一行配置可能继承上面的行配置受到前面span所影响：item宏观检验o 配置模型的
    let oldunit = '';
    let outnode = [];        //根据split[] 拆分多个的。默认一个
    let morenode: JSX.Element[]=[];
    let splitptr=0;
    //let hasPref=config[0]?.[1]?.pr!==undefined;  # 前缀栏目作为必选Cell占位的 【计算】colSpan当中；
    let hasUnit=config[0]?.[1]?.u!==undefined;          //直接依据第一行的配置的单位栏目: 没有Cell占位计算；
    config.forEach(([name,conf,adddesc]: any, i:number) => {
        //遇到了拆分哪一个输赢序号了：
        if(split && i>split[splitptr]){
            outnode.push(morenode);
            morenode=[];
            splitptr++;
        }
        const {t: title, pr: prefix, span, u:unit}=conf;     //【隐含模型定义字段】从模型提取参数
        oldunit=unit===null? null : unit? unit:oldunit;
        if(span)  inherSpan=span;
        else if(inherSpan>0)  inherSpan--;
        morenode.push(<TableRow key={i}>
            {!noNo && <CCell>{i+1}</CCell>}
            {prefix && <CCell split={true} rowSpan={span??1}>{prefix}</CCell>}
            {inherSpan>0?
                <CCell colSpan={tspan}>{adddesc? orc?.[name]?.a??'／' : title}</CCell>
                :
                <CCell colSpan={1+tspan}>{adddesc? orc?.[name]?.a??'／' : title}</CCell>
            }

            { (unitCel && contc)? <>
                    {hasUnit && <>
                        {oldunit ?
                            <CCellUnit unit={oldunit}>{orc?.[name]?.[contc]??'／'}</CCellUnit>
                            :
                            <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
                        }
                    </>
                    }
                </>
                :
                <>
                    { contc &&
                        <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
                    }
                    {hasUnit && <>
                        {oldunit ?
                            <CCell>{oldunit}</CCell>
                            : oldunit===null ?
                                <CCell>{orc?.[name]?.t}</CCell>
                                :
                                <CCell></CCell>
                        }
                    </>
                    }
                </>
            }

            {tailRender(orc, name)}
        </TableRow>);
    });
    outnode.push(morenode);
    return [ outnode ];
}
