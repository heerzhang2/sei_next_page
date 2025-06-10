import * as React from "react";
import Link from "next/link"
import {FlexibleTable, TableBody, TableCell, TableRow,CCell} from "@/components/flexible-table";
import {AttentionPoint} from "../../common/rarelyVary";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import SurveyRow from "@/component/SurveyRow";
import {businessCatspMap} from "@/common/sei";
import {RepLink} from "@/report/common/base";

interface InspectionApprovalProps {
  orc: any
  rep: any
  jyt?: string
}
export const 检验核准WaterJj= ({ orc, rep, jyt = "检验" }:InspectionApprovalProps) => {
  //内嵌的表格高度无法自适应撑开：另一个办法设置内嵌表格固定height: 9rem;
  return (
      <div className="w-full">
        <FlexibleTable className="text-sm w-full border-collapse" columnWidths={["4.2%", "27%", "27%", "4.2%", "12%", "%"]}>
          <TableBody>
            <RepLink rep={rep} ori tag="Conclusion">
              <TableRow>
                <CCell>{jyt}</CCell>
                <CCell colSpan={2}>
                  {orc.检验人IDs}
                </CCell>
                <CCell className="text-xs">日期</CCell>
                <CCell>{orc.检验日期 || "／"}</CCell>
                <CCell className="!p-0 relative h-full" rowSpan={3}>
                  <div className="h-full flex flex-col">
                    <div className="print:hidden absolute inset-0 opacity-30 bg-no-repeat bg-center"
                         style={{ backgroundImage: `url(/images/seal.png)` }}></div>
                    <FlexibleTable className="text-sm w-full h-full flex-grow border-none" columnWidths={["50%", "%"]}>
                      <TableBody>
                        <TableRow className="border-none">
                          <TableCell className="w-1/2">检验机构核准证号：</TableCell>
                          <TableCell>{rep?.isp?.ispu?.agency?.apno}</TableCell>
                        </TableRow>
                        <TableRow className="border-none">
                          <CCell className="border-none h-12" colSpan={2}>
                            （机构公章或者检验专用章）
                          </CCell>
                        </TableRow>
                        <TableRow className="border-none">
                          <CCell className="border-none" colSpan={2}>
                            {orc?.检验日期}
                          </CCell>
                        </TableRow>
                      </TableBody>
                    </FlexibleTable>
                  </div>
                </CCell>
              </TableRow>
            </RepLink>
          <TableRow>
            <CCell>审核</CCell>
            <CCell colSpan={2}></CCell>
            <CCell className="text-xs">日期</CCell>
            <CCell></CCell>
          </TableRow>
          <TableRow>
            <CCell>批准</CCell>
            <CCell colSpan={2}></CCell>
            <CCell className="text-xs">日期</CCell>
            <CCell></CCell>
          </TableRow>
          </TableBody>
        </FlexibleTable>
      </div>
  )
}


export const 注意事项WaterJj= ({comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl btClass="print:mb-60">
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。<br/>
    3．本报告无检验、审核、批准人员的签字以及检验机构的核准证号和检验专用章(或者公章)无效。<br/>
    4．本报告一式三份，由检验机构、施工单位和使用单位分别保存。<br/>
    5．对本报告结论如有异议，请在取得本报告后 15 个工作日内，向检验机构提出书面意见。<br/>
    6．本报告对检验时的设备状况负责。<br/>
    7．
  </AttentionPoint>;
};

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
      <SurveyRow label="设备类别" value={eqpTypeAllMap.get(orc?.设备类别) ?? '／'} />
      <SurveyRow label="设备品种" value={eqpTypeAllMap.get(orc.设备品种)} />
      {original && <SurveyRow label="记录编号" value={rep?.isp?.no} />}
      <SurveyRow label="检验日期" value={orc.检验日期1? `${orc.检验日期1} 至 ${orc.检验日期}` : orc.检验日期} />
      <SurveyRow label="设备代码" value={orc.设备代码}/>
      <SurveyRow label="设  备  号" value={orc.eqpcod} />
      <SurveyRow label="监察识别码" value={orc.监察识别码}/>
    </TableBody>
  </FlexibleTable>;
};
