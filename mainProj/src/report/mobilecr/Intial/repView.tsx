/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme, CCell, Table, TableBody, TableRow, Text, RCell, Cell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {multilines2Html} from "../../tools";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {config观测数据, config距离,} from "./orcBase";
import {RepLink, twoForkSelect} from "../../common/base";
import {useMeasureTable} from "../../hook/useMeasure";
import {getInstrument2xCol} from "../../common/helper";
import {检验编制核准SiB} from "../../crane/rarelyVary";
import {检验编制核准Mbcr} from "../rarelyVary";


//对比的：<RouterLink 可以导航文本处鼠标和点过链接颜色变但是表格鼠标不变，不能放在表格内。 改<DirectLink的。
export const 测量结果记录= ({ orc, rep,label } : { orc: any, rep: any,label:string}
) => {
  const renderMeasure=useMeasureTable({rep,orc, config: config观测数据});
  return <>
      <Text variant="h4" css={{marginTop: '1rem',
      }}>{label}</Text>
      <Table fixed={ ["3%","8%","13%","%","20%","5%","10%","8%","6%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
        <TableHead>
          <TableRow>
            <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell><Text css={{fontSize:'0.7rem'}}>项目编号</Text></CCell><CCell colSpan={3}>检验内容与要求</CCell>
            <CCell>单位</CCell><CCell>观测数据</CCell><CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Measure#Measure`}>
            {renderMeasure}
            <TableRow>
              <CCell>备注</CCell>
              <Cell colSpan={8}>
                <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                  {orc?.观测备注 || '／'}
                </div>
              </Cell>
            </TableRow>
          </DirectLink>
        </TableBody>
      </Table>
    注：1、未测量或无需测量的，仅填检验结果栏。
    2、其他需记录的测量值和结果值填在备注栏中。
    3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
    4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
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
    <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>使用单位</CCell>
            <CCell colSpan={3}>{orc.使用单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位地址</CCell>
            <CCell colSpan={3}>{orc.使用单位地址 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>制造单位生产许可证编号</CCell><CCell>{orc.生产许号 || '／'}</CCell>
            <CCell>使用单位安全管理人员</CCell><CCell>{orc.安管人员 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>联系电话</CCell><CCell>{orc.使用单位电话 || '／'}</CCell>
            <CCell>邮政编码</CCell><CCell>{orc.使用单位邮编 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>设备类别</CCell><CCell>{eqpTypeAllMap.get(orc.设备类别)}</CCell>
            <CCell>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>型号规格</CCell><CCell>{orc.型号 || '／'}</CCell>
            <CCell>设备代码</CCell><CCell>{orc.设备代码 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>产品编号</CCell><CCell>{orc.出厂编号 || '／'}</CCell>
            <CCell>单位内编号</CCell><CCell>{orc.单位内部编号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>投入使用日期</CCell><CCell>{orc.投用日期 || '／'}</CCell>
            <CCell>设计使用年限</CCell><CCell>{orc.设计年限 || '／'}  年</CCell>
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
          <CCell>额定起重量</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.额定载荷}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t</Text>
          </div></CCell>
          <CCell>额定起重力矩</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.起重力矩}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t·m</Text>
          </div></CCell>
        </TableRow>
        <TableRow>
          <CCell>工作幅度</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.工作幅度}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m</Text>
          </div></CCell>
          <CCell>回转速度</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.回转速度}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>r/min</Text>
          </div></CCell>
        </TableRow>
        <TableRow>
          <CCell>最大起升高度</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.起升高度}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m</Text>
          </div></CCell>
          <CCell>起升速度</CCell>
          <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
            <Text >{orc?.起升速}</Text>
            <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text>
          </div></CCell>
        </TableRow>
        <TableRow>
          <CCell>工作级别</CCell><CCell>{orc.工作级别 || '／'}</CCell>
          <CCell>其他主要参数</CCell>
          <Cell>{multilines2Html(orc?.其他参数,  (txt,i)=>{
            return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
           })}</Cell>
        </TableRow>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell><Cell colSpan={3}>
          《起重机械安全技术规程》（TSG 51-2023）
        </Cell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey#Survey`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={4}>{multilines2Html(orc?.概备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            })}</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

    {检验编制核准Mbcr({orc,rep})}
  </React.Fragment>;
};
/**安全距离记录 ；报告可打印的 测量：支持更大可能的复用性。 用了Hook就需要正规的React组件模式来做。
 *  @param children  直接作为嵌套的组件也能传递过来的。
 * */
export const SafeDistance= ({children, orc, rep,label } : { orc: any, rep: any,label:string, children: any}
) => {
  const renderMeasure=useMeasureTable({rep,orc, config: config距离(orc)});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table id='SafeDistance' fixed={ ["3%","28%","13%","%","10%","5%","10%","8%","6%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell><Text css={{fontSize:'0.7rem'}}>项目编号</Text></CCell><CCell colSpan={3}>检验内容与要求</CCell>
          <CCell>单位</CCell><CCell>观测数据</CCell><CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'SafeDistance'}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}>
              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc?.安距备注 || '／'}
              </div>
            </Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    { children }
  </>;
};

