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
import {config观测数据, config观测数据2, config设备概况} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {设备概况页} from "../../park/views";
import {常用现场条件} from "../../park/viewX";
import {UnqualifiedIspTable} from "../../common/general";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {测量记录两半} from "../../safe/walk/repView";
import {扶手带速度偏差Jj} from "../supervi/repView";

export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
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
                注：1.“检测结果”栏：可用以下四种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“×”表示“不符合”，“△”表示“无法检测”。
                2.“检测结果判定”栏：可用以下三种符号表示记录内容：“√”表示“符合”；“/”表示“无此项”；“×”表示“不符合”。
                3、本原始记录适用曳引驱动的乘客与载货电梯、消防员电梯、防爆电梯、斜行乘客与载货电梯，以及强制驱动的载货电梯、斜行载货电梯的自行检测。
            </Text>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4">三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%", "4.5%", "2%", "2%", "1%", "7%",  "%","4.5%", "5%", "6.5%"] }
                   css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text css={{fontSize: '0.8rem'}}>序号</Text></CCell>
                            <CCell colSpan={4}>检验项目</CCell>
                            <CCell>项目名称</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell>检测结果</CCell>
                            <CCell><Text css={{fontSize: '0.8rem'}}>结果判定</Text></CCell>
                            <CCell><Text css={{fontSize: '0.7rem'}}>存在问题描述</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <Text css={{fontSize:'0.8rem'}}>
                注A2-1：<br/>
                (1)对于允许按照GB 16899—1997及更早期标准生产的受检设备，如果本附件A2.2.1.6条“工作制动器状态监测功能”、A2.2.1.7条“手动盘车装置”第(2)项、A2.2.2.7条“检修盖板与楼层
                板”第(2)项、A2.2.3.2条“扶手带速度监测装置”、A2.2.4.3条“梯级、踏板缺失保护”和A2.2.4.2条“梯级、踏板下陷保护”、A2.2.4.4条“非操纵逆转保护”、A2.2.4.5条“驱动元件保护”中的故
                障锁定功能未按照《电梯监督检验和定期检验规则——自动扶梯与自动人行道》(TSG T7005——2012)进行过检验，并且未按照《电梯监督检验和定期检验规则》进行过监督检验，自
                行检测时可以不检测，检测结果填写“/ ”；
                (2)如果本附件A2.2.1.8条“驱动链电气安全装置”、A2.2.2.6条“连续输送保护”第(2)项、A2.2.3.9条“围裙板防夹开关”未按照《电梯监督检验和定期检验规则》进行过监督检验，自行检测
                时可以不检测，检测结果填写“/ ”。
            </Text>
            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检测不符合内容描述','整改情况确认','确认日期']}
                    label={<Text variant="h4" css={{textAlign:'left'}}>四、检测不符合记录及整改情况确认</Text>}
            />
            <Text variant="h4" css={{marginTop: '1rem', "@media print": {pageBreakBefore: 'always', marginTop: 'unset',},
            }}>五、检测结论</Text>
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
            <Text>注：特殊情况，应在备注中说明检测人员所负责检验的项目编号。</Text>
            <Text id="Witness" variant="h4" css={{marginTop: '1rem',
            }}>六、见证材料</Text>
            <Table fixed={ ["12%", "%"] } css={{borderCollapse: 'collapse'}} tight miniw={800}><TableBody>
                    <RepLink ori rep={rep} tag={'Witness'}>
                        <TableRow><Cell>1、其他资料及编号</Cell>
                            <Cell>
                            <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.资料编号 ?? '／'}</div>
                        </Cell></TableRow>
                    </RepLink>
            </TableBody></Table>
            <Text variant="h4" css={{
                marginTop: '1rem',
            }}>七、备注</Text>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><Cell>
                       <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.大备注 ?? '／'}</div>
                    </Cell></TableRow>
                </RepLink>
            </TableBody></Table>
            {/*改参数 fixed: ["2%", "5%", "0", "6%", "%", "13%", "4.1%", "8%", "7%", "5%"] 调整表格尺寸  "0",没用栏目隐藏 */}
            {测量记录两半({orc, rep, config1: config观测数据,config2: config观测数据2, label: '八、观测数据及测量结果记录',
                fixed: ["2.8%", "7%", "3%", "6%", "%", "13%", "4.1%", "8%", "7%", "5%"],
                children: <Text css={{fontSize:'0.8rem'}}>
                    注：本表所列项目无测量时，观测数据和测量结果可不填写，但结果判定应填写，对不适用项填“/"。
                </Text>
            })}
            {扶手带速度偏差Jj({orc, rep, theme, label: "附录A：扶手带运行速度偏差试验"})}

            {常用现场条件({orc, rep, config: tItems现场, label:'附录B：现场检测条件确认',children:' '})}
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
