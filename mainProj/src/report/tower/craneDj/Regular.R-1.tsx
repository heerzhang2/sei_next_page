/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text, useTheme, Button, Cell,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import {ReportViewProps,} from "../../common/base";
import {末尾链接, 落款单位地址,} from "../../common/rarelyVary";
import {config设备, 报告设备详情拆,} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, } from "./FormatOriginal";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {ReportFirstPageHeadSimpNQR, } from "../../safe/rarelyVary";
import {useItemsMapOmni} from "../../common/omni";
import {Column_Setting} from "../../common/useFormatOmni";
import {useOfficialOmni, } from "../../common/useOfficialOmni";
import {UnqualifiedIspTable} from "../../common/general";
import {注意事项Tower} from "../../crane/rarelyVary";
import {首页概况Tower} from "./viewFirst";
import {floatInterception} from "../../../common/tool";

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

const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={...orc};
    if(undefined!==orc?.绝缘阻o)  out.绝缘电阻=<div>{floatInterception(orc?.绝缘阻o,1)}MΩ</div>;
    return out;
});
const config报告 : Column_Setting[]=[{n:'',x:'检验结果',}, {n:null,x:'结论'},{n:'M',x:'备注',m:true}];
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2.2使用过程技术资料',ha:'2.2.8'},
         {name:'3.12安全保护和防护装置检查',ha:'3.12.4'},{name:'现场检验条件确认',ha:'SiteCondition'}];

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
    const {renderIspContent} =useOfficialOmni({orc,ItemArs:impressionismAs?.Item, rep, config:config报告, itResCB:检验结果替换});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:false});
  return (
    <React.Fragment>
      {rootMenu}
       <div css={{"@media not print": {marginTop: '1rem', marginBottom: '1rem'}}}>
            <div css={{"@media print": {height: '100vh'}}}>
                {ReportFirstPageHeadSimpNQR({theme, rep, mbbm: 'FJB/TC-1001-1-0-2023'})}
                <div css={{
                    "@media print": {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 'calc(100vh - 125px)',
                    }
                }}>
                    <Text variant="h3" css={{textAlign: 'center', "@media print": {fontSize: theme.fontSizes[5], marginTop: '1.5rem',},}}>
                        起重机械定期（首次）检验报告
                    </Text>
                    {首页概况Tower({theme, orc, rep})}
                    <div css={{textAlign: 'center', "@media print": {pageBreakAfter: 'always', pageBreakInside: 'avoid'}}}>
                        {落款单位地址}
                    </div>
                </div>
            </div>
           {注意事项Tower({rep,
               comply:'是依据《起重机械安全技术规程》(TSG 51—2023)，对塔式起重机进行定期（首次）检验的结论报告'
           }) }
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
           {报告设备详情拆({orc, rep,config:config设备, spIdx:13,})}
            <div css={{"@media print": {paddingBottom: '13.3rem', pageBreakInside: 'avoid'}}}>
                <div css={{display: 'flex', justifyContent: 'space-between',minHeight:'1rem'}}>
                    <Text></Text><Text></Text>
                </div>
            </div>
           <Table fixed={ ["3%","7%","8%","10.2%","8.1%","%","14.5%","6.2%","7%"] }
                  css={ {borderCollapse: 'collapse',"@media print": {marginTop: '-13.3rem'}} }   tight  miniw={800}>
               <TableHead>
                   <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                       <TableRow>
                           <CCell rowSpan={2}>序号</CCell>
                           <CCell colSpan={5}>检验项目及内容和要求</CCell>
                           <CCell rowSpan={2}><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
                           <CCell rowSpan={2}>结论</CCell>
                           <CCell rowSpan={2}>备注</CCell>
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
           <Table fixed={ ["6%","58%","%"]  }  css={ {borderCollapse: 'collapse' } }>
               <TableBody>
                   <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                       <TableRow>
                           <CCell>备注</CCell>
                           <Cell colSpan={2}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                               {orc.大备注 || '／'}
                           </div></Cell>
                       </TableRow>
                   </DirectLink>
                   <TableRow>
                       <CCell colSpan={2} css={{height: 'inherit'}}><div css={{height: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'space-between',alignContent: 'space-between',alignItems: 'flex-start'}}>
                           <div><Text>检验人员：</Text></div>
                           <div css={{width: '100%',textAlign: 'end'}}><Text >日期：</Text>2022-12-31</div>
                       </div></CCell>
                       <CCell css={{height: 'inherit'}}><div css={{height: '100%',display: 'flex',flexDirection: 'column',justifyContent: 'space-between',alignContent: 'space-between',alignItems: 'flex-start'}}>
                           <div><Text >校核人员：</Text></div>
                           <div css={{width: '100%',textAlign: 'end'}}><Text >日期：</Text>2021-01-31</div>
                       </div></CCell>
                   </TableRow>
               </TableBody>
           </Table>
           <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','检验项目编号','检验不合格项目内容','复检结果','复检日期']}
                                label={<Text variant="h4">检验不合格项目内容</Text>}/>
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
