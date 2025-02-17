/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text,
    useTheme, Button, Cell,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接, 落款单位地址,
} from "../../common/rarelyVary";
import {
    报告设备详情,
} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, } from "./FormatOriginal";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {useOfficialOmniLikeCraneSi} from "../../crane/hook/useOfficialOmniLikeCraneSi";
import {ReportFirstPageHeadSimpNQR, } from "../../safe/rarelyVary";
import {UnqualifiedIspItemTableX} from "../../common/general";
import {useItemsMapOmni} from "../../common/omni";
import {注意事项Park, } from "../../crane/rarelyVary";
import {multilines2Html} from "../../tools";
import {useOfficialOmniLikeElevatorJj} from "../hook/useOfficialOmniLikeElevatorJj";
import {首页概况ElevJj} from "../viewFirst";
import {注意事项Elevjj} from "../viewAttention";
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
//页面哈希路由方式
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2.1通道与通道门',ha:'2.1'},
    {name:'4.1轿顶电气装置',ha:'4.1'},{name:'8.1平衡系数试验',ha:'8.1'},{name:'现场检验条件确认',ha:'SiteCondition'}];

//正式报告这两个行对应检验结果栏目替换成测量数据的情况。 特殊测量数据需规整计算后替代原本orc的对应字段。
const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={...orc};
    if(orc?.['空高差H'] && (orc?.['进导程v'] || orc?.['自垂距v'] || orc?.['轿顶间v'] || orc?.['横梁间v']))
        out['全压缓冲']=<div>A1:{floatInterception(orc?.['进导程v'] - orc?.['空高差H'], 3)}m
            A2:{floatInterception(orc?.['自垂距v'] - orc?.['空高差H'], 3)}m
            A3:{floatInterception(orc?.['轿顶间v'] - orc?.['空高差H'], 3)}m
            A4:{floatInterception(orc?.['横梁间v'] - orc?.['空高差H'], 3)}m
        </div>;
    if(undefined!==orc?.['制导行v'] || undefined!==orc?.['测行程v'])  out['制导程']=<div>计算制导行程{orc?.['制导行v']}m 测量值{orc?.['测行程v']}m</div>;
    if(undefined!==orc?.['撞缓许o'] || undefined!==orc?.['撞缓距v'])  out['越程距']=<div>最大允许值{orc?.['撞缓许o']}mm 测量值{orc?.['撞缓距v']}mm</div>;
    if(undefined!==orc?.['衡系数'])  out['平衡系']=<div>平衡系数:{orc?.['衡系数']}%</div>;
    if(undefined!==orc?.['速百分'])  out['梯速']=<div>百分比:{orc?.['速百分']}%</div>;
    return out;
});
/**直板手机目前超过6英寸，竖屏的(2024年见的)1.5K 2K分辨率的宽度有411px情形下的报告导航情况看似可以接受。横屏后2个半边效果比360px宽的手机好多了。
 * 本模板异常？： 原始记录和报告不符合常规一一对应，有些自拆分项目没有体现到报告的项目行当中。
 * */
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/ROL-JJ/ver/${verId}/${repId}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    const {renderIspContent} =useOfficialOmniLikeElevatorJj({orc,ItemArs:impressionismAs?.Item, model:'ROL-JJ',ver:verId, repId:repId!, itResCB:检验结果替换});
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
        { ReportFirstPageHeadSimpNQR({theme,rep, mbbm:'FJB/QB-1002-1-2023'}) }
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
                 无机房曳引驱动电梯监督检验报告
               </Text>
               { 首页概况ElevJj( {theme, orc, rep} ) }
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
          {注意事项Elevjj({rep,comply:'依据《电梯监督检验和定期检验规则——曳引与强制驱动电 梯》（TSG T7001-2009）及1号、2号、3号修改单和《福建省电梯安全管理条 例》制定，适用于无机房曳引驱动电梯安装、改造、重大维修监督检验'}) }
          <DirectLink  href={`/report/ROL-JJ/ver/${verId}/${repId}/Instrument`}>
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
         {报告设备详情({orc, repId:repId!, verId,rep})}
          <Table fixed={ ["3%","3%","6%","4%","13.5%","%","18.5%","5%"] }
                 css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/ROL-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell>序号</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验类别</Text></CCell>
                          <CCell colSpan={4}>检验项目及内容</CCell><CCell><Text>检验结果</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem'}}>检验结论</Text></CCell>
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
            <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>二、主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>六、见证材料 七、备注</Text>
            </RouterLink>
            <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
                <Text id={'SiteCondition'} variant="h4" css={{"@media print": {display: 'none'}}}>附录F：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'ROL-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}

