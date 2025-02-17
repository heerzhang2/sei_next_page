/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {useMeasureTable} from "../../hook/useMeasure";
import {config距离} from "./editSafDist";
import {RepLink} from "../../common/base";

/**安全距离记录 ；报告可打印的 测量：支持更大可能的复用性。 用了Hook就需要正规的React组件模式来做。
 *  @param children  直接作为嵌套的组件也能传递过来的。
 * */
export const SafeDistanceVw= ({children, orc, rep,label } : { orc: any, rep: any,label:string, children?: any}
) => {
  const renderMeasure=useMeasureTable({rep,orc, config: config距离(orc)});
  return <>
    <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
      <Text variant="h4" css={{marginTop: '1rem',
      }}>{label}</Text>
    </div>
    <Table fixed={ ["3.5%","15%","13%","%","10%","5%","11%","7%","6.6%"] }  css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'} }}
           tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.65rem'}}>序号</Text></CCell><CCell colSpan={4}>检验项目</CCell><CCell>单位</CCell>
          <CCell>观测数据</CCell><CCell><Text css={{fontSize:'0.7rem'}}>测量结果</Text></CCell><CCell><Text css={{fontSize:'0.7rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'SafeDistance'}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.安距备注 || '／'}
            </div></Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    { children }
    <Text css={{fontSize:'0.8rem'}}>
      注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。<br/>
      2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
    </Text>
  </>;
};
