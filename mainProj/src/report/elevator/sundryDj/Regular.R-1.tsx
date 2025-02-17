/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text, useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {末尾链接, 落款单位地址,} from "../../common/rarelyVary";
import {报告设备详情,} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, } from "./FormatOriginal";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {ReportFirstPageHeadSimpNQR, } from "../../safe/rarelyVary";
import {UnqualifiedIspItemTableX} from "../../common/general";
import {useItemsMapOmni} from "../../common/omni";
import {useOfficialOmniLikeSund} from "../hook/useOfficialOmniLikeSund";
import {注意事项Sund, 首页概况Sund} from "./viewFirst";


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
//页面哈希路由方式；
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'3.1.4 使用资料',ha:'3.1'},
    {name:'3.3.5制动试验',ha:'3.3.3'},{name:'现场检验条件确认',ha:'SiteCondition'}];


/**正式报告
 * 这个需要增加orc依赖 orc?._Oitems
 * */
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
    const {renderIspContent} =useOfficialOmniLikeSund({orc,ItemArs:impressionismAs?.Item, rep, });
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:false});
   return (
    <React.Fragment>
      {rootMenu}
       <div css={{"@media not print": {marginTop: '1rem', marginBottom: '1rem'}}}>
            <div css={{"@media print": {height: '100vh'}}}>
                {ReportFirstPageHeadSimpNQR({theme, rep, mbbm: 'FJB/QC-1010-1-2023'})}
                <div css={{
                    "@media print": {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: 'calc(100vh - 125px)',     //剪掉上面头部的高度：适应特定纸张的布局: 125是可变的
                    }
                }}>
                    <Text variant="h3" css={{textAlign: 'center', "@media print": {fontSize: theme.fontSizes[5], marginTop: '1.5rem',},}}>
                    电梯定期检验报告
                    </Text>
                    {首页概况Sund({theme, orc, rep})}
                    <div css={{textAlign: 'center', "@media print": {pageBreakAfter: 'always', pageBreakInside: 'avoid'}}}>
                        {落款单位地址}
                    </div>
                </div>
            </div>
            {注意事项Sund({
                rep,
                comply: '依据《电梯监督检验和定期检验规则》（TSG T7001-2023）制定，适用于适用于曳引驱动杂物电梯、强制驱动杂物电梯、液压驱动杂物电梯、防爆杂物电梯的定期检验'
            })}
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

            <div css={{"@media print": {paddingBottom: '13.3rem', pageBreakInside: 'avoid'}}}>
                <div css={{display: 'flex', justifyContent: 'space-between',minHeight:'1rem'}}>
                    <Text></Text><Text></Text>
                </div>
            </div>
            {/*【表格工具】  JSON.parse(orc?._tblFixed??'[]')  ; 【表格调整】  直接替换目标表的fixed字段 */}
            <Table fixed={ ["4%",  "5%", "4%", "6%", "%", "23%"] } tight miniw={800}
                         css={{borderCollapse: 'collapse', "@media print": {marginTop: '-13.3rem'}}}>
                <TableHead>
                    <DirectLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/ALL`}>
                        <TableRow>
                            <CCell rowSpan={2}><Text css={{fontSize: '0.8rem'}}>序号</Text></CCell>
                            <CCell colSpan={4}>检验项目</CCell>
                            <CCell rowSpan={2}>检验结果</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell colSpan={3}>编号</CCell>
                            <CCell colSpan={1}>名称</CCell>
                        </TableRow>
                    </DirectLink>
                </TableHead>
                <TableBody>
                    {renderIspContent}
                </TableBody>
            </Table>
            <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
        </div>
        <div>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>见证材料 、备注</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
            <Text id={'SiteCondition'} variant="h4" css={{"@media print": {display: 'none'}}}>附录：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}

