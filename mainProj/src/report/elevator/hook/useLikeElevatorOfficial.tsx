/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Cell, TableRow, useTheme,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {RecordInputConfig, RecordIspArea, RecordSelfSplit,itemResTransform, itemResTransformAL} from "../../common/config";
import {resTranslCm} from "../../common/helper";
import {scopeRowSp} from "../../tools";
import {useMedia} from "use-media";

/**正式报告的显示：
 * @param itRes: 被测量数据影响修正显示的orc；
 * @param orc: 数据库的结合了snapshot后的原始版本orc存储。
 * <DirectLink无法穿透<React.Fragment key> <  key> 没法点击跳转;  而<DirectLink放在Table上那级的不能切换鼠标选中状态的可点跳转。
 * 【浏览器限制】需支持display: '-webkit-box',的才能显示多行情况省略号，目的限制标题打印高度方向太高了-webkit-line-clamp:。
 * 和起重监检的不同点： 最后结论都只会和检验项目栏目x.y一一对应的;  项目栏目最后一个项目.y都要显示出标题名；
 * 约束：正式报告共用一个结论目标项目位置的所有项目必须都配知道同一个编辑区内部。根据x.y .z .t的项目栏目号码如果是相等的就认定为结论项目属于同一个的，还必须连续的触发相同特征的配置顺序上是不能中断的。
 * */
export const useLikeElevatorOfficial= ({itRes:measureRes, ItemArs, model,ver, repId, orc}
                                           :{itRes?:any, ItemArs:RecordIspArea[], model:string,ver:string, repId:string, orc:any}
) => {
    const itRes= measureRes??orc;       //允许itRes===orc，正式报告没有特别显示出测量结果
    const theme = useTheme();
    const atPrint = useMedia('print');
    const renderIspContent =React.useMemo(() => {
        let seq = 0;
        let htmlTxts =[] as React.ReactNode[];
        let ox: number;       //目前这行的项目编码分解第一级别 .x==是多少的
        let oy: number;
        let oz: number;
        let iclas: string;
        let big: string;         //目前这行的项目编码分解第一级别 的文字标题是=..
        let titl: string;
        let sub: string;
        //类似于Context作用的：看能否压缩显示，避免页面太罗嗦显示重复内容。计数器：规则 大标题1省7，标题1省5，小标题1省3个。
        let ctx: number=0;
        let cty: number=0;       //目前这行的项目编码分解第二级别 .y 的完全相同的累计计数器=；
        let ctz: number=0;
        ItemArs?.forEach((area, b) => {
            iclas= area.iclas??iclas;
            let inAlikeCount=0;         //项目栏目编码串判定一摸一样横跨剩下几个行的；
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
                    else throw new Error(`非法列设置r`+et.sub+"#y:"+et.y);
                    let alike=false;         //普通的各个项目栏目自己能区分的的 或者 是处在上一个相等目标结论位置范围启动第一个项目的。【正常】不应该用这个机制
                    if(inAlikeCount<=0){
                        let alikeSize=0;
                        for(let nu=n+1; nu<=area.items.length-1; nu++)
                        {
                            const next=area.items[nu];
                            if(next){
                                //可能被判定为 一摸一样 项目栏目编码串的情形； 只能在同一个编辑区内部判别，这个不能跨区域。
                                if((next.x===et.x || !next.x) && (next.y===et.y || !next.y) && (next.z===et.z || !next.z) && (next.t===et.t || !next.t))
                                    alikeSize++;
                                else break;
                            }
                        }
                        if(alikeSize>0)   inAlikeCount=alikeSize;
                    }
                    else {
                        inAlikeCount--;     //处在上一个相等目标结论位置范围之内的。
                        alike=true;     //现在是需要row span处理的。
                    }
                    //像缓存一样 传递下去，按最左边序号顺序上托没改动的就是不变。
                    if(big===et.big || !et.big){
                        ctx++;
                    }
                    else{
                        ctx=1;
                        big=et.big;
                    }
                    ox=et.x??ox;
                    if(titl===et.titl || !et.titl){
                        cty++;
                    }
                    else{
                        cty=1;
                        titl=et.titl;
                    }
                    oy=et.y??oy;
                    if(sub===et.sub || !et.sub){
                        ctz++;
                    }
                    else{
                        ctz=1;
                        sub=et.sub;
                    }
                    oz=((et.z!)>0? et.z : oz)??0;
                    //监督检验项目: 印象是 前面最多有4列的？
                    //4个项目特殊：若遇见自扩展分拆项形式的项目： 第一个结论 【】数据扩充{结论字段：‘3.9Res’}3.11。3Res’ 3.12.4Res’ 5Res’;也别名字。
                    let itemRowRender=[];
                    //【自拆分项目】最左边序号列与右边5个列都要增加span; 若项目是自拆分情况没必要看et.span依据：前后都单独一个内嵌的独立计算span分区。
                    if(et.rss?.length! >0)        //属于自拆分项目的要特殊处理！【前提条件】注意span配置要特殊照顾span=null独立span分区。
                    {
                        const extendRs=et.rss?.length! + (et.head? 0: 0);      //比正常要要多出几行
                        //正式报告： 若et.head有 也是不显示的； 自拆分的分项目个数>=1;对应了rss?.[0]; 大标题，标题，小标题，第4级名称；
                        //【还未】支持自拆分项同时有4个级别项目编码的情形。
                        itemRowRender[0] =<TableRow id={n===0 ? area.tag:undefined} key={n}>
                                <CCell key={12}>{seq}</CCell>
                                <CCell key={13} rowSpan={extendRs} split={extendRs>2}>{et.iclas??area.iclas}</CCell>
                                { <CCell key={1} rowSpan={extendRs} colSpan={1===nowColumns? 4:1} split={extendRs>2}>
                                    { ((et.span?.bH!)>0)? <div css={{
                                            "@media print": {
                                                display: '-webkit-box',
                                                WebkitLineClamp: et.span.bH,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }
                                        }}>{ox}{scopeRowSp(ctx,8,et.span?.x) && big}</div>
                                        :
                                        <>{ox}{((scopeRowSp(ctx,8,et.span?.x)&& et.span?.bH!==0) || et.span?.bH===-1) && big}</>
                                    }
                                  </CCell>
                                }
                                {nowColumns>=2 && <CCell key={2} rowSpan={extendRs} split={extendRs>2} colSpan={2===nowColumns? 1:1}
                                     >{ox}.{oy}{nowColumns>2 && scopeRowSp(cty,6,et.span?.y) && titl}</CCell>
                                }
                                {nowColumns>=3 && <CCell key={3} rowSpan={extendRs} split={extendRs>2}
                                                         colSpan={3===nowColumns? 2:1}
                                     >{area.iclas}{ox}.{oy}.{oz}</CCell>
                                }
                                {nowColumns>=4 && <CCell key={11} rowSpan={extendRs} split={extendRs>2}
                                        >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                <CCell key={14} rowSpan={extendRs} split={extendRs>2}>{et.titl}</CCell>
                                <Cell key={4} css={{
                                    [theme.mediaQueries.big]: {
                                        padding: "0 0.25rem"
                                    }
                                }}>{et.rss?.[0].label??et.rss?.[0].name}</Cell>
                                <CCell key={5}>{resTranslCm(itRes?.[et.rss?.[0].name!])}</CCell>
                                <CCell key={6} rowSpan={extendRs} split={extendRs>2}>{itemResTransform(orc,et)}</CCell>
                                {/*<CCell key={9} rowSpan={extendRs} split={extendRs>2}>{itRes?.[et.name+'_M'] || '/'}</CCell>*/}
                            </TableRow>;
                        et.rss?.forEach((cfx:RecordSelfSplit, fc:number) => {
                            if( 0!==fc )
                                itemRowRender.push(
                                        <TableRow  key={n+`${fc}`}>
                                            <CCell key={12}>{seq}</CCell>
                                            <Cell key={4} css={{
                                                [theme.mediaQueries.big]: {
                                                    padding: "0 0.25rem"
                                                }
                                            }}>{cfx.label??cfx.name}</Cell>
                                            <CCell key={5}>{resTranslCm(itRes?.[cfx.name])}</CCell>
                                        </TableRow>
                                );
                        });
                    }
                    else{
                        itemRowRender[0] =<TableRow id={n===0 ? area.tag:undefined} key={n}>
                                <CCell key={12}>{seq}</CCell>
                                <CCell key={13}>{et.iclas??area.iclas}</CCell>
                                { (et.span.x!)>0 && <CCell key={1} rowSpan={et.span.x} colSpan={1===nowColumns? 4:1}>
                                    { ((et.span?.bH!)>0)? <div css={{
                                            "@media print": {
                                                display: '-webkit-box',
                                                WebkitLineClamp: et.span.bH,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }
                                        }}>{ox}{scopeRowSp(ctx,8,et.span?.x) && big}</div>
                                        :
                                        <>{ox}{((scopeRowSp(ctx,8,et.span?.x)&& et.span?.bH!==0) || et.span?.bH===-1) && big}</>
                                    }
                                  </CCell>
                                }
                                {nowColumns>=2 && et.span.y!>0 && <CCell key={2} rowSpan={et.span.y}
                                                                         colSpan={2===nowColumns? 1:1} >
                                    {(atPrint && et.span.tH)? <div css={{
                                            "@media print": {
                                                display: '-webkit-box',
                                                WebkitLineClamp: et.span.tH,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }
                                        }}>{ox}.{oy}</div>
                                        :
                                        <>{ox}.{oy}</>
                                    }
                                    </CCell>
                                }
                                {nowColumns>=3 && et.span.z!>0 && <CCell key={3} rowSpan={et.span.z}
                                                                         colSpan={3===nowColumns? 2:1} >
                                    {(atPrint && et.span.sH)? <div css={{
                                            "@media print": {
                                                display: '-webkit-box',
                                                WebkitLineClamp: et.span.sH,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }
                                        }}>{area.iclas}{ox}.{oy}.{oz}{nowColumns>3 && sub}</div>
                                        :
                                        <>{area.iclas}{ox}.{oy}.{oz}{nowColumns>3 && scopeRowSp(ctz,4,et.span?.z) && sub}</>
                                    }
                                    </CCell>
                                }
                                {nowColumns>=4 && <CCell key={11}
                                         >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                <Cell key={4} css={{
                                    [theme.mediaQueries.big]: {
                                        padding: "0 0.25rem"
                                    }
                                }} colSpan={2}>{et.titl}</Cell>
                                <CCell key={5}>{resTranslCm(itRes?.[et.name])}</CCell>

                                { !alike &&
                                    <CCell key={6} rowSpan={inAlikeCount+1} split={inAlikeCount>3}>{itemResTransformAL(orc,area,n,inAlikeCount+1)}</CCell>
                                }
                            </TableRow>;
                    }
                    const rowsBigArea=<React.Fragment key={seq}>
                        <DirectLink  href={`/report/${model}/ver/${ver}/${repId}/${area.tag}#${area.tag}`}>
                            {itemRowRender}
                        </DirectLink>
                    </React.Fragment>;
                    htmlTxts.push(rowsBigArea);    //原先在htmlTxts.push(itemRowRender);bigItemRowCnt++;前面就处理的
                }
            });
        });

        return  htmlTxts;
    }, [itRes,repId,model,ver,ItemArs,atPrint,theme.mediaQueries.big]);
    return { renderIspContent };
};

