/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,SuffixInput,
    LineColumn,
    InputLine,
    Input,
    Button,
    useTheme,  Alert, ColumnWidth,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout,
    InternalItemProps,
    useItemInputControl,
} from "../common/base";
import {useMeasureInpFilter} from "../common/hooks";
import {tableSetInp} from "../../common/tool";
import {useBalanceCoefficient, useBalanceCoefficientPrepare} from "./hook/useBalanceCoefficient";
import {EditStorageContext} from "../StorageContext";

//可以复用的组件： 尽量抽象 和 提高代码复用程度！
interface Props  extends InternalItemProps{
    label?: string;
    nos?: string;
    titles?: any[];    //可能是Node[]，不一定纯粹string;
    zjuse?: number;     //最末尾的注释的文本使用那一段话？可选择办法的。
    config?: any[];    //有配置模式的
}

const 默认平衡比例=[30,40,45,50,60];
const itemA平衡=['额定载荷','平衡表','中部速','速百分','衡系数','衡仪果'];
export const itemn平衡=['平衡表','中部速','速百分','衡系数','衡仪果'];
export const EquilibriumC=
React.forwardRef(({ children, show ,alone=true,refWidth,label,config=默认平衡比例}:Props,  ref
) => {
    const defvcbFunc = React.useCallback((par: any) => {
        const { 平衡表 }=par||{};
        if(!平衡表 || 平衡表.length<1){
            let 默认平衡=[] as any;
            if(!(par.额定载荷))     return par;   //必须作为前置条件的！ throw new Error("额定载荷没数据"); 打印简易原始记录没有注入数据的？
            //初始化时刻敲定的。
            config.forEach((percent, i:number)=> {          //额定载荷：不会随意改的基础技术参数。
                let obj={n:percent, P: (par.额定载荷)*percent/100};
                默认平衡.push(obj);
            });
            par.平衡表=默认平衡;            //defaultV:默认平衡,
        }
        return  par;
    }, [config]);
    const [getInpFilter]=useMeasureInpFilter(null,itemA平衡,defvcbFunc);
    const {inp, setInp} = useItemInputControl({ ref });
    //存储："平衡表": [{"P": 240, "n": 30, "d": "34","s": "5", "u": "4", "x": "66"},]
    const {ytype,yu ,yd, xpConfig}=useBalanceCoefficientPrepare({config, table:inp?.平衡表});

    const {renderMap}=useBalanceCoefficient({type:ytype, yu ,yd, xp:xpConfig});

    // const context =React.useContext(EditStorageContext);
    // if(!context)  throw new Error("需context下");
    // const {storage, setStorage,} =context;
    // const render平衡表 =React.useMemo(() => {
    //     return ;
    // },[config,inp,setInp]);

    return (
        <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                             alone={alone}  label={label!}>
            {label}; 按照P(载重量)与Pe(额定载重量)的百分比(%)来录入电压电流值：
            { inp &&  <>
                {inp?.额定载荷?
                    <>
                        <Button  onPress={() =>{
                            // inp.平衡表=[];
                            setInp({ ...inp, 平衡表: undefined });
                            // setStorage({...storage, ...inp});
                        } }>清空表</Button><br/>
                        { config.map((phPercent, i:number) => {
                            return  <React.Fragment key={i}>
                                ({i+1}) P(载重量)与Pe(额定载重量)的百分比({inp?.平衡表?.[i]?.n}%) {'>'}
                                <ColumnWidth clnWidth={320} key={i}>
                                    <Text variant="h6">P(kg)= {inp?.平衡表?.[i]?.P}</Text>
                                    { [['上行','u','s'],['下行','d','x']].map(( [title,vot,cic],  w:number) => {
                                        return <ColumnWidth clnWidth={160} key={w+'_'+i}>
                                            <InputLine  label={`电压V（V）${title}：`}>
                                                <SuffixInput  value={inp?.平衡表?.[i]?.[vot] ||''} onChange={e=>tableSetInp('平衡表',i,inp,setInp,vot,e.currentTarget.value||undefined)}>V</SuffixInput>
                                            </InputLine>
                                            <InputLine  label={`电流I（A）${title}：`}>
                                                <SuffixInput  value={inp?.平衡表?.[i]?.[cic] ||''} onSave={txt=>tableSetInp('平衡表',i,inp,setInp,cic,txt)}>A</SuffixInput>
                                            </InputLine>
                                        </ColumnWidth>;
                                    }) }
                                </ColumnWidth>
                            </React.Fragment>;
                        }) }
                    </>
                    :
                    <><br/><Alert intent={"error"} title={'没有额定载荷数据，就无法试验'}/></>
                }
                <hr/>
                当轿厢内载重量为额定载重量的50%时，轿厢向下运行至行程中部时速度v={inp?.['中部速']} m/min：
                <LineColumn column={4}>
                    <InputLine label={`轿厢向下运行至行程中部时速度v`}>
                        <SuffixInput  value={inp?.['中部速'] ||''} onSave={txt=> setInp({...inp,中部速: txt || undefined })}>m/min</SuffixInput>
                    </InputLine>
                    <InputLine label={`1、所测的速度v与额定速度的百分比为`}>
                        <SuffixInput  value={inp?.['速百分'] ||''} onSave={txt=> setInp({...inp,速百分: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label={`2、经测定，绘成曲线后，交叉点的对应的横坐标即为此台电梯的平衡系数为K`}>
                        <SuffixInput  value={inp?.['衡系数'] ||''} onSave={txt=> setInp({...inp,衡系数: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                    <InputLine label={`用平衡系数专用测量仪器测量结果`}>
                        <SuffixInput  value={inp?.['衡仪果'] ||''} onSave={txt=> setInp({...inp,衡仪果: txt || undefined })}>%</SuffixInput>
                    </InputLine>
                </LineColumn>
                {inp?.额定载荷 && renderMap}
              </>
            }
        </InspectRecordLayout>
    );
} );

