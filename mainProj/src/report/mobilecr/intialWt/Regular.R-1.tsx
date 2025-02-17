/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text, useTheme, Button,
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
import {useOfficialOmni, } from "../../common/useOfficialOmni";
import {UnqualifiedIspTable} from "../../common/general";
import {ReportFirstPageHeadJd} from "../../park/rarelyVary";
import {检验编制核准McrWt} from "./rarelyVary";
import {首页概况Mbcr} from "../viewFirst";
import {注意事项Mbcr} from "../viewAttention";

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


const config报告 : Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'}, {n:'M',x:'备注',m:true}];
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2技术资料审查',ha:'2.1.2'},
           {name:'3.11电气系统检查',ha:'3.9'},{name:'4.3额定载荷试验',ha:'4.3.2.1'},{name:'现场检验条件确认',ha:'SiteCondition'}];
//原报告的序号把小项目都计算在内的， 这里序号仅计算结论项：
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`);
    //【特殊部分】orc?._Oitems: 动态，用户定制的；
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep,orc, theme});
    }, [verId, repId,rep, orc?._Oitems, theme]);
    const {renderIspContent} =useOfficialOmni({orc,ItemArs:impressionismAs?.Item, rep, config:config报告, });
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:false});

  return (
    <React.Fragment>
      {rootMenu}
       <div css={{"@media not print": {marginTop: '1rem', marginBottom: '1rem'}}}>
            <div css={{"@media print": {height: '100vh'}}}>
                {ReportFirstPageHeadJd({theme, rep, mbbm: 'FJB/QN1010-2-1-2023'})}
                <div css={{
                    "@media print": {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 'calc(100vh - 8.5rem)',
                    }
                }}>
                    <Text variant="h3" css={{textAlign: 'center', "@media print": {fontSize: theme.fontSizes[5], marginTop: '1.5rem',},}}>
                      起重机械委托定期（首次）检验报告
                    </Text>
                    { 首页概况Mbcr( {theme, orc, rep} ) }
                    <div css={{textAlign: 'center', "@media print": {pageBreakAfter: 'always', pageBreakInside: 'avoid'}}}>
                        {落款单位地址}
                    </div>
                </div>
            </div>
           {注意事项Mbcr({rep,
               comply:'是依据《起重机械安全技术规程》（TSG 51—2023）及第1号修改单，对起重机械进行委托定期（首次）检验的结论报告。（适用于流动式起重机）'
           })}
           <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
               <div css={{display: 'flex', flexDirection: 'column', justifyContent: 'center', "@media print": {pageBreakBefore: 'always',},}}>
                   <Text variant="h4" css={{margin: 'auto'}}>起重机械定期（首次）检验报告</Text>
               </div>
               <div css={{display: 'flex', justifyContent: 'space-between'}}>
                   <Text></Text>
                   <Text>报告编号：{rep.isp.no}</Text>
               </div>
           </DirectLink>
           {报告设备详情({theme, orc, rep})}
           {检验编制核准McrWt({orc,rep,jyprf:'下次委托检验'})}
            <div css={{"@media print": {paddingBottom: '13.3rem', pageBreakInside: 'avoid'}}}>
                <Text variant="h5" css={{textAlign: 'center'}}>起重机械定期（首次）检验报告</Text>
                <div css={{display: 'flex', justifyContent: 'space-between',minHeight:'1rem'}}>
                    <Text></Text><Text>报告编号：{rep.isp.no}</Text>
                </div>
            </div>
           <Table fixed={ ["3.6%","4.6%","8.1%","6.1%","7.1%","%","11%","6%","6%"] }
                  css={ {borderCollapse: 'collapse',"@media print": {marginTop: '-13.3rem'}} }   tight  miniw={800}>
               <TableHead>
                   <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                       <TableRow>
                           <CCell><Text css={{fontSize:'0.7rem'}}>序号</Text></CCell><CCell colSpan={4}>检验项目</CCell><CCell>检验内容和要求</CCell>
                           <CCell>检验结果</CCell><CCell><Text css={{fontSize:'0.8rem'}}>结论</Text></CCell><CCell><Text css={{fontSize:'0.8rem'}}>备注</Text></CCell>
                       </TableRow>
                   </DirectLink>
               </TableHead>
               <TableBody>
                   {renderIspContent}
               </TableBody>
           </Table>
           <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检验不符合内容记录','复检结果','复检日期']}
                                label={<Text variant="h4">检验不符合项目内容及复检结果</Text>}/>
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
