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
import {accountingCateMap} from "../../dict/financeComm";
// import {SourceCode} from "eslint";  不能引用?.splitLines  报错！
// import {TwoHalfFrame} from "../../UiDebugSave/sample/TwoHalfFrame";


const graphql = require("babel-plugin-relay/macro");

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
    const theme = useTheme();
    // const {user, setUser} =useContext(UserContext);
    const isLarge = useMedia({ minWidth: "768px" });

    const renderList = isLarge || !props.children;  　//大屏或者小屏但没有显示子路由页面。
  console.log("来TodosMain看当前的params propsagreement=",agreement);
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
    const {history } = useContext(RoutingContext);
    // const {" $fragmentSpreads" :aggrrms }=data;
    //不能用useRefetchableFragment( ，改掉? data[]=useFragment(K[])?

    const theme = useTheme();
    const  aux = JSON.parse(agreement?.aux || '{}');
    const devcount= agreement?.devs?.length;
    const isample=agreement?.devs?.findIndex((a)=>a?.address?.length! > 0);
    const seqp=agreement?.devs?.at(isample!);
    //const address=agreement?.devs?.at(0)?.address;
    const ytp= agreement?.bsType;       //来自BusinessCat_Enum：再做大类型区分归并的。
    const maintype= (ytp==="INSTA" || ytp==="MANUFACT" || ytp==="REFORM" || ytp==="REPAIR")? 2:
                (ytp==="TEST"  || ytp==="THERMAL")? 1 : 0;
    // const jyjj=  aux.检依据!.split(/\r?\n/);

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
                 FQP-J05-R04-2018
                </Text>
            </div>
            <Text  css={{
                    textAlign: "center",
                    marginBottom: 'unset',
                }}
                variant="h5"
            >
             技术服务协议
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
                    borderBottom: 'solid thin',
            }} >
                <div css={{
                    display: 'flex',
                }}>
                    <Text css={{
                        flex: '50%',
                    }}>
                        甲方：
                        <Text css={{
                            textDecorationLine: 'underline',
                        }}>
                            {agreement?.servu?.name || ''}
                        </Text>
                    </Text>
                    <Text css={{
                        flex: '50%',
                    }}>
                        乙方：
                        <Text css={{
                            textDecorationLine: 'underline',
                        }}>
                            {agreement?.ispu?.name || ''}
                        </Text>
                    </Text>
                </div>
                <Text css={{
                    textIndent: '2rem',
                    display: 'inline-flex',
                }}>
                依据《中华人民共和国民法典》，甲方委托乙方就</Text>
                    <Text css={{
                        textDecorationLine: 'underline',
                    }}>
                        {aux.项目名}
                    </Text>
                    进行
                    <Text css={{
                        textDecorationLine: 'underline',
                    }}>
                        {accountingCateMap.get(aux.会项类) as unknown as string}
                    </Text>
                    ，本着平等、公平、自愿、诚信、合法的原则，经双方协商一致，达成如下协议：<br/>
                1．  技术服务内容及要求：
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    1.1 服务内容及要求：{aux.服务内容}
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    1.2 服务地点或设备所在地：{aux.address}
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    1.3服务成果的验收形式和方法：{aux.验收法}
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    1.4服务期限：{aux.期限}
                </Text>
                2． 费用及支付方式<br/>
                <Text css={{
                    textIndent: '2rem',
                    display: 'inline-flex',
                }}>
                2.1费用总额（RMB）：
                </Text>
                <Text css={{
                    textDecorationLine: 'underline',
                }}>
                {agreement?.charge}元({moneyUppercase22(agreement?.charge)})
                </Text>
                。
                <br/>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    2.2支付方式和时间：{aux.支付式}；
                </Text>
                3．双方的责任和义务
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                 3.1甲方应向乙方提供健康安全的工作条件，包括有关技术资料、工作环境、人员配合和约定的其它要求。若甲方提供的服务场地不具备健康安全的工作条件，乙方可向甲方书面告知，并暂停提供技术服务。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                 3.2甲方对所提供的有关技术资料和设备信息的真实性、与实物的一致性负责，若有伪造、虚假、不一致等问题，所产生的责任和后果完全由甲方担责。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    3.3乙方应根据双方约定的服务内容和要求完成技术服务工作，并对其服务质量负责。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                 3.4甲乙双方承诺严格遵守廉洁规定，促进双方诚信共廉，防止违规违纪问题的发生，积极配合接受有关方的监督检查。
                </Text>
                4．技术知识产权
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                  在技术服务履行过程中，乙方利用甲方提供的技术资料、工作条件所完成新的技术成果和创造发明，属于乙方所有。甲方利用乙方的工作成果完成新的技术成果和创造发明，属于甲方所有。
                </Text>
                5．其他事项
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                    5.1本协议 {aux.生效点} 后生效，一式份，到乙方服务完成后自行终止。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                5.2本协议未尽事宜，可另附页签订补充协议，补充协议与本协议具有同等效力。
                </Text>
                <Text css={{
                    textIndent: '2rem',
                    display: 'flex',
                }}>
                5.3本协议执行过程双方发生争议时，应协商友好解决，协商不成可以向乙方所在地人民法院提起诉讼。
                </Text>
                <br/>

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
                <br/>
            </div>
            <div css={{
                display: 'flex',
            }}>
                <Text css={{
                    flex: '50%',
                }}>
                    服务部门：{agreement?.dispatcher?.dep?.name || ''}
                </Text>
                <Text css={{
                    flex: '50%',
                }}>
                    联系人及电话：{agreement?.dispatcher?.person?.name || ''}&nbsp;{agreement?.dispatcher?.person?.phone || ''}
                </Text>
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
