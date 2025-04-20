/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, Cell, TableHead, useTheme,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {CCellUnit, RepLink} from "../../common/base";

/**应变应力测试
 * */
export const StrainStressVw= ({orc, rep, label} :{orc:any, rep:any, label:any}
) => {
  const theme = useTheme();
  const rowsc=Math.ceil(orc?.测点表?.length/2) || 0;        //最多抵达行个数
  //因“测点1 2”列的并不在config字段，无法上const [renderRows,]=useRep2hTableViewer(config测点表, '测点表', orc,true,true,true);
  return <>
    <div  css={{"@media print": {paddingBottom: '3.5rem', pageBreakInside: 'avoid'}} }>
      { typeof label==='object' ?  <>{label}</>
          :
          <Text variant="h4" css={{marginTop: '1rem',
          }}>{label}</Text>
      }
    </div>
    <Table id={'StrainStress'} fixed={ ["8.2%","3%","39%","11%","%"] }
           css={ {borderCollapse: 'collapse', "@media print": {marginTop: '-3.5rem'}} }  tight  miniw={800}>
      <TableBody>
        <RepLink ori rep={rep} tag={'StrainStress'}>
          <TableRow>
            <CCell colSpan={2}>仪器型号</CCell>
            <CCell>{orc?.应仪器型}</CCell>
            <CCell>应变片型式</CCell>
            <CCell>{orc?.应变片型}</CCell>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>天气情况</CCell>
            <CCell>{orc?.应天气}</CCell>
            <CCell>风速</CCell>
            <CCellUnit unit={'m/s'}>{orc.应风速}</CCellUnit>
          </TableRow>
          <TableRow>
            <CCell colSpan={2}>温度</CCell>
            <CCellUnit unit={'℃'}>{orc.应温度1}</CCellUnit>
            <CCell>温度</CCell>
            <CCell>{orc?.应温度2}</CCell>
          </TableRow>
          <TableRow>
            <CCell>测试工况</CCell>
            <Cell colSpan={4}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.应试工况}
            </div></Cell>
          </TableRow>
        </RepLink>
      </TableBody>
    </Table>
    <Table fixed={ ["10%","20%","20%","10%","20%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell>测量点</CCell>
          <CCell>应变值（με）</CCell>
          <CCell>应力值（MPa）</CCell>
          <CCell>测量点</CCell>
          <CCell>应变值（με）</CCell>
          <CCell>应力值（MPa）</CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <RepLink ori rep={rep} tag={'StrainStress'}>
          { (new Array(rowsc)).fill(null).map((_, i:number) => {
            return <TableRow key={i}>
              { [1,2].map((raft, g:number) => {
                return <React.Fragment key={g}>
                  <CCell>{i*2+g<orc?.测点表?.length && '测点'+(i*2+raft) }</CCell>
                  <CCell>{orc?.测点表?.[i*2+g]?.μ}</CCell>
                  <CCell>{orc?.测点表?.[i*2+g]?.M}</CCell>
                </React.Fragment>;
              }) }
            </TableRow>;
          }) }
        </RepLink>
       </TableBody>
      </Table>
      <Table fixed={ ["10%","%"] }  css={ {borderCollapse: 'collapse' } }  tight  miniw={800}>
        <TableBody>
          <RepLink ori rep={rep} tag={'StrainStress'}>
            <TableRow>
              <Cell colSpan={2} css={ {"@media print": { height: undefined },  padding: 0,} }>
                测点示意图：&nbsp;{orc?.测点示意}
                <div css={{display: 'flex',justifyContent: 'space-around',alignItems: 'center', margin: '1px 0' }}>
                  { orc?._FILE_测点?.url &&
                      <img src={process.env.NEXT_PUBLIC_OSS_ENDP+orc?._FILE_测点?.url} alt={orc?._FILE_测点?.url}
                           css={{
                             maxHeight: '14cm',   //在这个元素的上一级元素可以自己加一个固定高度值，就像一张纸打印的应该多高的取值。这个用固定高度会导致图片自动的横竖比例不均衡压缩=会变形啊！24cm是纸张大约最多高度=报告最大图片高。
                             maxWidth: '-webkit-fill-available',
                             [theme.mediaQueries.lg]: {maxHeight: '18cm', maxWidth: undefined},           //普通图片+大屏幕限制高度才是关键的。
                             //【想法】大约一整页height: '96vh' +底下一个行的。
                             "@media print": { maxWidth: '100%'},        //对A4纸张竖版的高度26cm基本都是图片整张纸，这里没考虑多个图片在宽度方向上的并排布局：可用软件合并。
                           }}
                      />
                  }
                </div>
              </Cell>
            </TableRow>
            <TableRow>
              <CCell>测试结果</CCell>
              <Cell>最危险应力点为第 {orc?.危应第}    点（工况：  {orc?.危工况}              ）<br/>
                安全系数n=  {orc?.安全系数}  </Cell>
            </TableRow>
            <TableRow>
              <CCell>测试结论</CCell>
              <CCell>{orc?.危结论 || '／'}</CCell>
            </TableRow>
            <TableRow>
              <CCell>备注</CCell>
              <Cell><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
                {orc.应变备注 || '／'}
              </div></Cell>
            </TableRow>
          </RepLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.8rem'}}>
      注：可另附记表单。无需检验的，仅填测试结论栏。
    </Text>
  </>;
};
