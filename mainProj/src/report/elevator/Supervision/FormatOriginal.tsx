/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text, Table, TableBody, TableRow, Cell, CCell, TableHead,
    useTheme, Button,
} from "customize-easy-ui-component";
import {DirectLink, } from "../../../routing/Link";
import { ReportViewProps, } from "../../common/base";
import {
    末尾链接,
} from "../../common/rarelyVary";
import {
    首页设备概况el
} from "./repView";
import {multilines2Html} from "../../tools";
import {useLikeElevatorSuperv} from "../hook/useLikeElevatorSuperv";
import {填写须知} from "../rarelyVary";
import {itemResTransform, RecordInputConfig, RecordSelfSplit, useItemsMap} from "../../common/config";
import {setupItemAreaRoute} from "./orcIspConfig";

export const 特殊项目编码 =((no:string,et:RecordInputConfig) => {
    //依赖 sub：来区分了，【特殊规定】sub固定前面 3个 字符作为附加标识。 不要插入空格符号:URL?。  2.1.2（4）
    if(no==='2.1.2' || no==='3.8.1')
        return  (no+et?.sub.substring(0,3));
    else return no;
});
/**存在？ 特别的输入和显示安排的情况： 避免大规模的组件复用组合的 逻辑判定的参数？
 * 直接修改通用的hook函数内部逻辑； 1.2确认日期拆分成了两个一半做一个日期
 * @return :DOM数组  React.ReactNode；
 * */
const 特殊输入显示 =(({itRes,seq,area,et, n,ox,oy,oz,nowColumns,big,titl} :any) => {
    let itemRowRender=[];
    const extendRs=et.rss?.length! + (et.head? 0: -1) + (et.tail? 1: 0);      //比正常要要多出几行
    itemRowRender[0] =<React.Fragment key={n}>
        <TableRow >
            <CCell key={12}>{seq}</CCell>
            { <CCell key={1} rowSpan={1+extendRs} colSpan={1===nowColumns? 4:1}>
                {(et.span?.bH)? <div css={{ "@media print": {
                            display: '-webkit-box',
                            WebkitLineClamp: et.span.bH,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }  }}>{ox}{big}</div>
                    :
                    <>{ox}{big}</>
                }
              </CCell>
            }
            {nowColumns>=2 && <CCell key={2} rowSpan={1+extendRs}
                                     colSpan={2===nowColumns? 1:1}
            >{ox}.{oy}{titl}<br/>{et.iclas??area.iclas}</CCell>
            }
            {nowColumns>=3 && <CCell key={3} rowSpan={1+extendRs}
                                     colSpan={3===nowColumns? 2:1}
            >{area.iclas}{ox}.{oy}.{oz}</CCell>
            }
            {nowColumns>=4 && <CCell key={11} rowSpan={1+extendRs}
            >{area.iclas}{ox}.{oy}.{oz}.{et.t}</CCell>
            }
            <CCell key={13} rowSpan={1+extendRs}
            >{ox}.{oy}</CCell>

            { et.head? <Cell key={4} colSpan={2}>{et.head}</Cell>
                :
                <>
                    <Cell key={4}>{et.rss?.[0].desc}</Cell>
                    <CCell key={5}>{itRes?.[et.rss?.[0].name!]}</CCell>
                </>
            }
            <CCell key={6} rowSpan={1+extendRs}>{itemResTransform(itRes,et)}</CCell>
            { et.head? <CCell key={10}></CCell>
                :
                <CCell key={10}>{itRes?.[et.rss?.[0].name!+'_D'] || ''}</CCell>
            }
            { ox===1 && oy===2 ?
                <CCell key={8} rowSpan={4}>{itRes?.[et.name+'_S'] || ''}</CCell>
                :
                <CCell key={8} rowSpan={1+extendRs}>{itRes?.[et.name+'_S'] || ''}</CCell>
            }
        </TableRow>
    </React.Fragment>;
    et.rss?.forEach((cfx:RecordSelfSplit, fc:number) => {
        if(et.head || (!et.head && 0!==fc) )
            itemRowRender.push(
                <React.Fragment key={n+`${fc}`}>
                    <TableRow >
                        <CCell key={12}>{seq}</CCell>
                        <Cell key={4}>{cfx.desc}</Cell>
                        <CCell key={5}>{itRes?.[cfx.name]}</CCell>
                        <CCell key={10}>{itRes?.[cfx.name+'_D'] || ''}</CCell>
                        { ox===1 && oy===2 && 3===fc &&
                              <CCell key={8} rowSpan={extendRs-3}>{itRes?.[et.name+'_S2'] || ''}</CCell>
                        }
                    </TableRow>
                </React.Fragment>
            );
    });
    if(et.tail)  itemRowRender.push(
        <React.Fragment key={extendRs+1}>
            <TableRow >
                <CCell key={12}>{seq}</CCell>
                <Cell key={4} colSpan={2}>{et.tail}</Cell>
                <CCell key={10}></CCell>
            </TableRow>
        </React.Fragment>
    );
    return itemRowRender;
});


//格式化版的原始记录 和 正式报告：目的功能定位叉开。前者只是用于打印目的。后者不仅要打印还要导航编辑器区块。
export const FormatOriginal: React.FunctionComponent<ReportViewProps> = ({
    repId,   source: orc,  verId,rep,
}) => {
    const theme= useTheme();
    const impressionismAs =React.useMemo(() => {
        return setupItemAreaRoute({verId, repId:repId!, theme});
    }, [verId, repId, theme]);
    const {renderIspContent} =useLikeElevatorSuperv({itRes:orc,ItemArs:impressionismAs?.Item,
        model:'EL-JJ',ver:verId, repNo:`${repId}`, rssCB:特殊输入显示});
    const [mapNoTag]=useItemsMap({ ItemArs:impressionismAs?.Item, noCB:特殊项目编码 });
  return (
    <React.Fragment>
      <div css={{
            "@media not print": {
              marginTop:'1rem',
              marginBottom: '1rem'
            }
          }}
      >
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
              },
              flexDirection: 'row-reverse',
          }}>
             <Text variant="h5" css={{textDecoration: 'underline'}}>FJJ/QB-1002-1-2023</Text>
          </div>
        <Text variant="h3" css={{
              textAlign:'center',
              "@media (min-width:690px),print and (min-width:538px)": {
                fontSize: theme.fontSizes[5],
              },
               marginTop: '2rem',
            }}>
            有机房曳引驱动电梯监督检验原始记录
        </Text><br/>
          <Text variant="h5" css={{
              textAlign:'center',
          }}> （适于： 格式化版记录 待续...）
          </Text>
        <div css={{
            "@media print": {
              height:'18mm'
            }
          }}>
        </div>
          <div css={{
              "@media print": {
                  minHeight: '-webkit-fill-available',
              }
          }}>
              { 首页设备概况el( {theme, orc, original:true} ) }
          </div>
            <div css={{
              "@media print": {
                height:'20mm'
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
                <Text variant="h4" css={{
                    textAlign:'center',
                }}>福建省特种设备检验研究院编制</Text>
            </div>
          {填写须知}
          <div>
              <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Instrument`}>
              <Text variant="h4" css={{
                  "@media print": {
                      pageBreakBefore: 'always',
                  },
              }}>一、主要检验仪器设备性能检查</Text>
              </DirectLink>
          </div>
          <Table  printColWidth={ ["1","1","1","1","1"] }>
              <TableHead>
                  <TableRow>
                      <CCell rowSpan={2}>仪器设备名称</CCell>
                      <CCell rowSpan={2}>型号规格</CCell>
                      <CCell rowSpan={2}>仪器设备编号</CCell>
                      <CCell colSpan={2}>性能状态</CCell>
                  </TableRow>
                  <TableRow>
                      <CCell>开机后</CCell>
                      <CCell>关机前</CCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Instrument`}>
                      {orc.仪器表?.map((o: any, i: React.Key) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{o.n}</CCell>
                                  <CCell>{o.t}</CCell>
                                  <CCell css={{wordBreak: 'break-all'}}>{o.i}</CCell>
                                  <CCell>{o.o}</CCell>
                                  <CCell css={{wordBreak: 'break-all'}}>{o.f}</CCell>
                              </TableRow>
                          );
                      }) }
                  </DirectLink>
              </TableBody>
          </Table>
          <Text>
              注：1、性能状态一栏中用“√”表示正常，用“×”表示不正常。
              <Text css={{display: 'flex', marginLeft:'2rem'}}>
                  2、若仪器设备性能状态不正常，应更换为性能状态正常的仪器设备，并填写在预留栏中。<br/>
                  3、新增使用的仪器设备应填写在预留栏中。<br/>
                  4、未使用的仪器设备可不填写。
              </Text>
          </Text>
        {/*{检验设备情况({orc, repId:repId!, verId})}*/}
          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ALL`}>
              <Text variant="h4">三、检验记录</Text>
          </DirectLink>
          <Table fixed={ ["2.5%","5%","6%","4%","%","5%","4.5%","8%","5%"] } css={ {borderCollapse: 'collapse' } }   tight  miniw={800}>
              <TableHead>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell>序号</CCell><CCell>项类</CCell><CCell>类别</CCell>
                          <CCell><Text css={{fontSize:'0.6rem'}}>项目编号</Text></CCell><CCell>检验内容与要求</CCell>
                          <CCell><Text css={{fontSize:'0.8rem'}}>检验结果</Text></CCell>
                          <CCell><Text css={{fontSize:'0.7rem'}}>检验结论</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem',"@media print": {fontSize:'0.5rem'}}}>资料确认描述或存在问题描述</Text></CCell>
                          <CCell><Text css={{fontSize:'0.8rem'}}>确认日期</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableHead>
              <TableBody>
                  {renderIspContent}
              </TableBody>
          </Table>

          <Text  variant="h4" css={{marginTop: '1rem',
              "@media print": {
                  pageBreakBefore: 'always', marginTop: 'unset',
              },
          }}>四、结论</Text>
          <Table>
              <TableBody>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow>
                          <CCell><Text variant="h1" css={{fontSize:'4rem'}}>{orc.检验结论}</Text></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Table fixed={ ["15%","%","15%","20%"] } css={ {borderCollapse: 'collapse'} }>
              <TableBody>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ALL`}>
                      <TableRow >
                          <CCell css={{border:'none'}}>检验</CCell>
                          <CCell css={{border:'none'}}></CCell>
                          <CCell css={{border:'none'}}>日期</CCell>
                          <CCell css={{border:'none'}}>2020-01-02</CCell>
                      </TableRow>
                      <TableRow >
                          <CCell css={{border:'none'}}>校核</CCell>
                          <CCell css={{border:'none'}}></CCell>
                          <CCell css={{border:'none'}}>日期</CCell>
                          <CCell css={{border:'none'}}></CCell>
                      </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text id="Evaluation" variant="h4" css={{marginTop: '1rem',
          }}>五、技术资料和工作见证材料</Text>
          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Evaluation`}>
          <Table printColWidth={["8%","10%","%","20%"]}  css={{borderCollapse: 'collapse'}}>
              <TableHead>
                  <TableRow>
                      <CCell>序号</CCell>
                      <CCell>代号</CCell>
                      <CCell>名称</CCell>
                      <CCell>编号</CCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                      { orc?.见证表?.map((o: any, i: number) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{i+1}</CCell>
                                  <CCell>{o.no}</CCell>
                                  <CCell>{o.nm}</CCell>
                                  <CCell>{o.sn}</CCell>
                              </TableRow>
                          );
                      } ) }
              </TableBody>
          </Table>
          </DirectLink>
          <Text id="Evaluation" variant="h4" css={{marginTop: '1rem',
          }}>六、记事</Text>
          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Evaluation`}>
              <Table printColWidth={["8%","%","10%","23%"]}  css={{borderCollapse: 'collapse'}}>
                  <TableHead>
                      <TableRow>
                          <CCell>序号</CCell>
                          <CCell>名称</CCell>
                          <CCell>编号</CCell>
                          <CCell>备注</CCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      { orc?.记事表?.map((o: any, i: number) => {
                          return (
                              <TableRow key={i}>
                                  <CCell>{i+1}</CCell>
                                  <CCell>{o.nm}</CCell>
                                  <CCell>{o.no}</CCell>
                                  <CCell>{o.me}</CCell>
                              </TableRow>
                          );
                      } ) }
                  </TableBody>
              </Table>
          </DirectLink>
          <Text variant="h4" css={{marginTop: '1rem',
          }}>七、备注</Text>
          <Table>
              <TableBody>
                  <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/Evaluation`}>
                    <TableRow>
                      <Cell>{multilines2Html(orc.大备注,  (txt,i)=>{
                              return <React.Fragment key={i}>{(i!==0)&&<br/>}<Text>{txt}</Text></React.Fragment>
                          })}</Cell>
                    </TableRow>
                  </DirectLink>
              </TableBody>
          </Table>
          <Text >注：本备注栏的内容在检验报告附件的备注栏内体现。</Text>
          <Text variant="h4" css={{marginTop: '1rem',
          }}>附录1：观测值及测量结果记录表</Text>
          <Table printColWidth={ ["1","1","1","1","1","1","1","1","1","1"] }  css={ {borderCollapse: 'collapse' } }>
              <TableHead>
                  <TableRow>
                      <CCell>序号</CCell>
                      <CCell>项目编号</CCell>
                      <CCell colSpan={4}>检验项目</CCell>
                      <CCell>单位</CCell>
                      <CCell>观测值</CCell>
                      <CCell>结果值</CCell>
                      <CCell>检验结果</CCell>
                  </TableRow>
              </TableHead>
              {/*{观测值及测量表({orc, repId:repId!, verId, rep})}*/}
          </Table>
          注：1、未测量或无需测量的，仅填检验结果栏。<br/>
          2、其他需记录的测量值和结果值填在备注栏中。<br/>
          3、对有多个起升机构的设备，C3.8.1记录主起升机构，其余起升机构记录在备注栏中。<br/>
          4、分别抽查主回路、控制回路、电气设备的相间绝缘电阻和对地绝缘电阻，记录其中的最小值。
          {/*{现场条件({orc, repId:repId!, verId, rep})}*/}

          { orc?.unq?  <>
                  <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                          css={ {borderCollapse: 'collapse', marginTop: '1rem',
                              "@media print": {pageBreakBefore: 'always', marginTop: 'unset'}
                          } } >
                      <TableBody>
                          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ReCheck?original=1#ReCheck`}>
                              <TableRow>
                                  <CCell  colSpan={5}>检验不合格项目内容及复检结果</CCell>
                              </TableRow>
                          </DirectLink>
                      </TableBody>
                  </Table>
                  <Table  fixed={ ["5%","11%","%","14%","14%"]  }    printColWidth={ ["26","49","520","52","71"] }
                          css={ {borderCollapse: 'collapse' } }
                  >
                      <TableHead>
                          <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ReCheck?original=1#ReCheck`}>
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
                                  <DirectLink key={i} href={`/report/EL-JJ/ver/${verId}/${repId}/${mapNoTag.get(bug.no)}?original=1`}>
                                    <TableRow >
                                      <CCell component="td" scope="row">{i+1}</CCell>
                                      <CCell>{bug.c}/{bug.no}</CCell>
                                      <CCell>{bug.b}</CCell>
                                      <CCell>{bug.rs}</CCell>
                                      <CCell>{bug.d}</CCell>
                                    </TableRow>
                                  </DirectLink>
                              );
                          }) }
                      </TableBody>
                  </Table>
              </>
              :
              <DirectLink  href={`/report/EL-JJ/ver/${verId}/${repId}/ReCheck#ReCheck`}>
                  <Button variant="ghost" intent='primary'  css={{"@media print": {display: 'none'} }}  noBind
                  >检验不合格项目内容及复检结果</Button>
              </DirectLink>
          }

      </div>
      {末尾链接({template:'EL-JJ',verId, repId: repId||''})}
    </React.Fragment>
  );
}
