/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
  Text, Divider, Embed, useTheme, IconButton, IconMinimize2, IconMaximize2, TableBody, TableRow, RCell,Table, Cell,
} from "customize-easy-ui-component";
import {DirectLink, Link as RouterLink,} from "../../routing/Link";
import Link from "next/link"
import Img_Ma  from '../../images/MA.png';
import Img_ReportNoQR from '../../images/reportNoQR.png';
import {FadeImage} from "../../comp/FadeImage";
import {useMedia} from "use-media";
import {Button} from "@/components/ui";
import {useCreateQueryString} from "@/hooks/useCreateQueryString";
import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";

//【报告】复用相同的。
//很多内容相对重复，这里是报告较高层范围复用的组件；专门报告类型的可以安排在下一层次分开目录去做。

/**【特别！要！注意】打印情形： pagebreakBefore='always' 的必须小心，前面不要紧跟这是 <br/> 空白变成了空一整页了的可能性出现！！
 * */
export const 注意事项=<React.Fragment>
  <Text variant="h4">
    2. 本报告应当由计算机打印输出，或者用钢笔、签字笔填写，字迹应当工整，修改无效。<br/>
    <br/>
    3. 本报告无检验、编制、审核、批准人员签字和检验机构的核准证号、检验专用章或者公章无效。<br/>
    <br/>
    4. 本报告一式三份，由检验机构、使用单位、日常维护保养单位分别保存。<br/>
    <br/>
    5. 受检单位对本报告结论如有异议，请在收到报告书之日起15日内，向检验机构提出书面意见。<br/>
    <br/>
    6. 根据《中华人民共和国特种设备安全法》，使用单位应于下次检验日期届满前1个月向检验机构提出定期检验申请。<br/>
    <br/>
    7. 有关检测数据未经允许，施工、使用单位不得擅自向社会发布信息。
  </Text>
</React.Fragment>;

export const 落款单位地址=<React.Fragment>
    <Text variant="h4" css={{textAlign:'center'}}>福建省特种设备检验研究院</Text>
    <Text variant="h6" css={{textAlign:'center'}}>
      FUJIAN SPECIAL EQUIPMENT INSPECTION AND RESEARCH INSTITUTE
    </Text>
    <Divider css={{borderTopColor: 'black'}}/>
    <Text variant="h5" >
      地址（Add.）：福建省福州市仓山区卢滨路370号
    </Text>
    <div css={{display:'flex'}}>
      <span css={{flex:'1'}}>电话（Tel.）：0591-968829</span>
      <span css={{flex:'1'}}>	传真（Fax）：0591-88700509</span>
      <span css={{flex:'1'}}>邮政编码：350008</span>
    </div>
    <div css={{display:'flex'}}>
      <span css={{flex:'1'}}>网址（Website）：www.fjtj.com</span>
      <span css={{flex:'1'}}>	电子邮箱（Email）：fjtj@fjtj.org</span>
    </div>
</React.Fragment>;

//表格TableRow + 字体1rem 极限压缩每一行高度 19px;  rheight最大压缩Body行到32px;
export const 型试落款地址= ({theme, } :{theme: any, }) => {
    //没有表线的表格,避免显示过空的，极度压缩Table空间 ； [theme.mediaQueries.phone]: {}  但打印需要行高空大的。
 return <React.Fragment>
    <Table fixed={["60%", "%"]} css={{borderCollapse: 'collapse',
        "@media not print": {
            "& tr": {
              height: '1.1rem',
            },
            "& tr>td": {
              padding: 0,
            },
        }
    }} tight miniw={800}>
      <TableBody>
        <TableRow>
          <RCell css={{border: 'none'}}><Text>型式试验机构地址：</Text></RCell>
          <Cell css={{border: 'none'}}><Text>福建省福州市仓山区卢滨路370号</Text></Cell>
        </TableRow>
        <TableRow>
          <RCell css={{border: 'none'}}><Text>邮政编码：</Text></RCell>
          <Cell css={{border: 'none'}}><Text>350008</Text></Cell>
        </TableRow>
        <TableRow>
          <RCell css={{border: 'none'}}><Text>联系电话：</Text></RCell>
          <Cell css={{border: 'none'}}><Text>0591-88700710</Text></Cell>
        </TableRow>
      </TableBody>
    </Table>
  </React.Fragment>;
}
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
        <div>
          <Embed css={{width: "190px",margin: "auto"}} width={95} height={45}>
            <FadeImage src={Img_Ma}/>
          </Embed>
          <br/>
          <Text variant="h5">181320110160</Text>
        </div>
        <div>
          <Embed css={{width: "140px",margin: "auto"}} width={10} height={10}>
            <FadeImage src={Img_ReportNoQR}/>
          </Embed>
        </div>
        <div>
          <Text variant="h5">FJB/TC-1001-1-0-2017</Text>
          <br/><br/>
          <Text variant="h5" css={{
            "@media (min-width:690px),print and (min-width:538px)": {
              marginRight: "1rem"
            }
          }}
          >No：{No}
          </Text>
        </div>
      </div>
  </React.Fragment>;
};

/*@Deprecated
旧版本的：
* */
export const reportFirstPageHeadAllNmbbm= ({theme , No } :{theme: any, No:string}
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
      <div>
        <Embed css={{width: "190px",margin: "auto"}} width={95} height={45}>
          <FadeImage src={Img_Ma}/>
        </Embed>
        <br/>
        <Text variant="h5">181320110160</Text>
      </div>
      <div>
        <Embed css={{width: "140px",margin: "auto"}} width={10} height={10}>
          <FadeImage src={Img_ReportNoQR}/>
        </Embed>
      </div>
      <div css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        <br/><br/><br/><br/><br/>
        <div  css={{
          display: 'flex',
          "@media (min-width:690px),print and (min-width:538px)": {
            marginRight: "1rem"
          }
        }}
        ><Text variant="h5" >报告编号：</Text>
          <Text variant="h5" css={{textDecoration: 'underline'}}>{No}</Text>
        </div>
      </div>
    </div>
  </React.Fragment>;
};

//重复性代码抽象抽取参数化后可复用。
export const 末尾链接 = ({ template, verId, repId, rep, toPDF }: {
  template: string,
  verId: string,
  repId: string,
  rep: any,
  toPDF?: ()=>void;
}) => {
    const searchParams = useSearchParams()
    const print = "1"===searchParams!.get("print")
    const createQueryString = useCreateQueryString()
    const router = useRouter()
    const pathname = usePathname()
    const { action } = useParams()
    const original = "1"===searchParams!.get("original")
  return (
      <div id="EndOfRep" className="print:hidden text-center mb-4 md:mb-0">
          <Link href="/" passHref
                className="text-blue-600 hover:text-blue-800 block text-sm mb-4 md:mb-0 md:inline-block">
              -报告完毕,返回-
          </Link>
          <div className="text-center space-y-3 md:space-y-0 md:space-x-4 md:flex md:justify-around md:flex-wrap">
              <div className="mx-auto">
                  <Link href={`/rep/${repId}/${template}/${verId}/printAll`}
                        className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50">
                      看完整原始记录
                  </Link>
              </div>
              <div className="mx-auto">
                  <Link href={`/report/flowSelect/${template}/${repId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50">
                      流转(流程)
                  </Link>
              </div>
              <div className="mx-auto">
                  {print?
                      <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50">
                          回首页
                      </Link>
                      :
                      <Link href={`/rep/${repId}/${template}/${verId}/?print=1${original?'&original=1':''}`}
                            className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50">
                        预览打印
                      </Link>
                  }
              </div>
              <div className="mx-auto">
                  <Link href={`/rep/${repId}/${template}/${verId}/ALL`}
                        className="text-blue-600 hover:text-blue-800 text-sm block px-4 py-2 rounded-lg hover:bg-gray-50">
                      编辑原始记录
                  </Link>
              </div>
          </div>
          <div className="m-2 flex justify-center gap-2 print:hidden">
              <Button variant="outline"
                      onClick={() => router.push(pathname + '?' + createQueryString('original', original ? '' : "1"))}>
                  {original ? "正式报告" : "原始记录"}
              </Button>
              {!action && <>
                  <Button variant="outline"
                          onClick={() => router.push(pathname + '?' + createQueryString('print', print ? '' : "1"))}>
                      {print ? "浏览模式" : "打印模式"}
                  </Button>
                  {print && <>
                      <Button variant="outline" onClick={() => window.print()}>打印预览</Button>
                      <Button variant="outline" onClick={toPDF}>转为PDF</Button>
                  </>}
              </>}
          </div>
      </div>
  );
};

export const 末尾链接3 = ({template, verId, repId, rep}: { template: string, verId: string, repId: string, rep: any }
) => {
    const theme = useTheme();
    return (
        <div id={'EndOfRep'} css={{
            "@media print": {display: 'none'},
            textAlign: 'center',
            "@media not print": {
                marginBottom: '0.8rem'    //影响打印！ 证书就一张的。
            }
        }}>
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
        }}>
            <div>
              <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/printAll`}>
                看完整原始记录
              </Link>
            </div>
            <div>
              <Link href={`/report/${template}/ver/${verId}/${repId}/flowSelect`}>
                流转(流程)
              </Link>
            </div>
            <div>
              <Link href="/">回首页</Link>
            </div>
            <div>
              <Link href={`/rep/${rep?.id}/${rep?.modeltype}/${rep?.modelversion}/ALL`}>
               编辑原始记录
              </Link>
            </div>
        </div>
    </div>
  );
};
/**因为击链接出现hook报错只好假如2个参数了：ALL printAll需要去掉，要求跳转迂回才能避免编辑器列表的动态增加的ref.独立流转报告切换主报告时刻的编辑器的个数变化引起的useXXX报错。
 * 还是有detected a change in the order of Hooks called by ReportView. 报错的？
 * @param nestIn   嵌入显示于主报告视图上的情况;
 * @param flowNest  需要防止Hook报错的; 组件切换之间实际的可能并没有被卸载掉。
 * */
export const 分项末尾链接= ( {template, verId, repId,urlMainRep,flowNest,nestIn}
       : {template: string, verId:string, repId:string,urlMainRep:string,flowNest?:boolean,nestIn?:boolean}
) => {
  const theme = useTheme();
  // const {history } = useContext(RoutingContext);
  return  <div css={{
    "@media print": {
      display:'none'
    },
    textAlign:'center',
    marginBottom: '0.8rem'
  }}
  >
    { !nestIn &&
        <RouterLink href={urlMainRep}>-分项报告完毕,返回主报告-</RouterLink>
    }
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
      {flowNest? <div>
          <RouterLink href={`/report/${template}/ver/${verId}/${repId}/`}>
            看独立流转的报告记录
          </RouterLink>
        </div>
        :
        <>
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
        </>
      }
    </div>
  </div>;
};


//@Deprecated    待删除！
//全部显示报告内容的按钮和控制：hook复用模式的。 点击按钮：全部显示(打印的，做全文搜索需要的)，再点击按钮恢复到默认初始化取值。
//const {viewAll, viewAllBtnLine}=useViewReportALL();  整体显示 还是隐藏部分？
export const useViewReportALL = () => {
  const [viewAll, setViewAll] = React.useState(false);      //完全显示所有内容的！；
  const viewAllBtnLine =<div css={{
    "@media print": {
      display:'none'
    },
    textAlign: 'center',
  }}>
      <IconButton  icon={viewAll?  <IconMinimize2 />: <IconMaximize2 />}
                   variant="ghost"  label="全部显示"  size="md"
                   onPress={e => {
                     setViewAll(!viewAll)
                   } }
      />
  </div>;

  return { viewAll, viewAllBtnLine };
};

type AttentionPointProps = {
  /**报告对象*/
  rep: any
  // onClick: () => void
  children: React.ReactNode
  //第一行的 本报告 遵照“”
  comply?: any
  //最后一行 带上 报检 电话网址
  telurl?: boolean
}
/**更为通用的注意事项 报告显示页面 【特别提醒】rep?.isp?.ispu是动态的数据；并非静态化方式生成数据。
 *@param children 文本其他行的。
 * */
export const AttentionPoint = ({ rep, children, comply ,telurl }: AttentionPointProps) =>{
  const atPrint = useMedia('print');
  return (
    <RouterLink  href={`/report/${rep?.modeltype}/ver/${rep?.modelversion}/${rep?.id}/FrontCover#FrontCover`}>
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
          { comply && <>
            1．本报告{comply}。<br/>
            </>
          }
          {children}
          { telurl && <>
              报检电话：{rep?.isp?.ispu?.agency?.bjtel}，网址：{rep?.isp?.ispu?.agency?.bjurl}。
             </>
          }
        </Text>
      </div>
    </RouterLink>
)};

