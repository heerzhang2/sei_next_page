/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme,
    Button,
    useToast,
    LayerLoading,
    Text,
    Navbar,
    Toolbar,
    IconButton,
    IconArrowLeft,
    MenuList,
    MenuItem,
    IconMoreVertical,
    IconRefButton,
    Container,
    InputLine,
    SuffixInput,
    CommitInput,
    ButtonRefComp,
    VerticalMenu, DdMenuItem, TwoHalfRightPanel, CheckSwitch
} from "customize-easy-ui-component";
// import { InternalItemHandResult, OriginalViewProps, ReportViewProps } from "./comp/base";
//import { useCommitOriginalData } from "./db";
import { Link as RouterLink } from "../routing/Link";
// import { EditStorageContext } from "./StorageContext";
//import { Link as RouterLink } from "wouter";
import {ContainLine, TransparentInput} from "../comp/base";
import { useThrottle } from "../hooks/useHelpers";
import useBuildTaskMutation from "../task/useBuildTaskMutation";
// import useOriginalDataMutation from "./useOriginalDataMutation";
import {PreloadedQuery} from "react-relay/hooks";
import {DetailedGuideQuery} from "../device/__generated__/DetailedGuideQuery.graphql";
import useFlowReportMutation from "../inspect/useFlowReportMutation";
import {OneUserChoose} from "../common/user/OneUserChoose";
import useFlowToMutation from "./hook/useApplicationFlowToMutation";
import {AgreementConfigProps, useMainConfig} from "./hook/useMainConfig";
import {useMainConfigQuery} from "./hook/__generated__/useMainConfigQuery.graphql";
import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
// import {Opinion_Enum} from "./__generated__/useFlowToMutation.graphql";


//是 右边半边页面的！
export default function FlowSelect(props: AgreementConfigProps) {
    const { history } = useContext(RoutingContext);
    // console.log("RecordStarter捕获,切花个source=", source,"routeData=",routeData,"template",template);
    const {agreement} =useMainConfig(props);
  const theme = useTheme();
  const toast = useToast();
  //初始化不可以直接取React.useState(source || {})，不然路由器切换就变成旧source。新修改被抛弃了。
  // const {storage, } =React.useContext(EditStorageContext);
    // const {call:updateFunc,doing,result, called, reset}= useOriginalDataMutation();
    const {call:flowToFunc,doing:flowing, called:flowed, reset:flowreset}=useFlowToMutation();

    const [dldays, setDldays] = React.useState<number|undefined>(3);
    const [memo, setMemo] = React.useState<string|null>();

    const curFlow=sessionStorage['审批单']&&JSON.parse(sessionStorage['审批单']);
    //const {doFunc:throttleDoConfirm, ready:confirmEnable} =useThrottle((refEditor as any)?.current?.doConfirm);
    const [calcfee, setCalcfee] = React.useState<boolean>(curFlow?.tdId === 'agreement_reviewer_check');
    //流转可能遇见两个人物：auditor审核人 或者 dispatcher最终责任人
    const [reviewer, setReviewer] = React.useState<any>(curFlow?.tdId === 'agreement_reviewer_check' ? agreement?.dispatcher : agreement?.auditor);

    if (!props.routeData.params.ptId)     return null;

    //【流转审批看见】后端流转初始化 uri= 给第一个签字人看得是 /agreement/:ptId/:pttype/
    const hrefReportE =`/agreement/${props.routeData.params.ptId}/${props.routeData.params.pttype}`;
    // const hrefReportView =`/reportView/${routeData.params.template}/ver/${routeData.params.verId}/${routeData.params.repId}?&print=1`;

    const skelon=<>
        <Container>
            <div css={{
                paddingBottom: theme.spaces.lg
            }}>
                <Button  onPress={async () => {
                            history.push(hrefReportE);
                        }}
                >
                  协议申请单细节
                </Button>
                <Button  css={{marginLeft: theme.spaces.sm}}
                        onPress={async () => {
                            history.push(`/agreementView/${props.routeData.params.ptId}/${props.routeData.params.pttype}`);
                        }}
                >
                  协议书
                </Button>
                <ContainLine display='单位'>
                    <TransparentInput readOnly={true} value={agreement?.servu?.name || ''}/>
                </ContainLine>
                <ContainLine display='当前待办所处节点'>
                    <TransparentInput readOnly={true} value={`${curFlow?.fNode}`}/>
                </ContainLine>
                <ContainLine display='前一个节点'>
                    <TransparentInput readOnly={true} value={curFlow?.pren || ''}/>
                </ContainLine>
                <ContainLine display='前面环节的留言'>
                    <TransparentInput readOnly={true} value={curFlow?.say || ''}/>
                </ContainLine>
                {
                    (curFlow?.tdId==='agreement_promoter_action' || curFlow?.tdId==='agreement_reviewer_check') &&
                    <InputLine label={(curFlow?.tdId==='agreement_promoter_action'? '审核人':'责任人') +`(点击进入选择):`}>
                        <OneUserChoose name={reviewer?.person?.name!} setEditorVar={setReviewer}
                                       oobj={reviewer}/>
                    </InputLine>
                }

                { curFlow?.tdId==='agreement_reviewer_check' &&
                    <InputLine label={`是否重新计费:`}>
                        <CheckSwitch checked={calcfee} onChange={e => setCalcfee(!calcfee)}/>
                    </InputLine>
                }
                <InputLine label={`流转的说明理由:`}>
                    <CommitInput  value={ memo || ''}  onSave={txt => setMemo( txt || undefined) }
                                  placeholder="如果实际收费金额比应收费任务金额少的，必须给出说明"
                    />
                </InputLine>
            </div>
        </Container>
         <Button intent="primary" disabled={curFlow && !(curFlow?.entId === props.routeData.params.ptId)}
                      onPress={async () => {
                          // const href = curFlow?.fNode === '责任工程师审核' ? hrefReportView : hrefReportE;
                          await flowToFunc(curFlow?.utId, props.routeData.params.ptId, dldays || 7, null, memo || null, "YES",
                              reviewer?.id, calcfee);
                          // toast({title: "流转前进一步"});
                          //签字成功与否，都将可直接清空session状态; 不支持并发进行多个审批单子或多份报告同时进入审核工作范围。一个时间点只能一条审批事项。
                          sessionStorage['审批单'] = null;
                          history.push(`/zeebeTodo`);
                      }}
         >
        {curFlow?.tdId==='agreement_promoter_action' ? '提请给审核人' :
            curFlow?.tdId==='agreement_accept' ? '收入囊中' :
                curFlow?.tdId==='agreement_make_fallback' ? '完善再提交' :
                    curFlow?.tdId==='agreement_window_no' ? '再试试,不可能没人管' :
                        curFlow?.tdId==='agreement_check_fallback' ? '提交再审核' :
                            curFlow?.tdId==='agreement_reviewer_check' ? (calcfee? '让责任人计费' : '签字不改了') :
                                curFlow?.tdId==='agreement_task_calcfee' ? '计费后提交审核人' :
                                    curFlow?.tdId==='agreement_fee_confirm' ? '确定费用或留言' :
                                        curFlow?.tdId==='agreement_author_approve' ? '客户签字' :
            '通过的流转下步'}
         </Button>
        {
            (curFlow?.tdId!=='agreement_window_no' && curFlow?.tdId!=='agreement_fee_confirm') &&
            <Button intent="primary" css={{marginLeft: theme.spaces.sm}}
                    disabled={!(curFlow?.entId === props.routeData.params.ptId)}
                    onPress={async () => {
                        await flowToFunc(curFlow?.utId, props.routeData.params.ptId, dldays || 5, null, memo || null, "NO",reviewer?.id);
                        toast({title: "回退了"});
                        sessionStorage['审批单'] = null;
                        history.push(`/zeebeTodo`);
                    }}
            >
                {(curFlow?.tdId==='agreement_reviewer_check' || curFlow?.tdId==='agreement_promoter_action' )? '退给申请人' :
                    curFlow?.tdId==='agreement_accept' ? '休假中' :
                        (curFlow?.tdId==='agreement_make_fallback' || curFlow?.tdId==='agreement_check_fallback') ? '作废申请单' :
                            curFlow?.tdId==='agreement_task_calcfee' ? '给客户确认计费机会' :
                                curFlow?.tdId==='agreement_author_approve' ? '作废' :
                           '否定结论'}
            </Button>
        }
        {
            (curFlow?.tdId==='agreement_reviewer_check' || curFlow?.tdId==='agreement_author_approve' ) &&
            <Button intent="primary" css={{marginLeft: theme.spaces.sm}}
                    disabled={!(curFlow?.entId === props.routeData.params.ptId)}
                    onPress={async () => {
                        await flowToFunc(curFlow?.utId, props.routeData.params.ptId, dldays || 5, null, memo || null, "BACK",reviewer?.id);
                        // toast({title: "回退了"});
                        sessionStorage['审批单'] = null;
                        history.push(`/zeebeTodo`);
                    }}
            >
                {curFlow?.tdId==='agreement_reviewer_check'? '退回受理人' : '不满意要改'}
            </Button>
        }

        { curFlow && (
            <Text  variant="h5"　css={{ textAlign: 'center' }}>
            流程名：{curFlow?.process}。
            </Text>
        ) }
    </>

    //当前选定待办是否一一对应的？
    const outview=(!curFlow || (curFlow?.entId !== props.routeData.params.ptId) || curFlow?.process!=='业务协议拟定')?
        <Text variant="h5">应该从待办页面从点选相对应审批单，选中对应的事项进来才能操作，待办事项应该一个一个地办理当前等待处理事项中途不要切换，若中途切换则需从待办列表找回上一次对应待办事项点选进入后才能继续流转操作</Text>
        : skelon;

  return (
      <TwoHalfRightPanel
          title={`业务协议拟定申请单流转`}
          back={
              <RouterLink href={hrefReportE}>
                  <IconButton  noBind  icon={<IconArrowLeft />}
                               variant="ghost"
                               label="后退"
                               size="md"
                               css={{
                                   marginRight: theme.spaces.sm,
                                   [theme.mediaQueries.md]: {
                                       display: "none"
                                   }
                               }}
                  />
              </RouterLink>
          }
          menu={
              <VerticalMenu>
                  <DdMenuItem label="协议已生成或关联任务"
                              onClick={(e) => {
                                  history.push(`/agreement/${props.routeData.params.ptId}/${props.routeData.params.pttype}/tasks`);
                              }}/>
              </VerticalMenu>
          }
      >
          {outview}
      </TwoHalfRightPanel>
  );
}
