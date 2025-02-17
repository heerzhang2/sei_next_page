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
    报告设备详情, 首页概况Park,
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
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'C2资料和文件审查',ha:'2.1'},
    {name:'C3.8主要零部件检查',ha:'3.8'},{name:'C4.3额定载荷试验',ha:'4.3'},{name:'附录11：现场检验条件确认',ha:'SiteCondition'}];

//正式报告这两个行对应检验结果栏目替换成测量数据的情况。  8.9.2.2  ；  8.10（1）  ；//特殊测量数据需规整计算后替代原本orc的对应字段。
const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={...orc};
    if(orc['绝缘阻v'])
        out['绝缘电阻']=<div>绝缘电阻{orc['绝缘阻v']}MΩ</div>;
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
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/PARK-JJ/ver/${verId}/${repId}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    const {renderIspContent} =useOfficialOmniLikeCraneSi({orc,ItemArs:impressionismAs?.Item, model:'PARK-JJ',ver:verId, repId:repId!, itResCB:检验结果替换});
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

          {注意事项Park({rep,comply:'是依据《起重机械安全技术规程》（TSG 51—2023），对起重机械进行安装改造重大修理监督检验的结论报告'}) }
          <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/Instrument`}>
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
          <Table fixed={ ["3%","8%","10%","11%","6%","%","7%","7%","8%"] }
                 css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/PARK-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell rowSpan={2}>序号</CCell>
                          <CCell colSpan={5}>监督检验项目及内容和要求</CCell>
                          <CCell rowSpan={2}><Text css={{fontSize:'0.7rem'}}>监督检验结果</Text></CCell>
                          <CCell rowSpan={2}>结论</CCell>
                          <CCell rowSpan={2}>备注</CCell>
                      </TableRow>
                      <TableRow>
                          <CCell colSpan={4}>监督检验项目</CCell>
                          <CCell>监督检验内容和要求</CCell>
                      </TableRow>
                  </DirectLink>
              </TableHead>
              <TableBody>
                  {renderIspContent}
              </TableBody>
          </Table>
          <Table fixed={ ["6%","65%","%"]  }   css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
              <TableBody>
                  <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Witness#Witness`}>
                      <TableRow>
                          <CCell>备注</CCell>
                          <Cell colSpan={2}>{multilines2Html(orc.大备注,  (txt,i)=>{
                              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                          })}</Cell>
                      </TableRow>
                  </DirectLink>
                  <TableRow>
                      <Cell colSpan={2}>检验人员：</Cell>
                      <Cell>日期：2021-01-31</Cell>
                  </TableRow>
                  <TableRow>
                      <Cell colSpan={2}>校核人员：</Cell>
                      <Cell>日期：2021-01-31</Cell>
                  </TableRow>
              </TableBody>
          </Table>
        <UnqualifiedIspItemTableX rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
        <div>
            <RouterLink href={`/report/PARK-JJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/PARK-JJ/ver/${verId}/${repId}/Witness#Witness`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>五、技术资料和工作见证材料 六、记事</Text>
            </RouterLink>
            <RouterLink href={`/report/PARK-JJ/ver/${verId}/${repId}/SiteCondition#SiteCondition`}>
                <Text id={'SiteCondition'} variant="h4" css={{"@media print": {display: 'none'}}}>附录11：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'PARK-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}

/*
  <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Instrument#Instrument`}>
      <div css={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          "@media print": {
              pageBreakBefore: 'always',
          },
      }}>
          <Text variant="h4" >起重机械安装改造重大修理监督检验报告附页</Text>
      </div>
  </DirectLink>
  <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
  }}>报告编号：{rep.isp?.no}</Text>
* */
