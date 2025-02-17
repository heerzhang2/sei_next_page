/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme,
  CCell,
  Table,
  TableBody,
  TableRow,
  Text,
  RCell, Cell,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {检验编制核准} from "../rarelyVary";
import {multilines2Html} from "../../tools";
import {getInstrument2xCol} from "../../common/helper";
import {eqpTypeAllMap} from "../../../dict/eqpComm";

/**首页
 * @param original 是否为了打印正式版原始记录
 * */
export const 首页设备概况el= ({theme, orc, original } :{theme: any, orc:any, original?:boolean}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位}</CCell>
      </TableRow>
      <TableRow >
          <RCell css={{border:'none'}}>分支机构：</RCell>
          <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.分支机构 || '／'}</CCell>
        </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>楼盘名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.楼盘 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 类 别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别)}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设 备 品 种：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检 验 日 期：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设 备 代 码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

/**正式报告用的
 * */
export const 报告设备详情= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string,rep:any}
) => {
  const theme= useTheme();
  const instrumentTable =React.useMemo(() => getInstrument2xCol(orc.仪器表), [orc.仪器表]);
  return <React.Fragment>
      <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
        <TableBody>
          <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/Survey#Survey`}>
            <TableRow>
              <CCell colSpan={2}>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
              <CCell>型号</CCell><CCell>{orc.型号 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>产品编号</CCell><CCell>{orc.出厂编号 || '／'}</CCell>
              <CCell>制造日期</CCell><CCell>{orc.制造日期 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>制造单位名称</CCell><CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>使用单位代码</CCell><CCell>{orc.使用单位信用码 || '／'}</CCell>
              <CCell>使用登记证编号</CCell><CCell>{orc.使用证号 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>设备注册代码</CCell><CCell>{orc.注册代码 || '／'}</CCell>
              <CCell>单位内编号</CCell><CCell>{orc.单位内部编号 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>设备使用地点</CCell>
              <CCell colSpan={3}>{orc.设备使用地点 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>使用单位地址</CCell>
              <CCell colSpan={3}>{orc.使用单位地址 || '／'}</CCell>
            </TableRow>
            <TableRow >
              <CCell colSpan={2}>楼盘名称</CCell>
              <CCell colSpan={3}>{orc.楼盘 || '／'}</CCell>
            </TableRow>
            <TableRow >
              <CCell colSpan={2}>楼盘地址</CCell>
              <CCell colSpan={3}>{orc.楼盘地址 || '／'}</CCell>
            </TableRow>
            <TableRow >
              <CCell colSpan={2}>分支机构名称</CCell>
              <CCell colSpan={3}>{orc.分支机构 || '／'}</CCell>
            </TableRow>
            <TableRow >
              <CCell colSpan={2}>分支机构地址</CCell>
              <CCell colSpan={3}>{orc.分支机构地址 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>安全管理人员</CCell><CCell>{orc.安管人员 || '／'}</CCell>
              <CCell>改造日期</CCell><CCell>{orc.改造日期 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>改造单位名称</CCell>
              <CCell colSpan={3}>{orc.改造单位 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>维护保养单位名称</CCell>
              <CCell colSpan={3}>{orc.维保单位 || '／'}</CCell>
            </TableRow>
          </DirectLink>
        </TableBody>
      </Table>
    <Table fixed={ ["5.5%","12%","19%","13%","18%","14%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <TableRow >
          <CCell rowSpan={2}>设备技术参数</CCell>
          <CCell>名义速度</CCell>
          <CCell>{orc.运行速度}  m/s</CCell>
          <CCell>名义宽度</CCell>
          <CCell>{orc.名义宽度}  mm</CCell>
          <CCell>倾斜角</CCell>
          <CCell>{orc.倾斜角度}  °</CCell>
        </TableRow>
        <TableRow >
          <CCell>输送能力</CCell>
          <CCell>{orc.输送能}  P/h</CCell>
          <CCell>提升高度</CCell>
          <CCell>{orc.提升高度}  m</CCell>
          <CCell>使用区长度</CCell>
          <CCell>{orc.使用区长度}  m</CCell>
        </TableRow>
        <TableRow>
          <CCell>检验依据</CCell><Cell colSpan={6}>1、《电梯监督检验和定期检验规则—自动扶梯与自动人行道》（TSG T7005-2012，含1号、2号、3号修改单）；<br/>
          2、《福建省电梯安全管理条例》</Cell>
        </TableRow>

        <TableRow>
          <CCell>主要检验仪器设备</CCell>
          <Cell colSpan={6} css={{padding:0}}>
            <Table fixed={ ["6%","15%","28%","13%","17%","%"] }
                   css={ {borderCollapse: 'collapse', height:'fill-available'} }   tight  miniw={800}>
              <TableBody>
                <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/Instrument`}>
                  <TableRow>
                    <CCell>序号</CCell>
                    <CCell>仪器名称</CCell>
                    <CCell>仪器编号</CCell>
                    <CCell>序号</CCell>
                    <CCell>仪器名称</CCell>
                    <CCell>仪器编号</CCell>
                  </TableRow>
                  {instrumentTable.map((o,i) => {
                    return (
                        <TableRow key={i}>
                          <CCell>{o.s1}</CCell>
                          <CCell>{o.name1}</CCell>
                          <CCell css={{wordBreak: 'break-all'}}>{o.no1}</CCell>
                          <CCell>{o.s2}</CCell>
                          <CCell>{o.name2}</CCell>
                          <CCell css={{wordBreak: 'break-all'}}>{o.no2}</CCell>
                        </TableRow>
                    );
                  } )
                  }
                </DirectLink>
              </TableBody>
            </Table>
          </Cell>
        </TableRow>
        <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}>{multilines2Html(orc?.大备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            })}</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

    {检验编制核准({orc,rep})}
  </React.Fragment>;
};
