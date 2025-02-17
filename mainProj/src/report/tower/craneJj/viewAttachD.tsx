/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, Cell,
} from "customize-easy-ui-component";
import {variant附设} from "./editAttachD";
import {RepLink} from "../../common/base";

const defaultV附设表=[
    {n:1, y:variant附设[0]},
    {n:3, y:variant附设[1]}
];
/**应变应力测试
 * */
export const AttachmentDeviceVw= ({orc, rep, label,nos} :{orc:any, rep:any, label:any,nos:string}
) => {
  //一条都没有做的：默认？ 若有添加任意一条就按照实际数据输出了。 也不管类型“variant附设”是否齐了；
  //【预留】一页尾巴最少的3.5rem的高度。避免尴尬一页才打印出孤零零的标题。
  return <>
    <div id='Attachment' css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
    </div>
    <div css={ {"@media print": {marginTop: '-3.5rem'}} }>
      {(orc.附设表??defaultV附设表)?.map((o: any, i:number) => {
        return <React.Fragment key={i}>
          <Text variant="h5" css={{marginTop: i>0? '0.5rem': undefined}}>附表{nos}-{o?.n} {o?.y}</Text>
          <Table  key={i} fixed={ ["8.2%","3%","39%","11%","%"] } tight  miniw={800} css={ {borderCollapse: 'collapse' } }>
            <TableBody>
              <RepLink ori rep={rep} tag={'Attachment'}>
                <TableRow>
                  <CCell colSpan={2}>设备名称</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>设备型号</CCell>
                  <CCell colSpan={2}>{o?.m}</CCell>
                </TableRow>
                <TableRow>
                  <CCell colSpan={2}>额定起重量</CCell>
                  <CCell>{o?.Q} t</CCell>
                  <CCell>产品编号</CCell>
                  <CCell colSpan={2}>{o?.p}</CCell>
                </TableRow>
                <TableRow>
                  <CCell colSpan={2}>制造单位</CCell>
                  <CCell colSpan={4}>{o?.u}</CCell>
                </TableRow>
                <TableRow><CCell>序号</CCell><CCell colSpan={4}>检验内容</CCell><CCell>检验结果</CCell></TableRow>
                { o?.y==='升降机等登机设备' ? <RepLink ori rep={rep} tag={'Attachment'}>
                      <TableRow><CCell>1</CCell><Cell colSpan={4}>金属结构无明显可见的损伤、缺陷。</Cell>
                        <CCell rowSpan={4}><Text variant="h4" css={{}}>{o?.r || '／'}</Text></CCell>
                      </TableRow>
                      <TableRow><CCell>2</CCell><Cell colSpan={4}>吊笼门应当能够完全遮蔽开口，并且配备机械锁在运行状态下门不能被打开；所有吊笼门都处于关闭位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                      <TableRow><CCell>3</CCell><Cell colSpan={4}>层门应与吊笼电气或机械联锁，只有在吊笼底板在登机平台时，该平台的层门方可打开。所有层门处于关闭和锁紧位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                      <TableRow><CCell>4</CCell><Cell colSpan={4}>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；限位开关、极限开关等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                    </RepLink>
                    :
                    <RepLink ori rep={rep} tag={'Attachment'}>
                      <TableRow><CCell>1</CCell><Cell colSpan={4}>金属结构无明显可见的损伤、缺陷。</Cell>
                        <CCell rowSpan={3}><Text variant="h4" css={{}}>{o?.r || '／'}</Text></CCell>
                      </TableRow>
                      <TableRow><CCell>2</CCell><Cell colSpan={4}>各主要零部件和电气设备无明显可见的损伤、缺陷。</Cell></TableRow>
                      <TableRow><CCell>3</CCell><Cell colSpan={4}>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；起升高度限位、运行行程限位、幅度限位等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                    </RepLink>
                }
                <TableRow>
                  <CCell>备注</CCell>
                  <Cell colSpan={5}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                    {o?.Z}
                  </div></Cell>
                </TableRow>
              </RepLink>
            </TableBody>
          </Table>
        </React.Fragment>;
      }) }
    </div>
    <Text css={{fontSize:'0.8rem'}}>
      注：对于附表{nos}三个表，无需检验的，仅填检验结果栏。可另附表单。
    </Text>
  </>;
};
