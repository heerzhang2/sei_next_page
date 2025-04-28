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
import SurveyRow from "@/component/SurveyRow";

export const 检验核准WaterJj = ({orc, rep,jyt}: { orc: any, rep: any,jyt?:string}
) => {
  return <OldTable fixed={["4.2%", "27%", "27%", "4.2%", "12%", "%"]} css={{borderCollapse: 'collapse'}} tight miniw={800}>
    <OldTableBody>
      <DirectLink href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Conclusion`}>
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
export const 首页概况WaterJj= (orc:any, rep:any, original?:boolean
) => {
  const 施工单位='重大修理'===orc.检验类别? orc.大修单 :
      '改造监检'===orc.检验类别? orc.改造单 :
          orc.安装单;
  return  <FlexibleTable columnWidths={ ["20%","%"] } variant={'borderless'}>
    <TableBody>
      <SurveyRow label="使用单位" value={orc.使用单位}/>
      <SurveyRow label="分支机构" value={orc.分支机构}/>
      <SurveyRow label="施工单位" value={施工单位} />
      <SurveyRow label="施工类别" value={businessCatspMap.get(rep?.isp?.bsType)} />
      <SurveyRow label="设备类别" value={orc?.设备类别} />
      <SurveyRow label="设备品种" value={eqpTypeAllMap.get(orc.设备品种)} />
      {original && <SurveyRow label="记录编号" value={rep?.no} />}
      <SurveyRow label="检验日期" value={orc.检验日期1? `${orc.检验日期1} 至 ${orc.检验日期}` : orc.检验日期} />
      <SurveyRow label="设备代码" value={orc.设备代码}/>
      <SurveyRow label="设  备  号" value={orc.eqpcod} />
      <SurveyRow label="监察识别码" value={orc.监察识别码}/>
    </TableBody>
  </FlexibleTable>;
};
