/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {DirectLink,} from "../../../routing/Link";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {RepLink,} from "../../common/base";
import {calcAverageArrObj, floatInterception} from "../../../common/tool";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {检验编制核准Gant} from "../../gantry/rarelyVary";
import {defaultTl机构速度} from "../editor";
import {useThreeColumnView} from "../../hook/useThreeColumnSubr";
import {render子设备型, render设备类别} from "../../common/render";


const render设备品种={
  view:(orc:any)=><>{eqpTypeAllMap.get(orc?.设备品种)}</>,
};
//仅在正式报告用，而非原始记录采用的：无需纳入编辑器检查；
const config设备 = [
  [['使用单位', '_$使用单位']],
  [['使用单位地址', '_$使用单位地址']],
  [['使用单位统一社会信用代码', '_$使用单位信用码'], ['使用单位安全管理人员', '安全员']],
  [['联系电话', '安全员电'], ['邮政编码', '_$使用单位邮编'] ],
  [['制造单位', '_$制造单位']],
  [['改造单位','_$改造单位']],
  [['重大修理单位','_$维修单位']],
  [['设备类别', '_$设备类别',render设备类别], ['设备品种', '_$设备品种',render设备品种], ],
  [['型号规格', '_$型号'], ['设备代码','_$设备代码'], ],
  [['产品编号', '_$出厂编号'], ['单位内编号','_$单位内部编号'] ],
  [['投入使用日期', '_$投用日期'], ['设计使用年限', '_$设计年限', '年']],
  [['使用地点', '_$设备使用地点'],  ],
  [['工作条件', {n: '操纵方式', t: 'l', }], ['设备型号', '设备型']],
  [['停车设备类型', '_$子设备品种',render子设备型]],
    //性能参数
  [['层数', '_$电梯层数','层'], ['存容量', '_$泊位数量','辆']],
  [['适停汽车质量', '_$适停车质量', 'kg'], ['适停汽车尺寸(长×宽×高)', '_$适停尺寸','mm']],
  [['额定升降速度', '_$额升降速度', 'm/min'], ['额定运行速度', '_$额定速度', 'm/min']],
  [['其他主要参数', {n: '其他参数', t: 'm'}] ],
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 14);
const config设备下=config设备.slice(14);

export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                            embedCol: [ <CCell rowSpan={4}>性能参数</CCell> ]});
  //const renderMiddle=useThreeColumnView({config: config设备下, orc, slash:true, embedCol: { 0:  <CCell rowSpan={4}>性能参数</CCell>, },});
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","10%","48%","6.4%","4%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","12.7%","18%","9%","12.2%","10%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={5}>《起重机械安全技术规程》（TSG 51-2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.概备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    {检验编制核准Gant({orc,rep})}
  </React.Fragment>;
};

/**格式化记录或报告用：也不用表头，底下有嵌套表的特殊一行的样子的避免产生 怪异两个的表头行。
 * 存储也不同于上一代版本的通用的表格保存模式。   @ ？计算结果小数点修正规则注入 》参数=对应一套规定。
 * 可titles不能随意改，第5个明确的；
 * */
export const 机构运行速度= ({ orc,  rep, titles=defaultTl机构速度,label='附录4：C4.3.2.1各机构运行速度记录表',children }
                                : { orc: any, rep: any, titles?:any[],label?:any, children?:any}
) => {
  let arrobj回: any[]=[];
  for(let e=0;e<3;e++){
    arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
  }
  //const avspeed5=calcAverageArrObj(orc.吊回速,(row)=>{return row?.d/row?.t},2);上一代(orc.吊回速??[{}])?.map((o: any, i:number) => {}
  return <>
    <div css={{"@media print": {paddingBottom: '4rem', pageBreakInside: 'avoid'}}}>
      <Text id={'MoveSpeed'} variant="h4" css={{marginTop: '1rem',
      }}>{label}</Text>
    </div>
    <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }
              css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4rem'}}} tight miniw={800}>
      <TableBody>
        <RepLink ori rep={rep} tag={'MoveSpeed'}>
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
            </React.Fragment>;
          }) }
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
            <Cell split={true} colSpan={7}>
              <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.速度备注 || '／'}
              </div>
            </Cell>
          </TableRow>
       </RepLink>
      </TableBody>
    </Table>
    {children ? children
         :
        <Text css={{fontSize:'0.8rem'}}>
          注：1、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对
          速度允许偏差都没有规定的，相应的速度可不测量。
          2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。若机构有其他速度需要测量且不符合规定的，应在备注栏中填写。
        </Text>
    }
  </>;
};
