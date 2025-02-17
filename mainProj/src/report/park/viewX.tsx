/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableHead, TableRow, Text,} from "customize-easy-ui-component";
import { DirectLink, } from "../../routing/Link";
import {twoForkSelect, twoForkSelectS} from "../common/base";

/**较为常见的  现场条件： 标题带入，避免于孤立页尾巴。
 * 允许设置 children:' '；
 * @param dcln 布局日期列数正常=5；或3;
 * */
export const 常用现场条件 = ({orc, rep, config,label='附录B：现场检验条件确认',children,padd=4,dcln=5,jyt='检验'}:
                                 { orc: any, rep: any, config: any[], label?:any,children?: React.ReactNode,padd?:number,dcln?:number,jyt?:string}
) => {
    const fixed=3===dcln? ["%", "10.4%", "10.4%", "10.4%"] : ["%", "8.1%", "8.1%", "8.1%", "8.1%", "8.1%"];
    if(dcln!==5 && dcln!==3)   throw new Error("非法列数");
    const recNums = orc?.检验条件?.length;
    const blocks = Math.ceil(recNums / dcln) || 1;     //倒转的，每dcln行的一块块布局:固定的dcln个日期汇集打印的一行。
    return <>
        <div  css={{"@media print": {paddingBottom: padd+'rem', pageBreakInside: 'avoid'}} }>
            <Text variant="h4" css={{marginTop: '1rem',}}>{label!}</Text>
        </div>
        <Table id={'SiteCondition'}  fixed={fixed}
               css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-'+padd+'rem'}}}  tight  miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell>现场{jyt}条件</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
                    {5===dcln && <><CCell>确认结果</CCell><CCell>确认结果</CCell></>}
                </TableRow>
            </TableHead>
            <TableBody>
                {(new Array(blocks)).fill(null).map((_, b: number) => {
                    const SumRowB = config.length;
                    const dates = [] as any;      // const condits=[][] as any[];
                    //底下condits[i].concat 不能用push函数来替代的：        let condit1: JSX.Element[]=[];
                     let condits = Array(SumRowB).fill([]);
                    (new Array(dcln)).fill(null).forEach((_, d:number) => {
                        if(b*dcln +d>=recNums){
                            //空白
                            config.forEach(([title,{f:field,N:descnode}]: any, i: number) =>{
                                condits[i]=condits[i].concat(<CCell key={b*dcln +d+''+i}></CCell>);
                            });
                            dates.push(<CCell key={b*dcln +d}></CCell>);
                        }
                        else{
                            const row=orc?.检验条件?.[b*dcln +d];
                            config.forEach(([title,{f:field,N:descnode}]: any, i: number) =>{
                                condits[i]=condits[i].concat(<CCell key={b*dcln +d+''+i}>{twoForkSelectS(row?.[field])}</CCell>);
                            });
                            dates.push(<CCell key={b*dcln +d}>{row?.d}</CCell>);
                        }
                    });

                    return <DirectLink key={b} href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/SiteCondition#SiteCondition`}>
                        {config.map(([title,{f:field,N:descnode}]: any, i: number) =>{
                            return <TableRow key={i}>
                                <CCell>{descnode}</CCell>
                                {condits[i]}
                            </TableRow>
                        })}
                        <TableRow>
                            <CCell>确认时间</CCell>
                            {dates}
                        </TableRow>
                    </DirectLink>;
                }) }
            </TableBody>
        </Table>
        { children? children:
            <Text css={{fontSize: '0.8rem'}}>
                注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
            </Text>
        }
    </>;
};
