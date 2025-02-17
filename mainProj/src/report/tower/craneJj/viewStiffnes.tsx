/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import Img_Stiffness from "./Stiffness.png";
import {SimpleImg} from "../../../comp/Image";
import {items静态刚度} from "./editStiffnes";
import {CCellUnit} from "../../common/base";


/**非正常使用的配置数据; 不能用const [renders]=useOmnipotentPref({orc, config:items静态刚度, tailRender,pcols:1,noNo:true});
 * */
export const StiffnessVw= ({orc, rep, label} :{orc:any, rep:any, label:string}
) => {
  return <>
    <div  css={{"@media print": {paddingBottom: '10.5rem', pageBreakInside: 'avoid'}} }>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
    </div>
    <Table fixed={ ["5%","11%","16%","%","16%","13%","8.5%"] } tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-10.5rem'}} } >
      <TableBody>
        <TableRow>
          <CCell colSpan={7} css={{border:'none'}}>
            <SimpleImg url={Img_Stiffness} css={{width: '100%',maxWidth: '25rem'}}/>
            <Text css={{fontSize:'0.8rem'}}>塔机基准面（或轨面）或最高附着点</Text>
          </CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Stiffness#Stiffness`}>
          <TableRow>
            {items静态刚度.map(([name, _, item,unit]: any, i:number) => {
              return <CCell key={i} colSpan={i===0? 2:1}>{item}</CCell>
            }) }
            <CCell>检验结果</CCell>
          </TableRow>
          <TableRow>
            {items静态刚度.map(([name, _, item,unit]: any, i:number) => {
              return <CCellUnit key={i} unit={unit} colSpan={i===0? 2:1}>{orc?.[name]}</CCellUnit>
            }) }
            <CCell>{orc?.静刚r || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.静刚备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.75rem'}}>
      注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。
      2、上部测量点、下部测量点的标尺方向应一致。
      3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
    </Text>
  </>;
};
