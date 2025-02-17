/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
   CCell, Table, TableBody, TableRow, Text, Cell,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {CCellUnit, } from "../../common/base";
import {检验设备结论Sund} from "../sundryDj/viewRes";

/**正式报告用的
 * 机电报告的：config设备概况 实际上是为原始记录做的。 正式报告需要另外手动再做字段做的显示 安排。
 * */
export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>使用单位名称</CCell><CCell>{orc.使用单位 || '／'}</CCell>
            <CCell>统一社会信用代码</CCell><CCell>{orc.使用单位信用码 || '／'}</CCell>
          </TableRow>
          <TableRow >
            <CCell colSpan={2}>安装地点</CCell>
            <CCell colSpan={3}>{orc.设备使用地点 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
            <CCell >产品型号</CCell><CCell>{orc.型号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>产品编号</CCell><CCell>{orc.出厂编号 }</CCell>
            <CCell >单位内编号</CCell><CCell>{orc.单位内部编号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用登记证编号</CCell><CCell>{orc.使用证号 || '／'}</CCell>
            <CCell>安全管理人员</CCell><CCell>{orc.安全员}</CCell>
          </TableRow>

          <TableRow>
            <CCell colSpan={2}>制造单位名称</CCell><CCell>{orc.制造单位 || '／'}</CCell>
            <CCell>制造日期</CCell><CCell>{orc.制造日期 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>改造单位名称</CCell><CCell>{orc.改造单位 || '／'}</CCell>
            <CCell>改造日期</CCell><CCell>{orc.改造日期 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>维护保养单位名称</CCell>
            <CCell colSpan={3}>{orc.维保单位 || '／'}</CCell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Table fixed={ ["3.5%","13%","33%","13%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <TableRow >
          <CCell rowSpan={4}>设备技术参数</CCell>
          <CCell>额定载重量</CCell>
          <CCellUnit unit={'kg'}>{orc.额定载荷 || '／'}</CCellUnit>
          <CCell>额定速度</CCell>
          <CCellUnit unit={'m/s'}>{orc.运行速度 || '／'}</CCellUnit>
        </TableRow>
        <TableRow>
          <CCell>层站门数</CCell>
          <CCell>{orc.电梯层数}  层   {orc.电梯站数}  站  {orc.电梯门数} 门</CCell>
          <CCell>控制方式</CCell>
          <CCell >{orc.控制方式 || '／'}</CCell>
        </TableRow>
        <TableRow>
          <CCell>倾斜角</CCell>
          <CCellUnit unit={'°'}>{orc.倾斜角度 || '／'}</CCellUnit>
          <CCell>轿门位置</CCell>
          <CCell >{orc.轿门位 || '／'}</CCell>
        </TableRow>
        <TableRow>
          <CCell>区域防爆等级</CCell>
          <CCell >{orc.防爆等级 || '／'}</CCell>
          <CCell>整机防爆标志</CCell>
          <CCell >{orc.防爆标志 || '／'}</CCell>
        </TableRow>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={3}>《电梯监督检验和定期检验规则》（TSG T7001—2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={4}><div css={{minHeight: '3rem', whiteSpace: 'pre-wrap'}}>
              {orc.大备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

    {检验设备结论Sund({theme, orc,rep})}
  </React.Fragment>;
};
