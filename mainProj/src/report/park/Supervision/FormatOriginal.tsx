/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead,
    useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接,
} from "../../common/rarelyVary";
import {
    测量结果记录, 首页概况Park, 几何尺寸记录, 停车专项试验, 现场检验
} from "./repView";
import {multilines2Html} from "../../tools";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import {UnqualifiedIspItemTableX} from "../../common/general";
import queryString from "query-string";
import {config设备概况} from "./orcBase";
import {useFormatOmniLikeParkJj} from "../hook/useFormatOmniLikeParkJj";
import {
    受力结构件厚度,
    梯子走台栏杆,
    机构运行速度,
    漏磁检查记录,
    技术资料见证,
    记事的,
    俩列检验设备概况
} from "../views";

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
    const {renderIspContent} =useFormatOmniLikeParkJj({itRes:orc,ItemArs:impressionismAs?.Item, rep});
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
              { 首页概况Park( {theme, orc, original:true, rep} ) }
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
              <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Instrument`}>
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
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Instrument`}>
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
          <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Survey`}>
              <Text variant="h4">二、设备概况</Text>
          </DirectLink>
          <Table fixed={ ["16%","34%","16%","34%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
              <TableBody>
                {俩列检验设备概况({orc,rep, repId:repId!,verId,config:config设备概况})}
              </TableBody>
          </Table>

          <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/ALL`}>
              <Text variant="h4">三、检验记录</Text>
          </DirectLink>
          <Table fixed={ ["2%","5%","5%","5%","3%","%","3%","3%","3%","3%","4%","6%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell rowSpan={2}>序号</CCell>
                          <CCell colSpan={5}>监督检验项目及内容和要求</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.6rem'}}>监督检验结果</Text></CCell>
                          <CCell rowSpan={2}>结论</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.5rem'}}>工作见证</Text></CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.5rem'}}>确认方式</Text></CCell>
                          <CCell rowSpan={2}>备注</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.8rem'}}>不合格内容</Text></CCell>
                      </TableRow>
                      <TableRow>
                          <CCell colSpan={4}>监督检验项目</CCell>
                          <CCell>监督检验内容和要求</CCell>
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
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell><Text variant="h1" css={{fontSize:'4rem'}}>{orc.检验结论}</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Table fixed={ ["15%","%","15%","20%"] } css={ {borderCollapse: 'collapse'} }>
              <TableBody>
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/ALL`}>
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
          <Text id="Witness" variant="h4" css={{marginTop: '1rem',
          }}>五、技术资料和工作见证材料</Text>
          {技术资料见证({orc, rep })}
          <Text variant="h4" css={{marginTop: '1rem',
          }}>六、记事</Text>
          {记事的({orc, rep })}
          <Text variant="h4" css={{marginTop: '1rem',
          }}>七、备注</Text>
          <Table>
              <TableBody>
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Witness#Witness`}>
                    <TableRow>
                      <Cell>{multilines2Html(orc.大备注,  (txt,i)=>{
                              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                          })}</Cell>
                    </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text >注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
          {测量结果记录({orc, repId:repId!, verId, rep})}

          {几何尺寸记录({orc, repId:repId!, verId, rep})}
          {受力结构件厚度({orc, rep, label: "附录4：C3.7.3主要受力结构件断面有效厚度观测值及测量结果记录表"})}
          {梯子走台栏杆({orc, rep, label:'附录5：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'})}
          <Text variant="h4" css={{marginTop: '1rem',}}>附录6：C4.3.2.1各机构运行速度记录表</Text>
          {机构运行速度({orc, rep })}
          注：1、对于产品标准和设计文件同时对速度允许偏差都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对速度允许偏差都没有规定的，相应的速度可不测量。<br/>
          2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。若机构有其他速度需要测量且不符合规定的，应在 备注栏中填写。
          {停车专项试验({orc, rep })}
          {漏磁检查记录({orc, rep })}
          <Text variant="h4" css={{marginTop: '1rem',}}>附录11：现场检验条件确认</Text>
          {现场检验({orc, rep })}
          <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
      {末尾链接({template:'PARK-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}

