/** @jsxImportSource @emotion/react */
import * as React from "react";

export interface InosFourSpan {
    //最大支持两个级别的 标题：
    //最大一级的项目标题：：按照顺序后面没配置的就合并进Cell中。同时考虑seco参数。
    big?: string;
    //最大一级级别栏目的Span； 没配置的没有该 <td>; 同时附加seco的就会有2个列。
    /**关键的：[?]span几个参数，最好不要跨越Area编辑区域去做配置，强制缩小影响波及范围；@方便调试和修改！。
     *现有特列的：就是正式报告不显示big大标题这一列的情形下，假如rec:自己配置了bspan，那么rpo:里面的bspon确实可以省略掉的。为了一致和预防需要显示大标题需求摇摆还是最好bspan按正常地做配置。
     * */
    bspan?: number;

    //第二级别 项目字段的标题，标题如果被配置上了的：那么正式报告这个项目位置必须支持拆分（大的套住小的列的拆分）：大列拆了 小的列跟着拆分。。
    seco?: string;
    //第二级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。
    //【不同含义】若span===0的【特殊规则】情况， 同一个配置span底下的项目栏目占用的列数竟然不相等了： 标题栏目向左边的项目编号栏目融合TD而扩展空间：一直到了项目栏目取的第二级别原本位置上了;
    //假如是自拆分的，且这个拆分项目不是独立显示全部小项目的情况，那么若第一个小项目是没有name的【纯文字行】的话，属于例外情形：必须这第一行也配置上最后一个项目位置所对应的**span : 1的;否则是可以省略的。
    //新常态正式报告中，若是拆分自项目的其第一行设置中的span:1也不能省略。
    span?: number;

    //第三个级别 项目字段的标题，标题如果被配置上了的：那么正式报告这个项目位置必须支持拆分（大的套住小的列的拆分）：大列拆了 小的列跟着拆分。。
    third?: string;
    //第三级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。
    //【不同含义】若tspan===0的
    tspan?: number;

    //第四个 4级别的栏目 级别{可以归并？} ;最大支持4级别的栏目。
    four?: string;
    //第四级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。隐含都安排有四个级别栏目
    fspan?: number;
}

/**项目列表基础结构模型(第四代版本)：可变形，适应性更加广泛的，配置直观直接的，
 * 寻求平衡点 ： 配置 修改简单，适应性广 适合的场合 可配合。
 * 拆分项目（自拆分 ，强拆分）: 归并项目（相邻项合并，文字内容归并）。
 第四个栏目：不一定只有x.y.z.t后面还有一个下分的小小序号.L? ; 5.1.2.1 + 5.1.2.2.1 + 5.1.2.2.2 归并项目同时还有项目自拆分的两个情况融合的。
 报告没有，记录却内嵌的 两个情况融合的。。likeSingB, configOmni;
 若是正式报告的需要压缩某些放行的。 若格式化打印原始记录：项目栏目编号区域可能变动的？
 * */
export interface ItemOmniConfig {
    //正式报告的行列式的拆分 表格span。
    //【注意】假如rec{}里面配置了最后一个span,那么rpo{}里面也应该配置这个span即使它=1{通常地rec rpo两个最后一个span都=1的实际可省略不必配置的};
    rpo: InosFourSpan;
    //格式化原始记录报告的行列式的拆分 表格span。
    //【容易配置出错】bspan竖跨第一行的rec若小一级别span做配置了，那么高级别的bspan也需要同时做配置，此时丢失默认继承rpo{bspan}的机制。
    rec: InosFourSpan;
    //项目编排指示：编辑区的render头部和隔离。nos=undefined：就是继承=同一个项目的。
    //不合格需要的：
    nos?: string;
    pre?: string;    //项目x.y.z 最最前面的附加文字
    /**类别： 自拆分项目区块的 按照前面的iclas可以遗传的， 正常一般项目之间就不做遗传的；
     * 自拆分项目区块的iclas 配置在第一个非空白文字行上面也即第一条有效子项目上。
     * */
    iclas?: string;  //项目x.y.z 后面的或前面的：类别；不合格拆分依据。

    //可拆分的项目的 name:实际是结论字段的标签 + cfname[]分别存储； 【正式报告可能会】再一次汇总映射的？？就算走cfname的但是name也必须有(存放其它_D_M_S_Z字段)。
    //没定义的：自拆分的前后说明文本。归并自拆分头尾可能是纯文本的行，name=空的。
    //【注意】自拆分和相邻组合项自拆分的情况：第一行的若只是文字叙述没有正式小项字段存储的情形下，也需要配置name参数：因为需给备注等只有唯一一个储存字段的栏目来使用的。
    name?: string;
    /**正式报告的 标题位置文本：空的= 可拆分的内部的小项目，可拆分以及归并可拆分的第一个项目位置行(包含开头解说那行)的位置需要配置。
     * 驱动正式报告是否要单独一行的显示出来？【有些】自拆分不一定需要显示给正式报告的被省略掉！; 可复杂显示的比如<Text>&nbsp;运行行程限位器</Text>
     * 若正式报告中针对自拆分项目只会显示一行地情况：该自拆分块的最后一行(不管原始记录当中这一行是纯粹备注文本还是普通子项)的recap都可直接配置正式报告的主标题内容。
     * */
    recap?: string | React.ReactNode;
    //【类型检查还是非常重要的】实际数据desc: 字段配置了[,]数组形式的DOM[1,2];导致的报错：【还死活找不到】具体的代码出处。typescript检查被:as xxx忽视掉。 as RecordIspArea
    //格式化打印原始记录，记录区域位置：可能简易文本，可能拆分
    desc: string | React.ReactNode;

    //【自拆分++合并相邻项】只有唯一个 的独立结论结束位置： 空的= 不是完整结论项目结束位置，必须往下面看看。一直到resi非空的，才能按照自拆分+相邻项合并，来计算结论！
    //非自拆分+相邻项合并，正常项目的：=false； 设置true=这一行依旧是没有独立的结论！！拆分项目连续配置区的最后一行做配置=false;
    nconcl?: boolean;    //span：报告和记录还要去区分掉。
    //结论 或 整个备注块或者权重输入的提示词； 自拆分+相邻项合并只有最后的那一个行配置。【render】需反向搜索nconcl最开始哪一行，找到name;{局限同一个大编辑区域}内部。
    //tips也可能作为recap的替身形式出现在原始记录的某一栏目列当中。
    tips?: string;
    //[废弃？]display=false才有意义的，专门给自拆分和相邻组合项自拆分的情况，编辑器录入的标题：需给备注等只有唯一一个储存字段的栏目来使用的:实际配置到了自拆分和相邻组合项自拆分的最后一行的。
    //自拆分+相邻项合并的:归并区的最后一行：主力配置行，除了span项目栏目文本参数之外的都比拆分块的第一行配置优先。
    //不是拆分区域的最后一行的没有设置这merg**参数。
    mergLabel?: string;
    //备注-结论使用的存储字段；合并计算
    //结论栏自拆分和相邻组合项自拆分的情况: 连续拆分归并小项目该结论区域的最后一行才需人工配置的；其它行或其它情况的无效。
    mergName?: string;
    //自拆分+相邻项合并的在最后一行位置做配置！：指引正式报告项目行的显示与否的,同时rpo.#span需配合修正：=false就是不显示小小项目，=true就是需要显示出自拆分小项目；
    //其它普通项目不用设置该参数，仅仅在拆分项目(原始记录有相似的，正式报告却不做显示的拆分项目连续配置区)，拆分项目连续配置区的@第一行$做配置即可的。这一行的nconcl同时=true；
    //拆分项目：这个参数直接影响oRSpan的自动计算！
    display?: boolean;
    //新常态报告的项目标题单独作为一个列放入原始记录的。有些项目行区域合并且改了标题描述并且是普通项目而非自拆分型项目,适用于单个编辑区。
    rtspan?: number;
    //不合格需要的：如果小项目没有提供nos?: string;就依照该字段定位不合格的项目序号。 类似==:{pre}{iclas}{nos}; pre不会有， iclas默认=同一行的小项目的iclas。
    mergNos?: string;

    /**纯粹是计算出来的，不是配置的字段！！！
     * 给正式报告页面的 结论栏目的span；普通的项目或者 拆分块的第一行 必然oRSpan>=1 拆分块的其他行oRSpan为空的。
     * */
    oRSpan: number;              //Officail Report，span
    /**纯粹是计算出来的，不是配置的字段！！！
     * 给格式化原始记录打印报告页面的 结论栏目的span， 若是自拆分项目第一行必然会>1的。
     * */
    fRSpan: number;              //Format 类比 的 oRSpan；
    /**纯粹是计算出来的，不是配置的字段！！！   仅仅拆分区域的第一行才需要设置！其它的场景就无用。
     *针对结论栏自拆分和相邻组合项自拆分的情况: 连续拆分归并小项目该结论区域的最后一行和第一行的数组索引的偏差。
     * */
    offset: number;
}


/**独立路由的关联对应编辑视图 区块：每次添加最小项目的区域；
 * 整个isp项目的全列表:是RecordIspArea[]；
 * */
export interface RecordOmniArea {
    //独立路由器对应的 编辑区域所映射的区域  tag==Action；
    //这里tag最好不一定就是x.y.z什么的，版本交替会有差异的。
    tag:string;
    //区块编辑器 标记用的:编辑区的导航的标题
    name:string;
    //可以合并显示多个项目的编辑器等的记录； 【前提条件】必须按照数字大小顺序排序。可允许一次性路由到多个的分最底层的支项目。
    //同一个路由区块内的编辑区域：  多个项目聚合， 有些相同的可免去配置或者免于标题做显示。
    items: ItemOmniConfig[];
}
class InosFourSpanP {
    //最大一级级别栏目的Span； 没配置的没有该 <td>; 同时附加seco的就会有2个列。
    bspan?: number;
    //第二级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。
    span?: number;
    //第三级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。
    tspan?: number;
    //第四级别{title}栏目的Span； 没配置的没有该 <td>; 若seco没有配置的就没有第二级的栏目，这样的话只有一个列。
    fspan?: number;
}
export interface ItemMergeNos {
    //自拆分项目区仅在最末一行才能配置的；同时这一行的nconcl=false;
    mergName?: string;
    //[新常态]原始记录加一列做标题陈述的：通常标题陈述直接看recap; 自拆分项目区（嵌套，多项目项目号的组合）就可能需要依照mergLabel来的。
    //拆分项目区不仅仅在最末一行才能配置的；原始记录中有多个项目编号来对应桶一个结果判定列： 一个拆分区块的 下面有三个嵌套的分区： 利用 mergLabel seco span 来辨识特殊点[新常态]。
    //上面说的项目编号和结果判定列：通常拆分项目是一对一的TD对应关系,通常**span是一样的。可现如今新要求出现多对一的布局：“YY电梯定期委托报告'EL-WT'”的原始记录出现这个特例！！
    //上述原始记录特异点在：单独的新加一列做标题陈述，标题陈述列TD和项目编号列ID一一对应的；但同时项目编号栏目并没有利用third+tspan来进行项目xyzt4列的嵌套法的拆分布局，仅仅做了big,seco两层的布局拆分,反常啊！！
    //用mergLabel来做副标题栏目{原始记录有显示的但是正式报告却不做显示的部分}，一个评分区域等于一个自拆分区块的（在设置span的自拆分过渡区块的第一行设置mergLabel）。
    mergLabel?: string;
    //不合格需要的：如果小项目没有提供nos?: string;就依照该字段定位不合格的项目序号。
    mergNos?: string;

    iclas?: string;
    nos?: string;
    //【给正式报告地不合格表格显示用】不合格项目会添加的前缀 但是每个拆分小项都需要分别独立配置，不能继承，pre无需保存到后端存储，直接去提取模板配置。
    pre?: string;
    //在正式报告：自拆分例子显示不显示display:false开关，同时rpo.$span需配合修正!
    display?: boolean;    //自拆分+相邻项合并的在最后一行位置做配置：指引正式报告项目行的显示与否的：=false就是不显示小小项目，=true就是需要显示出自拆分小项目；
    //新常态报告的项目标题单独作为一个列放入原始记录的。有些项目行区域合并且改了标题描述并且是普通项目而非自拆分型项目,适用于单个编辑区。
    rtspan?: number;
}

/**配置帮助函数：
 * 约束条件：span不可能高阶的做了配置，反而低阶的却不做配置，除非低阶的就没有这一列的栏目。
 * 比如项目区域有3列栏目：不可能存在这样配置 span>0 然后 tspan==undefined 的情况出现。
 * 【注意】rec参数路，若=={}和==undefined是不同含义的。前者继承上一行的span配置，后者优先看rpo的相应span配置。
 * 原始记录页面改成优先参照正式报告的span以后：若正式报告页面比如rpo={seco:'C3.6',tspan:-1,fspan:0},后面配套rec=就需要修订下才行rec={tspan:0}；
 * 【严重提醒】【约束】rec相对于rpo若有自定义修改而做了bspan配置的话，那么这个情形下的rec的剩下其它没修改的span也需要一起做配置加上，需整体一起配置rec,不能挑个配需要4个span一起，但是高层级span已经竖跨的除外。
 * */
export function crtOmni(name: string|undefined,rpo:InosFourSpan,rec: InosFourSpan|InosFourSpanP|undefined, desc: string | React.ReactNode,
                        mgNos?:ItemMergeNos, nconcl?:boolean, recap?:string|React.ReactNode|undefined, tips?:string): ItemOmniConfig {
    //需要 的class InosFourSpanP   :     默认配置也直接赋值上
    if(rec instanceof InosFourSpanP){
        return {name,rpo, rec:{...rpo, ...rec}, desc,nconcl,recap,tips, ...mgNos} as ItemOmniConfig;
    }
    else if(rec===undefined){
        return {name,rpo, rec:rpo, desc,nconcl,recap,tips, ...mgNos} as ItemOmniConfig;
    }
    else{
        const {big, seco, third, four }=rpo;
        //【不能直接这样的】 const newRec={big ,seco, third, four, ...rec};  return {,rec:newRec,};
        let newRec={};
        if(undefined===rec.bspan && undefined===rec.span && undefined===rec.tspan && undefined===rec.fspan)
            newRec={
                big:rec?.big??big ,seco:rec?.seco??seco, third:rec?.third??third, four:rec?.four??four,
                bspan:rpo.bspan, span:rpo.span, tspan:rpo.tspan, fspan:rpo.fspan,
            };
        else
            newRec={big:rec?.big??big ,seco:rec?.seco??seco, third:rec?.third??third, four:rec?.four??four,};
        return {name,rpo, rec:{...rec, ...newRec}, desc,nconcl,recap,tips, ...mgNos} as ItemOmniConfig;
    }
}

export function pushOmni(ari: RecordOmniArea[],tag:string,items: ItemOmniConfig[],name:string): RecordOmniArea[] {
    ari.push({ tag, items, name});
    return ari;
}
export function crtInos(big?: string,bspan?: number,seco?: string,span?: number, third?: string,tspan?: number,four?: string,fspan?: number): InosFourSpan {
    return {big, bspan, seco, span, third, tspan, four, fspan};
}
//专门给 原始记录打印的： 简化掉四个 标题：和正式报告一样的。
export function crtInsp(bspan?: number,span?: number,tspan?: number,fspan?: number): InosFourSpanP {
    return {bspan, span, tspan, fspan};
}
export function crtNoMg(mergName?: string,iclas?:string,nos?:string, pre?:string,mergLabel?:string,mergNos?:string,display?:boolean): ItemMergeNos {
    return {iclas, nos, pre, mergName, mergLabel, display, mergNos};
}

// export function makeNoMg(options: ItemMergeNos): ItemMergeNos {
//     return {... options};
// }


/**第四代配置模型做法下的项目列表，寻找不合格项目的全貌;  【差异】：对于自拆分区域的项目必须输入不合格描述才能显示该项目。
 * 自拆分区域的小项目 如果有配置nos的话就单独做一个记录，否则就归并给父辈自拆分合并配置项的mergNos;
 * @param ItemArs 全体项目配置
 * @param options { noCB : 有些项目编码重复的需要额外做区分； }
 * 剔除不合格后端对象存储t:area.tag的要求，改为动态生成，破除依赖性，增强强强壮性，保证版本旧数据迁移升级无忧。
 * @return 直接给不合格列表用的对象
 * */
export const itemResultUnqualifiedOmni =(orc: any, ItemArs:RecordOmniArea[]
) => {
    let failure: any[]=[];          //存储的是 标签 no:? 项目URL定位？ key还需要用于获取结果对象。
    // let seq = 0;
    ItemArs?.forEach((area, b) => {
        let sumAreaLines=area.items.length;
        for(let row=0;row<sumAreaLines;){
            let et=area.items[row];
            if(et){
                // seq += 1;
                // let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                // let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
                //【自拆分项目】必须在同一个区块都配置上；不能跨越２个编辑区。
                let res=itemResTransformRec(orc, area, row);
                if(res==='不合格'){
                    //必须在同一个的编辑区域之内的！
                    if(et.fRSpan>1){        //【自拆分项目】可能有多个的归并！！
                        let because='';      //组合的不合格描述。
                        let i=0;
                        for(;i<et.fRSpan;i++){
                            let cLineEt=area.items[row+i];
                            const name=cLineEt?.name;
                            if(name){       //汇总是不合格，来自多个独立的字段做的判别。
                                const jilu= orc[name];
                                if(!jilu || jilu==='' || jilu==='△' || jilu==='×'){
                                        if(cLineEt?.nos){
                                            failure.push({no:cLineEt?.nos, b: orc[name+'_D']});
                                        }
                                        else
                                            because= because? because+'；'+orc[name+'_D'] : orc[name+'_D'];
                                }
                            }
                        }
                        if(because){
                            let mgLastOneEt=area.items[row+et.offset];
                            if(!mgLastOneEt)   throw new Error(`没对应最后行${row+et.offset}`);
                            failure.push({no:mgLastOneEt.mergNos, b: because });
                        }
                    }
                    else failure.push({no:et.nos, b: orc[et.name+'_D']});
                }
            }
            if(et.fRSpan>1)   row+=et.fRSpan;    //已经在上面核查了
            else   row++;
        }
    });
    //返回  存储数据库的对象{no: ts, b: itRes[ts].fdesc}; } + 前端的导航点击URL跳转编辑器关联的tag；当没有保存c: itRes[ts].iClass,
    return failure;
}

/**预处理配置代码。
 * 正式报告显示[可定做的] 首先给模型 加上默认值 和计算值。 再传给useOfficialOmniLikeCraneSi= ({ItemArs,)免于在后面计算重复算 且 逻辑更简单点。
 * 正式报告里面要不要独立显示自拆分++合并相邻项，每一行的还是隐藏明细的项目。
 * 配置上若多数情形感觉罗嗦的 的才考虑这里进行处理，不算太麻烦的也就算了。
 * @var displayDefault 默认=true 要显示自拆分区的小项目。[什么情形要配置] 默认情况改成了不做显示自拆分项的某些正式报告模板。
* */
export function omniCalculateDefault(ItemArs:RecordOmniArea[],options:{iclasDefault?:string,
    displayDefault?:boolean,
}) :RecordOmniArea[]
{
    //自拆分区的几个项目是否在正式报告显示出：displayDefault默认=true;
    const lastSsDisplayDef = options.displayDefault===undefined? true : options.displayDefault;
    //正式报告oRSpan设置: 会复制mergName给拆分归并块的第一实际行的。
    ItemArs?.forEach((area, b) => {
        const itemslines=area.items.length;
        if(itemslines>0){
            let n=0;
            for(; n<itemslines; ){
                const et=area.items[n];
                if(et){
                    // seq += 1;
                    //【约定前提】拆分项目的一整块都必须在同一个的编辑区域之内的！
                    if(et.nconcl){       //一定会是第一行的 仅仅在拆分项目(原始记录有相似的，正式报告却不做显示的拆分项目连续配置区)，拆分项目连续配置区的第一行。
                        let realFirstIdx=undefined;         //真正可以给报告显示的第一行的位置。要排除纯粹的文字说明行！
                        //往前面先看看：
                        let hideLines=0;
                        let i=n;
                        for(;i<itemslines;i++){
                            //头尾文本的记录占用行的情况。 若area.items[i].mergName非空，area.items[i].name=空的：就是最后一行的纯粹说明文本行，没有显示在报告的！
                            if( !(area.items[i].name) )       //没有存储的文字行：正式报告可定不需要这行的。
                                hideLines++;
                            if(area.items[i].name && realFirstIdx===undefined)
                                realFirstIdx=i;
                            if(!area.items[i].nconcl)  break;
                        }
                        let imergLast=i<itemslines? i : itemslines-1;
                        if(realFirstIdx===undefined)   throw new Error("拆分项区没任何可显示行");
                        if(area.items[imergLast].display===undefined){
                            area.items[imergLast].display=lastSsDisplayDef;            //全局的display默认取值
                        }
                        //自动复制给第一行做配置：连续拆分归并的小小项目只能在正式报告中整个输出一行的。
                        et.mergName= area.items[imergLast].mergName;
                        //因为备注结论栏目对于拆分项目的一整块只能出现名义上一行的实际跨越全部的内部拆分行的。【所以】不考虑支持，拆分项目的内部单独配置display来差异化显示与否，只能统一行动。
                        et.display= area.items[imergLast].display;
                        et.offset= imergLast - n;       //仅仅拆分区域的第一行才需要设置！其它的场景就无用。
                        if(imergLast<=n)   throw new Error("拆分项须安排同一编辑区内");
                        if(et.display){               //正式报告需要展开显示出“连续拆分归并的小小项目”
                            et.oRSpan= imergLast - n +1 -hideLines;
                            //拆分块的第一行 必然oRSpan>=1 其他行oRSpan为空的。
                        }
                        else{
                            et.oRSpan=1;
                        }
                        if(realFirstIdx !== n){         //纯粹文本行的位置会导致正式报告偏差了。 直接修正复制用户配置的位置过去给真正的第一行去。
                            area.items[realFirstIdx].display= et.display;
                            area.items[realFirstIdx].offset= imergLast-realFirstIdx;
                            area.items[realFirstIdx].oRSpan= et.oRSpan;
                            const {bspan, span, tspan, fspan}=et.rpo;
                            area.items[realFirstIdx].rpo = {...area.items[realFirstIdx].rpo, bspan,span,tspan,fspan};
                        }
                        n= i+1;    //看下面的其它区域 ：本拆分项目区域结束了
                    }
                    else {
                        et.oRSpan = 1;      //普通项目的
                        n++;
                    }
                }
                else n++;
            }
        }
    });
    //格式化原始记录打印需要的： fRSpan设置
    // seq = 0;
    ItemArs?.forEach((area, b) => {
        const itemslines=area.items.length;
        if(itemslines>0){
            let n=0;
            for(; n<itemslines; ){
                const et=area.items[n];
                if(et){
                    // seq += 1;
                    //必须在同一个的编辑区域之内的！
                    if(et.nconcl){
                        //往前面先看看：
                        let i=n+1;
                        for(;i<itemslines;i++){
                            if(!area.items[i].nconcl)  break;
                        }
                        et.fRSpan=(i-n+1);       //结论 备注是归并或只用一个字段存储的。
                        n+= et.fRSpan;
                    }
                    else {
                        et.fRSpan = 1;
                        n++;
                    }
                }
                else n++;
            }
        }
    });
    //支持iclas默认设置 ： 自拆分项目区块的 按照前面的iclas可以遗传的， 正常一般项目之间就不做遗传的；
    if(options.iclasDefault){
        ItemArs?.forEach((area, g) => {
            //漫步整个自拆分区吗
            let enterSSplit=false;
            let iclassFollow: string | undefined=options.iclasDefault;
            area.items.forEach((et, u) => {
                if(!enterSSplit && et.nconcl){
                    enterSSplit=true;
                }
                if(enterSSplit && et?.iclas!==undefined && (et?.nos || et?.mergNos)){
                    iclassFollow=et?.iclas;
                }
                if(et?.iclas===undefined && (et?.nos || et?.mergNos)){
                    if(enterSSplit){
                        et.iclas=iclassFollow;
                    }
                    else et.iclas=options.iclasDefault;
                }
                //离开本个自拆分区域
                if(enterSSplit && !et.nconcl){
                    enterSSplit=false;
                    iclassFollow=options.iclasDefault;     //不能超出这个自拆分区域去遗传了。
                }
            });
        });
    }
    //四个项目栏目标题的 也支持继承性。正式报告首先处理的， 原始记录跟随。
    let big: string | undefined;
    let seco: string | undefined;
    let third: string | undefined;
    let four: string | undefined;
    ItemArs?.forEach((area, g) => {
        area.items.forEach((et, u) => {
            if(!et)    throw new Error("竟然et空行");
            const lastLabel=et.nos? ((et.pre??'')+(et.iclas??'')+et.nos) : undefined;           //默认使用的最后项目位置的叙述
            //也支持项目最后一列的默认span=1行的做法
            if(et.rpo.four!==undefined && et.rpo.fspan===undefined)   et.rpo.fspan=1;
            else {
                if(et.rpo.third!==undefined && et.rpo.tspan===undefined)    et.rpo.tspan=1;
                else {
                    if(et.rpo.seco!==undefined && et.rpo.span===undefined)    et.rpo.span=1;
                    else{
                        if(et.rpo.big!==undefined && et.rpo.bspan===undefined)    et.rpo.bspan=1;
                    }
                }
            }
            let colShould=0;
            if(et.rpo.fspan!>0)  colShould=4;
            else if(et.rpo.tspan!>0)  colShould=3;
            else if(et.rpo.span!>0)  colShould=2;
            else if(et.rpo.bspan!>0)  colShould=1;
            // console.log("默认承",g,u,"colShould=",colShould,"ET=",et,"lastLabel",lastLabel,"BIG*",big);

            if(colShould===0 && et.rpo.big===undefined && et.rpo.seco===undefined && et.rpo.third===undefined && et.rpo.four===undefined)
                colShould= -1;       //表示没有任何配置，完全继承上一个的设置。
            if(et.rpo.bspan!==undefined && et.rpo.big===undefined && colShould>=1)
            {
                if(1===colShould && !big && lastLabel)  et.rpo.big=lastLabel;
                else et.rpo.big=big;         //可遗传下去
            }
            else if(et.rpo.bspan!==undefined && colShould>=1)
                big=et.rpo.big;
            if(et.rpo.span!==undefined && et.rpo.seco===undefined && colShould>=2)
            {
                if(2===colShould && !seco && lastLabel)  et.rpo.seco=lastLabel;
                else  et.rpo.seco=seco;
            }
            else if(et.rpo.span!==undefined && colShould>=2)
                seco=et.rpo.seco;
            if(et.rpo.tspan!==undefined && et.rpo.third===undefined && colShould>=3)
            {
                if(3===colShould && !third && lastLabel)  et.rpo.third=lastLabel;         //依据nos来生成默认标题的
                else  et.rpo.third=third;
            }
            else if(et.rpo.tspan!==undefined && colShould>=3)
                third=et.rpo.third;
            if(et.rpo.fspan!==undefined && et.rpo.four===undefined && colShould>=4)
            {
                if(4===colShould && !four && lastLabel)  et.rpo.four=lastLabel;         //依据nos来生成默认标题的
                else  et.rpo.four=four;
            }
            else if(et.rpo.fspan!==undefined && colShould>=4)
                four=et.rpo.four;
        });
    });
    //原始记录可以自主地修订; 可区别于正式报告的配置：
    big=undefined;       //原始记录不完全会等于正式报告
    seco=undefined;
    third=undefined;
    four=undefined;
    ItemArs?.forEach((area, g) => {
        area.items.forEach((et, u) => {
            const lastLabel=et.nos? ((et.pre??'')+(et.iclas??'')+et.nos) : undefined;           //默认使用的最后项目位置的叙述
            if(et.rec.four!==undefined && et.rec.fspan===undefined)   et.rec.fspan=1;
            else {
                if(et.rec.third!==undefined && et.rec.tspan===undefined)    et.rec.tspan=1;
                else {
                    if(et.rec.seco!==undefined && et.rec.span===undefined)    et.rec.span=1;
                    else{
                        if(et.rec.big!==undefined && et.rec.bspan===undefined)    et.rec.bspan=1;
                    }
                }
            }
            let colShould=0;
            if(et.rec.fspan!>0)  colShould=4;
            else if(et.rec.tspan!>0)  colShould=3;
            else if(et.rec.span!>0)  colShould=2;
            else if(et.rec.bspan!>0)  colShould=1;
            if(colShould===0 && et.rec.big===undefined && et.rec.seco===undefined && et.rec.third===undefined && et.rec.four===undefined)
                colShould= -1;
            if(et.rec.bspan!==undefined && et.rec.big===undefined && colShould>=1)
            {
                if(1===colShould && lastLabel)  et.rec.big=lastLabel;
                else et.rec.big=big;         //可遗传下去
            }
            else if(et.rec.bspan!==undefined && colShould>=1)
                big=et.rec.big;
            if(et.rec.span!==undefined && et.rec.seco===undefined && colShould>=2)
            {
                if(2===colShould && lastLabel)  et.rec.seco=lastLabel;
                else et.rec.seco=seco;
            }
            else if(et.rec.span!==undefined && colShould>=2)
                seco=et.rec.seco;
            if(et.rec.tspan!==undefined && et.rec.third===undefined && colShould>=3)
            {
                if(3===colShould && lastLabel)  et.rec.third=lastLabel;
                else et.rec.third=third;
            }
            else if(et.rec.tspan!==undefined && colShould>=3)
                third=et.rec.third;
            if(et.rec.fspan!==undefined && et.rec.four===undefined && colShould>=4)
            {
                if(4===colShould && lastLabel)  et.rec.four=lastLabel;
                else et.rec.four=four;
            }
            else if(et.rec.fspan!==undefined && colShould>=4)
                four=et.rec.four;
        });
    });
    // //自拆分区的几个项目是否在正式报告显示出：displayDefault默认=true;
    // ItemArs?.forEach((area, g) => {
    //     //漫步整个自拆分区吗  自拆分区的最后一个item必然和倒数的第二个的nconcl正好相反的
    //     area.items.forEach((et, u) => {
    //         if(u > 0 && area.items[u - 1].nconcl && !et.nconcl){
    //             if(et.display===undefined){
    //                 et.display=lastSsDisplayDef;            //全局的display默认取值
    //             }
    //         }
    //     });
    // });
    return ItemArs;
}



export type NosTagMapping = {
    tag: string;
    //nos?: string;
    iclas?: string;
    pre?: string;
};
/**构建允许反方向 搜索tag no的Map对象。 同一个编辑区的nos相等的不会报错的。
 * @param noCB  特别项目编码的处理回调函数。
 * @param ItemArs  全体检验项目的配置表
 * @argument notCheckNo 可以直接单独开启nos的校核， 替代env配置文件的 REACT_APP_TEST 的全局化设置。
 * */
export const useItemsMapOmni= ({ ItemArs, noCB, notCheckNo }
                                   :{ ItemArs:RecordOmniArea[], noCB?:(no:string,et:ItemOmniConfig)=>string, notCheckNo?:boolean }
) => {
    const itemsMap =React.useMemo(() => {
        const itemsMap = new Map<string,NosTagMapping>();
        // let ox: string;
        // let oy: string;
        ItemArs?.forEach((area, b) => {
            area && area.items.forEach((et:ItemOmniConfig, n:number) => {
                if(et){
                    // let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                    // let stno= 1===nowColumns? `${ox}` : `${et.pre}${et.iclas}${et.nos}` ;
                    if(et.nos){
                        //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
                        let  stno=noCB? noCB(et.nos, et) : et.nos;
                        let oldmv=itemsMap.get(stno);
                        if(oldmv && oldmv.tag!==area.tag){
                            if(!notCheckNo || process.env.REACT_APP_TEST==='true'){
                                throw new Error(`项${stno}重复${area.tag}`);
                            }
                        }
                        itemsMap.set(stno, {tag: area.tag, iclas: et.iclas, pre: et.pre});
                    }
                    if(et.mergNos){
                        let  stno=noCB? noCB(et.mergNos, et) : et.mergNos;
                        let oldmv=itemsMap.get(stno);
                        if(oldmv && oldmv.tag!==area.tag){
                            if(!notCheckNo || process.env.REACT_APP_TEST==='true')
                                throw new Error(`项${stno}重复${area.tag}`);
                        }
                        itemsMap.set(stno, {tag: area.tag, iclas: et.iclas, pre: et.pre});
                    }
                }
            });
        });
        return  itemsMap;
    }, [ItemArs,notCheckNo,noCB]);
    return [itemsMap];
};

/**结论归并，看配置的顺序上的跨度 nconcl?配置 ，有些是自拆分 有些按照父辈项目做的树状归并唯一个结论的情况：
 * 每个配置项目区域：必须能够决定结论。【注意】不能跨区配置。
 * @return 单一一个项目{正式报告对应一个项目序号的； 原始记录也是关联着项目顺序表上最左边的序号}的 自动综合出来的判别结果。
 * @param itRes : 原始记录 或者 对于正式报告有些可能被转换后的。
 * @param area: 整个的编辑区域。
 * @param index: 当前看到的哪一行配置的ItemOmniConfig ；  area.items.forEach((et:ItemOmniConfig, n:number)
 * 默认值 从'合格' 改成 '/'
 **/
export const itemResTransformRec = (itRes: any, area: RecordOmniArea, index:number) => {
    let result='／';
    //往前面去搜索的： <table><td>需要顺序布局的放在前面的变量。
    //直接采用前面步骤的预处理 结果字段：fRSpan , oRSpan计算好的。
    const itemslines=area.items.length;
    if(itemslines>0){
        const etFrom=area.items[index];
        if(etFrom){
            const _fRSpan=etFrom.fRSpan;
            //必须在同一个的编辑区域之内的！
            if(_fRSpan>1){        //就可能有多个的归并！！
                //往前面先看看：
                let i=0;
                for(;i<_fRSpan;i++){
                    const name=area.items[index+i]?.name;
                    if(name){
                        const jilu= itRes[name];
                        if(!jilu || jilu==='' || jilu==='△' || jilu==='×'){
                            if(result!=='不合格')  result='不合格';
                        }
                        else if(jilu==='√' || jilu==='▽'){
                            if(result==='／')   result='合格';
                        }
                        else if(jilu==='／'){
                        }
                        else
                            throw new Error(`结论非法${jilu}`);
                    }
                }
            }
            else {
                //一对一的情况 项目栏目
                const name=etFrom.name;
                const jilu= itRes[name!];
                if(!jilu || jilu==='' || jilu==='×' || jilu==='△' ){
                    result='不合格';
                }
                else if(jilu==='√' || jilu==='▽'){
                    result='合格';
                }
                else if(jilu==='／'){
                }
                else
                    throw new Error(`结论非法${jilu}`);
            }
        }
    }
    return  result;
}

/**结论归并，给正式报告版本的。 避免依赖于 fRSpan； 修改成依赖于oRSpan参数。
 * 每个配置项目区域：必须能够决定结论。【注意】不能跨区配置。
 * @return 单一一个项目{正式报告对应一个项目序号的； 原始记录也是关联着项目顺序表上最左边的序号}的 自动综合出来的判别结果。
 * @param itRes : 原始记录 或者 对于正式报告有些可能被转换后的。
 * @param area: 整个的编辑区域。
 * @param index: 当前看到的哪一行配置的ItemOmniConfig ；  area.items.forEach((et:ItemOmniConfig, n:number)
 * 默认值 从'合格' 改成 '/'
 **/
export const itemResTransformRpo = (itRes: any,area: RecordOmniArea,index:number) => {
    let result='／';
    //往前面去搜索的： <table><td>需要顺序布局的放在前面的变量。
    //直接采用前面步骤的预处理 结果字段：fRSpan , oRSpan计算好的。
    const itemslines=area.items.length;
    if(itemslines>0){
        const etFrom=area.items[index];
        if(etFrom){
            //const _fRSpan=etFrom.fRSpan;
            //必须在同一个的编辑区域之内的！
            if(etFrom.oRSpan>0 && etFrom.nconcl){        //就可能有多个的归并！ 起码2个拆分小项的结论归并
                //往前面先看看：
                const iEndRow=etFrom.offset;
                let i=0;
                for(;i<=iEndRow;i++){
                    const name=area.items[index+i]?.name;
                    // console.log("喝茶-etFrom=",etFrom, "index==",index,i,name);
                    if(name){
                        const jilu= itRes[name];
                        if(!jilu || jilu==='' || jilu==='△' || jilu==='×'){
                            if(result!=='不合格')  result='不合格';
                        }
                        else if(jilu==='√' || jilu==='▽'){
                            if(result==='／')   result='合格';
                        }
                        else if(jilu==='／'){
                        }
                        else
                            throw new Error(`结论非法${jilu}`);
                    }
                }
            }
            else {
                //一对一的情况 项目栏目
                const name=etFrom.name;
                const jilu= itRes[name!];
                if(!jilu || jilu==='' || jilu==='×' || jilu==='△' ){
                    result='不合格';
                }
                else if(jilu==='√' || jilu==='▽'){
                    result='合格';
                }
                else if(jilu==='／'){
                }
                else
                    throw new Error(`结论非法${jilu}`);
            }
        }
    }
    return  result;
}
/**通用结果字段的转换; 需要依赖orc itRes的对照，看看是否 ‘检验结果替换’ 的特例回调替换。
 * @param conseq: 归并结果的 所关联的：已经合并的结论。
 * */
export const resTranslOmni = (et:ItemOmniConfig, orc:any, itRes:any, conseq?:string) => {
    const merged=et.oRSpan>0;
    if(merged){        //拆分， 多个小项目汇总归并结果：是不是多行做的归并结果的, 普通项目=false。
        const mergedResult=orc?.[et.mergName!];
        const changeVal=itRes?.[et.mergName!];
        if(mergedResult === changeVal){
            if(conseq==='不合格'){
                return '不符合';
            }
            else if(conseq==='合格'){
                return '符合';
            }
            else if(conseq==='／'){
                return '／';
            }
            else return '／';
        }else{
           return  changeVal;   //被回调itResCB 修改的；
        }
    }
    else{       //普通项目的情形： 存储在et.name；
        const result=itRes?.[et.name!];
        if(!result || result==='' || result==='△'){
            return '未检测';
        }
        else if(result==='×'){
            return '不符合';
        }
        else if(result==='√'){
            return '符合';
        }
        else if(result==='／'){
            return '／';
        }
        else if(result==='▽'){
            return '资料确认符合';
        }
        else return result;
    }
}

