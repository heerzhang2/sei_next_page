/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, RCell,
} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {AttentionPoint} from "../../common/rarelyVary";

export const 首页概况SundJ= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  const 施工单位=(orc: any)=>
      '重大修理'===orc.施工类别? orc.维修单位 :
          '改造'===orc.施工类别? orc.改造单位 :
              orc.安装单位;
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>施工单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{施工单位(orc) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备代码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验类别 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检验日期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
          <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

export const 注意事项SundJ= ({comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl>
    2．有下列情况之一的，本检验报告无效：<br/>(1)无检验、审核、批准人员签字；<br/>
    (2)无检验机构的核准证号；<br/>
    (3)无检验机构的公章或者检验专用章。<br/>
    3. 本检验报告一式三份，由检验机构、施工单位和使用单位分别保存。<br/>
    4. 对本检验报告结论如有异议，请在取得本报告后 15 日内，向检验机构提出书面意见。<br/>
    5．
  </AttentionPoint>;
};

