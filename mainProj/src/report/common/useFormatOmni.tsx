import * as React from "react";
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow,TableCell} from "@/components/flexible-table";
import {DirectLink} from "../../routing/Link";
import {ItemOmniConfig, itemResTransformRec, RecordOmniArea} from "./omni";
import {resTranslCm} from "./helper";
import {cn} from "@/lib/utils";

//后面可变动字段的安排设置 ： 其中两个特别字段：{n:'',x:'检验结果',},{n:null,x:'结论'}
export type Column_Setting ={
    n:string|null,     //存储后缀n==null是唯一一个结论列，不用输入的的。 而n=''代表检验结果字段；
    x:string,       //标题
    m?:boolean,     //自拆分的，全部小项目归一的输入=true； 结论字段n=null例外；
    t?:string,      //输入类别 t类型： undefined, B,l,  d,C,S;
    l?:string[],    //列表的 : 支持是可变的情况
    z?:number       //输入框大小参数
};
/**格式化打印的原始记录；尽量统一和规范模式的归一版本：实在无法统一的？ 加回调？，增加参数？？ 单独做新版的。
 * 【新常态】一个拆分区块的 下面有三个嵌套的分区： 利用 mergLabel seco span 来辨识特殊点。
 * 【特殊】 新的列：recap标题内容,导致原本应当出现的third反而无需要配置！！  项目代码区和检验内容列之间插入了’项目名称‘{recap对应的正式报告的标题}；
 * 对于自拆分项目还能允许几个合并（嵌套）的情况： 项目名称一列<CCell key={8} 就会出现几个的拆分。这里只针对seco列有做了配置的特例。并且项目列的变更描述配置在对应行的mergLabel；
 * 但是，常规的自拆分项目（非嵌套组合地）就不能设置mergLabel；  另外thitrd，tspan地配置也不再这里考虑中。
 * @property rcc 新常态设置true：把正式报告标题当作独立一列放在desc内容前面一列
 * @property config: 配置原始录入的字段和顺序等。
 * 若想orc?._Oitems用户输入的文本有格式化换行效果等，只能在记录编辑的2个解析器这里特殊对待来做。？特殊标记，特定标签的tag '_其它'+i。
 * */
export const useFormatOmni = ({
                                  itRes,
                                  ItemArs,
                                  rep,
                                  config,
                                  rcc,
                                  descClasses,
                                  longClasses="text-xs",
                                  qtClasses,
                                  noClasses
                              }: {
    itRes: any;
    ItemArs: RecordOmniArea[];
    rep: any;
    config: Column_Setting[];
    rcc?: boolean;
    noClasses?: string;     //序数号的样式；
    descClasses?: string;   //步骤要求正文：
    longClasses?: string;   //不合格描述，备注区域的：
    qtClasses?: string;     //其它列的， 项目编号 结果列的：
}) => {
    const renderIspContent =React.useMemo(() => {
        let seq = 0;
        let htmlTxts =[] as React.ReactNode[];
        ItemArs?.forEach((area, b) => {
            //列跨 span X.y的X列这里就不要跨越area范围了；以一个tag对应的area.items最大搜索区域来决定各个列span;当前已经为x,y,z,t分配的具体行数多少。
            //配置已经敲定了有几行， td跨越几行
            let seqNotChange=false;
            let rtspanLeft=0;
            let rtspanArea=false;       //标题栏目的多行融合区域？
            area && area.items.forEach((et:ItemOmniConfig, n:number) => {
                if(et){
                    if(et.rtspan!>1){
                        rtspanArea=true;
                        rtspanLeft=et.rtspan!;
                    }
                    if(!seqNotChange)   seq += 1;     //归并区域的，唯一一个结论对应同一个seq序号。
                    if(et.nconcl)   seqNotChange=true;
                    else    seqNotChange=false;
                    let nosCc;      //可变的项目栏 栏目有几列， {big, bspan, seco, span, third, tspan, four, fspan};
                    if(et.rec?.fspan) nosCc=4;
                    else if(et.rec?.tspan) nosCc=3;
                    else if(et.rec?.span) nosCc=2;
                    else nosCc=1;
                    let itemRowRender=[];
                    // const {chendu, pinglv, fxclass}=itemFenXianClassTransform(itRes,et.name);

                    let mergLastEt=et;    //归并区的最后一行
                    if(et.offset){
                        mergLastEt= area.items[n + et.offset];
                    }
                    if(!mergLastEt)  throw new Error(`或没最后一行配置`);
                    const icname= mergLastEt.mergName??mergLastEt.name;      //拆分归并栏目的存储名
                    if(!et.nconcl && !icname)  throw new Error(`或没最后一行配置名`);

                    const result=resTranslCm(itRes?.[et.name!]);         //检验结果栏目的
                    const conseq=itemResTransformRec(itRes, area, n);       //汇总的结论栏目的
                    // console.log("检验设TableRowicnameS=",seq, icname,'et',et,mergLastEt);

                    itemRowRender[0] =<TableRow id={n===0 ? area.tag:undefined} key={n}>
                        <CCell key={1}  className={cn("text-[0.75rem]",noClasses)}>{seq}</CCell>
                        {et.rec?.bspan && <CCell key={2} split={true} rowSpan={et.rec?.bspan} colSpan={1===nosCc? 4: 1}
                                                 className={cn("text-sm",qtClasses)}>{et.rec?.big}</CCell>
                        }
                        {nosCc>=2 && (et.rec?.span!)>0 && <CCell split={true} key={3} rowSpan={et.rec?.span} colSpan={2===nosCc? 3: 1}
                                                                 className={cn("text-sm",qtClasses)}>{et.rec?.seco}</CCell>
                        }
                        {nosCc>=3 && (et.rec?.tspan!)>0 && <CCell split={true} key={4} rowSpan={et.rec?.tspan} colSpan={3===nosCc? 2: 1}
                                                                  className={cn("text-sm",qtClasses)}>{et.rec?.third}</CCell>
                        }
                        {nosCc>=4 && (et.rec?.fspan!)>0 && <CCell split={true} key={5} rowSpan={et.rec?.fspan}
                                                                  className={cn("text-sm",qtClasses)}>{et.rec?.four}</CCell>
                        }
                        {/*新常态：单独把报告标题归为独立栏目的；一个拆分区块的 下面有三个嵌套的分区： 利用 mergLabel seco span 来辨识特殊点*/}
                        {rcc && <>
                            { (et.nconcl && et.rec?.span) ? <>
                                    <CCell key={8} split={true} rowSpan={et.rec?.span??1}
                                           className={cn("text-xs", descClasses)}>{et.mergLabel ??mergLastEt.recap }</CCell>
                                </>
                                :
                                <>
                                    {et.fRSpan? <>
                                            {rtspanArea? ( et.rtspan!>1 ?
                                                        <CCell key={8} split={true} rowSpan={et.rtspan}
                                                               className={cn("text-xs", descClasses)}>{et.tips?? (et.mergLabel?? et.recap)?? mergLastEt.recap }</CCell>
                                                        :
                                                        null
                                                )
                                                :
                                                <CCell key={8} split={true} rowSpan={et.fRSpan??1}
                                                       className={cn("text-xs", descClasses)}>{et.tips?? (et.mergLabel?? et.recap)?? mergLastEt.recap }</CCell>
                                            }</>
                                        :
                                        null
                                    }
                                </>
                            }
                            { (!et.nconcl && et.rec?.span===1 && mergLastEt===et && et.mergLabel) &&
                                <CCell key={8} className={cn("text-xs", descClasses)}>{et.mergLabel}</CCell>
                            }
                        </>
                        }

                        { et.name? <TableCell key={6} className={cn("text-xs", descClasses)}>{et.desc}</TableCell>
                            :
                            <TableCell key={6} colSpan={2} className={cn("text-xs", descClasses)}>{et.desc}</TableCell>
                        }
                        {       //布局在记录正文栏目后面的：结果结论 等其它的栏目 'S''Z''ic' 'M','D'
                            config.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n==='') return  et.name && <CCell key={7} className={cn("text-sm",qtClasses)}>{result || '/'}</CCell>;
                                else if(n===null)
                                    return et.fRSpan && <CCell key={8} split={true} rowSpan={et.fRSpan??1} className={cn("text-sm",qtClasses)}>{conseq || '/'}</CCell>;
                                const islt=(n==='M' || n==='D');            //配置【耦合的】，预定义规定的标签。
                                //以上2个特殊，剩下是常规字段,   key==#
                                if(!m){
                                    if(et.name) return <CCell key={10} className={cn("text-sm",islt? longClasses:qtClasses)}>{itRes?.[et.name+'_'+n] ?? ''}</CCell>;
                                    else return <TableCell key={10}></TableCell>;
                                }else{
                                    //自拆分的
                                    if(et.fRSpan) return <CCell key={13+'_'+i} split={true} rowSpan={et.fRSpan??1}
                                                                className={cn("text-sm",islt? longClasses:qtClasses)}>{itRes?.[icname+'_'+n]}</CCell>;
                                }
                                return null;
                            })
                        }
                    </TableRow>;
                    //报错Invalid prop `columnWidths` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.
                    const rowsBigArea= <DirectLink key={seq+'_'+n} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${area.tag}?original=1#${area.tag}`}>
                            {itemRowRender}
                        </DirectLink>;
                    htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的
                    if(rtspanArea){
                        rtspanLeft--;
                        if(rtspanLeft<1)  rtspanArea=false;
                    }
                }
            });
        });

        return  htmlTxts;
    }, [itRes,rep,ItemArs,config,rcc]);
    return { renderIspContent };
};

/**去掉big栏目的显示; 支持big栏目的colSpan=1情况{后面必须有sceo:?}；
 * 支持类别栏 {n:'ic',x:'类别',m:true},
 */
export const useFormatNoBigCol= ({itRes, ItemArs, rep,config,rcc,dfsz }
                                 :{itRes:any, ItemArs:RecordOmniArea[], rep:any,config: Column_Setting[],rcc?:boolean,dfsz?:string}
) => {
    const theme = useTheme();
    const descStyle = React.useMemo(() => {
        return css({
            "& > span": {fontSize: `${dfsz??'0.85'}rem`},
            "& > div > span": {fontSize: `${dfsz??'0.85'}rem`},
            "& > div > div > table td": {fontSize: `${dfsz??'0.85'}rem`},
            "& > span > div > table td": {fontSize: `${dfsz??'0.85'}rem`},
        });
    }, [dfsz,theme]);
    const renderIspContent =React.useMemo(() => {
        let seq = 0;
        let htmlTxts =[] as React.ReactNode[];
        ItemArs?.forEach((area, b) => {
            //列跨 span X.y的X列这里就不要跨越area范围了；以一个tag对应的area.items最大搜索区域来决定各个列span;当前已经为x,y,z,t分配的具体行数多少。
            //配置已经敲定了有几行， td跨越几行
            let seqNotChange=false;
            area && area.items.forEach((et:ItemOmniConfig, n:number) => {
                if(et){
                    if(!seqNotChange)   seq += 1;     //归并区域的，唯一一个结论对应同一个seq序号。
                    if(et.nconcl)   seqNotChange=true;
                    else    seqNotChange=false;
                    let nosCc;      //可变的项目栏 栏目有几列， {big, bspan, seco, span, third, tspan, four, fspan};
                    if(et.rec?.fspan) nosCc=4;
                    else if(et.rec?.tspan) nosCc=3;
                    else if(et.rec?.span) nosCc=2;
                    else nosCc=1;
                    let itemRowRender=[];
                    // const {chendu, pinglv, fxclass}=itemFenXianClassTransform(itRes,et.name);

                    let mergLastEt=et;    //归并区的最后一行
                    if(et.offset){
                        mergLastEt= area.items[n + et.offset];
                    }
                    if(!mergLastEt)  throw new Error(`或没最后一行配置`);
                    const icname= mergLastEt.mergName??mergLastEt.name;      //拆分归并栏目的存储名
                    if(!et.nconcl && !icname)  throw new Error(`或没最后一行配置名`);

                    const result=resTranslCm(itRes?.[et.name!]);         //检验结果栏目的
                    const conseq=itemResTransformRec(itRes, area, n);       //汇总的结论栏目的
                    // console.log("检验设TableRowicnameS=",seq, icname,'et',et,mergLastEt);

                    itemRowRender[0] =<TableRow id={n===0 ? area.tag:undefined} key={n}>
                        <CCell key={1}>{seq}</CCell>
                        {nosCc>=2 && (et.rec?.span!)>0 && <CCell split={true} key={3} rowSpan={et.rec?.span} colSpan={2===nosCc? 3: 1}
                        >{et.rec?.seco}</CCell>
                        }
                        {nosCc>=3 && (et.rec?.tspan!)>0 && <CCell split={true} key={4} rowSpan={et.rec?.tspan} colSpan={3===nosCc? 2: 1}
                        >{et.rec?.third}</CCell>
                        }
                        {nosCc>=4 && (et.rec?.fspan!)>0 && <CCell split={true} key={5} rowSpan={et.rec?.fspan}
                        >{et.rec?.four}</CCell>
                        }
                        {/*新常态：单独把报告标题归为独立栏目的；一个拆分区块的 下面有三个嵌套的分区： 利用 mergLabel seco span 来辨识特殊点*/}
                        {rcc && <>
                            { (et.nconcl && et.rec?.span) ? <>
                                    <CCell key={8} split={true} rowSpan={et.rec?.span??1}>{et.mergLabel ??mergLastEt.recap }</CCell>
                                </>
                                :
                                <>
                                    {et.fRSpan? <>
                                            <CCell key={8} split={true} rowSpan={et.fRSpan??1}>{et.tips?? et.recap?? mergLastEt.recap }</CCell>
                                        </>
                                        :
                                        null
                                    }
                                </>
                            }
                            { (!et.nconcl && et.rec?.span===1 && mergLastEt===et && et.mergLabel) &&
                                <CCell key={8}>{et.mergLabel}</CCell>
                            }
                        </>
                        }

                        { et.name? <Cell key={6} css={descStyle}>{et.desc}</Cell>
                            :
                            <Cell key={6} colSpan={2} css={descStyle}>{et.desc}</Cell>
                        }
                        {       //结果等其它的栏目
                            config.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                if(n==='') return  et.name && <CCell key={7}>{result || '/'}</CCell>;
                                else if(n===null) return et.fRSpan && <CCell key={8} split={true} rowSpan={et.fRSpan??1}>{conseq || '/'}</CCell>;
                                //以上2个特殊，剩下是常规字段 {n:'iclas',x:'类别',m:true}
                                if(!m){
                                    if(et.name) return <CCell key={10}>{itRes?.[et.name+'_'+n] ?? ''}</CCell>;
                                    else return <Cell key={10}></Cell>;
                                }else{
                                    if(et.fRSpan){
                                        if(n==='ic') return <CCell key={13+'_'+i} split={true} rowSpan={et.fRSpan??1}>{mergLastEt?.iclas}</CCell>;
                                        else return <CCell key={13+'_'+i} split={true} rowSpan={et.fRSpan??1}>{itRes?.[icname+'_'+n]}</CCell>;
                                    }
                                }
                                return null;
                            })
                        }
                    </TableRow>;
                    const rowsBigArea=<React.Fragment key={seq+'_'+n}>
                        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${area.tag}?original=1#${area.tag}`}>
                            {itemRowRender}
                        </DirectLink>
                    </React.Fragment>;
                    htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的
                }
            });
        });

        return  htmlTxts;
    }, [itRes,rep,ItemArs,config,rcc,descStyle]);
    return { renderIspContent };
};
