"use client"
import * as React from "react"
import {Button} from "@/components/ui/button"
// import {useWindowSize} from "@/hooks/use-window-size"
// import {cn} from "@/lib/utils"
// import {useMeasure} from "@/hooks/use-measure"
// import {useItemInputControl} from "../common/base";
import {FormControl, FormField, FormItem, FormLabel, FormMessage, Input} from "@/components/ui";
import {BlobInputList, SuffixInput,} from "@/components/chub";
import type {UseFormReturn} from "react-hook-form";
import {Each_ZdSetting} from "@/report/hook/use-table-edit";


//通用render编辑器回调类型: 因为后面修改的只好把参数field放在后面添加，避免报错太多了。
//这里第三个field参数：实际就是表格的嵌套属性字段。而inp,setInp实际对应通用表格组件内部提供的obj,setObj的状态管理变量函数：而不是报告编辑区对话框层面的inp,setInp。混淆。
/**
 *@param park?: 嵌套字段情况的 湖北存储名。
 * */
export declare type InputRenderCallback = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>,field:string,park?:string) => React.ReactNode;
// interface RenderProps {
//     entry: IntersectionObserverEntry | undefined;
//     ref: React.RefObject<any> | ((node?: Element | null) => void);
// }

//通道 厚度分区（mm） :? 能不能抽象和复用“通用多行表输入”的组件？  通道表; 二维数组对象表达法。

interface Props {
    ref: React.Ref<any>;
    //接受par输入的过滤器，回调 过滤有用数据。
    //filter: (par: any) => {};
    //可重复加的报告实例id
    redId?: string;
    show?: boolean;
    alone: boolean;
    nestMd?: string;
    //表格的基本配置  多字段
    config: Each_ZdSetting[];
    /**存储的json表*/
    table: string;
    /**LineColumn 自适应 最大放下编辑框 列数： >=2 and <=5 */
    column?: number;
    /**LineColumn 自适应 适应内容宽度来拆分几个排的列 */
    breaks?: number[];
    label: string;
    /**自定义开头 DOM */
    headview: React.ReactNode;
    /**自定义尾部 DOM */
    tailview?: React.ReactNode;
    /**缺省表赋值，初始化用
     * default 是js的关键字 不能用作变量名
     * */
    defaultV?: any[];
}


//36个预定分隔符：代替表格的边线：不被文本录入用，尽量宽度小。
const TabSplChars=['◆','╏','│','┋','╁','↑','╀','●','║','◇','┃','┩','¤','┪','╔','╝','Θ','∣','╚','╗','╡','┇','╞','╘','╕','┊','╬','┾','╮','╉','◎','♂','╰','┠','↓','╠'];

/**因为异型表格 需要的render扩展配置： 对编辑器配置的对等关联性质扩充，来丰富报告或原始记录的打印的变通。
 * */
export type HeterogeneousColSpan =[row:number, column: number];
export type HeterogeneousColumn =[name:string, span: HeterogeneousColSpan];
// export type HeterogeneousSpan = (inp: any, setInp: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode;
export type Heterogeneous= {
    //表题名称替换 默认的。
    n?: string;
    //列 Span 替换默认值。【注意】具体的表格不应该使用这里预留的字段，假若所指代意思不一样的话。 "n""c""1""2"预留的通用表格对象属性。
    c?: number;
    //数值作为标签=对象key的: 1=前面追加第一个列， 2=前面追加第二个列， 3=...; 附加几个表格列位置的定义。  //举例,属性 2:['斜梯',[7,1]] as HeterogeneousColumn
    [key: number]: HeterogeneousColumn;
}

/**二维表的 正常给报告上面做显示的样子，没有序号栏目
 * @param table 表名
 * @param config 表的模型配置
 * @param orc  原始记录或报告json
 * @param least  内容区域若为空的是否保留空白行的。
 * @param slash  需斜杠替换空白的。
 * */
// export function useRepTableViewer(config: Each_ZdSetting[], table: string, orc: any, least?: boolean, slash?: boolean)
// {
//     //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
//     const titleRow=<TableRow>
//         {config.map(([title,_2,_1], i:number) => {
//             return <CCell key={i}>{title}</CCell>;
//         }) }
//     </TableRow>;
//     const content=orc?.[table];
//     const rowsMore=<>
//         {!content && least &&
//            <TableRow>
//                 {config.map(([title,aName,_1], c:number) => {
//                     return <CCell key={c}>{slash && '／'}</CCell>;
//                 }) }
//            </TableRow>
//         }
//         {content?.map((o: any, i:number) => {
//             return (<TableRow key={i}>
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
//                     }) }
//                 </TableRow>
//             );
//         }) }
//     </>
//     return  [titleRow, rowsMore];
// }

//类似useRepTableViewer 直接注入表格content=orc?.[table];
// export function useContentTableViewer(config: Each_ZdSetting[],content: any[], least?: boolean, slash?: boolean)
// {
//     //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
//     const titleRow=<TableRow>
//         {config.map(([title,_2,_1], i:number) => {
//             return <CCell key={i}>{title}</CCell>;
//         }) }
//     </TableRow>;
//     const rowsMore=<>
//         {!content && least &&
//             <TableRow>
//                 {config.map(([title,aName,_1], c:number) => {
//                     return <CCell key={c}>{slash && '／'}</CCell>;
//                 }) }
//             </TableRow>
//         }
//         {content?.map((o: any, i:number) => {
//             return (<TableRow key={i}>
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
//                     }) }
//                 </TableRow>
//             );
//         }) }
//     </>
//     return  [titleRow, rowsMore];
// }

/**二维表的 正常给报告, 【左边+右边】一行显示出2排的布局。有些字段少的表，一行左右的分2半地安排2个表区表头的。 和仪器表类似但它只显示出部分config列出字段。
 * @param table 表名
 * @param config 表的模型配置
 * @param orc  原始记录或报告json
 * @param least  内容区域若为空的是否保留空白行的。
 * @param slash  需斜杠替换空白的。
 * @param nhead  不用输出这个表头。
 * @param seqCl  生成"序号"列，默认=没有。 直接注入 序号的node对象；
 * @return [, titleRow] ,后面titleRow：很多情形不采用这个表头输出。
 * */
// export function useRep2hTableViewer(config: Each_ZdSetting[], table: string, orc: any,nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
// {
//     const content=orc?.[table];
//     const sizeData=content?.length || 0;
//     let rowsMore=[];
//     if(0===sizeData && least){
//         rowsMore.push(<TableRow key={1}>
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//         </TableRow>);
//     }else if(sizeData>0){
//         content?.forEach((o: any, i:number) => {
//             if(1===i%2) return null;
//             const ro=content?.[i+1];
//             rowsMore.push(<TableRow key={i}>
//                     {seqCl && <CCell>{i+1}</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
//                     }) }
//
//                     {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
//                     }) }
//                 </TableRow>
//             );
//         })
//     }
//     //旧的方式：外部可操作性较差，不好修改Node
//     // const rowsMore=<>
//     //     {0===sizeData && least &&
//     //     }
//     //     {sizeData>0 &&  }
//     // </>
//     if(nhead){
//         return  [rowsMore];
//     }
//     else{
//         //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
//         const titleRow=<TableRow>
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//         </TableRow>;
//         return  [rowsMore, titleRow];
//     }
// }

//对比useRep2hTableViewer，采用content注入：适应不直接从orc读取的表格。
// export function useContent2hTableViewer(config: Each_ZdSetting[], content: any[],nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
// {
//     const sizeData=content?.length || 0;
//     let rowsMore=[];
//     if(0===sizeData && least){
//         rowsMore.push(<TableRow key={1}>
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//         </TableRow>);
//     }else if(sizeData>0){
//         content?.forEach((o: any, i:number) => {
//             if(1===i%2) return null;
//             const ro=content?.[i+1];
//             rowsMore.push(<TableRow key={i}>
//                     {seqCl && <CCell>{i+1}</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
//                     }) }
//
//                     {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
//                     }) }
//                 </TableRow>
//             );
//         })
//     }
//     if(nhead){
//         return  [rowsMore];
//     }
//     else{
//         //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
//         const titleRow=<TableRow>
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//         </TableRow>;
//         return  [rowsMore, titleRow];
//     }
// }

interface useRep2hTableViewerXProps {
    config: Each_ZdSetting[];
    table: string;
    orc: any;
    nhead?: boolean;
    least?: boolean;
    slash?: boolean,
    seqCl?: any;
    //【规定】字典类型的 类似于{ 0:  <CCell rowSpan={3}>性能参数</CCell>, } 说明附加的列的第几行在第一列的位置去插入的；插入位置固定在第一列的。
    //但是 不会插入到titleRow表头的栏；
    embed?: any;
}
/**对 useRep2hTableViewer 扩展的，支持前面配设扩展列，只在第一列位置插入的；rowSpan=是整个表的行数。 但不影响标题区。
 * */
// export const useRep2hTableViewerX= ({config, table, orc,nhead=true, least=true, slash=true,seqCl,embed} : useRep2hTableViewerXProps
// ) => {
//     const content=orc?.[table];
//     const sizeData=content?.length || 0;
//     let rowsMore=[];
//     if(0===sizeData && least){
//         rowsMore.push(<TableRow key={1}>
//             {embed && <CCell>{embed}</CCell> }
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//             {seqCl && <CCell>/</CCell>}
//             {config.map(([title,aName,_1], c:number) => {
//                 return <CCell key={c}>{slash&&'／'}</CCell>;
//             }) }
//         </TableRow>);
//     }else if(sizeData>0){
//         const rowFspan=(content?.length +1)/2;
//         content?.forEach((o: any, i:number) => {
//             if(1===i%2) return null;
//             const ro=content?.[i+1];
//             rowsMore.push(<TableRow key={i}>
//                     {embed && 0===i && <CCell  split  rowSpan={rowFspan}  key={'H'+i}>{embed}</CCell> }
//                     {seqCl && <CCell>{i+1}</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
//                     }) }
//
//                     {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
//                     }) }
//                 </TableRow>
//             );
//         })
//     }
//     //【特别注意】 这两个return的接收差异有问题： 若出现： key报错
//     if(nhead){
//         return  [rowsMore, null];
//     }
//     else{
//         //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
//         const titleRow=<TableRow>
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//             {seqCl && <CCell>{seqCl}</CCell>
//             }
//             {config.map(([title,_2,_1], i:number) => {
//                 return <CCell key={i}>{title}</CCell>;
//             }) }
//         </TableRow>;
//         return  [rowsMore, titleRow];
//     }
// };

/**支持更多的，类似useContent2hTableViewer是针对2排的。这个可以随意多排的。
@param blocks: 几个排的布局。默认=1； 【局限性】排固定数； #不允许动态调整的！
 支持park? 嵌套字段。
* */
// export function useRaftTableViewer(config: Each_ZdSetting[], content: any[], blocks:number=1, nhead?: boolean, least?: boolean, slash?: boolean, seqCl?: any)
// {
//     const sizeData=content?.length || 0;
//     let rowsMore=[];
//     /*不能用：
//      for (let i = 0; i < blocks; i++) {
//                  rowsMore.push(<TableRow key={1}>  </TableRow>; }
//     * */
//     if(0===sizeData && least){
//         rowsMore.push(<TableRow key={1}>
//             {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                 return <React.Fragment key={b}>
//                     {seqCl && <CCell>/</CCell>}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{slash&&'／'}</CCell>;
//                     }) }
//                 </React.Fragment>;
//             }) }
//         </TableRow>);
//     }else if(sizeData>0){
//         content?.forEach((o: any, i:number) => {
//             if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
//             //只能第一个区块/排的： 构造一组【blocks个对象】
//             if(0!==i%blocks)
//                 return null;
//             rowsMore.push(<TableRow key={i}>
//                 {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                     const ro=content?.[i+b];
//                     return <React.Fragment key={b}>
//                         {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
//                         {config.map(([title,aName,_wid, _cb, park], c:number) => {
//                             const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
//                             return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
//                         }) }
//                     </React.Fragment>;
//                 }) }
//                 </TableRow>
//             );
//         })
//     }
//     if(nhead){
//         return  [rowsMore];
//     }
//     else{
//         const titleRow=<TableRow>
//             {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                 return <React.Fragment key={b}>
//                     {seqCl && <CCell>{seqCl}</CCell>
//                     }
//                     {config.map(([title,_tag,_wpx], i:number) => {
//                         return <CCell key={i}>{title}</CCell>;
//                     }) }
//                 </React.Fragment>;
//             }) }
//         </TableRow>;
//         return  [rowsMore, titleRow];
//     }
// }

interface RaftTableViewerXProps {
    config: Each_ZdSetting[],
    content: any[],
    blocks?: number,
    nhead?: boolean,
    least?: boolean,
    slash?: boolean,
    seqCl?: any,
    //在第一行的左边插入dom; # 没考虑 blocks>1 情形的mergeL/R的。
    mergeL?: React.ReactNode,
    //在第一行的右边插入dom
    mergeR?: React.ReactNode,
}
/**非独立编辑器形式； 不支持pr：“”配置方式掺入列。
 * 编辑器三排模式的：类似概要的编辑器和报告： 【缺点】不考虑前缀的配置；
 * 类似于 ThreeConfigRaft 只有内容。    @ 给useThreeRaftSurveyTbl配套的， 可支持3排编辑器。
 * @param config  范式模型配置; 基础配置统一为[desc, name, cb] 3元组合的。
 * */
// export const useRaftTableViewerX= ({config,content,blocks=1,nhead=true,least=true,slash=true,
//                                        seqCl,mergeL,mergeR}  :RaftTableViewerXProps
// ) => {
//     const sizeData=content?.length || 0;
//     let rowsMore=[];
//     if(0===sizeData && least){
//         rowsMore.push(<TableRow key={1}>
//             {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                 return <React.Fragment key={b}>
//                     {seqCl && <CCell>/</CCell>}
//                     {mergeL}
//                     {config.map(([title,aName,_1], c:number) => {
//                         return <CCell key={c}>{slash&&'／'}</CCell>;
//                     }) }
//                     {mergeR}
//                 </React.Fragment>;
//             }) }
//         </TableRow>);
//     }else if(sizeData>0){
//         content?.forEach((o: any, i:number) => {
//             if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
//             //只能第一个区块/排的： 构造一组【blocks个对象】
//             if(0!==i%blocks)
//                 return null;
//             rowsMore.push(<TableRow key={i}>
//                     {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                         const ro=content?.[i+b];
//                         return <React.Fragment key={b}>
//                             {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
//                             {0===i && mergeL}
//                             {config.map(([title,aName,_wid, _cb, park], c:number) => {
//                                 const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
//                                 return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
//                             }) }
//                             {0===i && mergeR}
//                         </React.Fragment>;
//                     }) }
//                 </TableRow>
//             );
//         })
//     }
//     if(nhead){
//         return  [rowsMore];
//     }
//     else{
//         //没考虑 mergeL / R的。
//         const titleRow=<TableRow>
//             {(new Array(blocks)).fill(null).map(( _,  b:number) => {
//                 return <React.Fragment key={b}>
//                     {seqCl && <CCell>{seqCl}</CCell>
//                     }
//                     {config.map(([title,_tag,_wpx], i:number) => {
//                         return <CCell key={i}>{title}</CCell>;
//                     }) }
//                 </React.Fragment>;
//             }) }
//         </TableRow>;
//         return  [rowsMore, titleRow];
//     }
// }


/**表格编辑项目的特别回调，
 * */
// export const tabIBlistCb=(datalist:string[],rows?:number)=>{
//     return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
//         return  <BlobInputList value={obj?.[tag] || ''} rows={rows??2} datalist={datalist}
//                                onListChange={v => setObj({...obj, [tag]: v || undefined}) } />
//     }
// }
// //表格录入日期：类似高阶函数
// export const tabIDateCb=()=>{
//     return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
//         return  <Input value={obj?.[tag] || ''}  type='date'
//                         onChange={e => setObj({ ...obj, [tag]: e.currentTarget.value}) } />
//     }
// }

//【特殊布局】放大编辑框：
// export const tabTextAreCb=(rows?:number)=>{
//     return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=> {
//         return <div css={{ "div:has(&).InputLine__Head": {display: 'block'} }}>
//             <Textarea value={obj?.[tag] || ''} rows={rows ?? 2}
//                       onChange={e => setObj({...obj, [tag]: e.currentTarget.value})}/>
//         </div>
//     }
// }
/**签名 需要user context
* */
// export const tabIUserSign = (user: any) => {
//     return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string, park: string) => {
//         //存储上多一层嵌套对象 inp?.[name]?.sgm?.name  通常value={obj?.[tag] || ''}
//         return <div>
//             签字人：{obj?.[park]?.name || ''}。<br/>
//             {obj?.[park]?.username === user?.username ?
//                 <Button intent="warning"
//                         onPress={async () => {
//                             // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', undefined);
//                             await setObj({...obj, [park]: undefined});
//                             // await objNestSet(tag,'sgm', undefined, obj,setObj);
//                         }}
//                 >去除签名</Button>
//                 :
//                 <Button intent="warning"
//                         onPress={async () => {
//                             const me = {username: user?.username, name: user?.person?.name};
//                             // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', me);
//                             await setObj({...obj, [park]: me});
//                             // await objNestSet(tag,'sgm', me, obj,setObj);
//                         }}
//                 >签名</Button>
//             }
//         </div>
//     }
// }

//生成器@Genrenator  高阶函数 ：有单位的input
// export const tabSuffixCb=(unit:string,atunit?:string)=>{
//     return (form: UseFormReturn<any, any, any>, title:any, tag: string, park?:string) => {
//         const unitColVal = form.watch(`.${atunit}`)
//         return <FormField  control={form.control} name={`${park}.${tag}`}
//                           render={({ field }) => (
//                               <FormItem className="pt-2 w-full break-inside-avoid">
//                                   <FormLabel className="select-text">{title}</FormLabel>
//                                   <FormControl className="w-full">
//                                       <SuffixInput  unit={unit}  {...field} />
//                                   </FormControl>
//                                   <FormMessage />
//                               </FormItem>
//                           )}
//         />
//     }
// }
