/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import {ReportViewProps,} from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {填写须知} from "../../escalator/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import queryString from "query-string";
import {config观测数据, config设备概况} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {UnqualifiedIspTable} from "../../common/general";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {MeasureTowerVw, WitnessMemoVw} from "./views";
import {ThicknessVw} from "../craneJj/viewThicknes";
import {MonitoringSysVw} from "../craneJj/viewMonitori";
import {SafeDistanceVw} from "../craneJj/viewSafDist";
import {AxisVertVw} from "../craneJj/viewAxisVert";
import {AttachmentDeviceVw} from "../craneJj/viewAttachD";
import {LadderVw} from "../craneJj/Ladder";
import {常用现场条件, 设备概况页} from "@/report/common/view";

export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'M',x:'备注',t:'B',m:true},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
        //依赖项不用orc 加orc?._Oitems 就够用了
    }, [rep,orc?._Oitems, theme]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:false,dfsz:'0.75'});
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

            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%","3%","5%","5%","4.4%","%","3.4%","3%","3.2%","5.1%"] } css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
                <TableHead>
                    <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell rowSpan={2}><Text css={{fontSize:'0.7rem'}}>序号</Text></CCell>
                            <CCell colSpan={5}>检验项目及内容和要求</CCell>
                            <CCell rowSpan={2}><Text css={{fontSize:'0.6rem'}}>检验结果</Text></CCell>
                            <CCell rowSpan={2}>结论</CCell>
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
            <Text css={{fontSize:'0.8rem'}}>
                注：
                (1)对于允许按照GB 7588—1995《电梯制造与安装安全规范》及更早期标准生产的电梯，如果本记录 A1.2.4.7条第(4)项中的电气安全装置和A1.3.7条未按照《电梯监督检验和定期检
                验规则—曳引与强制驱动电梯》(TSG T7001—2009)进行过检验，并且未按照《电梯监督检验和定期检验规则》（TSG T7001—2023）进行过监督检验，自行检测时可以不检测，检
                测结果填写“/”；
                (2)如果本记录A1.2.3.4条、A1.2.3.6条、A1.3.8条未按照《电梯监督检验和定期检验规则—曳引与强制驱动电梯》等4个安全技术规范(TSG T7001～TSG T7004，含第2、第3号修改单)
                或者《电梯监督检验和定期检验规则》（TSG T7001—2023）进行过监督检验，自行检测时可以不检测，检测结果填写“/”；
                (3)如果本记录A1.2.4.3条第(1)项、A1.2.5.2条第(2)项和第(3)项未按照《电梯监督检验和定期检验规则》（TSG T7001—2023）进行过监督检验，自行检测时可以不检测，检测结果填
                写“/”。
                A1.3.14仅适用于曳引驱动乘客电梯和曳引驱动消防员电梯
            </Text>

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
                            <CCell css={{border: 'none'}}>检测人员</CCell>
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
            <WitnessMemoVw orc={orc} rep={rep} titles={['五、技术资料和工作见证材料','六、备注']} bhTil='编号'>
                <Text css={{fontSize:'0.75rem'}}>注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
            </WitnessMemoVw>
            <MeasureTowerVw config={config观测数据} orc={orc} rep={rep}  mem='观测备注' bhsp={1} noxm label='附录1 观测值及测量结果记录表'
                            fixed={ ["2.7%", "7.5%", "5%", "8%", "%", "4.5%", "9%", "8%", "5.9%"] } >
                <Text css={{fontSize: '0.7rem'}}>注：1、未测量或无需测量的，仅填检验结果栏。<br/>
                    2、其他需记录的测量值和结果值填在备注栏中。<br/>
                    3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。<br/>
                    4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。</Text>
            </MeasureTowerVw>
            <ThicknessVw orc={orc} rep={rep}
                         label={<Text variant="h4" css={{marginTop: '1rem',fontSize:'1.3rem'}}>附录2：C3.7.3 主要受力结构件断面有效厚度观测值及测量结果记录表</Text>}
            />
            <LadderVw orc={orc} rep={rep} label={'附录3：C3.7.4 梯子、走台和栏杆观测值及测量结果记录表'}/>
            <MonitoringSysVw orc={orc} rep={rep} label={'附录4：C4.2.2.5和C4.9.7安全监控管理系统参数验证表'}/>
            <SafeDistanceVw orc={orc} rep={rep} label={'附录5：C5.(3) 安全距离观测值及测量结果记录表'}/>
            <AxisVertVw orc={orc} rep={rep} noZj label={'附录6：C5.(5)塔身轴心线的垂直度测值及测量结果记录表'}/>
            {常用现场条件({orc, rep, config: tItems现场, label:'附录7：现场检验条件确认'})}
            <AttachmentDeviceVw orc={orc} rep={rep} nos={'8'} label={'附录8 C3.4附设装置检验项目'}/>
            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检验不符合内容描述','复检结论','确认日期']}
                          label={<Text variant="h4" css={{textAlign:'left'}}>附录9 检验不合格项目内容</Text>}
            />
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
