/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Cell, TableRow,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {ItemOmniConfig, itemResTransformRec, RecordOmniArea} from "../../common/omni";
import {resTranslCm} from "../../common/helper";

/**类似的 格式化原始记录： 会多了两个列”工作见证，确认方式“，排序变了:
 * 要依赖 配置数据的目的来决定 各列的可能输出修正； 【特殊适用性】 nos要独立显示在第四列的。2列3列才是通常的用途列；
 * 都是规整的 x.y 项目编码的；
 * @var sdsCB : 处理特别拆分的确认日期栏目情况;    [特殊化]
 * */
export const useFormatOmniLikeElevatorJj= ({itRes, ItemArs, model,ver, repNo, sdsCB }
         :{itRes:any, ItemArs:RecordOmniArea[], model:string,ver:string, repNo:string,sdsCB?:({itRes,area,et,icname} :any)=>React.ReactNode}
) => {
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
                    nosCc=2;
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
                        {et.rec?.bspan && <CCell key={2} split={true} rowSpan={et.rec?.bspan} colSpan={1===nosCc? 1: 1}
                            >{et.rec?.big}</CCell>
                        }
                        {nosCc>=2 && (et.rec?.span!)>0 && <CCell split={true} key={3} rowSpan={et.rec?.span} colSpan={2===nosCc? 1: 1}
                            >{mergLastEt.mergNos??mergLastEt.nos}{et.rec?.seco}</CCell>
                        }
                        { (et.rec?.span!)>0 && <CCell split={true} key={14} rowSpan={et.rec?.span}
                          >{mergLastEt.pre}{mergLastEt.mergNos??mergLastEt.nos}{mergLastEt.iclas}</CCell>
                        }
                        {nosCc>=3 && (et.rec?.tspan!)>0 && <CCell split={true} key={4} rowSpan={et.rec?.tspan} colSpan={3===nosCc? 2: 1}
                            >{et.rec?.third}</CCell>
                        }
                        {nosCc>=4 && (et.rec?.fspan!)>0 && <CCell split={true} key={5} rowSpan={et.rec?.fspan}
                            >{et.rec?.four}</CCell>
                        }
                        { et.name? <>
                                <Cell key={6}>{et.desc}</Cell>
                                <CCell key={7}>{result || '/'}</CCell>
                            </>
                            :
                            <Cell key={6} colSpan={2}>{et.desc}</Cell>
                        }
                        {et.fRSpan &&
                            <CCell key={8} split={true} rowSpan={et.fRSpan??1}>{conseq || '/'}</CCell>
                        }
                        { et.name? <>
                                <CCell key={10}>{itRes?.[et.name+'_D'] || ''}</CCell>
                            </>
                            :
                            <Cell key={10}></Cell>
                        }
                        { sdsCB? sdsCB({itRes,area,et,icname})
                            :
                            et.fRSpan && <CCell key={12} split={true} rowSpan={et.fRSpan??1}>{itRes?.[icname+'_S']}</CCell>
                        }
                    </TableRow>;
                    const rowsBigArea=<React.Fragment key={seq+'_'+n}>
                        <DirectLink href={`/report/${model}/ver/${ver}/${repNo}/${area.tag}`}>
                            {itemRowRender}
                        </DirectLink>
                    </React.Fragment>;
                    htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的
                }
            });
        });

        return  htmlTxts;
    }, [itRes,repNo,model,ver,ItemArs]);
    return { renderIspContent };
};

