/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Cell, RCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {DirectLink,} from "../../../routing/Link";
import {eqpTypeAllMap} from "../../../dict/eqpComm";
import {RepLink,} from "../../common/base";
import {usePrefixDataTable} from "../../hook/usePrefixData";
import {useThreeColumnView} from "../../hook/useThreeColumnSubr";
import {AttentionPoint} from "../../common/rarelyVary";
import {检测依据选} from "./orcBase";
import Img_Seal from "../../../images/seal.png";

const render设备品种={
  view:(orc:any)=><>{eqpTypeAllMap.get(orc?.设备品种)}</>,
};
const render层站门数={
  view:(orc:any)=><>{orc.电梯层数}  层   {orc.电梯站数}  站  {orc.电梯门数} 门</>,
};
//仅在正式报告用，而非原始记录采用的：无需纳入编辑器检查；
const config设备 = [
  [['使用单位名称', '_$使用单位'], ['统一社会信用代码', '_$使用单位信用码'] ],
  [['安装地点', '_$设备使用地点'], ],
  [['设备品种', '_$设备品种',render设备品种], ['产品型号', '_$型号'],],
  [['产品编号', '_$出厂编号'], ['单位内编号','_$单位内部编号'] ],
  [['使用登记证编号', '_$使用证号'], ['安全管理人员', '安全员']],
  [['制造单位名称', '_$制造单位'] ,['制造日期', '_$制造日期'] ],
  [['改造单位名称','_$改造单位'], ],
  [['维护保养单位名称', '_$维保单位']],
    //性能参数
  [['额定载重量','_$额定载荷','kg'], ['额定速度', '_$运行速度','m/s'] ],
  [['层站门数', '_$电梯层数',render层站门数], ['控制方式', '_$控制方式',] ],
  [['倾斜角','_$倾斜角度','°'], ['轿门位置', '轿门位',] ],
  [['整机防爆标志','_$防爆标志',], ['区域防爆等级', '_$防爆等级'], ],
];
//拆分成2个编辑器的
const config设备上=config设备.slice(0, 8);
const config设备下=config设备.slice(8);

export const 报告设备详情= ( {theme, orc, rep } : { orc: any,rep:any, theme:any}
) => {
  const renderUpper=usePrefixDataTable({config: config设备上, orc, rep, slash:true});
  const [firstPart,_s]=useThreeColumnView({orc, config:config设备下,slash:true,
                            embedCol: [ <CCell rowSpan={4}>设备技术参数</CCell> ]});
  return <React.Fragment>
    <Table id={'Survey'} fixed={ ["6.1%","10%","50%","8.1%","4%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {renderUpper}
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["4.8%","12.7%","24%","9%","12.2%","10%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableBody>
        <RepLink rep={rep} tag={'Survey'}>
          {firstPart}
        </RepLink>
        <TableRow>
          <CCell colSpan={2}>检测依据</CCell>
          <CCell colSpan={5}>{orc?.检测依据??检测依据选[0]}</CCell>
        </TableRow>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion#Conclusion`}>
          <TableRow>
            <CCell>检测结论</CCell><CCell colSpan={6}><Text variant="h1" css={{fontSize:'4rem'}}>{orc?.检验结论}</Text></CCell>
          </TableRow>
        </DirectLink>
        <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
          <TableRow>
            <CCell>备注</CCell>
            <Cell split={true} colSpan={6}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.大备注 ?? '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    {检验编制核准Stest({orc,rep})}
  </React.Fragment>;
};

export const 首页概况Stest= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检测日期：</RCell>
        {orc.检测日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检测日期1} 至 {orc.检测日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检测日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备代码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

export const 注意事项Stest= ({comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl>
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    3．本报告及复制报告书无检测、审核、批准人员签字和检测机构的核准证号、检测专用章或者公章无效。<br/>
    4．本报告一式二份，由检测机构、使用单位分别保存。<br/>
    5．有关检测数据未经允许，施工、使用单位不得擅自向社会发布信息。<br/>
    6．
  </AttentionPoint>;
};

/**隐含6列的；*/
export const 检验编制核准Stest= ( { orc,rep } : { orc: any, rep:any }
) => {
  return <Table fixed={ ["4.2%","27%","27%","4%","12%","%"] }  css={ {borderCollapse: 'collapse' } }  tight miniw={800}>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell colSpan={2}>下次检验日期</CCell>
          <CCell>{orc?.下检验日}</CCell>
          <CCell colSpan={2}>下次检测日期</CCell>
          <CCell>{orc?.新下检日}</CCell>
        </TableRow>
        <TableRow>
          <CCell>检测</CCell>
          <CCell colSpan={2}>{orc.检验人IDs}</CCell>
          <CCell>日期</CCell>
          <CCell>{orc.检验日期 || '／'}</CCell>
          <CCell rowSpan={3}>
            <div css={{
              height:'8rem',
              '::before': {
                filter: 'opacity(30%)',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${Img_Seal})`,
                content: '" "',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }
            }}>
              <Table  fixed={ ["40%","%"]  } css={ {borderCollapse: 'collapse',height:'fill-available'} }>
                <TableBody>
                  <TableRow>
                    <CCell css={{border:'none'}}>机构核准证号：</CCell>
                    <CCell css={{border:'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                  </TableRow>
                  <TableRow>
                    <CCell css={{border:'none'}} colSpan={2}>（检测机构公章或者检测专用章）</CCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CCell>
        </TableRow>
      </DirectLink>
      <TableRow>
        <CCell>审核</CCell>
        <CCell colSpan={2}></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
      <TableRow >
        <CCell>批准</CCell>
        <CCell colSpan={2}></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};
