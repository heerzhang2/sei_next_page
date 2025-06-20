import * as React from "react";
// import {FadeImage} from "../../comp/FadeImage";
// import Img_Ma from "../../images/MA.png";
// import Img_Fbpi from "../../images/FBPI.png";
import {AttentionPoint} from "../common/rarelyVary";


/**报告封面的头部区域： 紧凑型
 * 没有显示 报告编号的。
 * */
export const ReportFirstPageHeadNrno= ({theme , rep, mbbm,nMa } :{theme: any, rep:any, mbbm:string,nMa?:boolean}
) => {
  // const atPrint = useMedia('print');
  return <React.Fragment>
    <div css={{
      display: 'flex',
      justifyContent: 'space-between',
      textAlign: 'center',
      height: '5rem',
      "@media (min-width:690px),print and (min-width:538px)": {
        marginBottom: '-1rem'
      }
    }}>
      <div css={{overflow: 'hidden'}}>
        {!nMa && <>
          <Embed css={{width: "155px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
            <FadeImage src={Img_Ma}/>
          </Embed>
          <Text css={{position: 'relative', top: '-1.1rem', fontSize: '0.9rem'}}>181320110159</Text>
        </>}
      </div>
      {/* <div>
        <Embed css={{width: "140px", margin: "auto"}} width={10} height={10}>
          <FadeImage src={Img_ReportNoQR}/>
        </Embed>
      </div>*/}
      <div css={{overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <Text variant="h6" css={{fontSize: '0.8rem'}}>{mbbm}</Text>
        <Embed css={{width: "120px", margin: "auto", top: '-0.65rem'}} width={78} height={35}>
          <FadeImage src={Img_Fbpi}/>
        </Embed>
        {/*<div css={{*/}
        {/*  display: 'flex',*/}
        {/*  "@media (min-width:690px),print and (min-width:538px)": {*/}
        {/*    marginRight: "1rem"*/}
        {/*  }*/}
        {/*}}*/}
        {/*><Text variant="h5">eee：</Text>*/}
        {/*  <Text variant="h5" css={{textDecoration: 'underline'}}>{rep?.isp?.no}</Text>*/}
        {/*</div>*/}
      </div>
    </div>
  </React.Fragment>;
};


/**管道的 封面概要；
 * "建设单位" =使用单位；  ’工程名称‘ 是从本报告输入的，台账并没有对应这个的字段。
 * 同一个设备同时会有多个施工单位？ 施工单位： 施工类别 :还是都采用本地输入更稳妥吧，#管道容易出现多份报告的冲突。
 * */
export const 首页设备概况PNj= ( {theme, orc, rep } :{theme: any, orc:any, rep:any}
) => {
  return <Table fixed={ ["20%","%"] }  css={ {borderCollapse: 'collapse'} }>
    <TableBody rheight={40}>
      <TableRow>
        <RCell css={{border:'none'}}>建设单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.使用单位 || '／'}</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>工程名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.工程名称 }</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>管道名称：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc?.管道设备名 || '／'}</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工单位：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.施单位 }</CCell>
      </TableRow>
      <TableRow >
        <RCell css={{border:'none'}}>施工类别：</RCell>
        <CCell css={{border:'none',borderBottom:`1px dashed`}}>{orc.施工类别 }</CCell>
      </TableRow>
      <TableRow>
        <RCell css={{border:'none'}}>监检日期：</RCell>
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


export const 注意事项GasC= ({comply, rep} :{comply: any, rep: any}
) => {
  //中间组件只带了第一行的内容 1．本报告{comply}。<br/>  参数telurl：是否显示报检方式；最后一行跟随的！
  return <AttentionPoint rep={rep} comply={comply} telurl btClass="print:mb-60">
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    3．本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    4．本报告书本检验报告一式三份：一份交建设单位；一份交施工单位；一份监检单位存档。<br/>
    5．受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机构提出书面意见。<br/>
    6．根据《中华人民共和国特种设备安全法》，使用单位应于检验合格有效期届满前1个月向检验机构提出定期检验申请。<br/>
    7．有关检验检测数据未经允许，施工、使用单位不得擅自向社会发布信息。<br/>
    8．
  </AttentionPoint>;
};
