import * as React from "react";
import {EachMeasureCritConfig,  } from "../common/msCriteria";

/**比较少见：支持判定栏目的 测量表的编辑器。
 * 编辑器，观测值及测量结果记录表 内容组织。   #扩充能力版，更多列的，内容支持node;
 * @param config  config观测数据;
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @param defaultSave  若=true的表示有做转换规则的行也必须都做存储。
 * */
// export function useJudgmentEdit(inp:any, setInp:React.Dispatch<React.SetStateAction<any>>, config: EachMeasureCritConfig[][], allowableV: boolean, defaultSave: boolean
// ) {
//     const [itemObservation, itemObservationA] = React.useMemo(() => {
//         const itemObserv: string[] = [];
//         const itemAObserv: string[] = [];
//         config.forEach((line: EachMeasureCritConfig[], i: number) => {
//             if (line[0]?.n) {
//                 const itrsName = line[0]?.n + 'r';
//                 line.forEach(({n,}: EachMeasureCritConfig, k: number) => {
//                     itemObserv.push(n);
//                     if(allowableV)   itemAObserv.push(n+'a');        //扩充字段：允许取值；
//                 });
//                 itemAObserv.push(itrsName);
//             }
//             if (line[0]?.check && line[0]?.sync) {
//                 itemAObserv.push(line[0]?.sync);
//             }
//         });
//         return [itemObserv, itemAObserv];
//     }, [config,allowableV]);
//             // const [getInpFilter] = useMeasureInpFilter(itemObservation, itemObservationA,);
//             // const {inp, setInp} = useItemInputControl({ref});
//     //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
//     const render= React.useMemo(() =>
//         {
//             let bigLabel: any;
//             let secoLabel: any;
//             let thirdLabel: any;     //第三个级别继承做显示的？
//             let unit: any;
//             let resultName: any;
//             //改成数组形式[Node],可方便外部做修改的！
//          return config.map((line: EachMeasureCritConfig[], i: number) => {
//                     //line 对应了单独一个序号：一个序号对应多个的 嵌套的子行；
//                     const firstLn = line[0];
//                     let checkLine: boolean;
//                     if( (firstLn?.check || firstLn?.n === undefined) )
//                         checkLine = true;
//                     //经过一次结论 check 行之后自动清空；
//                     const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
//                     if(resultName===undefined && seqLineName){
//                         resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
//                     }
//                     const lcColumns=allowableV? (firstLn?.omit? 5 : 3) : (firstLn?.omit? 3 : 4);           //有些情形太紧凑！
//
//                     let preNodeObj: { outNode: JSX.Element|undefined; lcNode: JSX.Element; }[]=[];      //{lcNode,outNode}预备DOM的，可能插入不是适合<LineColumn内部拼凑载入的节点。需要提取到LineColumn外部。
//                     line.forEach(({n,t,u,check,omit,save,c,d,x,sync,cit,vlNe,slim}: EachMeasureCritConfig, k:number)=> {
//                         // React.useEffect(() => {
//                         //   setInp({...inp, sss: 'dfg'});
//                         // }, []);
//                         if(checkLine){
//                             const labelCheck=check??bigLabel;
//                             if(resultName===undefined)    throw new Error("没提供测seqLineName");
//                             let resulTag=sync??(resultName + 'r');
//                             let lcNode=<InputLine label={labelCheck+`-结果判定:`} key={i}>
//                                 <SelectHookfork value={ inp?.[resulTag] ||''}
//                                                 onChange={e => setInp({ ...inp, [resulTag]: e.currentTarget.value||undefined}) }/>
//                             </InputLine>;
//                             preNodeObj.push({ lcNode, outNode:undefined });
//                             resultName=undefined;
//                         }
//                         else{
//                             if(!t)    throw new Error("没提供测量子项");
//
//                             const tCopy=[...t];       //确保原始配置不会被这里修改了。后续其它代码浅层拷贝的，依赖旧的原始配置。
//                             //对于t:[undefined,undefined,undefined]那么前面几个标题会显示继承文字的，但是若t:[],就会忽略掉的。 若最后一个有配置的导致t不是[]的必然就复制默认，前面几个标题就都会显示出来。
//                             if(t[0]!==undefined)
//                                 bigLabel=t[0];
//                             else if(t.length>=1)
//                                 tCopy[0]=bigLabel;
//                             if(t[1]!==undefined)
//                                 secoLabel=t[1];
//                             else if(t.length>=2)
//                                 tCopy[1]=secoLabel;      //继承了默认值
//                             if(t[2]!==undefined)
//                                 thirdLabel=t[2];
//                             else if(t.length>=3)
//                                 tCopy[2]=thirdLabel;      //继承
//                             if(slim!==undefined){
//                                 tCopy[0]= slim===''? <Text>《同上》</Text> : slim;
//                                 tCopy[1]='';
//                                 tCopy[2]='';
//                             }
//                             if(u!==undefined)
//                                 unit=u;
//                             let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
//                             let calculate;
//                             const oname=n+'o';
//                             const ovalue=inp?.[oname];
//                             //【未考虑】omit合并结果的同时还要转换结果同时生效的情形？
//                             if('四'===c){
//                                 let digits =0===d? 0 : d? Number(d) : 1;
//                                 calculate=floatInterception(ovalue,digits,);
//                             }
//                             else if('弃'===c){
//                                 let digits =0===d? 0 : d? Number(d) : 1;
//                                 calculate=floatInterception(ovalue,digits, 'floor');
//                             }
//                             //默认自动转换计算的 还是人工修改后的，在显示上差别处理
//                             if(undefined!==c){
//                                 resEdit= (undefined===save)?  defaultSave : save;
//                             }
//                             let prepareN : { outNode: JSX.Element|undefined; lcNode: JSX.Element; };
//                             if(omit===true){
//                                 let lcNode=<MeasurementLineCrit item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
//                                                                 cit={cit}  resEdit={resEdit} only={true} resDeft={calculate} />
//                                 prepareN={ lcNode, outNode:undefined };
//                             }
//                             else{
//                                 if(omit===undefined || omit===false) {
//                                     //【多数情形】
//                                     let lcNode=<MeasurementLineCrit item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
//                                                                     cit={cit}  resEdit={resEdit} only={false} resDeft={calculate} />
//                                     //这个位置加outNode的导致分拆成多行来显示。
//                                     prepareN={ lcNode, outNode:undefined };
//                                 }
//                                 else{
//                                     //若有合并多行的特殊情况： 标题突出指代几个编辑器所属含义= omit 的文本。
//                                     let lcNode=<MeasurementLineCrit item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
//                                                                     cit={cit}  resEdit={resEdit} only={vlNe===1? true:false}
//                                                                     resDeft={calculate} seqLineName={seqLineName} labelOmit={omit as string} />
//                                     let descNodes=[];
//                                     for(let l=0;l<tCopy.length;l++){
//                                         descNodes.push(<Text key={l+1} css={{marginLeft: '1rem'}}>{tCopy[l]}</Text>);
//                                     }
//                                     if(x){
//                                         descNodes.push(<Text key={0} css={{marginLeft: '1rem'}}>{x}</Text>);
//                                     }
//                                     let outNode=<div css={{marginLeft: '1rem'}}>{descNodes}{' >>'}</div>;
//                                     prepareN={ lcNode, outNode: vlNe===1? undefined : outNode };
//                                 }
//                             }
//                             preNodeObj.push(prepareN);
//                         }
//                     });
//                     let insertIdx=0;
//                     let htmlNodes=[];          //考虑？肢解开：  key取值 报错
//                     //往前探查方向，是否存在外部溢出元素？
//                     let lcNodesNow=[];
//                     for(; insertIdx<preNodeObj.length; insertIdx++){
//                         for(; insertIdx<preNodeObj.length; insertIdx++){
//                             const {lcNode,outNode}=preNodeObj[insertIdx];
//                             if(outNode)  break;
//                             let modifyNode={...lcNode};
//                             Object.assign(modifyNode,{ key: 'L'+insertIdx });
//                             lcNodesNow.push(modifyNode);
//                         }
//                         //拆分段落模式：【假定】outNode必然在前面的，而lcNode只能位于底下顺序接着的。
//                         if(lcNodesNow.length>=1){
//                             const lcHtml=<React.Fragment key={i+'_'+insertIdx}>
//                                 <LineColumn  column={lcColumns} >
//                                     { lcNodesNow }
//                                 </LineColumn>
//                             </React.Fragment>;
//                             htmlNodes.push(lcHtml);
//                             lcNodesNow=[];         //局部
//                         }
//                         if(insertIdx<preNodeObj.length){
//                             if(preNodeObj[insertIdx]?.outNode){
//                                 let modifyNode={ ...(preNodeObj[insertIdx]?.outNode) };
//                                 Object.assign(modifyNode,{ key: 'W'+insertIdx });
//                                 htmlNodes.push(modifyNode  as any);            //插入outNode 若不加 as any 类型报错。
//                             }
//                             if(preNodeObj[insertIdx]?.lcNode){
//                                 let modifyNode={...(preNodeObj[insertIdx]?.lcNode)};
//                                 Object.assign(modifyNode,{ key: 'Y'+insertIdx });
//                                 lcNodesNow.push(modifyNode);               //给下一个区域去：被插入outNode了情形。
//                             }
//                         }
//                     }
//                     //残留的一部分：
//                     if(lcNodesNow.length>=1){
//                         const lcHtml=<React.Fragment key={i+'T'}>
//                             <LineColumn  column={lcColumns} >
//                                 { lcNodesNow }
//                             </LineColumn>
//                         </React.Fragment>;
//                         htmlNodes.push(lcHtml);
//                     }
//                     //这个序号结束： 一个序号对应多个内部小行的，多行就是多个 x: item多个的,可序号都是同一个的。htmlNodes对应同一序号全部几行
//                     return <div key={i} css={{marginTop: i>0? '1rem' : undefined,}}>
//                         {htmlNodes}
//                     </div>;
//                 });
//         }
//         ,[config,inp,allowableV,defaultSave,setInp]);
//
//     //状态控制部分useItemInputControl({ref})等需要上一级组件一起公用的，所以拆分穿插掉。需要返回itemObservation给上级组件
//   return { render ,itemObservation, itemObservationA};
// }

interface EachJudgmentConfig2X extends EachMeasureCritConfig{
    /**项目编号第一级bspan, 检验项目第二级别span标题；单位； 结果值{允许取值}；检验结果；
     * */
    bspan?: number;
    span?: number;      //第二级标题的 rowSpan 竖跨。
    tspan?: number;      //第三个级标题的 rowSpan
    //fspan?: number;      //还没有遇到，不考虑第四个级标题的rowSpan
    //另外的：附加的检测项目栏目：只会每一行单独的；
    uspan?: number;     //单位unit 栏目的 span
    vspan?: number;     //结果值 value 栏
    rspan?: number;     //result检验结果 栏
    cspan?: number;     //判定标准  栏目的 span
    sync?: string;      //对应的归属区块的底下的那个check配置行，结论存储字段和大项目列表的字段做同步了；sync=大项目列表检验结果的存储名。
}
/**先对配置的跨行span:初始化处置，默认计算的字段。
 * @param config  配置。      浅拷贝，会修改了原始配置对象。
 * 【配置注意】t:[,,]后面有配第二列的，前面也需要配相应列。
 * 约束：测量结果的合并 omit 有多个组合的情况，必须分解成多个序号方式。
 * */
const useJudgmentConfigExtend2= ({ config, }  :{ config:EachMeasureCritConfig[][],  }
) => {
    //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
    // let configExtend=[...config观测数据] as EachJudgmentConfig2X[][];
    const configExtend =React.useMemo(() => {
        // let bigLabel: any;
        let bigCross: EachJudgmentConfig2X;
        let secoCross: EachJudgmentConfig2X;
        let thirdCross: EachJudgmentConfig2X;
        let unitCross: EachJudgmentConfig2X;
        let citCross: EachJudgmentConfig2X;      //判定标准栏目
        let valueCross: EachJudgmentConfig2X|undefined;
        let resultCross: EachJudgmentConfig2X|undefined;
        let resultName: any;
        const caseCit=config[0][0]?.cit!==undefined;        //有判定标准栏目的情形：
        config.forEach((line: EachMeasureCritConfig[], i:number) => {
            const firstLn = line[0];
            let checkLine: boolean;
            if( (firstLn?.check || firstLn?.n === undefined) )
                checkLine = true;
            const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
            if(resultName===undefined && seqLineName){
                resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
            }
            //line切换{可能多个小项目}：导致序号++，编辑器的布局也新开一行的。 omit局限在一个line内部的！
            valueCross=undefined;
            line.forEach((subObj: EachMeasureCritConfig, k:number)=> {
                //嵌套的小行：对应同一个序号的多个项目子行；
                const {t, u,omit,cit}=subObj;
                if(checkLine){
                    if(resultName===undefined)    throw new Error("没提供测seqLineName");
                    if(resultCross){
                        resultCross.sync= firstLn.sync;         //复制给本check区块的第一行的
                    }
                    resultName=undefined;
                    resultCross=undefined;
                }
                else{
                    if(t[0]!==undefined && t[0]!==null){
                        bigCross=subObj;
                        bigCross.bspan=1;
                    }
                    else if(t.length>=1){
                        bigCross.bspan=bigCross.bspan!+1;
                    }
                    if(t[1]!==undefined && t[1]!==null){
                        secoCross=subObj;
                        secoCross.span=1;
                    }
                    else if(t.length>=2){
                        secoCross.span=secoCross.span!+1;
                    }
                    //用null替代undefined来表明正式报告打印要合并Cell同时原始记录却不需要显示这些继承标题栏目的。
                    if(t[2]!==undefined && t[2]!==null){           //另外有第四级别的t[3]不考虑跨行的span融合Cell;
                        thirdCross=subObj;
                        thirdCross.tspan=1;
                    }
                    else if(t.length>=3){
                        thirdCross.tspan=thirdCross.tspan!+1;
                    }
                    //【未遇见的】暂不考虑第四个级标题的 fspan ==#；第四级都是不相同
                    if(u!==undefined){
                        unitCross=subObj;
                        unitCross.uspan=1;
                    }
                    else{
                        unitCross.uspan=unitCross.uspan!+1;
                    }
                    if(caseCit){
                        if(cit!==undefined){        //第一行若为undefined就无法初始化了。
                            citCross=subObj;
                            citCross.cspan=1;
                        }
                        else{
                            citCross.cspan=citCross.cspan!+1;
                        }
                    }
                    //if(omit===true){  为了支持多行的 中间做分组结果融合的；
                    if(omit!==undefined && omit!==false){
                        if(valueCross===undefined){
                            valueCross=subObj;
                            valueCross.vspan=1;
                        }
                        else
                            valueCross.vspan=valueCross.vspan!+1;
                    }
                    else{
                        //增加 omit=false 来指出上面的跨行合并在这里被中止了！
                        if(valueCross!==undefined && omit!==false)
                            valueCross.vspan=valueCross.vspan!+1;
                        valueCross=undefined;
                    }
                    if(resultCross===undefined){
                        resultCross=subObj;
                        resultCross.rspan=1;
                    }
                    else
                        resultCross.rspan=resultCross.rspan!+1;
                }
            });
        });
        return config;
    }, [config,]);
    //# 实际 @会修改了原始config配置对象。
    return [configExtend];
};

interface JudgmentTableProps {
    orc: any;
    config: EachMeasureCritConfig[][];
    allowableV?: boolean;
    defaultSave?: boolean;
    rep: any;
    seqOfs?: number;   //默认=0 序号的开始,去掉前面几个
    nseq?: boolean;     //有无序号列, 默认有的
    //前缀区域栏目都被替换；【灵活应对】支持在第一行{&&第一个主项目}的前面位置插入自定义DOM： 可能直接替换项目主列 x 前面的那些列们。
    inPreN?: any;     //主项目item列之前的全部都隐藏不显示,同时用这个Node来替代它们原本的位置,仅仅对第一行起作用，但若有中间位置插入的拆分做了。
    tag?:string;      //导航用的id
}
/**正式报告可插入Node版本, 支持判定标准栏目。  @通常的还是改用 useMeasureTable 组件@
 * 判定栏目和允许值栏目两个实际是不同的。@ 前者是不可以输入的。后者是用户可与修改的录入项。
 * 测量：报告的 格式化原始记录的表格展示，显示逻辑变简单了，但是对配置的修改要求变麻烦了。 #扩充能力版，更多列的，内容支持node;
 * @param config: 配置。
 * 标题区预备4个列，再加附加的一个可选的最小一级项目列，也即可选检测项目列必须要么全部配置要么全部不配置的(上层决定)。
 * 可支持用null替代undefined来表明正式报告打印要合并Cell同时原始记录却不需要显示这些继承标题栏目的。原先设计用来undefined导致原始记录是都会显示继承来的标题的。
 * [注意] 上级组件要对“检测项目”栏目，判别是否要显示该列，表头一起改！
 * 判断标准是模板定好的。 “允许值”是用户自己输入的。两个情形配置不同的。
 *  nseq?:boolean
 * 栏目的布局顺序=...单位，判定标准，x项目名字，其它的。
 * */
// export const useJudgmentTable= ({orc, config,allowableV,defaultSave,rep,seqOfs=0,nseq,inPreN,tag} : JudgmentTableProps
// ) => {
//     const caseCrit=config[0][0]?.cit!==undefined;     //表示有这个栏目：判定标准的1列；
//     //对配置的跨行span:初始化处置，默认计算的字段。
//     const [configExtend] = useJudgmentConfigExtend2({ config });
//     const renders =React.useMemo(() => {
//         let seq=seqOfs;
//         let resultName: any;
//         return configExtend.map((line: EachMeasureCritConfig[], i:number) => {
//                 const firstLn = line[0];
//                 let checkLine: boolean;
//                 if( (firstLn?.check || firstLn?.n === undefined) )
//                     checkLine = true;
//                 else  seq++;
//                 //经过一次结论 check 行之后自动清空；
//                 const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
//                 if(resultName===undefined && seqLineName){
//                     resultName= line[0]?.sync?  line[0]?.sync : seqLineName+'r';            //【约定】结论行必须是最少 这整个序号的。单独配置的sync优先使用check行配置。
//                 }
//                 return line.map(({n,t,x,u,check,omit,save,c,d,bspan,span,tspan,uspan,vspan,rspan,cit,cspan,vlNe}: EachJudgmentConfig2X, k:number)=> {
//                     if(checkLine){
//                         // const labelCheck=check??bigLabel;
//                         if(resultName===undefined)    throw new Error("没提供测seqLineName");
//                         resultName=undefined;
//                         return null;
//                     }
//                     else{
//                         //【浅层拷贝】这里不能够用  t[1]=secoLabel; 会导致直接修改了config观测数据的配置，导致上面逻辑失效repModel =React.useMemo(() => {}
//                         const xmqColmun=t.length;
//                         // let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
//                         let calculate;
//                         const oname=n+'o';
//                         const ovalue=orc?.[oname];
//                         calculate=convertMeasureType(ovalue,c!,d!);
//                         //config观测数据[0][0].t[0]='撒'; 这里修改影响到了原配置数组的！
//                         //默认自动转换计算的 还是人工修改后的，在显示上差别处理
//                         if(undefined!==c){
//                             // resEdit= (undefined===save)?  defaultSave! : save;
//                         }
//                         // console.log("检验设TableRow备情况$seq=", seq,'t=',t,bspan, "SPAN",span,secoLabel,t[1]);
//                         //底下的omit && vspan 只考虑序号行的第一个子项目的存储名字情形，归并不考虑自动转换的，只能支持手动输入；
//                         return (
//                             <TableRow key={i+'_'+k}  id={i===0 && k===0? tag : undefined}>
//                                 {(i===0 && k===0) && inPreN?  inPreN :
//                                     (i!==0 || k!==0) && inPreN? null :
//                                         <>
//                                             {!nseq && <CCell>{seq}</CCell> }
//                                             { bspan && <CCell colSpan={xmqColmun===1?4:1} rowSpan={bspan} split>{t[0]}</CCell>
//                                             }
//                                             { span && xmqColmun>=2 && <CCell colSpan={xmqColmun===2?3:1} rowSpan={span} split>{t[1]}</CCell>
//                                             }
//                                             { tspan && xmqColmun>=3 && <CCell colSpan={xmqColmun===3?2:1} rowSpan={tspan} split>{t[2]}</CCell>
//                                             }
//                                             { xmqColmun>=4 && <CCell >{t[3]}</CCell>
//                                             }
//                                         </>
//                                 }
//
//                                 { x && <CCell>{x}</CCell>
//                                 }
//                                 { u && uspan && <CCell rowSpan={uspan} split>{u}</CCell>
//                                 }
//                                 { caseCrit && ( (cit && cspan) ? <CCell rowSpan={cspan} split>{cit}</CCell>
//                                         : cit===undefined? null :
//                                         <CCell></CCell>
//                                 ) }
//                                 <CCell>{orc?.[n+'o']}</CCell>
//                                 { omit && vspan && <CCell rowSpan={vspan} split>{(vlNe!>0 && omit===true)? '／' : orc?.[n+'v']}</CCell>
//                                 }
//                                 { !omit  && <CCell>{orc?.[n+'v']??calculate}</CCell>
//                                 }
//                                 { allowableV && omit && vspan && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
//                                 }
//                                 { allowableV && !omit && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
//                                 }
//                                 { rspan && resultName && <CCell rowSpan={rspan} split>{orc?.[resultName]}</CCell>
//                                 }
//                             </TableRow>
//                         );
//                     }
//                 });
//             });
//     }, [orc,allowableV, configExtend,seqOfs]);
//     return  renders;
// };

/**可接龙归并的版本，测量表正式报告: 增加输出的实际几个序号的；
 * @return {
 *     rows : 旧版的render；
 *     seq : 新的最后一行序号
 * }
* */
// export const useJudgmentTableX= ({orc, config,allowableV,defaultSave,rep,seqOfs=0,nseq,inPreN} : JudgmentTableProps
// ) => {
//     const caseCrit=config[0][0]?.cit!==undefined;     //表示有这个栏目：判定标准的1列；
//     //对配置的跨行span:初始化处置，默认计算的字段。
//     const [configExtend] = useJudgmentConfigExtend2({ config });
//     const [rows, seq] =React.useMemo(() => {
//         let seq=seqOfs;
//         let resultName: any;
//         const rows=configExtend.map((line: EachMeasureCritConfig[], i:number) => {
//             const firstLn = line[0];
//             let checkLine: boolean;
//             if( (firstLn?.check || firstLn?.n === undefined) )
//                 checkLine = true;
//             else  seq++;
//             //经过一次结论 check 行之后自动清空；
//             const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
//             if(resultName===undefined && seqLineName){
//                 resultName= line[0]?.sync?  line[0]?.sync : seqLineName+'r';            //【约定】结论行必须是最少 这整个序号的。单独配置的sync优先使用check行配置。
//             }
//             return line.map(({n,t,x,u,check,omit,save,c,d,bspan,span,tspan,uspan,vspan,rspan,cit,cspan,vlNe}: EachJudgmentConfig2X, k:number)=> {
//                 if(checkLine){
//                     // const labelCheck=check??bigLabel;
//                     if(resultName===undefined)    throw new Error("没提供测seqLineName");
//                     resultName=undefined;
//                     return null;
//                 }
//                 else{
//                     //【浅层拷贝】这里不能够用  t[1]=secoLabel; 会导致直接修改了config观测数据的配置，导致上面逻辑失效repModel =React.useMemo(() => {}
//                     const xmqColmun=t.length;
//                     // let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
//                     let calculate;
//                     const oname=n+'o';
//                     const ovalue=orc?.[oname];
//                     calculate=convertMeasureType(ovalue,c!,d!);
//                     //config观测数据[0][0].t[0]='撒'; 这里修改影响到了原配置数组的！
//                     //默认自动转换计算的 还是人工修改后的，在显示上差别处理
//                     if(undefined!==c){
//                         // resEdit= (undefined===save)?  defaultSave! : save;
//                     }
//                     // console.log("检验设TableRow备情况$seq=", seq,'t=',t,bspan, "SPAN",span,secoLabel,t[1]);
//                     //底下的omit && vspan 只考虑序号行的第一个子项目的存储名字情形，归并不考虑自动转换的，只能支持手动输入；
//                     return (
//                         <TableRow key={i+'_'+k}>
//                             {(i===0 && k===0) && inPreN?  inPreN :
//                                 (i!==0 || k!==0) && inPreN? null :
//                                     <>
//                                         {!nseq && <CCell>{seq}</CCell> }
//                                         { bspan && <CCell colSpan={xmqColmun===1?4:1} rowSpan={bspan} split>{t[0]}</CCell>
//                                         }
//                                         { span && xmqColmun>=2 && <CCell colSpan={xmqColmun===2?3:1} rowSpan={span} split>{t[1]}</CCell>
//                                         }
//                                         { tspan && xmqColmun>=3 && <CCell colSpan={xmqColmun===3?2:1} rowSpan={tspan} split>{t[2]}</CCell>
//                                         }
//                                         { xmqColmun>=4 && <CCell >{t[3]}</CCell>
//                                         }
//                                     </>
//                             }
//
//                             { x && <CCell>{x}</CCell>
//                             }
//                             { u && uspan && <CCell rowSpan={uspan} split>{u}</CCell>
//                             }
//                             { caseCrit && ( (cit && cspan) ? <CCell rowSpan={cspan} split>{cit}</CCell>
//                                     : cit===undefined? null :
//                                         <CCell></CCell>
//                             ) }
//                             <CCell>{orc?.[n+'o']}</CCell>
//                             { omit && vspan && <CCell rowSpan={vspan} split>{vlNe!>0? '／' : orc?.[n+'v']}</CCell>
//                             }
//                             { !omit  && <CCell>{orc?.[n+'v']??calculate}</CCell>
//                             }
//                             { allowableV && omit && vspan && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
//                             }
//                             { allowableV && !omit && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
//                             }
//                             { rspan && resultName && <CCell rowSpan={rspan} split>{orc?.[resultName]}</CCell>
//                             }
//                         </TableRow>
//                     );
//                 }
//             });
//         });
//         return [rows, seq];
//     }, [orc,allowableV, configExtend,seqOfs]);
//     return  {rows, seq};
// };
