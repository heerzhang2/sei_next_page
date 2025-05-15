import * as React from "react";
import {cn} from "@/lib/utils";
import {CCell, FlexibleTable, TableBody, TableCell, TableHeader, TableRow} from "@/components/flexible-table";
import {DirectLink} from "@/routing/Link";
import {RepLink} from "@/report/common/base";
import {usePrefixDataTable} from "@/report/hook/usePrefixData";
import {useThreeColumnView} from "@/report/hook/useThreeColumnSubr";
import {render施工单位} from "@/report/common/render";

//仅正式报告用
const config设备 = [
  [['使用单位名称', '_$使用单位'], ],
  [['分支机构名称', '_$分支机构'] ],
  [['使用地点', '_$设备使用地点'], ],
  [['安全管理人员', '安全员'], ['联系电话', '安全员电'] ],
  [['产品名称', '_$设备名称'], ['产品型号', '_$型号'],],
  [['产品编号', '_$出厂编号'], ['制造完成日期', '_$制造日期'],],
  [['设备级别', '_$设备等级'], ['使用期限到期时间','_$使用到期时' ],],
    //记录中缺少：_$设备代码
  [['设备代码', '_$设备代码'], ['设备型式', '设型式'],],
  //'施工-改造单位名称;-安装单 -大修单
  [['施工单位名称','_$改造单位',render施工单位] ],
  [['制造单位名称', '_$制造单位']  ],
  //技术参数
  [['每车承载人数', '_$额定乘客数','人'], ['车辆数', '_$车船数量','个'], ],
  [['轨道高度', '_$轨道高度','m'], ['轨道长度','_$轨道长度','m'], ],
  [['轨距', '_$车道轨距','m'], ['运行速度','_$额定速度','km/h'], ]
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 10);
const config设备下=config设备.slice(10);

export const RepDeviceDetail= ({ orc, rep } : { orc: any,rep:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                embedCol: [ <CCell key='1' rowSpan={3}>设备技术参数</CCell> ] });
  return <React.Fragment>
    <FlexibleTable id='Survey' columnWidths={["6.1%","6.8%","38%","12.8%","4%","%"]} className="text-sm border-collapse">
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </FlexibleTable>
    <FlexibleTable columnWidths={ ["4.8%","13%","23%","15%","10%","18.6%","%"] }  className="text-sm">
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={5}>《大型游乐设施安全技术规程》（TSG 71-2023）</CCell>
        </TableRow>
        <DirectLink href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Conclusion#Conclusion`}>
          <TableRow id='Conclusion'>
            <CCell>检验结论</CCell>
            <CCell colSpan={6}>
            <span className={cn("px-0 py-4 m-auto", orc?.检验结论?.length>12? "text-2xl" : "text-4xl tracking-[1rem]")}>
              {orc?.检验结论}</span>
            </CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <TableCell split={true} colSpan={6}><div className="min-h-4 whitespace-pre-wrap">
              {orc.大备注 ?? '／'}
            </div></TableCell>
          </TableRow>
        </DirectLink>
        <TableRow>
          <CCell colSpan={2}>下次定期检验日期</CCell>
          <CCell colSpan={5}>{orc.新下检日 ?? '／'}</CCell>
        </TableRow>
      </TableBody>
    </FlexibleTable>
  </React.Fragment>;
};
