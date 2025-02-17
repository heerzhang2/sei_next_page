/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, RCell, Text,
} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../dict/eqpComm";


export const 首页概况Mbcr= ({theme, orc, original,rep,noOid} :{theme: any, orc:any, original?:boolean,rep:any,noOid?:boolean}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} } tight  miniw={800}>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 类 别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 品 种：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc.设备品种) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备型号规格：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.型号 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设 备 代 码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>使用登记证编码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用证号 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检 验 日 期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
          <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检 验 类 别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验类别}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
      {!noOid && <TableRow>
          <RCell css={{border:'none'}}>监察识别码：</RCell>
          <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
        </TableRow>
      }
    </TableBody>
  </Table>;
};
