/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table,  TableBody, TableRow, CCell, TableHead, Text,
    useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接, 落款单位地址,
} from "../../common/rarelyVary";
import {
    报告设备详情, 首页设备概况el,
} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {useLikeElevatorOfficial, } from "../hook/useLikeElevatorOfficial";
import {reportFirstPageHead, reportFirstPageHeadMa, 注意事项} from "../rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, 特殊项目编码} from "./FormatOriginal";
import {useItemsMap} from "../../common/config";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {UnqualifiedIspItemTable} from "../../common/general";

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
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2机房（机器设备间）及相关设备',ha:'2.1'},
                 {name:'4轿厢与对重',ha:'4.3'},{name:'8 试验',ha:'6.9'},{name:'附录F：现场检验条件确认',ha:'Conclusion'}];
/**直板手机目前超过6英寸，竖屏的(2024年见的)1.5K 2K分辨率的宽度有411px情形下的报告导航情况看似可以接受。横屏后2个半边效果比360px宽的手机好多了。
 * */
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/EL-JJ/ver/${verId}/${repId}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    const {renderIspContent} =useLikeElevatorOfficial({itRes:orc, orc,ItemArs:impressionismAs?.Item, model:'EL-JJ',ver:verId, repId:repId!});
    const [mapNoTag]=useItemsMap({ ItemArs:impressionismAs?.Item, noCB:特殊项目编码 });
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
       <div css={{
           "@media print": {
               height:'100vh',       //一张纸的高度！同时配合 pageBreakAfter: 'always', 来约束特定纸张大小；
               // overflowY: 'hidden'     //【注意局限性啊】一页内容，纸张规格；假如实际的数据超出自然不打印的！ 不加上打印重叠的；
           }
       }}>
        { reportFirstPageHeadMa({theme, rep, mbbm: 'FJB/TB-1001-1-0-2020'}) }
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
                   "@media (min-width:690px),print and (min-width:538px)": {
                       fontSize: theme.fontSizes[5],
                   },
                   marginTop: '1.5rem',
               }}>
                有机房曳引驱动电梯监督检验报告
               </Text>
               { 首页设备概况el( {theme, orc} ) }
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
          {注意事项({comply:'《电梯监督检验和定期检验规则——曳引与强制驱动电梯》（TSG T7001-2009）及1号、2号、3号修改单和《福建省电梯安全管理条例》制定，适用于有机房曳引驱动电梯安装、改造、重大维修监督检验',rep})}
          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Instrument`}>
              <div css={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>
              <Text variant="h4" >有机房曳引驱动电梯监督检验报告</Text>
              </div>
          </DirectLink>
          <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
          }}>报告编号：{rep.isp?.no}</Text>

        {报告设备详情({orc, repId:repId!, verId,rep})}

          <Table fixed={ ["3.5%","4%","8%","5%","13%","%","17%","8%"] }
                  css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell>序号</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验类别</Text></CCell>
                          <CCell colSpan={4}>检验项目及内容</CCell>
                          <CCell>检验结果</CCell><CCell>检验结论</CCell>
                      </TableRow>
                  </DirectLink>
              </TableHead>
              <TableBody>
                {renderIspContent}
              </TableBody>
          </Table>

          <UnqualifiedIspItemTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
        <div>
            <RouterLink href={`/report/EL-JJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>二、主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/EL-JJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text id={'Conclusion'} variant="h4" css={{"@media print": {display: 'none'}}}>附录F：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'EL-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}
