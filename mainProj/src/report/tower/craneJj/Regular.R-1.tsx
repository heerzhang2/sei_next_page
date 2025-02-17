/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text, useTheme, Button, Cell,
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
import {useOfficialOmniLikeMobCrIn} from "../../mobilecr/hook/useOfficialOmniLikeMobCrIn";
import {floatInterception} from "../../../common/tool";
import {首页概况Park} from "../../park/Supervision/repView";
import {注意事项Park} from "../../crane/rarelyVary";

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
//页面哈希路由方式
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2资料和文件审查',ha:'2.1.2'},
    {name:'3.11电气系统检查',ha:'3.11.1'},{name:'4.3额定载荷试验',ha:'4.3'},{name:'现场检验条件确认',ha:'SiteCondition'}];

//【注意】和 ‘config观测数据’ 里配的规则u: 'MΩ',c: '四', d: '1',save: false}, ],保持一致性。
const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={...orc};
    out['绝缘电阻']=`绝缘电阻值:${floatInterception(orc['绝缘阻o'],1,)??''}MΩ`;
    return out;
});
/**正式报告
 * */
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({rep, theme});
    }, [verId, repId,rep, theme]);
    const {renderIspContent} =useOfficialOmniLikeMobCrIn({orc,ItemArs:impressionismAs?.Item, rep, itResCB:检验结果替换});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:false});
   return (
    <React.Fragment>
      {rootMenu}
      <div css={{
            "@media not print": {
              marginTop:'1rem',
              marginBottom: '1rem'
            }
          }}
      >
       <div css={{"@media print": {height:'100vh'} }}>
        { ReportFirstPageHeadSimpNQR({theme,rep, mbbm:'FJB/QC-1010-1-2023'}) }
           <div css={{
               "@media print": {
                   display: 'flex',
                   flexDirection: 'column',
                   justifyContent: 'space-between',
                   height: 'calc(100vh - 125px)',     //剪掉上面头部的高度：适应特定纸张的布局: 125是可变的
               }
           }}>
               <Text variant="h3" css={{
                   textAlign:'center',
                   "@media print": {
                       fontSize: theme.fontSizes[5],
                       marginTop: '1.5rem',
                   },
               }}>
                起重机械安装改造重大修理监督检验报告
               </Text>
               { 首页概况Park( {theme, orc, rep} ) }
               <div css={{
                   textAlign:'center',
                   "@media print": {
                       pageBreakAfter:'always',
                       pageBreakInside:'avoid'
                   }
               }}>
                 {落款单位地址}
               </div>
           </div>
       </div>
       {注意事项Park({rep,comply:'是依据《起重机械安全技术规程》（TSG 51—2023），对起重机械进行安装改造重大修理监督检验的结论报告'
       }) }
          <DirectLink  href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument`}>
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
          </DirectLink>
         {报告设备详情({orc, rep})}
         <div css={{"@media print": {pageBreakBefore: 'always',},}}></div>
          <Table fixed={ ["3%","7%","8%","10.2%","8.1%","%","14.5%","6.2%","7%"] }
                    css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
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
        <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
        <div css={{"@media print": {display: 'none'}}}>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" >主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" >见证材料 、备注</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
                <Text id={'SiteCondition'} variant="h4" >附录：现场检验条件确认</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/WeightCorrespond#WeightCorrespond`}>
                <Text id={'WeightCorrespond'} variant="h5" >附录8：表一：最大幅度相应的额定起重量</Text>
            </RouterLink>
            <RouterLink href={`/report/${rep?.modeltype}/ver/${verId}/${repId}/WeightAmplitude#WeightAmplitude`}>
                <Text id={'WeightAmplitude'} variant="h5" >附录8：表二：最大额定起重量相应的最大幅度</Text>
            </RouterLink>
        </div>
      {末尾链接({template:rep?.modeltype,verId, repId: repId||''})}
    </React.Fragment>
  );
}
