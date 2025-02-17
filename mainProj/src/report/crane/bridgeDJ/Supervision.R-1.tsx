/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table,  TableBody, TableRow, Cell, CCell, TableHead, Text,
    useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接, 落款单位地址,
} from "../../common/rarelyVary";
import {报告设备详情,
    首页设备概况Cr
} from "./repView";
import {multilines2Html} from "../../tools";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {useLikeCraneOfficial, } from "../hook/useLikeCraneSupervision";
import {reportFirstPageHead, reportFirstPageHeadNmaNQR, 注意事项, 注意事项D} from "../rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, 特殊项目编码} from "./FormatOriginal";
import {useItemsMap} from "../hook/useItemsMap";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {UnqualifiedIspItemTable} from "../../common/general";
import {首页设备概况el} from "../../elevator/RoomLessDJ/repView";


//正式报告的显示打印。 默认打印A4:210X297mm纸张。 打印特别处理URL尾部加上?print=1确保全部都显示出，不要交互式可以折叠的。
//不需要每个verId新搞一个文件的，甚至不需要搞新的组件，可以只需内部逻辑处理。
//verId 实际在PeriodicalInspection.E配置文件中reportTemplate配上的。#不是路由器注入提供！！
//两个可打印的”原始记录“说话： 格式化版原始记录 pk 原生版原始记录。 url+: ?original=1,来区分到底显示的是 正式报告 还是 格式化版原始记录。
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
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'C2资料和审查',ha:'2.1.2'},
                 {name:'C3设备检查',ha:'3.3'},{name:'C4性能试验',ha:'3.13'},{name:'附录11现场条件',ha:'Conclusion'}];
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/CR-DJ/ver/${verId}/${repId}`);
   //若是正式报告可能和原始记录的差异化：各个列拆分位置不一样，列内容 列数不一样。
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    //电梯 机电的 需要转换原始记录给正式报告的显示字段内容：承压类报告没必要做数据库存储转换给正式报告显示内容的环节，而且还是X.Y下标数组配置模式的检验项目；另外不合格显示项目也是动态生成的。
    //动态的转换：正式报告：需要翻译的，格式化原始记录不需要勾叉转换汉字的。
    // const itRes =React.useMemo(()=>itemResultTransform(orc,inspectionContent), [orc]);
    const {renderIspContent} =useLikeCraneOfficial({itRes:orc,ItemArs:impressionismAs?.Item, model:'CR-DJ',ver:verId, repId:repId!});
    const [mapNoTag]=useItemsMap({ ItemArs:impressionismAs?.Item, noCB:特殊项目编码 });
    //手机菜单可安排的：一层7位置+二层9位置。报告最多安排16个菜单。 加了, {time: Date()});：URL强制刷新！才能真正跳转成功到位置
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
              { reportFirstPageHeadNmaNQR({theme, rep, mbbm:'FJB/QC1002-1-2020'}) }
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
                      "@media print": {
                          marginTop: '1.5rem',
                      }
                  }}>
                    起重机械定期（首次）检验报告
                  </Text>
                  { 首页设备概况Cr( {theme, orc,} ) }
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
          {注意事项D({rep, comply:'《起重机械安全技术规程》（TSG 51—2023），对起重机械进行定期（首检）检验的结论报告'})}
          <div>
              <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Instrument`}>
              <Text variant="h4" css={{
                  textAlign: 'center',
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>
                起重机械定期（首次）检验报告
              </Text>
              </DirectLink>
              <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
              }}>报告编号：{rep.isp?.no}</Text>
          </div>
        {报告设备详情({orc, repId:repId!, verId,rep})}

          <Table fixed={ ["3%","7%","9%","11%","6%","%","7%","7%","8%"] }
                  css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell rowSpan={2}>序号</CCell>
                          <CCell colSpan={5}>检验项目及内容和要求</CCell>
                          <CCell rowSpan={2}><Text>检验结果</Text></CCell>
                          <CCell rowSpan={2}><Text>结论</Text></CCell>
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
          <Table fixed={ ["6%","65%","%"]  }   css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
              <TableBody>
                  <DirectLink  href={`/report/CR-DJ/ver/${verId}/${repId}/Evaluation`}>
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

          <UnqualifiedIspItemTable rep={rep} orc={orc} mapNoTag={mapNoTag} printing={printing}/>
      </div>
        <div>
            <RouterLink href={`/report/CR-DJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/CR-DJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text id={'Conclusion'} variant="h4" css={{"@media print": {display: 'none'}}}>附录11：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'CR-DJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}


//原来看到：容器定检主报告的 附页2实际可嵌套在壁厚测定报告后紧跟的做法（标记测厚位置和数据表放在图片上的方式）且检验人员签字可以2个人的。
/*
        {!printing && <div id={'Conclusion'}>
            <RouterLink href={`/report/CR-DJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/CR-DJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录13：现场检验条件确认</Text>
            </RouterLink>
        </div>
        }
* */