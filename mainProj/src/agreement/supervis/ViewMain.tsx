/** @jsxImportSource @emotion/react */
import {jsx, css} from "@emotion/react";
import * as React from "react";
import {
    useTheme,
    TwoHalfFrame,
    useToast,
    Stack,
    StackTitle,
    VerticalMenu,
    DdMenuItem,
    StackItem,
    Text,
    Button,
    List,
    ListFlexRow,
    IconChevronRight,
    Itext,
    IconGift,
    IconArrowRight,
    IconTruck,
    IconPrinter,
    useResponsiveBodyPadding,
    IconKey,
} from "customize-easy-ui-component";

import { useMedia } from "use-media";
import {useContext} from "react";
// import {UserContext} from "../routing/UserContext";
// import useLogoutMutation from "../common/useLogoutMutation";
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery, useRefetchableFragment} from "react-relay/hooks";
// import {TodosMainQuery} from "./__generated__/TodosMainQuery.graphql";
// import {UserTaskList} from "./UserTaskList";
import {AloneContainer} from "../../comp/AloneContainer";
import {OneAgreementMainQuery, OneAgreementMainQuery$data} from "../__generated__/OneAgreementMainQuery.graphql";
import {useOneAgreement} from "../OneAgreementMain";
import {UserTaskList$key} from "../../inspect/__generated__/UserTaskList.graphql";
import RoutingContext from "../../routing/RoutingContext";
import {useZeebeRead} from "../../inspect/report/localUpdateRelay";
import cutting_board_knife from "../../images/cutting-board-knife.jpg";
import {FadeImage} from "../../comp/FadeImage";
import {Link as RouterLink} from "../../routing/Link";
import {useFragment} from "react-relay";
import {dateToChinese} from "../../common/tool";
import {OneAgreementMain$data} from "../__generated__/OneAgreementMain.graphql";
import {eqpTypeAllMap} from "../../dict/eqpComm";
import {AgreementListItem} from "../AgreementListItem";
import { moneyUppercase22 } from "../../common/money-uppercase";
// import {SourceCode} from "eslint";  不能引用?.splitLines  报错！
// import {TwoHalfFrame} from "../../UiDebugSave/sample/TwoHalfFrame";


import { graphql } from "relay-runtime";

interface TodosMainProps {
    prepared: {
        query: PreloadedQuery<OneAgreementMainQuery>;
    }
    children: React.ReactNode;      //自己是路由Main主页面，所以这个children表示有没有嵌套的子路由Main入口页面
    id?: string;
    routeData: any;
}

export default function ViewMain(props: TodosMainProps) {
    const {agreement} = useOneAgreement(props);
    //     graphql`
    //         query OneAgreementMainQuery(
    //             $modId:ID!,
    //         ) {
    //             node(id: $modId){ id }
    //             ...OneAgreementWraper
    //         }
    //     `,
    //     props.prepared.query,
    // );
  //const { countTask:sumofTask,  }=data;
    const theme = useTheme();
    // const {user, setUser} =useContext(UserContext);
    const isLarge = useMedia({ minWidth: "768px" });
    const [activeTab, setActiveTab] = React.useState(2);

    const renderList = isLarge || !props.children;  　//大屏或者小屏但没有显示子路由页面。
  console.log("来TodosMain看当前的params propsagreement=",agreement);
    // const { call:signOut } = useLogoutMutation();
    //显示器分辨率是96dpi(目前主流显示器默认设置)，A4纸像素大小是 794px *1123px,不能真正预览效果！
  return (
      <AloneContainer css={{
          background: 'white',
          alignItems: 'unset',
          maxWidth: '794px',    //A4纸张 或者电脑屏幕限制宽
          "@media print": {
              margin: 'unset',       //小于一页纸高度的就不要居中
          },
      }}>
          <ForPrintInner agreement={agreement}/>
      </AloneContainer>
  );
};


interface ForPrintInnerProps {
    //代码复用，Relay只好提前提取内省字段，类型也只能声明这样：
    agreement: OneAgreementMain$data["node"];
    //agreement: OneAgreementMainQuery$data["node"];    后面有了Refetch被接替掉了。
}

//从OneAgreementMainQuery$data;无法直接获取片段OneAgreementWraper中的字段，只能获取到node{id}。
//因为<AloneContainer 导致高度方向居中的，在打印体现小于一张A4纸的也会居中！超过一张纸的不会了。
const ForPrintInner: React.FunctionComponent<ForPrintInnerProps> = ({agreement}) => {
    // const {" $fragmentSpreads" :aggrrms }=data;
    //不能用useRefetchableFragment( ，改掉? data[]=useFragment(K[])?
    const {history } = useContext(RoutingContext);
    const theme = useTheme();
    const  aux = JSON.parse(agreement?.aux || '{}');
    const devcount= agreement?.devs?.length;
    const isample=agreement?.devs?.findIndex((a)=>a?.address?.length! > 0);
    const seqp=agreement?.devs?.at(isample!);
    //const address=agreement?.devs?.at(0)?.address;
    const ytp= agreement?.bsType;       //来自BusinessCat_Enum：再做大类型区分归并的。
    const maintype= (ytp==="INSTA" || ytp==="MANUFACT" || ytp==="REFORM" || ytp==="REPAIR")? 2:
                (ytp==="TEST"  || ytp==="THERMAL")? 1 : 0;
    const jyjj=  aux.检依据?.split(/\r?\n/) || [];
    const 未尽事s= aux.未尽事?.split(/\r?\n/) || [];
    //【尺寸】对于A4打印纸张竖排宽度，通常用 <Text> 的默认情况的一行大约44个汉字大小，默认情况的每张是43行，=1892汉字。
    //对照宋体4号字标准字间距，无网格单倍行间距，全汉字，可以打印1558个； 行数是44行每张A4纸。
    //规范的正文是：22行X28个字，每页字数=616 ; 正文用小四号宋体。
    //浏览器默认字体的排版：行数是44行，而每一行字数44个。  #而<Text>默认是换行display：block的，除非其上一级div做了display: 'flex'。
    return (
        <>
            <div css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
            }}>
                <Text  css={{
                        marginBottom: 'unset',
                    }}
                    variant="h4"
                >
                 FJSEI
                </Text>
                <Text
                    css={{
                    }}
                >
                 FJSEI FQP-J05-R03-2018
                </Text>
            </div>
            <Text  css={{
                    textAlign: "center",
                    marginBottom: 'unset',
                }}
                variant="h5"
            >
              检验检测、监检协议书
            </Text>
            <Text  css={{
                    marginRight: '2rem',
                    textAlign: 'end',
                }}
            >
             协议编号：{agreement?.ptno}
            </Text>
            <div  css={{
                    paddingTop: "8px",
                    borderTop: 'solid thin',
            }} >
                受检单位（甲方）：
                <Text css={{
                    textDecorationLine: 'underline',
                }}>
                    {agreement?.servu?.name || ''}
                </Text>
                <br/>检验单位（乙方）：
                <Text css={{
                    textDecorationLine: 'underline',
                }}>
                    {agreement?.ispu?.name || ''}
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                根据甲方要求，乙方自 {dateToChinese(aux.进场时)} 起，对甲方安装于 {seqp?.address}，使用单位为：{seqp?.useu?.name} 的
                    {eqpTypeAllMap.get(seqp?.type!)}   共  {devcount} 台（条）
                    进行检验{maintype===0? '√':'□'}、检测{maintype===1? '√':'□'}、监检{maintype===2? '√':'□'}，为明确双方职责，经协商达成如下协议，双方共同遵守：
                </Text>
                一、检验检测依据：
                {
                    jyjj.map((rule: string,i:number) => (
                        <Text key={i} css={{
                            textIndent: '2rem',
                            display: 'flex',
                        }}>
                            {rule}
                        </Text>
                    ))
                }
                <br/>
                二、双方权利和义务
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    1. 甲方应在施工前书面向乙方申报检验，并按照有关法规、标准的要求提供受检设备必要的技术资料和工作见证材料。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    2. 甲方应按要求做好检验检测前的准备工作，并向检验人员提供必要的工作条件，指定一名工作人员与乙方人员进行联络与配合，以保证乙方人员的正常工作。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    3. 乙方应根据甲方提供的设备清单，及时进入现场，严格按照有关技术、规范的要求，并按照福建省特种设备监督检验研究院相应的院标准规定项目进行检验检测。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    4. 乙方尽可能满足甲方提出的工作进度,不得无故拖延检验检测时间和出证时间。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    5. 乙方在检验检测过程中应保证检验检测质量，发现重要缺陷应及时向甲方反馈，以便于整改。
                </Text>
                三、收费
                <Text css={{
                    textIndent: '2rem',
                    // display: 'flex',
                }}>
               检验检测收费依据《福建省特种设备检验收费管理暂行办法》（闽价费【2009】9号）以《福建省发改委 福建省财政厅关于重新制定特种设备检验检测费收费标准的函》（闽发改服价函【2020】107号）执行，本次检验费共计人民币
                </Text> &nbsp;
                <Text css={{
                    textDecorationLine: 'underline',
                }}>
                    {moneyUppercase22(agreement?.charge)}
                </Text>
                。 （其中：检验检测费 {aux.检检费 || '/'} 元，无损检测费 {aux.无损费 || '/'} 元，理化试验 {aux.理化费 || '/'} 元、应力测试费等其他项目 {aux.其他费 || '/'} 元）。
                <br/>
                四、本协议一式  二 份，双方各执  一 份，有效期至检验业务及上述条款履行结束为止。
                <br/>五、未尽事宜商定如下：（可增页）
                {
                    未尽事s.map((rule: string,i:number) => (
                        <Text key={i} css={{
                            textIndent: '2rem',
                            display: 'flex',
                        }}>
                            {rule}
                        </Text>
                    ))
                }
                <br/><br/>

                <div css={{
                    display: 'flex',
                    margin: '1rem 0 0 0',
                    "@media print": {
                        margin: '3% 0 0 0',
                        pageBreakInside: 'avoid',
                    },
                }}>
                    <div css={{
                        flex: '50%',
                    }}>
                    甲方： {agreement?.servu?.name || ''} ( 章 )
                        <br/>
                        地址：
                        <br/>
                        <div css={{
                            display: 'flex',
                        }}>
                            <Text css={{
                                flex: '50%',
                            }}>
                                代表：
                            </Text>
                            <Text css={{
                                flex: '50%',
                            }}>
                                电话：
                            </Text>
                        </div>
                        开户银行：
                        <br/>
                        账号：
                        <br/>
                        {dateToChinese(agreement?.mdtime!)}
                    </div>
                    <div css={{
                        flex: '50%',
                    }}>
                    乙方： {agreement?.ispu?.name || ''}
                        <br/>
                        地址：福州市仓山区卢滨路370号
                        <br/>
                        <div css={{
                            display: 'flex',
                        }}>
                            <Text css={{
                                flex: '50%',
                            }}>
                                代表：
                            </Text>
                            <Text css={{
                                flex: '50%',
                            }}>
                                电话：968829 或 0591-88700799
                            </Text>
                        </div>
                        开户银行：
                        <br/>
                        账号：
                        <br/>
                        {dateToChinese(agreement?.mdtime!)}
                    </div>
                </div>

            </div>
            <div css={{
                marginTop: '0.5rem',
                "@media print": {
                    display: 'none'
                },
            }}>
                <Button  intent="primary"
                         onPress={() => { window.print();
                }}
                >预览转PDF或直接打印
                </Button>
                <Button intent="primary" css={{marginLeft: theme.spaces.sm}}
                        onPress={async () => {
                            history.push(`/agreement/${agreement?.id}/${agreement?.pttype}`);
                        }}>协议申请单
                </Button>
            </div>
        </>
    );
};


//CSS：注意flex:'50%',实际等于flex-grow: 1; flex-shrink: 1; flex-basis: 50%;关键flex-basis默认大小分配，而不是自动分配，我就约定比例了。DIV两个兄弟都必须设置!
//若用<table <tfoot 会每一页都会存在tfoot内容。
//@page :first{size: A4 portrait; }  orphans 设置当元素内部发生分页时必须在页面底部保留的最少行数; https://www.imangodoc.com/22856.html
//【打印局限性】没法让一个DIV一点能够吸附到打印纸张的底部位置，吸附头部可以做到，吸附纸张底部只能<tfoot但是它若跨越一个纸张高度的就会出现多个<tfoot内容的。
//若用position: absolute; bottom: calc(-100vh + 13rem);只能针对最后一页的最后一个DIV适用的，同时只能固定几页纸张的最后一个Div高度明确的-A00vh + Brem这俩个A和B数值必须事前能够敲定的。A=几张纸B=吸附DIV自身高度都必须固定的。
//【WEB打印困惑】总之没办完美让前面内容动态适应的后续某个DIV(非结束点的)沉底吸附纸张底部位置。  而用position: fixed;只能针对打印唯一一张纸的情景适用，
