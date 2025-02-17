/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  TableRow, CCell, Table, TableBody
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import Img_Seal from "../../../images/seal.png";

/**隐含5列的；*/
export const 检验编制核准McrWt= ({ orc,rep,jyprf='下次定期检验'} : { orc: any, rep:any,jyprf?:string}
) => {
  return <Table fixed={ ["4.2%","55%","4.2%","12%","%"]  }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell colSpan={2}>{jyprf}日期</CCell>
          <CCell colSpan={2}>{orc.新下检日}</CCell>
          <CCell rowSpan={4}>
            <div css={{
              height:'7.5rem',
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
                      css={ {borderCollapse: 'collapse',height:'fill-available'} }  tight  miniw={800}>
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
        <TableRow>
          <CCell>检验</CCell>
          <CCell>{orc.检验人IDs}</CCell>
          <CCell>日期</CCell>
          <CCell>{orc.检验日期 || '／'}</CCell>
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
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};
