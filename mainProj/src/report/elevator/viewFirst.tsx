/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Cell, Table, TableBody, TableRow, Text, TableHead, useTheme, RCell,
} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../dict/eqpComm";


export const 首页概况ElevJj= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>分支机构：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.分支机构 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>楼盘名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.楼盘 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 类 型：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别)}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 品 种：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.施工类别 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.施工单位 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检 验 日 期：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设 备 代 码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

