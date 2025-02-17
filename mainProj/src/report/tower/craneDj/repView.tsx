/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {DirectLink,} from "../../../routing/Link";
import {RepLink,} from "../../common/base";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {useThreeColumnView} from "../../hook/useThreeColumnSubr";
import {render设备品种, render设备类别} from "../../common/render";
import {render工作幅, } from "../../tower/craneJj/orcBase";
import {检验编制核准Tower} from "../rarelyVary";

//无需校验唯一性
export const config设备 = [
  [['使用单位', '_$使用单位'],  ],
  [['使用单位地址', '_$使用单位地址'],  ],
  [['使用单位统一社会信用代码', '_$使用单位信用码'], ['使用单位安全管理人员', '安全员']],
  [['联系人电话', '_$使用单位电话'], ['邮政编码', '_$使用单位邮编'] ],
  [['制造单位名称', '_$制造单位'] ],
  [['改造单位名称','_$改造单位']],
  [['重大修理单位名称','_$维修单位']],
  [['设备类别', '_$设备类别',render设备类别], ['设备品种', '_$设备品种',render设备品种], ],
  [['型号规格', '型规格'], ['设备代码', '_$设备代码'], ],
  [['产品编号', '_$出厂编号'], ['单位内编号','_$单位内部编号']  ],
  [['投入使用日期', '_$投用日期'], ['设计使用年限','_$设计年限', '年'], ],
  [['设备型号', '_$型号'],   ],
  [['使用地点', '_$设备使用地点'] ],
  //性能参数;  拆分
  [['额定起重力矩','_$起重力矩','t·m'], ['最大起升高度',{n:'起升高度',t:'n',u:'m'}], ],
  [['起升速度','_$起升速','m/min'],['独立安装高度','_$独立高度','m']],
  [['最小和最大工作幅度','_$最大工作幅',render工作幅], ['工作级别','_$工作级别'] ],
  [['其他主要参数',{n:'其他参数',t:'m'}], ],
];

/**起重的 依据下面都一样的:也能复用的： 【缺点 = 参数太多了】
 * @param fixed :针对设备概况的主要部分 调整表格跨度。
 * @param ispan :性能参数 有几行的；
 * */
export const 报告设备详情拆= ( {orc, rep, config,spIdx,fixed=["6.1%","8%","40%","8.1%","8%","%"],ispan=4,
                       xnFixed=["4.8%","18.1%","30%","9%","12.2%","10%","%"], gybz }
         : { orc: any,rep:any, config:any[],spIdx:number,fixed?:string[],ispan?:number,xnFixed?:string[],gybz?:boolean}
) => {
  const memoTxt=gybz? orc?.概备注 : orc?.大备注;
  //拆分成2个编辑器的
  const config设备上=config.slice(0, spIdx);
  const config设备下=config.slice(spIdx);
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                            embedCol: [ <CCell rowSpan={ispan}>性能参数</CCell> ]});
  return <React.Fragment>
    <Table id={'Survey'} fixed={fixed}  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={xnFixed}  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={1}>检验依据</CCell>
          <CCell colSpan={6}>《起重机械安全技术规程》（TSG 51-2023）</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检验结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'1.4rem',letterSpacing: '0.5rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <RepLink rep={rep} tag={gybz? 'Survey' : 'Witness'}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {memoTxt ?? '／'}
            </div></Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    {检验编制核准Tower({orc,rep})}
  </React.Fragment>;
};
