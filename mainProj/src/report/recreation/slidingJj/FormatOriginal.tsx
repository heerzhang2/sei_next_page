/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {RepLink, ReportViewProps,} from "../../common/base";
import {末尾链接,} from "../../common/rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import {useItemsMapOmni} from "../../common/omni";
import queryString from "query-string";
import {config观测数据, config观测数据2, config设备概况, tail观测} from "./orcBase";
import {tItems现场} from "./Regular.O-1";
import {Column_Setting, useFormatOmni} from "../../common/useFormatOmni";
import {设备概况页} from "../../park/views";
import {常用现场条件} from "../../park/viewX";
import {首页设备概况Cr} from "../../crane/bridgeDJ/repView";
import {UnqualifiedIspTable} from "../../common/general";
import {InstrumentVw, 测量允许检测, 测量备注三半, 测量备注两半, 测量结果单位} from "../waterJj/repView";
import {config主技术, tail主技} from "./MainTechnical";
import {填写须知} from "../../escalator/rarelyVary";
import {StrainStressVw} from "../waterJj/StrainStress";
import {AccelerationVw} from "../waterJj/Acceleration";
import {DirectLink} from "@/routing/Link";


export const config记录: Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'},{n:'M',x:'备注',t:'B',m:true},{n:'D',x:'不合格内容',t:'B'}];
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [rep,orc?._Oitems, theme]);
    const {renderIspContent} =useFormatOmni({itRes:orc,ItemArs:impressionismAs?.Item, config:config记录, rep, rcc:true,dfsz:'0.75',ltsz:'0.75',qtsz:'0.75'});
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
                <Text variant="h5" css={{textDecoration: 'underline'}}>FJJ/YB-1009-1-2024</Text>
            </div>
            <Text variant="h3" css={{
                textAlign: 'center',
                "@media (min-width:690px),print and (min-width:538px)": {
                    fontSize: theme.fontSizes[5],
                },
                marginTop: '2rem',
            }}>
              大型游乐设施监督检验原始记录
            </Text>
            <Text variant="h5" css={{textAlign: 'center',}}>（适用于系留式观光气球）</Text>
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
            <InstrumentVw orc={orc} rep={rep} label={'一、主要测量设备性能检查'}/>
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Survey`}>
                <Text variant="h4" css={{marginTop: '1rem',}}>二、设备概况</Text>
            </DirectLink>
            {设备概况页({orc, rep, config: config设备概况, theme,fixed: ["5%", "13.5%", "32%", "8%", "9%", "%"] })}
            <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                <Text variant="h4" css={{marginTop: '1rem',}}>三、检验记录</Text>
            </DirectLink>
            <Table fixed={ ["2%", "3.8%", "4.3%", "4.3%", "1%", "7%", "%","4.5%", "4.3%","4.1%","9.1%"] }
                   css={{borderCollapse: 'collapse'}} tight miniw={800}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell><Text css={{fontSize: '0.7rem'}}>序号</Text></CCell>
                            <CCell colSpan={5}>检验项目</CCell>
                            <CCell>检验内容和要求</CCell>
                            <CCell><Text css={{fontSize: '0.7rem'}}>检验结果</Text></CCell>
                            <CCell>结论</CCell>
                            <CCell>备注</CCell>
                            <CCell><Text css={{fontSize: '0.75rem'}}>存在问题描述</Text></CCell>
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <Text id={'_See_Memo1'} css={{"@media print": {fontSize: '0.75rem'}}}>
                注： 以下为项目为Ⅰ类监督检验项目：K1.1※、K1.2（2）※（3）、K1.5、K1.8※、K1.9※；其余项目均为Ⅱ类监督检验项目。
            </Text>
            <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','不合格内容描述','复检结果','复检日期']}
                    label={<Text variant="h4" css={{textAlign:'left'}}>四、检测不合格记录及复检结果</Text>}
            />
            <Text variant="h4" css={{marginTop: '1rem', "@media print": {pageBreakBefore: 'always', marginTop: 'unset',},
            }}>五、现场检验意见</Text>
            <Table>
                <TableBody>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/ALL`}>
                        <TableRow><CCell>
                                <Text variant="h1" css={{fontSize:orc?.检验结论?.length>12? '1.5rem':'3rem',
                                    margin: 'auto'}}>{orc?.检验结论}</Text>
                        </CCell></TableRow>
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
            <Text>注：特殊情况，应在备注中说明检验员所负责检验的项目编号。</Text>
            <Text variant="h4" css={{marginTop: '1rem',}}>六、备注</Text>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><Cell>
                       <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.大备注 ?? '／'}</div>
                    </Cell></TableRow>
                </RepLink>
            </TableBody></Table>
            <Text css={{fontSize:'0.75rem'}}>注：本备注的内容在报告中体现。</Text>
            <Text variant="h4" css={{marginTop: '1rem',}}>七、记事</Text>
            <Table><TableBody>
                <RepLink ori rep={rep} tag={'Witness'}>
                    <TableRow><Cell>
                        <div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>{orc.资料编号 || '／'}</div>
                    </Cell></TableRow>
                </RepLink>
            </TableBody></Table>

            {测量备注两半({orc, rep, config:config观测数据(orc),config2:config观测数据2,mem:'观备注',label:'八、观测数据及测量结果记录',children:tail观测})}
            {测量允许检测({orc, rep, config:config主技术,tag:'MainTechnical',mem:'主技备注',label:'附录A K7.5 主要技术参数测试',children:tail主技})}
            <StrainStressVw orc={orc} rep={rep} sensit label={'附录B K7.6应力测试记录'}/>
            <AccelerationVw orc={orc} rep={rep}  stnum={3} label={'附录C K7.7加速度（A）检测记录'}/>
            {常用现场条件({orc, rep, config: tItems现场,dcln:5,label:'附录D：现场检验条件确认'})}
        </div>
        {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
