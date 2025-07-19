import * as React from "react";
import {JSX} from "react";
import {CCell,TableRow} from "@/components/flexible-table";

/**通用的模型，
 * 可能配置的每一行定义 [name, prefixCols[{t:'title1',s: 3,cs:-1}, {},], item, unit,[defaultColValue1, 2]] 形式；
* */
// 定义 prefixCols 中的列配置类型
type PrefixCol = {
    t?: string|any;  // 标题
    s?: number;  // 宽度
    cs?: number; // 列跨度
};
// 定义单行配置类型
export type OmniPref = [
    string,     // name
    PrefixCol[],  // prefixCols 数组
    string|any,     // item
    string,     // 单位 或 级别；
    string[],    //可能的默认值配置数组
] | [
    string,     // name
    PrefixCol[],  // prefixCols 数组
    string|any,     // item
    string,     // unit
] | [
    string,     // 存储名
    PrefixCol[],  //标题前缀多列的
    string|any,     //项目行主标签，项目名。
];


export interface OmnipotentPrefProps {
    orc: any;
    //基本配置： 只能是静态大小的。
    //每一行配置如下的 [name, prefixCols[{t:'title1',s: 2},,], item, unit,[default,2]] 形式；其中prefixCols可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';item=必须有的主标题描述。
    //第四个位置的字段unit看解析器自己决定用途（可能当作是"类别"）；第五个位置的字段也有配置：用作默认值的设置。
    //item必须配置：但可以相同的。
    config: any[][];
    /**剩下的各列展示：只能放在预定义设定列的后面的。
     orc
     name :存储字段名
     index: 序号；0开始， 后续新加的，配置第几个行【？？】最后多加一个参数的，旧的调用没有报错！
     */
    tailRender?: (orc: any, name:string,index:number,unit?:any) => React.ReactNode;
    /**拆分的序号，0开始的，1个变成++区域的显示输出
     * 序号必须要从小大大的排序, 且满足 >=0 && <config.length；
     * 拆分含 split[ptr]对应的哪一个， 也就是若split=[0]那代表是0行独区域，1行之后另外一个独立区域。大于序号的是下一个区域
     * */
    split?: number[];
    //显示单位列的内容！默认=没
    unitCel?:boolean;
    //最前面有没有显示序号的列。默认有的
    noNo?:boolean;
    //前面附加的标题栏目的列数: 默认值是=0;【相关性】参数config的第二个字段的配置的列数。
    pcols?: number;
    //极其特别的增加列：tailRender范围无法插入在前面的单元格的情况就有用；布局位置：在单位列的前面，但是在item主项目题目列的后面；
    //【凭name插入栏目】单位栏目列前面插入一个内容列：其存储名字是contc 这个列是在单位栏目列之前的布局; 而tailRender()只能放在单位列后面的布局栏目。
    contc?: string;
    //主项目栏目的列数: 默认值是=1;
    xmcol?: number;
    tag?: string;
    /**特殊版本采用的，项目拆分回调 若有设置itemRender那么 表格后半部分全部自定义的，此刻tailRender也就无效的。
     */
    itemRender?: (orc: any,name:string,index:number,item:any,xmcspan:number,unit:any,config:any[][]) => React.ReactNode;
    //避免打印的跨行做拆分；
    avpsp?:boolean;
    /**特殊版本采用的，
     * 判定若行索引 i IN cbIdx[]的，必须同时负责整个解析render就有可能有多行 tr 的。返回多行的node数组,第二个返回bool值表明是否需要做原来的render；
     * name被配置成空了， rowsCB需要手动纠正name。
     */
    rowsCB?: (orc: any,name:string,index:number,item:any,xmcspan:number,unit:any,config:any[][]) => [React.ReactNode[], boolean];
    //rowsCB必须配套 cbIdx
    cbIdx?: Map<number, undefined>;
}
/**
 * 常见配置的版本：通用的？ 前面有几个文本描述列的，后面是附加的编辑输入列布局。表格的行个数固定的。 也没有固定好的单位列；
 * 【参考】 /src/report/elevator/weituoDj/editMonit.tsx
 * @property pcols: 前缀部分的栏目对应实际列数，默认=0; 但是不包括item固定列（项目主题标题列的）；本参数影响大：项目前面最多几列的。
 * @property noNo 不显示序号列
 * 最多的列数外部注入和config配置一致性。搜寻大数；
 * 每一行配置如下的 [name,titl[{t:'',s: 3}],item,unit] 形式；
 * 其中   titl    可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';    item=必须有的主标题描述。
 *      最后的 unit 列的使用看解析器自己决定的没固定用途；
 * 注意配置 ['措', [{}], '采' ],和配置['措', [], '采' ],实际制表效果不一样的。
 * 例子2行 ['远程监', [{t:'远', s: 1},{t:'( 1 )',s: 1},{t:'开'}], '乘', 'mm'] ,        ['降温措', [], '采求。' ] ,
 * 但是注意：[{}], 对比 [] 的效果不一样的！后者实际上会丢弃继承性的，前者会承认其上面的已经有配置默认能传递下来。
 * @property split : 比如配置split:[0,1]可以支持把第二行做特别处理的，输出分成三个部分，您可舍弃第二行后手动拼凑。
 * @property unitCel: 是否有单位栏。 项目类别也可能看作单位栏目。在配置数组的第四个位置的,unit没有默认继承性，
* */
// export function useOmnipotentPref({orc, config, tailRender, split, contc,unitCel,noNo,pcols=0,xmcol=1,tag}: OmnipotentPrefProps
// ) {
//     let outnode = [];        //根据split[] 拆分多个的。默认一个
//     let morenode: JSX.Element[]=[];
//     let splitptr=0;
//     //手动拆分 影响 标题各列的span配置？
//     config.forEach(([name,titlps,item,unit]: any, i:number) => {
//         //遇到了拆分哪一个输赢序号了：
//         if(split && i>split[splitptr]){
//             outnode.push(morenode);
//             morenode=[];
//             splitptr++;
//         }
//         morenode.push(<TableRow key={i} id={tag? tag+'_'+i : undefined}>
//             {!noNo && <CCell>{i+1}</CCell>}
//
//             {pcols>0 && titlps?.length>0 && (new Array(titlps?.length).fill(null)).map((_,c:number) => {
//                 if( titlps[c]?.t ){           //最少配置 [{} ],
//                     if(c===titlps?.length-1){
//                         const leftCol=pcols-c;       //最后一格合并剩下的预设的标题列范围。
//                         return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1} colSpan={leftCol}>{titlps[c]?.t}</CCell>
//                     }
//                     else return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1}>{titlps[c]?.t}</CCell>
//                 }
//             })}
//
//             <CCell colSpan={titlps?.length>0? xmcol: xmcol+pcols}>{item}</CCell>
//
//             { contc &&  <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
//             }
//
//             { unitCel && <CCell>{unit??''}</CCell>
//             }
//             {tailRender!(orc, name,i,unit)}
//         </TableRow>);
//     });
//     outnode.push(morenode);
//     //不要用return [ outnode ]; 嵌套深
//     return [ ...outnode ];
// }

/**更特殊的配置：
 * 增加支持： cs列数可配置。 并且能支持最后一个前缀栏 cs= -1 配置来让渡空间。
 * titlps: [], 才是前面前缀全为虚空的，而不是[{}]。
 * @param split [] 拆分
 * unit必须每一行独立配，不做传递继承地。
 * */
// export function useOmnipotentPrefCs({orc, config, tailRender, split, contc,unitCel,noNo,pcols=0,xmcol=1,tag}: OmnipotentPrefProps
// ) {
//     let outnode = [];        //根据split[] 拆分多个的。默认一个
//     let morenode: JSX.Element[]=[];
//     let splitptr=0;
//     //手动拆分 影响 标题各列的span配置？
//     config.forEach(([name,titlps,item,unit]: any, i:number) => {
//         //遇到了拆分哪一个输赢序号了：
//         if(split && i>split[splitptr]){
//             outnode.push(morenode);
//             morenode=[];
//             splitptr++;
//         }
//         let xmcspan=titlps?.length>0? xmcol: xmcol+pcols;
//         if(titlps?.length>1 && titlps[titlps?.length-1]?.cs===-1)
//             xmcspan=xmcspan+1;       //前缀区域可让渡一个栏目空间给主项目栏。
//         morenode.push(<TableRow key={i} id={tag? tag+'_'+i : undefined}>
//             {!noNo && <CCell>{i+1}</CCell>}
//
//             {pcols>0 && titlps?.length>0 && (new Array(titlps?.length).fill(null)).map((_,c:number) => {
//                 //最少配置 [{} ],
//                 if( titlps[c]?.t || titlps[c]?.cs){
//                     if(c===titlps?.length-1){
//                         const leftCol=titlps[c]?.cs?  titlps[c]?.cs : (pcols-c);       //最后一格合并剩下的预设的标题列范围。
//                         if(titlps[c]?.cs===-1)  return null;
//                         else return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1} colSpan={leftCol}>{titlps[c]?.t}</CCell>
//                     }
//                     else return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1}>{titlps[c]?.t}</CCell>
//                 }
//             })}
//
//             <CCell colSpan={xmcspan}>{item}</CCell>
//
//             { contc &&  <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
//             }
//
//             { unitCel && <CCell>{unit??''}</CCell>
//             }
//             {tailRender!(orc, name,i,unit)}
//         </TableRow>);
//     });
//     outnode.push(morenode);
//     //不要用return [ outnode ]; 嵌套深
//     return [ ...outnode ];
// }

/**特殊版本：@单位栏目 在 项目栏目 前面位置的；unit单位列插入到titlps的尾巴后面面那一列的位置布局。
 * */
// export function useOmnipotentPrefUahit({orc, config, tailRender, split, contc,unitCel,noNo,pcols=0,xmcol=1}: OmnipotentPrefProps
// ) {
//     let outnode = [];        //根据split[] 拆分多个的。默认一个
//     let morenode: JSX.Element[]=[];
//     let splitptr=0;
//     //手动拆分 影响 标题各列的span配置？
//     config.forEach(([name,titlps,item,unit]: any, i:number) => {
//         //遇到了拆分哪一个输赢序号了：
//         if(split && i>split[splitptr]){
//             outnode.push(morenode);
//             morenode=[];
//             splitptr++;
//         }
//         morenode.push(<TableRow key={i}>
//             {!noNo && <CCell>{i+1}</CCell>}
//
//             {pcols>0 && titlps?.length>0 && (new Array(titlps?.length).fill(null)).map((_,c:number) => {
//                 if( titlps[c]?.t ){           //最少配置 [{} ],
//                     if(c===titlps?.length-1){
//                         const leftCol=pcols-c;       //最后一格合并剩下的预设的标题列范围。
//                         return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1} colSpan={leftCol}>{titlps[c]?.t}</CCell>
//                     }
//                     else return <CCell key={c} split={true} rowSpan={titlps[c]?.s??1}>{titlps[c]?.t}</CCell>
//                 }
//             })}
//
//             { unitCel && <CCell>{unit??'／'}</CCell>
//             }
//
//             <CCell colSpan={titlps?.length>0? xmcol: xmcol+pcols}>{item}</CCell>
//
//             { contc &&  <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
//             }
//
//             {tailRender!(orc, name,i,unit)}
//         </TableRow>);
//     });
//     outnode.push(morenode);
//     return [ ...outnode ];
// }

/**极为特殊版本：
 * 增加支持item项目特别拆分组合。
 * @property itemRender: 若有设置itemRender那么 表格后半部分全部自定义的，此刻tailRender也就无效的。
 * @property avpsp: 避免对前缀的跨行的栏目左打印跨页的拆分。
 * */
// export function useOmnipotentPrefItspe({orc, config, tailRender, split, contc,unitCel,noNo,pcols=0,xmcol=1,tag,itemRender,avpsp}: OmnipotentPrefProps
// ) {
//     let outnode = [];        //根据split[] 拆分多个的。默认一个
//     let morenode: JSX.Element[]=[];
//     let splitptr=0;
//     //手动拆分 影响 标题各列的span配置？
//     config.forEach(([name,titlps,item,unit]: any, i:number) => {
//         //遇到了拆分哪一个输赢序号了：
//         if(split && i>split[splitptr]){
//             outnode.push(morenode);
//             morenode=[];
//             splitptr++;
//         }
//         let xmcspan=titlps?.length>0? xmcol: xmcol+pcols;
//         if(titlps?.length>1 && titlps[titlps?.length-1]?.cs===-1)
//             xmcspan=xmcspan+1;       //前缀区域可让渡一个栏目空间给主项目栏。
//         morenode.push(<TableRow key={i} id={tag? tag+'_'+i : undefined}>
//             {!noNo && <CCell>{i+1}</CCell>}
//
//             {pcols>0 && titlps?.length>0 && (new Array(titlps?.length).fill(null)).map((_,c:number) => {
//                 //最少配置 [{} ],
//                 if( titlps[c]?.t || titlps[c]?.cs){
//                     if(c===titlps?.length-1){
//                         const leftCol=titlps[c]?.cs?  titlps[c]?.cs : (pcols-c);       //最后一格合并剩下的预设的标题列范围。
//                         if(titlps[c]?.cs===-1)  return null;
//                         else return <CCell key={c} split={!avpsp} rowSpan={titlps[c]?.s??1} colSpan={leftCol}>{titlps[c]?.t}</CCell>
//                     }
//                     else return <CCell key={c} split={!avpsp} rowSpan={titlps[c]?.s??1}>{titlps[c]?.t}</CCell>
//                 }
//             })}
//
//             { itemRender?
//                 itemRender(orc, name, i, item, xmcspan,unit,config)
//                 :
//                 <>
//                     <CCell colSpan={xmcspan}>{item}</CCell>
//                     { contc &&  <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
//                     }
//                     { unitCel && <CCell>{unit??''}</CCell>
//                     }
//                     {tailRender!(orc, name,i,unit)}
//                 </>
//             }
//         </TableRow>);
//     });
//     outnode.push(morenode);
//     //不要用return [ outnode ]; 嵌套深
//     return [ ...outnode ];
// }


/**超多定制能力的版本：把前缀部分移动开也可以单独的render多行的。
 * 增加支持item项目特别拆分组合。
 * @property itemRender: 若有设置itemRender那么 表格后半部分全部自定义的，此刻tailRender也就无效的。
 * @property avpsp: 避免对前缀的跨行的栏目做打印跨页的拆分。
 * */
export function useOmnipotentPref({orc, config, contc,unitCel,
                            split,noNo,avpsp,tag,
                            pcols=0,xmcol=1,
                           rowsCB,cbIdx, itemRender, tailRender}: OmnipotentPrefProps
) {
    let outnode = [];        //根据split[] 拆分多个的。默认一个
    let morenode: JSX.Element[]=[];
    let splitptr=0;
    //手动拆分 影响 标题各列的span配置？
    config.forEach(([name,titlps,item,unit,_dfvs]: any, i:number) => {
        //遇到了拆分哪一个输赢序号了：
        if(split && i>split[splitptr]){
            outnode.push(morenode);
            morenode=[];
            splitptr++;
        }
        let xmcspan=titlps?.length>0? xmcol: xmcol+pcols;
        if(titlps?.length>1 && titlps[titlps?.length-1]?.cs===-1)
            xmcspan=xmcspan+1;       //前缀区域可让渡一个栏目空间给主项目栏。
        let needitmr=true;      //可能被rowsCB替换掉了
        if(rowsCB && cbIdx!.has(i)){
                    //这里允许客户定制返回多行 TableRow 甚至嵌套表格div;
            const [userNodes, addmd]=rowsCB(orc, name, i, item, xmcspan,unit,config);
            needitmr=addmd;
                    // Object.assign(userNodes,{ key: 'C'+i });
            morenode.push(userNodes as  any);
        }
        if(needitmr){
            morenode.push(<TableRow key={i} id={tag? tag+'_'+i : undefined}>
                {!noNo && <CCell>{i+1}</CCell>}

                {pcols>0 && titlps?.length>0 && (new Array(titlps?.length).fill(null)).map((_,c:number) => {
                    //最少配置 [{} ],
                    if( titlps[c]?.t || titlps[c]?.cs){
                        if(c===titlps?.length-1){
                            const leftCol=titlps[c]?.cs?  titlps[c]?.cs : (pcols-c);       //最后一格合并剩下的预设的标题列范围。
                            if(titlps[c]?.cs===-1)  return null;
                            else return <CCell key={c} split={!avpsp} rowSpan={titlps[c]?.s??1} colSpan={leftCol}>{titlps[c]?.t}</CCell>
                        }
                        else return <CCell key={c} split={!avpsp} rowSpan={titlps[c]?.s??1}>{titlps[c]?.t}</CCell>
                    }
                })}

                { itemRender?
                    itemRender(orc, name, i, item, xmcspan,unit,config)
                    :
                    <>
                        <CCell colSpan={xmcspan}>{item}</CCell>
                        { contc &&  <CCell>{orc?.[name]?.[contc]??'／'}</CCell>
                        }
                        { unitCel && <CCell>{unit??''}</CCell>
                        }
                        {tailRender!(orc, name,i,unit)}
                    </>
                }
            </TableRow>);
        }
    });
    outnode.push(morenode);
    //不要用return [ outnode ]; 嵌套深
    return [ ...outnode ];
}

export interface OmnipotentPrefTitleProps {
    //每一行配置如下的 [name, prefixCols[{t:'title1',s: 2},,], item, unit] 形式；其中prefixCols可变的长度。t是文本,s是跨越几行的TD数默认=1。unit默认='';item=必须有的主标题描述。
    config: any[][];
    baseSeq?: number;
}
/**新版，但要求设置s参数的，老版本默认无rowSpan的配置就不行了；  # 旧版本用useOmnipotentPrefTitle1R{不需要考虑加s参数}；#
 * 标题叙述的合成 :这一块代码冗余大，还是再简化好了； 配套useOmnipotentPref的；
 * 显示效果类似。 部分参数可定制；
 * 默认的span ==1;      要注意：t=null ='' 不同于 undefined 的处理的。   支持null缩减
 * @return 返回 node数组,顺序和config配置一致
 * 单位栏目[, _2]没有处理:
 * 【注意】若多个前缀的，非最后一个前缀的 s参数不能省略，可加,s:1 ；
* */
export function useOmniPrefTitle({config, baseSeq=0}: OmnipotentPrefTitleProps
) {
    let morenode: JSX.Element[]=[];
    let bsLeft=0,sLeft=0,tLeft=0;
    let bsCirc='',sCirc='',tCirc='';
    //前缀可支持三个附加列配置的；
    config.forEach(([_1, titlps,item, _2]: any, i:number) => {
        const [{t: title, s:bspan}, more2, more3] = titlps?.length > 0 ? titlps : ([{}] as any);
        const {t: title2, s:span=1} = more2 || {};
        const {t: title3, s:tspan=1} = more3 || {};
        if(tspan>0){
            tLeft=tspan;
            tCirc= title3!==undefined? title3:tCirc;
        }else if(tLeft>0){
            tLeft--;
            if(null===title3)   tCirc=title3;
        }
        if(span>0){
            sLeft=span;
            sCirc= title2!==undefined? title2:sCirc;
        }else if(sLeft>0){
            sLeft--;
            //支持这样的 [{},{t:null}],  后续几个免去显示太长的标题。
            if(null===title2)   sCirc=title2;
        }
        if(bspan>0){
            bsLeft=bspan;
            bsCirc= title!==undefined? title:bsCirc;
        }else if(bsLeft>0){
            bsLeft--;
            if(null===title)   bsCirc=title;
        }
        const tlNode=<span>项目{i + 1+baseSeq} {bsLeft>0? bsCirc:''} - {sLeft>0 && sCirc? sCirc:''} {'>'} {tLeft>0 && tCirc? (tCirc+' >'):''}
            <span className={"font-bold"}>{item}</span>  ：</span>;

        morenode.push(tlNode);
    });
    return morenode;
}

/**这个是较老版本的 useOmnipotentPrefTitle，对比修新版的： 默认都是1行的rowSpan;这样配置数组无需要配置s参数的;
 * */
// export function useOmnipotentPrefTitle1R({config,}: OmnipotentPrefTitleProps
// ) {
//     let morenode: JSX.Element[]=[];
//     let bsLeft=0,sLeft=0,tLeft=0;
//     let bsCirc='',sCirc='',tCirc='';
//     //前缀可支持三个附加列配置的；
//     config.forEach(([_1, titlps,item, _2]: any, i:number) => {
//         const [{t: title, s:bspan=1}, more2, more3] = titlps?.length > 0 ? titlps : ([{}] as any);
//         //默认的span ==1;      要注意：t=null ='' 不同于 undefined 的处理的。   支持null缩减
//         const {t: title2, s:span=1} = more2 || {};
//         const {t: title3, s:tspan=1} = more3 || {};
//         if(tspan>0){
//             tLeft=tspan;
//             tCirc= title3!==undefined? title3:tCirc;
//         }else if(tLeft>0){
//             tLeft--;
//         }
//         if(span>0){
//             sLeft=span;
//             sCirc= title2!==undefined? title2:sCirc;
//         }else if(sLeft>0){
//             sLeft--;
//         }
//         if(bspan>0){
//             bsLeft=bspan;
//             bsCirc= title!==undefined? title:bsCirc;
//         }else if(bsLeft>0){
//             bsLeft--;
//         }
//         const tlNode=<Text>项目{i + 1} {bsLeft>0? bsCirc:''} - {sLeft>0 && sCirc? sCirc:''} {'>'} {tLeft>0 && tCirc? (tCirc+' >'):''}
//             <Text css={{fontWeight: 800}}>{item}</Text>  ：</Text>;
//
//         morenode.push(tlNode);
//     });
//     return morenode;
// }

/**标题区域文字太多的：不需要递增的序号。
 * 布局样式参照 src/report/common/ActionMapItem.tsx
 * */
// export function useOmnipotentPrefTitBar({config, baseSeq=0}: OmnipotentPrefTitleProps
// ) {
//     let morenode: JSX.Element[]=[];
//     let bsLeft=0,sLeft=0,tLeft=0;
//     let bsCirc='',sCirc='',tCirc='';
//     //前缀可支持三个附加列配置的；
//     config.forEach(([_1, titlps,item, _2]: any, i:number) => {
//         const [{t: title, s:bspan}, more2, more3] = titlps?.length > 0 ? titlps : ([{}] as any);
//         const {t: title2, s:span=1} = more2 || {};
//         const {t: title3, s:tspan=1} = more3 || {};
//         if(tspan>0){
//             tLeft=tspan;
//             tCirc= title3!==undefined? title3:tCirc;
//         }else if(tLeft>0){
//             tLeft--;
//             if(null===title3)   tCirc=title3;
//         }
//         if(span>0){
//             sLeft=span;
//             sCirc= title2!==undefined? title2:sCirc;
//         }else if(sLeft>0){
//             sLeft--;
//             //支持这样的 [{},{t:null}],  后续几个免去显示太长的标题。
//             if(null===title2)   sCirc=title2;
//         }
//         if(bspan>0){
//             bsLeft=bspan;
//             bsCirc= title!==undefined? title:bsCirc;
//         }else if(bsLeft>0){
//             bsLeft--;
//             if(null===title)   bsCirc=title;
//         }
//         const tlNode=<div key={i} css={{marginTop: '1rem',width:'100%'}}>
//             <div css={{display: 'flex', justifyContent: 'space-around' }}>
//                 <Text variant={'subtitle'}>{`${i+1+baseSeq}`}</Text>
//                 <div css={{display: 'flex', justifyContent: 'space-around',flex:'auto'}}>
//                     <Text variant="h6">{bsLeft>0? bsCirc:''}</Text>
//                     <Text variant="h6" css={{marginLeft: '0.5rem'}}>{sLeft>0 && sCirc? sCirc:''}</Text>
//                     <Text variant="h6" css={{marginLeft: '0.5rem'}}>{tLeft>0 && tCirc? tCirc:''}</Text>
//                 </div>
//             </div>
//             { typeof item === "string"?
//                 <Text css={{textAlign:'center',display:'block'}}>{item}</Text>
//                 :
//                 <div css={{ display: 'flex', justifyContent: 'center' }}>{item}</div>
//             }
//             <hr/>
//         </div>;
//         morenode.push(tlNode);
//     });
//     return morenode;
// }
