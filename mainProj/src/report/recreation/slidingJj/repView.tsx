/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Cell, Table, TableBody, TableRow, Text,
} from "customize-easy-ui-component";
// import {DirectLink,} from "../../../routing/Link";
import {RepLink,} from "../../common/base";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {useThreeColumnView} from "../../hook/useThreeColumnSubr";
import {render施工单位,} from "../../common/render";

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
  [['承载人数', '_$额定乘客数','人'], ['运行高度','_$提升高度','m'], ],
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 10);
const config设备下=config设备.slice(10);

export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                embedCol: [ <CCell rowSpan={1}>设备技术参数</CCell> ] });
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","6%","38%","12.1%","4%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","12%","23%","15%","10%","18.6%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={5}>《大型游乐设施安全技术规程》（TSG 71-2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}>
            <Text variant="h1" css={{fontSize:orc?.检验结论?.length>12? '1.4rem':'2.8rem',
                      margin: 'auto',padding:'0 1rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.大备注 ?? '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
        <TableRow>
          <CCell colSpan={2}>下次定期检验日期</CCell>
          <CCell colSpan={5}>{orc.新下检日 ?? '／'}</CCell>
        </TableRow>
      </TableBody>
    </Table>
  </React.Fragment>;
};
