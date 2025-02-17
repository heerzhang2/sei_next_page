/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  TableRow, CCell, Table, TableBody
} from "customize-easy-ui-component";
import {DirectLink, } from "../../routing/Link";
import Img_Seal from "../../images/seal.png";

export const 检验编制核准Mbcr= ( { orc,rep } : { orc: any, rep:any }
) => {
  return <Table fixed={ ["11%","22%","6%","12%","%","13%","16%"]  }  css={ {borderCollapse: 'collapse' } }>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell component="th" scope="row">下次定期检验日期</CCell>
          <CCell colSpan={6}>{orc.新下检日}</CCell>
        </TableRow>
        <TableRow>
          <CCell component="th" scope="row">检验人员</CCell>
          <CCell colSpan={3}>{orc.检验人IDs}</CCell>
          <CCell>检验日期</CCell>
          <CCell colSpan={2}>{orc.检验日期 || '／'}</CCell>
        </TableRow>
      </DirectLink>
      <TableRow>
        <CCell component="th" scope="row">审核</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
        <CCell rowSpan={2} colSpan={3}>
          <div css={{
            height:'8rem',
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
            <Table  fixed={ ["40%","%"]  }
                    printColWidth={ ["105","156"] }
                    css={ {borderCollapse: 'collapse',height:'fill-available'} }
            >
              <TableBody>
                <TableRow>
                  <CCell css={{border:'none'}}>机构核准证号：</CCell>
                  <CCell css={{border:'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                </TableRow>
                <TableRow>
                  <CCell css={{border:'none'}} colSpan={2}>（检验机构公章或者检验专用章）</CCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">批准</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

