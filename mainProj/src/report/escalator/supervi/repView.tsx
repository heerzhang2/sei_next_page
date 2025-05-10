/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, Cell, TableHead,
} from "customize-easy-ui-component";
import { DirectLink, } from "../../../routing/Link";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {CCellUnit, RepLink,} from "../../common/base";
import {检验设备结论Sund} from "../../elevator/sundryDj/viewRes";
import {useJudgmentTable, useJudgmentTableX} from "../../hook/useJudgment";
import {floatInterception} from "../../../common/tool";
import {useOmnipotentPref} from "../../hook/useOmnipotentPref";
import {item监控设施} from "./editor";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {useThreeRaftSurveyTbl} from "../../hook/useThreeRaft";
import {businessCatspMap} from "@/common/sei";


const render设备品种={
  view:(orc:any)=><>{eqpTypeAllMap.get(orc?.设备品种)}</>,
};
export const render施工类别={
  view:(orc:any,parentOrc:any,rep:any)=><>{businessCatspMap.get(rep?.isp?.bsType!)}</>,
  //edit: (inp, setinp)=>{} 编辑器组件的。
};
//不用台账的： 维修单位 改造单位 安装单位
const render施工单位={
  view:(orc:any)=><>{'重大修理'===orc.检验类别? orc.大修单 :
              '改造监检'===orc.检验类别? orc.改造单 :
              orc.安装单}</>,
};

//仅在正式报告用，而非原始记录采用的：
const config设备 = [
  [['使用单位名称', '_$使用单位'], ['统一社会信用代码', '_$使用单位信用码'], ],
  [['安装地点', '_$设备使用地点'],  ],
  [['设备品种', '_$设备品种',render设备品种], ['产品型号', '_$型号'],  ],
  [['产品编号', '_$出厂编号'], ['制造日期', '_$制造日期'] ],
  [['设备代码','_$设备代码'],  ['施工类别', {}, render施工类别], ],
  [['使用登记证编号', '_$使用证号'],  ['单位内编号','_$单位内部编号'], ],
  [['施工单位名称','_$施工类别',render施工单位], ],
  [['制造单位名称', '_$制造单位'] ],
  [['维护保养单位名称','_$维保单位'] ],
    //设备技术参数
  [['名义速度', '_$运行速度', 'm/s'], ['名义宽度', '_$名义宽度', 'mm'], ['倾斜角', '_$倾斜角度', '°'] ],
  [['输送能力', {n:'输送能',u:'P/h'}, ],  ['提升高度', '_$提升高度', 'm'], ['使用区段长度', '_$使用区长度', 'm'] ],
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 9);
const config设备下=config设备.slice(9);

export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const renderMiddle=useThreeRaftSurveyTbl({config: config设备下, orc, rep, slash:true,
                         embed: { 0:  <CCell rowSpan={2}>设备技术参数</CCell>,  },});
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","10%","48%","6.4%","4%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey#Survey`}>
          {renderUpper}
        </DirectLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","9%","23%","9%","24%","12.1%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        {renderMiddle}
        <TableRow>
          <CCell colSpan={2}>检验依据</CCell>
          <CCell colSpan={5}>《电梯监督检验和定期检验规则》（TSG T7001—2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '3rem', whiteSpace: 'pre-wrap'}}>
              {orc.大备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    {检验设备结论Sund({theme, orc,rep})}
  </React.Fragment>;
};

//【测量表】需拆分成三个编辑器的情况：测量表项目太多；Measure Measure2 Measure3路由标签
export const 测量记录三半= ({ orc, rep,label,config1,config2,config3,children,fixed=["2%", "5%", "3%", "6%", "%", "10.2%", "5%", "9%", "7%", "5%"],nseq,crit,tail}
               : {orc: any,rep: any,label:string,config1:any,config2:any,config3:any,fixed?:string[],children?:any,nseq?:boolean,crit?:boolean,tail?:any}
) => {
  const {rows: render1,seq}=useJudgmentTableX({rep,orc, config:config1});
  const {rows: render2,seq:seq2}=useJudgmentTableX({rep,orc, config:config2,seqOfs:seq});
  const render3=useJudgmentTable({rep,orc, config:config3,seqOfs:seq2});
  return <>
    <Text variant="h4" css={{marginTop: '1rem',
    }}>{label}</Text>
    <Table fixed={ fixed }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.8rem'}}>序号</Text></CCell><CCell colSpan={2}><Text css={{fontSize:'0.7rem'}}>项目编号</Text></CCell>
          <CCell colSpan={2}>检验内容与要求</CCell><CCell>检测项目</CCell><CCell>单位</CCell>
          <CCell>观测数据</CCell><CCell>测量结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结果判定</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Measure?original=1#Measure`}>
          {render1}
        </DirectLink>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Measure2?original=1#Measure2`}>
          {render2}
        </DirectLink>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Measure3?original=1#Measure3`}>
          {render3}
        </DirectLink>
      </TableBody>
    </Table>
    { tail }
  </>;
};

export const 扶手带速度偏差Jj= ({theme, orc, rep,label} :{theme: any, orc:any, rep:any,label:string}
) => {
  return <>
    <div css={{"@media print": {paddingBottom: '4.5rem', pageBreakInside: 'avoid'}}}>
      <Text id={'HandrailBias'} variant="h4" css={{
        marginTop: '1rem',
      }}>{label}</Text>
      <div css={{display: 'flex', justifyContent: 'space-between'}}>
        <Text>方法一：</Text>
        <Text></Text>
      </div>
    </div>
    <Table fixed={["20%", "27%", "12%", "13%", "%"]}
           css={{borderCollapse: 'collapse', "@media print": {marginTop: '-4.5rem'}}} tight miniw={800}>
      <TableBody>
        <RepLink ori rep={rep} tag={'HandrailBias'}>
          <TableRow><CCell>项目编号</CCell><CCell colSpan={4}>A2.3.2</CCell></TableRow>
          <TableRow><CCell>检验内容</CCell><CCell>实际运行距离S(mm)</CCell>
            <CCell
                colSpan={2}>左侧扶手带与梯级（踏板、胶带）错位距离Sl(mm)</CCell><CCell>右侧扶手带与梯级（踏板、胶带）错位距离Sr(mm)</CCell>
          </TableRow>
          <TableRow><CCell>上行观测数据</CCell><CCell>{orc.扶行距上 ?? '／'} mm</CCell>
            <CCell colSpan={2}>{orc.左错距上 ?? '／'} mm</CCell><CCell>{orc.右错距上 ?? '／'} mm</CCell>
          </TableRow>
          <TableRow><CCell>下行观测数据</CCell><CCell>{orc.扶行距下 ?? '／'} mm</CCell>
            <CCell colSpan={2}>{orc.左错距下 ?? '／'} mm</CCell><CCell>{orc.右错距下 ?? '／'} mm</CCell>
          </TableRow>
          <TableRow><CCell>计算结果</CCell><CCell colSpan={2}>左侧扶手带空载运行速度与梯级速度偏差δl （δl =100Sl /S）
            (%)</CCell>
            <CCell colSpan={2}>右侧扶手带空载运行速度与梯级速度偏差δr （δr =100Sr /S） (%)</CCell></TableRow>
          <TableRow><CCell>上行</CCell><CCell
              colSpan={2}>{floatInterception(100 * orc?.左错距上 / orc?.扶行距上, 2)} %</CCell>
            <CCell colSpan={2}>{floatInterception(100 * orc?.右错距上 / orc?.扶行距上, 2)} %</CCell>
          </TableRow>
          <TableRow><CCell>下行</CCell><CCell
              colSpan={2}>{floatInterception(100 * orc?.左错距下 / orc?.扶行距下, 2)} %</CCell>
            <CCell colSpan={2}>{floatInterception(100 * orc?.右错距下 / orc?.扶行距下, 2)} %</CCell>
          </TableRow>
          <TableRow><CCell>判断标准</CCell><CCell colSpan={4}>允许偏差为0～+2%</CCell></TableRow>
          <TableRow><CCell>结果判定</CCell><CCell colSpan={4}>{orc.扶速差r ?? '／'}</CCell></TableRow>
        </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize: '0.8rem'}}>
      备注：1.方法一与方法二只需选取一种；2.错位距离Sl 、Sr的判定，当扶手带超前于梯级（踏板、胶带）时为正值，反之为负值。
    </Text>
    <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}}}>
      <Text>方法二：</Text>
    </div>
    <Table fixed={["22%", "39%", "%"]}
           css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}}} tight miniw={800}>
      <TableBody>
        <RepLink ori rep={rep} tag={'HandrailBias'}>
          <TableRow><CCell>项目编号</CCell><CCell colSpan={2}>*A2.3.2</CCell></TableRow>
          <TableRow><CCell>采用专用测量仪器直接测量</CCell>
            <CCell>左侧扶手带空载运行速度与梯级速度偏差δl</CCell><CCell>右侧扶手带空载运行速度与梯级速度偏差δr</CCell></TableRow>
          <TableRow><CCell>上行</CCell><CCell>{orc?.仪左错上 ?? '／'} %</CCell><CCell>{orc?.仪右错上 ?? '／'} %</CCell></TableRow>
          <TableRow><CCell>下行</CCell><CCell>{orc?.仪左错下 ?? '／'} %</CCell><CCell>{orc?.仪右错下 ?? '／'} %</CCell></TableRow>
          <TableRow><CCell>判断标准</CCell><CCell colSpan={2}>允许偏差为0～+2%</CCell></TableRow>
          <TableRow><CCell>结果判定</CCell><CCell colSpan={2}>{orc.仪扶差r ?? '／'}</CCell></TableRow>
        </RepLink>
      </TableBody>
    </Table>
  </>;
};

const tailRender=(orc: any, name: string,index:number,unit:any)=><>
  { unit? <CCellUnit unit={unit}>{orc?.[name]?.r??'／'}</CCellUnit>
      :
      <CCell>{orc?.[name]?.r??'／'}</CCell>
  }
  <CCell>{orc?.[name]?.m??'／'}</CCell><CCell>{orc?.[name]?.d??'／'}</CCell>
</>;

export const 视频监控设施记录表= ({theme, orc, rep} :{theme: any, orc:any, rep:any}
) => {
  const [render]=useOmnipotentPref({orc, config:item监控设施,
          tailRender, pcols:1, noNo:false, unitCel:false});
  return <>
    <div css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
      <Text id='Macroscopic' variant="h4" css={{marginTop: '1rem',
      }}>附录C 视频监控设施、远程监测装置检查记录表</Text>
    </div>
    <Table fixed={ ["4%", "12%", "4%", "%", "7.5%","22%","9%"] } css={{borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}}} tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.75rem'}}>序号</Text></CCell><CCell>项目名称</CCell><CCell colSpan={2}>检验内容与要求</CCell><CCell><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
          <CCell>存在问题描述</CCell><CCell>确认时间</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'MonitoringFacili'}>
          {render}
        </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.7rem'}}>
      备注：1.检查依据:《福建省电梯安全管理条例》；<br/>
      2.本附录所列项目检查结果不作为整机结论判定依据。
    </Text>
  </>;
};

//在原始记录使用的：
export const 设备概况页= ({theme, orc, rep,config,fixed=["4.2%","12.1%","39%","9%","11.1%","%"],}
                              :{theme: any, orc:any, rep:any,config:any[],fixed?:string[]}
) => {
  const renderUpper=usePrefixDataTable({config, orc, rep, slash:true});
  return <>
    <div css={{"@media print": {paddingBottom: '6rem', pageBreakInside: 'avoid'}} }>
    </div>
    <Table  fixed={ fixed }  tight  miniw={800}
             css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-6rem'}} } >
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
  </>;
};
