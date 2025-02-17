/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme, CCell, Table, TableBody, TableRow, Text, RCell, Cell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {multilines2Html} from "../../tools";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {config几何尺寸, config观测数据, items停车专项} from "./orcBase";
import {useMeasureCTable} from "../../hook/useMeasureOldVer";
import {RepLink, twoForkSelect} from "../../common/base";
import {检验编制核准} from "../../escalator/rarelyVary";

/**首页
 * @param original 是否为了打印正式版原始记录 还是正式报告
 * */
export const 首页概况Park= ({theme, orc, original,rep,noOid} :{theme: any, orc:any, original?:boolean,rep:any,noOid?:boolean}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }  tight  miniw={800}>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}><Text>施 工 类 别：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.检验类别 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>安装改造重大修理单位名称：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.安改修单 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>使用单位名称：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.使用单位 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 类 别：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{eqpTypeAllMap.get(orc?.设备类别)}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 品 种：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{eqpTypeAllMap.get(orc.设备品种)}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 型 号：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.型号 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 代 码：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.设备代码}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>检 验 日 期：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.检验日期1} 至 {orc.检验日期}</Text></CCell>
      </TableRow>
      {original && <TableRow>
          <RCell css={{border:'none'}}><Text>记 录 编 号：</Text></RCell>
          <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{rep?.isp.no}</Text></CCell>
        </TableRow>
      }
      <TableRow>
        <RCell css={{border:'none'}}><Text>设  备  号：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.eqpcod}</Text></CCell>
      </TableRow>
      {!noOid &&
          <TableRow>
            <RCell css={{border:'none'}}><Text>监察识别码：</Text></RCell>
            <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.监察识别码}</Text></CCell>
          </TableRow>
      }
    </TableBody>
  </Table>;
};
/**正式报告用： 设备详情
 * */
export const 报告设备详情= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string,rep:any}
) => {
  const theme= useTheme();
  // const instrumentTable =React.useMemo(() => getInstrument2xCol(orc.仪器表), [orc.仪器表]);
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6%","10%","30%","18%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>安装改造重大修理单位名称</CCell>
            <CCell colSpan={3}>{orc.安改修单 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>施工单位特种设备生产许可证（受理决定书）编号</CCell><CCell>{orc.许可书号 || '／'}</CCell>
            <CCell>安装改造重大修理单位负责人</CCell><CCell>{orc.安改负人 || '／'}</CCell>
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
          <TableRow >
            <CCell colSpan={2}>制造单位名称</CCell>
            <CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2} rowSpan={2}>制造单位特种设备生产许可证编号</CCell><CCell rowSpan={2}>{orc.生产许号 || '／'}</CCell>
            <CCell>设备类别</CCell><CCell>机械式停车设备</CCell>
          </TableRow>
          <TableRow>
            <CCell>设备型号</CCell><CCell>{orc.设备型号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc?.子设备品种) || '／'}</CCell>
            <CCell>型号规格</CCell><CCell>{orc.型号 || '／'}</CCell>
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
            <CCell>设计使用年限</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.设计年限 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>年</Text></div></CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用地点</CCell>
            <CCell colSpan={3}>{orc.设备使用地点 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>工作条件</CCell>
            <CCell colSpan={3}>{orc.操纵方式 || '／'}</CCell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Table fixed={ ["5.5%","20%","27%","20%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
        <TableRow >
          <CCell rowSpan={4}>性能参数</CCell>
          <CCell>层数</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.电梯层数 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>层</Text></div></CCell>
          <CCell>存容量</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
          {orc.泊位数量 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>辆</Text></div></CCell>
        </TableRow>
        <TableRow >
          <CCell>适停汽车质量</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.适停车质量 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>kg</Text></div></CCell>
          <CCell>停汽车尺寸<br/>(长×宽×高)</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.适停尺寸 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>mm</Text></div></CCell>
        </TableRow>
        <TableRow >
          <CCell>额定升降速度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.额升降速度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text></div></CCell>
          <CCell>额定运行速度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.额定速度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text></div></CCell>
        </TableRow>
        <TableRow >
          <CCell>其他主要参数</CCell>
          <CCell colSpan={3}>{orc.其他参数 || '／'}</CCell>
        </TableRow>
          </DirectLink>
        <TableRow>
          <CCell>检验依据</CCell><Cell colSpan={4}>《起重机械安全技术规程》（TSG 51-2023）</Cell>
        </TableRow>
        <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={4}>{multilines2Html(orc?.概备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            })}</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>

      {检验编制核准({orc,rep})}
  </React.Fragment>;
};

export const 测量结果记录= ({ orc, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const renderMeasure=useMeasureCTable({rep,orc, config: config观测数据});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录1 观测值及测量结果记录表</Text>
    <Table fixed={ ["4%","10%","16%","%","7%","16%","12%","6%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.6rem'}}>序号</Text></CCell><CCell>项目编号</CCell><CCell colSpan={2}>检验项目</CCell><CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验结果</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/PARK-JJ/ver/${rep?.modelversion}/${rep?.id}/Measure#Measure`}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={7}>{ multilines2Html(orc.观测备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。（下同）<br/>
    2、其他需记录的测量值和结果值填在备注栏中。<br/>
    3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。<br/>
    4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
  </>;
};
export const 几何尺寸记录= ({ orc, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const renderMeasure=useMeasureCTable({rep,orc, config: config几何尺寸, allowableV:true});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录3：C3.6主要几何尺寸观测值及测量结果记录表(适于改造监检)</Text>
    <Table fixed={ ["4%","10%","16%","%","7%","16%","10%","8%","6%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.6rem'}}>序号</Text></CCell><CCell colSpan={3}>检验项目</CCell><CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell>允许值</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验结果</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/PARK-JJ/ver/${rep?.modelversion}/${rep?.id}/Geometric#Geometric`}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}>{ multilines2Html(orc.几何备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、以设计图样要求作为检验结果判定依据。<br/>
    2、其他尺寸的要求可将其测量值和结果填在备注栏中。<br/>
    3、停车位尺寸中的倾斜角度为“适停车辆倾斜角”。
  </>;
};
/**格式化记录或报告用：停车专项试验
 * */
export const 停车专项试验= ({ orc, rep, } : { orc: any, rep: any, }
) => {
  let arrobj回: any[]=[];
  for(let e=0;e<3;e++){
    arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
  }
  //const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);上一代(orc.吊回速??[{}])?.map((o: any, i:number) => {}
  return <>
    <div  css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
      <Text id='ParkSpecial' variant="h4" css={{marginTop: '1rem',}}>附录9：C4.3.2.5机械式停车设备专项试验记录表</Text>
    </div>
    <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }
               tight  miniw={800} css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
      <TableBody>
        <TableRow>
          <CCell colSpan={2}>项目</CCell>
          <CCell>单位</CCell>
          <CCell>测量值</CCell>
          <CCell>结果值</CCell>
          <CCell>偏差值</CCell>
          <CCell>偏差允计值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
        <RepLink ori rep={rep} tag='ParkSpecial'>
          { items停车专项.map(([title,field,unit], i:number) => {
            let arrobj: any[]=[];
            for(let e=0;e<3;e++){
              arrobj.push({d: orc?.[field+'o']?.[e], t:orc?.[field+'v']?.[e]});
            }
            return  <React.Fragment key={i}>
                { (new Array(3)).fill(null).map(( _,  w:number) => {
                  // const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
                  return  <TableRow key={w}>
                    {w===0 && <CCell rowSpan={3} colSpan={2}>{title}</CCell>}
                    {w===0 && <CCell rowSpan={3}>{unit}</CCell>}
                    <CCell>{orc?.[field]?.o?.[w]}</CCell>
                    <CCell>{orc?.[field]?.v?.[w]}</CCell>
                    <CCell>{orc?.[field]?.m?.[w]}</CCell>
                    {w===0 && <CCell rowSpan={3}>{orc?.[field]?.l}</CCell>}
                    {0===i && w===0 && <CCell split rowSpan={12}>{orc?.停车专r}</CCell>}
                  </TableRow>;
                }) }
            </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={7}>{ multilines2Html(orc.停专备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。
  </>;
};

/**【特殊表现的表格】表格行列倒置布局形式的;
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
