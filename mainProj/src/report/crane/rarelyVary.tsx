/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Text, Embed, useTheme,
  TableRow, CCell, Cell, Table, TableBody
} from "customize-easy-ui-component";

import {DirectLink, Link as RouterLink,} from "../../routing/Link";
import Img_Ma  from '../../images/MA.png';
import {FadeImage} from "../../comp/FadeImage";
import Img_Seal from "../../images/seal.png";
import {useMedia} from "use-media";
import {AttentionPoint} from "../common/rarelyVary";

//【报告】复用相同的。
//很多内容相对重复，这里是报告较高层范围复用的组件；专门报告类型的可以安排在下一层次分开目录去做。

/**【特别！要！注意】打印情形： pagebreakBefore='always' 的必须小心，前面不要紧跟这是 <br/> 空白变成了空一整页了的可能性出现！！
 * */
export const 填写须知=<React.Fragment>
  <div  css={ {
    "@media print": {
      //【特殊】布局流如何定位到中间某一张纸张的末尾打印；纸张高度上 剪掉 上面的一行 “目录” 并没有被本div所都囊括的元素高度：推定剪掉高度是2rem。A4纸张竖版大约可接受高度大小=775pt再换算=273.4mm；A4纸297mm-2*(11.7=边距+页眉页脚)；
      //【有问题】目标div必须小于一张纸高度？这里若稍微超出了当前定位纸张区域，@@就可能被切分两页的！！，变成后续尾随空白页面的。所以尽量考虑有余量“- 10pt”:A4纸张竖版。
      height: `calc(100vh - 2rem - 10pt)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',   //'flex-end', 吸附本页纸张的底部区域打印，还是在本张纸张中间打印的？
    },
    margin: '0 3rem 0',
  } }>
    <Text variant="h4" css={{marginBottom:'3rem',textAlign: 'center'}}>填 写 须 知</Text>
    <Text css={{lineHeight:2,}}>
      1、本记录适用于桥式起重机和门式起重机（不含架桥机）的安装、改造、重大修理监督检验。<br/>
      2、监督检验结果栏填“符合”、“不符合”、“无此项”、“无法检验”。也可用以下简易符号表示：<br/>
      <Text css={{display: 'flex',lineHeight:2, marginLeft:'2rem'}}>
        “√” 等同于“符合”，表示该项检验结果符合检验要求；<br/>
        “×” 等同于“不符合”，表示该项检验结果不符合检验要求；<br/>
        “／” 等同于“无此项”，表示该项检验内容不适用于受检设备；<br/>
        “△” 等同于“无法检验”，表示该项检验内容无法检验。<br/>
      </Text>
      3、结论栏填“合格”、“不合格”、“无此项”。也可用以下简易符号表示：<br/>
      <Text css={{display: 'flex',lineHeight:2, marginLeft:'2rem'}}>
        “√” 表示“合格”；<br/>
        “×” 表示“不合格”；<br/>
        “／” 表示“无此项”。<br/>
      </Text>
      当监督检验结果为“无法检验”或“△”时，结论为“不合格”或“×”。<br/>
      4、工作见证栏填写监检人员签字的技术资料和工作见证材料（可简化填写代号）。<br/>
      5、确认方式填X、Z、W（X表示现场监督、Z表示资料核查、W表示实物检查）。<br/>
      6、检验人员、校核人员签字应齐全。
    </Text>
  </div>
</React.Fragment>;

/**报告封面的头部区域：
 * */
export const reportFirstPageHead= ( {theme , No } :{theme: any, No:string}
) => {
  return <React.Fragment>
      <div css={{
        textAlign: "center",
        "& > div": {
          marginLeft: "auto",
          marginRight: "auto"
        },
        "@media (min-width:690px),print and (min-width:538px)": {
          display: "flex",
          justifyContent: "space-between",
          flexWrap: 'wrap',
          "& > div": {
            margin: theme.spaces.sm,
          }
        }
      }}
      >
        <div css={{overflow: 'hidden'}}>
          <Embed css={{width: "170px",margin: "auto",top: '-0.75rem'}} width={78} height={35}>
            <FadeImage src={Img_Ma}/>
          </Embed>
          <Text variant="h6">181320110160</Text>
        </div>
        <div>
          <Text variant="h6">FJB/QB-1002-1-2023</Text>
          <br/><br/>
          <Text variant="h6" css={{
            "@media (min-width:690px),print and (min-width:538px)": {
              marginRight: "1rem"
            }
          }}
          >报告编号：{No}
          </Text>
        </div>
      </div>
  </React.Fragment>;
};
/**报告封面的头部区域： FlexBox布局办法
 * */
export const reportFirstPageHeadNmaNQR= ({theme , rep, mbbm } :{theme: any, rep:any, mbbm:string}
) => {
  return <React.Fragment>
    <div css={{
      textAlign: "center",
      "& > div": {
        marginLeft: "auto",
        marginRight: "auto"
      },
      "@media (min-width:690px),print and (min-width:538px)": {
        display: "flex",
        justifyContent: "space-between",
        flexWrap: 'wrap',
        "& > div": {
          margin: theme.spaces.sm,
        }
      }
    }}
    >
      <div> </div>
      <div>
        <Text variant="h6">{mbbm}</Text>
        <br css={{display: 'none', "@media print": {display: 'unset',height:'2rem'} }} />
        <Text variant="h6" css={{
          "@media (min-width:690px),print and (min-width:538px)": {
            marginRight: "1rem"
          }
        }}
        >报告编号：{rep?.isp?.no}
        </Text>
      </div>
    </div>
  </React.Fragment>;
};

//重复性代码抽象抽取参数化后可复用。
export const 末尾链接= ( {template, verId, repId }:{template: string, verId:string, repId:string}
) => {
  const theme = useTheme();
  return  <div css={{
              "@media print": {
                display:'none'
              },
              textAlign:'center',
              marginBottom: '0.8rem'
          }}
       >
    <RouterLink href="/">-报告完毕,返回-</RouterLink>
      <div css={{
        textAlign: "center",
        "& > div": {
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: '0.5rem',
          marginBottom: '0.5rem'
        },
        [theme.mediaQueries.md]: {
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: 'wrap'
        }
      }}
      >
        <div>
          <RouterLink href={`/report/${template}/ver/${verId}/${repId}/printAll`}>
            看完整原始记录
          </RouterLink>
        </div>
        <div>
          <RouterLink href={`/report/${template}/ver/${verId}/${repId}/flowSelect`}>
            流转(流程)
          </RouterLink>
        </div>
        <div>
          <RouterLink href={`/report/${template}/ver/${verId}/${repId}/ALL`}>
            编辑原始记录
          </RouterLink>
        </div>
      </div>
    </div>;
};

export const 分项末尾链接= ( {template, verId, repId,urlMainRep}:{template: string, verId:string, repId:string,urlMainRep:string}
) => {
  const theme = useTheme();
  return  <div css={{
    "@media print": {
      display:'none'
    },
    textAlign:'center',
    marginBottom: '0.8rem'
  }}
  >
    <RouterLink href={urlMainRep}>-分项报告完毕,返回主报告-</RouterLink>
    <div css={{
      textAlign: "center",
      "& > div": {
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: '0.5rem',
        marginBottom: '0.5rem'
      },
      [theme.mediaQueries.md]: {
        display: "flex",
        justifyContent: "space-evenly",
        flexWrap: 'wrap'
      }
    }}
    >
      <div>
        <RouterLink href={`/report/${template}/ver/${verId}/${repId}/printAll`}>
          看完整原始记录
        </RouterLink>
      </div>
      <div>
        <RouterLink href={`/report/${template}/ver/${verId}/${repId}/ALL`}>
          编辑原始记录
        </RouterLink>
      </div>
    </div>
  </div>;
};

export const 注意事项=<React.Fragment>
  <div  css={ {
    "@media print": {
      //【特殊】布局流如何定位到中间某一张纸张的末尾打印；纸张高度上 剪掉 上面的一行 “目录” 并没有被本div所都囊括的元素高度：推定剪掉高度是2rem。A4纸张竖版大约可接受高度大小=775pt再换算=273.4mm；A4纸297mm-2*(11.7=边距+页眉页脚)；
      //【有问题】目标div必须小于一张纸高度？这里若稍微超出了当前定位纸张区域，@@就可能被切分两页的！！，变成后续尾随空白页面的。所以尽量考虑有余量“- 10pt”:A4纸张竖版。
      height: `calc(100vh - 2rem - 10pt)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',   //'flex-end', 吸附本页纸张的底部区域打印，还是在本张纸张中间打印的？
    },
    margin: '0 3rem 0',
  } }>
    <Text variant="h3" css={{marginBottom:'3rem',textAlign: 'center'}}>注意事项</Text>
    <Text variant="h5" css={{lineHeight:2,}}>
      <p>1．本报告是依据《起重机械安全技术规程》（TSG 51—2023），对起重机械进行安装
      改造重大修理监督检验的结论报告。</p>
      2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂
      改无效。<br/>
      <p>3．本报告无检验、审核、批准人员签字以及检验机构的核准证号和检验专用章
      （或者公章）无效。</p>
      4．本报告一式三份，由检验机构、安装/改造/重大修理单位和使用单位分别保
      存。<br/>
      <p>5．本报告对检验时的设备状况负责。</p>
    </Text>
  </div>
</React.Fragment>;
export const 注意事项D= ( {comply, rep} :{comply: string, rep:any}
) => {
  return <React.Fragment>
    <div  css={ {
      "@media print": {
        height: `calc(100vh - 2rem - 10pt)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      },
      margin: '0 3rem 0',
    } }>
      <Text variant="h3" css={{textAlign: 'center',"@media print": {marginBottom:'3rem',}}}>注意事项</Text>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        1．本报告是依据{comply}。</Text><br/>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。</Text><br/>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        3．本报告无检验、审核、批准人员签字以及检验机构的核准证号和检验专用章（或者公章）无效。</Text><br/>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        4．本报告一式二份，由检验机构和使用单位分别保存。</Text><br/>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        5．本报告对检验时的设备状况负责。</Text><br/>
      <Text css={{"@media print": {lineHeight:1.5,fontSize:'1.1rem'} }}>
        6．报检电话：{rep?.isp?.ispu?.agency?.bjtel}，网址：{rep?.isp?.ispu?.agency?.bjurl}。</Text>
    </div>
  </React.Fragment>;
};

export const 注意事项SigB= ( {comply, rep} :{comply: any, rep: any}
) => {
  const atPrint = useMedia('print');
  return <React.Fragment>
    <div css={{
      "@media print": {
        //【特殊】布局流如何定位到中间某一张纸张的末尾打印；纸张高度上 剪掉 上面的一行 “目录” 并没有被本div所都囊括的元素高度：推定剪掉高度是2rem。A4纸张竖版大约可接受高度大小=775pt再换算=273.4mm；A4纸297mm-2*(11.7=边距+页眉页脚)；
        //【有问题】目标div必须小于一张纸高度？这里若稍微超出了当前定位纸张区域，@@就可能被切分两页的！！，变成后续尾随空白页面的。所以尽量考虑有余量“- 10pt”:A4纸张竖版。
        height: `calc(100vh - 2rem - 10pt)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',   //'flex-end', 吸附本页纸张的底部区域打印，还是在本张纸张中间打印的？
        margin: '0 3rem 0',
      },
    }}>
      <Text variant={atPrint? "h3":'h5'} css={{ textAlign: 'center',
        "@media print": {
          marginBottom: '3rem',
        },
      }}>注意事项</Text>
      <Text variant="h5" css={{ lineHeight: 0.95,
        "@media print": {
          lineHeight: 2.3,
        },
      }}>
        1．本报告{comply}。<br/>
        2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。<br/>
        3．本报告无检验、审核、批准人员的签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
        4．本报告一式两份，由检验机构和使用单位分别保存。<br/>
        5．受检单位对本报告结论如有异议，请在收到报告书之日起15个工作日内，向检验机构提出书面意见。<br/>
        6．本报告对检验时的设备状况负责。<br/>
        7．有关检测数据未经允许，施工、使用单位不得擅自向社会发布信息。<br/>
        8．根据《中华人民共和国特种设备安全法》，使用单位应在下次检验日期届满前1个月，向检验机构提出定期检验申请。<br/>
        9．报检电话：{rep?.isp?.ispu?.agency?.bjtel}，网址：{rep?.isp?.ispu?.agency?.bjurl}。
      </Text>
    </div>
  </React.Fragment>;
};


export const 检验编制核准= ( { orc,rep } : { orc: any, rep:any }
) => {
  return <Table fixed={ ["11%","22%","6%","12%","%","7%","12%"]  }  css={ {borderCollapse: 'collapse' } }>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell component="th" scope="row">检验日期</CCell>
          <CCell colSpan={3}>{orc.检验日期}</CCell>
          <CCell>下次检验日期</CCell>
          <CCell colSpan={2}>{orc.新下检日 || '／'}</CCell>
        </TableRow>
      </DirectLink>
      <TableRow>
        <CCell component="th" scope="row">检验人员</CCell>
        <Cell colSpan={4}>{orc.检验人IDs}</Cell>
        <CCell>日期</CCell>
        <CCell>{orc.编制日期}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">审核</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell>2020-01-02</CCell>
        <CCell rowSpan={2} colSpan={3}>
          <div css={{
            height:'8rem',
            '::before': {
              filter: 'opacity(30%)',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${Img_Seal})`,
              content: '" "',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }
          }}>
            <Table  fixed={ ["40%","%"]  }
                    printColWidth={ ["105","156"] }
                    css={ {borderCollapse: 'collapse',height:'fill-available'} }
            >
              <TableBody>
                <TableRow>
                  <CCell css={{border:'none'}}>机构核准证号：</CCell>
                  <CCell css={{border:'none'}}>TS7110236-2018</CCell>
                </TableRow>
                <TableRow>
                  <CCell css={{border:'none'}} colSpan={2}>（检验机构公章或者检验专用章）</CCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">批准</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};
/**定检的版本*/
export const 检验编制核准D= ( { orc,rep } : { orc: any, rep:any }
) => {
  return <Table fixed={ ["11%","22%","6%","12%","%","7%","12%"]  }  css={ {borderCollapse: 'collapse' } }>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell colSpan={2}>下次检验日期</CCell>
          <CCell colSpan={2}>{orc.新下检日 || '／'}</CCell>
          <CCell rowSpan={4} colSpan={3}>
            <div css={{
              height:'8rem',
              '::before': {
                filter: 'opacity(30%)',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${Img_Seal})`,
                content: '" "',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }
            }}>
              <Table  fixed={ ["40%","%"]  }
                      printColWidth={ ["105","156"] }
                      css={ {borderCollapse: 'collapse',height:'fill-available'} }
              >
                <TableBody>
                  <TableRow>
                    <CCell css={{border:'none'}}>机构核准证号：</CCell>
                    <CCell css={{border:'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                  </TableRow>
                  <TableRow>
                    <CCell css={{border:'none'}} colSpan={2}>（检验机构公章或者检验专用章）</CCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CCell>
        </TableRow>
      </DirectLink>
      <TableRow>
        <CCell component="th" scope="row">检验</CCell>
        <Cell>{orc.检验人IDs}</Cell>
        <CCell>日期</CCell>
        <CCell>{orc.编制日期}</CCell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">审核</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell>2020-01-02</CCell>

      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">批准</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};

export const 检验编制核准SiB= ( { orc,rep } : { orc: any, rep:any }
) => {
  return <Table fixed={ ["11%","22%","6%","12%","%","7%","12%"]  }  css={ {borderCollapse: 'collapse' } }>
    <TableBody>
      <DirectLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/Conclusion`}>
        <TableRow>
          <CCell component="th" scope="row">检验日期</CCell>
          <CCell colSpan={3}>{orc.检验日期}</CCell>
          <CCell>下次检验日期</CCell>
          <CCell colSpan={2}>{orc.新下检日 || '／'}</CCell>
        </TableRow>
      </DirectLink>
      <TableRow>
        <CCell component="th" scope="row">检验人员</CCell>
        <Cell colSpan={6}>{orc.检验人IDs}</Cell>
      </TableRow>
      <TableRow>
        <CCell component="th" scope="row">编制</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell>{orc.编制日期}</CCell>
        <CCell rowSpan={3} colSpan={3}>
          <div css={{
            height:'8rem',
            '::before': {
              filter: 'opacity(30%)',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${Img_Seal})`,
              content: '" "',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }
          }}>
            <Table  fixed={ ["40%","%"]  }
                    printColWidth={ ["105","156"] }
                    css={ {borderCollapse: 'collapse',height:'fill-available'} }
            >
              <TableBody>
                <TableRow>
                  <CCell css={{border:'none'}}>机构核准证号：</CCell>
                  <CCell css={{border:'none'}}>{rep?.isp?.ispu?.agency?.apno}</CCell>
                </TableRow>
                <TableRow>
                  <CCell css={{border:'none'}} colSpan={2}>（检验机构公章或者检验专用章）</CCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">审核</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
      <TableRow >
        <CCell component="th" scope="row">批准</CCell>
        <CCell></CCell>
        <CCell>日期</CCell>
        <CCell></CCell>
      </TableRow>
    </TableBody>
  </Table>;
};
export const 注意事项Park= ( {comply, rep} :{comply: any, rep: any}
) => {
  return <AttentionPoint rep={rep} comply={comply} telurl>
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。<br/>
    3．本报告无检验、审核、批准人员签字以及检验机构的核准证号和检验专用章（或者公章）无效。<br/>
    4．本报告一式三份，由检验机构、安装/改造/重大修理单位和使用单位分别保存。<br/>
    5．本报告对检验时的设备状况负责。<br/>
    6．
  </AttentionPoint>;
};
export const 注意事项Tower= ({comply, rep} :{comply: any, rep: any}
) => {
  //组件AttentionPoint只带了第一行的内容 1．本报告{comply}。<br/>  参数telurl：是否显示报检方式；最后一行跟随的！
  return <AttentionPoint rep={rep} comply={comply} telurl>
    2．本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹要工整，涂改无效。<br/>
    3．本报告无检验、审核、批准人员的签字以及检验机构的核准证号和检验专用章(或者公章)无效。<br/>
    4．本报告一式二份，由检验机构和使用单位分别保存。<br/>
    5．本报告对检验时的设备状况负责。<br/>
    6．
  </AttentionPoint>;
};

