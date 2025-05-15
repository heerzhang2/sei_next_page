import * as React from "react";
import {useAreaFoldable} from "../common/helper";
// import {VsProjects默认} from "../vessel/orcBase";

/**【代码复用】从独立流转的分项返回主报告链接,
 * */
export function useMainRepUrlOr(rep: any
) {
    const urlMainRep=React.useMemo(() => {
        const isMain=rep?.id===rep?.isp?.report?.id;      //是不是在主报告中：嵌入式的分项。
        const {node: mainRep}=rep?.isp?.reps?.edges?.find(({node: {id}}:any) => id===rep?.isp?.report?.id);
        //isMain= false 独立的分项报告
        const urlMainRep=`/report/${mainRep?.modeltype}/ver/${mainRep?.modelversion}/${mainRep?.id}/ALL`;
        const urlMainRep2=`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`;
        // console.log("测厚useMainRepUrlOr分项不再更新吗",rep,"isMain",isMain,urlMainRep,urlMainRep2,mainRep);
        return urlMainRep;
    }, [rep ]);

  return { urlMainRep };
}

/**拆分显示分项报告列表：折叠。
 * 有些分项报告 跟拖拉机一样可能很多的同一类型 10 几十个的； 单线图，特性表。
 *输入： parentOrc?._THICKM_VS?.map((surpId: any, i:number)
 * @param blockMax: 分组，一次显示最多几个分项的。
 * @param viewALL: 外部注入控制 全部显示？
 * @return {areaIdAs，sumArea } ,其中areaIdAs是二维数组的拆分来自srepIds的id。 而sumArea是几个可折叠区域。
 * */
//只好限制写死：组数量最大=30组折叠的。
export const MAX_ZDAREA_BLOCK=30;
const seeDefsFix1=new Array(MAX_ZDAREA_BLOCK).fill(false);       //动态会hook报错
seeDefsFix1[0]=true;           //$ #仅仅是初始用的取值，共享可修改的变量 #。
const seeDefsFix2=new Array(MAX_ZDAREA_BLOCK).fill(false);       //动态会hook报错
export function useSplitSubRepList(srepIds: any[], blockMax:number, viewALL:boolean
) {
    const all=React.useMemo(() => {
        const sumArea=srepIds?.length>0? Math.ceil(srepIds?.length/blockMax) : 1;
        if(sumArea>MAX_ZDAREA_BLOCK)    throw new Error("超过设计折叠区数");
        // const refs =useProjectListAs({count: sumArea } );
        let areaIdAs: any[]=[];
        for(let i = 0; i < sumArea; i++) {
            areaIdAs[i]= srepIds?.slice(i*blockMax, (i+1)*blockMax);
        }
        // let seeDefs= new Array(sumArea).fill(false);
        // seeDefs[0]=true;
        //[可惜啊] 原始记录context source storage orc任何变动，都会导致@这里重新运行的！！！
        return { sumArea, areaIdAs, };
    }, [srepIds, blockMax]);
    const { ...other}=all;
    // seeDefsFix[0]= true;            //【问题】全局变量被其他组件用useFoldForList时刻所修改了
    //【没法做动态增加的】seeDefsFix seeDefs；报错Rendered more hooks than during the previous render.
    const btnBindUses =useAreaFoldable(viewALL, seeDefsFix1);
    //seeDefs ？？抛弃，固定最大3组的seeDefsFix
    return { ...other, btnBindUses };
}
/**建议多少个为好的？ 被限制于MAX_ZDAREA_BLOCK， 配合useSplitSubRepList，useFoldForList；
 * 因为HOOK报错#不能随意增加的折叠绑定组件的动态创建。【只好】限定区块极最大数。静态化数组seeDefsFix替代动态的数组。让极多情形下，自动增加每组的需要显示的个数，这个时刻每组显示比预定义的要多了！
 * @param blockMax 默认 理想是几个一组的。
 * @param srepIdsLen 全部id数量
 * */
export function useSplitSubCapacity(srepIdsLen: number, blockMax:number
) {
    const size=React.useMemo(() => {
        const sumArea=srepIdsLen>0? Math.ceil(srepIdsLen/blockMax) : 1;
        if(sumArea>MAX_ZDAREA_BLOCK)
            return  Math.ceil(srepIdsLen/MAX_ZDAREA_BLOCK)
        else
            return  blockMax;
    }, [srepIdsLen, blockMax]);
    return size;
}
/**单线图，特性表，太多的，可折叠 显示。
 * @param blockMax: 分组，一次显示最多几个分项的。
 * @param viewALL: 外部注入控制 全部显示？
 * @param hidden: 默认也不显示第一个区块的内容？=全折叠的。
 * @return {areaContent，sumArea }
 * */
export function useFoldForList(list: any[], blockMax:number, viewALL:boolean, hidden?:boolean
) {
    const all=React.useMemo(() => {
        const sumArea=list?.length>0? Math.ceil(list?.length/blockMax) : 1;
        if(sumArea>MAX_ZDAREA_BLOCK)    throw new Error("超过设计折叠区数");
        let areaContent: any[]=[];
        for(let i = 0; i < sumArea; i++) {
            areaContent[i]= list?.slice(i*blockMax, (i+1)*blockMax);
        }
        return { sumArea, areaContent };
    }, [list, blockMax]);
    // seeDefsFix[0]= !hidden;
    const btnBindUses =useAreaFoldable(viewALL, hidden? seeDefsFix2 : seeDefsFix1);
    return { ...all, btnBindUses };
}
/**可折叠：只能支持一个项目的#。不是数组 多对象控制的。
 * @param blockMax: 分组，一次显示最多几个分项的。
 * @param viewALL: 外部注入控制 全部显示？
 * @param hidden: 默认也不显示第一个区块的内容？=全折叠的。
 * @return {areaContent，sumArea }
 * */
export function useFoldFor(list: any[], blockMax:number, viewALL:boolean, hidden?:boolean
) {
    const all=React.useMemo(() => {
        const sumArea=list?.length>0? Math.ceil(list?.length/blockMax) : 1;
        if(sumArea>MAX_ZDAREA_BLOCK)    throw new Error("超过设计折叠区数");
        let areaContent: any[]=[];
        for(let i = 0; i < sumArea; i++) {
            areaContent[i]= list?.slice(i*blockMax, (i+1)*blockMax);
        }
        return { sumArea, areaContent };
    }, [list, blockMax]);
    // seeDefsFix[0]= !hidden;
    const btnBindUses =useAreaFoldable(viewALL, hidden? seeDefsFix2 : seeDefsFix1);
    return { ...all, btnBindUses };
}
/**报告目录菜单的链接构造,     #${VsProjects默认[5].ha}` VsProjects默认
 * @param configProjs: 配置好的分项 hash；其对象必须有{name,ha}两个属性字段。
 * @param projects: 实际的分项。
 * 【问题】不在项目目录列表无法增加，附加的的插入位置？
 * */
const MAX_MENU_ITEMS=8;       //小屏幕第一层次弹出来菜单允许最多有几行。
// export function useRepMenuDirItems(configProjs: any[], projects: any[]=[], url:string
// ) {
//     const router = useRouter();
//     // const {history } = useContext(RoutingContext);
//     const searchParams = useSearchParams()
//     const [printing, setPrinting] = useState(false)
//     useEffect(() => {
//         const printing = searchParams.get('print')
//         setPrinting(!!printing)
//     }, [searchParams])
//
//     const menu=React.useMemo(() => {
//         let result=[] as any;
//         if(projects.length>0){
//             projects?.forEach(subrp => {
//                 if(subrp?.do){
//                     const predef=configProjs?.find((obj:any) => obj?.name===subrp?.name);
//                     if(predef){
//                         const {name,ha}=predef;
//                         result.push({name,ha});
//                     }
//                 }
//             });
//         }else{     //不需要后端存储分项报告projects配置的情况，仅仅前端做hash路由的标签点集合。
//             configProjs.forEach(predef => {
//                 const {name,ha}=predef;
//                 result.push({name,ha});
//             });
//         }
//         const _length = result.length;
//         const _splitNums = _length % MAX_MENU_ITEMS === 0 ? _length / MAX_MENU_ITEMS : Math.ceil(_length / MAX_MENU_ITEMS);
//         let all = [];       //拆分成二维数组的；
//         for(let i = 0; i < _splitNums; i++){
//             let _tempArr = result.slice(i * MAX_MENU_ITEMS, i * MAX_MENU_ITEMS + MAX_MENU_ITEMS);
//             all.push(_tempArr);
//         }
//         let arrLayer=[];
//         for(let i=0; i<all.length; i++){
//             const parts=all[i];
//             const nestMn=parts.map((part: {name: string; ha: string; }, i:number) => {
//                 return  (
//                     <DdMenuItem  key={i}  label={part?.name} onClick={() => { router.push(`${url}#${part?.ha}`);
//                     }}>{part?.name}</DdMenuItem>
//                 );
//             });
//             arrLayer.push(nestMn);
//         }
//         let doms=null;
//         for(let i=arrLayer.length-1; i>=0; i--){
//             if(i>0){
//                 doms= <>
//                     { (i < arrLayer.length-1) &&  <DdMenu key={i} label="更多">
//                                  { doms }
//                                 </DdMenu>
//                     }
//                     { arrLayer[i] }
//                     </>;
//             }
//             else{
//                 doms= <LeftTopMenuBar id={'topleftmenu'} css={{
//                         justifyContent: "space-between", "@media print": {display: 'none',}
//                     }}>
//                         <DdMenu key={i} label="报告目录"  tight={true}
//                                 icon={<IconCpu size={'lg'} css={{background: printing? 'unset':'gold'}}/> }
//                                 divStyle={{lineHeight: '1.0', width: '2rem',
//                                 }}
//                         >
//                             { (arrLayer.length>1) &&  <DdMenu label="更多">
//                                          { doms }
//                                         </DdMenu>
//                             }
//                             { arrLayer[i] }
//                         </DdMenu>
//                     </LeftTopMenuBar>;
//             }
//         }
//
//         return <React.Fragment>
//             <Global
//                 styles={{
//                     html: {
//                         "#root #topleftmenu": {
//                             opacity: '0.5',
//                         }
//                     }
//                 }}
//             />
//             {doms}
//         </React.Fragment>;
//     }, [projects,printing,router, url, configProjs]);
//
//     return [ menu ];
// }

/**没有分项目报告的版本：不用后端存储的，前端预定义标签做法。 #页面哈希路由方式;
 * */
// export function useRepMenuDirItemT(configProjs: any[], url:string
// ) {
//     const {history } = useContext(RoutingContext);
//     const qs= queryString.parse(window.location.search);
//     const printing =qs && !!qs.print;
//     const menu=React.useMemo(() => {
//         let result=[] as any;
//         configProjs.forEach(predef => {
//             const {name,ha}=predef;
//             result.push({name,ha});
//         });
//         const _length = result.length;
//         const _splitNums = _length % MAX_MENU_ITEMS === 0 ? _length / MAX_MENU_ITEMS : Math.ceil(_length / MAX_MENU_ITEMS);
//         let all = [];       //拆分成二维数组的；
//         for(let i = 0; i < _splitNums; i++){
//             let _tempArr = result.slice(i * MAX_MENU_ITEMS, i * MAX_MENU_ITEMS + MAX_MENU_ITEMS);
//             all.push(_tempArr);
//         }
//         let arrLayer=[];
//         for(let i=0; i<all.length; i++){
//             const parts=all[i];
//             const nestMn=parts.map((part: {name: string; ha: string; }, i:number) => {
//                 return  (
//                     <DdMenuItem  key={i}  label={part?.name} onClick={() => { history.push(`${url}#${part?.ha}`, {time: Date()});
//                     }}>{part?.name}</DdMenuItem>
//                 );
//             });
//             arrLayer.push(nestMn);
//         }
//         let doms=null;
//         for(let i=arrLayer.length-1; i>=0; i--){
//             if(i>0){
//                 doms= <>
//                     { (i < arrLayer.length-1) &&  <DdMenu key={i} label="更多">
//                         { doms }
//                     </DdMenu>
//                     }
//                     { arrLayer[i] }
//                 </>;
//             }
//             else{
//                 doms= <LeftTopMenuBar id={'topleftmenu'} css={{
//                     justifyContent: "space-between", "@media print": {display: 'none',}
//                 }}>
//                     <DdMenu key={i} label="报告目录"  tight={true}
//                             icon={<IconCpu size={'lg'} css={{background: printing? 'unset':'gold'}}/> }
//                             divStyle={{lineHeight: '1.0', width: '2rem',
//                             }}
//                     >
//                         { (arrLayer.length>1) &&  <DdMenu label="更多">
//                             { doms }
//                         </DdMenu>
//                         }
//                         { arrLayer[i] }
//                     </DdMenu>
//                 </LeftTopMenuBar>;
//             }
//         }
//
//         return <React.Fragment>
//             <Global
//                 styles={{
//                     html: {
//                         "#root #topleftmenu": {
//                             opacity: '0.5',
//                         }
//                     }
//                 }}
//             />
//             {doms}
//         </React.Fragment>;
//     }, [printing, url,history, configProjs]);
//
//     return [ menu ];
// }

/**可折叠的render回调
 * @param dlPage  队列已经切分后，当前显示的某一个对象。
 * @param arak  折叠区域索引号。
 * @param pid   当前的折叠区的内部的顺序页的序号（但这1页实际还能分成4个单元位置的）
 * */
export declare type FoldRenderCallback = (dlPage: any, arak:number, pid:number) => React.ReactNode;

/**较为通用的 抽象组件： 队列的折叠
 * @property areaContent 已经被且切分的二维数组的对象。【已经在外面切分好的】
 * @property callback 如何做实际的下一级的组件展示。
 * @property sumArea 已经分成了几个区域
 * @property btnBindUses 每个区域的 button 控制绑定
 * @property zeroDisp  第一页总是会执行显示的，尽管队列为空。
 * @property mark  用于醒目分辨的区域标题
 * */
// export function useFoldGenerate({sumArea,btnBindUses,areaContent,callback,mark,zeroDisp}
//           : {sumArea:number,btnBindUses:any[],areaContent:any[][],callback:FoldRenderCallback,mark?:string,zeroDisp?:boolean}
// ) {
//     const render=<React.Fragment>
//         {(new Array(sumArea).fill(null)).map((s:any,ak:number) => {
//             const [isDisplay, bindBtn]=btnBindUses[ak];      //不要加上 tabIndex={0} 超过折叠区域最大数量的？
//             // console.log("可折叠区的-第ak个大折叠ak=",ak);
//             //可折叠区的：独立流转的报告，和内嵌分项的，实际还分开的。两者独自控制折叠的。内嵌分项rep.id相等，独立流转的却不等的ID;
//             return <React.Fragment key={ak}>
//                 <div role="button" {...bindBtn}  css={{"@media print":{display: 'none'}}}>
//                     <Text variant="h4">{`${mark??'可折叠区'}${ak+1}，`}{isDisplay ? `收起`:`更多..`}</Text>
//                 </div>
//                 <Collapse  id={`${ak}_c`} show={isDisplay} noAnimated>
//                     { areaContent[ak]?.map((one: any, m:number) => {
//                         // console.log("可折叠区的气派第二层areaContent[ak]- one=",one ,"ak=",ak, "m=",m);
//                       return <React.Fragment key={m}>
//                         {callback(one, ak, m)}
//                       </React.Fragment>
//                     }) }
//                     { zeroDisp && undefined===areaContent[ak] &&
//                         <>
//                             {callback(undefined, 0, 0)}
//                         </>
//                     }
//                 <div role="button" {...bindBtn}  css={{"@media print":{display: 'none'}}}>
//                     <Text variant="h4">{`${mark??'可折叠区'}${ak+1}结束,收起`}</Text>
//                 </div>
//                     </Collapse>
//                 </React.Fragment>;
//         })}
//     </React.Fragment>;
//     return [ render ];
// }

export declare type NodeCallback = () => React.ReactNode;
/**某些页面可折叠的： 非列表多个页面的情况。
 * @property callback 如何做实际的下一级的组件展示。
 * @property mark  用于醒目分辨的区域标题
 * @property hidden 初始是隐藏吗
 * */
// export function useFolder(callback:NodeCallback, mark:any,hidden?:boolean
// ) {
//     const uid = React.useId();
//     const btnBindUses =useAreaFoldable(false, hidden? [false] : [true]);
//     const [isDisplay, bindBtn]=btnBindUses[0];
//     const render=<React.Fragment >
//                 <div role="button" {...bindBtn}  css={{"@media print":{display: 'none'}}}>
//                     <Text variant="h4">{`${mark??'可折叠区'}，`}{isDisplay ? `收起`:`更多..`}</Text>
//                 </div>
//                 <Collapse  id={uid} show={isDisplay} noAnimated>
//                     {callback()}
//                     <div role="button" {...bindBtn}  css={{"@media print":{display: 'none'}}}>
//                         <Text variant="h4">{`${mark??'可折叠区'}结束,收起`}</Text>
//                     </div>
//                 </Collapse>
//             </React.Fragment>;
//     return [ render ];
// }

