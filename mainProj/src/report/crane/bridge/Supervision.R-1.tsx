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
    首页设备概况jj
} from "./repView";
import {multilines2Html} from "../../tools";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {useLikeCraneOfficial, } from "../hook/useLikeCraneSupervision";
import {reportFirstPageHead,  注意事项} from "../rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, 特殊项目编码} from "./FormatOriginal";
import {useItemsMap} from "../hook/useItemsMap";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";


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
                 {name:'C3设备检查',ha:'3.1'},{name:'C4性能试验',ha:'3.13'},{name:'附录13现场条件',ha:'Conclusion'}];
const OfficialReport: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const qs= queryString.parse(window.location.search);
    const printing =qs && !!qs.print;
    const theme= useTheme();
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/CR-JJ/ver/${verId}/${repId}`);
   //若是正式报告可能和原始记录的差异化：各个列拆分位置不一样，列内容 列数不一样。
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    //电梯 机电的 需要转换原始记录给正式报告的显示字段内容：承压类报告没必要做数据库存储转换给正式报告显示内容的环节，而且还是X.Y下标数组配置模式的检验项目；另外不合格显示项目也是动态生成的。
    //动态的转换：正式报告：需要翻译的，格式化原始记录不需要勾叉转换汉字的。
    // const itRes =React.useMemo(()=>itemResultTransform(orc,inspectionContent), [orc]);
    const {renderIspContent} =useLikeCraneOfficial({itRes:orc,ItemArs:impressionismAs?.Item, model:'CR-JJ',ver:verId, repId:repId!});
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
        { reportFirstPageHead({theme, No: rep.isp?.no}) }
        <Text variant="h3" css={{
              textAlign:'center',
              "@media (min-width:690px),print and (min-width:538px)": {
                fontSize: theme.fontSizes[5],
              },
               marginTop: '1.5rem',
            }}>
           桥（门）式起重机安装改造重大修理监督检验报告
        </Text>
        <div css={{
            "@media print": {
              height:'20mm'
            }
          }}>
        </div>
          <div css={{
              "@media print": {
                  minHeight: '-webkit-fill-available',
                  // maxHeight: '110mm'
              }
          }}>
              { 首页设备概况jj( {theme, orc} ) }
          </div>

            <div css={{
              "@media print": {
                height:'15mm'
              }
            }}>
            </div>
            <div  css={{
              textAlign:'center',
              "@media print": {
                pageBreakAfter:'always',
                pageBreakInside:'avoid'
              }
            }}>
                {落款单位地址}
            </div>
          {注意事项}
          <div>
              <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/Instrument`}>
              <Text variant="h4" css={{
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>一、桥（门）式起重机安装改造重大修理监督检验报告</Text>
              </DirectLink>
              <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
              }}>报告编号：{rep.isp?.no}</Text>
          </div>
        {报告设备详情({orc, repId:repId!, verId,rep})}

          <Table fixed={ ["3%","8%","10%","11%","6%","%","7%","7%","8%"] }
                  css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}
          >
              <TableHead>
                  <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/ALL`}>
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
          <Table fixed={ ["6%","40%","%"]  } printColWidth={ ["6%","40%","%"] }  css={ {borderCollapse: 'collapse' } }>
              <TableBody>
                  <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/Evaluation`}>
                      <TableRow>
                          <CCell>备注</CCell>
                          <Cell colSpan={2}>{multilines2Html(orc.大备注,  (txt,i)=>{
                              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                          })}</Cell>
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

          { orc?.unq?  <div>
              <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem',
                  "@media print": {pageBreakBefore: 'always', },
              }}>报告编号：{rep.isp?.no}</Text>
                  <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                          css={ {borderCollapse: 'collapse',    } } >
                      <TableBody>
                          <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/ReCheck#ReCheck`}>
                              <TableRow>
                                  <CCell  colSpan={5}><Text variant="h4">检验不合格项目内容</Text></CCell>
                              </TableRow>
                          </DirectLink>
                      </TableBody>
                  </Table>
                  <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                          css={ {borderCollapse: 'collapse' } }
                  >
                      <TableHead>
                          <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/ReCheck#ReCheck`}>
                              <TableRow>
                                  <CCell>序号</CCell>
                                  <CCell>类别/编号</CCell>
                                  <CCell>检验不合格内容记录</CCell>
                                  <CCell>复检结果</CCell>
                                  <CCell>复检日期</CCell>
                              </TableRow>
                          </DirectLink>
                      </TableHead>
                      <TableBody>
                          {orc?.unq?.map((bug:any, i:number) => {
                              return (
                                  <TableRow key={i}>
                                      <DirectLink key={i} href={`/report/CR-JJ/ver/${verId}/${repId}/${mapNoTag.get(bug.no)}`}>
                                          <CCell>{i+1}</CCell>
                                          <CCell>{bug.c}/{bug.no}</CCell>
                                          <CCell>{bug.b}</CCell>
                                      </DirectLink>
                                      <DirectLink key={i+'r'} href={`/report/CR-JJ/ver/${verId}/${repId}/ReCheck?from=${bug.no}`}>
                                          <CCell>{bug.rs}</CCell>
                                          <CCell>{bug.d}</CCell>
                                      </DirectLink>
                                  </TableRow>
                              );
                          }) }
                      </TableBody>
                  </Table>
              </div>
              :
              printing?  null :
             <DirectLink  href={`/report/CR-JJ/ver/${verId}/${repId}/ReCheck#ReCheck`}>
                  <Button variant="ghost" intent='primary'  css={{"@media print": {display: 'none'} }}  noBind
                  >检验不合格项目内容及复检结果</Button>
             </DirectLink>
          }
      </div>
        <div>
            <RouterLink href={`/report/CR-JJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/CR-JJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text id={'Conclusion'} variant="h4" css={{"@media print": {display: 'none'}}}>附录13：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'CR-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}


//原来看到：容器定检主报告的 附页2实际可嵌套在壁厚测定报告后紧跟的做法（标记测厚位置和数据表放在图片上的方式）且检验人员签字可以2个人的。
/*
        {!printing && <div id={'Conclusion'}>
            <RouterLink href={`/report/CR-JJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/CR-JJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录13：现场检验条件确认</Text>
            </RouterLink>
        </div>
        }
* */