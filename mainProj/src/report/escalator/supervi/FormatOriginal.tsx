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
import {config观测数据, config观测数据2, config观测数据3, config设备概况} from "./orcBase";
import {首页概况ElevJj} from "../../elevator/viewFirst";
import {tItems现场} from "./Regular.O-1";
import {useFormatOmniLikeYyWt} from "../../elevator/hook/useFormatOmniLikeYyWt";
import {常用现场条件V1} from "../../elevator/sundryDj/view";
import {扶手带速度偏差Jj, 测量记录三半, 视频监控设施记录表, 设备概况页} from "./repView";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";

const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'D',x:'存在问题描述'},{n:'S',x:'确认时间',m:true}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
    // const {renderIspContent} =useFormatOmniLikeYyWt({itRes:orc,ItemArs:impressionismAs?.Item, rep, sureD:true});
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:true});
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
                电梯监督检验原始记录
            </Text>
            <Text variant="h5" css={{textAlign: 'center',}}>（自动扶梯与自动人行道）</Text>
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
                {首页概况ElevJj({theme, orc, original: true, rep})}
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

            <Text css={{fontSize: '0.8rem'}}>
                注：1、“检验结果”栏：可用以下四种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“×”表示“不符合”，“△”表示“无法检验”。<br/>
                2、本原始记录适用曳引驱动的乘客与载货电梯、消防员电梯、防爆电梯、斜行乘客与载货电梯，以及强制驱动的载货电梯、斜行载货电梯的定
                期检验。
            </Text>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={["2%", "6%", "2%", "3%", "2%", "8%", "%", "5%", "4.5%", "7.5%", "4.5%"]}
                   css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text css={{fontSize: '0.8rem'}}>序号</Text></CCell>
                            <CCell>项类</CCell>
                            <CCell colSpan={3}>项目编号</CCell>
                            <CCell>项目名称</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell>检验结果</CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>检验结论</Text></CCell>
                            <CCell><Text css={{fontSize: '0.7rem'}}>存在问题描述</Text></CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>确认时间</Text></CCell>
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
            <Text id="Witness" variant="h4" css={{
                marginTop: '1rem',
            }}>五、见证资料</Text>
            <Table><TableBody>
                <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                    <TableRow><Cell>
                        <div css={{minHeight: '2rem', whiteSpace: 'pre-wrap'}}>{orc.见证资 || '／'}</div>
                    </Cell></TableRow>
                </DirectLink>
            </TableBody></Table>
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
            {测量记录三半({
                config1: config观测数据, config2: config观测数据2, config3: config观测数据3,
                orc, rep, label: '七、观测数据及测量结果记录',
                tail: <Text css={{fontSize: '0.8rem'}}>
                    注：1、表中A2.2.2.3、A2.2.2.4、A2.2.2.6、A2.2.4.1、A2.3.3适用检验项目应记录观测数据，其它项目在测量结果有存在不符
                    合时，应在相应项目“观测数据”栏记录具体测量值。<br/>
                    2、本表所列项目无测量时，观测数据和测量结果可不填，但“结果判定”应填写，对不适用项目“结果判定”填“/”。
                </Text>
            })}
            {扶手带速度偏差Jj({orc, rep, theme, label: "附录A：空载梯级（踏板、胶带）和扶手带运行速度偏差"})}
            <Text variant="h4" css={{marginTop: '1rem',}}>附录B：现场检验条件确认</Text>
            {常用现场条件V1({orc, rep, config: tItems现场})}
            {视频监控设施记录表({orc, rep, theme})}
            {/*<UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>*/}
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
