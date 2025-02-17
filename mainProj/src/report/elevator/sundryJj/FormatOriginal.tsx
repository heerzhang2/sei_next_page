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
import {useFormatOmniLikeSund} from "../hook/useFormatOmniLikeSund";
import {间隙记录表,} from "./view";
import {tItems现场} from "./Regular.O-1";
import {测量结果记录} from "../sundryDj/repView";
import {常用现场条件V1} from "../sundryDj/view";
import {useFormatOmniLikeSundJj} from "../hook/useFormatOmniLikeSundJj";

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
    //【限制】确认时间字段针对自拆分项目的只有一个日期录入。?多个日期 回调，还是录入字符串？
    const {renderIspContent} =useFormatOmniLikeSundJj({itRes:orc,ItemArs:impressionismAs?.Item, rep});
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
            <Text variant="h5" css={{textAlign:'center',}}>
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
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Survey?original=1#Survey`}>
                        {俩列检验设备概况({orc, rep, config: config设备概况})}
                    </DirectLink>
                </TableBody>
            </Table>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%", "6%", "3%", "2.5%", "2%", "7%", "%", "5%", "4.5%", "7%", "7%"] } css={{borderCollapse: 'collapse'}} tight miniw={800}>
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
            {测量结果记录({orc, rep, config: config观测数据, label: '七、观测数据及测量结果记录'})}

            {间隙记录表({orc, rep, config: config观测数据, label: '附录A 杂物电梯轿厢与层门之间的间隙、门间隙检验记录'})}

            <Text variant="h4" css={{marginTop: '1rem',}}>附录B：现场检验条件确认</Text>
            {常用现场条件V1({orc, rep, config:tItems现场})}
            <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}

