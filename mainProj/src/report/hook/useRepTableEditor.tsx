/** @jsxImportSource @emotion/react */
"use client"

import * as React from "react"
import {Button} from "@/components/ui/button"
import {useWindowSize} from "@/hooks/use-window-size"
import {cn} from "@/lib/utils"
import {useMeasure} from "@/hooks/use-measure"
import {CCell, TableRow,} from "customize-easy-ui-component";
import {InspectRecordLayout, useItemInputControl} from "../common/base";
import {
    Card,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input
} from "@/components/ui";
import {BlobInputList, FormSelectField, MemoDateInput, MemoDatesInput, SuffixInput,} from "@/components/chub";
import type {UseFormReturn} from "react-hook-form";
import {Each_ZdSetting} from "@/report/hook/use-table-editor";


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
/**@Deprecated
 * 淘汰！
 * 用了<DdMenu icon替代了<Popover>做菜单后会好点：菜单版面紧凑而且易于扩展。
 * */
export function useRepTableEditor({ ref, nestMd, show, alone, redId, config, table,column,breaks,label,
                                      headview,tailview,defaultV}
    : Props
) {
    const getInpFilter = React.useCallback((par: any) => {
        const  grid= par?.[table];   //动态字段table的提取。
        if(!grid)   return { [table]: defaultV };
        else return { [table]: grid };
    }, [table, defaultV]);
    const {inp, setInp} = useItemInputControl({ ref });
    const [renderInner]=useTableEditor({config, table, column, breaks,
                     inp, setInp,  headview, tailview, defaultV});
    const render=<InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter}  show={show}  redId={redId} nestMd={nestMd}
                                 alone={alone}  label={label}>
        {renderInner}
    </InspectRecordLayout>;
  return { render };
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
/**
 * @Deprecated
 * 针对性检验项目栏目几个列Cell的修订：  附身列的定义；
 * */
export const HeterogeneousRender=(title:string, setting: Heterogeneous, defColumn:number
)=> {
    //针对的“检验项目栏目”：最多支持这一行的位置允许一次性扩充出4列；
    const {n:name, c:column, 1:col1, 2:col2, 3:col3,4:col4}=setting;
    return <>
        {col1 && <CCell rowSpan={col1[1][0]} colSpan={col1[1][1]}>{col1[0]}</CCell>}
        {col2 && <CCell rowSpan={col2[1][0]} colSpan={col2[1][1]}>{col2[0]}</CCell>}
        {col3 && <CCell rowSpan={col3[1][0]} colSpan={col3[1][1]}>{col3[0]}</CCell>}
        {col4 && <CCell rowSpan={col4[1][0]} colSpan={col4[1][1]}>{col4[0]}</CCell>}
        <CCell colSpan={column??defColumn} css={{wordBreak: 'break-all'}}>{name??title}</CCell>
    </>;
}
/**二维表的 正常给报告上面做显示的样子，没有序号栏目
 * @param table 表名
 * @param config 表的模型配置
 * @param orc  原始记录或报告json
 * @param least  内容区域若为空的是否保留空白行的。
 * @param slash  需斜杠替换空白的。
 * */
export function useRepTableViewer(config: Each_ZdSetting[], table: string, orc: any, least?: boolean, slash?: boolean)
{
    //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
    const titleRow=<TableRow>
        {config.map(([title,_2,_1], i:number) => {
            return <CCell key={i}>{title}</CCell>;
        }) }
    </TableRow>;
    const content=orc?.[table];
    const rowsMore=<>
        {!content && least &&
           <TableRow>
                {config.map(([title,aName,_1], c:number) => {
                    return <CCell key={c}>{slash && '／'}</CCell>;
                }) }
           </TableRow>
        }
        {content?.map((o: any, i:number) => {
            return (<TableRow key={i}>
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        }) }
    </>
    return  [titleRow, rowsMore];
}
//类似useRepTableViewer 直接注入表格content=orc?.[table];
export function useContentTableViewer(config: Each_ZdSetting[],content: any[], least?: boolean, slash?: boolean)
{
    //如果表头是部分有两行的情况？： 不好配置，或只生成最详细的第二行，第一行手动生成的？ rowSpan只能往前往下衍生的！！配置第一行的某些字段要归并的，那样第二行也有了。【太麻烦】；
    const titleRow=<TableRow>
        {config.map(([title,_2,_1], i:number) => {
            return <CCell key={i}>{title}</CCell>;
        }) }
    </TableRow>;
    const rowsMore=<>
        {!content && least &&
            <TableRow>
                {config.map(([title,aName,_1], c:number) => {
                    return <CCell key={c}>{slash && '／'}</CCell>;
                }) }
            </TableRow>
        }
        {content?.map((o: any, i:number) => {
            return (<TableRow key={i}>
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        }) }
    </>
    return  [titleRow, rowsMore];
}
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
export function useRep2hTableViewer(config: Each_ZdSetting[], table: string, orc: any,nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
{
    const content=orc?.[table];
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    //旧的方式：外部可操作性较差，不好修改Node
    // const rowsMore=<>
    //     {0===sizeData && least &&
    //     }
    //     {sizeData>0 &&  }
    // </>
    if(nhead){
        return  [rowsMore];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}
//对比useRep2hTableViewer，采用content注入：适应不直接从orc读取的表格。
export function useContent2hTableViewer(config: Each_ZdSetting[], content: any[],nhead?: boolean, least?: boolean, slash?: boolean,seqCl?: any)
{
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}

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
export const useRep2hTableViewerX= ({config, table, orc,nhead=true, least=true, slash=true,seqCl,embed} : useRep2hTableViewerXProps
) => {
    const content=orc?.[table];
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {embed && <CCell>{embed}</CCell> }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
            {seqCl && <CCell>/</CCell>}
            {config.map(([title,aName,_1], c:number) => {
                return <CCell key={c}>{slash&&'／'}</CCell>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        const rowFspan=(content?.length +1)/2;
        content?.forEach((o: any, i:number) => {
            if(1===i%2) return null;
            const ro=content?.[i+1];
            rowsMore.push(<TableRow key={i}>
                    {embed && 0===i && <CCell  split  rowSpan={rowFspan}  key={'H'+i}>{embed}</CCell> }
                    {seqCl && <CCell>{i+1}</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{o?.[aName]??((o&&slash)&&'／')}</CCell>;
                    }) }

                    {seqCl && <CCell>{ro?  (i+2) : '／' }</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{ro?.[aName]??(slash&&'／')}</CCell>;
                    }) }
                </TableRow>
            );
        })
    }
    //【特别注意】 这两个return的接收差异有问题： 若出现： key报错
    if(nhead){
        return  [rowsMore, null];
    }
    else{
        //titleRow固定做成2半拆分的；    ？有些表的字段没有全部都显示出。
        const titleRow=<TableRow>
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
            {seqCl && <CCell>{seqCl}</CCell>
            }
            {config.map(([title,_2,_1], i:number) => {
                return <CCell key={i}>{title}</CCell>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
};
/**支持更多的，类似useContent2hTableViewer是针对2排的。这个可以随意多排的。
@param blocks: 几个排的布局。默认=1； 【局限性】排固定数； #不允许动态调整的！
 支持park? 嵌套字段。
* */
export function useRaftTableViewer(config: Each_ZdSetting[], content: any[], blocks:number=1, nhead?: boolean, least?: boolean, slash?: boolean, seqCl?: any)
{
    const sizeData=content?.length || 0;
    let rowsMore=[];
    /*不能用：
     for (let i = 0; i < blocks; i++) {
                 rowsMore.push(<TableRow key={1}>  </TableRow>; }
    * */
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>/</CCell>}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{slash&&'／'}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
            //只能第一个区块/排的： 构造一组【blocks个对象】
            if(0!==i%blocks)
                return null;
            rowsMore.push(<TableRow key={i}>
                {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                    const ro=content?.[i+b];
                    return <React.Fragment key={b}>
                        {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
                        {config.map(([title,aName,_wid, _cb, park], c:number) => {
                            const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
                            return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
                        }) }
                    </React.Fragment>;
                }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        const titleRow=<TableRow>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>{seqCl}</CCell>
                    }
                    {config.map(([title,_tag,_wpx], i:number) => {
                        return <CCell key={i}>{title}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}
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
export const useRaftTableViewerX= ({config,content,blocks=1,nhead=true,least=true,slash=true,
                                       seqCl,mergeL,mergeR}  :RaftTableViewerXProps
) => {
    const sizeData=content?.length || 0;
    let rowsMore=[];
    if(0===sizeData && least){
        rowsMore.push(<TableRow key={1}>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>/</CCell>}
                    {mergeL}
                    {config.map(([title,aName,_1], c:number) => {
                        return <CCell key={c}>{slash&&'／'}</CCell>;
                    }) }
                    {mergeR}
                </React.Fragment>;
            }) }
        </TableRow>);
    }else if(sizeData>0){
        content?.forEach((o: any, i:number) => {
            if(blocks<=0 || blocks>20) throw new Error(`排数非法${blocks}`);
            //只能第一个区块/排的： 构造一组【blocks个对象】
            if(0!==i%blocks)
                return null;
            rowsMore.push(<TableRow key={i}>
                    {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                        const ro=content?.[i+b];
                        return <React.Fragment key={b}>
                            {seqCl && <CCell>{ro?  (i+b+1) : '／' }</CCell>}
                            {0===i && mergeL}
                            {config.map(([title,aName,_wid, _cb, park], c:number) => {
                                const txt=park?  ro?.[park]?.[aName]  : ro?.[aName];
                                return <CCell key={c}>{txt??(slash&&'／')}</CCell>;
                            }) }
                            {0===i && mergeR}
                        </React.Fragment>;
                    }) }
                </TableRow>
            );
        })
    }
    if(nhead){
        return  [rowsMore];
    }
    else{
        //没考虑 mergeL / R的。
        const titleRow=<TableRow>
            {(new Array(blocks)).fill(null).map(( _,  b:number) => {
                return <React.Fragment key={b}>
                    {seqCl && <CCell>{seqCl}</CCell>
                    }
                    {config.map(([title,_tag,_wpx], i:number) => {
                        return <CCell key={i}>{title}</CCell>;
                    }) }
                </React.Fragment>;
            }) }
        </TableRow>;
        return  [rowsMore, titleRow];
    }
}

/**表格编辑项目的特别回调，
 * */
export const tabIBlistCb=(datalist:string[],rows?:number)=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
        return  <BlobInputList value={obj?.[tag] || ''} rows={rows??2} datalist={datalist}
                               onListChange={v => setObj({...obj, [tag]: v || undefined}) } />
    }
}
//表格录入日期：类似高阶函数
export const tabIDateCb=()=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=>{
        return  <Input value={obj?.[tag] || ''}  type='date'
                        onChange={e => setObj({ ...obj, [tag]: e.currentTarget.value}) } />
    }
}
//【特殊布局】放大编辑框：
export const tabTextAreCb=(rows?:number)=>{
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string | number)=> {
        return <div css={{ "div:has(&).InputLine__Head": {display: 'block'} }}>
            <TextArea value={obj?.[tag] || ''} rows={rows ?? 2}
                      onChange={e => setObj({...obj, [tag]: e.currentTarget.value})}/>
        </div>
    }
}
/**签名 需要user context
* */
export const tabIUserSign = (user: any) => {
    return (obj: { [x: string]: any; }, setObj: (arg0: any) => void, tag: string, park: string) => {
        //存储上多一层嵌套对象 inp?.[name]?.sgm?.name  通常value={obj?.[tag] || ''}
        return <div>
            签字人：{obj?.[park]?.name || ''}。<br/>
            {obj?.[park]?.username === user?.username ?
                <Button intent="warning"
                        onPress={async () => {
                            // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', undefined);
                            await setObj({...obj, [park]: undefined});
                            // await objNestSet(tag,'sgm', undefined, obj,setObj);
                        }}
                >去除签名</Button>
                :
                <Button intent="warning"
                        onPress={async () => {
                            const me = {username: user?.username, name: user?.person?.name};
                            // await tableSetInp('单图表', dxtix, inp, setInp, 'sgm', me);
                            await setObj({...obj, [park]: me});
                            // await objNestSet(tag,'sgm', me, obj,setObj);
                        }}
                >签名</Button>
            }
        </div>
    }
}
//生成器@Genrenator  高阶函数 ：有单位的input
export const tabSuffixCb=(unit:string,atunit?:string)=>{
    return (form: UseFormReturn<any, any, any>, title:any, tag: string, park?:string) => {
        const unitColVal = form.watch(`.${atunit}`)
        return <FormField  control={form.control} name={`${park}.${tag}`}
                          render={({ field }) => (
                              <FormItem className="pt-2 w-full break-inside-avoid">
                                  <FormLabel>{title}</FormLabel>
                                  <FormControl className="w-full">
                                      <SuffixInput  unit={unit}  {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
        />
    }
}


interface TableEditorProps {
    config: Each_ZdSetting[]
    table: string
    headview: React.ReactNode
    tailview?: React.ReactNode
    defaultV?: any[]
    noDelAdd?: boolean
    //定长折叠布局没有考虑隐藏固定内容的列的。弹性布局才会做隐藏。
    fixColumn?: number
    saveFixC?: boolean
    //改useform了:就不用了，直接配置指示好了。
    editAs?: (form: UseFormReturn<any, any, any>, seq: number | null) => React.ReactNode
    maxRf?: number
    stretchF?: number[]
    //初始的布局模式
    defFixedLay?: boolean
    // 添加样式自定义配置
    styleConfig?: {
        // 表头样式
        headerText?: string
        //弹性布局： 数据行div样式
        rowText?: string
        //定长折叠布局： 数据单元格样式
        cellText?: string
        // 行号样式
        rowNumberText?: string
        //弹性布局 表格间距
        tableSeparation?: string // 表格之间的间距
        // 其他自定义样式类
        customClasses?: {
            headerWrapper?: string
            rowWrapper?: string
            //定长布局的
            tableWrapper?: string
            cellWrapper?: string
        }
    }
}

/*目的是编辑器而不是表格显示打印。适应于编辑表格的显示编辑列数不算太多的,表格行数也比较少的情况,不支持普通表格的分页功能。
屏幕和浏览器适应需要，多加个表头独立做复制的。
【注意】特别要求必须把 {remove, move, insert } = arrays?.[];  从form外部注入的接口。
 * */
function useTableEditor({
                                   config,
                                   table,
                                   headview,
                                   tailview,
                                   defaultV,
                                   noDelAdd,
                                   fixColumn,
                                   editAs,
                                   maxRf,
                                   stretchF = [1, 1.35, 1.7],
                                   saveFixC = false,
                                   defFixedLay,
                                   styleConfig = {}, // 默认为空对象
                               }: TableEditorProps) {
    // 提取样式配置，设置默认值
    const {
        headerText = "text-sm",
        rowText = "text-xs h-md:md:text-sm leading-none",
        cellText = "text-xs h-md:md:text-[14px]",
        rowNumberText = "text-[10px]/1 h-md:text-xs/2",
        tableSeparation = "gap-2",
        customClasses = {},
    } = styleConfig || {}

    // 添加一个 ref 来引用编辑器区域
    const editorRef = React.useRef<HTMLDivElement>(null)

    // 添加一个滚动到编辑器的函数
    const scrollToEditor = React.useCallback(() => {
        setTimeout(() => {
            if (editorRef.current) {
                // 使用更安全的滚动方法，避免 ARIA 问题
                const rect = editorRef.current.getBoundingClientRect()
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                const targetPosition = rect.top + scrollTop - 100 // 减去一些偏移量，让编辑器在视图中更居中

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                })
            }
        }, 100) // 短暂延迟确保 DOM 已更新
    }, [])

    //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
    const [seq, setSeq] = React.useState<number | null>(null)
    const [selectedRaft, setSelectedRaft] = React.useState<number | null>(null)
    // const [fixedColW, setFixedColW] = React.useState<boolean>(defFixedLay ?? false)竟然被挪走放在renderFlexibleTable = React.useCallback(里面了。
    //定长折叠形态才需要区分表格raft的位置；
    const [activeHeaderIndex, setActiveHeaderIndex] = React.useState<number | null>(null)
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null)
    const { innerHeight, } = useWindowSize()
    const frameRef = React.useRef<HTMLDivElement>(null)
    const barRect = useMeasure(frameRef as React.RefObject<HTMLElement>)
    const hBarWidth = barRect?.width || 0
    const screenTp = innerHeight! > 860 && hBarWidth > 1700 ? 2 : innerHeight! > 740 && hBarWidth > 1280 ? 1 : 0
    //最多几个分区表可以并排的:默认raft=1
    const raft = React.useMemo(() => {
        // Calculate total width needed for all columns
        const desiredW = config.reduce((prevSum, [_, _t, width]: any) => {
            return prevSum + width
        }, 0)
        // Add some padding to account for margins and borders
        const totalDesiredWidth = desiredW + config.length * 10
        // Calculate how many columns can fit based on available width
        // Use a more conservative stretch factor to ensure we don't try to fit too many
        const adjustedStretchFactor = stretchF[screenTp] * 1.2
        const rfnum = Math.max(1, Math.floor(hBarWidth / (totalDesiredWidth * adjustedStretchFactor)))
        // Limit to reasonable bounds
        const canDispNum = isNaN(rfnum) || rfnum < 1 ? 1 : Math.min(rfnum, 20)
        // Apply maxRf constraint if provided
        return maxRf ? Math.min(canDispNum, maxRf) : canDispNum
    }, [hBarWidth, screenTp, stretchF, config, maxRf])
    //定长折叠模式：需要复杂的key="tableIndex-rowIndex"而不是正常的{i}来做标记关联的。
    const rowRefs = React.useRef<Map<number | string, HTMLDivElement | null>>(new Map())
    // 存储每个表格的表头引用
    const headerRefs = React.useRef<Map<number, HTMLTableSectionElement | null>>(new Map())

    function spliteor(i: number) {
        return TabSplChars[i % TabSplChars.length]
    }
    //性能问题editor = React.useCallback((form: any) => {不能用const tabledArr = form.watch?.(table) || []输入太慢
    const editor = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const { fields, append, remove, move } = arrays?.[table] || {}
            // const tabledArr = form.watch?.(table) || [] 输入反馈太慢
            const index = seq ?? 0 // 表格第几行的
        return <Card className="flex justify-center w-full flex-col md:p-1 gap-2" ref={editorRef}>
                <div>在{seq === null ? "新增一" : `编辑第 ${seq! + 1} `}条：</div>
                <div className="w-full">
                {seq!== null &&
                    <>{ editAs ? editAs(form, seq)
                        :
                        <div className="grid grid-cols-1 @xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4 gap-2">
                            {config.map(([title, tag, _, extobj, park]: any, i: number) => {
                                // const filedVl = tabledArr[index] ? (park ? tabledArr[index][park][tag] : tabledArr[index][tag]) : ""
                                const { t: type, l: list, u: unit, s: size } = extobj || {}
                                if ((fixColumn && i < fixColumn) || !(fields.length > 0))
                                    return <React.Fragment key={i}></React.Fragment>
                                else if (type === "s")
                                    return (
                                        <FormField key={i} control={form.control}
                                                   name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                   render={({ field }) => (
                                                       <FormSelectField field={field} label={title} options={list}
                                                                        /*value={filedVl}*/ />
                                                   )}
                                        />
                                    )
                                else if (type === "d")
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">
                                                        <Input type="date" {...field}
                                                               /*value={filedVl}*/
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                else if (type === "b")
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">{/*<Switch   {...field}  />*/}</FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                else if (type === "B")
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid @5xl:col-span-2">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">
                                                        {/*<BlobInputList datalist={list} unit={unit}  {...field}  />*/}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                else if (type === "m")
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid @5xl:col-span-2 @5xl:row-span-2">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">{/*<Textarea rows={4}  {...field} />*/}</FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                else if (type === "M")
                                    return <FormField key={i} control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">
                                                        <MemoDatesInput {...field} rows={2}
                                                            /*value={filedVl}*/
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                else if (type === "D")
                                    return <FormField key={i} control={form.control}
                                                      name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                                      render={({ field }) => (
                                                          <FormItem className="w-full break-inside-avoid">
                                                              <FormLabel>{title}</FormLabel>
                                                              <FormControl className="w-full">
                                                                  <MemoDateInput {...field}
                                                                      /*value={filedVl}*/
                                                                  />
                                                              </FormControl>
                                                              <FormMessage />
                                                          </FormItem>
                                                      )}
                                    />
                                else if (unit)
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">
                                                        <SuffixInput  unit={unit}  {...field}
                                                            /*value={filedVl}*/
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                else
                                    return (
                                        <FormField
                                            key={i}
                                            control={form.control}
                                            name={park ? `${table}.${index}.${park}.${tag}` : `${table}.${index}.${tag}`}
                                            render={({ field }) => (
                                                <FormItem className="w-full break-inside-avoid">
                                                    <FormLabel>{title}</FormLabel>
                                                    <FormControl className="w-full">
                                                        <Input type={type === "n" ? "number" : undefined} {...field}
                                                            /*value={filedVl}*/
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                            })}
                        </div>
                    }
                    </>
                }
                    <Button className="mt-4"
                        onClick={(e) => {
                            if (append) {
/*                                // 如果 seq 是合法数据行，复制该行数据
                                if (seq !== null && tabledArr[seq]) {
                                    // 创建一个深拷贝以避免引用问题
                                    const newItem = JSON.parse(JSON.stringify(tabledArr[seq]))
                                    append(newItem)
                                } else {
                                    // 否则创建空白记录
                                    const template = {} as any
                                    config.forEach(([_t, tag, _w, _o, park]) => {
                                        if (park) {
                                            // 确保嵌套对象存在
                                            if (!template[park]) template[park] = {}
                                            template[park][tag] = ""
                                        } else {
                                            template[tag] = ""
                                        }
                                    })
                                    append(template)
                                }
                                setSeq(tabledArr.length) // 设置为新添加的行
                                scrollToEditor() // 滚动到编辑器*/
                            }
                            e.preventDefault()
                        }}
                    >
                      新增一条
                    </Button>
                </div>
          </Card>
        },
        [seq, config, table, editAs, fixColumn, scrollToEditor],
    )

    // 添加一个新的状态来跟踪浮动表头的位置和可见性
    const [floatingHeader, setFloatingHeader] = React.useState<{
        visible: boolean
        top: number
        tableIndex: number
        rowIndex: number
    } | null>(null)

    // 修改处理表头位置的函数，使用浮动表头而不是移动原始表头
    const handleHeaderPosition = React.useCallback(
        (rowIndex: number, tableIndex: number) => {
            // 如果点击的是当前活动行，则重置表头位置
            if (selectedRaft !== tableIndex) {
                setSelectedRaft(tableIndex)
            }
            //定长折叠形态下：设置当前活动行
            setActiveHeaderIndex(rowIndex)
            // 获取点击的行元素 ：区分那一个raft表格的；
            const clickedRow = rowRefs.current.get(`${tableIndex}-${rowIndex}`)
            const frameRect = frameRef.current?.getBoundingClientRect() || { top: 0 }
            // 获取对应表格的表头
            const header = headerRefs.current.get(tableIndex)

            if (clickedRow && header) {
                const rowRect = clickedRow.getBoundingClientRect()
                const headerRect = header.getBoundingClientRect()
                // 设置浮动表头的位置和可见性
                setFloatingHeader({
                    visible: true,
                    top: rowRect.top - frameRect.top - headerRect.height - 6,
                    tableIndex,
                    rowIndex,
                })
            }
        },
        [activeHeaderIndex, selectedRaft],
    )

    // 添加一个函数来关闭浮动表头
    const closeFloatingHeader = React.useCallback(() => {
        setFloatingHeader(null)
        setActiveHeaderIndex(null)
        setSelectedRaft(null)
    }, [])

    // 处理菜单打开状态的函数
    const handleMenuOpenChange = React.useCallback((open: boolean, menuId: string) => {
        if (open) {
            setOpenMenuId(menuId)
        } else {
            setOpenMenuId(null)
        }
    }, [])

    // 处理行点击的函数 - 不打开菜单，只移动表头
    const handleRowClick = React.useCallback(
        (e: React.MouseEvent, rowIndex: number, tableIndex: number) => {
            // 如果点击的是菜单触发器，不执行任何操作
            if ((e.target as HTMLElement).closest('[data-dropdown-trigger="true"]')) {
                return
            }

            // 移动表头
            handleHeaderPosition(rowIndex, tableIndex)
        },
        [handleHeaderPosition],
    )

    // 在renderCollapsibleTable函数中添加浮动表头组件
    const renderCollapsibleTable = React.useCallback(
        (form: any, arrays: Record<string, any>, linecnt: number) => {
            const tabledArr = form.watch?.(table) || []
            const membersum = tabledArr.length
            const { remove, move, insert } = arrays?.[table] || {}
            return (
                <div className="relative">
                    {/* 浮动表头 */}
                    {floatingHeader && floatingHeader.visible && (
                        <>
                            <div
                                className={cn(
                                    "absolute left-0 right-0 w-full flex gap-2 @md:gap-4 border rounded-md overflow-hidden box-border",
                                    customClasses.headerWrapper,
                                )}
                                style={{
                                    top: `${floatingHeader!.top}px`,
                                }}
                            >
                                {new Array(raft).fill(null).map((_, b: number) => {
                                    return (
                                        <table key={b} className="  w-full border-collapse">
                                            <thead className={`z-[10] border-collapse table-header-group`}>
                                            <tr className="flex flex-wrap justify-around items-center">
                                                <th className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                                    <div className="z-[1] flex flex-col items-start w-full justify-between h-auto p-0 text-left bg-white">
                                                        <div className="flex w-full justify-between items-center">
                                                            <span className={headerText}>{b + 1}</span>
                                                            <button className=" text-gray-500 hover:text-gray-700" onClick={closeFloatingHeader}>
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                            {config.map(([title, tag, width]: any, k: number) => {
                                                                return (
                                                                    <div
                                                                        key={k}
                                                                        className={cn(
                                                                            `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal min-h-[33px]`,
                                                                            customClasses.cellWrapper,
                                                                        )}
                                                                        style={{
                                                                            flexBasis: `${width * stretchF[screenTp]}px`,
                                                                            flexGrow: 1,
                                                                            flexShrink: 1,
                                                                        }}
                                                                    >
                                                                        <div className={cn("m-auto", headerText)}>{title}</div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </th>
                                            </tr>
                                            </thead>
                                        </table>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    <div
                        className={cn(
                            "w-full flex gap-2 @md:gap-4 border rounded-md overflow-hidden box-border relative",
                            customClasses.tableWrapper,
                        )}
                    >
                        {/* 原有的表格内容 */}
                        {new Array(raft).fill(null).map((_, b: number) => {
                            return (
                                <table key={b} className="w-full border-collapse">
                                    <thead
                                        ref={(el) => headerRefs.current.set(b, el)}
                                        className={cn(
                                            `bg-ghostwhite z-[10] border-collapse table-header-group`,
                                            customClasses.headerWrapper,
                                        )}
                                    >
                                    <tr className="flex flex-wrap justify-around items-center">
                                        <th className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                            <div className="flex flex-col items-start w-full justify-between h-auto p-0 text-left">
                                                <span className={"text-sm"}>{b + 1}</span>
                                                <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                    {config.map(([title, tag, width]: any, k: number) => {
                                                        return (
                                                            <div
                                                                key={k}
                                                                className={cn(
                                                                    `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal min-h-[33px]`,
                                                                    customClasses.cellWrapper,
                                                                )}
                                                                style={{
                                                                    flexBasis: `${width * stretchF[screenTp]}px`,
                                                                    flexGrow: 1,
                                                                    flexShrink: 1,
                                                                }}
                                                            >
                                                                <div className={cn("m-auto", headerText)}>{title}</div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="border-collapse">
                                    {isNaN(linecnt) && (
                                        <tr className="border border-solid border-gray-300">
                                            <td className="text-center">空表</td>
                                        </tr>
                                    )}
                                    {!isNaN(linecnt) &&
                                        new Array(linecnt).fill(null).map((_, i: number) => {
                                            const rowId = `${b}-${i}`
                                            const isMenuOpen = openMenuId === rowId
                                            const isActive =
                                                floatingHeader && floatingHeader.tableIndex === b && floatingHeader.rowIndex === i

                                            return (
                                                <tr
                                                    key={i}
                                                    className={cn(
                                                        `flex flex-wrap justify-around items-center cursor-pointer
                                                      ${isActive ? "bg-blue-50" : ""}`,
                                                        customClasses.rowWrapper,
                                                    )}
                                                    ref={(el) => rowRefs.current.set(rowId, el as HTMLDivElement)}
                                                    onClick={(e) => handleRowClick(e, i, b)}
                                                >
                                                    <td className="flex flex-col flex-wrap items-start justify-between w-full h-auto min-h-[33px] p-0 text-left border-0 border-b">
                                                        {raft * i + b < membersum && (
                                                            <div className="flex flex-col items-start w-full justify-between h-auto p-0 text-left">
                                                                <div className="flex justify-between w-full">
                                                                    <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                                    <DropdownMenu
                                                                        open={isMenuOpen}
                                                                        onOpenChange={(open) => handleMenuOpenChange(open, rowId)}
                                                                    >
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 px-2 ml-auto"
                                                                                data-dropdown-trigger="true"
                                                                            >
                                                                                •••
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSeq(raft * i + b)
                                                                                    setOpenMenuId(null)
                                                                                    scrollToEditor() // 添加滚动到编辑器
                                                                                }}
                                                                            >
                                                                                修改
                                                                            </DropdownMenuItem>
                                                                            {!noDelAdd && (
                                                                                <>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => {
                                                                                            remove(raft * i + b)
                                                                                            setSeq(null)
                                                                                            setOpenMenuId(null)
                                                                                        }}
                                                                                    >
                                                                                        刪除这条
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => {
                                                                                            // 创建空白记录
                                                                                            const template = {} as any
                                                                                            config.forEach(([_t, tag, _w, _o, park]) => {
                                                                                                if (park) {
                                                                                                    // 确保嵌套对象存在
                                                                                                    if (!template[park]) template[park] = {}
                                                                                                    template[park][tag] = ""
                                                                                                } else {
                                                                                                    template[tag] = ""
                                                                                                }
                                                                                            })
                                                                                            insert(raft * i + b, template, { shouldFocus: false })
                                                                                            setSeq(raft * i + b) // 设置为新插入的行
                                                                                            setOpenMenuId(null)
                                                                                            scrollToEditor() // 添加滚动到编辑器
                                                                                        }}
                                                                                    >
                                                                                        插入一条
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => {
                                                                                            setSeq(raft * i + b)
                                                                                            setOpenMenuId(null)
                                                                                        }}
                                                                                    >
                                                                                        选定这条
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        disabled={seq === null}
                                                                                        onClick={() => {
                                                                                            move(seq, raft * i + b)
                                                                                            setOpenMenuId(null)
                                                                                        }}
                                                                                    >
                                                                                        移动到此
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="flex flex-wrap justify-start items-stretch w-full min-h-[inherit] gap-0">
                                                                    {config.map(([title, tag, width,_o,park]: any, k: number) => {
                                                                        return (
                                                                            <div
                                                                                key={k}
                                                                                className={cn(
                                                                                    `inline-flex max-w-full border border-dotted box-border break-words whitespace-normal`,
                                                                                    customClasses.cellWrapper,
                                                                                )}
                                                                                style={{
                                                                                    flexBasis: `${width * stretchF[screenTp]}px`,
                                                                                    flexGrow: 1,
                                                                                    flexShrink: 1,
                                                                                }}
                                                                            >
                                                                                <div className={cn("m-auto", cellText)}>
                                                                                    { park
                                                                                        ? (tabledArr[i * raft + b]?.[park]?.[tag] ?? "")
                                                                                        : (tabledArr[i * raft + b]?.[tag] ?? "")
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )
                        })}
                    </div>
                </div>
            )
        },
        [
            table,
            raft,
            config,
            screenTp,
            stretchF,
            activeHeaderIndex,
            handleRowClick,
            handleMenuOpenChange,
            openMenuId,
            floatingHeader,
            closeFloatingHeader,
            headerText,
            rowText,
            cellText,
            rowNumberText,
            customClasses,
            scrollToEditor,
        ],
    )

    // 同样需要修改弹性布局模式下的表头处理
    // 在contentRendererFactory函数中，修改弹性布局部分
    // 将原来的移动表头代码替换为浮动表头

    // 在弹性布局模式下，添加浮动表头
    const renderFlexibleTable = React.useCallback(
        (form: any, arrays: Record<string, any>, linecnt: number) => {
            const tabledArr = form.watch?.(table) || []
            const membersum = tabledArr.length
            const { remove, move, insert } = arrays?.[table] || {}
            return (
                <div className={cn("relative", tableSeparation)}>
                    {/* 浮动表 */}
                    {floatingHeader && floatingHeader.visible && (
                        <div
                            className={cn(
                                "absolute left-0 right-0 bg-ghostwhite z-[1] border-b shadow-md bg-white",
                                customClasses.headerWrapper,
                            )}
                            style={{
                                top: `${floatingHeader.top}px`,
                            }}
                        >
                            <div className={cn("flex justify-around items-center", tableSeparation)}>
                                {new Array(raft).fill(null).map((_, b: number) => {
                                    return (
                                        <div
                                            key={b}
                                            className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left font-bold"
                                            style={{ width: `calc(${100 / raft}%)` }}
                                        >
                                            <div className="flex w-full justify-between items-center">
                                                <span className={"text-sm"}>{b + 1}</span>
                                                <button className="text-gray-500 hover:text-gray-700" onClick={closeFloatingHeader}>
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="flex w-full flex-wrap justify-between items-center">
                                                {config.map(([title, tag, width]: any, k: number) => {
                                                    return (
                                                        <div
                                                            key={k}
                                                            className={cn(
                                                                "overflow-anywhere whitespace-normal leading-tight px-2 mb-1",
                                                                headerText,
                                                            )}
                                                            style={{ minWidth: "auto" }}
                                                        >
                                                            {spliteor(k)}
                                                            {title}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* 原始表头 - 保持不动 */}
                    <div className={cn("bg-ghostwhite z-10", customClasses.headerWrapper)}>
                        <div
                            ref={(el) => headerRefs.current.set(0, el)}
                            className={cn("flex justify-around items-center", tableSeparation)}
                        >
                            {new Array(raft).fill(null).map((_, b: number) => {
                                return (
                                    <div
                                        key={b}
                                        className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left font-bold"
                                        style={{ width: `calc(${100 / raft}%)` }}
                                    >
                                        <span className={"text-sm"}>{b + 1}</span>
                                        <div className="flex w-full flex-wrap justify-between items-center">
                                            {config.map(([title, tag, width]: any, k: number) => {
                                                return (
                                                    <div
                                                        key={k}
                                                        className={cn(
                                                            "overflow-anywhere whitespace-normal leading-tight px-2 mb-1",
                                                            headerText,
                                                        )}
                                                        style={{ minWidth: "auto" }}
                                                    >
                                                        {spliteor(k)}
                                                        {title}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 数据行 */}
                    {!isNaN(linecnt) &&
                        new Array(linecnt).fill(null).map((_, i: number) => {
                            const rowId = `row-${i}`
                            const isActive = floatingHeader && floatingHeader.rowIndex === i
                            const excludeFix = fixColumn !== undefined && fixColumn > 0

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        `flex  justify-around items-center cursor-pointer
                                                ${isActive ? "bg-blue-50" : ""}`,
                                        customClasses.rowWrapper,
                                        tableSeparation,
                                    )}
                                    ref={(el) => rowRefs.current.set(i, el as HTMLDivElement)}
                                    onClick={(e) => {
                                        // 如果点击的是菜单触发器，不执行任何操作
                                        if ((e.target as HTMLElement).closest('[data-dropdown-trigger="true"]')) {
                                            return
                                        }
                                        // 设置当前活动行
                                        setActiveHeaderIndex(i)
                                        // 获取点击的行元素
                                        const clickedRow = rowRefs.current.get(i)
                                        const frameRect = frameRef.current?.getBoundingClientRect() || { top: 0 }
                                        //实际ref是来自 原有的表格内容，而不是隐藏的！
                                        const header = headerRefs.current.get(0)
                                        if (clickedRow && header) {
                                            const rowRect = clickedRow.getBoundingClientRect()
                                            const headerRect = header.getBoundingClientRect()
                                            // 设置浮动表头
                                            setFloatingHeader({
                                                visible: true,
                                                top: rowRect.top - frameRect.top - headerRect.height - 6,
                                                tableIndex: 0, // 弹性布局模式下没有表格索引
                                                rowIndex: i,
                                            })
                                        }
                                    }}
                                >
                                    {/* 数据行内容 */}
                                    {new Array(raft).fill(null).map((__: any, b: number) => {
                                        const a = tabledArr[raft * i + b]
                                        const cellMenuId = `${rowId}-${b}`
                                        const isCellMenuOpen = openMenuId === cellMenuId

                                        return (
                                            <div
                                                key={b}
                                                className="flex flex-col items-start w-full justify-between h-auto min-h-[32px] p-0 text-left"
                                                style={{ width: `calc(${100 / raft}%)` }}
                                            >
                                                {raft * i + b < membersum && (
                                                    <>
                                                        <div className="flex justify-between w-full">
                                                            <span className={cn("", rowNumberText)}>{`${raft * i + b + 1}`}</span>
                                                            <DropdownMenu
                                                                open={isCellMenuOpen}
                                                                onOpenChange={(open) => handleMenuOpenChange(open, cellMenuId)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 ml-auto"
                                                                        data-dropdown-trigger="true"
                                                                    >
                                                                        •••
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSeq(raft * i + b)
                                                                            setOpenMenuId(null)
                                                                            scrollToEditor() // 添加滚动到编辑器
                                                                        }}
                                                                    >
                                                                        修改
                                                                    </DropdownMenuItem>
                                                                    {!noDelAdd && (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    remove(raft * i + b)
                                                                                    setSeq(null)
                                                                                    setOpenMenuId(null)
                                                                                }}
                                                                            >
                                                                                刪除这条
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    // 创建空白记录
                                                                                    const template = {} as any
                                                                                    config.forEach(([_t, tag, _w, _o, park]) => {
                                                                                        if (park) {
                                                                                            // 确保嵌套对象存在
                                                                                            if (!template[park]) template[park] = {}
                                                                                            template[park][tag] = ""
                                                                                        } else {
                                                                                            template[tag] = ""
                                                                                        }
                                                                                    })
                                                                                    insert(raft * i + b, template, { shouldFocus: false })
                                                                                    setSeq(raft * i + b) // 设置为新插入的行
                                                                                    setOpenMenuId(null)
                                                                                    scrollToEditor() // 添加滚动到编辑器
                                                                                }}
                                                                            >
                                                                                插入一条
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSeq(raft * i + b)
                                                                                    setOpenMenuId(null)
                                                                                }}
                                                                            >
                                                                                选定这条
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                disabled={seq === null}
                                                                                onClick={() => {
                                                                                    move(seq, raft * i + b)
                                                                                    setOpenMenuId(null)
                                                                                }}
                                                                            >
                                                                                移动到此
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div className="flex w-full flex-wrap justify-between items-center">
                                                            {config.map(([title, tag, width, _, park]: any, k: number) => {
                                                                return (
                                                                    <div
                                                                        key={k}
                                                                        className={cn(
                                                                            "overflow-anywhere whitespace-normal px-2 mb-1",
                                                                            rowText,
                                                                        )}
                                                                        style={{ minWidth: "auto" }}
                                                                    >
                                                                        {spliteor(k) +
                                                                            (excludeFix && k < fixColumn!
                                                                                ? park
                                                                                    ? defaultV[raft * i + b]?.[park]?.[tag]
                                                                                    : defaultV[raft * i + b]?.[tag]
                                                                                : park
                                                                                    ? (a?.[park]?.[tag] ?? "")
                                                                                    : (a?.[tag] ?? ""))}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                </div>
            )
        },
        [
            table,
            raft,
            config,
            floatingHeader,
            closeFloatingHeader,
            activeHeaderIndex,
            openMenuId,
            handleMenuOpenChange,
            defaultV,
            fixColumn,
            headerText,
            rowText,
            rowNumberText,
            customClasses,
            tableSeparation,
            scrollToEditor,
        ],
    )

    const [fixedColWState, setFixedColWState] = React.useState<boolean>(defFixedLay ?? false)

    const contentRendererFactory = React.useCallback(
        (form: any, arrays?: Record<string, any>) => {
            const tabledArr =[]// form.watch?.(table) || []
            const linecnt =134;// Math.ceil(tabledArr.length / raft)

            // 使用 useCallback 包装 setFixedColW 函数，避免不必要的重新创建
            const toggleFixedColW = React.useCallback((e: React.MouseEvent) => {
                e.preventDefault()
                setActiveHeaderIndex(null)
                setSelectedRaft(null)
                setFixedColWState((prev) => !prev)
            }, [])

            const clearTable = React.useCallback(
                (e) => {
                    //useform:实际也是中间过渡状态? 未牵涉到保存到后端， 没有考虑排除固定字段？
                    //     let fxkeys={} as any;       //配置里面前面几列的固定不修改的字段key名; 转为对象化形式的{key1:, key2:, ...}；
                    //     for(let k=0;k<fixColumn!;k++){
                    //         const field=config[k][1];
                    //         fxkeys[field]=undefined;        //排除字段。
                    //     }
                    //     const excludeAft=defaultV?.map(defObj=>{
                    //         const newobj = Object.keys(defObj).reduce((object : any, key) => {
                    //             if(! (key in fxkeys)) {
                    //                 object[key] =defObj[key];
                    //             }
                    //             return object;
                    //         }, {})
                    //         return newobj;
                    //     });
                    //     setInp({ ...inp, [table]: excludeAft})
                    form.setValue(table, defaultV ?? [])
                    e.preventDefault()
                },
                [defaultV, form, table],
            )

            const renderContent = () => {
                return fixedColWState
                    ? //定长折叠 模式下的布局:
                    renderCollapsibleTable(form, arrays!, linecnt)
                    : //弹性布局模式:
                    renderFlexibleTable(form, arrays!, linecnt)
            }
            //这个excludeFix仅仅对弹性布局生效的excludeFix && k < fixColumn!； 定长折叠布局模式没启用过滤字段。
            const excludeFix = defaultV && fixColumn! >= 1 && noDelAdd && !saveFixC
            return (
                <div>
                    {headview}
                    <div className="flex items-center mb-4">
                        <Button variant="outline" onClick={toggleFixedColW}>
                            {fixedColWState ? `弹性布局` : `定长折叠`}
                        </Button>
                        <span className="ml-2">按每行{excludeFix ? config.length - fixColumn! : config.length}列为一组录入</span>
                        <Button variant="outline" className="ml-auto" onClick={clearTable}>
                            清空全表至默认
                        </Button>
                    </div>
                    <hr className="my-2" />
                    <div ref={frameRef}>{renderContent()}</div>
                    <div className={cn("flex justify-center", "flex")} ref={editorRef}>
                        {editor(form, arrays)}
                    </div>
                    {tailview}
                </div>
            )
        },
        [
            activeHeaderIndex,
            raft,
            openMenuId,
            fixedColWState,
            fixColumn,
            editor,
            config,
            table,
            headview,
            tailview,
            defaultV,
            noDelAdd,
            screenTp,
            stretchF,
            renderCollapsibleTable,
            handleMenuOpenChange,
            renderFlexibleTable,
        ],
    )

    return [contentRendererFactory]
}
