/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {RepLink} from "../../common/base";
import {useMeasureTable} from "../../hook/useMeasure";
import {DirectLink} from "../../../routing/Link";

//技术资料见证 +备注
export const WitnessMemoVw= ({children, orc, rep,titles,bhTil }
                                 : { orc: any, rep: any, children?: any, titles?: any[],bhTil?:string}
) => {
  return <>
    <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
        <Text id="Witness" variant="h4" css={{
          marginTop: '1rem',
        }}>{titles?.[0] ?? '五、技术资料和工作见证材料'}</Text>
    </div>
    <Table fixed={["5%", "10%", "%", "26%"]} css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}}}
              tight miniw={800}>
      <TableHead>
        <RepLink ori rep={rep} tag={'Witness'}>
          <TableRow>
            <CCell>序号</CCell>
            <CCell>代号</CCell>
            <CCell>名称</CCell>
            <CCell>{bhTil ?? '备注'}</CCell>
          </TableRow>
        </RepLink>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Witness'}>
          {orc?.见证表?.map((o: any, i: number) => {
            if (JSON.stringify(o) === '{}') return null;
            else return (
                <TableRow key={i}>
                  <CCell>{i + 1}</CCell>
                  <CCell>{o?.no}</CCell>
                  <CCell>{o?.ti}</CCell>
                  <CCell>{o?.bh}</CCell>
                </TableRow>
            );
          })}
        </RepLink>
      </TableBody>
    </Table>
    <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
        <Text variant="h4" css={{marginTop: '1rem',
        }}>{titles?.[1] ?? '六、备注'}</Text>
    </div>
    <Table fixed={["%"]} css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'} }}>
      <TableBody>
        <RepLink ori rep={rep} tag={'Witness'}>
          <TableRow><Cell>
            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.大备注 ?? '／'}</div>
          </Cell></TableRow>
        </RepLink>
      </TableBody>
    </Table>
    {children}
  </>;
};

/**比较通用的测量结果记录表
 * @property mem: 备注的存储名
 * @property bhsp: 项目编号的colSpan；
 * @property noxm: 没有项目栏目
 * */
export const MeasureTowerVw = ({orc, rep, label, config, tag = 'Measure', children, mem, bhsp=2, noxm,
                              fixed = ["2.7%", "6%", "3%", "8%", "%", "10%", "4%", "8%", "7.1%", "5.2%"]
                            }: {
               orc: any, rep: any, label: string, config: any[], fixed?: string[], tag?: string, children?: any,mem?: string,
               bhsp?:number, noxm?:boolean
                            }
) => {
  const renderMeasure = useMeasureTable({rep, orc, config});
  const 观测备注: string[] = mem ? orc?.[mem] : '';
  const bzSpan=fixed.length-1;
  return <>
    <Text variant="h4" css={{
      marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed} css={{borderCollapse: 'collapse'}} tight miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize: '0.7rem'}}>序号</Text></CCell>
          <CCell colSpan={bhsp}><Text css={{fontSize: '0.7rem'}}>项目编号</Text></CCell><CCell colSpan={4-bhsp}>检测内容与要求</CCell>
          {!noxm && <CCell>检测项目</CCell>}
          <CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell><Text css={{fontSize: '0.75rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${tag}?original=1#${tag}`}>
          {renderMeasure}
          {mem  &&  <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={bzSpan}>
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
