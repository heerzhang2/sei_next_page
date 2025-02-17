/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Collapse, Text, useTheme, usePressable,
    Table, TableBody, TableHead, TableRow, Cell, CCell, Link, Button
} from "customize-easy-ui-component";
import { useMedia } from "use-media";
import { DirectLink } from "../../routing/Link";
import { getInstrument2xColumn, itemResultTransform } from "../common/helper";
import { ReportViewProps, } from "../common/base";
import { reportFirstPageHead, 末尾链接, 注意事项, 落款单位地址, } from "../common/rarelyVary";
import {检验编制核准, 检验设备情况, 首页设备概况} from "./elvRarelyVary";
import { inspectionContent } from "./Periodical/repConfig";
import {useLikeElevatorIspNormalize} from "../hook/useLikeElevatorIspNormalize";

import queryString from "query-string";
//被缩小后默认字体便感觉偏小。 检查<Table >为何被缩放。
//正式报告的显示打印。
//不需要每个verId新搞一个文件的，甚至不需要搞新的组件，可以只需内部逻辑处理。
//verId 实际在PeriodicalInspection.E配置文件中reportTemplate配上的。#不是路由器注入提供！！
//报告的不一定都来自inspectionContent的统一X.Y下标组织的内容，还有许多的不是用该模式标准配置的内容；对应是原始记录在recordPrintList=[createItem(的部分页面。
export const ReportView: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,
}) => {
  const theme = useTheme();
  const notSmallScr = useMedia('(min-width:800px),print');
  const qs= queryString.parse(window.location.search);
  const printing =qs && !!qs.print;
  console.log("参第三层路由verId qs printing=",printing,"verId",verId);
  const [redundance, setRedundance] =React.useState(notSmallScr||printing);
  function onPress(e:any) {
      setRedundance(!redundance);
      e.preventDefault();
  }
  const {bind:bindRedund ,} =usePressable({ onPress,  behavior: "button", noHover:true});
  React.useEffect(() => {
     setRedundance(notSmallScr||printing);
  }, [notSmallScr, printing] );
  const instrumentTable =React.useMemo(() => getInstrument2xColumn(orc.仪器表), [orc.仪器表]);
  const 检验结果替换 =React.useCallback((orc: { [x: string]: any; }, out: string[][]) => {
    if(orc['轿井间距'])   out[3.7][0]=`间距${orc['轿井间距']}m`;
    else if(orc['轿井间距x'])   out[3.7][0]=`间距${orc['轿井间距x']}m`;
    if(orc['对重越程'] && orc['对重越程最大'])   out[3.15][2]=`最大允许值${orc['对重越程最大']}mm;测量值${orc['对重越程']}mm`;
  }, []);
  //电梯 机电的 需要转换原始记录给正式报告的显示字段内容：承压类报告没必要做数据库存储转换给正式报告显示内容的环节，而且还是X.Y下标数组配置模式的检验项目；另外不合格显示项目也是动态生成的。
  const itRes =React.useMemo(()=>itemResultTransform(orc,inspectionContent,检验结果替换), [orc,检验结果替换]);
  const {renderIspContent} =useLikeElevatorIspNormalize({itRes, inspectionContent, model:'EL-DJ',ver:verId, repNo:`${repId}`});

  return (
    <React.Fragment>
      <div css={{
            "@media not print": {
              marginTop:'1rem',
              marginBottom: '1rem'
            }
          }}
      >
       <div role="button" tabIndex={0} {...bindRedund}>
          {!(redundance) && <Text variant="h4">
               {`No：JD2020FTC00004 更多...`}
             </Text>
          }
       </div>
        <Collapse id={'1'} show={redundance} noAnimated>
          <div role="button" {...bindRedund}>
            { reportFirstPageHead({theme, No: 'JD2020FTC00004'}) }
                <div css={{
                    "@media print": {
                      // height:'110px'
                    }
                }}>
                </div>
          </div>
        </Collapse>

          <div css={{"@media print": {
                  display: 'flex',
                  height: `calc(100vh - 26rem)`,         //根据中间基本条目个数的占据空间：来调整尺寸 =26rem；
                  flexDirection: 'column',
                  justifyContent: 'space-around',
              }, }}>
            <Text variant="h3" css={{
                  textAlign:'center',
                  "@media (min-width:690px),print and (min-width:538px)": {
                    fontSize: theme.fontSizes[6],
                  }
                }}>
             有机房曳引驱动电梯定期检验报告
            </Text>
            { 首页设备概况( {theme, orc} ) }
          </div>


          <div role="button" tabIndex={1} {...bindRedund}>
              {!(redundance) && <Text variant="h4">
                  福建省特种设备检验研究院 更多...
              </Text>
              }
          </div>
          <Collapse id={'2'} show={redundance} noAnimated>
              <div css={{
                  "@media print": {
                      height:'20mm'
                  }
              }}>
              </div>
              <div  css={{
                  textAlign:'center',
                  "@media print": {
                      pageBreakAfter:'always',
                      pageBreakInside:'avoid'
                  }
              }}>
                  {落款单位地址}
              </div>

              <div role="button" {...bindRedund}>
                  <Text variant="h1" css={{textAlign:'center'}}>注意事项</Text>
              </div>
              <Text variant="h4"><br/>
                  1. 本报告依据《电梯监督检验和定期检验规则——曳引与强制驱动电梯》
                  （TSG T7001-2009）及1号、2号、3号修改单和《福建省电梯安全管理条例》
                  制定，适用于有机房曳引驱动电梯定期检验。<br/>
              </Text>
              {注意事项}
              <Text variant="h4"><br/>
                  8. 报检电话：968829，网址：<Link href="http://27.151.117.65:9999/sdn" title="报检">http:// 27.151.117.65:9999 /sdn</Link>
              </Text>
              <div role="button" {...bindRedund}>
                  <Text variant="h2" css={{textAlign:'center',
                      "@media print": {
                          pageBreakBefore: 'always',
                      },
                  }}>有机房曳引驱动电梯定期检验报告</Text>
              </div>
          </Collapse>

          <br/>
        <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/Survey`}>
         <Table  fixed={ ["15%","34%","16%","%"]  }
                css={ {borderCollapse: 'collapse' } } tight  miniw={800}
           >
         {检验设备情况({orc})}
        </Table>
       </DirectLink>
       <Table  fixed={ ["6%","8%","26%","14%","8%","%","14%"]  }
                printColWidth={ ["44","68","198","127","86","68","127"] }
                css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
          <TableBody>
            <TableRow>
              <CCell component="th" scope="row">设备技术参数</CCell>
              <CCell colSpan={6} css={{padding:0}}>
                <Table  fixed={ ["17%","33%","16%","%"]  }
                        printColWidth={ ["95","192","112","275"] }
                        css={ {borderCollapse: 'collapse', height:'fill-available'} } tight  miniw={800}
                  >
                  <TableBody>
                    <TableRow >
                      <CCell>额定载重量</CCell>
                      <CCell>{orc.额定载荷}  kg</CCell>
                      <CCell>额定速度</CCell>
                      <CCell>{orc.运行速度}  m/s</CCell>
                    </TableRow>
                    <TableRow >
                      <CCell>层站门数</CCell>
                      <CCell>{orc.电梯层数}  层   {orc.电梯站数}  站  {orc.电梯门数} 门</CCell>
                      <CCell>控制方式</CCell>
                      <CCell>{orc.控制方式}</CCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CCell>
            </TableRow>
            <TableRow>
              <CCell component="th" scope="row">检验依据</CCell>
              <Cell colSpan={6}>1、《电梯监督检验和定期检验规则——曳引与强制驱动电梯》（TSG T7001-2009）及1号、2号、3号修改单；<br/>
                  2、《福建省电梯安全管理条例》</Cell>
            </TableRow>
            <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/Instrument`}>
              <TableRow >
                <CCell component="th" scope="row" rowSpan={1+instrumentTable.length}>主要检验仪器设备</CCell>
                <CCell>序号</CCell>
                <CCell>仪器名称</CCell>
                <CCell>仪器编号</CCell>
                <CCell>序号</CCell>
                <CCell>仪器名称</CCell>
                <CCell>仪器编号</CCell>
              </TableRow>
            </DirectLink>
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
            <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/Conclusion`}>
             <TableRow>
              <CCell component="th" scope="row">检验结论</CCell>
              <CCell colSpan={6}><Text variant="h1" css={{fontSize:'4rem'}}>{orc.检验结论}</Text></CCell>
            </TableRow>
            </DirectLink>
            <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/Remark`}>
            <TableRow>
              <CCell component="th" scope="row">备注</CCell>
              <Cell colSpan={6}>{orc.memo}</Cell>
            </TableRow>
            </DirectLink>
          </TableBody>
        </Table>
        <Table  fixed={ ["11%","23%","6%","12%","%"]  }
                printColWidth={ ["85","192","80","100","261"] }
                css={ {borderCollapse: 'collapse' } }
        >
          <TableBody>
            <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/Appendix`}>
            <TableRow>
              <CCell component="th" scope="row">检验日期</CCell>
              <CCell colSpan={2}>{orc.检验日期}</CCell>
              <CCell>下次检验日期</CCell>
              <CCell>{orc.新下检日 || '／'}</CCell>
            </TableRow>
            </DirectLink>
           {检验编制核准({orc})}
            <TableRow >
              <CCell component="th" scope="row">审核</CCell>
              <CCell></CCell>
              <CCell>日期</CCell>
              <CCell>2020-01-02</CCell>
            </TableRow>
            <TableRow >
              <CCell component="th" scope="row">批准</CCell>
              <CCell></CCell>
              <CCell>日期</CCell>
              <CCell></CCell>
            </TableRow>
          </TableBody>
        </Table>
       <br/>
        <Table  fixed={ ["5%","7%","10%","9%","10%","%","17%","8%"]  }
                printColWidth={ ["32","32","56","38","91","277","122","70"] }
               css={ {borderCollapse: 'collapse' } }
        >
          <TableHead>
            <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/ALL`}>
              <TableRow>
                <CCell>序号</CCell>
                <CCell css={{"@media print": {fontSize: '0.7rem'} }}>检验类别</CCell>
                <CCell colSpan={4}>检验项目及内容</CCell>
                <CCell>检验结果</CCell>
                <CCell>检验结论</CCell>
              </TableRow>
            </DirectLink>
          </TableHead>
          <TableBody>
            {renderIspContent}
          </TableBody>
        </Table>
        { orc?.unq?  <>
              <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                      css={ {borderCollapse: 'collapse', marginTop: '1rem',
                          "@media print": {pageBreakBefore: 'always', marginTop: 'unset'}
                      } } >
                  <TableBody>
                      <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/ReCheck`}>
                          <TableRow>
                              <CCell  colSpan={5}>检验不合格项目内容及复检结果</CCell>
                          </TableRow>
                      </DirectLink>
                  </TableBody>
              </Table>
              <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                      css={ {borderCollapse: 'collapse' } }
              >
                  <TableHead>
                      <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/ReCheck`}>
                          <TableRow>
                              <CCell>序号</CCell>
                              <CCell>类别/编号</CCell>
                              <CCell>检验不合格内容记录</CCell>
                              <CCell>复检结果</CCell>
                              <CCell>复检日期</CCell>
                          </TableRow>
                      </DirectLink>
                  </TableHead>
                  <TableBody>
                      {orc?.unq?.map((bug:any, i:number) => {
                          return (
                              <TableRow key={i}>
                                  <DirectLink key={i} href={`/report/EL-DJ/ver/1/${repId}/${bug.no}`}>
                                      <CCell component="td" scope="row">{i+1}</CCell>
                                      <CCell>{bug.c}/{bug.no}</CCell>
                                      <CCell>{bug.b}</CCell>
                                  </DirectLink>
                                  <DirectLink key={i+'r'} href={`/report/EL-DJ/ver/1/${repId}/ReCheck?from=${bug.no}`}>
                                      <CCell>{bug.rs}</CCell>
                                      <CCell>{bug.d}</CCell>
                                  </DirectLink>
                              </TableRow>
                          );
                      }) }
                  </TableBody>
              </Table>
          </>
          :
          <DirectLink  href={`/report/EL-DJ/ver/1/${repId}/ReCheck`}>
              <Button variant="ghost" intent='primary'  css={{"@media print": {display: 'none'} }}  noBind
              >检验不合格项目内容及复检结果</Button>
          </DirectLink>
       }
      </div>
      {末尾链接({template:'EL-DJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}
