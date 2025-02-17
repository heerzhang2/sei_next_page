/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Table, TableBody, TableRow, RCell, Text,} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../../dict/eqpComm";

export const 首页概况Tower= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>分支机构：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc?.分支机构 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备品种：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc.设备品种) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>型号规格：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.型号 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检验日期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检验类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验类别}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};
// 安装改造重大修理单位名称