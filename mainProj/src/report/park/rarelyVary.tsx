/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  TableRow, CCell, Table, TableBody, RCell, Embed, Text
} from "customize-easy-ui-component";
import {eqpTypeAllMap} from "../../dict/eqpComm";
import {businessCatspMap} from "../../agreement/AgreementList";
import {FadeImage} from "../../comp/FadeImage";
import Img_Ma from "../../images/MA.png";
import Img_Fbpi from "../../images/FBPI.png";
import Img_ReportNoQR from "../../images/reportNoQR.png";


export const 首页概况EscaJj= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  const 施工单位='重大修理'===orc.检验类别? orc.大修单 :
                '改造监检'===orc.检验类别? orc.改造单 :
                     orc.安装单;
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{施工单位 ?? '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备代码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{businessCatspMap.get(rep?.isp?.bsType!) ?? '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检验日期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

/**没有MA  机电报告；  固定高度 8.5rem
 * */
export const ReportFirstPageHeadJd= ({theme , rep, mbbm } :{theme: any, rep:any, mbbm:string}
) => {
  // const atPrint = useMedia('print');
  return <React.Fragment>
    <div css={{
      display: 'flex',
      justifyContent: 'space-between',
      textAlign: 'center',
      height: '8.5rem',
    }}>
      <div css={{overflow: 'hidden'}}>
        <Embed css={{width: "155px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
        </Embed>
        <Text css={{position: 'relative', top: '-1.1rem', fontSize: '0.9rem'}}></Text>
      </div>
      <div>
        <Embed css={{width: "140px", margin: "auto", top: '-0.65rem'}} width={10} height={10}>
          <FadeImage src={Img_ReportNoQR}/>
        </Embed>
      </div>
      <div css={{overflow: 'hidden', display: 'flex', flexDirection: 'column',justifyContent:'space-evenly'}}>
        <Text variant="h6" css={{fontSize: '0.8rem'}}>{mbbm}</Text>
        <div css={{
          display: 'flex',
          "@media (min-width:690px),print and (min-width:538px)": {
            marginRight: "1rem"
          }
        }}
        ><Text variant="h6">报告编号：</Text>
          <Text variant="h5" css={{textDecoration: 'underline'}}>{rep?.isp?.no}</Text>
        </div>
      </div>
    </div>
  </React.Fragment>;
};
