/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  useTheme, CCell, Cell, Table, TableBody, TableRow, Text, RCell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {multilines2Html, } from "../../tools";
import {config漏磁检, config设备概况, guide机构同步, 默认梯子走台, 默认起升高度, 默认运行行程} from "./orcBase";
import {Heterogeneous, HeterogeneousRender} from "../../hook/useRepTableEditor";
import { calcAverageArrObj, floatInterception} from "../../../common/tool";
import Img_Jgd  from './PictureJgd.png';
import {SimpleImg} from "../../../comp/Image";
import { 检验编制核准D} from "../rarelyVary";
import {eqpTypeAllMap} from "../../../dict/eqpComm";


//不同版本能够直接复用的组件； 内容相对重复；减少代码数量的重复和冗余。
//注意<RouterLink to={`/report/`}>不能直接套在函数上面，其底下必须见到<>。
export const 检验设备情况= ( { orc,  repId, verId } : { orc: any,repId: string,verId: string}
) => {
  const theme= useTheme();
  return <React.Fragment>
    <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Survey`}>
      <Text variant="h4">二、设备概况</Text>
    </DirectLink>
    <Table printColWidth={ ["1","1","1","1"] }
           css={ {borderCollapse: 'collapse' } }
    >
    <TableBody>
      {
        config设备概况?.map(([[desc,name,cb],add2p] : any, i:number)=> {
          const [desc2,name2,cb2]= add2p||[];
          //<CCell colSpan={desc2? 1 : 3}>{typeof desc==='string'? name: desc?.view(orc)}</CCell>  '见附录13'
          //附加单位的两个形式：第三位置自带单位的， 或第二对象内部u字段指明单位。
          // console.log("检验设备情况3 faxian=", name2,'sdfds',typeof orc?.[name2]);
          const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
          const txtnode1=cb&&cb.view? cb.view(orc) :
              typeof name==='string'? orc?.[name] :
                  name.r? name.r :
                      name.t==='b'? (orc?.[name.n]? '是':'否') :
                          name.t==='m'?
                              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap', textAlign: 'left'}}>
                                {orc?.[name.n] || '／'}
                              </div>
                              :
                              orc?.[name.n];
          const tailUnit2=!desc2? undefined :
              typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
          const txtnode2=!desc2? undefined :
              cb2&&cb2.view? cb2.view(orc) :
              typeof name2==='string'? orc?.[name2] :
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
    </TableBody>
    </Table>
  </React.Fragment>;
};


/**大部分不能编辑输入的：个字段数据来自后端准备好的数据
 * */
export const 观测值及测量表= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  // const theme = useTheme();
  return <>
    <TableBody>
      <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/ObservationDrum#ObservationDrum`}>
      <TableRow>
        <CCell>1</CCell>
        <CCell rowSpan={5}>C3.8.1</CCell>
        <CCell colSpan={4}>卷筒上压板数量</CCell>
        <CCell rowSpan={2}>个</CCell>
        <CCell>{orc.卷筒板o}</CCell>
        <CCell>{orc.卷筒板v}</CCell>
        <CCell rowSpan={5}>{orc.绳钢圈r}</CCell>
      </TableRow>
      <TableRow>
        <CCell>2</CCell>
        <CCell colSpan={4}>绳夹数量</CCell>
        <CCell>{orc.绳夹数o}</CCell>
        <CCell>{orc.绳夹数v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>3</CCell>
        <CCell colSpan={4}>绳夹间距</CCell>
        <CCell rowSpan={2}>mm</CCell>
        <CCell>{orc.绳夹间o}</CCell>
        <CCell>{orc.绳夹间v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>4</CCell>
        <CCell colSpan={4}>钢丝绳编结长度</CCell>
        <CCell>{orc.编结长o}</CCell>
        <CCell>{orc.编结长v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>5</CCell>
        <CCell colSpan={4}>安全圈数</CCell>
        <CCell>圈</CCell>
        <CCell>{orc.安圈数o}</CCell>
        <CCell>{orc.安圈数v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>6</CCell>
        <CCell>C3.10</CCell>
        <CCell colSpan={4}>敞开式司机室护栏高度</CCell>
        <CCell>m</CCell>
        <CCell>{orc.敞护高o}</CCell>
        <CCell>{orc.敞护高v}</CCell>
        <CCell>{orc.敞护高r}</CCell>
      </TableRow>
      <TableRow>
        <CCell rowSpan={3}>7</CCell>
        <CCell rowSpan={3}>C3.11.3</CCell>
        <CCell colSpan={4}>TN系统重复接地电阻</CCell>
        <CCell rowSpan={3}>Ω</CCell>
        <CCell>{orc.电阻No}</CCell>
        <CCell>{orc.电阻Nv}</CCell>
        <CCell rowSpan={3}>{orc.接地阻r}</CCell>
      </TableRow>
      <TableRow>
        <CCell colSpan={4}>TT系统接地电阻</CCell>
        <CCell>{orc.电阻To}</CCell>
        <CCell>{orc.电阻Tv}</CCell>
      </TableRow>
      <TableRow>
        <CCell colSpan={4}>IT系统接地电阻</CCell>
        <CCell>{orc.电阻Io}</CCell>
        <CCell>{orc.电阻Iv}</CCell>
      </TableRow>
      <TableRow>
        <CCell>8</CCell>
        <CCell>C3.11.7</CCell>
        <CCell colSpan={4}>起重电磁铁：备用电池能够保持起重电磁铁吸附额定载荷的时间</CCell>
        <CCell>min</CCell>
        <CCell>{orc.备磁铁o}</CCell>
        <CCell>{orc.备磁铁v}</CCell>
        <CCell>{orc.备磁铁r}</CCell>
      </TableRow>
      </DirectLink>
      <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/ObservationInsula#ObservationInsula`}>
      <TableRow>
        <CCell rowSpan={6}>9</CCell>
        <CCell rowSpan={6}>C3.14</CCell>
        <CCell colSpan={4}>主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻</CCell>
        <CCell rowSpan={4}>MΩ</CCell>
        <CCell>{orc.主回阻o}</CCell>
        <CCell rowSpan={4}>{orc.主回阻v}</CCell>
        <CCell rowSpan={6}>{orc.绝缘起r}</CCell>
      </TableRow>
      <TableRow>
        <CCell rowSpan={5}>绝缘起重机</CCell>
        <CCell colSpan={3}>吊钩与钢丝绳动滑轮组之间绝缘电阻</CCell>
        <CCell>{orc.滑轮阻o}</CCell>
      </TableRow>
      <TableRow>
        <CCell colSpan={3}>起升机构与小车架之间绝缘电阻</CCell>
        <CCell>{orc.车架阻o}</CCell>
      </TableRow>
      <TableRow>
        <CCell colSpan={3}>小车架与桥架或者门架之间绝缘电阻</CCell>
        <CCell>{orc.门架阻o}</CCell>
      </TableRow>
      <TableRow>
        <CCell rowSpan={2} colSpan={2}>小车架上的感应电压</CCell>
        <CCell>交流</CCell>
        <CCell rowSpan={2}>V</CCell>
        <CCell>{orc.交流感o}</CCell>
        <CCell>{orc.交流感v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>直流</CCell>
        <CCell>{orc.直流感o}</CCell>
        <CCell>{orc.直流感v}</CCell>
      </TableRow>
      <TableRow>
        <CCell>10</CCell>
        <CCell>C4.5.2.4</CCell>
        <CCell colSpan={4}>真空吸盘：如果出现电源故障，真空吸盘能够保持载荷的时间</CCell>
        <CCell>min</CCell>
        <CCell>{orc.空吸盘o}</CCell>
        <CCell>{orc.空吸盘v}</CCell>
        <CCell>{orc.空吸盘r}</CCell>
      </TableRow>
      <TableRow>
        <CCell>备注</CCell>
        <Cell colSpan={9}>{ multilines2Html(orc.观测备注,  (txt,i)=>{
            return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
          } ) }</Cell>
      </TableRow>
      </DirectLink>
    </TableBody>
  </>;
};

/**
 * @param original 是否为了打印正式版原始记录
 *@param rheight 单行的高度 默认40
 * */
export const 首页设备概况Cr= ({orc, original,rep,rheight=40 } :{orc:any, original?:boolean,rep?:any,rheight?:number}
) => {
  return  <Table fixed={ ["20%","%"] }   css={ {borderCollapse: 'collapse'} }  tight miniw={800}>
    <TableBody rheight={rheight}>
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
        <RCell css={{border:'none'}}><Text>设备型号规格：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.型号 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>设 备 代 码：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.设备代码}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>使用登记证编号：</Text></RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}><Text>{orc.使用证号 || '／'}</Text></CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}><Text>检 验 日 期：</Text></RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
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

export const 安全距离观测值表= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  // const theme = useTheme();
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录2：C3.3  安全距离观测值及测量结果记录表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell colSpan={2}>检验项目</CCell>
          <CCell>单位</CCell>
          <CCell>观测值</CCell>
          <CCell>结果值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/SafetyDistance#SafetyDistance`}>
          <TableRow>
            <CCell>1</CCell>
            <CCell rowSpan={3}>（1）运动部分与建筑物净距</CCell>
            <CCell>距固定部分</CCell>
            <CCell split rowSpan={8}>m</CCell>
            <CCell>{orc.距固定o}</CCell>
            <CCell>{orc.距固定v}</CCell>
            <CCell split rowSpan={8}>{orc.安全距r}</CCell>
          </TableRow>
          <TableRow>
            <CCell>2</CCell>
            <CCell>距作何栏杆或扶手</CCell>
            <CCell>{orc.距扶手o}</CCell>
            <CCell>{orc.距扶手v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>3</CCell>
            <CCell>距出入区</CCell>
            <CCell>{orc.距出入o}</CCell>
            <CCell>{orc.距出入v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>4</CCell>
            <CCell rowSpan={2}>（2）运动部分的下界限线</CCell>
            <CCell>与下方的一般出入区之间的垂直距离</CCell>
            <CCell>{orc.垂出入o}</CCell>
            <CCell>{orc.垂出入v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>5</CCell>
            <CCell>与通常不准人出入的下方的固定或活动部分及与栏杆顶部的垂直距离</CCell>
            <CCell>{orc.垂不准o}</CCell>
            <CCell>{orc.垂不准v}</CCell>
          </TableRow>
          <TableRow>
            <CCell rowSpan={2}>6</CCell>
            <CCell rowSpan={2}>(3)运动部分的上界限线与上方的固定或活动部分之间的垂直距离</CCell>
            <CCell>在保养区域和维修平台等处的距离</CCell>
            <CCell>{orc.保养距o}</CCell>
            <CCell>{orc.保养距v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>如果不会对人员产生危险时的距离</CCell>
            <CCell>{orc.人险距o}</CCell>
            <CCell>{orc.人险距v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>7</CCell>
            <CCell colSpan={2}>(4)与输电线的最小距离，线路电压（{orc.输线电压}）kv</CCell>
            <CCell>{orc.输最距o}</CCell>
            <CCell>{orc.输最距v}</CCell>
          </TableRow>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={9}>{ multilines2Html(orc.安距备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。<br/>
    2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
  </>;
};

export const 受力结构件厚度= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const aveThick=calcAverageArrObj([orc?.力面厚1o,orc?.力面厚2o,orc?.力面厚3o],(row)=>row,2);
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录3：C3.7.3  主要受力结构件断面有效厚度观测值及测量结果记录表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>检验项目</CCell>
          <CCell>单位</CCell>
          <CCell>观测值</CCell>
          <CCell>平均值</CCell>
          <CCell>结果值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Thickness#Thickness`}>
          <TableRow>
            <CCell rowSpan={3}>1</CCell>
            <CCell rowSpan={3} css={{wordBreak: 'break-all'}}>主要受力结构件断面有效厚度，设计值（{orc.力面厚设}）mm</CCell>
            <CCell rowSpan={3}>mm</CCell>
            <CCell>{orc.力面厚1o}</CCell>
            <CCell rowSpan={3}>{aveThick}</CCell>
            <CCell rowSpan={3}>{orc.力面厚v}</CCell>
            <CCell rowSpan={3}>{orc.力面厚r}</CCell>
          </TableRow>
          <TableRow>
            <CCell>{orc.力面厚2o}</CCell>
          </TableRow>
          <TableRow>
            <CCell>{orc.力面厚3o}</CCell>
          </TableRow>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}>{ multilines2Html(orc.力面备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。<br/>
    2、未测量或无需测量的，仅填检验结果栏。
  </>;
};

//报表修正性配置：针对编辑器“默认梯子走台”分离后进行扩展，每一行项目名字与序号需一一对应： 这儿默认检验项目跨越c=3列的。n:名称替换； 注意：梯子表，默认梯子走台，title梯子 这3个有相同行数的。
const title梯子=[{ 1:['（1）通道与平台',[11,1]] } , {}, {}, {},
  {n:'最小净空高度',1:['起重机械结构件内部很少使用的进出通道',[2,2]],c:1}, {n:'通道净宽度',c:1}, {},  {}, {},{},{},
  {n:'斜梯的倾斜角',1:['（2）梯子与栏杆',[19,1]], 2:['斜梯',[7,1]], c:2},  {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  {n:'直梯两侧撑杆的间距',1:['直梯',[6,1]],c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  {}, {}, {},  {}, {}, {} ]  as Heterogeneous[];
/**这个配置拼凑 表格的办法： 感觉也不好用的。
 * */
export const 梯子走台栏杆= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录4：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell colSpan={4}>检验项目</CCell>
          <CCell>单位</CCell>
          <CCell>观测值</CCell>
          <CCell>结果值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Thickness#Thickness`}>
          {(orc.梯子表??默认梯子走台).map((o: any, i:number) => {
            return (
                <TableRow key={i}>
                  <CCell>{i+1}</CCell>
                  {HeterogeneousRender(o.n, title梯子[i], 3)}
                  <CCell>{默认梯子走台[i].u}</CCell>
                  <CCell>{o.o}</CCell>
                  <CCell>{o.v}</CCell>
                  { i===0 && <CCell rowSpan={(orc.梯子表??默认梯子走台).length}>{orc.梯子表r}</CCell>
                  }
                </TableRow>
            );
          }) }

          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}>{ multilines2Html(orc.梯子备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。<br/>
    2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
  </>;
};

export const 监控管理系统= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录5：C4.2.2.5和C4.9.7安全监控管理系统参数验证表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>项目编号</CCell>
          <CCell>次数(类别）</CCell>
          <CCell colSpan={2}>显示屏数值</CCell>
          <CCell colSpan={2}>测量值</CCell>
          <CCell colSpan={2}>计算值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Monitoring#Monitoring`}>
          <TableRow>
            <CCell rowSpan={4}>1</CCell>
            <CCell rowSpan={4}>C4.2.2.5.1.1 起升高度（m)</CCell>
            <CCell>/</CCell>
            <CCell>H1</CCell>
            <CCell>H2</CCell>
            <CCell>h1</CCell>
            <CCell>h2</CCell>
            <CCell>H</CCell>
            <CCell>h</CCell>
            <CCell rowSpan={4}>{orc.起高表r}</CCell>
          </TableRow>
          {(orc.起高表??默认起升高度).map((o: any, i:number) => {
            return (
                <TableRow key={i}>
                  <CCell>{默认起升高度[i]?.n}</CCell>
                  <CCell>{o?.H1}</CCell>
                  <CCell>{o?.H2}</CCell>
                  <CCell>{o?.h1}</CCell>
                  <CCell>{o?.h2}</CCell>
                  <CCell>{o?.H}</CCell>
                  <CCell>{o?.h}</CCell>
                </TableRow>
            );
          }) }
          <TableRow>
            <CCell rowSpan={3}>2</CCell>
            <CCell rowSpan={3}>C4.2.2.5.1.2 运行行程（m)</CCell>
            <CCell>/</CCell>
            <CCell>S1</CCell>
            <CCell>S2</CCell>
            <CCell colSpan={2}>s</CCell>
            <CCell>S</CCell>
            <CCell>/</CCell>
            <CCell rowSpan={3}>{orc.行程表r}</CCell>
          </TableRow>
          {(orc.行程表??默认运行行程).map((o: any, i:number) => {
            return (
                <TableRow key={i}>
                  <CCell>{默认运行行程[i]?.n}</CCell>
                  <CCell>{o?.S1}</CCell>
                  <CCell>{o?.S2}</CCell>
                  <CCell colSpan={2}>{o?.s}</CCell>
                  <CCell>{o?.S}</CCell>
                  <CCell>/</CCell>
                </TableRow>
            );
          }) }
          <TableRow>
            <CCell>3</CCell>
            <CCell>C4.2.2.5.1.4 运行偏斜（m)</CCell>
            <CCell>大车</CCell>
            <CCell colSpan={2}>{orc.偏斜o}</CCell>
            <CCell colSpan={2}>{orc.偏斜v}</CCell>
            <CCell colSpan={2}>/</CCell>
            <CCell>{orc.偏斜r}</CCell>
          </TableRow>
          <TableRow>
            <CCell>4</CCell>
            <CCell>C4.9.7.1风速</CCell>
            <CCell>1次</CCell>
            <CCell colSpan={2}>{orc.风速o}</CCell>
            <CCell colSpan={2}>{orc.风速v}</CCell>
            <CCell colSpan={2}>/</CCell>
            <CCell>{orc.风速r}</CCell>
          </TableRow>
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={9}>{ multilines2Html(orc.监控备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于不合格的值才需测量和记录，未测量或无需测量的，仅填检验结果栏。<br/>
    2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
  </>;
};

export const 运行速度= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const avspeed=calcAverageArrObj(orc.起升速表,(row)=>{return row?.d/row?.t},2);
  const avspeed2=calcAverageArrObj(orc.主降速表,(row)=>{return row?.d/row?.t},2);
  const avspeed3=calcAverageArrObj(orc.大车运,(row)=>{return row?.d/row?.t},2);
  const avspeed4=calcAverageArrObj(orc.小车运,(row)=>{return row?.d/row?.t},2);
  const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);

  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录6：C4.3.2.1各机构运行速度记录表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>次数</CCell>
          <CCell>距离(m)</CCell>
          <CCell>时间(min)</CCell>
          <CCell>速度(m/min)</CCell>
          <CCell>平均速度(m/min)</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Speed#Speed`}>
          {(orc.起升速表??[{}])?.map((o: any, i:number) => {
            const itspd=o?.d/o?.t;
            return (
                <TableRow key={i}>
                  {i===0 && <CCell rowSpan={(orc.起升速表)?.length}>主起升机构起升速度</CCell>}
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.d}</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {i===0 && <CCell rowSpan={(orc.起升速表)?.length}>{avspeed}</CCell>}
                  {i===0 && <CCell rowSpan={(orc.起升速表)?.length}>{orc.起升速表r}</CCell>}
                </TableRow>
            );
          }) }
          {(orc.主降速表??[{}])?.map((o: any, i:number) => {
            const itspd=o?.d/o?.t;
            return (
                <TableRow key={i}>
                  {i===0 && <CCell rowSpan={orc.主降速表?.length}>主起升机构下降速度</CCell>}
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.d}</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {i===0 && <CCell rowSpan={orc.主降速表?.length}>{avspeed2}</CCell>}
                  {i===0 && <CCell rowSpan={orc.主降速表?.length}>{orc.主降速表r}</CCell>}
                </TableRow>
            );
          }) }
          {(orc.大车运??[{}])?.map((o: any, i:number) => {
            const itspd=o?.d/o?.t;
            return (
                <TableRow key={i}>
                  {i===0 && <CCell rowSpan={orc.大车运?.length}>大车运行速度</CCell>}
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.d}</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {i===0 && <CCell rowSpan={orc.大车运?.length}>{avspeed3}</CCell>}
                  {i===0 && <CCell rowSpan={orc.大车运?.length}>{orc.大车运r}</CCell>}
                </TableRow>
            );
          }) }
          {(orc.小车运??[{}])?.map((o: any, i:number) => {
            const itspd=o?.d/o?.t;
            return (
                <TableRow key={i}>
                  {i===0 && <CCell rowSpan={orc.小车运?.length}>小车运行速度</CCell>}
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.d}</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {i===0 && <CCell rowSpan={orc.小车运?.length}>{avspeed4}</CCell>}
                  {i===0 && <CCell rowSpan={orc.小车运?.length}>{orc.小车运r}</CCell>}
                </TableRow>
            );
          }) }
          <TableRow>
            <CCell rowSpan={(orc.吊回速?.length??1)+1}>吊具回转速度</CCell>
            <CCell>次数</CCell>
            <CCell>圈数(r)</CCell>
            <CCell>时间(min)</CCell>
            <CCell>速度(r/min)</CCell>
            <CCell>平均速度(r/min)</CCell>
            <CCell>检验结果</CCell>
          </TableRow>
          {(orc.吊回速??[{}])?.map((o: any, i:number) => {
            const itspd=o?.d/o?.t;
            return (
                <TableRow key={i}>
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.d}</CCell>
                  <CCell>{o?.t}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {i===0 && <CCell rowSpan={orc.吊回速?.length}>{avspeed5}</CCell>}
                  {i===0 && <CCell rowSpan={orc.吊回速?.length}>{orc.吊回速r}</CCell>}
                </TableRow>
            );
          }) }

          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={9}>{ multilines2Html(orc.速度备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于起升速度、下降速度、大车运行速度、小车运行速度，电动单梁起重机测4次计算平均值，轮胎式集装箱门式起重机和岸边集装箱起重机测3次计算平均值，其余起重机测1次。<br/>
    2、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没有规定的，相应的速度仅测量，不作检验结果判定。<br/>
    3、对于多起升机构或多小车运行机构的起重机，仅记录其中1个主起升机构和主小车运行机构的速度。对于其余起升机构和小车运行机构的速度测量值，记录在备注栏。<br/>
    4、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。<br/>
    5、防爆型桥门式起重机的速度应符合TSG51-2023 A6.3.3的规定。<br/>
    6、未检查或无需检验的，仅填检验结果栏。
  </>;
};
export const 制动距离= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录7：C4.3.2.2起升机构制动距离记录表</Text>
    <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
    }}>单位：mm</Text>
    <Table printColWidth={ ["1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>项目</CCell>
          <CCell>次数</CCell>
          <CCell>制动距离</CCell>
          <CCell>平均制动距离</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Braking#Braking`}>
          { [['主起升机构','主制距','主制距r'],['副起升机构','副制距','副制距r']].map(([title,field,resFd], i:number) => {
            const avdistance=calcAverageArrObj(orc?.[field],(row)=>row,2,3);
            return  <React.Fragment key={i}>
                    { (new Array(3)).fill(null).map(( _,  w:number) => {
                      return <TableRow key={w}>
                                {w===0 && <CCell rowSpan={3}>{title}</CCell>}
                                <CCell>{w+1}</CCell>
                                <CCell>{orc?.[field]?.[w]}</CCell>
                                { w===0 && <>
                                  <CCell rowSpan={3}>{avdistance}</CCell>
                                  <CCell rowSpan={3}>{orc?.[resFd]}</CCell>
                                 </>
                                }
                            </TableRow>;
                    }) }
                </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={4}>{ multilines2Html(orc.制距备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件对制动距离都没有规定的，相应的制动距离可不测量。<br/>
    2、对于多起升机构的起重机，仅记录其中1个主起升机构和1个副起升机构制动距离。对于其余起升机构制动距离，记录在备注栏。<br/>
    3、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。<br/>
    4、未检查或无需检验的，仅填检验结果栏。
  </>;
};
export const 机构同步= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录8：C4.3.2.3各机构同步性能记录表</Text>
    <Table printColWidth={ ["1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>项目</CCell>
          <CCell>单位</CCell>
          <CCell>机构1</CCell>
          <CCell>机构2</CCell>
          <CCell>偏差测量值</CCell>
          <CCell>偏差允计值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Braking#Braking`}>
          { guide机构同步.map(([title,field], i:number) => {
            return  <React.Fragment key={i}>
              <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Braking#Braking`}>
              <TableRow>
                <CCell rowSpan={2}>{title}</CCell>
                <CCell rowSpan={2}>{orc?.[field]?.u}</CCell>
                <CCell>{orc?.[field]?.fu}</CCell>
                <CCell>{orc?.[field]?.su}</CCell>
                <CCell rowSpan={2}>{orc?.[field]?.m}</CCell>
                <CCell rowSpan={2}>{orc?.[field]?.l}</CCell>
                {i===0 && <CCell split rowSpan={8}>{orc?.同步性r}</CCell>}
              </TableRow>
              <TableRow>
                <CCell>{orc?.[field]?.fd}</CCell>
                <CCell>{orc?.[field]?.sd}</CCell>
              </TableRow>
            </DirectLink>
            </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}>{ multilines2Html(orc.同步备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、以设计文件偏差允计值单位为准，测量相应的偏差值。<br/>
    2、测量高度或行程时，单位填mm；测量速度时，单位填m/min。<br/>
    3、未检查或无需检验的，仅填检验结果栏。
  </>;
};
export const 静态刚度= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  // const theme = useTheme();
  //底下<DirectLink 也被<React.Fragment key={i}>所限制掉。需要单独加上。
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录9  C4.3.2.5 主梁静态刚度、C4.4.2.4主梁跨中上拱度和有效悬臂处上翘度测量记录</Text>
    <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
    }}>单位：mm</Text>
    <Table  css={ {borderCollapse: 'collapse' } }>
      <TableBody>
        <TableRow>
          <CCell>
            <SimpleImg url={Img_Jgd}/>
          </CCell>
        </TableRow>
      </TableBody>
    </Table>
    <Table  fixed={["13%","%","12%","12%","12%","12%","12%"]}   css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell>测量工况</CCell>
          <CCell>测量点</CCell>
          <CCell>D</CCell>
          <CCell>A</CCell>
          <CCell>C</CCell>
          <CCell>B</CCell>
          <CCell>E</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Stiffness#Stiffness`}>
          { [['主梁1','载标高1'],['主梁2','载标高2']].map(([title,field], i:number) => {
            return <TableRow key={i}>
                {i===0 && <CCell rowSpan={2}>空载标高h(静载试验后)</CCell>}
                <CCell>{title}</CCell>
                <CCell>{orc?.[field]?.d}</CCell>
                <CCell>{orc?.[field]?.a}</CCell>
                <CCell>{orc?.[field]?.C}</CCell>
                <CCell>{orc?.[field]?.b}</CCell>
                <CCell>{orc?.[field]?.e}</CCell>
              </TableRow>;
          }) }
          { [['额载标高h\'','额载标'],['额载C（D E)点变形量△h','额载变'],['上拱度和上翘度','上拱翘']].map(([title,field], i:number) => {
            return <React.Fragment key={i}>
              <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Stiffness#Stiffness`}>
              { [['主梁1','1'],['主梁2','2']].map(([point,tag], g:number) => {
                return <TableRow key={g}>
                  {g===0 && <CCell rowSpan={2}>{title}</CCell>}
                  <CCell>{point}</CCell>
                  <CCell>{orc?.[field+tag]?.d}</CCell>
                  <CCell>/</CCell>
                  <CCell>{orc?.[field+tag]?.C}</CCell>
                  <CCell>/</CCell>
                  <CCell>{orc?.[field+tag]?.e}</CCell>
                </TableRow>;
              }) }
              </DirectLink>
            </React.Fragment>;
          }) }
          { [['C4.3.2.5','要静刚','静刚度要求值'],['C4.4.2.4','要上拱','上拱度和上翘度要求值']].map(([title,field,desc], i:number) => {
            return <React.Fragment key={i}>
              <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Stiffness#Stiffness`}>
                <TableRow>
                  <CCell rowSpan={2}>{title}</CCell>
                  <CCell>{desc}</CCell>
                  <CCell>{orc?.[field]?.d}</CCell>
                  <CCell>/</CCell>
                  <CCell>{orc?.[field]?.C}</CCell>
                  <CCell>/</CCell>
                  <CCell>{orc?.[field]?.e}</CCell>
                </TableRow>
                <TableRow>
                  <CCell>检验结果</CCell>
                  <CCell colSpan={5}>{orc?.[field+'r']}</CCell>
                </TableRow>
              </DirectLink>
            </React.Fragment>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={6}>{ multilines2Html(orc.静刚备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、h、h' 为各相应测点的相应测点的相对标高读数，标尺读数小的一端朝下。<br/>
    2、对于产品标准和设计文件同时对静态刚度、上拱度或上翘度上都有规定的，以较严规定作为检验结果判定依据。对于标准和设计文件都没有规定的，相应的项目可不测量。<br/>
    3、对于C4.4.2.4，以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。<br/>
    4、未检查或无需检验的，仅填检验结果栏。
  </>;
};

export const 漏磁检查= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录10：C4.9.8.1漏磁检查记录表</Text>
    <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
    }}>单位：Gs</Text>
    <Table printColWidth={ ["1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          {config漏磁检.map(([title,_2,_1], i:number) => {
            return <CCell key={i}>{title}</CCell>;
          }) }
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Magnetic#Magnetic`}>
          {(orc.漏磁表??[{}])?.map((o: any, i:number) => {
            return (
                <TableRow key={i}>
                  <CCell>{o?.n}</CCell>
                  <CCell>{o?.l}</CCell>
                  <CCell>{o?.m}</CCell>
                  <CCell>{o?.R}</CCell>
                  <CCell>{o?.r}</CCell>
                  {i===0 && <CCell rowSpan={orc.漏磁表?.length}>{orc.漏磁表r}</CCell>}
                </TableRow>
            );
          }) }

          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={5}>{ multilines2Html(orc.漏磁备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：未检查或无需检验的，仅填检验结果栏。
  </>;
};
export const 现场条件= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  const recNums=orc?.检验条件?.length;
  const blocks=Math.ceil(recNums/5) || 1;     //固定的5个日期汇集打印的一行。 不能用  | 1 是数学合并？
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录11：现场检验条件确认</Text>
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
          const dateE=orc?.检验条件?.[b*5 +d];
          condit1.push(<CCell key={b*5 +d}>{orc?.环境?.[dateE]}</CCell>);
          condit2.push(<CCell key={b*5 +d}>{orc?.易燃?.[dateE]}</CCell>);
          dates.push(<CCell key={b*5 +d}>{dateE}</CCell>);
        }
      });
      return  <Table key={b}  printColWidth={ ["1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
      <TableHead>
        <TableRow>
          <CCell colSpan={2}>现场检验条件</CCell>
          <CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell><CCell>确认结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
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
        </DirectLink>
      </TableBody>
    </Table>;
    }) }

    注：每次到现场后，在检验前应对检验条件进行确认，只有确认所有与检验相关的条件满足检验要求时，才能开始开展检验工作。
  </>;
};
export const 附设装置= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string, rep: any}
) => {
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>附录12   C3.4附设装置检验项目</Text>
    {(orc.附设表??[{}])?.map((o: any, i:number) => {
      return <React.Fragment key={i}>
        附表12-{o?.n} {o?.y}
        <Table  key={i} fixed={ ["1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
          <TableBody>
            <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Magnetic#Magnetic`}>
              <TableRow>
                <CCell colSpan={2}>设备名称</CCell>
                <CCell>{o?.t}</CCell>
                <CCell>设备型号</CCell>
                <CCell colSpan={2}>{o?.m}</CCell>
              </TableRow>
              <TableRow>
                <CCell colSpan={2}>额定起重量</CCell>
                <CCell>{o?.Q} t</CCell>
                <CCell>产品编号</CCell>
                <CCell colSpan={2}>{o?.p}</CCell>
              </TableRow>
              <TableRow>
                <CCell colSpan={2}>制造单位</CCell>
                <CCell colSpan={4}>{o?.u}</CCell>
              </TableRow>
              <TableRow><CCell>序号</CCell><CCell colSpan={4}>检验内容</CCell><CCell>检验结果</CCell></TableRow>
              { o?.y==='升降机等登机设备' ? <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Magnetic#Magnetic`}>
                    <TableRow><CCell>1</CCell><Cell colSpan={4}>金属结构无明显可见的损伤、缺陷。</Cell>
                      <CCell rowSpan={4}>{o?.r}</CCell>
                    </TableRow>
                    <TableRow><CCell>2</CCell><Cell colSpan={4}>吊笼门应当能够完全遮蔽开口，并且配备机械锁在运行状态下门不能被打开；所有吊笼门都处于关闭位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                    <TableRow><CCell>3</CCell><Cell colSpan={4}>层门应与吊笼电气或机械联锁，只有在吊笼底板在登机平台时，该平台的层门方可打开。所有层门处于关闭和锁紧位置时，吊笼才能启动和保持运行。</Cell></TableRow>
                    <TableRow><CCell>4</CCell><Cell colSpan={4}>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；限位开关、极限开关等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                  </DirectLink>
                  :
                  <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Magnetic#Magnetic`}>
                    <TableRow><CCell>1</CCell><Cell colSpan={4}>金属结构无明显可见的损伤、缺陷。</Cell>
                      <CCell rowSpan={3}>{o?.r}</CCell>
                    </TableRow>
                    <TableRow><CCell>2</CCell><Cell colSpan={4}>各主要零部件和电气设备无明显可见的损伤、缺陷。</Cell></TableRow>
                    <TableRow><CCell>3</CCell><Cell colSpan={4}>空载试验，操纵系统动作可靠、准确，各机构运行正常，无异常噪声等现象；起升高度限位、运行行程限位、幅度限位等安全保护装置动作可靠、准确。急停开关功能正常。</Cell></TableRow>
                  </DirectLink>
              }
              <TableRow>
                <CCell>备注</CCell>
                <Cell colSpan={5}>{ multilines2Html(o?.Z,  (txt,i)=>{
                  return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                } ) }</Cell>
              </TableRow>
            </DirectLink>
          </TableBody>
        </Table>
      </React.Fragment>;
    }) }
    注：对于附表12三个表，无需检验的，仅填检验结果栏。可另附表单。
  </>;
};
/**正式报告用的 */
export const 报告设备详情= ( { orc,  repId, verId, rep } : { orc: any,repId: string,verId: string,rep:any}
) => {
  const theme= useTheme();
  return <React.Fragment>
      <Table id={'Survey'} printColWidth={ ["6%","12%","33%","16%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
        <TableBody>
          <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Survey#Survey`}>
            <TableRow>
              <CCell colSpan={2}>使用单位</CCell><CCell colSpan={3}>{orc?.使用单位}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>使用单位地址</CCell><CCell colSpan={3}>{orc?.使用单位地址}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>使用单位统一社会信用代码</CCell><CCell>{orc?.使用单位信用码}</CCell>
              <CCell>使用单位安全管理人员</CCell><CCell>{orc?.安全员}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>联系电话</CCell><CCell>{orc?.使用单位电话}</CCell>
              <CCell>邮政编码</CCell><CCell>{orc?.使用单位邮编}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>制造单位</CCell><CCell colSpan={3}>{orc?.制造单位}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>改造单位</CCell><CCell colSpan={3}>{orc?.改造单位}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>重大修理单位</CCell><CCell colSpan={3}>{orc?.维修单位}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>设备类别</CCell><CCell>{eqpTypeAllMap.get(orc?.设备类别)}</CCell>
              <CCell>设备品种</CCell><CCell>{eqpTypeAllMap.get(orc.设备品种)}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>型号规格</CCell><CCell>{orc?.型号}</CCell>
              <CCell>设备代码</CCell><CCell>{orc.设备代码}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>产品编号</CCell><CCell>{orc?.出厂编号}</CCell>
              <CCell>单位内编号</CCell><CCell>{orc?.单位内部编号}</CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>投入使用日期</CCell><CCell>{orc?.投用日期}</CCell>
              <CCell>设计使用年限</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.设计年限}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>年</Text>
              </div></CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>制造日期</CCell><CCell>{orc?.制造日期}</CCell>
              <CCell></CCell><CCell></CCell>
            </TableRow>
            <TableRow>
              <CCell colSpan={2}>使用地点</CCell><CCell colSpan={3}>{orc?.设备使用地点}</CCell>
            </TableRow>
            <TableRow>
              <CCell rowSpan={5}>性能参数</CCell>
              <CCell>跨度</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.跨度}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m</Text>
              </div></CCell>
              <CCell>生产率</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.生产率}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t/h</Text>
              </div></CCell>
            </TableRow>
            <TableRow>
              <CCell>额定起重量</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.额定起重量}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>t</Text>
              </div></CCell>
              <CCell>工作级别</CCell><CCell>{orc?.工作级别}</CCell>
            </TableRow>
            <TableRow>
              <CCell>起升高度</CCell>
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
              <CCell>起重机械运行速度</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.速度}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text>
              </div></CCell>
              <CCell>小车运行速度</CCell>
              <CCell><div css={{ display: 'flex',justifyContent: 'space-around',alignItems: 'center'}}>
                <Text >{orc?.起升速}</Text>
                <Text css={{ [theme.mediaQueries.lg+', print']: {wordBreak: 'keep-all'} }}>m/min</Text>
              </div></CCell>
            </TableRow>
            <TableRow>
              <CCell>其他主要参数</CCell><CCell colSpan={3}>{orc?.其他参数}</CCell>
            </TableRow>
            <TableRow>
              <CCell>检验依据</CCell><CCell colSpan={4}>《起重机械安全技术规程》（TSG 51-2023）</CCell>
            </TableRow>
          </DirectLink>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={4}>{orc?.检验结论}</CCell>
          </TableRow>
          <TableRow>
            <CCell>备注</CCell><CCell colSpan={4}>{orc?.概备注}</CCell>
          </TableRow>
        </TableBody>
      </Table>

    {检验编制核准D({orc,rep})}
  </React.Fragment>;
};
