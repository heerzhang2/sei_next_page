/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, InputLine, LineColumn, TableRow,} from "customize-easy-ui-component";
import {SelectHookfork, } from "../common/base";
import {JSX} from "@emotion/react/jsx-runtime";
import {EachMeasureItemConfig, measurementCrender} from "../common/measure";
import {convertMeasureType, floatInterception} from "../../common/tool";

/**@Deprecated
 * 淘汰：观测值及测量结果记录表 内容组织
 * @param config  config观测数据;
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @param defaultSave  若=true的表示有做转换规则的行也必须都做存储。
 * */
export function useMeasureOldVer(inp:any, setInp:React.Dispatch<React.SetStateAction<any>>, config: EachMeasureItemConfig[][], allowableV: boolean, defaultSave: boolean
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
                    line.forEach(({n,t,u,check,omit,save,c,d}: EachMeasureItemConfig, k:number)=> {
                        if(checkLine){
                            const labelCheck=check??bigLabel;
                            if(resultName===undefined)    throw new Error("没提供测seqLineName");
                            let resulTag=resultName + 'r';
                            let lcNode=<InputLine label={labelCheck+`-结果判定:`} key={i}>
                                <SelectHookfork value={ inp?.[resulTag] ||''}
                                                onChange={e => setInp({ ...inp, [resulTag]: e.currentTarget.value||undefined}) }/>
                            </InputLine>;
                            preNodeObj.push({ lcNode, outNode:undefined });
                            resultName=undefined;
                        }
                        else{
                            if(!t || t.length<1)    throw new Error("没提供测量子项");
                            const tCopy=[...t];       //确保原始配置不会被这里修改了。后续其它代码浅层拷贝的，依赖旧的原始配置。
                            if(t[0]!==undefined)
                                bigLabel=t[0];
                            else if(t.length>=1)
                                tCopy[0]=bigLabel;
                            if(t[1]!==undefined)
                                secoLabel=t[1];
                            else if(t.length>=2)
                                tCopy[1]=secoLabel;      //继承了默认值
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
                                prepareN=measurementCrender(tCopy, n, unit, inp, setInp,allowableV,resEdit,true,calculate,);
                            }
                            else{
                                if(omit===undefined) {
                                    prepareN=measurementCrender(tCopy, n, unit, inp, setInp,allowableV,resEdit,false,calculate);
                                }
                                else{
                                    prepareN=measurementCrender(tCopy, n, unit, inp, setInp,allowableV,resEdit,false,calculate,seqLineName,(omit as string),);
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
                    return <React.Fragment key={i}>
                        {htmlNodes}
                    </React.Fragment>;
                })
            }
        </>;
        }
        ,[config,inp,allowableV,defaultSave,setInp]);

    //状态控制部分useItemInputControl({ref})等需要上一级组件一起公用的，所以拆分穿插掉。需要返回itemObservation给上级组件
  return { render ,itemObservation, itemObservationA};
}

interface EachMeasureItemConfigX extends EachMeasureItemConfig{
    /**项目编号第一级bspan, 检验项目第二级别span标题；单位； 结果值{允许取值}；检验结果；
     * */
    bspan?: number;
    span?: number;      //第二级标题的 rowSpan 竖跨。
    uspan?: number;     //单位unit 栏目的 span
    vspan?: number;     //结果值 value 栏
    rspan?: number;     //result检验结果 栏
}
/**@Deprecated
 * 先对配置的跨行span:初始化处置，默认计算的字段。
 * @param config  配置。      浅拷贝，会修改了原始配置对象。
 * */
const useMeasureCconfigExtend= ({ config, }  :{ config:EachMeasureItemConfig[][],  }
) => {
    //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
    // let configExtend=[...config观测数据] as EachMeasureItemConfigX[][];
    const configExtend =React.useMemo(() => {
        // let seq=0;
        let bigLabel: any;
        let bigCross: EachMeasureItemConfigX;
        // let secoLabel: any;
        let secoCross: EachMeasureItemConfigX;
        // let unit: any;
        let unitCross: EachMeasureItemConfigX;
        let valueCross: EachMeasureItemConfigX|undefined;
        let resultCross: EachMeasureItemConfigX|undefined;
        let resultName: any;
        config.forEach((line: EachMeasureItemConfig[], i:number) => {
            const firstLn = line[0];
            let checkLine: boolean;
            if( (firstLn?.check || firstLn?.n === undefined) )
                checkLine = true;
            // else  seq++;
            const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
            if(resultName===undefined && seqLineName){
                resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
            }
            line.forEach((subObj: EachMeasureItemConfig, k:number)=> {
                const {t,u,check,omit}=subObj;
                if(checkLine){
                    // const labelCheck=check??bigLabel;
                    if(resultName===undefined)    throw new Error("没提供测seqLineName");
                    // let resulTag=resultName + 'r';
                    resultName=undefined;
                    resultCross=undefined;
                }
                else{
                    if(t[0]!==undefined){
                        bigCross=subObj;
                        bigCross.bspan=1;
                    }
                    else if(t.length>=1){
                        bigCross.bspan=bigCross.bspan!+1;
                    }
                    if(t[1]!==undefined){
                        secoCross=subObj;
                        secoCross.span=1;
                    }
                    else if(t.length>=2){
                        secoCross.span=secoCross.span!+1;
                    }
                    if(u!==undefined){
                        unitCross=subObj;
                        unitCross.uspan=1;
                    }
                    else{
                        unitCross.uspan=unitCross.uspan!+1;
                    }
                    if(omit===true){
                        if(valueCross===undefined){
                            valueCross=subObj;
                            valueCross.vspan=1;
                        }
                        else
                            valueCross.vspan=valueCross.vspan!+1;
                    }
                    else{
                        if(valueCross!==undefined)
                            valueCross.vspan=valueCross.vspan!+1;
                        valueCross=undefined;
                    }
                    if(resultCross===undefined){
                        resultCross=subObj;
                        resultCross.rspan=1;
                    }
                    else
                        resultCross.rspan=resultCross.rspan!+1;
                    // if(u!==undefined)
                    //     unit=u;
                }
            });
        });
        return config;
    }, [config,]);
    //# 实际 @会修改了原始config配置对象。
    return [configExtend];
};

interface MeasureCTableProps {
    orc: any;
    config: EachMeasureItemConfig[][];
    allowableV?: boolean;
    defaultSave?: boolean;
    rep: any;
}
/**@Deprecated          [改成]  useMeasureTable
 * 淘汰： 测量：报告的 格式化原始记录的表格展示，显示逻辑变简单了，但是对配置的修改要求变麻烦了。
 * @param config: 配置。
 * */
export const useMeasureCTable= ({orc, config,allowableV,defaultSave,rep} : MeasureCTableProps
) => {
    const [configExtend] = useMeasureCconfigExtend({ config });
    const render =React.useMemo(() => {
        let seq=0;
        let bigLabel: any;
        // let secoLabel: any;
        let resultName: any;
        // let unit: any;
        //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
        // let configExtend=[...config观测数据] as EachMeasureItemConfigX[][];
        //【旧？】加了<DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Ladder#Ladder`}>
        return <>
            {configExtend.map((line: EachMeasureItemConfig[], i:number) => {
                const firstLn = line[0];
                let checkLine: boolean;
                if( (firstLn?.check || firstLn?.n === undefined) )
                    checkLine = true;
                else  seq++;
                //经过一次结论 check 行之后自动清空；
                const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
                if(resultName===undefined && seqLineName){
                    resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
                }
                return line.map(({n,t,u,check,omit,save,c,d,bspan,span,uspan,vspan,rspan}: EachMeasureItemConfigX, k:number)=> {
                    if(checkLine){
                        const labelCheck=check??bigLabel;
                        if(resultName===undefined)    throw new Error("没提供测seqLineName");
                        resultName=undefined;
                        return null;
                    }
                    else{
                        //【浅层拷贝】这里不能够用  t[1]=secoLabel; 会导致直接修改了config观测数据的配置，导致上面逻辑失效repModel =React.useMemo(() => {}
                        const xmqColmun=t.length;
                        // if(u!==undefined)
                        //     unit=u;
                        let resEdit: boolean =true;       //结果字段允许修改的。 自动转换的 可能无法修改的。
                        let calculate;
                        const oname=n+'o';
                        const ovalue=orc?.[oname];
                        calculate=convertMeasureType(ovalue,c!,d!);
                        //config观测数据[0][0].t[0]='撒'; 这里修改影响到了原配置数组的！
                        //默认自动转换计算的 还是人工修改后的，在显示上差别处理
                        if(undefined!==c){
                            resEdit= (undefined===save)?  defaultSave! : save;
                        }
                        // console.log("检验设TableRow备情况$seq=", seq,'t=',t,bspan, "SPAN",span,secoLabel,t[1]);
                        //底下的omit && vspan 只考虑序号行的第一个子项目的存储名字情形，归并不考虑自动转换的，只能支持手动输入；
                        return (
                            <TableRow key={i+'_'+k}>
                                <CCell>{seq}</CCell>
                                { bspan && <CCell colSpan={xmqColmun===1?3:1} rowSpan={bspan} split>{t[0]}</CCell>
                                }
                                { span && xmqColmun>=2 && <CCell colSpan={4-xmqColmun} rowSpan={span} split>{t[1]}</CCell>
                                }
                                { xmqColmun>=3 && <CCell>{t[2]}</CCell>
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
                                { rspan && resultName && <CCell rowSpan={rspan} split>{orc?.[resultName+'r']}</CCell>
                                }
                            </TableRow>
                        );
                    }
                });
            }) }
        </>;
    }, [orc,allowableV, configExtend, defaultSave, rep?.id, rep?.modeltype, rep?.modelversion]);
    return  render;
};
