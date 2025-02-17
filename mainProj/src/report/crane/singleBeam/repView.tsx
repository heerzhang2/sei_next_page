/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme, CCell, Table, TableBody, TableRow, Text, RCell, Cell,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {multilines2Html} from "../../tools";
import {getInstrument2xCol, } from "../../common/helper";
// import {calcAverageArrObj, } from "../../../common/tool";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import { 检验编制核准SiB} from "../rarelyVary";


/**首页
 * @param original 是否为了打印正式版原始记录   tight miniw={800
 * */
export const 首页设备概况= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }  tight  miniw={800}>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}><Text>使 用 单 位：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.使用单位 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>分 支 机 构：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.分支机构 || '／'}</Text></CCell>
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
        <RCell css={{border:'none'}}><Text>型 号 规 格：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.型号 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>检 验 日 期：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.检验日期}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>检 验 类 别：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.检验类别}</Text></CCell>
      </TableRow>
      {original && <TableRow>
        <RCell css={{border:'none'}}><Text>记 录 编 号：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.监察识别码}</Text></CCell>
      </TableRow>
      }
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 代 码：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.设备代码}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设  备  号：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.eqpcod}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>监察识别码：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.监察识别码}</Text></CCell>
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
        <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Survey#Survey`}>
          <TableRow>
            <CCell colSpan={2}>使用单位名称</CCell>
            <CCell colSpan={3}>{orc.使用单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用单位地址</CCell>
            <CCell colSpan={3}>{orc.使用单位地址 || '／'}</CCell>
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
            <CCell colSpan={2}>使用地点</CCell>
            <CCell colSpan={3}>{orc.设备使用地点 || '／'}</CCell>
          </TableRow>

          <TableRow>
            <CCell colSpan={2}>安全管理人员</CCell><CCell>{orc.安全员 || '／'}</CCell>
            <CCell>联系电话</CCell><CCell>{orc.安全员电 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>使用登记证编号</CCell><CCell>{orc.使用证号 || '／'}</CCell>
            <CCell>设备代码</CCell><CCell>{orc.设备代码 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>单位内编号</CCell><CCell>{orc.单位内部编号 || '／'}</CCell>
            <CCell>制造日期</CCell><CCell>{orc.制造日期 || '／'}</CCell>
          </TableRow>
          <TableRow >
            <CCell colSpan={2}>制造单位名称</CCell>
            <CCell colSpan={3}>{orc.制造单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>改造单位名称</CCell>
            <CCell colSpan={3}>{orc.改造单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>重大修理单位名称</CCell>
            <CCell colSpan={3}>{orc.维修单位 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>安装单位名称</CCell>
            <CCell colSpan={3}>{orc.安装单位 || '／'}</CCell>
          </TableRow>

          <TableRow>
            <CCell colSpan={2}>型号规格</CCell>
            <CCell colSpan={3}>{orc.型号 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>产品编号</CCell><CCell>{orc.出厂编号 || '／'}</CCell>
            <CCell>注册代码</CCell><CCell>{orc.注册代码 || '／'}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>投入使用日期</CCell><CCell>{orc.投用日期 || '／'}</CCell>
            <CCell>设计使用年限</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
              {orc.设计年限 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>年</Text></div></CCell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Table fixed={ ["5.5%","20%","27%","20%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <TableRow >
          <CCell rowSpan={4}>性能参数</CCell>
          <CCell>额定起重量</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.额定起重量 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t</Text></div></CCell>
          <CCell>工作级别</CCell>
          <CCell>{orc.工作级别 || '／'}</CCell>
        </TableRow>
        <TableRow >
          <CCell>跨度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.跨度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m</Text></div></CCell>
          <CCell>生产率</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.生产率 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t/h</Text></div></CCell>
        </TableRow>
        <TableRow >
          <CCell>起升高度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.起升高度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m</Text></div></CCell>
          <CCell>起升速度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.起升速 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text></div></CCell>
        </TableRow>
        <TableRow >
          <CCell>大车运行速度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.大车速度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text></div></CCell>
          <CCell>小车运行速度</CCell><CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}><Text>
            {orc.小车速度 || '／'}</Text><Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text></div></CCell>
        </TableRow>
        <TableRow>
          <CCell>检验依据</CCell><Cell colSpan={4}>《起重机械定期检验规则》（TSG Q7015-2016）</Cell>
        </TableRow>

        <TableRow>
          <CCell>主要检验仪器设备</CCell>
          <Cell colSpan={4} css={{padding:0}}>
            <Table fixed={ ["4%","25%","21%","4%","25%","%"] }
                   css={ {borderCollapse: 'collapse', height:'fill-available'} }   tight  miniw={800}>
              <TableBody>
                <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Instrument`}>
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
        <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Witness#Witness`}>
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

/**格式化版本原始记录的需要：适合最多俩列的设备概况布局。
 * */
export const 俩列检验设备概况= ( { orc,rep,  repId, verId,config} : { orc: any,rep: any,repId: string,verId: string,config:any[][][]}
) => {
  const theme= useTheme();
  //上级组件若嵌套<DirectLink 也无法渗透 config?.map < />；
  return <>
        {
          config?.map(([[desc,name,cb],add2p] : any, i:number)=> {
            const [desc2,name2,cb2]= add2p||[];
            //<CCell colSpan={desc2? 1 : 3}>{typeof desc==='string'? name: desc?.view(orc)}</CCell>  '见附录13'
            //附加单位的两个形式：第三位置自带单位的， 或第二对象内部u字段指明单位。
            // console.log("检验设备情况3 faxian=", name2,'sdfds',typeof orc?.[name2]);
            const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
            const txtnode1=cb&&cb.view? cb.view(orc) :
                typeof name==='string'? (name?.startsWith('_$')? orc?.[name.substring(2)] : orc?.[name]) :
                    name.r? name.r :
                        name.t==='b'? (orc?.[name.n]? '是':'否') :
                            name.t==='m'? <div css={{textAlign: 'left'}}>
                                  {multilines2Html(orc?.[name.n],  (txt,i)=>{
                                    return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                                  })}</div>  :
                                orc?.[name.n];
            const tailUnit2=!desc2? undefined :
                typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
            const txtnode2=!desc2? undefined :
                cb2&&cb2.view? cb2.view(orc) :
                    typeof name2==='string'? (name2?.startsWith('_$')? orc?.[name2.substring(2)] : orc?.[name2]) :
                        name2.r? name2.r :
                            name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                                orc?.[name2.n];
            return <React.Fragment key={i}>
              <TableRow>
                <CCell>{typeof desc==='string'? desc: desc?.view(orc)}</CCell>
                { tailUnit1?
                    <CCell colSpan={desc2? 1 : 3}><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                      <Text >{txtnode1}</Text>
                      <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>{tailUnit1}</Text>
                    </div></CCell>
                    :
                    <CCell colSpan={desc2? 1 : 3}>{txtnode1}</CCell>
                }
                {desc2 && <>
                  <CCell>{desc2}</CCell>
                  { tailUnit2?
                      <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                        <Text >{txtnode2}</Text>
                        <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>{tailUnit2}</Text>
                      </div></CCell>
                      :
                      <CCell>{txtnode2}</CCell>
                  }
                </>
                }
              </TableRow>
            </React.Fragment>;
          })
        }
  </>;
};

