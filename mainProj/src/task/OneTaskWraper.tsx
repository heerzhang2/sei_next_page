/** @jsxImportSource @emotion/react */
import * as React from "react";
//import {useDispatchTaskTo, useDispatchToLiabler, useDispatchToOffice, usePaginateQueryTask} from "./db";
import {
    IconButton,
    Text, Stack, StackItem,
    useTheme,
    Spinner,
    IconPackage,
    Dialog,
    InputLine,
    Button,
    Input,
    useResponsiveContainerPadding,
    InputGroup,
    CommitInput,
    IconSearch,
    IconLayers,
    useMMenuBarOcup,
    Navbar,
    Toolbar,
    DdMenu,
    DdMenuItem,
    VerticalMenu,
    DialogHeading, DialogContent, DialogDescription, DialogClose,
    IconSunrise, IconStopCircle
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
//import { StackItem,  } from "react-gesture-stack";
import {usePaginationFragment, useRefetchableFragment} from "react-relay/hooks";
import {OneTaskWraper$data, OneTaskWraper$key} from "./__generated__/OneTaskWraper.graphql";
import {SyntheticEvent, useContext, useEffect} from "react";
import { BoundDevices } from "./BoundDevices";
import useDispatchTaskToMutation from "./useDispatchTaskToMutation";
import useCancellationTaskMutation from "./useCancellationTaskMutation";
import useSummaryTaskFeeMutation from "./useSummaryTaskFeeMutation";

import RoutingContext from "../routing/RoutingContext";
import {FlowReportConfig} from "../inspect/report/FlowReportConfig";
import {getReportModelTypes} from "../inspect/report/reportTypeMap";
import UserContext from "../routing/UserContext";
import {TaskLikeData, useLiablerDialogMenu, useOfficeDialogMenu} from "./useHelpers";
import {taskStatusMap} from "./TaskList";
import {css} from "@emotion/react";
import {businessTypeMap} from "../device/edit/CommnBase";
import useFinishTaskMutation from "./useFinishTaskMutation";
import useBuildRequestMutation from "../request/hook/useBuildRequestMutation";
// import {Stack, StackItem} from "../../UiDebugSave/sample/Stack";

//只能在内容的顶部下拉，才能触发的，还是需要快捷的按钮。 淘汰掉，鸡勒了也不好用告警。
//import { PullDownContent, PullToRefresh, RefreshContent, ReleaseContent } from "react-js-pull-to-refresh";
//import { BoundDevices } from "./BoundDevices";
//import { useDeleteReport } from "../../inspect/report/db";
import { graphql } from "relay-runtime";

export interface OneTaskWraperProps {
    //这个类型不能乱来，TS编译要用，底下的data要看这个: 返回graphql模型字段定义了吗;
    task: OneTaskWraper$key;
}
//检验任务列表的主窗口OneTaskWraper
/**<Stack包裹的左边主列表
 * 任务分配给部门是在其它环节指定的。
 * */
export const OneTaskWraper: React.FunctionComponent<OneTaskWraperProps>
= props => {
    //第一次啊运行吗？
    const mountedRef = React.useRef(0);
    if(!mountedRef.current) {
        mountedRef.current = 1;
    }
    else
        mountedRef.current++;
    //后面refetch:实际是 (vars: TVars, options?: TOptions) => Disposable;的回调函数。
    const [data, refetch] = useRefetchableFragment(
        graphql`
            fragment OneTaskWraper on Query
            @refetchable(queryName: "OneTaskWraperRefetchQuery") {
                node(id: $taskId)
                {
                    id, __typename, 
                    ... on Task { bsType,entrust,date,status,feeOk,charge,crman{id,person{id,name}},
                        liabler{id,person{id,name},dep{id},office{id}}
                        typicstm{id,master{id,person{id,name},dep{id},office{id}},
                            reviewer{id,person{id,name},dep{id},office{id}},
                            approver{id,person{id,name},dep{id},office{id}},
                            authr{id,person{id,name},dep{id},office{id}}
                        }
                        office{id,name}, dep{id name},servu{id,name}, eqpcnt,
                        detail_list(after:$afterdl,first:$first,orderBy:$orderBydl,where:$wheredl){
                            edges {
                                node{ id,type,
                                    isp{id,no,dev{id,type,sort,vart,subv}}
                                }
                            }
                        },
                        agreement{id,pttype}
                    }
                    ...BoundDevices
                }
            }
        `,
        props.task,
    );
    console.log("来OneTaskWraper看当前的data=",data );
    const { node:task, }=data;
    const details = task?.detail_list?.edges?.map(edge => edge?.node);
    //一个任务有多个设备的：
    const typicisp = details?.[0]?.isp;         //典型Isp
    const {user} = useContext(UserContext);
    const theme = useTheme();
    //提取生成关联的数据Task-Detail[0]-Isp-Report-stm-author[]；检验员人员初始化依据第一个Isp设备的主报告而定。做个短路ApprovalStm快捷访问。
  const [query, ] = React.useState("");
  //const [relation, setRelation] = React.useState();

  const [, setFilter] = React.useState({where:
        {cod:query },
     });

    const noUsers = !query && !task;
    //下层沉下去的 setIndex切换显示界面；
    const [index, setIndex] = React.useState(0);


    /*
    const { submit:dispatch2liablFunc, } = useDispatchToLiabler({
        task: relation, liabler: 1
    });
    //发后端verify:{id:1,username:'herzhang'},后端实体User(String name){}会直接构造输入参数，把{id=1, username=herzhang}当成name构造User
    const { submit:dispatch2TaskFunc, } = useDispatchTaskTo({
        task: relation,date:'2021-02-09', verify:1, ispmen:[21,1,16]
    });
    */

    const {call:dispatch2TaskFunc,doing:doing2 }= useDispatchTaskToMutation();
    const {call:cancelTaskFunc,doing:canceling, called, reset}= useCancellationTaskMutation();
    const { history } = useContext(RoutingContext);
    const {call:summaryTaskFeeFunc,doing:summing,called:summed, result:summrs}= useSummaryTaskFeeMutation();
    const {call:finishTaskFunc, }= useFinishTaskMutation();
    const {call:stopRequestFunc,doing:stopping,result:stopRs,called:stopCald,reset:stopRest}= useBuildRequestMutation();


  React.useEffect(() => {
    //console.log("伪善setQueryResul02=" ,query,usersFind);
    let filtercomp={where:
        {cod:query },
      offset:0,
      first:5,
      orderBy: "useDt",
      asc: false
    };
    setFilter(filtercomp);
  }, [query]);
  //这两个useEffect的前后顺序不能颠倒，顺序非常重要，后面的依赖于前面的useEffect更新结果。
  //usersFind=搜索框搜到到的user;
    /*切换到Stack的第一层*/
    useEffect(() => {
        if(!canceling && called) {
            console.log("取消后端有了应答！-taskId=");
            //同步化处理机制，等待后端真正应答了，才能更新页面，否则继续等待。
            //setRelation(undefined);
            setIndex(0);
            reset();    //setCalled=false,导致不会再次运行上面这段;
        }
       //return () => dispose();
    }, [canceling, called,reset]);

    //三个命令各自的配置模态对话框显示？
    const [diaLiab, setDiaLiab] = React.useState(false);
    const [master, setMaster] = React.useState<any>(task?.typicstm?.master);         //就是报告校核人
    const [ispMens, setIspMens] = React.useState<any>(task?.typicstm?.authr);         //多个 检验人员[User];
    const [reviewer, setReviewer] = React.useState<any>(task?.typicstm?.reviewer);    //审核人
    const [approver, setApprover] = React.useState<any>(task?.typicstm?.approver);    //审批人
    const [modeltype, setModeltype] = React.useState<any>( '' );
    const [modelversion, setModelversion] = React.useState<number>( 1 );
    const [taskDate, setTaskDate] = React.useState<any>(task?.date);

    const {menu: officeItem, dialog: officeDlg}= useOfficeDialogMenu(task! as TaskLikeData);
    const {menu: liablerItem, dialog: liablerDlg}= useLiablerDialogMenu(task! as TaskLikeData);
    //一个任务底下#多个设备 单一次检验 设备种类典型的品种？ 可能有多种报告模板类型啊？？不能非常确定！全部依照典型设备来做，后面可改。
    //会有多次的render经过这里，每一回都会要求执行里面的计算啊， 【提高性能考虑】改成useMemo保存;
    const wholeSort= typicisp?.dev?.sort??'';
    const wholeVart= typicisp?.dev?.vart??'';
    const wholeSubv= typicisp?.dev?.subv??'';
    const models =React.useMemo(() => getReportModelTypes(wholeSort!,wholeVart!,wholeSubv!,
                             task?.bsType!,task?.entrust!), []);
  //上面这个副作用必须 加usersFind，否则无法继续处理后端数据带来的必要的UI反馈变化。
    const {barHeight } = useMMenuBarOcup(history.routeData?.isExact);

    useEffect(() => {
        if(!stopping && stopCald && stopRs?.id) {
            //在后端应答后，不需要用户点击，主动跳转新生成的申请单入口页
            history.push('/request/'+stopRs?.id);
            stopRest();    //导致不会再次运行上面这段;
        }
    }, [stopCald, stopRs, stopping, stopRest]);

  //控件<Stack 是堆叠式的，像导航条；适用同一个模板显示只需上级给下级参数调整的场景。根据上一叠页面选择触发状态relation给下一叠参数来控制下一级显示；更多嵌套很困难。
  if(canceling || stopping)
      return (
          <div style={{
                  display: "flex",
                  height: '87vh'
              }}
          >
            <Spinner doing={canceling || stopping} css={{margin: 'auto'}}/>
          </div>
      );
    console.log("点击触发 为何出2回:",props,"diaLiab=",diaLiab);
    //对话框和点击弹出遭遇可能要延迟 onPress= setTimeout(() => { setDisplayDialog(true); }, 0)避免点透点穿 自动关闭;
  //底下：禁止显示導航條disableNav； 只能是固定值navHeight，是依赖父辈的<Stack>传递context给儿孙<StackTitle>
  //这里<Stack  只有一层的，还没有标题工具条：实际等于摆设。
  //多套上一层DIV增加独立控制布局的能力； margin: auto;简易的遭遇小尺度内容的可屏幕居中显示。
  return (
      <React.Fragment>
        <div css={{
            margin: 'auto',
            background: 'white',
        }}>
          <div
              css={{
                  width:'100%',
              }}
          >
              <Navbar  position="sticky"
                       css={{
                           backgroundColor: "white",
                       }}
              >
                  <Toolbar
                      css={{
                          alignItems: "center",
                          display: "flex",
                          minHeight: `${barHeight}`,
                          [theme.mediaQueries.lg]: {
                              minHeight: `${barHeight}`,
                          }
                      }}
                  >
                      <Text
                          css={{
                              flex: 1,
                              textAlign: "center",
                              [theme.mediaQueries.md]: {
                                  textAlign: "left"
                              }
                          }}
                          wrap={false}
                          variant="h5"
                          gutter={false}
                      >
                          {`${task?.servu?.name}`}
                      </Text>
                      <VerticalMenu>
                          {officeItem}
                          {liablerItem}
                          <DdMenuItem label="责任人派工派任务" onClick={(e) => {
                              setDiaLiab(true);    //对话框最好延迟展示，避免被点击到
                          }} />
                          <DdMenuItem label="责任人结束任务" onPress={() => { finishTaskFunc(task?.id!); } } />

                          <DdMenuItem disabled={summing} label="任务金额汇总"
                                    onPress={() => summaryTaskFeeFunc(task?.id!)} />
                          <DdMenuItem label="要确认任务收费"  contentBefore={<IconPackage/>}
                                      onPress={() => {
                              history.push(`/task/${task?.id}/sumfee`);
                          }} />

                          <DdMenu label="更多">
                              <DdMenuItem label="刷新任务" onPress={() => refetch({first:4,},
                                  {fetchPolicy: "network-only"})} />
                              <DdMenuItem label="设定为当前任务" onPress={() => {
                                  sessionStorage['当前任务'] =JSON.stringify(task?.id);
                              }} />
                              <DdMenuItem label="取消当前这条任务" onPress={() => {
                                  reset();
                                  cancelTaskFunc(task?.id!, "te车dts");
                              }} />
                              {
                                task?.agreement &&
                                 <DdMenuItem label="所归属协议"  contentBefore={<IconSunrise/>}
                                      onPress={() => {
                                          history.push(`/agreement/${task?.agreement?.id}/${task?.agreement?.pttype}`);
                                      }} />
                              }
                              <DdMenu label="异常处置">
                                  <DdMenuItem label="任务延期申请" disabled={stopping} onPress={() => {
                                      stopRest();
                                      stopRequestFunc('','ADD',
                                          { mod:'taskDelay', task:task?.id }
                                      );
                                  }} />
                                  <DdMenuItem label="取消任务申请" disabled={stopping} onPress={() => {
                                      stopRest();
                                      stopRequestFunc('','ADD',
                                          { mod:'cancelTask', task:task?.id }
                                      );
                                  }} />
                                  {
                                      task?.agreement &&
                                      <DdMenuItem label="暂停监检申请"  contentBefore={<IconStopCircle/>} disabled={stopping}
                                              onPress={() => {
                                                  stopRest();
                                                  stopRequestFunc('','ADD',
                                                      { mod:'stopInspec', task:task?.id }
                                                  );
                                                  //history.push(`/agreement/${task?.agreement?.id}/${task?.agreement?.pttype}`);
                                              }} />
                                  }
                              </DdMenu>
                          </DdMenu>

                      </VerticalMenu>
                  </Toolbar>
              </Navbar>
              <div css={{marginLeft:'0.5rem',
                  backgroundColor: task?.status==='DONE'? 'pink': 'transparent',
              }}>
                  <Text variant="h6">{task?.date} {`${taskStatusMap.get(task?.status!)}`} {businessTypeMap.get(task?.bsType)} {task?.entrust? '委':'法'}</Text>
                  <Text variant="h6">{task?.dep?.name} {task?.office?.name} {task?.liabler?.person?.name}</Text>
                  <Text variant="h6">{task?.charge||0} {task?.feeOk? '已确认':'未确认'} {task?.eqpcnt} {`${task?.crman?.person?.name}`}</Text>
              </div>
          </div>

          <Stack
                 navStyle={css({ position: 'sticky',  top: 0,})}
                 style={{
                     overflow: 'unset'
                 }}
              index={index} disableNav={true} navHeight={40}
              onIndexChange={i => setIndex(i)}
              items={[
              {
                   content: (
                      <StackItem className="ItemConte"
                                 css={{
                                    // marginBottom: `${barHeight}`,
                                 }}
                                 style={{ position: undefined, boxShadow:undefined }}
                      >
                          <div className="DlistInnerF1"
                               css={{overflowY: "auto", height: "100%",}}
                          >
                              {task && (
                                  <BoundDevices key={task?.id} task={task!} id={task?.id!}/>
                              )}
                          </div>
                      </StackItem>
                  )
              }
          ]}/>
        </div>

          <Dialog open={diaLiab} onOpenChange={setDiaLiab}>
              <DialogContent >
                  <DialogHeading>
                      配置和选择-派工派给检验员
                  </DialogHeading>
                  <DialogDescription>
          <div>
              <InputLine label={`任务到期日期:`}>
                  <Input type='date'  value={ taskDate  || ''}
                         onChange={e => setTaskDate( e.currentTarget.value||undefined ) } />
              </InputLine>
              <FlowReportConfig  master={master}  ispMens={ispMens} reviewer={reviewer} approver={approver} modeltype={modeltype} modelversion={modelversion}
                                 setMaster={setMaster} setIspMens={setIspMens} setReviewer={setReviewer} setApprover={setApprover} setModeltype={setModeltype}
                                 setModelversion={setModelversion} models={models}
              />
          </div>
          <Button
              intent="primary"
              disabled={false}
              css={{ marginLeft: theme.spaces.sm }}
              onPress={() =>{              //累计[?,,].reduce();
                  let ispMids =ispMens?.map((item:any,index:number,arr:any[])=>{
                      return item?.id;
                  });
                  dispatch2TaskFunc(task?.id!,  taskDate, master?.id,ispMids??[],
                          reviewer?.id, approver?.id,modeltype,modelversion);
                  setDiaLiab(false);
              } }
          >
           派工派给检验员
          </Button>

                  </DialogDescription>
                  <DialogClose>关闭</DialogClose>
              </DialogContent>
          </Dialog>

          {officeDlg}
          {liablerDlg}
      </React.Fragment>
  );
};



export interface TaskTileBoxProps {
    setQuery: React.Dispatch<React.SetStateAction<any>>;
    query: any;       //简易搜索输入框部分。
    label?: string;
}

const TaskTileBox: React.FunctionComponent<TaskTileBoxProps> = ({
                                                                             query,
                                                                             label = "搜索吧",
                                                                             setQuery,
                                                                             ...other
                                                                         }) => {
    const theme = useTheme();
    const responsiveContainerPadding = useResponsiveContainerPadding();
    const {user} = useContext(UserContext);
    const {save, field}= window.history.state?.state??{};      //通用伪对话框传递格式field=上次跳转目标选择字段。
    //设备选择的范围缩小功能
    const [open, setOpen] = React.useState(save?.open || false);
    //利用外部DevfilterContext 传入的unit_id; 在/unit/目录的组件：该单位正在使用设备来充当对话框替代功能时刻设置的unit_id。
    const filt= JSON.parse(sessionStorage['设备过滤']??'{}');

    console.log("来看SearchDeviceBox当前的 filt=",filt,"query=",query);
    const {history } = useContext(RoutingContext);


    return (
        <React.Fragment>
                <InputGroup
                    css={{ margin: 0, position: "relative" }}
                    hideLabel
                    label={label}
                >
                    <CommitInput  value={ query || ''}  onSave={txt => setQuery( txt || undefined) }
                                  type="search" inputSize="md"  autoComplete="off"  placeholder={label}
                                  css={[
                                      {
                                          height: "60px",
                                          textAlign: "left",
                                          border: "none",
                                          borderBottom: "1px solid",
                                          borderColor: theme.colors.border.default,
                                          borderRadius: 0,
                                          WebkitAppearance: "none",
                                          // background: "transparent",
                                          boxShadow: "none",
                                          ":focus": {
                                              boxShadow: "none",
                                              backgroundColor: theme.colors.background.tint1
                                          }
                                      },
                                      responsiveContainerPadding
                                  ]}
                                  {...other}
                    />
                </InputGroup>
                <IconSearch
                    aria-hidden
                    color={theme.colors.scales.gray[6]}
                    css={{
                        display: query ? "none" : "block",
                        position: "absolute",
                        right: `calc(2 * ${theme.spaces.lg})`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10
                    }}
                />
                <IconButton
                    onClick={() => setOpen(true)}
                    variant="ghost"
                    label="定制可选参数"
                    size="lg"
                    icon={<IconLayers />}
                    css={{
                        display: query ? "none" : "block",
                        position: "absolute",
                        right: theme.spaces.sm,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        height: 'unset',
                        width: 'unset'
                    }}
                />
        </React.Fragment>
    );
};

