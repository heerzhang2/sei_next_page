/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import {RepLink, ReportViewProps,} from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import queryString from "query-string";
import {config梯子, config观测数据, config设备概况} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {技术资料见证, 记事的} from "../../park/views";
import {UnqualifiedIspTable} from "../../common/general";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {MeasureDistanceVw, MeasurePortalVw} from "../../gantry/portalJj/views";
import {tail观测} from "../../bridge/erectingDj/orcBase";
import {config距离} from "../Intial/orcBase";
import {tail安距, } from "../../gantry/portalJj/orcBase";
import {ThicknessVw} from "../../tower/craneJj/viewThicknes";
import {LadderVw} from "../../tower/craneJj/Ladder";
import {config运行速度, MoveSpeedVw, tail速度} from "./MoveSpeed";
import {BrakingVw, tail制距} from "./Braking";
import {SpecialTopicVw, tail流动专} from "./SpecialTopic";
import {MagneticLeakVw} from "./MagneticLeak";
import {常用现场条件, 设备概况页} from "@/report/common/view";

/**Pdf模板的仪器表 “叉车货叉自然下滑量和门架倾角变化量激光测量仪” 名称太长了，打印不出问题！
 * */
export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:'D',x:'不合格内容',t:'B'},{n:null,x:'结论'},{n:'M',x:'备注',m:true}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep,dfsz:'0.75'});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
  return (
    <React.Fragment>
        <div css={{"@media not print": {marginTop: '1rem', marginBottom: '1rem'}}}>
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
                textAlign: 'center',
                "@media (min-width:690px),print and (min-width:538px)": {
                    fontSize: theme.fontSizes[5],
                },
                marginTop: '2rem',
            }}>
                起重机械定期检验原始记录
            </Text>
            <Text variant="h5" css={{textAlign: 'center',}}>（适于机械式停车设备）</Text>
            <Text variant="h5" css={{textAlign: 'center',}}>
                （适于： 格式化版记录 待续...）
            </Text>
            <div css={{"@media print": {height: '18mm'}}}>
            </div>
            <div css={{
                "@media print": {
                    minHeight: '-webkit-fill-available',
                }
            }}>
                { 首页设备概况Cr( {theme, orc, original:true, } ) }
            </div>
            <div css={{
                "@media print": {
                    height: '20mm'
                }
            }}>
            </div>
            <div css={{
                textAlign: 'center',
                "@media print": {
                    pageBreakAfter: 'always',
                    pageBreakInside: 'avoid'
                }
            }}>
                <Text variant="h4" css={{
                    textAlign: 'center',
                }}>福建省特种设备检验研究院编制</Text>
            </div>
            {填写须知}
            <div>
                <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
                    <Text variant="h4" css={{
                        "@media print": {
                            pageBreakBefore: 'always',
                        },
                    }}>一、主要检验仪器设备性能检查</Text>
                </DirectLink>
            </div>
            <Table fixed={ ["%","24%","22%","8%","8%"] } css={{borderCollapse: 'collapse'}} tight miniw={800}>
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
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
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
                        })}
                    </DirectLink>
                </TableBody>
            </Table>
            <Text>
                注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
                <Text css={{display: 'flex', marginLeft: '2rem'}}>
                    2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
                    3、新增使用的仪器设备应填写在预留栏中。<br/>
                    4、未使用的仪器设备可不填写。
                </Text>
            </Text>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey`}>
                <Text variant="h4">二、设备概况</Text>
            </DirectLink>
            {设备概况页({orc, rep, config: config设备概况, theme,fixed: ["4.2%", "12.1%", "33%", "9%", "11.1%", "%"]})}

            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%","3.8%", "4.2%", "4.2%", "4%", "%","4.5%","9%","4.5%","4.5%"] }
                   css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text css={{fontSize: '0.8rem'}}>序号</Text></CCell>
                            <CCell colSpan={4}>检验项目</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell>检验结果</CCell>
                            <CCell><Text css={{fontSize: '0.7rem'}}>不符合内容</Text></CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>结论</Text></CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>备注</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <Text variant="h4" css={{marginTop: '1rem', "@media print": {pageBreakBefore: 'always', marginTop: 'unset',},
            }}>四、结论</Text>
            <Table>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
                        <TableRow>
                            <CCell><Text variant="h1" css={{fontSize: '4rem'}}>{orc.检验结论}</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableBody>
            </Table>
            <Table fixed={["15%", "%", "15%", "20%"]} css={{borderCollapse: 'collapse'}}>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
                        <TableRow>
                            <CCell css={{border: 'none'}}>检验员</CCell>
                            <CCell css={{border: 'none'}}></CCell>
                            <CCell css={{border: 'none'}}>日期</CCell>
                            <CCell css={{border: 'none'}}>2020-01-02</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell css={{border: 'none'}}>校核</CCell>
                            <CCell css={{border: 'none'}}></CCell>
                            <CCell css={{border: 'none'}}>日期</CCell>
                            <CCell css={{border: 'none'}}></CCell>
                        </TableRow>
                    </DirectLink>
                </TableBody>
            </Table>
            <Text>注：特殊情况，应在备注中说明检测人员所负责检验的项目编号。</Text>
            <Text id="Witness" variant="h4" css={{marginTop: '1rem',
            }}>五、技术资料和工作见证材料</Text>
            {技术资料见证({orc, rep })}
            <Text variant="h4" css={{marginTop: '1rem',
            }}>六、备注</Text>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><Cell>
                       <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.大备注 ?? '／'}</div>
                    </Cell></TableRow>
                </RepLink>
            </TableBody></Table>

            <MeasurePortalVw config={config观测数据} orc={orc} rep={rep} mem='观测备注'  label='附录1 观测值及测量结果记录表'
                             fixed={ ["2.7%", "7.5%", "21%", "20%", "%", "4.5%", "9%", "8%", "5.9%"] } children={tail观测}/>
            {/*<MeasJudgmentAmus config={config观测数据} orc={orc} rep={rep} nseq label='七、观测数据及测量结果记录'*/}
            {/*                  fixed={["6%", "4%", "7%", "%", "5.2%", "8%", "9%", "7.1%", "7.2%"]}>*/}
            {/*</MeasJudgmentAmus>*/}
            <MeasureDistanceVw orc={orc} rep={rep} config={config距离(orc)} mem='安距备注' label={'附录2：C3.3 安全距离观测值及测量结果记录表'}>
                {tail安距}
            </MeasureDistanceVw>
            <ThicknessVw orc={orc} rep={rep} nomm
                         label={<Text variant="h4" css={{marginTop: '1rem',fontSize:'1.45rem'}}>附录3：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表</Text>}
            />
            <LadderVw orc={orc} rep={rep} config={config梯子} label={'附录4：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>
            <MoveSpeedVw orc={orc} rep={rep} config={config运行速度} sseq={4} children={tail速度} label={'附录5：C4.3.2.1各机构运行速度记录表'}/>
            <BrakingVw orc={orc} rep={rep} children={tail制距} label={'附录6：C4.3.2.2起升机构制动距离记录表'}/>
            <SpecialTopicVw orc={orc} rep={rep} children={tail流动专} label={'附录7 C4.3.2.5.4 流动式起重机专项试验'}/>
            <MagneticLeakVw orc={orc} rep={rep} label={'附录8：C4.9.8.1漏磁检查记录表'}/>

            {常用现场条件({orc, rep, config: tItems现场, label:'附录9：现场检验条件确认'})}
            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检验不合格内容记录','复检结果','复检日期']}
                                 label={<Text variant="h4" css={{textAlign:'left'}}>附录10 检验不合格项目内容</Text>}
            />
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
