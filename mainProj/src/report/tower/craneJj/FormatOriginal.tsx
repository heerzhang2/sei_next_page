/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import {RepLink, ReportViewProps,} from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {测量结果记录} from "./repView";
import {multilines2Html} from "../../tools";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import {UnqualifiedIspItemTableX} from "../../common/general";
import queryString from "query-string";
import {config观测数据, config设备概况} from "./orcBase";
import {技术资料见证, 记事的, 俩列检验设备概况} from "../../park/views";
import {首页概况ElevJj} from "../../elevator/viewFirst";
import {useFormatOmniLikeParkJj} from "../../park/hook/useFormatOmniLikeParkJj";
import {AxisVertVw} from "./viewAxisVert";
import {SafeDistanceVw} from "./viewSafDist";
import {GeometricVw} from "./viewGeometr";
import {ThicknessVw} from "./viewThicknes";
import {MonitoringSysVw} from "./viewMonitori";
import {WeightCorrespondVw} from "./viewWeight";
import {WeightAmplitudeVw} from "./viewAmplitu";
import {BrakingVw} from "./viewBraking";
import {StiffnessVw} from "./viewStiffnes";
import {StrainStressVw} from "./viewStrainS";
import {常用现场条件V1} from "../../elevator/sundryDj/view";
import {tItems现场} from "./Regular.O-1";
import {AttachmentDeviceVw} from "./viewAttachD";
import {LadderVw} from "./Ladder";
import {SynchronizationVw} from "./Synchronization";

//格式化版的原始记录 和 正式报告：目的功能定位叉开。前者只是用于打印目的。后者不仅要打印还要导航编辑器区块。
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep, theme});
    }, [rep, theme]);
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
          起重机械安装改造重大修理监督检验原始记录
        </Text><br/>
          <Text variant="h5" css={{
              textAlign:'center',
          }}> （适于塔式起重机）
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
              { 首页概况ElevJj( {theme, orc, original:true, rep} ) }
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
              <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
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
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
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
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey`}>
              <Text variant="h4">二、设备概况</Text>
          </DirectLink>
          <Table fixed={ ["16%","34%","16%","34%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
              <TableBody>
                  <RepLink ori rep={rep} tag={'Survey'}>
                      {俩列检验设备概况({orc,rep, repId:repId!,verId,config:config设备概况})}
                  </RepLink>
              </TableBody>
          </Table>

          <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
              <Text variant="h4">三、检验记录</Text>
          </DirectLink>
          <Table fixed={ ["2%","3%","5%","5%","4.4%","%","3.4%","3%","3%","3%","3.2%","5.1%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell rowSpan={2}>序号</CCell>
                          <CCell colSpan={5}>检验项目及内容和要求</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.7rem'}}>检验结果</Text></CCell>
                          <CCell rowSpan={2}>结论</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.6rem'}}>工作见证</Text></CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.6rem'}}>确认方式</Text></CCell>
                          <CCell rowSpan={2}>备注</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.7rem'}}>不合格内容</Text></CCell>
                      </TableRow>
                      <TableRow>
                          <CCell colSpan={4}>检验项目</CCell>
                          <CCell>检验内容和要求</CCell>
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
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell><Text variant="h1" css={{fontSize:'4rem'}}>{orc.检验结论}</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Table fixed={ ["15%","%","15%","20%"] } css={ {borderCollapse: 'collapse'} }>
              <TableBody>
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
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
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                    <TableRow>
                        <Cell split={true}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                            {orc.大备注 || '／'}
                        </div></Cell>
                    </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text >注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
          {测量结果记录({config: config观测数据, orc, rep, label:'附录1 观测值及测量结果记录表',
              children: <Text css={{fontSize:'0.8rem'}}>
                  注：1、未测量或无需测量的，仅填检验结果栏。
                  2、其他需记录的测量值和结果值填在备注栏中。
                  3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
                  4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
              </Text>
          })}

          <AxisVertVw orc={orc} rep={rep} label={'附录2：C3.2塔身轴心线的垂直度测值及测量结果记录表'}/>
          <SafeDistanceVw orc={orc} rep={rep} label={'附录3：C3.3 安全距离观测值及测量结果记录表'}/>
          <GeometricVw orc={orc} rep={rep}
              label={<Text variant="h4" css={{marginTop: '1rem',fontSize:'1.3rem'}}>附录4：C3.6主要几何尺寸观测值及测量结果记录表（适于改造监检）</Text>}
          />
          <ThicknessVw orc={orc} rep={rep}
                label={<Text variant="h4" css={{marginTop: '1rem',fontSize:'1.3rem'}}>附录5：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表</Text>}
          />
          <LadderVw orc={orc} rep={rep} label={'附录6：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>
          <MonitoringSysVw orc={orc} rep={rep} label={'附录7：C4.2.2.5和C4.9.7安全监控管理系统参数验证表'}/>
          <WeightCorrespondVw orc={orc} rep={rep} label={'附录8：表一：最大幅度相应的额定起重量'}/>
          <WeightAmplitudeVw orc={orc} rep={rep} label={'附录8：表二：最大额定起重量相应的最大幅度'}/>
          <BrakingVw orc={orc} rep={rep} label={'附录9：C4.3.2.2起升机构制动距离记录表'}/>
          <SynchronizationVw orc={orc} rep={rep} label={'附录10：C4.3.2.3各机构同步性能记录表'}/>
          <StiffnessVw orc={orc} rep={rep} label={'附录11 C4.3.2.5塔式起重机静态刚度测量记录'}/>
          <StrainStressVw orc={orc} rep={rep} label={'附录12：C4.8.1应变应力测试记录表'}/>

          <Text variant="h4" css={{marginTop: '1rem',}}>附录13：现场检验条件确认</Text>
          {常用现场条件V1({orc, rep, config: tItems现场})}
          <AttachmentDeviceVw orc={orc} rep={rep} nos={'14'} label={'附录14 C3.4附设装置检验项目'}/>
          <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
      {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}

