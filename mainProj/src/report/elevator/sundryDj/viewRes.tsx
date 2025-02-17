/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableRow,} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import Img_Seal from "../../../images/seal.png";

//缺?下次检验日期
export const 检验设备结论Sund= ({theme, orc, rep} :{theme: any, orc:any, rep:any}
) => {
  return <>
    <Table fixed={ ["6.5%","48%","4%","13.5%","%"]  }  css={ {borderCollapse: 'collapse' } } tight miniw={800}>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
          <TableRow>
            <CCell>检验</CCell>
            <CCell>{orc.检验人IDs}</CCell>
            <CCell>日期</CCell>
            <CCell>{orc.检验日期 || '／'}</CCell>
            <CCell rowSpan={3}>
              <div css={{
                minHeight:'8rem',
                '::before': {
                  filter: 'opacity(30%)',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${Img_Seal})`,
                  content: '" "',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }
              }}>
                <Table  fixed={ ["40%","%"]  } css={ {borderCollapse: 'collapse',height:'fill-available'} }>
                  <TableBody>
                    <TableRow>
                      <CCell css={{border:'none'}}>机构核准证号：</CCell>
                      <CCell css={{border:'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell css={{border:'none'}} colSpan={2}>（检验机构公章或者检验专用章）</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell css={{border:'none'}}>日期：</CCell>
                      <Cell css={{border:'none'}}>2024/03/04</Cell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CCell>
          </TableRow>
        </DirectLink>
        <TableRow>
          <CCell>审核</CCell>
          <CCell></CCell>
          <CCell>日期</CCell>
          <CCell></CCell>
        </TableRow>
        <TableRow >
          <CCell>批准</CCell>
          <CCell></CCell>
          <CCell>日期</CCell>
          <CCell>2024-04-06</CCell>
        </TableRow>
      </TableBody>
    </Table>
    </>;
};
