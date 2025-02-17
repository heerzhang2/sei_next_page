/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Cell, TableRow, useTheme,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {RecordInputConfig, RecordIspArea, RecordSelfSplit} from "../bridge/orcIspConfig";
import {itemResTransform} from "./useRecordListSub";
import {resTranslCm} from "../../common/helper";
import {scopeRowSp} from "../../tools";
import {useMedia} from "use-media";

//格式化版原始记录（非原生版原始记录）的页面的通用的格式显示。 电梯的；x.y下标 较为统一的检验 对报告项目布局。
/**印象派； 抽象 模型； 提取已经配置的印象法对象， 依据印象设计的规则来生成render元素。每个印象可能抽象后的映射生成元素原则都会不相同的！
 * @param inspectionContent: 配置项目表；
 * @param itRes 正式报告在最后面的两个列的数据 结果：像是这样的{'1.4':{result:?,'1':?}, ,};
 * 【原始记录打印】的情形下 itRes 实际=orc对象；
 * 定期检验版本地记录排版：比监检的少了 '工作见证' '确认方式' 两个列; 自拆分项目的不合格原因是拆分多个做录入的。
 * */
export const useLikeCranePeriodical= ({itRes, ItemArs, model,ver, repNo}
         :{itRes:any, ItemArs:RecordIspArea[], model:string,ver:string, repNo:string}
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
                    else throw new Error(`非法列设置`);
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
                    if((et.rss?.length!) >0)        //属于自拆分项目的要特殊处理！【前提条件】注意span配置要特殊照顾span=null独立span分区。
                    {
                        const extendRs=et.rss?.length! + (et.head? 0: -1);      //比正常要要多出几行
                        itemRowRender[0] =<React.Fragment key={n}>
                            <TableRow >
                                <CCell key={12}>{seq}</CCell>
                                { <CCell key={1} rowSpan={1+extendRs} colSpan={1===nowColumns? 4:1}
                                   >{area.iclas}{ox}{big}</CCell>
                                }
                                {nowColumns>=2 && <CCell key={2} rowSpan={1+extendRs}
                                                                         colSpan={2===nowColumns? 3:1}
                                          >{area.iclas}{ox}.{oy}{nowColumns>2 && titl}</CCell>
                                }
                                {nowColumns>=3 && <CCell key={3} rowSpan={1+extendRs}
                                                                         colSpan={3===nowColumns? 2:1}
                                         >{area.iclas}{ox}.{oy}.{oz}</CCell>
                                }
                                {nowColumns>=4 && <CCell key={11} rowSpan={1+extendRs}
                                         >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                { et.head? <Cell key={4} colSpan={2}>{et.head}</Cell>
                                    :
                                    <>
                                        <Cell key={4}>{et.rss?.[0].desc}</Cell>
                                        <CCell key={5}>{itRes?.[et.rss?.[0].name!]}</CCell>
                                    </>
                                }
                                <CCell key={6} rowSpan={1+extendRs}>{itemResTransform(itRes,et)}</CCell>
                                { et.head? <Cell key={10}></Cell>
                                    :
                                   <CCell key={10}>{itRes?.[et.rss?.[0].name!+'_D'] || ''}</CCell>
                                }
                                {/*<CCell key={10} rowSpan={1+extendRs}>{itRes?.[et.name+'_D'] || ''}</CCell>*/}
                                <CCell key={9} rowSpan={1+extendRs}>{itRes?.[et.name+'_M'] || '/'}</CCell>
                            </TableRow>
                        </React.Fragment>;
                        et.rss?.forEach((cfx:RecordSelfSplit, fc:number) => {
                            //扣除前面的head 或者第一个子项目的位置；            //#没有涉及到 tail 出现的位置情况；
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
                    }
                    else{
                        itemRowRender[0] =<React.Fragment key={n}>
                            <TableRow >
                                <CCell key={12}>{seq}</CCell>
                                { et.span.x!>0 && <CCell key={1} rowSpan={et.span.x}
                                                         colSpan={1===nowColumns? 4:1}
                                         >{area.iclas}{ox}{big}</CCell>
                                }
                                {nowColumns>=2 && et.span.y!>0 && <CCell key={2} rowSpan={et.span.y}
                                                                         colSpan={2===nowColumns? 3:1}
                                          >{area.iclas}{ox}.{oy}{nowColumns>2 && titl}</CCell>
                                }
                                {nowColumns>=3 && et.span.z!>0 && <CCell key={3} rowSpan={et.span.z}
                                                                         colSpan={3===nowColumns? 2:1}
                                         >{area.iclas}{ox}.{oy}.{oz}{nowColumns>3 && sub}</CCell>
                                }
                                {nowColumns>=4 && <CCell key={11}
                                           >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                <Cell key={4}>{et.desc}</Cell>
                                <CCell key={5}>{itRes?.[et.name]}</CCell>
                                <CCell key={6}>{itemResTransform(itRes,et)}</CCell>
                                <CCell key={10}>{itRes?.[et.name+'_D'] || ''}</CCell>
                                <CCell key={9}>{itRes?.[et.name+'_M'] || '/'}</CCell>
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
/**正式报告的显示：
 * <DirectLink无法穿透<React.Fragment key> <  key> 没法点击跳转;  而<DirectLink放在Table上那级的不能切换鼠标选中状态的可点跳转。
 * 【浏览器限制】需支持display: '-webkit-box',的才能显示多行情况省略号，目的限制标题打印高度方向太高了-webkit-line-clamp:。
 * 不能用 const atPrint = useMedia('print'); 【重大毛病】
 * */
export const useLikeCraneOfficial= ({itRes, ItemArs, model,ver, repId}
                                           :{itRes:any, ItemArs:RecordIspArea[], model:string,ver:string, repId:string}
) => {
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
                    else throw new Error(`非法列设置`);
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
                        const extendRs=et.rss?.length! + (et.head? 0: -1);      //比正常要要多出几行
                        //正式报告： 若et.head有 也是不显示的； 自拆分的分项目个数>=1;对应了rss?.[0]; 大标题，标题，小标题，第4级名称；
                        //【还未】支持自拆分项同时有4个级别项目编码的情形。
                        itemRowRender[0] =<TableRow id={n===0 ? area.tag:undefined} key={n}>
                                <CCell key={12}>{seq}</CCell>
                                { <CCell key={1} rowSpan={extendRs} colSpan={1===nowColumns? 4:1} split={extendRs>2}
                                          >{area.iclas}{ox}{scopeRowSp(ctx,8,et.span?.x) && big}</CCell>
                                }
                                {nowColumns>=2 && <CCell key={2} rowSpan={extendRs} split={extendRs>2} colSpan={2===nowColumns? 3:1}
                                     >{area.iclas}{ox}.{oy}{nowColumns>2 && scopeRowSp(cty,6,et.span?.y) && titl}</CCell>
                                }
                                {nowColumns>=3 && <CCell key={3} rowSpan={extendRs} split={extendRs>2}
                                                         colSpan={3===nowColumns? 2:1}
                                     >{area.iclas}{ox}.{oy}.{oz}</CCell>
                                }
                                {nowColumns>=4 && <CCell key={11} rowSpan={extendRs} split={extendRs>2}
                                        >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
                                }
                                <Cell key={4} css={{
                                    [theme.mediaQueries.big]: {
                                        padding: "0 0.25rem"
                                    }
                                }}>{et.rss?.[0].label??et.rss?.[0].name}</Cell>
                                <CCell key={5}>{resTranslCm(itRes?.[et.rss?.[0].name!])}</CCell>
                                <CCell key={6} rowSpan={extendRs} split={extendRs>2}>{itemResTransform(itRes,et)}</CCell>
                                <CCell key={9} rowSpan={extendRs} split={extendRs>2}>{itRes?.[et.name+'_M'] || '/'}</CCell>
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
                                { (et.span.x!)>0 && <CCell key={1} rowSpan={et.span.x} colSpan={1===nowColumns? 4:1}
                                       >{area.iclas}{ox}{scopeRowSp(ctx,8,et.span?.x) && big}</CCell>
                                }
                                {nowColumns>=2 && et.span.y!>0 && <CCell key={2} rowSpan={et.span.y}
                                                                         colSpan={2===nowColumns? 3:1} >
                                    {(atPrint && et.span.tH)? <div css={{
                                            "@media print": {
                                                display: '-webkit-box',
                                                WebkitLineClamp: et.span.tH,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }
                                        }}>{area.iclas}{ox}.{oy}{nowColumns>2 && titl}</div>
                                        :
                                        <>{area.iclas}{ox}.{oy}{nowColumns>2 && scopeRowSp(cty,6,et.span?.y) && titl}</>
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
                                }}>{et.four??et.sub??et.name}</Cell>
                                <CCell key={5}>{resTranslCm(itRes?.[et.name])}</CCell>
                                <CCell key={6}>{itemResTransform(itRes,et)}</CCell>
                                <CCell key={9}>{itRes?.[et.name+'_M'] || '/'}</CCell>
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
    }, [itRes,repId,model,ver,ItemArs,atPrint]);
    return { renderIspContent };
};


/*const useValues = () => {
  const [values, setValues] = React.useState({  });
  const itBinds=useProjectListAs({count: 8});
  const updateData = React.useCallback(
    (nextData) => {    },    [values]);
  return [values, updateData, itBinds];
};
*/