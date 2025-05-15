import * as React from "react";
import {CCell,TableRow} from "@/components/flexible-table";
import {DirectLink} from "@/routing/Link";
import {RecordOmniArea, ItemOmniConfig, resTranslOmni, itemResTransformRpo,} from "../common/omni";
import {resTranslCm} from "../common/helper";
import {Column_Setting} from "./useFormatOmni";

interface Props {
    //记录data存储
    orc: any;
    //机电项目列表的配置
    ItemArs: RecordOmniArea[];
    //报告对象
    rep: any;
    // model: string;
    // ver: string;
    // repId: string;
    /**正式报告某些个行对应检验结果栏目替换成 测量数据的 情况
     * 检验结果栏目的替代：可支持替换成任意的Node类型，不仅仅<Cell>{string | node}<Cell/>。
     * */
    itResCB?: (orc:{ [x: string]: any; }) => { [x: string]: any; };
    //后面可变动字段的安排设置 ： 其中两个特别字段：{n:'',x:'检验结果',},{n:null,x:'结论'}
    config: Column_Setting[];
    bOmt?: string;     //新常态：配置bOmt='0'表示舍弃大标题对应栏目，所以orcIspConfig配置最少要求2栏目。
    secN?: boolean;     //新常态：配置secN=true表示第二标题对应栏目自拆分的采用nos生成的，而不用rpo.seco配置。
}
/**【新常态】x.y.z.t项目标题区栏目只剩下一个：通常用seco来显示，例外的用拼凑mergNos来构造。自拆分项目的也不显示各小项目行了。
 【特殊】 新的列：recap标题内容,导致原本应当出现的third反而无需要配置！！  项目代码区和检验内容列之间插入了’项目名称‘{recap对应的正式报告的标题}；
 * 项目编号栏目统一预备虚拟的四个列colSpan。 外部Table必须预留4列给项目栏目的。
 * @param itRes: 相比orc参数，差别是前者可能被测量数据替换掉部分检验结果栏目的显示数据。
 * 【特殊点】大标题列不显示了。  自拆分可能遇到合并的或嵌套模式的，也需特殊处理的：。
 * 支持特别定义的类别列 {n:'ic',x:'类别',m:true},；
 * */
export const useOfficialOmni= ({orc, ItemArs, itResCB, rep,config,bOmt,secN} : Props
) => {
    const renderIspContent =React.useMemo(() => {
        const itRes=itResCB? itResCB(orc) : orc;
        let seq = 0;      //按照每个结论单独一块的依据对应唯一个序号。
        let htmlTxts =[] as React.ReactNode[];
        ItemArs?.forEach((area, b) => {
            let seqNotChange=false;
            //自拆分项区域必须在同一个编辑区内部：第一个行，可能是纯文字而没有输入需求的行。
            let splitHeadEt : ItemOmniConfig|undefined;       //组合自拆分项目的一整块的第一个行对象:含纯粹文字的空行。
            let splitNewBlock=false;            //进入自拆分多行区域的，还没有render开始那一行的。
            let tagSetted=false;         //每一个区tag#id分配给一个可显示行。
            area && area.items.forEach((et:ItemOmniConfig, n:number) => {
                if(et){
                    if(!seqNotChange)   seq += 1;     //归并区域的，唯一一个结论对应同一个seq序号。
                    if(et.nconcl){
                        seqNotChange=true;
                    }
                    else{
                        seqNotChange=false;      //自采分若子小小项目也单独多行的显示的：序号不变的。
                    }
                    if(et.oRSpan>=1 && et.nconcl && et.fRSpan>1) {
                        splitHeadEt = et;           //拆分块的第一行 必然oRSpan>=1 其他行oRSpan为空的。 普通的项目也是oRSpan=1;
                        splitNewBlock=true;        //进入特殊多行关联操作的区块！！
                    }
                    if(et.name && (et.oRSpan>0 || splitHeadEt?.display) )        //归并自拆分头尾可能是纯文本的行，et.name=空的就跳过去。
                    {
                        let nosCc;      //可变的项目栏 栏目有几列， {big, bspan, seco, span, third, tspan, four, fspan};
                        if(et.rpo.fspan) nosCc=4;
                        else if(et.rpo.tspan) nosCc=3;
                        else if(et.rpo.span) nosCc=2;
                        else nosCc=1;
                        let itemRowRender=[];
                        let caption;        //报告每一行的主题
                        let mergLastEt=et;    //归并区的最后一行：主力配置点，除了span项目栏目文本参数之外的都比拆分块的第一行配置优先。
                        if(et.offset){
                            mergLastEt= area.items[n + et.offset];
                            if(et.display)
                                caption= et.recap??et.tips??et.mergLabel;
                            else
                                caption= mergLastEt.recap??mergLastEt.mergLabel??mergLastEt.tips;
                        }
                        else
                            caption= et.recap??et.tips??et.mergLabel;
                        const icname= mergLastEt.mergName??mergLastEt.name;
                        if(!mergLastEt)  throw new Error(`或没最后一行配置`);
                        if(!et.nconcl && !icname)  throw new Error(`或没最后一行配置名`);

                        const conseq=itemResTransformRpo(orc, area, n);                //汇总的结论栏目的
                        //检验结果栏目的  :display=false没展开的后面一种,就只能出现一行result！
                        //检验结果栏目的特例：测量数据直接替换掉这个cell显示情况：1：拆分只有一小项的或者普通项的：看name； 2拆分且是仅仅显示一个合并汇总结果而不显示每一个小项多行的情况：看mergName。
                        const result=mergLastEt.mergName? (mergLastEt.display? resTranslCm(itRes?.[et.name!]) : resTranslOmni(et, orc, itRes, conseq))
                                        : mergLastEt===et? resTranslCm(itRes?.[et.name!]) : `@模板配置有错！`;
                        // console.log("结果栏SEQ=",seq, result,'mergLastEt=',mergLastEt,"#et=",et,itRes,conseq);
                        //跨行的破碎？
                        let captionOcp=1;            //主标题的 扩大空间，不一定colSpan=1;
                        let bigColOcp=1===nosCc? 4: 1;
                        if(et.rpo.bspan===0){
                            bigColOcp=0;
                            captionOcp=5;
                   //【特别注意】底下((et.rpo.bspan!)>0) &&若改为{ (et.rpo.bspan) && <CCell rowSpan={0} colSpan={0}</CCell> } 若rpo.bspan===0将会导致异常，逻辑毛病输出<tr><td/>0<tr/>被当作0数字而非boolean?
                        }
                        if(et.rpo.span===0){        //【特殊规则】情况， 同一个配置span底下的项目栏目占用的列数竟然不相等了： 标题栏目向左边的项目编号栏目融合TD而扩展空间;
                            bigColOcp=1;            //腾挪 td 给 标题用。
                            captionOcp=4;
                        }
                        let secoColOcp=2===nosCc? 3: 1;       //第三个级别项目编码栏目 腾挪 td 给 标题用。
                        if(et.rpo.tspan===0){
                            secoColOcp=1;
                            captionOcp=3;
                        }
                        let thirdColOcp=3===nosCc? 2: 1;       //最多的 支持的第四个级别项目编码栏目 腾挪 td 给 标题用。
                        if(et.rpo.fspan===0){
                            thirdColOcp=1;
                            captionOcp=2;
                        }
                        //极特例情况 再度 做修正。: :项目区中间的第二栏吃掉第三栏目的空间。
                        if((et.rpo.span!)>0 && (et.rpo.tspan!)<0){       //【极度罕见的】允许中间的第二栏吃掉第三栏目的空间。
                            secoColOcp=2;
                        }
                        //【极罕见的】支持, 项目区的第一栏列吞并第二栏列的情形。
                        if((et.rpo.bspan!)>0 && (et.rpo.span!)<0){
                            bigColOcp=2;
                        }

                        //为了避免：自拆分的小项{nos}生成默认的项目最后一级别的标题机制导致,从而影响到其第一行正式报告显示。只好如下修订：
                        const big_Spl=splitNewBlock? splitHeadEt!.rpo.big : et.rpo.big;
                        const seco_Spl=splitNewBlock? splitHeadEt!.rpo.seco : et.rpo.seco;
                        const seco_Spl2=secN? (splitHeadEt? `${mergLastEt?.pre??''}${mergLastEt?.iclas}${mergLastEt?.mergNos}` : seco_Spl) : seco_Spl;
                        const third_Spl=splitNewBlock? splitHeadEt!.rpo.third : et.rpo.third;
                        const four_Spl=splitNewBlock? splitHeadEt!.rpo.four : et.rpo.four;
                        // console.log("行碎例",b,"n=",n,area.tag,"nosCc=",nosCc,"ET=",et,'caption:',caption,'mergLastEt',mergLastEt,"倒退n-1行",area.items[n-1],splitHeadEt);
                        //【特殊】正式报告的大标题这列不做显示了！ 结果栏目也不现实，改名内容等于是结论对应栏目的。
                        itemRowRender[0] =<TableRow id={!tagSetted ? area.tag:undefined} key={n}>
                            <CCell key={1} className="text-xs">{seq}</CCell>
                            {bOmt!=='0' && ((et.rpo.bspan!)>0) && <CCell key={2} split={true} rowSpan={et.rpo.bspan} colSpan={bigColOcp}
                                 >{big_Spl}</CCell>
                            }
                            {nosCc>=2 && (et.rpo.span!)>0 && <CCell split={true} key={3} rowSpan={et.rpo.span} colSpan={secoColOcp}
                                >{seco_Spl2}</CCell>
                            }
                            {nosCc>=3 && (et.rpo.tspan!)>0 && <CCell split={true} key={4} rowSpan={et.rpo.tspan} colSpan={thirdColOcp}
                                >{third_Spl}</CCell>
                            }
                            {nosCc>=4 && (et.rpo.fspan!)>0 && <CCell split={true} key={5} rowSpan={et.rpo.fspan}
                                >{four_Spl}</CCell>
                            }

                            <CCell split={false} key={6} colSpan={captionOcp}>{caption}</CCell>

                            {/*其他可变的列 */}
                            {
                                config.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
                                    if(n==='') return  <CCell key={7}>{result ?? '／'}</CCell>;
                                    else if(n===null){
                                        return et.oRSpan>0 && <CCell key={8} split={true} rowSpan={et.oRSpan??1}
                                                                className={et.oRSpan>5? 'important-cell':''} data-interval-height="197"
                                        >{'／'===conseq? '无此项' : conseq}</CCell>;
                                    }
                                    //以上2个特殊，剩下是常规字段
                                    if(!m){
                                        return <CCell key={10}>{itRes?.[et.name+'_'+n] ?? '／'}</CCell>;
                                    }else{
                                        if(et.oRSpan>0){
                                            if(n==='ic') return <CCell key={13+'_'+i} split={true} rowSpan={et.oRSpan??1}>{mergLastEt?.iclas}</CCell>;
                                            else return  <CCell key={13+'_'+i} split={true} rowSpan={et.oRSpan??1}>{itRes?.[icname+'_'+n] ?? '／'}</CCell>;
                                        }
                                        else return null;
                                    }
                                })
                            }
                        </TableRow>;
                        if(!tagSetted)   tagSetted=true;
                        //【注意】 et.sub?? 假如 sub='' 逻辑成立，需改undefined; React.Fragment key={seq+'-'+n}
                        const rowsBigArea=
                            <DirectLink key={seq+'-'+n} href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${area.tag}#${area.tag}`}>
                                {itemRowRender}
                            </DirectLink>;

                        htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的

                        splitNewBlock=false;          //自拆分区块的第一行render结束了。
                    }
                    if(!et.nconcl)
                        splitHeadEt=undefined;        //最后才做的复位
                }
            });
        });

        return  htmlTxts;
    }, [orc,rep,ItemArs,config,bOmt,itResCB,secN]);
    return { renderIspContent };
};

/**检测报告:电梯自行检测（常规）, 项目列表也要打印2排的。 useOfficialOmni特殊版本的。
*就不要加一层 <TableRow id={!tagSetted ? area.tag:undefined} key={n}>  </TableRow>;
* 也挪动id={!tagSetted ? area.tag 标记的位置。
*/
// export const useOfficialOmni2H= ({orc, ItemArs, itResCB, rep,config,bOmt,secN} : Props
// ) => {
//     // const theme = useTheme();
//     const atPrint = useMedia('print');
//     const renderIspContent =React.useMemo(() => {
//         const itRes=itResCB? itResCB(orc) : orc;
//         let seq = 0;      //按照每个结论单独一块的依据对应唯一个序号。
//         let htmlTxts =[] as React.ReactNode[];
//         ItemArs?.forEach((area, b) => {
//             let seqNotChange=false;
//             //自拆分项区域必须在同一个编辑区内部：第一个行，可能是纯文字而没有输入需求的行。
//             let splitHeadEt : ItemOmniConfig|undefined;       //组合自拆分项目的一整块的第一个行对象:含纯粹文字的空行。
//             let splitNewBlock=false;            //进入自拆分多行区域的，还没有render开始那一行的。
//             let tagSetted=false;         //每一个区tag#id分配给一个可显示行。
//             area && area.items.forEach((et:ItemOmniConfig, n:number) => {
//                 if(et){
//                     if(!seqNotChange)   seq += 1;     //归并区域的，唯一一个结论对应同一个seq序号。
//                     if(et.nconcl){
//                         seqNotChange=true;
//                     }
//                     else{
//                         seqNotChange=false;      //自采分若子小小项目也单独多行的显示的：序号不变的。
//                     }
//                     if(et.oRSpan>=1 && et.nconcl && et.fRSpan>1) {
//                         splitHeadEt = et;           //拆分块的第一行 必然oRSpan>=1 其他行oRSpan为空的。 普通的项目也是oRSpan=1;
//                         splitNewBlock=true;        //进入特殊多行关联操作的区块！！
//                     }
//                     if(et.name && (et.oRSpan>0 || splitHeadEt?.display) )        //归并自拆分头尾可能是纯文本的行，et.name=空的就跳过去。
//                     {
//                         let nosCc;      //可变的项目栏 栏目有几列， {big, bspan, seco, span, third, tspan, four, fspan};
//                         if(et.rpo.fspan) nosCc=4;
//                         else if(et.rpo.tspan) nosCc=3;
//                         else if(et.rpo.span) nosCc=2;
//                         else nosCc=1;
//                         let itemRowRender=[];
//                         let caption;        //报告每一行的主题
//                         let mergLastEt=et;    //归并区的最后一行：主力配置点，除了span项目栏目文本参数之外的都比拆分块的第一行配置优先。
//                         if(et.offset){
//                             mergLastEt= area.items[n + et.offset];
//                             if(et.display)
//                                 caption= et.recap??et.tips??et.mergLabel;
//                             else
//                                 caption= mergLastEt.recap??mergLastEt.mergLabel??mergLastEt.tips;
//                         }
//                         else
//                             caption= et.recap??et.tips??et.mergLabel;
//                         const icname= mergLastEt.mergName??mergLastEt.name;
//                         if(!mergLastEt)  throw new Error(`或没最后一行配置`);
//                         if(!et.nconcl && !icname)  throw new Error(`或没最后一行配置名`);
//
//                         const conseq=itemResTransformRpo(orc, area, n);                //汇总的结论栏目的
//                         //检验结果栏目的  :display=false没展开的后面一种,就只能出现一行result！
//                         //检验结果栏目的特例：测量数据直接替换掉这个cell显示情况：1：拆分只有一小项的或者普通项的：看name； 2拆分且是仅仅显示一个合并汇总结果而不显示每一个小项多行的情况：看mergName。
//                         const result=mergLastEt.mergName? (mergLastEt.display? resTranslCm(itRes?.[et.name!]) : resTranslOmni(et, orc, itRes, conseq))
//                             : mergLastEt===et? resTranslCm(itRes?.[et.name!]) : `@报告模板配置有错误！`;
//                         // console.log("结果栏SEQ=",seq, result,'mergLastEt=',mergLastEt,"#et=",et,itRes,conseq);
//                         //跨行的破碎？
//                         let captionOcp=1;            //主标题的 扩大空间，不一定colSpan=1;
//                         let bigColOcp=1===nosCc? 4: 1;
//                         if(et.rpo.bspan===0){
//                             bigColOcp=0;
//                             captionOcp=5;
//                             //【特别注意】底下((et.rpo.bspan!)>0) &&若改为{ (et.rpo.bspan) && <CCell rowSpan={0} colSpan={0}</CCell> } 若rpo.bspan===0将会导致异常，逻辑毛病输出<tr><td/>0<tr/>被当作0数字而非boolean?
//                         }
//                         if(et.rpo.span===0){        //【特殊规则】情况， 同一个配置span底下的项目栏目占用的列数竟然不相等了： 标题栏目向左边的项目编号栏目融合TD而扩展空间;
//                             bigColOcp=1;            //腾挪 td 给 标题用。
//                             captionOcp=4;
//                         }
//                         let secoColOcp=2===nosCc? 3: 1;       //第三个级别项目编码栏目 腾挪 td 给 标题用。
//                         if(et.rpo.tspan===0){
//                             secoColOcp=1;
//                             captionOcp=3;
//                         }
//                         let thirdColOcp=3===nosCc? 2: 1;       //最多的 支持的第四个级别项目编码栏目 腾挪 td 给 标题用。
//                         if(et.rpo.fspan===0){
//                             thirdColOcp=1;
//                             captionOcp=2;
//                         }
//                         //极特例情况 再度 做修正。: :项目区中间的第二栏吃掉第三栏目的空间。
//                         if((et.rpo.span!)>0 && (et.rpo.tspan!)<0){       //【极度罕见的】允许中间的第二栏吃掉第三栏目的空间。
//                             secoColOcp=2;
//                         }
//                         //【极罕见的】支持, 项目区的第一栏列吞并第二栏列的情形。
//                         if((et.rpo.bspan!)>0 && (et.rpo.span!)<0){
//                             bigColOcp=2;
//                         }
//
//                         //为了避免：自拆分的小项{nos}生成默认的项目最后一级别的标题机制导致,从而影响到其第一行正式报告显示。只好如下修订：
//                         const big_Spl=splitNewBlock? splitHeadEt!.rpo.big : et.rpo.big;
//                         const seco_Spl=splitNewBlock? splitHeadEt!.rpo.seco : et.rpo.seco;
//                         const seco_Spl2=secN? (splitHeadEt? `${mergLastEt?.pre??''}${mergLastEt?.iclas}${mergLastEt?.mergNos}` : seco_Spl) : seco_Spl;
//                         const third_Spl=splitNewBlock? splitHeadEt!.rpo.third : et.rpo.third;
//                         const four_Spl=splitNewBlock? splitHeadEt!.rpo.four : et.rpo.four;
//                         // console.log("行碎例",b,"n=",n,area.tag,"nosCc=",nosCc,"ET=",et,'caption:',caption,'mergLastEt',mergLastEt,"倒退n-1行",area.items[n-1],splitHeadEt);
//                         //【特殊】正式报告的大标题这列不做显示了！ 结果栏目也不现实，改名内容等于是结论对应栏目的。
//
//                         itemRowRender[0] =<React.Fragment  key={seq+'-'+n}>
//                             <CCell key={1} id={!tagSetted ? area.tag:undefined}>{seq}</CCell>
//                             {bOmt!=='0' && ((et.rpo.bspan!)>0) && <CCell key={2} split={true} rowSpan={et.rpo.bspan} colSpan={bigColOcp}
//                             >{big_Spl}</CCell>
//                             }
//                             {nosCc>=2 && (et.rpo.span!)>0 && <CCell split={true} key={3} rowSpan={et.rpo.span} colSpan={secoColOcp}
//                             >{seco_Spl2}</CCell>
//                             }
//                             {nosCc>=3 && (et.rpo.tspan!)>0 && <CCell split={true} key={4} rowSpan={et.rpo.tspan} colSpan={thirdColOcp}
//                             >{third_Spl}</CCell>
//                             }
//                             {nosCc>=4 && (et.rpo.fspan!)>0 && <CCell split={true} key={5} rowSpan={et.rpo.fspan}
//                             >{four_Spl}</CCell>
//                             }
//
//                             <CCell key={6} colSpan={captionOcp}>{caption}</CCell>
//                             {/*其他可变的列 */}
//                             {
//                                 config.map(({n, x, m, t, l, z}: Column_Setting, i: number) => {
//                                     if(n==='') return  <CCell className={"text-sm"} key={7}>{result ?? '／'}</CCell>;
//                                     else if(n===null){
//                                         return et.oRSpan>0 && <CCell className={"text-sm"} key={8} split={true} rowSpan={et.oRSpan??1}>{'／'===conseq? '无此项' : conseq}</CCell>;
//                                     }
//                                     //以上2个特殊，剩下是常规字段
//                                     if(!m){
//                                         return <CCell className={"text-sm"} key={10}>{itRes?.[et.name+'_'+n] ?? '／'}</CCell>;
//                                     }else{
//                                         return et.oRSpan>0 && <CCell className={"text-sm"} key={13} split={true} rowSpan={et.oRSpan??1}>{itRes?.[icname+'_'+n] ?? '／'}</CCell>;
//                                     }
//                                 })
//                             }
//                         </React.Fragment>;
//
//                         if(!tagSetted)   tagSetted=true;
//                         //【注意】 et.sub?? 假如 sub='' 逻辑成立，需改undefined;
//                         const rowsBigArea=<React.Fragment key={seq+'-'+n}>
//                             <DirectLink href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/${area.tag}#${area.tag}`}>
//                                 {itemRowRender}
//                             </DirectLink>
//                         </React.Fragment>;
//
//                         htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的
//
//                         splitNewBlock=false;          //自拆分区块的第一行render结束了。
//                     }
//                     if(!et.nconcl)
//                         splitHeadEt=undefined;        //最后才做的复位
//                 }
//             });
//         });
//
//         return  htmlTxts;
//     }, [orc,rep,ItemArs,atPrint,config,bOmt,itResCB,secN]);
//     return { renderIspContent };
// };
