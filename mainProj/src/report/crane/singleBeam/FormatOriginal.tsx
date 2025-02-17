/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead,
    useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接,
} from "../../common/rarelyVary";
import {
    俩列检验设备概况,
    首页设备概况
} from "./repView";
import {multilines2Html} from "../../tools";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import { useFormatOmniLikeCraneSi } from "../hook/useFormatOmniLikeCraneSi";
import {useItemsMapOmni} from "../../common/omni";
import {UnqualifiedIspItemTableX} from "../../common/general";
import queryString from "query-string";
import {config设备概况} from "./orcBase";

//格式化版的原始记录 和 正式报告：目的功能定位叉开。前者只是用于打印目的。后者不仅要打印还要导航编辑器区块。
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    const {renderIspContent} =useFormatOmniLikeCraneSi({itRes:orc,ItemArs:impressionismAs?.Item,
        model:'SINGB-IN',ver:verId, repNo:`${repId}`,});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
  return (
    <React.Fragment>
      <div css={{
            "@media not print": {
              marginTop:'1rem',
              marginBottom: '1rem'
            }
          }}
      >
          <div css={{
              textAlign: "center",
              "& > div": {
                  marginLeft: "auto",
                  marginRight: "auto"
              },
              "@media (min-width:690px),print and (min-width:538px)": {
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: 'wrap',
                  "& > div": {
                      margin: theme.spaces.sm,
                  }
              },
              flexDirection: 'row-reverse',
          }}>
             <Text variant="h5" css={{textDecoration: 'underline'}}>FJJ/QB-1002-1-2023</Text>
          </div>
        <Text variant="h3" css={{
              textAlign:'center',
              "@media (min-width:690px),print and (min-width:538px)": {
                fontSize: theme.fontSizes[5],
              },
               marginTop: '2rem',
            }}>
          电梯安全性能技术评估原始记录
        </Text><br/>
          <Text variant="h5" css={{
              textAlign:'center',
          }}> （适于： 格式化版记录 待续...）
          </Text>
        <div css={{
            "@media print": {
              height:'18mm'
            }
          }}>
        </div>
          <div css={{
              "@media print": {
                  minHeight: '-webkit-fill-available',
              }
          }}>
              { 首页设备概况( {theme, orc, original:true, rep} ) }
          </div>
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
                <Text variant="h4" css={{
                    textAlign:'center',
                }}>福建省特种设备检验研究院编制</Text>
            </div>
          {填写须知}
          <div>
              <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Instrument`}>
              <Text variant="h4" css={{
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>一、主要检验仪器设备性能检查</Text>
              </DirectLink>
          </div>
          <Table  printColWidth={ ["1","1","1","1","1"] }>
              <TableHead>
                  <TableRow>
                      <CCell rowSpan={2}>仪器设备名称</CCell>
                      <CCell rowSpan={2}>型号规格</CCell>
                      <CCell rowSpan={2}>仪器设备编号</CCell>
                      <CCell colSpan={2}>性能状态</CCell>
                  </TableRow>
                  <TableRow>
                      <CCell>开机后</CCell>
                      <CCell>关机前</CCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Instrument`}>
                      {orc.仪器表?.map((o: any, i: React.Key) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{o.n}</CCell>
                                  <CCell>{o.t}</CCell>
                                  <CCell css={{wordBreak: 'break-all'}}>{o.i}</CCell>
                                  <CCell>{o.o}</CCell>
                                  <CCell css={{wordBreak: 'break-all'}}>{o.f}</CCell>
                              </TableRow>
                          );
                      }) }
                  </DirectLink>
              </TableBody>
          </Table>
          <Text>
              注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
              <Text css={{display: 'flex', marginLeft:'2rem'}}>
                  2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
                  3、新增使用的仪器设备应填写在预留栏中。<br/>
                  4、未使用的仪器设备可不填写。
              </Text>
          </Text>
          <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Survey`}>
              <Text variant="h4">二、设备概况</Text>
          </DirectLink>
          <Table fixed={ ["16%","34%","16%","34%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
              <TableBody>
                {俩列检验设备概况({orc,rep, repId:repId!,verId,config:config设备概况})}
              </TableBody>
          </Table>

          <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/ALL`}>
              <Text variant="h4">三、检验记录</Text>
          </DirectLink>
          <Table fixed={ ["2.5%","5%","6%","4%","3.5%","%","5%","8%","4.5%","5%"] } css={ {borderCollapse: 'collapse' } }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell>序号</CCell><CCell colSpan={5}>检验项目及其内容</CCell>
                          <CCell><Text css={{fontSize:'0.7rem'}}>检验结果</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem',"@media print": {fontSize:'0.5rem'}}}>不合格描述</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem'}}>结论</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem'}}>备注</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableHead>
              <TableBody>
                  {renderIspContent}
              </TableBody>
          </Table>

          <Text  variant="h4" css={{marginTop: '1rem',
              "@media print": {
                  pageBreakBefore: 'always', marginTop: 'unset',
              },
          }}>四、结论</Text>
          <Table>
              <TableBody>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell><Text variant="h1" css={{fontSize:'4rem'}}>{orc.检验结论}</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Table fixed={ ["15%","%","15%","20%"] } css={ {borderCollapse: 'collapse'} }>
              <TableBody>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/ALL`}>
                      <TableRow >
                          <CCell css={{border:'none'}}>检验</CCell>
                          <CCell css={{border:'none'}}></CCell>
                          <CCell css={{border:'none'}}>日期</CCell>
                          <CCell css={{border:'none'}}>2020-01-02</CCell>
                      </TableRow>
                      <TableRow >
                          <CCell css={{border:'none'}}>校核</CCell>
                          <CCell css={{border:'none'}}></CCell>
                          <CCell css={{border:'none'}}>日期</CCell>
                          <CCell css={{border:'none'}}></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text id="Evaluation" variant="h4" css={{marginTop: '1rem',
          }}>五、技术资料和工作见证材料</Text>
          <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Evaluation`}>
          <Table printColWidth={["8%","10%","%","20%"]}  css={{borderCollapse: 'collapse'}}>
              <TableHead>
                  <TableRow>
                      <CCell>序号</CCell>
                      <CCell>代号</CCell>
                      <CCell>名称</CCell>
                      <CCell>编号</CCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                      { orc?.见证表?.map((o: any, i: number) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{i+1}</CCell>
                                  <CCell>{o.no}</CCell>
                                  <CCell>{o.nm}</CCell>
                                  <CCell>{o.sn}</CCell>
                              </TableRow>
                          );
                      } ) }
              </TableBody>
          </Table>
          </DirectLink>
          <Text id="Evaluation" variant="h4" css={{marginTop: '1rem',
          }}>六、记事</Text>
          <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Evaluation`}>
              <Table printColWidth={["8%","%","10%","23%"]}  css={{borderCollapse: 'collapse'}}>
                  <TableHead>
                      <TableRow>
                          <CCell>序号</CCell>
                          <CCell>名称</CCell>
                          <CCell>编号</CCell>
                          <CCell>备注</CCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      { orc?.记事表?.map((o: any, i: number) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{i+1}</CCell>
                                  <CCell>{o.nm}</CCell>
                                  <CCell>{o.no}</CCell>
                                  <CCell>{o.me}</CCell>
                              </TableRow>
                          );
                      } ) }
                  </TableBody>
              </Table>
          </DirectLink>
          <Text variant="h4" css={{marginTop: '1rem',
          }}>七、备注</Text>
          <Table>
              <TableBody>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Evaluation`}>
                    <TableRow>
                      <Cell>{multilines2Html(orc.大备注,  (txt,i)=>{
                              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                          })}</Cell>
                    </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text >注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
          <Text variant="h4" css={{marginTop: '1rem',
          }}>附录1：观测值及测量结果记录表</Text>
          <Table printColWidth={ ["1","1","1","1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
              <TableHead>
                  <TableRow>
                      <CCell>序号</CCell>
                      <CCell>项目编号</CCell>
                      <CCell colSpan={4}>检验项目</CCell>
                      <CCell>单位</CCell>
                      <CCell>观测值</CCell>
                      <CCell>结果值</CCell>
                      <CCell>检验结果</CCell>
                  </TableRow>
              </TableHead>
              {/*{观测值及测量表({orc, repId:repId!, verId, rep})}*/}
          </Table>
          注：1、未测量或无需测量的，仅填检验结果栏。<br/>
          2、其他需记录的测量值和结果值填在备注栏中。<br/>
          3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。<br/>
          4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
          <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
      {末尾链接({template:'SINGB-IN',verId, repId: repId||''})}
    </React.Fragment>
  );
}
