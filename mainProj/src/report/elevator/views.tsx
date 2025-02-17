/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableHead, TableRow, Text, } from "customize-easy-ui-component";
import {DirectLink,} from "../../routing/Link";
import {useMeasureTable} from "../hook/useMeasure";


/**比较通用的测量结果记录表
 * @property mem: 备注的存储名
 * 和这类似的还有： 测量记录三半 ； 测量记录两半 ； 处理项目太多的拆分情形。
* */
export const 测量记录Elv = ({orc, rep, label, config,
                               fixed = ["2.7%", "6%", "3%", "8%", "%", "10%", "4%", "8%", "7.1%", "5.2%"],
                               tag = 'Measure', children, mem
                 }: {
                   orc: any, rep: any, label: string, config: any[], fixed?: string[], tag?: string, children?: any,mem?: string
                 }
) => {
  const renderMeasure = useMeasureTable({rep, orc, config});
  const 观测备注: string[] = mem ? orc?.[mem] : '';
  return <>
    <Text variant="h4" css={{
      marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed} css={{borderCollapse: 'collapse'}} tight miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize: '0.7rem'}}>序号</Text></CCell>
          <CCell colSpan={2}><Text css={{fontSize: '0.7rem'}}>项目编号</Text></CCell><CCell colSpan={2}>检测内容与要求</CCell><CCell>检测项目</CCell>
          <CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell><Text css={{fontSize: '0.75rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${tag}?original=1#${tag}`}>
          {renderMeasure}
          {mem  &&  <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={9}>
              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {观测备注 || '／'}
              </div>
            </Cell>
          </TableRow>
          }
        </DirectLink>
      </TableBody>
    </Table>
    {children}
  </>;
};
