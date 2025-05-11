import {FlexibleTable, TableBody} from "@/components/flexible-table";
import SurveyRow from "@/component/SurveyRow";
import {businessCatspMap} from "@/common/sei";
import {eqpTypeAllMap} from "@/dict/eqpComm";
import * as React from "react";

export const 填写须知recr = <>
  <div className="print:h-screen print:break-after-page flex flex-col justify-evenly">
    {/* 标题 */}
    <h2 className="block text-xl print:text-3xl print:mb-[3rem] text-center">填 写 须 知</h2>
    {/* 正文内容 */}
    <div className="leading-4 print:leading-10">
      1、本记录适用于滑行车类、架空游览车类大型游乐设施的监督检验。<br/>
      2、检查结果栏“[ ]”可用以下四种符号表示记录内容：<br/>
      {/* 符号说明（左对齐弹性容器） */}
      <div  className="flex flex-col ml-[2rem] space-y-2">
        <span>“√”——表示该项检验结果或结论为“符合”或“合格”；</span>
        <span>“×”——表示该项检验结果或结论为“不符合”或“不合格”；</span>
        <span>“／”——表示该项检验结果或结论为“无此项”或“不适用”；</span>
        <span>“△”——表示该项为“无法检验”或“待检验”。</span>
      </div>
      3、“结论”栏填“√”表示“合格”、“×”表示“不合格”、“／”表示“无此项”；当检验结果为“△”时，结论为“×”。<br/>
      4、监督检验项目分为I、II两类： <br/>
      {/* 结论符号说明 */}
      <div className="flex flex-col ml-[2rem] space-y-1">
        <span>I类：检验人员按照监督检验项目和要求进行确认，判断是否符合其相应要求，监督检验确认不合格，不得转入II类监督检验项目。</span>
        <span>II类：检验人员按照监督检验项目和要求进行确认，判断是否符合其相应要求。</span>
      </div>
     5、“备注”栏中主要记录需要说明的其它事项。<br/>
     6、检验人员、校核人员的责任签署应齐全，若检验人员只承担部分的检验项目，可在“备注”栏中加以说 明
    </div>
  </div>
</>;

export const 首页概况recr= (orc:any, rep:any, original?:boolean
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
      <SurveyRow label="型号规格" value={orc.型号??'／'}/>
      {original && <SurveyRow label="记录编号" value={rep?.isp?.no} />}
      <SurveyRow label="检验日期" value={orc.检验日期1? `${orc.检验日期1} 至 ${orc.检验日期}` : orc.检验日期} />
      <SurveyRow label="设备代码" value={orc.设备代码}/>
      <SurveyRow label="设  备  号" value={orc.eqpcod} />
      <SurveyRow label="监察识别码" value={orc.监察识别码}/>
    </TableBody>
  </FlexibleTable>;
};
