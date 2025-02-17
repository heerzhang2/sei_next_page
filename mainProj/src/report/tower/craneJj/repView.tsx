/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
   CCell, Table, TableBody, TableRow, Text, Cell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {CCellUnit } from "../../common/base";
import {useMeasureTable} from "../../hook/useMeasure";
import {检验编制核准Tower} from "../rarelyVary";


//对比的：<RouterLink 可以导航文本处鼠标和点过链接颜色变但是表格鼠标不变，不能放在表格内。 改<DirectLink的。？ 非正常 使用 hook报错?
//比较通用的【附录1 观测值及测量结果记录表】： 项目编号， 单位， 判定，备注；
export const 测量结果记录= ({ orc, rep,label,config, fixed=["3%","8%","13%","%","20%","5%","10%","8%","6%"],tag='Measure',children
      } : { orc: any, rep: any,label:string, config:any[], fixed?:string[], tag?:string, children?:any}
) => {
  const renderMeasure=useMeasureTable({rep,orc, config});
  return <>
      <Text variant="h4" css={{marginTop: '1rem',
      }}>{label}</Text>
      <Table fixed={ fixed }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
        <TableHead>
          <TableRow>
            <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell><Text css={{fontSize:'0.7rem'}}>项目编号</Text></CCell><CCell colSpan={3}>检验内容与要求</CCell>
            <CCell>单位</CCell><CCell>观测数据</CCell><CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.75rem'}}>结果判定</Text></CCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${tag}?original=1#${tag}`}>
            {renderMeasure}
            <TableRow>
              <CCell>备注</CCell>
              <Cell colSpan={8}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.观测备注 || '／'}
              </div></Cell>
            </TableRow>
          </DirectLink>
        </TableBody>
      </Table>
    {children}
  </>;
};

/**正式报告用的：可能常变化的！。
 * */
export const 报告设备详情= ( { orc, rep } : { orc: any,rep:any}
) => {
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>安装改造重大修理单位名称</CCell>
            <CCell colSpan={3}>{orc.新安改单 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>施工单位生产许可证（受理决定书）编号</CCell><CCell>{orc.施许可号 || '／'}</CCell>
            <CCell>安装改造重大修理单位负责人</CCell><CCell>{orc.安单负责 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位名称</CCell>
            <CCell colSpan={3}>{orc.使用单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位地址</CCell>
            <CCell colSpan={3}>{orc.使用单位地址 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位联系人</CCell><CCell>{orc.单位联系人 || '／'}</CCell>
            <CCell>使用单位安全管理人员</CCell><CCell>{orc.安全员 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>制造单位名称</CCell>
            <CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2} rowSpan={2}>制造单位特种设备生产许可证编号</CCell>
            <CCell rowSpan={2}>{orc.生产许号 || '／'}</CCell>
            <CCell>设备型号</CCell><CCell>{orc.型号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell>型号规格</CCell><CCell>{orc.型规格 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>设备类别</CCell><CCell>{eqpTypeAllMap.get(orc.设备类别)}</CCell>
            <CCell>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>产品编号</CCell><CCell>{orc.出厂编号 || '／'}</CCell>
            <CCell>设备代码</CCell><CCell>{orc.设备代码 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>制造日期</CCell><CCell>{orc.制造日期 || '／'}</CCell>
            <CCell>投入使用日期</CCell><CCell>{orc.投用日期 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>施工类别</CCell><CCell>{orc.检验类别 || '／'}</CCell>
            {/*<CCell colSpan={2}>施工类别</CCell><CCell>{businessCatspMap.get(rep?.isp?.bsType!) || '／'}</CCell>*/}
            <CCell>设计使用年限</CCell><CCellUnit unit={'年'}>{orc.设计年限 || '／'}</CCellUnit>
          </TableRow>
          <TableRow >
            <CCell colSpan={2}>使用地点</CCell>
            <CCell colSpan={3}>{orc.设备使用地点 || '／'}</CCell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Table fixed={ ["3.5%","13%","33%","13%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <TableRow >
          <CCell rowSpan={4}>性能参数</CCell>
          <CCell>额定起重力矩</CCell>
          <CCellUnit unit={'t·m'}>{orc.起重力矩 || '／'}</CCellUnit>
          <CCell>最大起升高度</CCell>
          <CCellUnit unit={'m'}>{orc.起升高度 || '／'}</CCellUnit>
        </TableRow>
        <TableRow>
          <CCell>起升速度</CCell>
          <CCellUnit unit={'m/min'}>{orc.起升速 || '／'}</CCellUnit>
          <CCell>独立安装高度</CCell>
          <CCellUnit unit={'m'}>{orc.独立高度 || '／'}</CCellUnit>
        </TableRow>
        <TableRow>
          <CCell>最小和最大工作幅度</CCell>
          <CCellUnit unit={'m'}>{orc.最小工作幅} ~ {orc.最大工作幅}</CCellUnit>
          <CCell>工作级别</CCell><CCell>{orc.工作级别 || '／'}</CCell>
        </TableRow>
        <TableRow>
          <CCell>其他主要参数</CCell>
          <Cell colSpan={3}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
            {orc.其他参数 || '／'}
          </div></Cell>
        </TableRow>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell><Cell colSpan={3}>
          《起重机械安全技术规程》（TSG 51-2023）
        </Cell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={4}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.概备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

    {检验编制核准Tower({orc,rep})}
  </React.Fragment>;
};
