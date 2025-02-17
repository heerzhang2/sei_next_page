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
import {useLikeElevatorOfficial, } from "../../elevator/hook/useLikeElevatorOfficial";
import {reportFirstPageHeadR, 注意事项} from "../rarelyVary";
import {setupItemAreaRoute} from "./orcIspConfig";
import queryString from "query-string";
import {FormatOriginal, 特殊项目编码} from "./FormatOriginal";
import {useItemsMap} from "../../common/config";
import RoutingContext from "../../../routing/RoutingContext";
import {useContext} from "react";
import {UnqualifiedIspItemTable} from "../../common/general";
import {itemResultTransform} from "../../common/helper";
import {inspectionContent} from "../../elevator/Periodical/repConfig";
import {useLikeElevatorIspNormalize} from "../../hook/useLikeElevatorIspNormalize";

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
const JumpTags=[{name:'设备概况',ha:'Survey'},{name:'2驱动与转向站',ha:'2.6'},
                 {name:'4扶手装置和围裙板',ha:'4.3'},{name:'8自动启动、停止',ha:'8.1'},{name:'附录B：现场检验条件确认',ha:'Conclusion'}];
const 检验结果替换 =((orc: { [x: string]: any; }) => {
    let out={... orc};       //特殊测量数据需规整计算后替代原本orc的对应字段。
    out['带缘距']=`水平距离:${orc['水平距离v']}mm;垂直距离:${orc['垂直距离v']}mm`;
    out['护壁板隙']=`护壁板间隙:${orc['护板间隙v']??''}mm`;
    if(orc['制停距扶v'])
        out['停距扶梯']=`制停距离:${orc['制停距扶v']??''}m`;
    if(orc['制停距道v'])
        out['停距人行']=`制停距离:${orc['制停距道v']??''}m`;
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
    const [rootMenu]=useRepMenuDirItems(JumpTags, [],`/reportView/ESCL-DJ/ver/${verId}/${repId}`);
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    //对orc => itRes做个显示层面转换：有些测量数据需要规整后替代原本orc的对应字段的显示内容。
    const itRes =React.useMemo(()=>检验结果替换(orc), [orc]);
    const {renderIspContent} =useLikeElevatorOfficial({itRes,orc,ItemArs:impressionismAs?.Item, model:'ESCL-DJ',ver:verId, repId:repId!});
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
        { reportFirstPageHeadR({theme,rep, mbbm:'FJB/TC-1001-2-2021'}) }
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
                 自动扶梯与自动人行道定期检验报告
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
          {注意事项({comply:'《电梯监督检验和定期检验规则——自动扶梯与自动人行道》（TSG T7005-2012，含1号、2号、3号修改单）以及《福建省电梯安全管理条例》制定，适用于自动扶梯与自动人行道的定期检验',rep})}
          <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/Instrument`}>
              <div css={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>
              <Text variant="h4">自动扶梯与自动人行道定期检验报告</Text>
              </div>
          </DirectLink>
          <Text css={{display: 'flex',flexDirection: 'row-reverse',marginRight: '2rem'
          }}>报告编号：{rep.isp?.no}</Text>

        {报告设备详情({orc, repId:repId!, verId,rep})}

          <Table fixed={ ["3.5%","4%","8%","5%","13%","%","17%","8%"] }
                  css={ {borderCollapse: 'collapse',marginTop: '1rem'} }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/ESCL-DJ/ver/${verId}/${repId}/ALL`}>
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
            <RouterLink href={`/report/ESCL-DJ/ver/${verId}/${repId}/Instrument#Instrument`}>
                <Text variant="h4" css={{"@media print": {display: 'none'}}}>二、主要测量设备性能检查</Text>
            </RouterLink>
            <RouterLink href={`/report/ESCL-DJ/ver/${verId}/${repId}/Conclusion#Conclusion`}>
                <Text id={'Conclusion'} variant="h4" css={{"@media print": {display: 'none'}}}>附录B：现场检验条件确认</Text>
            </RouterLink>
        </div>
      {末尾链接({template:'ESCL-DJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}
