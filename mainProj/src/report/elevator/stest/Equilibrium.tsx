/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, InputLine, Input, Table, TableHead, TableRow, CCell, TableBody, Button, ColumnWidth, SuffixInput, Alert,
} from "customize-easy-ui-component";
import {
    InspectRecordLayout, InternalItemProps, RepLink, useItemInputControl,
} from "../../common/base";
import {useMeasureInpFilter} from "../../common/hooks";
import {tableSetInp} from "../../../common/tool";
import {useBalanceCoefficient, useBalanceCoefficientPrepare} from "../hook/useBalanceCoefficient";
import {Link as RouterLink} from "../../../routing/Link";

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

export const Equilibrium=
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

        return (
            <InspectRecordLayout inp={inp} setInp={setInp}  getInpFilter={getInpFilter} show={show}
                                 alone={alone}  label={label!}>
                <Text variant="h5">{label}：</Text>
                按照P(载重量)与Pe(额定载重量)的百分比(%)来录入电压电流值：
                { inp && <>
                    {inp?.额定载荷 ?
                        <>
                            <Button onPress={() => {
                                setInp({...inp, 平衡表: undefined});
                            }}>清空表</Button><br/>
                            {config.map((phPercent, i: number) => {
                                return <React.Fragment key={i}>
                                    ({i + 1}) P(载重量)与Pe(额定载重量)的百分比({inp?.平衡表?.[i]?.n}%) {'>'}
                                    <ColumnWidth clnWidth={320} key={i}>
                                        <Text variant="h6">P(kg)= {inp?.平衡表?.[i]?.P}</Text>
                                        {[['上行', 'u', 's'], ['下行', 'd', 'x']].map(([title, vot, cic], w: number) => {
                                            return <ColumnWidth clnWidth={160} key={w + '_' + i}>
                                                <InputLine label={`电压V（V）${title}：`}>
                                                    <SuffixInput value={inp?.平衡表?.[i]?.[vot] || ''}
                                                                 onChange={e => tableSetInp('平衡表', i, inp, setInp, vot, e.currentTarget.value || undefined)}>V</SuffixInput>
                                                </InputLine>
                                                <InputLine label={`电流I（A）${title}：`}>
                                                    <SuffixInput value={inp?.平衡表?.[i]?.[cic] || ''}
                                                                 onSave={txt => tableSetInp('平衡表', i, inp, setInp, cic, txt)}>A</SuffixInput>
                                                </InputLine>
                                            </ColumnWidth>;
                                        })}
                                    </ColumnWidth>
                                </React.Fragment>;
                            })}
                        </>
                        :
                        <><br/><Alert intent={"error"} title={'没有额定载荷数据，就无法试验'}/></>
                    }
                    <hr/>
                    {inp?.额定载荷 && renderMap}

                    <div css={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
                        <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                            1、经测定，绘成曲线后，交叉点的对应的横坐标即为此台电梯的平衡系数为K=
                            <Input value={inp?.衡系数 ?? ''} size={2}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => setInp({...inp, 衡系数: e.currentTarget.value || undefined})}/>%
                        </div>
                        <div css={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                            2、用平衡系数专用测量仪器测量结果,K=
                            <Input value={inp?.衡仪果 ?? ''} size={2}
                                   style={{display: 'inline-flex', width: 'unset'}}
                                   onChange={e => setInp({...inp, 衡仪果: e.currentTarget.value || undefined})}/>%
                        </div>
                    </div>
                 </>
                }

                {children ? children :
                    <Text css={{fontSize: '0.8rem'}}>
                        注：<br/>
                        1.检测时，发现轿厢、对重或者其他部件（如补偿装置）的重量发生变化，并且可能导致平衡系数发生变化的，应
                        当测试平衡系数。
                        2.检测当年有A1.3.12所述125%额定载重量制动试验要求时，应当测试平衡系数。
                    </Text>
                }
            </InspectRecordLayout>
        );
    });

/**平衡系数的 展示
 * */
export const EquilibriumVw = ({children, orc, rep, label, config = 默认平衡比例}: {
                                  orc: any,
                                  rep: any,
                                  label: any,
                                  children?: any,
                                  config?: any[]
                              }
) => {
    const fixed = ["11%", "6.8%"];      //剩下的5？，列：自动
    const {ytype,yu ,yd, xpConfig}=useBalanceCoefficientPrepare({config, table:orc?.平衡表});
    const {renderMap}=useBalanceCoefficient({type:ytype, yu ,yd, xp:xpConfig});
    return <>
        <div css={{"@media print": {paddingBottom: '6rem', pageBreakInside: 'avoid'}}}>
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>{label}</Text>
        </div>
        <Table id='Equilibrium' fixed={fixed}
               tight miniw={800} css={{borderCollapse: 'collapse', "@media print": {marginTop: '-6rem'}}}>
            <TableHead>
                <TableRow>
                    <CCell colSpan={2}>P(载重量)与Pe(额定载重量)的百分比(%)</CCell>
                    {config.map((o: any, i: number) => {
                        return <CCell key={i}>{o ?? '／'}</CCell>
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                <RepLink ori rep={rep} tag={'Equilibrium'}>
                    <TableRow>
                        <CCell colSpan={2}>P(kg)</CCell>
                        {config.map((o: any, i: number) => {
                            return <CCell key={i}>{orc?.平衡表?.[i]?.P ?? '／'}</CCell>
                        })}
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>电压V（V）</CCell><CCell>上行</CCell>
                        {config.map((o: any, i: number) => {
                            return <CCell key={i}>{orc?.平衡表?.[i]?.u ?? '／'}</CCell>
                        })}
                    </TableRow>
                    <TableRow>
                        <CCell>下行</CCell>
                        {config.map((o: any, i: number) => {
                            return <CCell key={i}>{orc?.平衡表?.[i]?.d ?? '／'}</CCell>
                        })}
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2}>电流I（A）</CCell><CCell>上行</CCell>
                        {config.map((o: any, i: number) => {
                            return <CCell key={i}>{orc?.平衡表?.[i]?.s ?? '／'}</CCell>
                        })}
                    </TableRow>
                    <TableRow>
                        <CCell>下行</CCell>
                        {config.map((o: any, i: number) => {
                            return <CCell key={i}>{orc?.平衡表?.[i]?.x ?? '／'}</CCell>
                        })}
                    </TableRow>
                </RepLink>
            </TableBody>
        </Table>
        <div css={{marginTop: '0.5rem',}}>
            {orc?.额定载荷 && renderMap}
        </div>
        <RouterLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Equilibrium?original=1#Equilibrium`}>
            1、经测定，绘成曲线后，交叉点的对应的横坐标即为此台电梯的平衡系数为K= <Text css={{fontSize: '1.3rem'}}>{orc?.衡系数 ?? ''}</Text> %<br/>
            2、用平衡系数专用测量仪器测量结果,K= <Text css={{fontSize: '1.3rem'}}>{orc?.衡仪果 ?? ''}</Text> %<br/>
        </RouterLink>
        {children ? children :
            <Text css={{fontSize: '0.8rem'}}>
                注：<br/>
                1.检测时，发现轿厢、对重或者其他部件（如补偿装置）的重量发生变化，并且可能导致平衡系数发生变化的，应
                当测试平衡系数。
                2.检测当年有A1.3.12所述125%额定载重量制动试验要求时，应当测试平衡系数。
            </Text>
        }
    </>;
};
