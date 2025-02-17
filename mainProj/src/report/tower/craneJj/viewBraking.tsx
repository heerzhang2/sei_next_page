/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell, useTheme,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {calcAverageArrObj, } from "../../../common/tool";
import {RepLink} from "../../common/base";

/**起重自动距离；
 * @param noAux  没有副起升机构的部分
 * */
export const BrakingVw= ({children, orc, rep,label,noAux } : { orc: any, rep: any,label:any, children?: any,noAux?:boolean}
) => {
  const theme = useTheme();
  return <>
    <div id={'Braking'} css={{display:'block',justifyContent:'space-between',alignItems:'flex-end', [theme.mediaQueries.md]: {display:'flex'},
                    "@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}, }}>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
      <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
      }}>单位：mm</Text>
    </div>
    <Table fixed={ ["6%","%","11%","19%","16%","12%"] } tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
      <TableHead>
        <TableRow>
          <CCell colSpan={2}>项目</CCell>
          <CCell>次数</CCell>
          <CCell>制动距离</CCell>
          <CCell>平均制动距离</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Braking'}>
          { [['主起升机构','主制距','主制距r'],['副起升机构','副制距','副制距r']].map(([title,field,resFd], i:number) => {
            if(noAux && i>0)  return null;
            const avdistance=calcAverageArrObj(orc?.[field],(row)=>row,2,3);
            return  <React.Fragment key={i}>
              { (new Array(3)).fill(null).map(( _,  w:number) => {
                return <TableRow key={w}>
                  {w===0 && <CCell rowSpan={3} colSpan={2}>{title}</CCell>}
                  <CCell>{w+1}</CCell>
                  <CCell>{orc?.[field]?.[w]}</CCell>
                  { w===0 && <>
                    <CCell rowSpan={3}>{avdistance}</CCell>
                    <CCell rowSpan={3}>{orc?.[resFd]}</CCell>
                  </>
                  }
                </TableRow>;
              }) }
            </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={5}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.制距备注 || '／'}
            </div></Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.8rem'}}>
      { children?  children
          :
          <>
            注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动
            距离都没有规定的，相应的制动距离可不测量。
            2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在
            备注栏。
            3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            4、未检查或无需检验的，仅填检验结果栏。
          </>
      }
    </Text>
  </>;
};
