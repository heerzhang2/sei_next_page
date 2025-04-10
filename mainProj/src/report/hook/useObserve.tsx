/** @jsxImportSource @emotion/react */
import * as React from "react";
import {BlobInputList, CCell, InputLine, LineColumn, TableRow, Text, TextArea,} from "customize-easy-ui-component";
import {InspectRecordLayout, InternalItemProps, SelectHookfork, useItemInputControl,} from "../common/base";
import {JSX} from "@emotion/react/jsx-runtime";
import {MeasurementCline} from "../common/measure";
import {convertMeasureType, floatInterception} from "../../common/tool";
import {useMeasureInpFilter} from "../common/hooks";
import {EditStorageContext, useStorage} from "../StorageContext";

/**游乐报告多了一个备忘列。
 * 来源 EachMeasureCritConfig
 *  param t: string,小小项也即每一个行的输入的标题叙述。
 *  param n: 每个字段存储名。
 *  结果栏目的哪一 特殊行，不会计算进入顺序号。序号属于最外面一层数组。相同序号的自拆分嵌套数组模式。
 *  项目描述区域最大支持3个栏目列的生成位置：最内部嵌套t:[,,]的就是3个叙述标题。前面若有多行相同归并多行的需要占位置定义=undefined。
 *  单位字段必然有的：可遗传上一级单位配置。
 *  这整个附带的设置 有： 允许值？  ；标题抬头的自定义。
 *  结果栏目默认存储在前面牵涉范围的第一行对应的第一个找到的name；
 * 结果值 允许值 被合并只出现一个的：依据是omit设置=true,最后一个omit=标题，存储看第一个(【附带约束】只考虑同一个数组内部都一起合并的，看第一行字段名字)。
 * 测量值=>结果值,测量结果的转换规则：参数字段c:四舍五入的c='四',配合d参数='2'表示，保留小数点后2个位的位数做的四舍五入。假如单位保持不变的undefined的没那么后续跟随的采取同样的测量结果的转换规则设置！
 * 除非后面的u:进行重新声明式设置的才会重新考虑设置结果的转换规则！
 * 结果取值的存储字段：save:true; 默认的规则是只要是做了测量值=>结果值的转换规则的约定的对应的哪一行就会依据组件主配参数认定是否进行实际的存储=defaultSave=true的表示有做转换规则的行也必须都做存储。
 * defaultSave=false的表示有做转换规则的行都不做存储（omit参数认定位置实际有几个），除非有在该行位置特定定义save字段才依据save进行设计认定是否做存储的，save===undefined的看defaultSave。
 * save参数每一行都要独立自己去配置。
 * 【对比】多出一个“判断标准”的栏目， 需要编辑器带上。
 * */
export interface EachObserveConfig {
    //存储名: 除非是check结论特殊哪一行，否则必须配置的。
    n: string;
    /**标题区域配置：最大支持多个栏目分别的叙述，最少一个标题*
     * t[0] 项目的栏目标题: 类型随意，就是可以render的文本。
     * 第一行个的t[]分解列个数不能少于底下同一个区间的分解列数。
     */
    t: any[];        //可支持多个栏目。
    /**项目的最小标题：只能每一行唯一，不能继承跨越多行地；特别地从上面t[]数组直接拆解出来的
     * */
    x?: any;
    //单位
    u?: string;
    //判定标准的一列栏目的render Node; 如果有第一个行就必须配置的才行。
    //【规则】连续的采用一行的是配置 undefined(跨行span), 空的没有该字段设置的要配为=null; #整份config的第一行cit:不能undefined，若=undefined就是没有该栏目的场景！
    cit?: any;
    //测量值=>结果值,测量结果的转换规则，默认没有规则。
    c?: string;
    //保留小数点后2个位的位数; 默认=‘1’的保留1位。
    d?: string|number;
    //是否存储结果字段；
    save?: boolean;
    /**说明这行=特殊行：对前面的多行进行汇总的结论行。 检验结果 单独占一行位置做配置的。 check=undefined才是普通的行。
     * 检验结果 的标题提示。
     * */
    check?: string;
    //同步检验项目大列表的检验结果字段，配合check才有的，sync=共享存储字段名。
    sync?: string;
    //回调配置对象：没有类型定义硬约束，看实际的用法。
    cbo?: any;
}


/**和useMeasureCSlistX配套的：
 * 观测值及测量结果记录表 预备部份拆分出来的，用useMeasureClistX若config可变的会【Hook死循环】；拆分成2个函数useMeasureCSlistX出去，目的：避免交叉的依赖项导致的hook循环。
 * @param config  必须不可变的。
 * @param allowableV  顺带加上 允许值 栏目吗，类似结果栏目的设置, 默认没该栏目：整个组件范围一样配置。
 * @return 项目name部分
 * */
export function useObserveItem(config: EachObserveConfig[][], allowableV: boolean,memoF: boolean
) {
    const [itemObservation, itemObservationA] = React.useMemo(() => {
        const itemObserv: string[] = [];
        const itemAObserv: string[] = [];
        config.forEach((line: EachObserveConfig[], i: number) => {
            if (line[0]?.n) {
                const itrsName = line[0]?.n + 'r';
                line.forEach(({n,cbo}: EachObserveConfig, k: number) => {
                    itemObserv.push(n);
                    if(allowableV)   itemAObserv.push(n+'a');        //扩充字段：允许取值；
                    if(cbo?.names)  itemAObserv.push(...cbo?.names);
                });
                itemAObserv.push(itrsName);
                if(memoF)
                    itemAObserv.push(line[0]?.n + 'm');
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
 * @param memoF 有没有测量的每一大项目特有备注字段录入的。
 * 对应的正式报告用useMeasureCTableX；
 * 返回值render改成数组， 不要再套一层加<></>了；
 * */
export function useObserveEdLine(inp:any, setInp:React.Dispatch<React.SetStateAction<any>>, config: EachObserveConfig[][], allowableV: boolean,
                                 defaultSave: boolean,memoF: boolean
) {
    //正常的每一行都独立 布局； 若一个序号多个小项目的：可能遭遇太过拥挤情况。
    const render= React.useMemo(() =>
        {
            let bigLabel: any;
            let secoLabel: any;
            let thirdLabel: any;     //第三个级别继承做显示的？
            let unit: any;
            let resultName: any;
            return config.map((line: EachObserveConfig[], i: number) => {
                        //line 对应了单独一个序号【编号唯一】：一个序号对应多个的 嵌套的子行；[【子项目=多个小行】]
                        const firstLn = line[0];
                        let checkLine: boolean;
                        if( (firstLn?.check || firstLn?.n === undefined) )
                            checkLine = true;
                        //经过一次结论 check 行之后自动清空；
                        const seqLineName = line[0]?.n;     //结论存储在第一个分项目开头的字段: omit情形也只有第一行才存储
                        if(resultName===undefined && seqLineName){
                            resultName= seqLineName;            //【约定】结论行必须是最少 这整个序号的。
                        }
                        const lcColumns=allowableV?  3 : 4;           //有些情形太紧凑！

                        let preNodeObj: { outNode: JSX.Element|undefined; lcNode: JSX.Element; }[]=[];      //{lcNode,outNode}预备DOM的，可能插入不是适合<LineColumn内部拼凑载入的节点。需要提取到LineColumn外部。
                        line.forEach(({n,t,u,check,save,c,d,x,sync,cbo}: EachObserveConfig, k:number)=> {
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
                                if(memoF){
                                    let memoTag=sync??(resultName + 'm');
                                    lcNode=<InputLine label={labelCheck+`-备注:`} key={i}>
                                        <BlobInputList value={inp?.[memoTag] ||''} rows={2} datalist={[]}
                                                       onListChange={v => setInp({...inp, [memoTag]: v || undefined}) } />
                                    </InputLine>;
                                    preNodeObj.push({ lcNode, outNode:undefined });
                                }
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
                                //编辑器的回调：可自定义录入字段；
                                const [editRp,editN]=cbo?.edit&&cbo?.edit(inp,setInp) || [];
                                let prepareN : { outNode: JSX.Element|undefined; lcNode: JSX.Element; };
                                let lcNode=<MeasurementCline item={x!} labels={tCopy} nameH={n} unit={unit} inp={inp} setInp={setInp} allowableV={allowableV}
                                                             resEdit={resEdit} only={false} resDeft={calculate} />
                                prepareN={ lcNode, outNode:undefined };
                                if(editN)
                                    preNodeObj.push({ lcNode: <>{editN}</>, outNode:undefined });
                                if(!editRp)
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

export interface ObserveEditProps extends InternalItemProps {
    label: string;
    config: ((orc: any) => EachObserveConfig[][]) | EachObserveConfig[][];
    iAname?: string[];    //附加的存储那些字段， 但是下面的mem除外。
    mem?: string;       //备注的存储名
    //判定标准栏目，允许取值；
    allowableV?: boolean;
    defaultSave?: boolean;
    memoF?: boolean;
}
/**测量 很通用的 自带编辑器地；
 * 可备注录入。
 *假如采用定义const defaultV = (par: any) => { };注入的，不友好。不能立刻同步更新啊。只能在本组件内部做变更，无法外部配置的形式注入。
 * */
export const ObserveEdit =
    React.forwardRef((
        {
            children, show, alone = true, refWidth, label, memoF=false,
            config, iAname, allowableV = false, defaultSave = false, mem,
        }: ObserveEditProps, ref
    ) => {
        const {storage, setStorage} =useStorage();
        const {inp, setInp} = useItemInputControl({ref});
        //【Hook死循环】不能使用const newconfig=typeof config ==='function'? config(inp) : config;
        const newconfig = React.useMemo(() => {
            return (typeof config === 'function' ? config(storage) : config);
        }, [storage]);
        const {itemObservation, itemObservationA,} = useObserveItem(newconfig, allowableV,memoF);
        //有可能这两个注入的 newconfig 不一样？
        const {render} = useObserveEdLine(inp, setInp, newconfig, allowableV, defaultSave,memoF);
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

//View相关
interface EachJudObserveConfig2X extends EachObserveConfig{
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
    //多出的：
    cspan?: number;     //判定标准  栏目的 span
    sync?: string;      //对应的归属区块的底下的那个check配置行，结论存储字段和大项目列表的字段做同步了；sync=大项目列表检验结果的存储名。
}
/**先对配置的跨行span:初始化处置，默认计算的字段。
 * @param config  配置。      浅拷贝，会修改了原始配置对象。
 * 【配置注意】t:[,,]后面有配第二列的，前面也需要配相应列。
 * 约束：测量结果的合并 omit 有多个组合的情况，必须分解成多个序号方式。
 * */
const useJudgObserveConfigExtend2= ({ config, }  :{ config:EachObserveConfig[][],  }
) => {
    //不能用let configExtend=config观测数据  ；这样的导致实际同一个数据。
    // let configExtend=[...config观测数据] as EachJudObserveConfig2X[][];
    const configExtend =React.useMemo(() => {
        // let bigLabel: any;
        let bigCross: EachJudObserveConfig2X;
        let secoCross: EachJudObserveConfig2X;
        let thirdCross: EachJudObserveConfig2X;
        let unitCross: EachJudObserveConfig2X;
        let citCross: EachJudObserveConfig2X;      //判定标准栏目
        let valueCross: EachJudObserveConfig2X|undefined;
        let resultCross: EachJudObserveConfig2X|undefined;
        let resultName: any;
        const caseCit=config[0][0]?.cit!==undefined;        //有判定标准栏目的情形：
        config.forEach((line: EachObserveConfig[], i:number) => {
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
            line.forEach((subObj: EachObserveConfig, k:number)=> {
                //嵌套的小行：对应同一个序号的多个项目子行；
                const {t, u, cit}=subObj;
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
                    //增加 omit=false 来指出上面的跨行合并在这里被中止了！
                    // if(valueCross!==undefined && omit!==false)
                    //     valueCross.vspan=valueCross.vspan!+1;
                    valueCross=undefined;

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

interface ObserveTableProps {
    orc: any;
    config: EachObserveConfig[][];
    allowableV?: boolean;
    defaultSave?: boolean;
    rep: any;
    seqOfs?: number;   //默认=0 序号的开始,去掉前面几个
    nseq?: boolean;     //有无序号列, 默认有的
    //前缀区域栏目都被替换；【灵活应对】支持在第一行{&&第一个主项目}的前面位置插入自定义DOM： 可能直接替换项目主列 x 前面的那些列们。
    inPreN?: any;     //主项目item列之前的全部都隐藏不显示,同时用这个Node来替代它们原本的位置,仅仅对第一行起作用，但若有中间位置插入的拆分做了。
    tag?:string;      //导航用的id
    memoF?: boolean;    //有无项目配套备注列, 默认无
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
export const useObserveTable= ({orc, config,allowableV,defaultSave,rep,seqOfs=0,nseq,inPreN,tag,memoF} : ObserveTableProps
) => {
    const caseCrit=config[0][0]?.cit!==undefined;     //表示有这个栏目：判定标准的1列；
    //对配置的跨行span:初始化处置，默认计算的字段。
    const [configExtend] = useJudgObserveConfigExtend2({ config });
    const [renders, seqNow]=React.useMemo(() => {
        let seq=seqOfs;
        let resultName: any;
        let rrows=configExtend.map((line: EachObserveConfig[], i:number) => {
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
            return line.map(({n,t,x,u,check,save,c,d,bspan,span,tspan,uspan,vspan,rspan,cit,cspan,cbo}: EachJudObserveConfig2X, k:number)=> {
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
                    //假如是替换模式：【自定义回调viewN功能】替换掉3个栏目：观测数据 测量结果 允许值栏目的。
                    const [viewPrr,viewN]=cbo?.view&&cbo?.view(orc, ) || [];
                    //【问题】替换模式情况：前面的那些行若有<td>的span跨越本行的，将会很有可能导致布局问题，表格栏目列都需缝合的。
                    if(viewPrr && viewN)    return viewN;
                    // console.log("检验设TableRow备情况$seq=", seq,'t=',t,bspan, "SPAN",span,secoLabel,t[1]);
                    //底下的omit && vspan 只考虑序号行的第一个子项目的存储名字情形，归并不考虑自动转换的，只能支持手动输入；
                    return (
                        <TableRow key={i+'_'+k}  id={i===0 && k===0? tag : undefined}>
                            {(i===0 && k===0) && inPreN?  inPreN :
                                (i!==0 || k!==0) && inPreN? null :
                                    <>
                                        {!nseq && <CCell>{seq}</CCell> }
                                        { bspan && <CCell colSpan={xmqColmun===1?4:1} rowSpan={bspan} split>{t[0]}</CCell>
                                        }
                                        { span && xmqColmun>=2 && <CCell colSpan={xmqColmun===2?3:1} rowSpan={span} split>{t[1]}</CCell>
                                        }
                                        { tspan && xmqColmun>=3 && <CCell colSpan={xmqColmun===3?2:1} rowSpan={tspan} split>{t[2]}</CCell>
                                        }
                                        { xmqColmun>=4 && <CCell >{t[3]}</CCell>
                                        }
                                    </>
                            }

                            { x && <CCell>{x}</CCell>
                            }
                            { u && uspan && <CCell rowSpan={uspan} split>{u}</CCell>
                            }
                            { caseCrit && ( (cit && cspan) ? <CCell rowSpan={cspan} split>{cit}</CCell>
                                    : cit===undefined? null :
                                        <CCell></CCell>
                            ) }

                            { viewN ? viewN :
                                <React.Fragment>
                                    <CCell>{orc?.[n+'o']}</CCell>
                                    {  <CCell>{orc?.[n+'v']??calculate}</CCell>
                                    }
                                    { allowableV && <CCell rowSpan={vspan}>{orc?.[n+'a']}</CCell>
                                    }
                                </React.Fragment>
                            }

                            { rspan && resultName && <><CCell rowSpan={rspan} split>{orc?.[resultName]}</CCell>
                                {memoF && <CCell rowSpan={rspan}>{orc?.[line[0]?.n+'m']}</CCell>}
                            </>
                            }
                        </TableRow>
                    );
                }
            });
        });
        return [rrows, seq];
    }, [orc,allowableV, configExtend,seqOfs]);
    return  [renders, seqNow] as [any[][],number];
};
