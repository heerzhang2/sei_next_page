/** @jsxImportSource @emotion/react */
"use client"
import {useSearchParams} from 'next/navigation'
// import RoutingContext from "../../../routing/RoutingContext";
import * as React from "react";
import {useEffect, useState} from "react";
import {Button, CCell, Table, TableBody, TableHead, TableRow, Text, useTheme,} from "customize-easy-ui-component";
// import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import {ReportViewProps,} from "../../common/base";
import {末尾链接, 落款单位地址,} from "../../common/rarelyVary";
import {报告设备详情,} from "./repView";
import {useRepMenuDirItems,} from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import {FormatOriginal,} from "./FormatOriginal";
import {Column_Setting} from "../../common/useFormatOmni";
import {useOfficialOmni,} from "../../common/useOfficialOmni";
import {ReportFirstPageHeadJd} from "../../park/rarelyVary";
import {UnqualifiedIspTable} from "../../common/general";
import {useItemsMapOmni} from "../../common/omni";
import {检验核准WaterJj, 注意事项WaterJj, 首页概况WaterJj} from "../waterJj/rarelyVary";
import Link from "next/link";
import {DirectLink} from "@/routing/Link";

export const ReportView: React.FunctionComponent<ReportViewProps> = ({
repId,  source: orc,  verId,rep,
}) => {
    const searchParams = useSearchParams()
    const [formatOriginal, setFormatOriginal] = useState(false)
    useEffect(() => {
        const original = searchParams.get('original')
        setFormatOriginal(!!original)
    }, [searchParams])
    console.log("ReportView 页面刷新", {original: formatOriginal})
    console.log("ReportView页面刷新orc:", orc ,"rep=",rep);
    // const { history } = useContext(RoutingContext);
    const Component=formatOriginal? FormatOriginal : OfficialReport;
    return (<>
        <Component  source={orc} verId={verId} repId={repId} rep={rep}/>
        <div css={{margin: '0.5rem', "@media print": {display: 'none'} }}>
            <Button intent="danger" variant="outline"
                  onPress={async () => {
                      // qs.original =formatOriginal? '' : '1';
                      // history.location.search = queryString.stringify(qs);
                      // const toUrl= history.createHref(history.location);
                      // history.push(toUrl);
                  }}>{formatOriginal? '正式报告':'格式化版原始记录'}
            </Button>
        </div>
    </>);
}

const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={...orc};
    // if(undefined!==orc?.绝缘阻o)  out.绝缘阻检=<div>电阻值{floatInterception(orc?.绝缘阻o,1)}MΩ</div>;
    return out;
});
const config报告 : Column_Setting[]=[{n:'',x:'检验结果',},{n:null,x:'结论'}, {n:'M',x:'备注',m:true}];
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'K1资料审查',ha:'1.1'},{name:'电气及控制系统',ha:'4.1'},
            {name:'K7载荷试验',ha:'7.1'},{name:'系留式观光气球专项',ha:'13.6'},{name:'现场检验条件确认',ha:'SiteCondition'}];


const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const searchParams = useSearchParams()
    const [printing, setPrinting] = useState(false)
    useEffect(() => {
        const printing = searchParams.get('print')
        setPrinting(!!printing)
    }, [searchParams])
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`);
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
                {ReportFirstPageHeadJd({theme, rep, mbbm: 'FJJ/YB-1009-1-2024'})}
                <div css={{
                    "@media print": {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 'calc(100vh - 8.5rem)',
                    }
                }}>
                    <Text variant="h3" css={{textAlign: 'center', "@media print": {fontSize: theme.fontSizes[5], marginTop: '1.5rem',},}}>
                      滑行车类游乐设施监督检验报告
                    </Text>
                    {首页概况WaterJj({theme, orc,rep })}
                    <div css={{textAlign: 'center', "@media print": {pageBreakAfter: 'always', pageBreakInside: 'avoid'}}}>
                        {落款单位地址}
                    </div>
                </div>
            </div>
            {注意事项WaterJj({
                rep,
                comply: '依据《大型游乐设施安全技术规程》（TSG 71-2023）制定，适用于大型游乐设施监督检验'
            })}
           <Link href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`} css={{"@media print": {textDecoration: 'none'}}}>
               <div css={{display: 'flex', flexDirection: 'column', justifyContent: 'center', "@media print": {pageBreakBefore: 'always',},}}>
                   <Text variant="h4" css={{textAlign: 'center'}}>大型游乐设施监督检验报告</Text>
               </div>
               <div css={{display: 'flex', justifyContent: 'space-between'}}>
                   <Text></Text>
                   <Text>报告编号：{rep.isp.no}</Text>
               </div>
           </Link>
           {报告设备详情({theme, orc, rep})}
           {检验核准WaterJj({orc,rep})}
            <div css={{"@media print": {paddingBottom: '13.3rem', pageBreakInside: 'avoid'}}}>
                <Text variant="h4" css={{textAlign: 'center',marginTop:'1rem'}}>大型游乐设施监督检验报告附页</Text>
                <div css={{display: 'flex', justifyContent: 'space-between'}}>
                    <Text></Text><Text>报告编号：{rep.isp.no}</Text>
                </div>
            </div>
           <Table fixed={ ["3.4%","6.4%","8.3%","5.3%","5%","%","12.6%","6.2%","9.8%"] }
                  css={ {borderCollapse: 'collapse',"@media print": {marginTop: '-13.3rem'}} }   tight  miniw={800}>
               <TableHead>
                   <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                       <TableRow>
                           <CCell><Text css={{fontSize:'0.7rem'}}>序号</Text></CCell>
                           <CCell colSpan={5}>检验项目及内容</CCell>
                           <CCell><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
                           <CCell>结论</CCell>
                           <CCell>备注</CCell>
                       </TableRow>
                   </DirectLink>
               </TableHead>
               <TableBody>
                   {renderIspContent}
               </TableBody>
           </Table>
           <Text css={{"@media print": {fontSize: '0.75rem'}}}></Text>
           <UnqualifiedIspTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing} titles={['序号','项目编号','检验不符合内容记录','复检结果','复检日期']}
                                label={<Text variant="h4">检验不符合项目内容及复检结果</Text>}/>
        </div>
        <div>
            <Link href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument?original=1#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>主要测量设备性能检查</Text>
            </Link>
            <Link href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>记事 、 备注</Text>
            </Link>
            <Link href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
            <Text id={'SiteCondition'} variant="h4" css={{"@media print": {display: 'none'}}}>附录：现场检验条件确认</Text>
            </Link>
        </div>
      {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}

export const contentItems = [
    {title: "Creating a page", url: "#creating-a-page"},
    {title: "Creating a layout", url: "#creating-a-layout"},
    {title: "Creating a nested route", url: "#creating-a-nested-route"},
    {title: "Nesting layouts", url: "#nesting-layouts"},
    {title: "Linking between pages", url: "#linking-between-pages"},
    {title: "API Reference", url: "#api-reference"},
    {title: "editfor-area-23", url: "#editfor-area-23"},
]