/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {calcAverageArrObj, floatInterception} from "../../../common/tool";
import {defaultTl起重量, item起重量o,} from "./editWeight";

export const WeightCorrespondVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
  const titles=defaultTl起重量;
  let arrobj回: any[]=[];
  for(let e=0;e<3;e++){
    arrobj回.push({d: orc?.回速o?.[e], t:orc?.回速v?.[e]});
  }
  return <>
    <div id={'WeightCorrespond'} css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
    </div>
    <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }  tight  miniw={800}
               css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} } >
      <TableHead>
        <TableRow>
          <CCell colSpan={2}>项目</CCell>
          <CCell>次数</CCell>
          <CCell>距离(m)</CCell>
          <CCell>时间(min)</CCell>
          <CCell>速度(m/min)</CCell>
          <CCell>平均速度(m/min)</CCell>
          <CCell>检验结果</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { item起重量o.map((field, i:number) => {
          if(i===item起重量o.length-1)   return null;      //最后一个移出去
          let arrobj: any[]=[];
          for(let e=0;e<3;e++){
            arrobj.push({d: orc?.[field+'o']?.[e], t:orc?.[field+'v']?.[e]});
          }
          return  <React.Fragment key={i}>
            <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/WeightCorrespond?original=1#WeightCorrespond`}>
              { (new Array(3)).fill(null).map(( _,  w:number) => {
                const itspd=orc?.[field+'o']?.[w]/orc?.[field+'v']?.[w];
                return  <TableRow key={w}>
                  {w===0 && <CCell rowSpan={3} colSpan={2}>{titles[i]}</CCell>}
                  <CCell>{w+1}</CCell>
                  <CCell>{orc?.[field+'o']?.[w]}</CCell>
                  <CCell>{orc?.[field+'v']?.[w]}</CCell>
                  <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
                  {w===0 && <CCell rowSpan={3}>{calcAverageArrObj(arrobj,(row)=>{return row?.d/row?.t},2,3)}</CCell>}
                  {w===0 && <CCell rowSpan={3}>{orc?.[field+'r'] || '／'}</CCell>}
                </TableRow>;
              }) }
            </DirectLink>
          </React.Fragment>;
        }) }
      </TableBody>
    </Table>
    <Table fixed={ ["7%","%","6%","17%","12%","13%","13%","9%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/WeightCorrespond?original=1#WeightCorrespond`}>
          <TableRow>
            <CCell rowSpan={4} colSpan={2}>{titles[item起重量o.length-1]}</CCell>
            <CCell>次数</CCell>
            <CCell>圈数(r)</CCell>
            <CCell>时间(min)</CCell>
            <CCell>速度(r/min)</CCell>
            <CCell>平均速度(r/min)</CCell>
            <CCell>检验结果</CCell>
          </TableRow>
          { (new Array(3)).fill(null).map(( _,  w:number) => {
            const itspd=orc?.回速o?.[w]/orc?.回速v?.[w];      //最后一行特殊的
            return  <TableRow key={w}>
              <CCell>{w+1}</CCell>
              <CCell>{orc?.回速o?.[w]}</CCell>
              <CCell>{orc?.回速v?.[w]}</CCell>
              <CCell>{!isNaN(itspd) && floatInterception(itspd,2)}</CCell>
              {w===0 && <CCell rowSpan={3}>{calcAverageArrObj(arrobj回,(row)=>{return row?.d/row?.t},2,3)}</CCell>}
              {w===0 && <CCell rowSpan={3}>{orc?.回速r || '／'}</CCell>}
            </TableRow>;
          }) }
          <TableRow id={'WeightCorrespondM'}>
            <CCell>备注</CCell>
            <Cell colSpan={7}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.重量备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    {children}
    <Text css={{fontSize:'0.8rem'}}>
      注：1、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没
      有规定的，相应的速度可不测量。
      2、具有多挡变速的起升机构，每挡速度允许的额定起重量，测量每挡工作速度，表格不够记录时，在备注栏记录。对于多起升机构或多小车运行机构
      的起重机，其余起升机构和小车运行机构的速度测量值，记录在备注栏。
      3、起升机构应具有慢速下降功能，慢降速度根据服务需求确定，但不大于9 m/min。
      4、对设计规定不能带载变幅的动臂式塔机，可不按本表规定进行带载变幅试验。
      5、对可变速的其他机构，应进行试验并测量各挡工作速度，在备注栏记录。
      6、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
      7、未检查或无需检验的，仅填检验结果栏。
    </Text>
  </>;
};

//用Hash # #WeightCorrespondM 做导航显示模式，只能针对单一一个牟点位置，不能保证HarfFrame的左边和右边页面都能滚动到标签位置的。只能有一个生效。
