/** @jsxImportSource @emotion/react */
import * as React from "react";
import { Cell, Table,  Text, useTheme,} from "customize-easy-ui-component";
import {DirectLink,} from "../../routing/Link";
import {multilines2Html,} from "../tools";
import {calcAverageArrObj, floatInterception,} from "../../common/tool";
import {useMeasureCTable} from "../hook/useMeasureOldVer";
import {config梯子, defaultTl机构速度, items漏磁检} from "./editor";
import {RepLink} from "../common/base";
import {usePrefixDataTable} from "../hook/usePrefixData";
import {useMeasureTable} from "../hook/useMeasure";
import {PrintReserveLeast} from "@/components/print-reserve-least";
import {CCell, FlexibleTable, TableBody, TableHeader, TableRow,TableCell} from "@/components/flexible-table";

/**格式化记录或报告 对应编辑器Thickness
* */
export const 受力结构件厚度= ( { orc, rep,label } : { orc: any, rep: any,label:string}
) => {
  const aveThick=calcAverageArrObj([orc?.力面厚1o,orc?.力面厚2o,orc?.力面厚3o],(row)=>row,2);
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={ ["6%","%","6%","13%","9%","9%","8%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
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
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Thickness#Thickness`}>
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
    注：对于不合格的值才需测量和记录，仅记录有效厚度与设计值之比最小值之处的测量值。
  </>;
};
export const 梯子走台栏杆= ({ orc, rep, label } : { orc: any, rep: any, label:string}
) => {
  const renderMeasure=useMeasureCTable({rep, orc, config: config梯子});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={ ["4%","8%","17%","%","6%","13%","9%","6%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.6rem'}}>序号</Text></CCell><CCell colSpan={3}>检验项目</CCell><CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验结果</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Ladder#Ladder`}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={7}>{ multilines2Html(orc.梯子备注,  (txt,i)=>{
              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
            } ) }</Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    注：1、对于不合格的值才需测量和记录，未测量或无需测量的观测值和结果值栏可不填，检验结果栏都需填。<br/>
    2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
  </>;
};

/**格式化记录或报告用：也不用表头，底下有嵌套表的特殊一行的样子的避免产生 怪异两个的表头行。
 * 存储也不同于上一代版本的通用的表格保存模式。   @ ？计算结果小数点修正规则注入 》参数=对应一套规定。
 * */
export const 机构运行速度= ({ orc,  rep, titles=defaultTl机构速度 }
                                : { orc: any, rep: any, titles?:any[]}
) => {
  let arrobj回: any[]=[];
  for(let e=0;e<3;e++){
    arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
  }
  //const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);上一代(orc.吊回速??[{}])?.map((o: any, i:number) => {}
  return <>
    <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableBody>
        <TableRow>
          <CCell colSpan={2}>项目</CCell>
          <CCell>次数</CCell>
          <CCell>距离(m)</CCell>
          <CCell>时间(min)</CCell>
          <CCell>速度(m/min)</CCell>
          <CCell>平均速度(m/min)</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
         { ['起速','下速','横速','纵速'].map((field, i:number) => {
            let arrobj: any[]=[];
            for(let e=0;e<3;e++){
              arrobj.push({d: orc?.[field+'o']?.[e], t:orc?.[field+'v']?.[e]});
            }
            return  <React.Fragment key={i}>
              <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/MoveSpeed#MoveSpeed`}>
                { (new Array(3)).fill(null).map(( _,  w:number) => {
                  const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
                  return  <TableRow key={w}>
                      {w===0 && <CCell rowSpan={3} colSpan={2}>{titles[i]}</CCell>}
                      <CCell>{w+1}</CCell>
                      <CCell>{orc?.[field+'o']?.[w]}</CCell>
                      <CCell>{orc?.[field+'v']?.[w]}</CCell>
                      <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                      {w===0 && <CCell rowSpan={3}>{calcAverageArrObj(arrobj,(row)=>{return row?.d/row?.t},2,3)}</CCell>}
                      {w===0 && <CCell rowSpan={3}>{orc?.[field+'r']}</CCell>}
                    </TableRow>;
                }) }
              </DirectLink>
            </React.Fragment>;
         }) }
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/MoveSpeed#MoveSpeed`}>
            <TableRow>
              <CCell rowSpan={4} colSpan={2}>{titles[4]}</CCell>
              <CCell>次数</CCell>
              <CCell>圈数(r)</CCell>
              <CCell>时间(min)</CCell>
              <CCell>速度(r/min)</CCell>
              <CCell>平均速度(r/min)</CCell>
              <CCell>检验结果</CCell>
            </TableRow>
            { (new Array(3)).fill(null).map(( _,  w:number) => {
              const itspd=orc?.回速o?.[w]/orc?.回速v?.[w];
              return  <TableRow key={w}>
                <CCell>{w+1}</CCell>
                <CCell>{orc?.回速o?.[w]}</CCell>
                <CCell>{orc?.回速v?.[w]}</CCell>
                <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                {w===0 && <CCell rowSpan={3}>{calcAverageArrObj(arrobj回,(row)=>{return row?.d/row?.t},2,3)}</CCell>}
                {w===0 && <CCell rowSpan={3}>{orc?.回速r}</CCell>}
              </TableRow>;
            }) }
            <TableRow>
              <CCell>备注</CCell>
              <Cell colSpan={7}>{ multilines2Html(orc.速度备注,  (txt,i)=>{
                return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
              } ) }</Cell>
            </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
  </>;
};

/**格式化记录或报告：漏磁检查记录
 * */
export const 漏磁检查记录= ({ orc,  rep, titles=defaultTl机构速度, label='附录10：C4.9.8.1漏磁检查记录表' }
                  : { orc: any, rep: any, titles?:any[], label?:any}
) => {
  const theme= useTheme();
  let arrobj回: any[]=[];
  for(let e=0;e<3;e++){
    arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
  }
  //const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);上一代(orc.吊回速??[{}])?.map((o: any, i:number) => {}
  return <>
  <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
    <div css={{display: 'flex',marginTop: '1rem',justifyContent:'space-between',alignItems:'flex-end'}}>
      <Text id='MagneticLeak' variant="h4">{label!}</Text>
      <Text>单位：Gs</Text>
    </div>
  </div>
  <Table fixed={ ["%","17%","17%","17%","17%","9%"] }
            tight miniw={800} css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}}}>
      <TableBody>
        <TableRow>
          <CCell>磁场强度</CCell>
          <CCell>左端</CCell>
          <CCell>中间</CCell>
          <CCell>右端</CCell>
          <CCell>结果值</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
        <RepLink ori rep={rep} tag={'MagneticLeak'}>
          { items漏磁检.map(( [title,field],  w:number) => {
            // const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
            return  <TableRow key={w}>
              <CCell>{title}</CCell>
              <CCell>{orc?.[field]?.[0]}</CCell>
              <CCell>{orc?.[field]?.[1]}</CCell>
              <CCell>{orc?.[field]?.[2]}</CCell>
              <CCell>{calcAverageArrObj(orc?.[field],a=>a,1,3)}</CCell>
              {w===0 && <CCell rowSpan={3}>{orc?.漏磁检r}</CCell>}
            </TableRow>;
          }) }
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={5}>
              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.漏磁备注 || '／'}
              </div>
            </Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
  </>;
};
/*类似 WitnessMemoVw 的：
* */
export const 技术资料见证= ({ orc,  rep, }: { orc: any, rep: any,}
) => {
  return <Table fixed={["5%","10%","%","26%"]}  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <RepLink ori rep={rep} tag={'Witness'}>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>代号</CCell>
          <CCell>名称</CCell>
          <CCell>编号</CCell>
        </TableRow>
        </RepLink>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Witness'}>
        { orc?.见证表?.map((o: any, i: number) => {
          if(JSON.stringify(o)==='{}' )  return null;
          else return (
              <TableRow key={i}>
                <CCell>{i+1}</CCell>
                <CCell>{o?.no}</CCell>
                <CCell>{o?.ti}</CCell>
                <CCell>{o?.bh}</CCell>
              </TableRow>
          );
        } ) }
        </RepLink>
      </TableBody>
    </Table>;
};
export const 记事的= ({ orc,  rep, }: { orc: any, rep: any,}
) => {
  return <Table fixed={["5%","%","23%","32%"]}  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <RepLink ori rep={rep} tag={'Witness'}>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>名称</CCell>
          <CCell>编号</CCell>
          <CCell>备注</CCell>
        </TableRow>
        </RepLink>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'Witness'}>
        { orc?.记事表?.map((o: any, i: number) => {
          if(JSON.stringify(o)==='{}' )  return null;
          else return (
              <TableRow key={i}>
                <CCell>{i+1}</CCell>
                <CCell>{o?.nm}</CCell>
                <CCell>{o?.bh}</CCell>
                <CCell>{o?.mo}</CCell>
              </TableRow>
          );
        } ) }
        </RepLink>
      </TableBody>
    </Table>;
};

/**简易版本的：设备概况,格式化版本原始记录：适合1-2俩列的设备概况布局。
 * 原来的 return <> {  不能够支持点击出发。
 * */
export const 俩列检验设备概况= ( { orc,rep, repId, verId,config} : { orc: any,rep: any,repId?: string,verId?: string,config:any[][][]}
) => {
  const theme= useTheme();
  //上级组件若嵌套<DirectLink 也无法渗透 config?.map < />；
  return config?.map(([[desc,name,cb],add2p] : any, i:number)=> {
        const [desc2,name2,cb2]= add2p||[];
        //<CCell colSpan={desc2? 1 : 3}>{typeof desc==='string'? name: desc?.view(orc)}</CCell>  '见附录13'
        //附加单位的两个形式：第三位置自带单位的， 或第二对象内部u字段指明单位。
        // console.log("检验设备情况3 faxian=", name2,'sdfds',typeof orc?.[name2]);
        const tailUnit1=typeof cb==='string'? cb : (typeof name==='object' && name.u)? name.u:undefined;
        const txtnode1=cb&&cb.view? cb.view(orc,rep) :
            typeof name==='string'? (name?.startsWith('_$')? orc?.[name.substring(2)] : (orc?.[name] || '／')) :
                name.r? name.r :
                    name.t==='b'? (orc?.[name.n]? '是':'否') :
                            name.t==='m'?
                                <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap',textAlign: 'left'}}>
                                  {orc?.[name.n] || '／'}
                                </div>
                                :
                                (orc?.[name.n] || '／');
        const tailUnit2=!desc2? undefined :
            typeof cb2==='string'? cb2 : (typeof name2==='object' && name2.u)? name2.u:undefined;
        const txtnode2=!desc2? undefined :
            cb2&&cb2.view? cb2.view(orc,rep) :
                typeof name2==='string'? (name2?.startsWith('_$')? orc?.[name2.substring(2)] : (orc?.[name2] || '／')) :
                    name2.r? name2.r :
                        name2.t==='b'? (orc?.[name2.n]? '是':'否') :
                            (orc?.[name2.n] || '／');
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
              <CCell>{typeof desc2==='string'? desc2: desc2?.view(orc)}</CCell>
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
      });
};

//在原始记录使用的：
export const 设备概况页 = ({orc, rep, config, fixed = ["4.2%", "12.1%", "39%", "9%", "11.1%", "%"],fromHead,label}
                           : {orc: any, rep: any, config: any[], fixed?: string[],fromHead?:boolean,label:any }
) => {
  const renderUpper = usePrefixDataTable({config, orc, rep, slash: true});
  return <PrintReserveLeast fromHead={fromHead} reserve="8rem"
                            title={ <RepLink rep={rep} ori tag="Survey">
                              <h2 className={`text-2xl ${!fromHead ? 'mt-4' : ''}`}>
                                {label}
                              </h2>
                            </RepLink>
                            }>
    <FlexibleTable id="Survey" columnWidths={fixed}>
      <TableBody>
        <RepLink rep={rep} ori tag="Survey">
          {renderUpper}
        </RepLink>
      </TableBody>
    </FlexibleTable>
  </PrintReserveLeast>
}


export const 技术见证Park = ({orc, rep, bhTil = '备注', fixed = ["5%", "10%", "%", "26%"]}: {
                               orc: any,
                               rep: any,
                               bhTil?: string,
                               fixed?: string[]
                             }
) => {
  return <RepLink rep={rep} tag={'Witness'}>
    <Table fixed={fixed} css={{borderCollapse: 'collapse'}} tight miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>序号</CCell>
          <CCell>代号</CCell>
          <CCell>名称</CCell>
          <CCell>{bhTil}</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orc?.见证表?.map((o: any, i: number) => {
          if (JSON.stringify(o) === '{}') return null;
          else return (
              <TableRow key={i}>
                <CCell>{i + 1}</CCell>
                <CCell>{o?.no}</CCell>
                <CCell>{o?.ti}</CCell>
                <CCell>{o?.bh}</CCell>
              </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </RepLink>;
};
//对比的：<RouterLink 可以导航文本处鼠标和点过链接颜色变但是表格鼠标不变，不能放在表格内。 改<DirectLink的。？ 非正常 使用 hook报错?
//比较通用的【附录1 观测值及测量结果记录表】： 项目编号， 单位， 判定，备注；
export const 测量记录Park = ({orc, rep, label, config,
                               fixed = ["3%", "8%", "13%", "%", "20%", "5%", "10%", "8%", "6%"],
                               tag = 'Measure', children
                             }: {
                               orc: any, rep: any, label: string, config: any[], fixed?: string[], tag?: string, children?: any
                             }
) => {
  const renderMeasure = useMeasureTable({rep, orc, config});
  return <>
    <Text variant="h4" css={{
      marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={fixed} css={{borderCollapse: 'collapse'}} tight miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize: '0.7rem'}}>序号</Text></CCell><CCell><Text
            css={{fontSize: '0.7rem'}}>项目编号</Text></CCell><CCell colSpan={3}>检验项目</CCell>
          <CCell>单位</CCell><CCell>观测值</CCell><CCell>结果值</CCell><CCell><Text
            css={{fontSize: '0.75rem'}}>检验结果</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/${tag}?original=1#${tag}`}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}>
              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.观测备注 || '／'}
              </div>
            </Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    {children}
  </>;
};
