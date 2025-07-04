import * as React from "react";
import {FlexibleTable, TableBody} from "@/components/flexible-table";
import SurveyRow from "@/component/SurveyRow";

//建设单位 =使用单位；   安装单位：不是台账的
export const 首页设备概况BoilI= (orc:any, rep:any, original?:boolean
  ) => {
  return  <FlexibleTable columnWidths={ ["20%","%"] } variant={'borderless'}>
    <TableBody>
      <SurveyRow label="工程名称" value={orc.工程名称} className="print:h-9"/>
      <SurveyRow label="使用单位" value={orc.使用单位} className="print:h-9"/>
      <SurveyRow label="锅炉型号" value={orc?.型号 ??'／'} className="print:h-9"/>
      <SurveyRow label="安装单位" value={orc?.安装单} />
      {original && <SurveyRow label="记录编号" value={rep?.isp?.no} />}
      <SurveyRow label="监检日期" value={orc.检验日期1? `${orc.检验日期1} 至 ${orc.检验日期}` : orc.检验日期} />
      <SurveyRow label="监察识别码" value={orc.监察识别码 ??'／'}/>
    </TableBody>
  </FlexibleTable>;
};

/*较为通用的配置： 可重复的分项标题。
* */
export const titleRenders ={
  "THICK_MS": (store: any,index: number) => {
    const firstTag=store?.['_THICK_MS_'+index]?.['设备名称'] ?? ``
    return <> { `[${firstTag}] `}
    </>;
  }
}
