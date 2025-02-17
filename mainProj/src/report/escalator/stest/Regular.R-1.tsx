/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text, useTheme, Button, useMMenuBarOcup,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import {ReportViewProps,} from "../../common/base";
import {末尾链接, 落款单位地址,} from "../../common/rarelyVary";
import {报告设备详情,} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, } from "./FormatOriginal";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {useItemsMapOmni} from "../../common/omni";
import {Column_Setting} from "../../common/useFormatOmni";
import {useOfficialOmni2H} from "../../common/useOfficialOmni";
import {UnqualifiedIspTable} from "../../common/general";
import {ReportFirstPageHeadJd} from "../../park/rarelyVary";
import {注意事项EscaTest, 首页概况EscaTest} from "../rarelyVary";

export const ReportView: React.FunctionComponent<ReportViewProps> = ({
repId,  source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const formatOriginal =qs && !!qs.original;      //改成  格式化版原始记录
    const { history } = useContext(RoutingContext);
    const Component=formatOriginal? FormatOriginal : OfficialReport;
    return (<>
        <Component  source={orc} verId={verId} repId={repId} rep={rep}/>
        <div css={{margin: '0.5rem', "@media print": {display: 'none'} }}>
            <Button intent="danger" variant="outline"
                  onPress={async () => {
                      qs.original =formatOriginal? '' : '1';
                      history.location.search = queryString.stringify(qs);
                      const toUrl= history.createHref(history.location);
                      history.push(toUrl);
                  }}>{formatOriginal? '正式报告':'格式化版原始记录'}
            </Button>
        </div>
    </>);
}
const config报告 : Column_Setting[]=[{n:null,x:'结论'}, ];
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2.1.1使用资料',ha:'2.1.1'},
         {name:'2.2.3扶手装置和围裙板',ha:'2.2.3.6'},{name:'现场检验条件确认',ha:'SiteCondition'}];

const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const {isWideSrc, } = useMMenuBarOcup(false);
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`);
    //【特殊部分】orc?._Oitems: 动态，用户定制的；
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [verId, repId,rep, orc?._Oitems, theme]);
    const {renderIspContent} =useOfficialOmni2H({orc,ItemArs:impressionismAs?.Item, rep, config:config报告, bOmt:'0' });
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:false});
    const ispsListHead=isWideSrc? <><TableRow>
                    <CCell rowSpan={2}><Text css={{fontSize:'0.75rem'}}>序号</Text></CCell><CCell colSpan={4}>检测项目</CCell>
                    <CCell rowSpan={2}><Text css={{fontSize:'0.8rem'}}>检测结果</Text></CCell>
                    <CCell rowSpan={2}><Text css={{fontSize:'0.75rem'}}>序号</Text></CCell><CCell colSpan={4}>检测项目</CCell>
                    <CCell rowSpan={2}><Text css={{fontSize:'0.8rem'}}>检测结果</Text></CCell>
                </TableRow>
                <TableRow>
                    <CCell colSpan={3}>编号</CCell><CCell>名称</CCell>
                    <CCell colSpan={3}>编号</CCell><CCell>名称</CCell>
                </TableRow></>
            :
            <><TableRow>
                <CCell rowSpan={2}><Text css={{fontSize:'0.75rem'}}>序号</Text></CCell><CCell colSpan={4}>检测项目</CCell>
                <CCell rowSpan={2}><Text css={{fontSize:'0.8rem'}}>检测结果</Text></CCell>
            </TableRow>
            <TableRow>
                <CCell colSpan={3}>编号</CCell><CCell>名称</CCell>
            </TableRow></>;
    const ispsTblfixed=isWideSrc? ["2.6%","5.3%","2%","2%","33%","6.5%","2.8%","5.3%","2%","2%","%","6.4%"] : ["4.5%","12%","2%","2%","%","11.5%"];
  return (
    <React.Fragment>
      {rootMenu}
       <div css={{"@media not print": {marginTop: '1rem', marginBottom: '1rem'}}}>
            <div css={{"@media print": {height: '100vh'}}}>
                {ReportFirstPageHeadJd({theme, rep, mbbm: 'FJB/TC-1022-2023'})}
                <div css={{
                    "@media print": {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 'calc(100vh - 8.5rem)',
                    }
                }}>
                    <Text variant="h3" css={{textAlign: 'center', "@media print": {fontSize: theme.fontSizes[5], marginTop: '1.5rem',},}}>
                      自动扶梯与自动人行道自行检测报告
                    </Text>
                    {首页概况EscaTest({theme, orc,rep })}
                    <div css={{textAlign: 'center', "@media print": {pageBreakAfter: 'always', pageBreakInside: 'avoid'}}}>
                        {落款单位地址}
                    </div>
                </div>
            </div>
            {注意事项EscaTest({
                rep,
                comply: '依据《电梯自行检测规则》（TSG T7008-2023）制定，适用于自动扶梯与自动人行道的自行检测'
            })}
           <div css={{"@media print": {pageBreakBefore: 'always',minHeight: '100vh',alignContent:'center'}}}>
               <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
                   <div css={{
                       display: 'flex',
                       flexDirection: 'column',
                       justifyContent: 'center',
                       "@media print": {
                           pageBreakBefore: 'always',
                       },
                   }}>
                       <Text variant="h4">一、设备概况</Text>
                   </div>
                   <div css={{display: 'flex', justifyContent: 'space-between'}}>
                       <Text></Text>
                       <Text>报告编号：{rep.isp.no}</Text>
                   </div>
               </DirectLink>
               {报告设备详情({theme, orc, rep})}
           </div>
            <div css={{"@media print": {pageBreakBefore: 'always'}}}>
                <Text variant="h2" css={{textAlign: 'center', marginTop: '1rem',
                }}>自动扶梯与自动人行道自行检测报告附页</Text>
                <div css={{display: 'flex', justifyContent: 'space-between'}}>
                    <Text></Text>
                    <Text>报告编号：{rep.isp.no}</Text>
                </div>
            </div>
            <Table fixed={ ispsTblfixed } tight miniw={800}
                          css={{borderCollapse: 'collapse', }}>
                    <TableHead>
                        <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                          {ispsListHead}
                        </DirectLink>
                    </TableHead>
                <TableBody>
                {isWideSrc? renderIspContent?.map((orow: any, i:number) => {
                        if(1===i%2) return null;
                        const orow2=renderIspContent?.[i+1];
                        return <TableRow key={i}>
                            {orow}
                            {orow2}
                        </TableRow>;
                    })
                    :
                    renderIspContent?.map((orow: any, i:number) => {
                        return <TableRow key={i}>
                            {orow}
                        </TableRow>;
                    })
                }
                </TableBody>
            </Table>
           <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检测不符合内容描述','整改情况确认','确认日期']}
                                label={<Text variant="h4">检测不符合记录及整改情况确认</Text>}/>
        </div>
        <div>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>见证材料 、备注</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
            <Text id={'SiteCondition'} variant="h4" css={{"@media print": {display: 'none'}}}>附录：现场检测条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
