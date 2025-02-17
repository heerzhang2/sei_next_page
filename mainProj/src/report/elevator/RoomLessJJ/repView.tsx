/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme, CCell, Table, TableBody, TableRow, Text, RCell, Cell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {multilines2Html} from "../../tools";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import { config观测数据, config观测数据2, } from "./orcBase";
import {RepLink, twoForkSelect} from "../../common/base";
import {useMeasureTable} from "../../hook/useMeasure";
import {getInstrument2xCol} from "../../common/helper";
import {检验编制核准SiB} from "../../crane/rarelyVary";


//对比的：<RouterLink 可以导航文本处鼠标和点过链接颜色变但是表格鼠标不变，不能放在表格内。 改<DirectLink的。
export const 测量结果记录= ({ orc, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const renderMeasure=useMeasureTable({rep,orc, config: config观测数据});
  const renderMeasure2=useMeasureTable({rep,orc, seqOfs:9, config: config观测数据2});
  return <>
      <Text variant="h4" css={{marginTop: '1rem',
      }}>八、观测数据及测量结果记录</Text>
      <Table fixed={ ["2.5%","3.5%","3%","%","20%","10%","4%","8%","7%","5%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
        <TableHead>
          <TableRow>
            <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell colSpan={2}><Text css={{fontSize:'0.7rem'}}>项目编号</Text></CCell>
            <CCell colSpan={2}>检验内容与要求</CCell><CCell>检测项目</CCell>
            <CCell>单位</CCell><CCell>观测数据</CCell><CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <RepLink  ori  rep={rep} tag={'Measure'}>
            {renderMeasure}
          </RepLink>
          <RepLink  ori  rep={rep} tag={'Measure2'}>
            {renderMeasure2}
          </RepLink>
        </TableBody>
      </Table>
     注：本表所列项目检验人员无测量的，观测数据和观测结果可不填写，但结果判定要填写，不适用的项填“/"。
  </>;
};

/**格式化检验记录：【特殊表现的表格】表格行列倒置布局形式的;
 * */
export const 现场检验= ( { orc, rep } : { orc: any, rep: any}
) => {
  const recNums=orc?.检验条件?.length;
  const blocks=Math.ceil(recNums/5) || 1;     //倒转的，每5行的一块块布局:固定的5个日期汇集打印的一行。
  return <>
    <Table fixed={ ["3.5%","%","11%","11%","11%","11%","11%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell colSpan={2}>现场检验条件</CCell>
          <CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
      {(new Array(blocks)).fill(null).map((_, b:number) => {
        // const dateE=orc?.检验条件?.[b];    //某一次的
        const condit1=[] as any, condit2=[] as any, dates=[] as any;
        (new Array(5)).fill(null).forEach((_, d:number) => {
          if(b*5 +d>=recNums){
            condit1.push(<CCell key={b*5 +d}></CCell>);
            condit2.push(<CCell key={b*5 +d}></CCell>);
            dates.push(<CCell key={b*5 +d}></CCell>);
          }
          else{
            const row=orc?.检验条件?.[b*5 +d];
            condit1.push(<CCell key={b*5 +d}>{twoForkSelect(row?.x)}</CCell>);
            condit2.push(<CCell key={b*5 +d}>{twoForkSelect(row?.y)}</CCell>);
            dates.push(<CCell key={b*5 +d}>{row?.d}</CCell>);
          }
        });
        return <DirectLink key={b} href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/SiteCondition#SiteCondition`}>
                <TableRow>
                  <CCell>1</CCell><Cell>试验的动力源、环境温度、海拔高度、风速符合标准和设计要求。</Cell>
                  {condit1}
                </TableRow>
                <TableRow>
                  <CCell>2</CCell><Cell>检验现场不得有易燃、易爆以及腐蚀性气体。</Cell>
                  {condit2}
                </TableRow>
                <TableRow>
                  <CCell colSpan={2}>确认时间</CCell>
                  {dates}
                </TableRow>
            </DirectLink>;
      }) }
      </TableBody>
    </Table>;
    注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
  </>;
};


/**正式报告用的
 * */
export const 报告设备详情= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string,rep:any}
) => {
  const theme= useTheme();
  const instrumentTable =React.useMemo(() => getInstrument2xCol(orc.仪器表), [orc.仪器表]);
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>设备品种</CCell>
            <CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
            <CCell>型号</CCell>
            <CCell>{orc.型号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>设备注册代码</CCell>
            <CCell colSpan={3}>{orc.注册代码 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>制造单位</CCell>
            <CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>产品编号</CCell>
            <CCell>{orc.出厂编号 || '／'}</CCell>
            <CCell>制造日期</CCell>
            <CCell>{orc.制造日期 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>施工单位名称</CCell>
            <CCell colSpan={3}>{orc.施工单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>施工单位许可证明文件编号</CCell>
            <CCell>{orc.施许可号 || '／'}</CCell>
            <CCell>施工类别</CCell>
            <CCell>{orc.检验类别 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>安装地点</CCell>
            <CCell>{orc.设备使用地点 || '／'}</CCell>
            <CCell>使用登记证编号</CCell>
            <CCell>{orc.使用证号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位</CCell>
            <CCell colSpan={3}>{orc.使用单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>维保单位</CCell>
            <CCell colSpan={3}>{orc.维保单位 || '／'}</CCell>
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
            <CCell rowSpan={2}>设备技术参数</CCell>
            <CCell>额定载重量</CCell>
            <CCell>{orc.额定载荷 || '／'}  kg</CCell>
            <CCell>额定速度</CCell>
            <CCell>{orc.运行速度 || '／'}  m/s</CCell>
          </TableRow>
          <TableRow >
            <CCell>层站门数</CCell>
            <CCell>{orc.电梯层数}  层   {orc.电梯站数}  站  {orc.电梯门数} 门</CCell>
            <CCell>控制方式</CCell>
            <CCell>{orc.控制方式 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell>检验依据</CCell><Cell colSpan={4}>1、《电梯监督检验和定期检验规则——曳引与强制驱动电梯》（TSG T7001-2009）及1号、2号、3号修改单；<br/>
            2、《福建省电梯安全管理条例》</Cell>
          </TableRow>
        </DirectLink>

        <TableRow>
          <CCell>主要检验仪器设备</CCell>
          <Cell colSpan={4} css={{padding:0}}>
            <Table fixed={ ["6%","15%","28%","13%","17%","%"] }
                   css={ {borderCollapse: 'collapse', height:'fill-available'} }   tight  miniw={800}>
              <TableBody>
                <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Instrument#Instrument`}>
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
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={4}>{multilines2Html(orc?.大备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            })}</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

    {检验编制核准SiB({orc,rep})}
  </React.Fragment>;
};

