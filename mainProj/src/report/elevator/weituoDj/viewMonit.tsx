/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead,
} from "customize-easy-ui-component";
import {items监控设施} from "./editMonit";
import {useOmnipotentPref} from "../../hook/useOmnipotentPref";
import {RepLink} from "../../common/base";

const tailRender=(orc: any, name: string)=><>
  <CCell>{orc?.[name]?.r??'／'}</CCell>
  <CCell>{orc?.[name]?.P??'／'}</CCell>
</>;

/**承压哪里用到的  [renders]=useFixRowPrefUntChU({orc, rep,
 *拆分中间多出的一列和其span多行做法： <CCell>14</CCell><CCell rowSpan={2}>焊接材料</CCell> <CCell>焊材验收</CCell><CCell>C</CCell>{tailRender(orc, '焊材验')}
 * */
export const MonitoringFaciliVw= ({orc, rep,label='附录C 视频监控设施、远程监测装置、机房通风降温措施检查记录表'} :{orc:any, rep:any,label?:any}
) => {
  const [renders]=useOmnipotentPref({orc, config:items监控设施, tailRender,pcols:2,});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',}}>{label}</Text>
    <Table fixed={ ["4%", "14%", "5%", "%", "8%", "22%"] } css={{borderCollapse: 'collapse', }} tight  miniw={800}>
      <TableHead>
          <TableRow>
            <CCell><Text css={{fontSize:'0.75rem'}}>序号</Text></CCell><CCell>项目名称</CCell><CCell colSpan={2}>检验内容与要求</CCell><CCell><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
            <CCell>存在问题描述</CCell>
          </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'MonitoringFacili'}>
          {renders}
        </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.75rem'}}>备注：1.检查依据:《福建省电梯安全管理条例》；<br/>
      2.本附录所列项目检查结果不作为整机结论判定依据。</Text>
  </>;
};

