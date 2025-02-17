/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Table, TableBody, TableRow, CCell, TableHead, Text,
    useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接, 落款单位地址,
} from "../../common/rarelyVary";
import {
    报告设备详情, 首页设备概况,
} from "./repView";
import {useRepMenuDirItems, } from "../../hook/useMainRepUrlOr";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, } from "./FormatOriginal";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {useOfficialOmniLikeCraneSi} from "../hook/useOfficialOmniLikeCraneSi";
import {ReportFirstPageHeadSimpNQR, } from "../../safe/rarelyVary";
import {UnqualifiedIspItemTableX} from "../../common/general";
import {useItemsMapOmni} from "../../common/omni";
import {注意事项SigB} from "../rarelyVary";

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
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2作业环境和外观检查',ha:'2.1'},
    {name:'5安全保护和防护装置检查',ha:'5.7'},{name:'8 电气检查',ha:'8.10'},{name:'附录B：现场检验条件确认',ha:'Conclusion'}];

//正式报告这两个行对应检验结果栏目替换成测量数据的情况。  8.9.2.2  ；  8.10（1）  ；//特殊测量数据需规整计算后替代原本orc的对应字段。
const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={... orc};               //特殊测量数据需规整计算后替代原本orc的对应字段。
    out['接地阻']=<div>零线重复接地{orc['TN接Ωv']}Ω</div>;
    out['小500']=<div>绝缘电阻{orc['对地阻v']}MΩ</div>;       //`护壁板间隙:${orc['护板间隙v']??''}mm`;out['停距扶梯']=`制停距离:${orc['制停距扶v']??''}m`;
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
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/SINGB-IN/ver/${verId}/${repId}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    // const itRes =React.useMemo(()=>检验结果替换(orc), [orc]);
    const {renderIspContent} =useOfficialOmniLikeCraneSi({orc,ItemArs:impressionismAs?.Item, model:'SINGB-IN',ver:verId, repId:repId!, itResCB:检验结果替换});
    const [mapNoTag]=useItemsMapOmni({ ItemArs:impressionismAs?.Item, notCheckNo:true});
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
        { ReportFirstPageHeadSimpNQR({theme,rep, mbbm:'FJB/QJ1001-2-2020'}) }
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
                桥（门）式起重机首次检验报告
               </Text>
               { 首页设备概况( {theme, orc, rep} ) }
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
          <RouterLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/FrontCover`}>
            {注意事项SigB({comply:'是依据《起重机械定期检验规则》（TSG Q7015-2016），对桥式、门式起重机进行首次检验的结论报告', rep}) }
          </RouterLink>
          <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/Instrument`}>
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

          <Table fixed={ ["3%","7%","7%","13.9%","4%","%","9.8%","4.6%","5%"] }
                 css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/SINGB-IN/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell>序号</CCell>
                          <CCell colSpan={5}>检验项目及其内容</CCell>
                          <CCell>检验结果</CCell>
                          <CCell>结论</CCell>
                          <CCell>备注</CCell>
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
            <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>一、主要检验仪器设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text id={'Conclusion'} variant="h4" css={{"@media print": {display: 'none'}}}>附录B：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'SINGB-IN',verId, repId: repId||''})}
    </React.Fragment>
  );
}
