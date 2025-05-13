import * as React from "react";
import {eqpTypeAllMap} from "../../dict/eqpComm";
import Image from 'next/image'
import {businessCatspMap} from "@/common/sei";


export const 首页概况EscaJj= ({theme, orc, original,rep} :{theme: any, orc:any, original?:boolean,rep:any}
) => {
  const 施工单位='重大修理'===orc.检验类别? orc.大修单 :
                '改造监检'===orc.检验类别? orc.改造单 :
                     orc.安装单;
  return  <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工单位名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{施工单位 ?? '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备代码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.设备代码 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>设备类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{eqpTypeAllMap.get(orc?.设备类别) || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{businessCatspMap.get(rep?.isp?.bsType!) ?? '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>检验日期：</RCell>
        {orc.检验日期1? <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期1} 至 {orc.检验日期}</CCell>
            :
            <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.检验日期}</CCell>
        }
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监察识别码：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.监察识别码 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>设  备  号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.eqpcod}</CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

/**没有MA  机电报告；  固定高度 8.5rem
 * */
export const ReportFirstPageHeadJd = ({ rep, mbbm }: { rep: any; mbbm: string }) => {
  return (
      <div className="flex justify-between items-center text-center h-[8.5rem] print:-mt-1">
        <div className="overflow-hidden">
          {/*<Embed className="w-[155px] mx-auto -mt-[0.65rem]" width={78} height={35} />*/}
          <span className="relative -mt-[1.1rem] text-[0.9rem]" />
        </div>
        <div>
          <Image src="/images/reportNoQR.png" width={140} height={140} alt="二维码" />
        </div>
        <div className="overflow-hidden flex flex-col justify-evenly">
          <span  className="text-[0.8rem]">
            {mbbm}
          </span>
          <div className="flex items-center md:mr-4 print:mr-4">
            <span className="text-sm">报告编号：</span>
            <span className="underline">
              {rep?.isp?.no}
            </span>
          </div>
        </div>
      </div>
  )
}
