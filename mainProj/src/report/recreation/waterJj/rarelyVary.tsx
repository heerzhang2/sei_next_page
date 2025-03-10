/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, RCell,Table as OldTable,TableBody as OldTableBody,TableRow as OldTableRow} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import Img_Seal from "../../../images/seal.png";
import {AttentionPoint} from "../../common/rarelyVary";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {businessCatspMap} from "../../../agreement/AgreementList";
import {Table} from "@/components/ui/table";
import {FlexibleTable, TableBody, TableCell, TableRow} from "@/components/flexible-table";

export const 检验核准WaterJj = ({orc, rep,jyt}: { orc: any, rep: any,jyt?:string}
) => {
  return <OldTable fixed={["4.2%", "27%", "27%", "4.2%", "12%", "%"]} css={{borderCollapse: 'collapse'}} tight miniw={800}>
    <OldTableBody>
      <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <OldTableRow>
          <CCell>{jyt??'检验'}</CCell>
          <CCell colSpan={2}>{orc.检验人IDs}</CCell>
          <CCell>日期</CCell>
          <CCell>{orc.检验日期 || '／'}</CCell>
          <CCell rowSpan={3}>
            <div css={{
              height: '8rem',
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
              <OldTable fixed={["50%", "%"]} css={{borderCollapse: 'collapse', height: 'fill-available'}}
                     tight  miniw={800}>
                <OldTableBody>
                  <OldTableRow>
                    <CCell css={{border: 'none'}}>检验机构核准证号：</CCell>
                    <CCell css={{border: 'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                  </OldTableRow>
                  <OldTableRow>
                    <CCell css={{border: 'none'}} colSpan={2}>（机构公章或者检验专用章）</CCell>
                  </OldTableRow>
                  <OldTableRow>
                    <CCell css={{border: 'none'}} colSpan={2}>{orc.检验日期}</CCell>
                  </OldTableRow>
                </OldTableBody>
              </OldTable>
            </div>
          </CCell>
        </OldTableRow>
      </DirectLink>
      <OldTableRow>
        <CCell>审核</CCell>
        <CCell colSpan={2}></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </OldTableRow>
      <OldTableRow>
        <CCell>批准</CCell>
        <CCell colSpan={2}></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </OldTableRow>
    </OldTableBody>
  </OldTable>;
};

export const 注意事项WaterJj= ({comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl>
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。<br/>
    3．本报告无检验、审核、批准人员的签字以及检验机构的核准证号和检验专用章(或者公章)无效。<br/>
    4．本报告一式三份，由检验机构、施工单位和使用单位分别保存。<br/>
    5．对本报告结论如有异议，请在取得本报告后 15 个工作日内，向检验机构提出书面意见。<br/>
    6．本报告对检验时的设备状况负责。<br/>
    7．
  </AttentionPoint>;
};
/*fixed={ ["20%","%"] } css={ {borderCollapse: 'collapse'} }
<TableBody rheight={40}>
* */
export const 首页概况WaterJj= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  const 施工单位='重大修理'===orc.检验类别? orc.大修单 :
      '改造监检'===orc.检验类别? orc.改造单 :
          orc.安装单;
  return  <FlexibleTable fixed={ ["20%","%"] }>
    <TableBody>
      <TableRow className="border-0">
        <TableCell className="border-0">施工单位：</TableCell>
        <TableCell className="border-0 border-b border-dashed">
          {施工单位 ?? '／'}
        </TableCell>
      </TableRow>
      <TableRow className="border-x-0 border-y-0 border-b-0 border-t-0">
        <TableCell css={{border:'none'}} >使用单位：</TableCell>
        <TableCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</TableCell>
      </TableRow>
      <OldTableRow>
        <RCell css={{border:'none'}}>分支机构：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.分支机构 || '／'}</CCell>
      </OldTableRow>
      <OldTableRow >
        <RCell css={{border:'none'}}>施工单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{施工单位 ?? '／'}</CCell>
      </OldTableRow>
      <OldTableRow >
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{businessCatspMap.get(rep?.isp?.bsType!) ?? '／'}</CCell>
      </OldTableRow>
      <OldTableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </OldTableRow>
      <OldTableRow >
        <RCell css={{border:'none'}}>设备品种：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc.设备品种) || '／'}</CCell>
      </OldTableRow>
      <OldTableRow>
        <RCell css={{border:'none'}}>检验日期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </OldTableRow>
      <OldTableRow >
        <RCell css={{border:'none'}}>设备代码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </OldTableRow>
      <OldTableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </OldTableRow>
      <OldTableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </OldTableRow>
    </TableBody>
  </FlexibleTable>;
};
