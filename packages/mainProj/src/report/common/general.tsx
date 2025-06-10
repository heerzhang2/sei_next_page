import * as React from "react";
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow,} from "@/components/flexible-table";
import {Button} from "@/components/ui";
import {DirectLink, } from "../../routing/Link";
import {NosTagMapping} from "./omni";
import {useContext} from "react";
//不能用！ import { useRouter } from 'next/router'
import { useRouter } from 'next/navigation';
// import Link from 'next/link'
import {cn} from "@/lib/utils";
import {JumpTab} from "@/report/common/JumpTab";

/**不合格表
 * @param rep 报告relay对象
 * @param original 是否为了打印正式版原始记录
 * @param  mapNoTag 编辑区的标签映射 tag:1对多个no
 * */
// export const UnqualifiedIspItemTable= ({printing, rep,  orc, mapNoTag, original,fixed=["4.5%","10.5%","%","10.5%","12.5%"] }
//     :{printing:boolean, rep:any, orc:any, mapNoTag?:Map<string,string>, original?:boolean,fixed?:any[],}
// ) => {
//   const urlhead=`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`;
//   return  <>
//     { orc?.unq?  <div>
//           <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem',
//             "@media print": {pageBreakBefore: 'always', },
//           }}>报告编号：{rep.isp?.no}</Text>
//           <Table  fixed={fixed}  css={ {borderCollapse: 'collapse'} }  tight  miniw={800}>
//             <TableBody>
//               <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//                 <TableRow>
//                   <CCell  colSpan={5}><Text variant="h4">检验不合格项目内容及复检结果</Text></CCell>
//                 </TableRow>
//               </DirectLink>
//             </TableBody>
//           </Table>
//           <Table  fixed={fixed} css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
//             <TableHead>
//               <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//                 <TableRow>
//                   <CCell>序号</CCell>
//                   <CCell>类别/编号</CCell>
//                   <CCell>检验不合格内容记录</CCell>
//                   <CCell>复检结果</CCell>
//                   <CCell>复检日期</CCell>
//                 </TableRow>
//               </DirectLink>
//             </TableHead>
//             <TableBody>
//               {orc?.unq?.map((bug:any, i:number) => {
//                 return (
//                     <TableRow key={i}>
//                       <DirectLink key={i} href={urlhead+`/${mapNoTag? mapNoTag.get(bug.no): bug.no}`}>
//                         <CCell>{i+1}</CCell>
//                         <CCell>{bug.c}/{bug.no}</CCell>
//                         <CCell>{bug.b}</CCell>
//                       </DirectLink>
//                       <DirectLink key={i+'r'} href={urlhead+`/ReCheck?from=${bug.no}`}>
//                         <CCell>{bug.rs}</CCell>
//                         <CCell>{bug.d}</CCell>
//                       </DirectLink>
//                     </TableRow>
//                 );
//               }) }
//             </TableBody>
//           </Table>
//         </div>
//         :
//         printing?  null :
//             <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//               <Button variant="ghost" intent='primary'  css={{"@media print": {display: 'none'} }}  noBind
//               >检验不合格项目内容及复检结果</Button>
//             </DirectLink>
//     }
//   </>;
// };

/**不合格表
 * @param rep 报告relay对象
 * @param original 是否为了打印正式版原始记录
 * @param  mapNoTag 编辑区的标签映射 tag:1对多个no
 * */
// export const UnqualifiedIspItemTableX= ({printing, rep,  orc, mapNoTag, original,fixed=["4.5%","10.5%","%","10.5%","12.5%"] }
//                                            :{printing:boolean, rep:any, orc:any, mapNoTag?:Map<string,NosTagMapping>, original?:boolean,fixed?:any[],}
// ) => {
//   const urlhead=`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`;
//   return  <>
//     { orc?.unq?  <div>
//           <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem',
//             "@media print": {pageBreakBefore: 'always', },
//           }}>报告编号：{rep.isp?.no}</Text>
//           <Table  fixed={fixed}  css={ {borderCollapse: 'collapse'} }  tight  miniw={800}>
//             <TableBody>
//               <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//                 <TableRow>
//                   <CCell  colSpan={5}><Text variant="h4">检验不合格项目内容及复检结果</Text></CCell>
//                 </TableRow>
//               </DirectLink>
//             </TableBody>
//           </Table>
//           <Table  fixed={fixed} css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
//             <TableHead>
//               <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//                 <TableRow>
//                   <CCell>序号</CCell>
//                   <CCell>类别/编号</CCell>
//                   <CCell>检验不合格内容记录</CCell>
//                   <CCell>复检结果</CCell>
//                   <CCell>复检日期</CCell>
//                 </TableRow>
//               </DirectLink>
//             </TableHead>
//             <TableBody>
//               {orc?.unq?.map((bug:any, i:number) => {
//                 const mapn=mapNoTag!.get(bug.no);
//                 return (
//                     <TableRow key={i}>
//                       <DirectLink key={i} href={urlhead+`/${mapn?.tag}`}>
//                         <CCell>{i+1}</CCell>
//                         <CCell>{mapn?.pre??''}{mapn?.iclas??''}{bug.no}</CCell>
//                         <CCell>{bug.b}</CCell>
//                       </DirectLink>
//                       <DirectLink key={i+'r'} href={urlhead+`/ReCheck?from=${bug.no}`}>
//                         <CCell>{bug.rs}</CCell>
//                         <CCell>{bug.d}</CCell>
//                       </DirectLink>
//                     </TableRow>
//                 );
//               }) }
//             </TableBody>
//           </Table>
//         </div>
//         :
//         printing?  null :
//             <DirectLink  href={urlhead+`/ReCheck#ReCheck`}>
//               <Button variant="ghost" intent='primary'  block  css={{"@media print": {display: 'none'} }}  noBind
//               >检验不合格项目内容及复检结果</Button>
//             </DirectLink>
//     }
//   </>;
// };

/**不合格表
 * @param rep 报告relay对象
 * @param original 是否为了打印正式版原始记录
 * @param  mapNoTag 编辑区的标签映射 tag:1对多个no
 * */
export const UnqualifiedIspTable = ({
                                        printing,
                                        rep,
                                        orc,
                                        mapNoTag,
                                        original,
                                        fixed = ["4.5%", "10.5%", "%", "10.5%", "12.5%"],
                                        label,
                                        titles = ['序号', '类别/编号', '检验不合格内容记录', '复检结果', '复检日期']
                                    }: {
    printing?: boolean;
    rep: any;
    orc: any;
    mapNoTag?: Map<string, NosTagMapping>;
    original?: boolean;
    fixed?: any[];
    label?: any;
    titles?: string[];
}) => {
    const router = useRouter()
    const tbLabel = label ?? <h2 className="text-xl font-bold text-center my-4">检验不合格项目内容及复检结果</h2>;
    const urlhead=`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}`;
    return <>
        {orc?.unq ? (
            <div className="space-y-6 break-before-page">
                <JumpTab  href={urlhead+`/ReCheck#ReCheck`}>
                  {tbLabel}
                </JumpTab>
                <FlexibleTable columnWidths={fixed} className="text-sm">
                    <TableHeader>
                        <TableRow>
                            {titles.map((title, index) => (
                                //第一个项目：默认序号情形的
                                <CCell key={index} className={cn("", index===0? 'text-xs':'text-sm')}>
                                    {title}
                                </CCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orc.unq?.map((bug: any, i: number) => {
                            const mapn = mapNoTag!.get(bug.no);
                            return <TableRow key={i}>
                                        <JumpTab href={`${urlhead}/${mapn?.tag}`}>
                                            <CCell className="px-0">{i + 1}</CCell>
                                            <CCell className="px-0">{`${mapn?.pre ?? ''}${mapn?.iclas ?? ''}${bug.no}`}</CCell>
                                            <CCell className="px-0">{bug.b}</CCell>
                                        </JumpTab>
                                        {/* 复检行 */}
                                        <JumpTab href={`${urlhead}/ReCheck?from=${bug.no}`}>
                                            <CCell className="text-base px-0">{bug.rs}</CCell>
                                            <CCell className="px-0">{bug.d}</CCell>
                                        </JumpTab>
                             </TableRow>
                        })}
                    </TableBody>
                </FlexibleTable>
            </div>
        ) : printing ? null : (
            <div className="text-center my-1 print:hidden">
                <Button variant="ghost"
                    className="px-4 py-2 text-base border-2 border-gray-700 rounded-lg"
                    onClick={() => {router.push(urlhead+`/ReCheck#ReCheck`)}}
                >{tbLabel}</Button>
            </div>
        )}
      </>
};

/**编辑器多选的组件 基础 回调：类似高阶函数？
 * @returns {} view: 格式化记录或报告；edit: 编辑器
 * */
// export const multiCheckFor = (contentArr:any[][]) => {
//   return {
//     view:(orc:any)=>{
//       return <div css={{display: 'flex',flexDirection: 'column',alignItems: 'flex-start'}}>
//         { contentArr.map(([desc,name] : any, i:number)=> {
//           return <div key={i} css={{display: 'flex',alignItems: 'center'}}>{orc?.[name]? <IconCheckSquare size='sm'/> : <IconSquare size='sm'/>}&nbsp;{desc}。</div>;
//         }) }
//       </div>
//     },
//     edit:(inp:any,setInp:(a:any)=>void)=>{
//       return <div  css={{flex: '1 1 50%'}}>
//         { contentArr.map(([desc,name] : any, i:number)=> {
//           return <InputLine key={i} label={`${desc}:`}>
//             <CheckSwitch  checked={inp?.[name] || false} onChange={e => setInp({...inp, [name]: inp?.[name]? undefined:true}) } />
//           </InputLine>;
//         }) }
//       </div>
//     },
//     names: contentArr.map(([_,name] : any, i:number)=> name),
//   };
// }
/**设备概况编辑器 多选的组件 基础 回调：类似高阶函数？ #支持标签移出上一级组件控制，独立跟随安排布局的。 多个选项对应存储name是平铺独立的，并非集合[{name},]对象{'name':}等。
 * @returns {} view: 格式化记录或报告；edit: 编辑器;
 * @var toTail :编辑器需要外移出<LineColumn包裹区，放到其后面做布局，避免太局限于<LineColumn的列大小。toTail=附带的叙述标题。
 * @option { width:报告显示项目布局拆分宽度。column:编辑器布局目标的最大几列的。 }
 * 对 InputLine 的css样式修改，避免内定的flex 1 1 60% 编辑框宽度占用比对布局影响。
 * */
// export const multiCheckMany = (contentArr:any[][],label:string,option?: {width?:number,column?:number}) => {
//   return {
//     view:(orc:any)=>{
//       return <ColumnWidth clnWidth={option?.width ?? 160} >
//           { contentArr.map(([desc,name] : any, i:number)=> {
//             return <div key={i} css={{display: 'flex',alignItems: 'center'}}>
//               {orc?.[name]?
//                 <IconCheckSquare size='sm' css={{minWidth: '1rem'}}/>
//                 :
//                 <IconSquare size='sm' css={{minWidth: '1rem'}}/>
//               }
//               &nbsp;{desc}。</div>;
//           }) }
//       </ColumnWidth>
//     },
//     edit:(inp:any,setInp:(a:any)=>void)=>{
//       return <LineColumn  column={option?.column ?? 8}>
//         { contentArr.map(([desc,name] : any, i:number)=> {
//           return <InputLine key={i} label={`${desc}:`} lineStyle={css({
//             "& .Switch": {
//               flex: 'unset',
//             }
//           })}>
//             <CheckSwitch  checked={inp?.[name] || false} onChange={e => setInp({...inp, [name]: inp?.[name]? undefined:true}) } />
//           </InputLine>
//         }) }
//       </LineColumn>
//     },
//     names: contentArr.map(([_,name] : any, i:number)=> name),
//     toTail: label,
//   };
// }

/**跳转链接：测量的。
 * @param tag : 链接action: Hash标签
 * @param rep 报告对象。
 * */
type JumpMeasureProps = {
    children: React.ReactNode
    rep: {
        modeltype?: string
        modelversion?: string
        id?: string
    }
    tag: string
}

/**打印时不显示
* */
export const JumpMeasure = ({ children, rep, tag }: JumpMeasureProps) => {
    return (
       <JumpTab
            href={`/rep/${rep.id}/${rep.modeltype}/${rep.modelversion}/${tag}?original=1#${tag}`}
            className="no-underline hover:no-underline group relative cursor-pointer print:hidden"
        >
          <span className="text-h4 font-semibold transition-colors group-hover:text-primary-600 print:text-foreground print:hidden">
            {children}
          </span>
       </JumpTab>
    )
}


type JumpOrgMemoProps = {
  children: React.ReactNode
  tag: string
  //醒目的按钮形态
  big?: boolean;
    //针对左右两半框架页面封装的页面形式：是在右边的页面吗
    right?: boolean;
}
/**跳往： 格式化的“原始记录”页面 之内 的备注。
 * */
// export const JumpOrgTag = ({ children, tag, big }: JumpOrgMemoProps) => {
//     const router = useRouter()
//     const handleClick = async (e: React.MouseEvent) => {
//         e.preventDefault()
//         await router.push(`${router.pathname}?original=1#${tag}`)
//     }
//     return (
//         <button onClick={handleClick}
//             className="border-none cursor-pointer group relative print:hidden"
//             type="button"
//         >
//             <div className={`${big ? 'mb-0 font-bold' : ''} ${big ? 'text-lg' : 'text-base'}`}>
//                 {children}
//                 <span className="absolute -inset-0.5 bg-gray-100 rounded-lg transition-all group-hover:opacity-0" />
//             </div>
//         </button>
//     )
// }

// export const JumpOrgTag2= ({ children, tag, big}: JumpOrgMemoProps
// ) =>{
//   const { history } = useContext(RoutingContext);
//   // const context =useContext(PanelEnlargeCtx);
//   return <Touchable css={{border:'none', "@media print": {display: 'none'}}}
//                    onPress={ async (e) => {
//                      // e!.stopPropagation();
//                      e!.preventDefault();
//                      await history.push(`${history.location.pathname}?original=1#${tag}` );
//                    }}
//           >
//           {
//               big? <div  css={{marginBottom:0,fontWeight: 'bolder'}}>{children}</div>
//               :
//               children
//           }
//     </Touchable>
// };

type JumpPrefProps = {
  children: React.ReactNode
  tag: string
  rep: any
  //针对左右两半框架页面封装的页面形式：是在右边的页面吗
  right?: boolean;
}
/**给通用前缀项目列表内嵌入的，点击导航： 避免用JumpMeasure出现一次点却2次导航。
* */
// export const JumpPref= ({ children, tag, rep, right=true}: JumpPrefProps
// ) =>{
//   const { history } = useContext(RoutingContext);
//   const context =useContext(PanelEnlargeCtx);
//   const href=`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${tag}?original=1#${tag}`;
//   return <Touchable css={{border:'none',display: 'flex',margin: 'auto',cursor: 'pointer', "@media print": {display: 'none'}}}
//                     onPress={ async (e) => {
//                       e!.stopPropagation();
//                       e!.preventDefault();
//                       await history.push(href);
//                       await context?.setActivecas(right? 0 : 1);
//                     }}
//   >
//     <Text variant="h5" css={{marginBottom:0}}>{children}</Text>
//   </Touchable>
// };
