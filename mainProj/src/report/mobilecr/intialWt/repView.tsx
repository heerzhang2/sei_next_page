/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {DirectLink,} from "../../../routing/Link";
import {RepLink,} from "../../common/base";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {render设备品种, render设备类别} from "../../common/render";
import {render工作幅} from "../../tower/craneJj/orcBase";

//仅正式报告用(只读，没有录入保存)，而非原始记录用：无需检查存储唯一性；
const config设备 = [
  [['使用单位', '_$使用单位'], ],
  [['使用单位地址', '_$使用单位地址'] ],
  [['使用单位统一社会信用代码', '_$使用单位信用码'], ['使用单位安全管理人员', '安全员']],
    //？安全管理人员联系电话 ?=  _$使用单位电话
  [['联系电话', '安全员电'], ['邮政编码', '_$使用单位邮编'] ],
  [['制造单位', '_$制造单位'] ],
  [['设备类别', '_$设备类别',render设备类别], ['设备品种', '_$设备品种',render设备品种], ],
  [['型号规格', '_$型号'], ['设备代码', '_$设备代码', ], ],
  [['产品编号', '_$出厂编号'], ['单位内编号','_$单位内部编号'],],
  [['投入使用日期', '_$投用日期'], ['设计使用年限','_$设计年限', '年'], ],
      //不用：台账 _$设备使用地点
  [['使用地点', '检验地点'], ],
    //拆分点：性能参数
  [['额定起重量','_$额定起重量','t'],['额定起重力矩','_$起重力矩','t·m']],
  [['工作幅度','_$最大工作幅',render工作幅], ['回转速度','_$回转速度','r/min'],],
  [['最大起升高度',{n:'起升高度',t:'n',u:'m'}], ['起升速度','_$起升速','m/min'],],
  [['工作级别','_$工作级别'], ['其他主要参数',{n:'其他参数',t:'m'}],],
];
//拆分成2个的 概况来 组合；
const config设备上=config设备.slice(0, 10);
const config设备下=config设备.slice(10);
export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const render2=usePrefixDataTable({config: config设备下, orc, rep, slash:true,
        embed: { 0:  <CCell rowSpan={4}>性能参数</CCell>,  }
  });
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","10%","37%","3%","13.5%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["3.8%","6%","6.3%","30%","6%","6.3%","%"]  }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {render2}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","12.7%","24%","9%","12.2%","7%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell><CCell colSpan={5}>《起重机械安全技术规程》（TSG 51-2023）及第1号修改单</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'2.2rem',letterSpacing: '1rem'}}>{orc?.检验结论}</Text></CCell>
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
      </TableBody>
    </Table>
  </React.Fragment>;
};
