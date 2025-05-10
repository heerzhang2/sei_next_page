import * as React from "react";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../common/base";
import {EachMeasureItemConfig, MeasurementCline} from "../common/measure";
import {convertMeasureType, floatInterception} from "../../common/tool";
import {useMeasureInpFilter} from "../common/hooks";
import {EachMeasureCritConfig} from "../common/msCriteria";


/**测量编辑器：普通版本的， @@可淘汰了！  ；    【不支持】config动态注入变更的版本。
 * 替代：采用 useMeasureCSlistItem 和 useMeasureCSlistX 的配置config做修改，
 * 编辑器：观测值及测量结果记录表 内容组织。   #扩充能力版，更多列的，内容支持node;
 * @param config  config观测数据;
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @param defaultSave  若=true的表示有做转换规则的行也必须都做存储。
 * 注意，正式报告可以直接用 floatInterception(ovalue,digits,); floatInterception(ovalue,digits, 'floor')来填充测量结果值。
 * */
export function useMeasureEdit(inp:any, setInp:React.Dispatch<React.SetStateAction<any>>, config: EachMeasureItemConfig[][], allowableV: boolean, defaultSave: boolean
) {
    const [itemObservation, itemObservationA] = React.useMemo(() => {
        const itemObserv: string[] = [];
        const itemAObserv: string[] = [];
        config.forEach((line: EachMeasureItemConfig[], i: number) => {
            if (line[0]?.n) {
                const itrsName = line[0]?.n + 'r';
                line.forEach(({n,}: EachMeasureItemConfig, k: number) => {
                    itemObserv.push(n);
                    if(allowableV)   itemAObserv.push(n+'a');        //扩充字段：允许取值；
                });
                itemAObserv.push(itrsName);
            }
            if (line[0]?.check && line[0]?.sync) {
                itemAObserv.push(line[0]?.sync);
            }
        });
        return [itemObserv, itemAObserv];
    }, [config,allowableV]);
            // const [getInpFilter] = useMeasureInpFilter(itemObservation, itemObservationA,);
            // const {inp, setInp} = useItemInputControl({ref});
    //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
    const render= React.useMemo(() =>
        {
            let bigLabel: any;
            let secoLabel: any;
            let thirdLabel: any;     //第三个级别继承做显示的？
            let unit: any;
            let resultName: any;
         return <>
            {
                config.map((line: EachMeasureItemConfig[], i: number) => {
                    //line 对应了单独一个序号：一个序号对应多个的 嵌套的子行；
                    const firstLn = line[0];
                    let checkLine: boolean;
                    if( (firstLn?.check || firstLn?.n === undefined) )
                        checkLine = true;
                    //经过一次结论 check 行之后自动清空；
                    const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
                    if(resultName===undefined && seqLineName){
                        resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
                    }
                    const lcColumns=allowableV? (firstLn?.omit? 5 : 3) : (firstLn?.omit? 3 : 4);           //有些情形太紧凑！

                    let preNodeObj: { outNode: JSX.Element|undefined; lcNode: JSX.Element; }[]=[];      //{lcNode,outNode}预备DOM的，可能插入不是适合<LineColumn内部拼凑载入的节点。需要提取到LineColumn外部。
                    line.forEach(({n,t,u,check,omit,save,c,d,x,sync}: EachMeasureItemConfig, k:number)=> {
                        // React.useEffect(() => {
                        //   setInp({...inp, sss: 'dfg'});
                        // }, []);
                        if(checkLine){
                            const labelCheck=check??bigLabel;
                            if(resultName===undefined)    throw new Error("没提供测seqLineName");
                            let resulTag=sync??(resultName + 'r');
                            let lcNode=<InputLine label={labelCheck+`-结果判定:`} key={i}>
                                <SelectHookfork value={ inp?.[resulTag] ||''}
                                                onChange={e => setInp({ ...inp, [resulTag]: e.currentTarget.value||undefined}) }/>
                            </InputLine>;
                            preNodeObj.push({ lcNode, outNode:undefined });
                            resultName=undefined;
                        }
                        else{
                            if(!t)    throw new Error("没提供测量子项");
                            const tCopy=[...t];       //确保原始配置不会被这里修改了。后续其它代码浅层拷贝的，依赖旧的原始配置。
                            //对于t:[undefined,undefined,undefined]那么前面几个标题会显示继承文字的，但是若t:[],就会忽略掉的。 若最后一个有配置的导致t不是[]的必然就复制默认，前面几个标题就都会显示出来。
                            if(t[0]!==undefined)
                                bigLabel=t[0];
                            else if(t.length>=1)
                                tCopy[0]=bigLabel;
                            if(t[1]!==undefined)
                                secoLabel=t[1];
                            else if(t.length>=2)
                                tCopy[1]=secoLabel;      //继承了默认值
                            if(t[2]!==undefined)
                                thirdLabel=t[2];
                            else if(t.length>=3)
                                tCopy[2]=thirdLabel;      //继承
                            if(u!==undefined)
                                unit=u;
                            let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
                            let calculate;
                            const oname=n+'o';
                            const ovalue=inp?.[oname];
                            //【未考虑】omit合并结果的同时还要转换结果同时生效的情形？
                            if('四'===c){
                                let digits =0===d? 0 : d? Number(d) : 1;
                                calculate=floatInterception(ovalue,digits,);
                            }
                            else if('弃'===c){
                                let digits =0===d? 0 : d? Number(d) : 1;
                                calculate=floatInterception(ovalue,digits, 'floor');
                            }
                            //默认自动转换计算的 还是人工修改后的，在显示上差别处理
                            if(undefined!==c){
                                resEdit= (undefined===save)?  defaultSave : save;
                            }
                            let prepareN : { outNode: JSX.Element|undefined; lcNode: JSX.Element; };
                            if(omit===true){
                                let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                             resEdit={resEdit} only={true} resDeft={calculate} />
                                prepareN={ lcNode, outNode:undefined };
                            }
                            else{
                                if(omit===undefined) {
                                    //【多数情形】
                                    let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                                 resEdit={resEdit} only={false} resDeft={calculate} />
                                    prepareN={ lcNode, outNode:undefined };
                                }
                                else{
                                    //若有合并多行的特殊情况： 标题突出指代几个编辑器所属含义= omit 的文本。
                                    let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                                 resEdit={resEdit} only={false} resDeft={calculate} seqLineName={seqLineName} labelOmit={omit as string} />
                                    let descNodes=[];
                                    for(let l=0;l<tCopy.length;l++){
                                        descNodes.push(<Text key={l+1} css={{marginLeft: '1rem'}}>{tCopy[l]}</Text>);
                                    }
                                    if(x){
                                        descNodes.push(<Text key={0} css={{marginLeft: '1rem'}}>{x}</Text>);
                                    }
                                    let outNode=<div css={{marginLeft: '1rem'}}>{descNodes}{'>>'}</div>;
                                    prepareN={ lcNode, outNode:outNode };
                                }
                            }
                            preNodeObj.push(prepareN);
                        }
                    });
                    let insertIdx=0;
                    let htmlNodes=[];          //考虑？肢解开：  key取值 报错
                    //往前探查方向，是否存在外部溢出元素？
                    let lcNodesNow=[];
                    for(; insertIdx<preNodeObj.length; insertIdx++){
                        for(; insertIdx<preNodeObj.length; insertIdx++){
                            const {lcNode,outNode}=preNodeObj[insertIdx];
                            if(outNode)  break;
                            let modifyNode={...lcNode};
                            Object.assign(modifyNode,{ key: 'L'+insertIdx });
                            lcNodesNow.push(modifyNode);
                        }
                        //拆分段落模式：【假定】outNode必然在前面的，而lcNode只能位于底下顺序接着的。
                        if(lcNodesNow.length>=1){
                            const lcHtml=<React.Fragment key={i+'_'+insertIdx}>
                                <LineColumn  column={lcColumns} >
                                    { lcNodesNow }
                                </LineColumn>
                            </React.Fragment>;
                            htmlNodes.push(lcHtml);
                            lcNodesNow=[];         //局部
                        }
                        if(insertIdx<preNodeObj.length){
                            if(preNodeObj[insertIdx]?.outNode){
                                let modifyNode={ ...(preNodeObj[insertIdx]?.outNode) };
                                Object.assign(modifyNode,{ key: 'W'+insertIdx });
                                htmlNodes.push(modifyNode  as any);            //插入outNode 若不加 as any 类型报错。
                            }
                            if(preNodeObj[insertIdx]?.lcNode){
                                let modifyNode={...(preNodeObj[insertIdx]?.lcNode)};
                                Object.assign(modifyNode,{ key: 'Y'+insertIdx });
                                lcNodesNow.push(modifyNode);               //给下一个区域去：被插入outNode了情形。
                            }
                        }
                    }
                    //残留的一部分：
                    if(lcNodesNow.length>=1){
                        const lcHtml=<React.Fragment key={i+'T'}>
                            <LineColumn  column={lcColumns} >
                                { lcNodesNow }
                            </LineColumn>
                        </React.Fragment>;
                        htmlNodes.push(lcHtml);
                    }
                    //这个序号结束： 一个序号对应多个内部小行的，多行就是多个 x: item多个的,可序号都是同一个的。htmlNodes对应同一序号全部几行
                    return <div key={i} css={{marginTop: '1rem',}}>
                        {htmlNodes}
                    </div>;
                })
            }
        </>;
        }
        ,[config,inp,allowableV,defaultSave,setInp]);

    //状态控制部分useItemInputControl({ref})等需要上一级组件一起公用的，所以拆分穿插掉。需要返回itemObservation给上级组件
  return { render ,itemObservation, itemObservationA};
}

interface EachMeasureItemConfig2X extends EachMeasureItemConfig{
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
    sync?: string;      //对应的归属区块的底下的那个check配置行，结论存储字段和大项目列表的字段做同步了；sync=大项目列表检验结果的存储名。
}
/**先对配置的跨行span:初始化处置，默认计算的字段。
 * @param config  配置。      浅拷贝，会修改了原始配置对象。
 * 和useJudgment上有差别的omit配置   [{n: '试显示数', t: ['C4.6.1','起重量显示装置显示数值的误差','显示数值(t)'], u:'%',  omit:'4.6.1'},
 *                     {n: '试载荷值', t: [undefined,undefined,'试验载荷值(t)'],   omit:true }, ],
 * */
const useMeasureCconfigExtend2= ({ config, }  :{ config:EachMeasureItemConfig[][],  }
) => {
    //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
    // let configExtend=[...config观测数据] as EachMeasureItemConfig2X[][];
    const configExtend =React.useMemo(() => {
        // let bigLabel: any;
        let bigCross: EachMeasureItemConfig2X;
        let secoCross: EachMeasureItemConfig2X;
        let thirdCross: EachMeasureItemConfig2X;
        let unitCross: EachMeasureItemConfig2X;
        let valueCross: EachMeasureItemConfig2X|undefined;
        let resultCross: EachMeasureItemConfig2X|undefined;
        let resultName: any;
        config.forEach((line: EachMeasureItemConfig[], i:number) => {
            const firstLn = line[0];
            let checkLine: boolean;
            if( (firstLn?.check || firstLn?.n === undefined) )
                checkLine = true;
            const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
            if(resultName===undefined && seqLineName){
                resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
            }
            line.forEach((subObj: EachMeasureItemConfig, k:number)=> {
                //嵌套的小行：对应同一个序号的多个项目子行；
                const {t, u,omit}=subObj;
                if(checkLine){
                    if(resultName===undefined)    throw new Error("没提供测seqLineName");
                    if(resultCross){
                        resultCross.sync= firstLn.sync;         //复制给本check区块的第一行的
                    }
                    resultName=undefined;
                    resultCross=undefined;
                    valueCross=undefined;       //结果不会 跨越结论汇集区行；
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

interface MeasureTableProps {
    orc: any;
    config: EachMeasureItemConfig[][];
    //允许取值 判定标准栏目的；  判定标准是不能变编辑的栏目， ？ 允许值栏目allowableV是不同的可以编辑的用途。
    allowableV?: boolean;
    defaultSave?: boolean;
    rep: any;
    seqOfs?: number;   //默认=0 序号的开始,去掉前面几个
}
/**测量：正式报告的 格式化原始记录的表格展示，显示逻辑变简单了，但是对配置的修改要求变麻烦了。 #扩充能力版，更多列的，内容支持node;
 * @param config: 配置。
 * 标题区预备4个列，再加附加的一个可选的最小一级项目列，也即可选检测项目列必须要么全部配置要么全部不配置的(上层决定)。
 * 可支持用null替代undefined来表明正式报告打印要合并Cell同时原始记录却不需要显示这些继承标题栏目的。原先设计用来undefined导致原始记录是都会显示继承来的标题的。
 * [注意] 上级组件要对“检测项目”栏目，判别是否要显示该列，表头一起改！
 * 类似 useJudgmentTable 的功能；
 * */
export const useMeasureTable= ({orc, config,allowableV,defaultSave,rep,seqOfs=0} : MeasureTableProps
) => {
    //对配置的跨行span:初始化处置，默认计算的字段。
    const [configExtend] = useMeasureCconfigExtend2({ config });
    const render =React.useMemo(() => {
        let seq=seqOfs;
        // let bigLabel: any;
        // let secoLabel: any;
        let resultName: any;
        // let unit: any;
        //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
        // let configExtend=[...config观测数据] as EachMeasureItemConfig2X[][];
        //外部无法穿透的，只能挪到这
        return <>
            {/*<DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Measure2#Measure2`}>*/}

            {configExtend.map((line: EachMeasureItemConfig[], i:number) => {
                const firstLn = line[0];
                let checkLine: boolean;
                if( (firstLn?.check || firstLn?.n === undefined) )
                    checkLine = true;
                else  seq++;
                //经过一次结论 check 行之后自动清空；
                const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
                if(resultName===undefined && seqLineName){
                    resultName= line[0]?.sync?  line[0]?.sync : seqLineName+'r';            //【约定】结论行必须是最少 这整个序号的。单独配置的sync优先使用check行配置。
                }
                return line.map(({n,t,x,u,check,omit,save,c,d,bspan,span,tspan,uspan,vspan,rspan}: EachMeasureItemConfig2X, k:number)=> {
                    if(checkLine){
                        // const labelCheck=check??bigLabel;
                        if(resultName===undefined)    throw new Error("没提供测seqLineName");
                        resultName=undefined;
                        return null;
                    }
                    else{
                        //【浅层拷贝】这里不能够用  t[1]=secoLabel; 会导致直接修改了config观测数据的配置，导致上面逻辑失效repModel =React.useMemo(() => {}
                        const xmqColmun=t.length;
                        // let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
                        let calculate;
                        const oname=n+'o';
                        const ovalue=orc?.[oname];
                        calculate=convertMeasureType(ovalue,c!,d!);
                        //config观测数据[0][0].t[0]='撒'; 这里修改影响到了原配置数组的！
                        //默认自动转换计算的 还是人工修改后的，在显示上差别处理
                        if(undefined!==c){
                            // resEdit= (undefined===save)?  defaultSave! : save;
                        }
                        // console.log("检验设TableRow备情况$seq=", seq,'t=',t,bspan, "SPAN",span,secoLabel,t[1]);
                        //底下的omit && vspan 只考虑序号行的第一个子项目的存储名字情形，归并不考虑自动转换的，只能支持手动输入；
                        return (
                            <TableRow key={i+'_'+k}>
                                <CCell>{seq}</CCell>
                                { bspan && <CCell colSpan={xmqColmun===1?4:1} rowSpan={bspan} split>{t[0]}</CCell>
                                }
                                { span && xmqColmun>=2 && <CCell colSpan={xmqColmun===2?3:1} rowSpan={span} split>{t[1]}</CCell>
                                }
                                { tspan && xmqColmun>=3 && <CCell colSpan={xmqColmun===3?2:1} rowSpan={tspan} split>{t[2]}</CCell>
                                }
                                { xmqColmun>=4 && <CCell >{t[3]}</CCell>
                                }
                                { x && <CCell>{x}</CCell>
                                }
                                { u && uspan && <CCell rowSpan={uspan} split>{u}</CCell>
                                }
                                <CCell>{orc?.[n+'o']}</CCell>
                                { omit && vspan && <CCell rowSpan={vspan} split>{orc?.[n+'v']}</CCell>
                                }
                                { !omit  && <CCell>{orc?.[n+'v']??calculate}</CCell>
                                }
                                { allowableV && omit && vspan && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
                                }
                                { allowableV && !omit && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
                                }
                                { rspan && resultName && <CCell rowSpan={rspan} split>{orc?.[resultName]}</CCell>
                                }
                            </TableRow>
                        );
                    }
                });
            }) }

            {/*</DirectLink>*/}
        </>;
    }, [orc,allowableV, configExtend,seqOfs]);
    return  render;
};


interface ObservationMeasureProps  extends InternalItemProps{
    label: string;
    config: EachMeasureItemConfig[][];
    iAname?: string[];           //附加的存储那些字段     ，'观测备注'
}
/**自带编辑器框架
 * 更为通用性的测量： 可拆分两个编辑器， children也能注入内容。 iAname：附加存储。
 * */
export const ObservationMeasure =
    React.forwardRef((
        {children, show, alone = true, refWidth,label,config,iAname}: ObservationMeasureProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        const {render,itemObservation, itemObservationA,}=useMeasureEdit(inp,setInp, config, false ,false);
        const itemA = React.useMemo(() => {
            return [...itemObservationA, ...iAname??[]];       //，'观测备注'
        }, [itemObservationA, iAname]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA,);
        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                {label}<br/>
                { render }

                {children}
            </InspectRecordLayout>
        );
    } );


/**和useMeasureCSlistX配套的：
 * 观测值及测量结果记录表 预备部份拆分出来的，用useMeasureClistX若config可变的会【Hook死循环】；拆分成2个函数useMeasureCSlistX出去，目的：避免交叉的依赖项导致的hook循环。
 * @param config  必须不可变的。
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @return 项目name部分
 * */
export function useMeasureItem(config: EachMeasureItemConfig[][], allowableV: boolean
) {
    const [itemObservation, itemObservationA] = React.useMemo(() => {
        const itemObserv: string[] = [];
        const itemAObserv: string[] = [];
        config.forEach((line: EachMeasureItemConfig[], i: number) => {
            if (line[0]?.n) {
                const itrsName = line[0]?.n + 'r';
                line.forEach(({n,}: EachMeasureItemConfig, k: number) => {
                    itemObserv.push(n);
                    if(allowableV)   itemAObserv.push(n+'a');        //扩充字段：允许取值；
                });
                itemAObserv.push(itrsName);
            }
            if (line[0]?.check && line[0]?.sync) {
                itemAObserv.push(line[0]?.sync);
            }
        });
        return [itemObserv, itemAObserv];
    }, [config,allowableV]);
    return { itemObservation, itemObservationA};
}

/**支持动态的config的版本； 替代useMeasureClistX； 不支持判定栏；
 * 最强版本：render和itemObservationA项目[]可拆分的形式。需要配合useMeasureCSlistItem的。 观测值及测量结果记录表 内容组织。   #扩充能力版，更多列的，内容支持node;
 * 替代useMeasureClistX；可以允许useMeasureCSlistItem和useMeasureCSlistX的配置config做修改，动态的config
 * @param inp
 * @param setInp
 * @param config  config观测数据; 允许可变的。
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @param defaultSave  若=true的表示有做转换规则的行也必须都做存储。
 * 对应的正式报告用useMeasureCTableX；
 * 返回值render改成数组， 不要再套一层加<></>了；
 * */
export function useMeasureRow(inp:any, setInp:React.Dispatch<React.SetStateAction<any>>, config: EachMeasureItemConfig[][], allowableV: boolean, defaultSave: boolean
) {
    //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
    const render= React.useMemo(() =>
        {
            let bigLabel: any;
            let secoLabel: any;
            let thirdLabel: any;     //第三个级别继承做显示的？
            let unit: any;
            let resultName: any;
            return config.map((line: EachMeasureItemConfig[], i: number) => {
                        //line 对应了单独一个序号：一个序号对应多个的 嵌套的子行；
                        const firstLn = line[0];
                        let checkLine: boolean;
                        if( (firstLn?.check || firstLn?.n === undefined) )
                            checkLine = true;
                        //经过一次结论 check 行之后自动清空；
                        const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
                        if(resultName===undefined && seqLineName){
                            resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
                        }
                        const lcColumns=allowableV? (firstLn?.omit? 5 : 3) : (firstLn?.omit? 3 : 4);           //有些情形太紧凑！

                        let preNodeObj: { outNode: JSX.Element|undefined; lcNode: JSX.Element; }[]=[];      //{lcNode,outNode}预备DOM的，可能插入不是适合<LineColumn内部拼凑载入的节点。需要提取到LineColumn外部。
                        line.forEach(({n,t,u,check,omit,save,c,d,x,sync}: EachMeasureItemConfig, k:number)=> {
                            // React.useEffect(() => {
                            //   setInp({...inp, sss: 'dfg'});
                            // }, []);
                            if(checkLine){
                                const labelCheck=check??bigLabel;
                                if(resultName===undefined)    throw new Error("没提供测seqLineName");
                                let resulTag=sync??(resultName + 'r');
                                let lcNode=<InputLine label={labelCheck+`-结果判定:`} key={i}>
                                    <SelectHookfork value={ inp?.[resulTag] ||''}
                                                    onChange={e => setInp({ ...inp, [resulTag]: e.currentTarget.value||undefined}) }/>
                                </InputLine>;
                                preNodeObj.push({ lcNode, outNode:undefined });
                                resultName=undefined;
                            }
                            else{
                                if(!t)    throw new Error("没提供测量子项");
                                const tCopy=[...t];       //确保原始配置不会被这里修改了。后续其它代码浅层拷贝的，依赖旧的原始配置。
                                //对于t:[undefined,undefined,undefined]那么前面几个标题会显示继承文字的，但是若t:[],就会忽略掉的。 若最后一个有配置的导致t不是[]的必然就复制默认，前面几个标题就都会显示出来。
                                if(t[0]!==undefined)
                                    bigLabel=t[0];
                                else if(t.length>=1)
                                    tCopy[0]=bigLabel;
                                if(t[1]!==undefined)
                                    secoLabel=t[1];
                                else if(t.length>=2)
                                    tCopy[1]=secoLabel;      //继承了默认值
                                if(t[2]!==undefined)
                                    thirdLabel=t[2];
                                else if(t.length>=3)
                                    tCopy[2]=thirdLabel;      //继承
                                if(u!==undefined)
                                    unit=u;
                                let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
                                let calculate;
                                const oname=n+'o';
                                const ovalue=inp?.[oname];
                                //【未考虑】omit合并结果的同时还要转换结果同时生效的情形？
                                if('四'===c){
                                    let digits =0===d? 0 : d? Number(d) : 1;
                                    calculate=floatInterception(ovalue,digits,);
                                }
                                else if('弃'===c){
                                    let digits =0===d? 0 : d? Number(d) : 1;
                                    calculate=floatInterception(ovalue,digits, 'floor');
                                }
                                //默认自动转换计算的 还是人工修改后的，在显示上差别处理
                                if(undefined!==c){
                                    resEdit= (undefined===save)?  defaultSave : save;
                                }
                                let prepareN : { outNode: JSX.Element|undefined; lcNode: JSX.Element; };
                                if(omit===true){
                                    let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                                 resEdit={resEdit} only={true} resDeft={calculate} />
                                    prepareN={ lcNode, outNode:undefined };
                                }
                                else{
                                    if(omit===undefined || omit===false) {
                                        //【多数情形】
                                        let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                                     resEdit={resEdit} only={false} resDeft={calculate} />
                                        prepareN={ lcNode, outNode:undefined };
                                    }
                                    else{
                                        //若有合并多行的特殊情况： 标题突出指代几个编辑器所属含义= omit 的文本。
                                        let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                                     resEdit={resEdit} only={false} resDeft={calculate} seqLineName={seqLineName} labelOmit={omit as string} />
                                        let descNodes=[];
                                        for(let l=0;l<tCopy.length;l++){
                                            descNodes.push(<Text key={l+1} css={{marginLeft: '1rem'}}>{tCopy[l]}</Text>);
                                        }
                                        if(x){
                                            descNodes.push(<Text key={0} css={{marginLeft: '1rem'}}>{x}</Text>);
                                        }
                                        let outNode=<div css={{marginLeft: '1rem'}}>{descNodes}{'>>'}</div>;
                                        prepareN={ lcNode, outNode:outNode };
                                    }
                                }
                                preNodeObj.push(prepareN);
                            }
                        });
                        let insertIdx=0;
                        let htmlNodes=[];          //考虑？肢解开：  key取值 报错
                        //往前探查方向，是否存在外部溢出元素？
                        let lcNodesNow=[];
                        for(; insertIdx<preNodeObj.length; insertIdx++){
                            for(; insertIdx<preNodeObj.length; insertIdx++){
                                const {lcNode,outNode}=preNodeObj[insertIdx];
                                if(outNode)  break;
                                let modifyNode={...lcNode};
                                Object.assign(modifyNode,{ key: 'L'+insertIdx });
                                lcNodesNow.push(modifyNode);
                            }
                            //拆分段落模式：【假定】outNode必然在前面的，而lcNode只能位于底下顺序接着的。
                            if(lcNodesNow.length>=1){
                                const lcHtml=<React.Fragment key={i+'_'+insertIdx}>
                                    <LineColumn  column={lcColumns} >
                                        { lcNodesNow }
                                    </LineColumn>
                                </React.Fragment>;
                                htmlNodes.push(lcHtml);
                                lcNodesNow=[];         //局部
                            }
                            if(insertIdx<preNodeObj.length){
                                if(preNodeObj[insertIdx]?.outNode){
                                    let modifyNode={ ...(preNodeObj[insertIdx]?.outNode) };
                                    Object.assign(modifyNode,{ key: 'W'+insertIdx });
                                    htmlNodes.push(modifyNode  as any);            //插入outNode 若不加 as any 类型报错。
                                }
                                if(preNodeObj[insertIdx]?.lcNode){
                                    let modifyNode={...(preNodeObj[insertIdx]?.lcNode)};
                                    Object.assign(modifyNode,{ key: 'Y'+insertIdx });
                                    lcNodesNow.push(modifyNode);               //给下一个区域去：被插入outNode了情形。
                                }
                            }
                        }
                        //残留的一部分：
                        if(lcNodesNow.length>=1){
                            const lcHtml=<React.Fragment key={i+'T'}>
                                <LineColumn  column={lcColumns} >
                                    { lcNodesNow }
                                </LineColumn>
                            </React.Fragment>;
                            htmlNodes.push(lcHtml);
                        }
                        //这个序号结束： 一个序号对应多个内部小行的，多行就是多个 x: item多个的,可序号都是同一个的。htmlNodes对应同一序号全部几行
                        return <div key={i} css={{marginTop: '1rem',}}>
                            {htmlNodes}
                        </div>;
                    });
        }
        ,[config,inp,allowableV,defaultSave,setInp]);

    //状态控制部分useItemInputControl({ref})等需要上一级组件一起公用的，所以拆分穿插掉。需要返回itemObservation给上级组件
    return { render };
}

export interface MeasureCritMemProps extends InternalItemProps {
    label: string;
    config: ((orc: any) => EachMeasureCritConfig[][]) | EachMeasureCritConfig[][];
    iAname?: string[];    //附加的存储那些字段， 但是下面的mem除外。
    mem?: string;       //备注的存储名
    //判定标准栏目，允许取值；
    allowableV?: boolean;
    defaultSave?: boolean;
    // defaultV?: (par: any) => any;
}
/**测量 很通用的 自带编辑器地；
 * 可备注录入。
 *假如采用定义const defaultV = (par: any) => { };注入的，不友好。不能立刻同步更新啊。只能在本组件内部做变更，无法外部配置的形式注入。
 * */
export const MeasureCritMem =
    React.forwardRef((
        {
            children, show, alone = true, refWidth, label,
            config, iAname, allowableV = false, defaultSave = false, mem,
        }: MeasureCritMemProps, ref
    ) => {
        const {inp, setInp} = useItemInputControl({ref});
        //【Hook死循环】不能使用const newconfig=typeof config ==='function'? config(inp) : config;
        const newconfig = React.useMemo(() => {
            return (typeof config === 'function' ? config(inp) : config);
        }, [inp, config]);
        const {itemObservation, itemObservationA,} = useMeasureItem(newconfig, allowableV);
        //有可能这两个注入的 newconfig 不一样？
        const {render} = useMeasureRow(inp, setInp, newconfig, allowableV, defaultSave);
        const itemA备注: string[] = mem ? [`${mem}`] : [];
        const itemA = React.useMemo(() => {
            return [...itemObservationA, ...itemA备注, ...iAname ?? []];
        }, [itemObservationA, iAname]);
        const [getInpFilter] = useMeasureInpFilter(itemObservation, itemA, );
        //死循环！
        // React.useEffect(() => { setInp({ ...inp, 输线电压: voltage }); }, [voltage, inp, setInp] );

        return (
            <InspectRecordLayout inp={inp} setInp={setInp} getInpFilter={getInpFilter} show={show}
                                 alone={alone} label={label}>
                <Text variant="h5">{label}：</Text>
                {render}
                {mem && <>
                    <hr/>
                    备注：
                    <TextArea value={inp?.[mem] || ''} rows={5}
                              onChange={e => setInp({...inp, [mem]: e.currentTarget.value || undefined})}/>
                </>
                }
                {children}
            </InspectRecordLayout>
        );
});
