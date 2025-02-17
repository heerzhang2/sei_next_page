/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {multilines2Html} from "../../tools";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import {UnqualifiedIspItemTableX} from "../../common/general";
import queryString from "query-string";
import {config观测数据, config设备概况} from "./orcBase";
import {
   技术资料见证, 记事的, 俩列检验设备概况
} from "../../park/views";
import {首页概况ElevJj} from "../../elevator/viewFirst";
import {tItems现场} from "./Regular.O-1";
import {useFormatOmniLikeYyWt} from "../hook/useFormatOmniLikeYyWt";
import {MonitoringFaciliVw} from "./viewMonit";
import {常用现场条件V1} from "../sundryDj/view";
import {测量结果记录} from "../sundryDj/repView";

//格式化版的原始记录 和 正式报告：目的功能定位叉开。前者只是用于打印目的。后者不仅要打印还要导航编辑器区块。
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
    const {renderIspContent} =useFormatOmniLikeYyWt({itRes:orc,ItemArs:impressionismAs?.Item, rep});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
  return (
    <React.Fragment>
        <div css={{
            "@media not print": {
                marginTop: '1rem',
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
                textAlign: 'center',
                "@media (min-width:690px),print and (min-width:538px)": {
                    fontSize: theme.fontSizes[5],
                },
                marginTop: '2rem',
            }}>
                电梯定期检验原始记录
            </Text>
            <Text variant="h5" css={{textAlign: 'center',}}>（杂物电梯）</Text>
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
            <Table fixed={["16%", "34%", "16%", "34%"]} css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableBody>
                    {俩列检验设备概况({orc, rep, repId: repId!, verId, config: config设备概况})}
                </TableBody>
            </Table>
            <Text css={{fontSize:'0.8rem'}}>
                注：1、“检验结果”栏：可用以下四种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“×”表示“不符合”，“△”表示“无法检验”。<br/>
                2、本原始记录适用曳引驱动的乘客与载货电梯、消防员电梯、防爆电梯、斜行乘客与载货电梯，以及强制驱动的载货电梯、斜行载货电梯的定
                期检验。
            </Text>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={["2%", "6.2%", "3%", "3%", "2%", "8%", "%", "6%", "5%", "6%"]}
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
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <Text id={'_See_Memo1'}>
                注：<br/>
                (1)对于允许按照GB 7588—1995《电梯制造与安装安全规范》及更早期标准生产的电梯，如果本记录
                A1.2.4.7条“手动紧急操作装置”第(4)项中的电气安全装
                置和A1.3.7条“上行超速保护装置试验”未按照《电梯监督检验和定期检验规则—曳引与强制驱动电梯》(TSG
                T7001—2009)进行过检验，并且未按照《电梯监
                督检验和定期检验规则》（TSG T7001—2023）进行过监督检验，定期检验时可以不检验，检验结果填写“/”；
            </Text><br/>
            <Text id={'_See_Memo2'}>
                (2)如果本记录A1.2.3.4条“门旁路装置”、A1.2.3.6条“制动器状态监测功能”、A1.3.8条“轿厢意外移动保护装置试验”未按照《电梯监督检验和定期检验规则—曳
                引与强制驱动电梯》等4个安全技术规范(TSG T7001～TSG T7004，含第2、第3号修改单)或者《电梯监督检验和定期检验规则》（TSG
                T7001—2023）进行
                过监督检验，定期检验时可以不检验，检验结果填写“/”；
            </Text><br/>
            <Text id={'_See_Memo3'}>
                (3)如果本记录A1.2.4.3条“制动器”第(1)项、A1.2.5.2条“包覆带”第(2)项和第(3)项、A1.2.6.9条“轿厢语音播报系统”、A1.2.7.5条“门的运行与导向”第(3)
                项、A1.2.7.7条“紧急开锁”第(2)项未按照《电梯监督检验和定期检验规则》（TSG T7001—2023）进行过监督检验，定期检验时可以不检验，检验结果填
                写“/”；
            </Text><br/>
            <Text id={'_See_Memo4'}>
                (4)本记录A1.2.3.3条第(3)项“接地故障保护措施”、A1.2.5.1条“钢丝绳”、A1.2.5.2条“包覆带”、A1.2.5.3条“悬挂装置端部固定”、A1.2.7.2条“门间隙”仅适用于超
                过注册登记日期或安装监检合格日期15年的电梯定期检验。
            </Text>
            <Text variant="h4" css={{
                marginTop: '1rem',
                "@media print": {
                    pageBreakBefore: 'always', marginTop: 'unset',
                },
            }}>四、结论</Text>
            <Table>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text variant="h1" css={{fontSize: '4rem'}}>{orc.检验结论}</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableBody>
            </Table>
            <Table fixed={["15%", "%", "15%", "20%"]} css={{borderCollapse: 'collapse'}}>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
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
            }}>五、技术资料和工作见证材料</Text>
            {技术资料见证({orc, rep})}
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>六、记事</Text>
            {记事的({orc, rep})}
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>七、备注</Text>
            <Table>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                        <TableRow>
                            <Cell>{multilines2Html(orc.大备注, (txt, i) => {
                                return <React.Fragment key={i}>{(i !== 0) && <br/>}<Text>{txt}</Text></React.Fragment>
                            })}</Cell>
                        </TableRow>
                    </DirectLink>
                </TableBody>
            </Table>
            <Text>注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
            {测量结果记录({orc, rep, config: config观测数据, label: '八、观测数据及测量结果记录'})}

            <Text variant="h4" css={{marginTop: '1rem',}}>附录B：现场检验条件确认</Text>
            {常用现场条件V1({orc, rep, config: tItems现场})}
            <MonitoringFaciliVw orc={orc} rep={rep}/>
            <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
