/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {calcAverageArrObj} from "../../../common/tool";
import {RepLink} from "../../common/base";

/**安全距离记录 ；报告可打印的 测量：支持更大可能的复用性。 用了Hook就需要正规的React组件模式来做。
 * @param children  直接作为嵌套的组件也能传递过来的。
 * @param label 允许注入任意的DOM节点，不仅是字符串的。
 * */
export const ThicknessVw= ({children, orc, rep,label,nomm } : { orc: any, rep: any,label:any, children?: any,nomm?:boolean}
) => {
  const aveThick=calcAverageArrObj([orc?.力面厚1o,orc?.力面厚2o,orc?.力面厚3o],(row)=>row,2);
  return <>
    { typeof label==='object' ?  <>{label}</>
        :
        <Text variant="h4" css={{marginTop: '1rem',
        }}>{label}</Text>
    }
    <Table id={'Thickness'} fixed={ ["6%","%","6%","13%","9%","9%","8%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>检验项目</CCell>
          <CCell>单位</CCell>
          <CCell>观测值</CCell>
          <CCell>平均值</CCell>
          <CCell>结果值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Thickness'}>
          <TableRow>
            <CCell rowSpan={3}>1</CCell>
            <CCell rowSpan={3} css={{wordBreak: 'break-all'}}>主要受力结构件断面有效厚度，设计值（{orc.力面厚设}）mm</CCell>
            <CCell rowSpan={3}>mm</CCell>
            <CCell>{orc.力面厚1o}</CCell>
            <CCell rowSpan={3}>{aveThick}</CCell>
            <CCell rowSpan={3}>{orc.力面厚v}</CCell>
            <CCell rowSpan={3}>{orc.力面厚r}</CCell>
          </TableRow>
          <TableRow>
            <CCell>{orc.力面厚2o}</CCell>
          </TableRow>
          <TableRow>
            <CCell>{orc.力面厚3o}</CCell>
          </TableRow>
          {!nomm && <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.力面备注 || '／'}
            </div></Cell>
          </TableRow>
          }
        </RepLink>
      </TableBody>
    </Table>
    {children?  children
        :
      <Text css={{fontSize:'0.8rem'}}>
        注：1、对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。
        2、未测量或无需测量的，仅填检验结果栏。
      </Text>
    }
  </>;
};
