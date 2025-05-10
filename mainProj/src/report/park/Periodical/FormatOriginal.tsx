/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import queryString from "query-string";
import {config观测数据, config设备概况} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {机构运行速度} from "./repView";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {ThicknessVw} from "../../tower/craneJj/viewThicknes";
import {config梯子} from "../editor";
import {BrakingVw} from "../../tower/craneJj/viewBraking";
import {SynchronizationVw} from "./Synchronization";
import {ParkSpecialVw} from "./ParkSpecial";
import {技术见证Park, 测量记录Park, 漏磁检查记录} from "../views";
import {UnqualifiedIspItemTableX} from "../../common/general";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {LadderVw} from "../../tower/craneJj/Ladder";
import {常用现场条件, 设备概况页} from "@/report/common/view";

export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'M',x:'备注',m:true},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:false});
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
            {设备概况页({orc, rep, config: config设备概况, theme})}

            <Text css={{fontSize:'0.8rem'}}>
                注：1、“检验结果”栏：可用以下四种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“×”表示“不符合”，“△”表示“无法检验”。<br/>
                2、本原始记录适用曳引驱动的乘客与载货电梯、消防员电梯、防爆电梯、斜行乘客与载货电梯，以及强制驱动的载货电梯、斜行载货电梯的定
                期检验。
            </Text>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%", "4.5%", "4.5%", "4.6%", "4.2%", "%", "5%", "4.5%", "5%", "6.3%"] }
                   css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text css={{fontSize: '0.8rem'}}>序号</Text></CCell>
                            <CCell colSpan={4}>检验项目</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell>检验结果</CCell>
                            <CCell>结论</CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>备注</Text></CCell>
                            <CCell><Text css={{fontSize: '0.7rem'}}>不合格内容</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <Text variant="h4" css={{
                marginTop: '1rem',
                "@media print": {
                    pageBreakBefore: 'always', marginTop: 'unset',
                },
            }}>四、现场检验意见</Text>
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
                            <CCell css={{border: 'none'}}>检验</CCell>
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
            <Text id="Witness" variant="h4" css={{marginTop: '1rem',
            }}>五、技术资料和工作见证材料</Text>
            {技术见证Park({orc, rep })}
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>六、备注</Text>
            <Table><TableBody>
                <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                    <TableRow><Cell>
                       <div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc.大备注 || '／'}</div>
                    </Cell></TableRow>
                </DirectLink>
            </TableBody></Table>
            <Text>注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
            {测量记录Park({config: config观测数据, orc, rep, label:'附录1 观测值及测量结果记录表',
                children: <Text css={{fontSize:'0.8rem'}}>
                    注：1、未测量或无需测量的，仅填检验结果栏。
                    2、其他需记录的测量值和结果值填在备注栏中。
                    3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。
                    4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
                </Text>
            })}

            <ThicknessVw orc={orc} rep={rep}
                  label={<Text variant="h4" css={{marginTop: '1rem',fontSize:'1.3rem'}}>附录2：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表</Text>}
            />
            <LadderVw orc={orc} rep={rep} config={config梯子} label={'附录3：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>
            {机构运行速度({orc, rep })}
            <BrakingVw orc={orc} rep={rep} noAux label={'附录5：C4.3.2.2起升机构制动距离记录表'}>
                注：1、对于产品标准和设计文件同时对制动距离都有规定的，以较严规定作为检验结果判定依据。对于产品标准和设计文件对制动距离都没有规定的，相应的制动距离可不测量。
                2、以设计文件作为检验结果判定依据时，设计要求值填在备注栏内。
            </BrakingVw>
            <SynchronizationVw orc={orc} rep={rep} label={'附录6：C4.3.2.3各机构同步性能记录表'}/>
            <ParkSpecialVw orc={orc} rep={rep} />
            {漏磁检查记录({orc, rep, label:'附录8：C4.9.8.1漏磁检查记录表'})}
            {常用现场条件({orc, rep, config: tItems现场, label:'附录9：现场检验条件确认'})}
            <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
