/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {items监控设施} from "./editAxisVert";
import {useOmnipotentPref} from "../../hook/useOmnipotentPref";
import Img_AxisVert from "./AxisVert.png";
import {SimpleImg} from "../../../comp/Image";
import {RepLink} from "../../common/base";

const tailRender=(orc: any, name: string)=><>
  <CCell>{orc?.[name]?.o??'／'}</CCell>
  <CCell>{orc?.[name]?.t??'／'}</CCell>
  <CCell>{orc?.[name]?.d??'／'}</CCell>
  <CCell>{orc?.[name]?.L??'／'}</CCell>
  <CCell>{orc?.[name]?.r??'／'}</CCell>
</>;

/**承压哪里用到的  [renders]=useFixRowPrefUntChU({orc, rep,
 *拆分中间多出的一列和其span多行做法： <CCell>14</CCell><CCell rowSpan={2}>焊接材料</CCell> <CCell>焊材验收</CCell><CCell>C</CCell>{tailRender(orc, '焊材验')}
 * */
export const AxisVertVw= ({orc, rep, label,noZj} :{orc:any, rep:any, label:string,noZj?:boolean}
) => {
  const [renders]=useOmnipotentPref({orc, config:items监控设施, tailRender,pcols:1,noNo:true});
  return <>
    <div css={{"@media print": {paddingBottom: '8.5rem', pageBreakInside: 'avoid'}}}>
      <Text id='AxisVert' variant="h4" css={{marginTop: '1rem',
      }}>{label}</Text>
    </div>
    <Table fixed={ [ "%"] } css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-8.5rem'} }}
            tight  miniw={800}>
      <TableBody>
        <TableRow>
          <CCell>
            <SimpleImg url={Img_AxisVert} css={{width: '100%',maxWidth: '25rem'}}/>
          </CCell>
        </TableRow>
      </TableBody>
    </Table>
    <Table fixed={ [ "%","12.5%", "12.8%", "12%", "19%", "16.8%", "7%"] } css={{borderCollapse: 'collapse', }} tight  miniw={800}>
      <TableHead>
          <TableRow>
            <CCell><Text>测量工况</Text></CCell><CCell>测量方位</CCell><CCell>上部测量点标尺读数L1(mm)</CCell>
            <CCell><Text css={{fontSize:'0.8rem'}}>下部测量点标尺读数L2(mm)</Text></CCell>
            <CCell><Text css={{fontSize:'0.8rem'}}>两个测量点的高度差ΔH(mm)</Text></CCell>
            <CCell>侧向垂直度(%)△L= |L1-L2|/△H×100%</CCell><CCell><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
          </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'AxisVert'}>
          {renders}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["8%", "%"] } css={{borderCollapse: 'collapse', }} tight  miniw={800}>
      <TableBody>
        <TableRow>
          <CCell>备注</CCell>
          <Cell split={true}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
            {orc.垂直备注 || '／'}
          </div></Cell>
        </TableRow>
      </TableBody>
    </Table>
    {!noZj && <Text css={{fontSize:'0.75rem'}}>
      注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
      2、上部测量点、下部测量点的标尺方向应一致。
      3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
    </Text>
    }
  </>;
};
