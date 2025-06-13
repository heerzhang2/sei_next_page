import * as React from "react";

/**结论区域只有唯一一个的；但是允许自己拆分为多个的可输入的字段名的区域。
 * 一个路由标签sno可以路由到多个的RecordInputConfig对应视图的。
 * */
export interface RecordInputConfig {
    //项目的编号 x.y.z.t; 前提条件是要求按照数字大小的顺序来增加的配置项目。
    x?:number;    //大项目号
    y?:number;    //第二级
    z?:number;    //第三级别的序号
    //最多允许配置的项目树杈的 第四列：x.y.z.t ;  t只能第四列的配置。 配套的名字是four；
    t?:number;

    //最详细项目尽头的 在数据库存储字段； 这一份‘不合格内容’不是附加到最小一级别上面的，而是每一个序号项目才一个的。
    //可拆分的项目的 name:实际是结论字段的标签 + cfname[]分别存储； 【正式报告可能会】再一次汇总映射的？？就算走cfname的但是name也必须有(存放其它_D_M_S_Z字段)。
    name: string;
    //最小一级的叙述：多为较大文本：记录的主体。
    //特殊：自己能拆分的项目 是数组形式的[];  自拆分形式的：cfname 和 desc 索引是一一对应的。
    //【离奇报错】就算没有被实际render的，可报错 Each child in a list should have a unique "key" prop. 居然在<Cell key={4}>{entry.desc}</Cell>这里出现的报错！和实际数据相关！！
    //【类型检查还是非常重要的】实际数据desc: 字段配置了[,]数组形式的DOM[1,2];导致的报错：【还死活找不到】具体的代码出处。typescript检查被:as xxx忽视掉。 as RecordIspArea
    desc?: string | React.ReactNode;
    //拆分的项目的 全部最终的存储字段。 联动自动计算结论提交给name；  但是：cfname集合字段映射给结论字段也只能是唯一一个的。结论不是orc存储给数据库的字段，前端自己转换和显示的。
    //4个项目特殊：若遇见自扩展分拆项形式的项目： 第一个结论 【】数据扩充{结论字段：‘3.9Res’}3.11。3Res’ 3.12.4Res’ 5Res’;也别名字。
    //这个版本的”不合格内容“这个列实际上针对的是name附加设置的，而不是其它模板可能是针对的cfname[]进行细化分别可以输入多字段的形式的。【版本不兼容】引起存储字段名称不一致的。
    // cfname?: string[]; 实际占用行的数量=rss.length+(head?1);
    rss?: RecordSelfSplit[];              //最少有一个拆分项目；rss没法横跨两个路由tag区块;
    //没有对应的编辑字段，只是可拆分的项目的所谓的段落开场白。自己拆分项目的头部一行；
    head?: string | React.ReactNode;
    //自己拆分项目的尾部补充的哪一行的文字
    tail?: string | React.ReactNode;
    //第四个级别的标题:如果已经配置的，按照顺序可以省略。正式报告取代sub用于最后项目标题内容。
    four: string;
    //第四个级别 原始记录的标题 替换
    // fourO?: string;
    //第三级别小项的标题:如果已经配置的，按照顺序可以省略。
    sub: string;
    //原始记录的标题？替换正式报告的标题吗
    // subO?: string;
    //第二级别 项目字段的标题，标题如果被配置上了的：那么正式报告这个项目位置必须支持拆分（大的套住小的列的拆分）：大列拆了 小的列跟着拆分。。
    titl: string;
    // titlO?: string;
    //最大一级的项目标题
    big?:string;
    //项目等级的标记
    iclas?: string;
    //正式报告可能附加配置：
    //大标题列 ：这两个跨几个行的？  小标题列的自动，最小标题显示到了 最左边项目序号的位置。
    span: RowSpanConfig;
    //是否属于把项目最后一级编码内置给了项目标题栏目的情况，连续多个项目都拥有同样的检验项目栏目的配置编码串，不合格输入却分开存储的，不合格表可能合并内容。
    //   alike?:number;    //正常应该undefined； alike=0， alike=项目数：标识出这个有几个连续的项目共同生成一个目标位置的结论栏目。
}
//正式报告：考虑附加的配置对象？：正式报告有些结论可能特殊处理的。

/**自拆分的项目 ：每一个分项的配置： 多个独立项目可输入目的。但是最左边的项目顺序的序号是相等的，正式报告只会显示一行的。
 * */
export interface RecordSelfSplit {
    //没有对应的编辑字段，只是可拆分的项目的所谓的段落开场白。
    name: string;
    //正式报告的标题; 原始记录的输入框 简短描述。
    label?: string;
    // cfname?: string[];
    //最小一级的叙述：多为较大文本：记录的主体。
    //特殊：自己能拆分的项目 是数组形式的[];  自拆分形式的：cfname 和 desc 索引是一一对应的。
    desc: string | React.ReactNode;
}

/**太多了： 独立分解出来：  项目列的span控制方面的配置。
 * */
export interface RowSpanConfig {
    x?: number;     //若遇到自拆分项目的也要计算分项目的行数在内。
    y?: number;     //第二级
    z?: number;     //检验项目编码拆分 x.y.z.t: 第三级别的z所对用的rowSpan=多少啊。
    //t?: number;   //正常都是一个行，若是自拆分项目的依据前面配置计算。
    //正式报告可能附加配置：
    //大标题列 ：这两个跨几个行的？  小标题列的自动，最小标题显示到了 最左边项目序号的位置。
    //【用处】tH?:sH?: 可以让自动省略标题的内置机制失效，用参数指定打印多少行的。但是非打印的显示就受这俩参数影响。
    //第1级 大标题：格式化版原始记录的高度限制；【对默认安排的修正】 若bH== -1：说明要强制显示大标题全部。 若bH== 0：说明要强制不显示大标题。
    bH?: number;
    //正式报告限制高度监督检验项目栏目的项目TD的高度：整数 几行文字。 对应第二级别titl。 浏览器需支持display: '-webkit-box'
    tH?: number;
    //正式报告限制高度监督检验项目栏目的项目TD的高度：整数 几行文字。 对应第三级别sub。
    sH?: number;
    //fH?: number;   第4级
}

/**独立路由的关联对应编辑视图 区块：每次添加最小项目的区域；
 * 整个isp项目的全列表:是RecordIspArea[]；
 * */
export interface RecordIspArea {
    //独立路由器对应的 编辑区域所映射的区域  tag==Action；
    //这里tag最好不一定就是x.y.z什么的，版本交替会有差异的。
    tag:string;
    //区块编辑器 标记用的
    name?:string;
    iclas?: string;
    //可以合并显示多个项目的编辑器等的记录； 【前提条件】必须按照数字大小顺序排序。可允许一次性路由到多个的分最底层的支项目。
    //同一个路由区块内的编辑区域：  多个项目聚合， 有些相同的可免去配置或者免于标题做显示。
    items: RecordInputConfig[];
}

export function crtRss(name:string,desc:string | React.ReactNode, label?: string): RecordSelfSplit {
    return {name, desc, label};
}
export function crtIof(span:RowSpanConfig|null,name: string,desc:string | React.ReactNode,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {span,name, desc, z, sub, y, titl, x, big} as RecordInputConfig;
}
/**要配置iclas类别情况的*/
export function crtIofC(span:RowSpanConfig|null,name: string,desc:string | React.ReactNode,iclas: string|undefined,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {span,name, desc,iclas, z, sub, y, titl, x, big} as RecordInputConfig;
}
/**能支持4列的版本  4个层级别的项目配置
 * */
export function crtIof4(span:RowSpanConfig|null,name: string,desc:string | React.ReactNode,t:number,four: string,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {span, t, four, name, desc, z, sub, y, titl, x, big} as RecordInputConfig;
}
/**若项目是自拆分的情况：crtSpan没必要做了： 约定一定会单独的crtSpan(1,1,1)这个路径；
 * 【注意约束】相应地： 上面相邻项目不允许把span配置跨越到了这个已经是自拆分项目的！。
 * */
export function crtIofRss(rss:RecordSelfSplit[],name: string,head:string | React.ReactNode,t?:number,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {rss, t, name, head, z, sub, y, titl, x, big} as RecordInputConfig;
}
/**若项目是自拆分的情况：crtSpan没必要做了： 约定一定会单独的crtSpan(1,1,1)这个路径；
 * 【注意约束】相应地： 上面相邻项目不允许把span配置跨越到了这个已经是自拆分项目的！。
 * 比crtIofRss多一个字段tail的配置；
 * */
export function crtIofRssT(rss:RecordSelfSplit[],name: string,head:string | React.ReactNode,tail:string | React.ReactNode,t?:number,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {rss, t, name, head,tail, z, sub, y, titl, x, big} as RecordInputConfig;
}
/**自拆分的情况， 可以配置iclas和span两个参数的版本。
 * 支持crtIof4类似的4个级别编码 t,。
 * crtSpan 自拆分的没法和其它项目合并span 不能融合Cell。
 * */
export function crtIofRssC(rss:RecordSelfSplit[],name: string,head:string | React.ReactNode,iclas: string|undefined,span:RowSpanConfig|null,t?:number,z?:number, sub?: string,y?:number, titl?:string,x?:number, big?: string): RecordInputConfig {
    return {rss, t, name, head,iclas, span, z, sub, y, titl, x, big} as RecordInputConfig;
}
export function pushItems(ari: RecordIspArea[],tag:string,item: RecordInputConfig[],iclas?: string,name?:string): RecordIspArea[] {
    ari.push({ tag, items: item, iclas: iclas??'C' ,name});
    return ari;
}
/** 第一个可选加参数 @param json 是可自由扩展的参数对象。必须是RowSpanConfig的规定属性；
 * */
export function crtSpan(x:number,y:number,z:number,json?:any): RowSpanConfig {
    return {x, y, z, ...json};
}



/**构建允许反方向 搜索tag no的Map对象。
 * @param noCB  特别项目编码的处理回调函数。
 * @param ItemArs  全体检验项目的配置表
 * */
export const useItemsMap= ({ ItemArs, noCB }
                               :{ ItemArs:RecordIspArea[], noCB?:(no:string,et:RecordInputConfig)=>string }
) => {
    const itemsMap =React.useMemo(() => {
        const itemsMap = new Map<string,string>();
        let ox: number=0;
        let oy: number=0;
        let oz: number=0;
        ItemArs?.forEach((area, b) => {
            area && area.items.forEach((et:RecordInputConfig, n:number) => {
                if(et){
                    let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                    if(et.t) nowColumns=4;
                    else if(et.z) nowColumns=3;
                    else if(et.y) nowColumns=2;
                    else if(et.x) nowColumns=1;
                    else throw new Error(`非法列设置m`);
                    ox=et.x??ox;
                    oy=et.y??oy;
                    oz=(et.z!)>0? et.z! : oz;
                    let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
                    //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
                    stno=noCB!(stno, et);
                    itemsMap.set(stno, area.tag);
                }
            });
        });
        return  itemsMap;
    }, [ItemArs,noCB]);

    return [itemsMap];
};


/**反方向搜索，补填未设置的遗传取值。
 * @param index  处于第几个大区的编辑区。
 * @param ceseq   当前这个编辑区块的内部的配置数组[]顺序序号。
 * @param atclass  针对的X。Y。Z.T 是第几个级别的
 * */
export const backItemsConfigSearch =(editAreasConf: RecordIspArea[], index:number, ceseq:number, atclass:number
) => {
    let id: number;
    let name: string;
    if(index===0 && ceseq===0)   return {id: 0, name: ''};
    let k=index;  //不能从自己 位置顺序的之下做反向搜索；只能小序号的。
    for(;k>=0;k--){
        let q=editAreasConf[k]?.items.length-1;
        if(k===index){
            if(ceseq>0)     q=ceseq-1;
            else   continue;
        }
        for(;q>=0;q--) {
            let et=editAreasConf[k]?.items[q] as RecordInputConfig;
            if(atclass===1){
                if((et.x!)>0){
                    return {id: et.x, name: et.big};
                }
            }
            else if(atclass===2){
                if((et.y!)>0){
                    return {id: et.y, name: et.titl};
                }
            }
            else if(atclass===3){
                if((et.z!)>0){
                    return {id: et.z, name: et.sub};
                }
            }
        }
    }
    // console.log("模板配置问题backItemsConfigSearch当前Config=",editAreasConf ,"k=",k,atclass,"index=",index,ceseq);
    throw new Error(`搜索不到模板配置问题`+atclass);
}


/**原始记录 就需要转换结果的： 若是正式报告的转换可能牵涉分项目的合并的意思。
 * action导航的每个配置项目区域：必须能够决定结论。【注意】不能跨区配置。
 * @return 单一一个项目{正式报告对应一个项目序号的； 原始记录也是关联着项目顺序表上最左边的序号}的 自动综合出来的判别结果。
 * @param itRes : 原始记录 或者 对于正式报告有些可能被转换后的。
 * 默认值 从'合格' 改成 '/'
 **/
export const itemResTransform = (itRes: any,config: RecordInputConfig) => {
    let result='／';
    if(config.rss?.length! >0){
        //起重监检的自拆分形式的项目：或者 是没有用检验项目栏目的x.y.z来分辨的场景，共用项目栏的取值编码串，结论需要合并为同一个目标位置的结论项目；
        config.rss?.forEach(({name}:RecordSelfSplit, n:number) => {
            if(name){
                const jilu= itRes[name];
                if(!jilu || jilu==='' || jilu==='△' || jilu==="✘"){
                    if(result!=='不合格')  result='不合格';
                }
                else if(jilu==="✔" || jilu==='▽'){
                    if(result==='／')   result='合格';
                }
                else if(jilu==='／'){
                }
                else
                    throw new Error(`自拆结论非法${jilu}`);
            }
        });
    }
    else{
        //一对一的情况 项目栏目的x .y .z 都是单独区分的话；
        const jilu= itRes[config.name];
        if(!jilu || jilu==='' || jilu==="✘" || jilu==='△' ){
            result='不合格';
        }
        else if(jilu==="✔" || jilu==='▽'){
            result='合格';
        }
        else if(jilu==='／'){
        }
        else
            throw new Error(`结论非法${jilu}`);
    }
    return  result;
}

/**原始记录 就需要转换结果的： 若是正式报告的转换可能牵涉分项目的合并的意思。
 * action导航的每个配置项目区域：必须能够决定结论。【注意】不能跨区配置。
 * @return 单一一个项目{正式报告对应一个项目序号的； 原始记录也是关联着项目顺序表上最左边的序号}的 自动综合出来的判别结果。
 * @param itRes : 【未被测量数据所定制显示而做修改的】初始原始记录 或者 对于正式报告有些可能被转换后的。
 * 默认值 从'合格' 改成 '/'
 * 支持相同项目栏目串的合并；
 * @param area 模板配置表的某个编辑区。
 * @param index 当前area区域中的哪一个项目 索引号。
 * @param alikec 几个项目行的归并到同一个结论的。默认：不会归并；   【正常的】不应该走这个机制。
 **/
export const itemResTransformAL = (itRes: any, area:RecordIspArea, index:number, alikec:number) => {
    const  config: RecordInputConfig = area.items[index];
    let result='／';
    if(config.rss?.length! >0){
        //起重监检的自拆分形式的项目：
        config.rss?.forEach(({name}:RecordSelfSplit, n:number) => {
            if(name){
                const jilu= itRes[name];
                if(!jilu || jilu==='' || jilu==='△' || jilu==="✘"){
                    if(result!=='不合格')  result='不合格';
                }
                else if(jilu==="✔" || jilu==='▽'){
                    if(result==='／')   result='合格';
                }
                else if(jilu==='／'){
                }
                else
                    throw new Error(`自拆结论非法${jilu}`);
            }
        });
        if(alikec>1)
            throw new Error(`自拆结论同时遇见了相同项目编码串的结论归并`);
    }
    else{
        if(alikec<=1){
            //一对一的情况 项目栏目的x .y .z 都是单独区分的话；
            const jilu= itRes[config.name];
            if(!jilu || jilu==='' || jilu==="✘" || jilu==='△' ){
                result='不合格';
            }
            else if(jilu==="✔" || jilu==='▽'){
                result='合格';
            }
            else if(jilu==='／'){
            }
            else
                throw new Error(`结论非法${jilu}`);
        }else {
            //【起重监检才有用的】没有用检验项目栏目的x.y.z来分辨的场景，共用项目栏的取值编码串，结论需要合并为同一个目标位置的结论项目；【其它】不应该用这个！
            for(let i=index; i<index+alikec; i++){
                const  config: RecordInputConfig = area.items[i];
                const {name}:RecordInputConfig =config;
                if(config && name){
                    const jilu= itRes[name];
                    if(!jilu || jilu==='' || jilu==='△' || jilu==="✘"){
                        if(result!=='不合格')  result='不合格';
                    }
                    else if(jilu==="✔" || jilu==='▽'){
                        if(result==='／')   result='合格';
                    }
                    else if(jilu==='／'){
                    }
                    else
                        throw new Error(`归并结论非法${jilu}`);
                }
            }
        }
    }
    return  result;
}

/**寻找不合格项目的全貌：x.y.z iClass 原因。
 * 依据记录来初始化 检验不合格项目[] ,
 * @param ItemArs 全体项目配置
 * @param options { noCB : 有些项目编码重复的需要额外做区分； }
 * 剔除不合格后端对象存储t:area.tag的要求，改为动态生成，破除依赖性，增强强强壮性，保证版本旧数据迁移升级无忧。
 * @return 直接给不合格列表用的对象
 * */
export const itemResultUnqualified =(orc: any, ItemArs:RecordIspArea[], options:{ noCB?:(no:string,et:RecordInputConfig)=>string }
) => {
    let failure: any[]=[];          //存储的是 标签 no:? 项目URL定位？ key还需要用于获取结果对象。
    let seq = 0;
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
        //配置已经敲定了有几行， td跨越几行 【前提】假设：一个结论对照这里一个items[?]; 随后一一对应一个不合格项目。
        area && area.items.forEach((et:RecordInputConfig, n:number) => {
            if(et){
                seq += 1;
                let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                if(et.t) nowColumns=4;
                else if(et.z) nowColumns=3;
                else if(et.y) nowColumns=2;
                else if(et.x) nowColumns=1;
                else throw new Error(`非法列设置u`+et.sub+"#y:"+et.y);
                big=et.big??big;        //像缓存一样 传递下去，按最左边序号顺序上托没改动的就是不变。
                ox=et.x??ox;
                oy=et.y??oy;
                titl=et.titl??titl;
                oz=(et.z!>0? et.z : oz)??0;
                sub=et.sub??sub;
                let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
                //【自拆分项目】必须在同一个区块都配置上；不能跨越２个编辑区。
                let res=itemResTransform(orc, et);
                if(res==='不合格'){
                    //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
                    stno=options.noCB!(stno, et);
                    failure.push({no:stno, c:et.iclas??area.iclas, b: orc[et.name+'_D']});
                }
            }
        });
    });
    // if(特殊替换)  特殊替换(orc, out);
    //返回  存储数据库的对象{no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; } + 前端的导航点击URL跳转编辑器关联的tag；
    return failure;
}

/**机电检验项目列表情形，寻找不合格项目的全貌：x.y.z iClass 原因。 自拆分项目 多个子项目有独立的原因字段情况，简单合并不合格原因说明。
 * 而且：若是自拆分项目的，多个子项目需要合并不合格内容。
 * 依据记录来初始化 检验不合格项目[] ,
 * @param ItemArs 全体项目配置
 * @param options { noCB : 有些项目编码重复的需要额外做区分； }
 * 剔除不合格后端对象存储t:area.tag的要求，改为动态生成，破除依赖性，增强强强壮性，保证版本旧数据迁移升级无忧。
 * @return 直接给不合格列表用的对象
 * */
export const itemResultUnqualifiedSsm =(orc: any, ItemArs:RecordIspArea[], options:{ noCB?:(no:string,et:RecordInputConfig)=>string }
) => {
    let failure: any[]=[];          //存储的是 标签 no:? 项目URL定位？ key还需要用于获取结果对象。
    let seq = 0;
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
        //配置已经敲定了有几行， td跨越几行 【前提】假设：一个结论对照这里一个items[?]; 随后一一对应一个不合格项目。
        area && area.items.forEach((et:RecordInputConfig, n:number) => {
            if(et){
                seq += 1;
                let nowColumns;    //有几列， 得依据范围内的全部项目来判定各个列到底会跨越几行的（自拆分项目会有多方=行的），x.y.z.t分别决定。
                if(et.t) nowColumns=4;
                else if(et.z) nowColumns=3;
                else if(et.y) nowColumns=2;
                else if(et.x) nowColumns=1;
                else throw new Error(`非法列设置u`+et.sub+"#y:"+et.y);
                big=et.big??big;        //像缓存一样 传递下去，按最左边序号顺序上托没改动的就是不变。
                ox=et.x??ox;
                oy=et.y??oy;
                titl=et.titl??titl;
                oz=(et.z!>0? et.z : oz)??0;
                sub=et.sub??sub;
                let stno= 1===nowColumns? `${ox}` : nowColumns===2? `${ox}.${oy}` : nowColumns===3? `${ox}.${oy}.${oz}` : `${ox}.${oy}.${oz}.${et.t}`;
                //【自拆分项目】必须在同一个区块都配置上；不能跨越２个编辑区。
                let res=itemResTransform(orc, et);
                if(res==='不合格'){
                    //【例外情况的】回调处理函数；stno特殊转换。 (stno，et:RecordInputConfig）=？ 如何从 stno关联到 t:area.tag
                    stno=options.noCB? options.noCB!(stno, et) : stno;
                    if(et.rss?.length! >0) {
                        let because='';
                        et.rss?.forEach(({name}:RecordSelfSplit, n:number) => {
                            if(name){
                                const jilu= orc[name];
                                if(!jilu || jilu==='' || jilu==='△' || jilu==="✘"){
                                    if( orc[name+'_D'] ){
                                        if(!because)  because=orc[name+'_D'];
                                        else because+='；'+orc[name+'_D'];
                                    }
                                }
                            }
                        });
                        failure.push({no:stno, c:et.iclas??area.iclas, b: because });
                    }
                    else
                        failure.push({no:stno, c:et.iclas??area.iclas, b: orc[et.name+'_D']});
                }
            }
        });
    });
    // if(特殊替换)  特殊替换(orc, out);
    //返回  存储数据库的对象{no: ts,c: itRes[ts].iClass, b: itRes[ts].fdesc}; } + 前端的导航点击URL跳转编辑器关联的tag；
    return failure;
}

