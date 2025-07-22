import * as React from "react";
import {FlexibleTable, TableBody} from "@/components/flexible-table";
import SurveyRow from "@/component/SurveyRow";
import {AttentionPoint} from "@/report/common/rarelyVary";

//建设单位 =使用单位；   安装单位：不是台账的
export const 首页设备IndPer= (orc:any, rep:any, original?:boolean
) => {
  return  <FlexibleTable columnWidths={ ["20%","%"] } variant={'borderless'}>
    <TableBody>
      <SurveyRow label="装置名称" value={orc.title ??'／'} className="print:h-9"/>
      <SurveyRow label="管道名称" value={orc.管道设备名 ??'／'} className="print:h-9"/>
      <SurveyRow label="使用单位名称" value={orc.使用单位} className="print:h-9"/>
      <SurveyRow label="单位内编号" value={orc?.单位内编号 ??'／'} className="print:h-9"/>
      <SurveyRow label="检验类别" value={orc?.检验类别 ??'／'} className="print:h-9"/>
      {original && <SurveyRow label="记录编号" value={rep?.isp?.no} />}
      <SurveyRow label="检验日期" value={orc.检验日期1? `${orc.检验日期1} 至 ${orc.检验日期}` : orc.检验日期} className="print:h-9"/>
      <SurveyRow label="监察识别码" value={orc.监察识别码 ??'／'} className="print:h-9"/>
    </TableBody>
  </FlexibleTable>;
};


/*较为通用的配置： 可重复的分项标题。
* */
export const titleRenders ={
  "THICK_MS": (store: any,i: number) => <>[{store?.['_THICK_MS_'+i]?.['设备编号'] ?? ``}]</>,
  "MAGNT_TS": (store: any,i: number) => <>[{store?.['_MAGNT_TS_'+i]?.['部件'] ?? ``}]</>,
  "SONIC_TS": (store: any,i: number) => <>[{store?.['_SONIC_TS_'+i]?.['部件'] ?? ``}]</>,
}


export const 管道级别=['GA1','GA2','GB1','GB2','GC1','GC2','GC3','GD1','GD2'];
export const 工作介质选=['蒸汽','导热油','见管道特性表'];
export const 安全评定选 = [
  { value: "1级" },
  { value: "2级" },
  { value: "3级" },
  { value: "4级" },
  { value: "5级" },
]
export const 结论选 = [
  { value: "符合要求" },
  { value: "基本符合要求" },
  { value: "不符合要求" },
]

export const 注意事项IndPl= ( {comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl btClass="print:mb-60">
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    3．本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    4．本报告书一式二份，由检验单位和使用单位分别保存。<br/>
    5．受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机构提出书面意见。<br/>
    6．根据《中华人民共和国特种设备安全法》，使用单位应于检验合格有效期届满前1个月向检验机构提出定期检验申请。<br/>
    7．有关检验检测数据未经允许，施工、使用单位不得擅自向社会发布信息。<br/>
    8．
  </AttentionPoint>;
};
