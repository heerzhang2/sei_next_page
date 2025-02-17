/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Table, TableBody, TableRow, Text,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";


//间隙表：正规原始记录显示
export const 间隙记录表= ({ orc, rep,label,config } : { orc: any, rep: any,label:string,config:any}
) => {
    // const renderMeasure=useMeasureTableCrit({rep,orc, config});
    return <>
        <Text variant="h4" css={{
            marginTop: '1rem',
        }}>{label}</Text>
        <div css={{display: 'flex', justifyContent: 'space-between'}}>
            <Text></Text>
            <Text>单位：mm</Text>
        </div>
        <Table fixed={ ["6%", "11%", "20%", "%", "20%", "22%"] } css={{borderCollapse: 'collapse'}} tight miniw={800}>
            <TableBody>
                <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Gap?original=1#Gap`}>
                    <TableRow>
                        <CCell colSpan={2}>项目编号</CCell><CCell colSpan={3}>A3.2.5.2</CCell><CCell>A3.2.5.1</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell
                            colSpan={2}>检验内容</CCell><CCell>层门门扇之间的间间隙</CCell><CCell>层门门扇与立柱、门楣间隙</CCell><CCell>层门扇与地坎间隙</CCell><CCell>轿厢与层门框架或层门之间的间隙</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell rowSpan={2} colSpan={2}>判断标准</CCell><CCell colSpan={3}>新安装检验： x≤6</CCell><CCell
                        rowSpan={2}>x≤35</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={3}>非首次检验：x≤10</CCell>
                    </TableRow>
                    {!(orc?.间隙表?.length > 0) ?
                        <TableRow><CCell>观测数据</CCell><CCell colSpan={5}>空表！</CCell></TableRow>
                        :
                        <>
                            {orc?.间隙表?.map((o: any, i: number) => {
                                return (
                                    <TableRow key={i}>
                                        {0 === i && <CCell rowSpan={orc?.间隙表?.length}>观测数据</CCell>}
                                        <CCell>{o.n} 站</CCell><CCell>{o.j}</CCell><CCell>{o.t}</CCell><CCell>{o.s}</CCell><CCell>{o.K}</CCell>
                                    </TableRow>
                                );
                            })
                            }
                        </>
                    }
                    <TableRow>
                        <CCell
                            colSpan={2}>测量结果</CCell><CCell>{orc?.扇间隙}</CCell><CCell>{orc?.扇套隙}</CCell><CCell>{orc?.扇坎隙}</CCell><CCell>{orc?.轿框隙}</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={2}>检验结果</CCell><CCell
                        colSpan={3}>{orc?.门扇隙r}</CCell><CCell>{orc?.轿框隙r}</CCell>
                    </TableRow>
                </DirectLink>
            </TableBody>
        </Table>
        <Text css={{fontSize: '0.8rem'}}>
            注： 1、A3.2.5.1项、A3.2.5.2项，可以抽取基站、端站以及至少20%其他层站的层门进行检验；<br/>
            2、所检验的站需填写在相应栏中，测量结果符合要求的，在测量结果栏填所测量的数值区间范围（min-max），并在相应项目检验结果内
            打“√”；测量结果有不符合要求的，需在相应的站填写不合格的观测数据，并在相应项目检验结果中打“×”；
        </Text>
    </>;
};

