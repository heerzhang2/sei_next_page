import * as React from "react";
// import {CCell, Embed, RCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
// import {FadeImage} from "../../comp/FadeImage";
// import Img_Ma from "../../images/MA.png";
// import Img_Fbpi from "../../images/FBPI.png";
// import Img_ReportNoQR from "../../images/reportNoQR.png";
import {AttentionPoint} from "../common/rarelyVary";
import {CCell, FlexibleTable, TableBody, TableCell, TableFooter, TableHeader, TableRow} from "@/components/flexible-table";

/**报告封面的头部区域： 紧凑型
 * 有Ma 但是mbbm不显示
 * */
export const ReportFirstPageHeadNmbbm= ({theme , rep, mbbm } :{theme: any, rep:any, mbbm:string}
) => {
  // const atPrint = useMedia('print');
  return <React.Fragment>
    <div css={{
      display: 'flex',
      justifyContent: 'space-between',
      textAlign: 'center',
      height: '11rem',
    }}>
      <div css={{overflow: 'hidden'}}>
        <Embed css={{width: "155px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
          <FadeImage src={Img_Ma}/>
        </Embed>
        <Text css={{position: 'relative', top: '-1.1rem', fontSize: '0.9rem'}}>181320110160</Text>
      </div>
      <div>
        <Embed css={{width: "140px", margin: "auto"}} width={10} height={10}>
          <FadeImage src={Img_ReportNoQR}/>
        </Embed>
      </div>
      <div css={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        {/*<Text variant="h6" css={{fontSize: '0.8rem'}}>{mbbm}</Text>*/}
        <Embed css={{width: "120px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
          <FadeImage src={Img_Fbpi}/>
        </Embed>
        <div css={{
          display: 'flex',
          "@media (min-width:690px),print and (min-width:538px)": {
            marginRight: "1rem"
          }
        }}
        ><Text variant="h5">报告编号：</Text>
          <Text variant="h5" css={{textDecoration: 'underline'}}>{rep?.isp?.no}</Text>
        </div>
      </div>
    </div>
  </React.Fragment>;
};

/**锅炉 封面概要；
 * */
export const 首页设备概况Bl= ({theme, orc, rep } :{theme: any, orc:any, rep:any}
) => {
  return <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>锅炉型号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc?.型号 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>使用单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>锅炉使用编号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.单位内部编号 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>使用登记证编号：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc?.使用证号 || '／'}</CCell>
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
    </TableBody>
  </Table>;
};

export const 注意事项Boil= ({comply, rep} :{comply: any, rep: any}
) => {
  //中间组件只带了第一行的内容 1．本报告{comply}。<br/>  参数telurl：是否显示报检方式；最后一行跟随的！
  return <AttentionPoint rep={rep} comply={comply} telurl >
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    3．本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    4．本报告书一式二份，由检验单位和使用单位分别保存。<br/>
    5．受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机构提出书面意见。<br/>
    6．根据《中华人民共和国特种设备安全法》，使用单位应于检验合格有效期届满前1个月向检验机构提出定期检验申请。<br/>
    7．有关检验检测数据未经允许，施工、使用单位不得擅自向社会发布信息。<br/>
    8．
  </AttentionPoint>;
};

//不能放入orcBase.tsx； 被多个共享的。
//view注入的上一级组件标签 默认已经是<CCell> </CCell>；
export const input额定是 = {
  // edit:(inp:any,setInp:(a:any)=>void, orc:any)=><div></div>,
  view: (orc: any) => {
    //没法上 const theme= useTheme();        ？区别css={{[theme.mediaQueries.lg + ', print']: {wordBreak: 'keep-all'}}}
    return <div className="flex justify-around items-center">
      <span>{orc.额定蒸发量 || '／'}</span>
      <span className="whitespace-nowrap">{orc.是功率 ? 'MW' : 't/h'}</span>
    </div>
  },
};

//不是常规的做法：直接为desc的DOM定做的。
export const display额定是 = {
  view: (orc: any) => {
    return <><CCell rowSpan={3}>性能参数</CCell>
      <CCell>额定{orc.是功率 ? '功率' : '蒸发量'}</CCell>
    </>
  },
};
export const display额定功率 = {
  view: (orc: any) => {
    return  <CCell>额定{orc.是功率 ? '功率' : '蒸发量'}</CCell>
  },
};
//设备台账里面没有区分！！ 额定功率(MW)/蒸发量(T/H)； @ 只能在出报告时刻挑选啊？？
//usePrefixDataTable 才能用：  useThreeColumnView不可用这个：
export const displayT额定功率 =(before:boolean)=>{
  return {
    view: (orc: any) => {
      return  <>改造{before? '前':'后'}额定{orc.是功率 ? '功率' : '蒸发量'}</>
    },
  };
}
//useThreeColumnView用这个：
export const displayTC额定功率 =(before:boolean)=>{
  return {
    view: (orc: any) => {
      return  <CCell>改造{before? '前':'后'}额定{orc.是功率 ? '功率' : '蒸发量'}</CCell>
    },
  };
}

//设备概况前面的标题：
export const display额定蒸发 = {
  view: (orc: any) => {
    return <CCell>额定{orc.是功率 ? '功率' : '蒸发量'}</CCell>
  },
};
//证书里面修订 业务 描述：
export const reviseBusiness= (bst: string) => {
  if("安装监检"===bst)  return '安装';
  else if("改造监检"===bst)  return '改造';
  else return bst;
}
