/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableHead, TableRow, Text,} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {twoForkSelect} from "../../common/base";


/**较为常见的  现场条件
 * */
export const 常用现场条件V1 = ({orc, rep, config}: { orc: any, rep: any, config: any[] }
) => {
    const recNums = orc?.检验条件?.length;
    const blocks = Math.ceil(recNums / 5) || 1;     //倒转的，每5行的一块块布局:固定的5个日期汇集打印的一行。
    return <>
        <Table fixed={ ["%", "8.1%", "8.1%", "8.1%", "8.1%", "8.1%"] } css={{borderCollapse: 'collapse'}} tight miniw={800}>
            <TableHead>
                <TableRow>
                    <CCell>现场检验条件</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
                    <CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {(new Array(blocks)).fill(null).map((_, b: number) => {
                    const SumRowB = config.length;
                    const dates = [] as any;      // const condits=[][] as any[];
                    //底下condits[i].concat 不能用push函数来替代的：        let condit1: JSX.Element[]=[];
                     let condits = Array(SumRowB).fill([]);
                    (new Array(5)).fill(null).forEach((_, d:number) => {
                        if(b*5 +d>=recNums){
                            //空白
                            config.forEach(([title,{f:field,N:descnode}]: any, i: number) =>{
                                condits[i]=condits[i].concat(<CCell key={b*5 +d+''+i}></CCell>);
                            });
                            dates.push(<CCell key={b*5 +d}></CCell>);
                        }
                        else{
                            const row=orc?.检验条件?.[b*5 +d];
                            config.forEach(([title,{f:field,N:descnode}]: any, i: number) =>{
                                condits[i]=condits[i].concat(<CCell key={b*5 +d+''+i}>{twoForkSelect(row?.[field])}</CCell>);
                            });
                            dates.push(<CCell key={b*5 +d}>{row?.d}</CCell>);
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
        <Text css={{fontSize: '0.8rem'}}>
            注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
        </Text>
    </>;
};

