/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {RepLink} from "../../common/base";

/**正规jsx组件的用法需改成英文的。
 * 报错：Imported JSX component Moni监控管理系统 must be in PascalCase or SCREAMING_SNAKE_CASE ；<tag></tag>带儿子的组件名字不能用中文的。
 * */
export const MonitoringSysVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
  return <>
    { typeof label==='object' ?  <>{label}</>
        :
        <Text variant="h4" css={{marginTop: '1rem',
        }}>{label}</Text>
    }
    <Table fixed={ ["3.5%","%","14%","10%","10%","10%","10%","8%","8%","6.5%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>项目编号</CCell>
          <CCell>次数(类别）</CCell>
          <CCell colSpan={2}>显示屏数值</CCell>
          <CCell colSpan={2}>测量值</CCell>
          <CCell colSpan={2}>计算值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
          <RepLink ori rep={rep} tag={'Monitoring'}>
            <TableRow>
              <CCell rowSpan={4}>1</CCell>
              <CCell rowSpan={4}>C4.2.2.5.1.1 起升高度（m)</CCell>
              <CCell>/</CCell>
              <CCell>H1</CCell>
              <CCell>H2</CCell>
              <CCell>h1</CCell>
              <CCell>h2</CCell>
              <CCell>H</CCell>
              <CCell>h</CCell>
              <CCell rowSpan={4}>{orc.起高表r}</CCell>
            </TableRow>
            { (new Array(3)).fill(null).map(( _,  r:number) => {
              const o=orc.起高表?.[r];
              return  <TableRow key={r}>
                <CCell>{r+1}次</CCell>
                <CCell>{o?.H1}</CCell>
                <CCell>{o?.H2}</CCell>
                <CCell>{o?.h1}</CCell>
                <CCell>{o?.h2}</CCell>
                <CCell>{o?.H}</CCell>
                <CCell>{o?.h}</CCell>
              </TableRow>;
            }) }
            <TableRow>
              <CCell rowSpan={3}>2</CCell>
              <CCell rowSpan={3}>C4.2.2.5.1.2 运行行程（m)</CCell>
              <CCell>/</CCell>
              <CCell>S1</CCell>
              <CCell>S2</CCell>
              <CCell colSpan={2}>s</CCell>
              <CCell>S</CCell>
              <CCell>/</CCell>
              <CCell rowSpan={3}>{orc.行程表r}</CCell>
            </TableRow>
            { ['(1)小车','(2)大车'].map(( group,  r:number) => {
              const o=orc.行程表?.[r];
              return  <TableRow key={r}>
                <CCell>{group}</CCell>
                <CCell>{o?.S1}</CCell>
                <CCell>{o?.S2}</CCell>
                <CCell colSpan={2}>{o?.s}</CCell>
                <CCell>{o?.S}</CCell>
                <CCell>/</CCell>
              </TableRow>;
            }) }
            <TableRow>
              <CCell rowSpan={4}>3</CCell>
              <CCell rowSpan={4}>C4.2.2.5.1.3 幅度（m）</CCell>
              <CCell>/</CCell>
              <CCell colSpan={2}>Ra （单位：m）</CCell>
              <CCell colSpan={2}>Rb （单位：m）</CCell>
              <CCell colSpan={2}>ER=|Ra-Rb| / Rb×100%</CCell>
              <CCell rowSpan={4}>{orc.幅度表r}</CCell>
            </TableRow>
            { ['最大工作幅度的30% (R0.3)','最大工作幅度的60%(R0.6)','最大工作幅度的90%(R0.9)'].map(( group,  r:number) => {
              const o=orc.幅度表?.[r];
              return  <TableRow key={r}>
                <CCell>{group}</CCell>
                <CCell colSpan={2}>{o?.d}</CCell>
                <CCell colSpan={2}>{o?.m}</CCell>
                <CCell colSpan={2}>{o?.c}</CCell>
              </TableRow>;
            }) }
            { ['1次'].map(( group,  r:number) => {
              const o=orc.回转表?.[r];
              return  <TableRow key={r}>
                {0===r && <>
                  <CCell rowSpan={1}>4</CCell>
                  <CCell rowSpan={1}>C4.2.2.5.1.6 回转角度（°）</CCell>
                </>}
                <CCell>/</CCell>
                <CCell colSpan={2}>{o?.d}</CCell>
                <CCell colSpan={2}>{o?.m}</CCell>
                <CCell colSpan={2}>/</CCell>
                {0===r && <>
                  <CCell rowSpan={1}>{orc.回转表r}</CCell>
                </>}
              </TableRow>;
            }) }
            <TableRow>
              <CCell>5</CCell>
              <CCell>C4.9.7.1风速（m/s）</CCell>
              <CCell>1次</CCell>
              <CCell colSpan={2}>{orc.监风速?.d}</CCell>
              <CCell colSpan={2}>{orc.监风速?.m}</CCell>
              <CCell colSpan={2}>/</CCell>
              <CCell>{orc.监风速?.r}</CCell>
            </TableRow>
            <TableRow>
              <CCell>备注</CCell>
              <Cell colSpan={9}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.监控备注 || '／'}
              </div></Cell>
            </TableRow>
          </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.8rem'}}>
      注：1、显示值和测量值不大于5%时，检验结果符合要求。
      2、未检查或无需检验的，仅填检验结果栏。
      3、幅度的综合误差ER=｜Ra-Rb｜/Rb×100%（式中，Ra为系统测量值; Rb为试验幅度的实际数值。）
    </Text>
  </>;
};
