/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Cell, TableRow,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {RecordInputConfig, RecordIspArea, RecordSelfSplit,itemResTransform, } from "../../common/config";

//格式化版原始记录（非原生版原始记录）的页面的通用的格式显示。 电梯的；x.y下标 较为统一的检验 对报告项目布局。
/**印象派； 抽象 模型； 提取已经配置的印象法对象， 依据印象设计的规则来生成render元素。每个印象可能抽象后的映射生成元素原则都会不相同的！
 * Crane supervision
 * 【离谱了】就算没有被实际render的，加上本hook:就有可能报错 Each child in a list should have a unique "key" prop. 毛病啊！居然在<Cell key={4}>{et.desc}</Cell>这里出现的报错！
 * @param inspectionContent: 配置项目表；
 * @param itRes 正式报告在最后面的两个列的数据 结果：像是这样的{'1.4':{result:?,'1':?}, ,};
 * 【原始记录打印】的情形下 itRes 实际=orc对象；
 * 正式的报告 按照最左边的顺序序号针对某一列特殊化的配置？放入在一起做配置吗。
 * @param rssCB 可自定义回调函数来做特殊的render；
 * */
export const useLikeElevatorSuperv= ({itRes, ItemArs, model,ver, repNo, rssCB}
         :{itRes:any, ItemArs:RecordIspArea[], model:string,ver:string, repNo:string,rssCB?:({itRes,seq,area,et, n,ox,oy,oz,nowColumns,big,titl} :any)=>React.ReactNode}
) => {
    const renderIspContent =React.useMemo(() => {
        let seq = 0;
        let htmlTxts =[] as React.ReactNode[];
        let ox: number;
        let oy: number;
        let oz: number;
        let iclas: string;
        let big: string;
        let titl: string;
        let sub: string;
        ItemArs?.forEach((area, b) => {
            iclas= area.iclas??iclas;
            //列跨 span X.y的X列这里就不要跨越area范围了；以一个tag对应的area.items最大搜索区域来决定各个列span;当前已经为x,y,z,t分配的具体行数多少。
            //配置已经敲定了有几行， td跨越几行
            area && area.items.forEach((et:RecordInputConfig, n:number) => {
                if(et){
                    seq += 1;
                    let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                    if(et.t) nowColumns=4;
                    else if(et.z) nowColumns=3;
                    else if(et.y) nowColumns=2;
                    else if(et.x) nowColumns=1;
                    else throw new Error(`非法列设置gs`);
                    big=et.big??big;        //像缓存一样 传递下去，按最左边序号顺序上托没改动的就是不变。
                    ox=et.x??ox;
                    oy=et.y??oy;
                    titl=et.titl??titl;
                    oz=(et.z!>0? et.z : oz)??0;
                    sub=et.sub??sub;
                    //监督检验项目: 印象是 前面最多有4列的？
                    //4个项目特殊：若遇见自扩展分拆项形式的项目： 第一个结论 【】数据扩充{结论字段：‘3.9Res’}3.11。3Res’ 3.12.4Res’ 5Res’;也别名字。
                    let itemRowRender=[];
                    //【自拆分项目】最左边序号列与右边5个列都要增加span; 若项目是自拆分情况没必要看et.span依据：前后都单独一个内嵌的独立计算span分区。
                    if(et.rss?.length! >0)        //属于自拆分项目的要特殊处理！【前提条件】注意span配置要特殊照顾span=null独立span分区。
                    {
                        if(rssCB){
                            const nodes=rssCB!({itRes,seq,area,et, n,ox,oy,oz,nowColumns,big,titl});
                            itemRowRender.push(nodes);
                        }
                        else{
                            const extendRs=et.rss?.length! + (et.head? 0: -1) + (et.tail? 1: 0);      //比正常要要多出几行
                            itemRowRender[0] =<React.Fragment key={n}>
                                <TableRow >
                                    <CCell key={12}>{seq}</CCell>
                                    { <CCell key={1} rowSpan={1+extendRs} colSpan={1===nowColumns? 4:1}>
                                        {(et.span?.bH)? <div css={{ "@media print": {
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: et.span.bH,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                } }}>{ox}{big}</div>
                                            :
                                            <>{ox}{big}</>
                                        }
                                      </CCell>
                                    }
                                    {nowColumns>=2 && <CCell key={2} rowSpan={1+extendRs}
                                                             colSpan={2===nowColumns? 1:1}
                                       >{ox}.{oy}{titl}<br/>{et.iclas??area.iclas}</CCell>
                                    }
                                    {nowColumns>=3 && <CCell key={3} rowSpan={1+extendRs}
                                                             colSpan={3===nowColumns? 2:1}
                                        >{area.iclas}{ox}.{oy}.{oz}</CCell>
                                    }
                                    {nowColumns>=4 && <CCell key={11} rowSpan={1+extendRs}
                                       >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                    }
                                    <CCell key={13} rowSpan={1+extendRs}
                                    >{ox}.{oy}</CCell>

                                    { et.head? <Cell key={4} colSpan={2}>{et.head}</Cell>
                                        :
                                        <>
                                            <Cell key={4}>{et.rss?.[0].desc}</Cell>
                                            <CCell key={5}>{itRes?.[et.rss?.[0].name!]}</CCell>
                                        </>
                                    }
                                    <CCell key={6} rowSpan={1+extendRs}>{itemResTransform(itRes,et)}</CCell>
                                    {/*<CCell key={7} rowSpan={1+extendRs}>{itRes?.[et.name+'_Z'] || '/'}</CCell>*/}
                                    {/*<CCell key={8} rowSpan={1+extendRs}>{itRes?.[et.name+'_S'] }</CCell>*/}
                                    {/*<CCell key={9} rowSpan={1+extendRs}>{itRes?.[et.name+'_M'] || '/'}</CCell>*/}
                                    { et.head? <CCell key={10}></CCell>
                                        :
                                        <CCell key={10}>{itRes?.[et.rss?.[0].name!+'_D'] || ''}</CCell>
                                    }
                                    <CCell key={8} rowSpan={1+extendRs}>{itRes?.[et.name+'_S'] || ''}</CCell>
                                </TableRow>
                            </React.Fragment>;
                            et.rss?.forEach((cfx:RecordSelfSplit, fc:number) => {
                                if(et.head || (!et.head && 0!==fc) )
                                    itemRowRender.push(
                                        <React.Fragment key={n+`${fc}`}>
                                            <TableRow >
                                                <CCell key={12}>{seq}</CCell>
                                                <Cell key={4}>{cfx.desc}</Cell>
                                                <CCell key={5}>{itRes?.[cfx.name]}</CCell>
                                                <CCell key={10}>{itRes?.[cfx.name+'_D'] || ''}</CCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                            });
                            if(et.tail)  itemRowRender.push(
                                <React.Fragment key={extendRs+1}>
                                    <TableRow >
                                        <CCell key={12}>{seq}</CCell>
                                        <Cell key={4} colSpan={2}>{et.tail}</Cell>
                                        <CCell key={10}></CCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        }
                    }
                    else{
                        itemRowRender[0] =<React.Fragment key={n}>
                            <TableRow >
                                <CCell key={12}>{seq}</CCell>
                                { et.span.x!>0 && <CCell key={1} rowSpan={et.span.x} colSpan={1===nowColumns? 4:1}>
                                    {(et.span.bH)? <div css={{ "@media print": {
                                            display: '-webkit-box',
                                            WebkitLineClamp: et.span.bH,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        } }}>{ox}{big}</div>
                                        :
                                        <>{ox}{big}</>
                                    }
                                 </CCell>
                                }
                                {nowColumns>=2 && et.span.y!>0 && <CCell key={2} rowSpan={et.span.y}
                                                                         colSpan={2===nowColumns? 1:1}
                                          >{ox}.{oy}{nowColumns>=2 && titl}{et.iclas??area.iclas}</CCell>
                                }
                                {nowColumns>=3 && et.span.z!>0 && <CCell key={3} rowSpan={et.span.z}
                                                                         colSpan={3===nowColumns? 2:1}
                                         >{ox}.{oy}.{oz}{nowColumns>3 && sub}</CCell>
                                }
                                {nowColumns>=4 && <CCell key={11}
                                           >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                { et.span.y!>0 && <CCell key={13} rowSpan={et.span.y}
                                            >{ox}.{oy}</CCell>
                                }
                                <Cell key={4}>{et.desc}</Cell>
                                <CCell key={5}>{itRes?.[et.name]}</CCell>
                                <CCell key={6}>{itemResTransform(itRes,et)}</CCell>
                                {/*<CCell key={7}>{itRes?.[et.name+'_Z'] || '/'}</CCell>*/}
                                {/*<CCell key={8}>{itRes?.[et.name+'_S'] }</CCell>*/}
                                {/*<CCell key={9}>{itRes?.[et.name+'_M'] || '/'}</CCell>*/}
                                <CCell key={10}>{itRes?.[et.name+'_D'] || ''}</CCell>
                                <CCell key={8}>{itRes?.[et.name+'_S'] || ''}</CCell>
                            </TableRow>
                        </React.Fragment>;
                    }
                    const rowsBigArea=<React.Fragment key={seq}>
                        <DirectLink href={`/report/${model}/ver/${ver}/${repNo}/__ItemArs-${area.tag}`}>
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
