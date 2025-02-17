/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  CCell, Table, TableBody, TableRow, Text, TableHead, Cell,
} from "customize-easy-ui-component";
import {DirectLink} from "../../../routing/Link";
import {useMeasureCTable} from "../../hook/useMeasureOldVer";
import {config几何尺寸} from "./editGeometr";

/**安全距离记录 ；报告可打印的 测量：支持更大可能的复用性。 用了Hook就需要正规的React组件模式来做。
 * @param children  直接作为嵌套的组件也能传递过来的。
 * @param label 允许注入任意的DOM节点，不仅仅字符串的。
 * */
export const GeometricVw= ({children, orc, rep,label } : { orc: any, rep: any,label:any, children?: any}
) => {
  const renderMeasure=useMeasureCTable({rep,orc, config: config几何尺寸, allowableV:true});
  return <>
    { typeof label==='object' ?  <>{label}</>
       :
       <Text variant="h4" css={{marginTop: '1rem',
       }}>{label}</Text>
    }
    <Table fixed={ ["4%","19%","11%","%","6%","16%","12%","13%","8%"] }  css={ {borderCollapse: 'collapse' } } tight  miniw={800}>
      <TableHead>
        <TableRow>
          <CCell><Text css={{fontSize:'0.6rem'}}>序号</Text></CCell><CCell colSpan={3}>检验项目</CCell><CCell>单位</CCell><CCell>观测值</CCell>
          <CCell>结果值</CCell><CCell>允许偏差</CCell><CCell><Text css={{fontSize:'0.6rem'}}>检验结果</Text></CCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Geometric#Geometric`}>
          {renderMeasure}
          <TableRow>
            <CCell>备注</CCell>
            <Cell colSpan={8}><div css={{minHeight: '1rem', whiteSpace: 'pre-wrap'}}>
              {orc.几何备注 || '／'}
            </div></Cell>
          </TableRow>
        </DirectLink>
      </TableBody>
    </Table>
    <Text css={{fontSize:'0.8rem'}}>
      注：1、以设计图样要求作为检验结果判定依据。
      2、有多个起升机构的，其余机构的起升高度测量值和结果填在备注栏中。
      3、未测量或无需测量的，仅填检验结果栏。
    </Text>
  </>;
};

/*判断一个对象是否是某个构造函数的实例，使用instanceof, label instanceof Object;
 function isArray(obj) {
   return obj instanceof Array || (typeof obj !== 'undefined' && typeof obj.length === 'number' && typeof obj.splice === 'function' && !(obj.propertyIsEnumerable('length')));
 }
* */
