/** @jsxImportSource @emotion/react */
import * as React from "react";
import {css} from "@emotion/react";
import {
    List,
    ListItem,
    Avatar,
    MenuItem,
    Text,Stack, StackTitle, StackItem,
    useTheme,
    IconChevronRight,
    IconMoreVertical,
    Skeleton,
    IconRefButton,
    Spinner,
    IconLayers,
    Dialog,
    InputLine,
    Select,
    Button,
    Input,
    useToast,
    useMMenuBarOcup,DdMenu, DdMenuItem, VerticalMenu,
    DialogContent, DialogHeading, DialogDescription, DialogClose,
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {usePaginationFragment} from "react-relay/hooks";
import {TaskList$data, TaskList$key} from "./__generated__/TaskList.graphql";
import {SyntheticEvent, useContext, useEffect, } from "react";
import { BoundDevices } from "./BoundDevices";
import useDispatchToOfficeMutation from "./useDispatchToOfficeMutation";
import useDispatchToLiablerMutation from "./useDispatchToLiablerMutation";
import useDispatchTaskToMutation from "./useDispatchTaskToMutation";
import useCancellationTaskMutation from "./useCancellationTaskMutation";
import RoutingContext from "../routing/RoutingContext";
import {BoundDevices$key} from "./__generated__/BoundDevices.graphql";
import {TaskLikeData, useLiablerDialogMenu, useOfficeDialogMenu} from "./useHelpers";
import {ChooseUnit} from "../unit/ChooseUnit";
import UserContext from "../routing/UserContext";
import {
    bool3t,
    fromObjToInput,
    mutiSelectedArr,
    omitArnull, userIdName,
} from "../common/tool";
import {useUserDepOffice} from "../common/user/useUserDepOffice";
import {业务类型s} from "../device/edit/CommnBase";
import {OneUserChoose} from "../common/user/OneUserChoose";
// import {useInView} from "react-intersection-observer";
// import {Stack, StackTitle, StackItem,} from "../../UiDebugSave/sample/Stack";


//只能在内容的顶部下拉，才能触发的，还是需要快捷的按钮。 淘汰掉，鸡勒了也不好用告警。
//import { PullDownContent, PullToRefresh, RefreshContent, ReleaseContent } from "react-js-pull-to-refresh";
//import { BoundDevices } from "./BoundDevices";
//import { useDeleteReport } from "../../inspect/report/db";
const graphql = require("babel-plugin-relay/macro");
//后端enum TaskState_Enum
const taskStatusObj = {'INIT':'新的', 'DEPART':'部门内分配', 'OFFICE':'科室内分配', 'PERSON':'等责任人派工',
        'DISP':'已派工','HANGUP':'等待复检派工','DONE':'已完成','CANCEL':'作废'
};
export const taskStatusMap = new Map(Object.entries(taskStatusObj));        //不能用WeakMap()

//后端enum BusinessCat_Enum  类似语义 业务类型s ； 专门针对图标单个字符显示的
const businessCatspObj = {'REGUL':'定期', 'ANNUAL':'年度', 'INSTA':'安装', 'FIRST':'首检', 'TEST':'测','DELIVERY':'收',
    'ESTIMATE':'评估','EXPERIMENT':'试验', 'IDENTIFIC':'鉴定','MANUFACT':'制造','PRESSURE':'耐压','PRODUCT':'产品',
    'REFORM':'改造','REPAIR':'大修','SAFETYINS':'进口','THERMAL':'热效', 'TYPETST':'型式','OTHER':'它'
};
export const businessCatspMap = new Map(Object.entries(businessCatspObj));
//三态逻辑转映射 false=0， true=1， ANY=2等于Java的null不明确的？;  两态的Bool不够用了。
export const 委托法定s=[['2','全部'],['0','法定'],['1','委托']];




export interface TaskListProps {
    tasks: TaskList$key;
}
//检验任务列表的主窗口
export const TaskList: React.FunctionComponent<
    TaskListProps
> = props => {
    //【问题】可复用...BoundDevices要求的接口参数$after和上层这里findAllTaskFilter的参数用相同名字，导致注入同一个值。
    const { data, refetch , loadNext,hasNext,isLoadingNext} = usePaginationFragment(
        graphql`
            fragment TaskList on Query
            @refetchable(queryName: "TaskListRefetchQuery") {
                findAllTaskFilter(where: $twhere,after:$after,first:$first,orderBy:$orderBy,asc:$asc)
                @connection(key: "Query_findAllTaskFilter") {
                    edges {
                        __id
                        node {
                            id,dep{id name},office{id name},date,status,bsType,entrust,servu{id,name}
                            liabler{id,person{id,name}},eqpcnt
                            ...BoundDevices
                        }
                    }
                }
            }
        `,
        props.tasks,
    );
    const { findAllTaskFilter:list, }=data;
    const tasks = list?.edges?.map(edge => edge?.node);
  //const { loading, items:tasks ,error:listError, refetch} = usePaginateQueryTask(null);
    const {user} = useContext(UserContext);
    const theme = useTheme();
    //const toast = useToast();
  //搜索user的输入:
  const [query, ] = React.useState("");
  /*const [
    queryResults,
    setQueryResults
  ] = React.useState<ResponseLikeAlgoliasearch | null>(null);
*/
  //下沉的弹出式框，当前被选定的到底是哪一个上层列表项；状态管理　relation＝Stack当前是从谁下层的(仅针对第二层的Stack组件)。
    const [relation, setRelation] = React.useState<string|null>();
    const [tasknow, setTasknow] = React.useState<any>();     //类型混淆在一起relation和tasknow列表数据，只好分开搞两个变量。

    const noUsers = !query && ( tasks?.length === 0);
    //下沉轮换  setIndex切换显示界面；   //index不是组件外部那一个同名index；
    const [index, setIndex] = React.useState(0);
    const {save, field}= window.history.state?.state??{};      //通用伪对话框传递格式field=上次跳转目标选择字段。

    const {call:dispatch2offiFunc,doing, result:_}= useDispatchToOfficeMutation();
    /*
    const { submit:dispatch2liablFunc, } = useDispatchToLiabler({
        task: relation, liabler: 1
    });
    //发后端verify:{id:1,username:'herzhang'},后端实体User(String name){}会直接构造输入参数，把{id=1, username=herzhang}当成name构造User
    const { submit:dispatch2TaskFunc, } = useDispatchTaskTo({
        task: relation,date:'2021-02-09', verify:1, ispmen:[21,1,16]
    });
    */
    const {call:dispatch2liablFunc,doing:doingliabl, result:_l}= useDispatchToLiablerMutation();
    const {call:dispatch2TaskFunc,doing:doing2 }= useDispatchTaskToMutation();
    const {call:cancelTaskFunc,doing:canceling, called, reset}= useCancellationTaskMutation();
    const { history } = useContext(RoutingContext);
    //可以多处地方重复使用的代码， 新的代码复用机制。
    const {menu: officeItem, dialog: officeDlg}= useOfficeDialogMenu(tasknow! as TaskLikeData);
    const {menu: liablerItem, dialog: liablerDlg}= useLiablerDialogMenu(tasknow! as TaskLikeData);
    const filt= JSON.parse(sessionStorage['任务过滤']??'{}');
    const idfilt= fromObjToInput(filt,'dep','office','liabler','servu');
    const [open, setOpen] = React.useState(save? save.open :false);
    // const [depId, setDepId] = React.useState<any>(  filt?.dep?.id );
    // const [office, setOffice] = React.useState<any>(filt?.office);
    const {dep, office, panel, preload, setDep,setOffice}= useUserDepOffice(save? save.dep : filt?.dep, save? save.office : filt?.office);
    const [date1, setDate1] = React.useState<any>(save? save.date1 : filt?.date1);
    const [date2, setDate2] = React.useState<any>(save? save.date2 : filt?.date2);
    const [statusx, setStatusx] = React.useState<string[]>(save? save.statusx :filt?.statusx);
    const [entrust, setEntrust] = React.useState(save? save.entrust : filt?.entrust || '2');
    const [bsTypex, setBsTypex] = React.useState<string[]>(save? save.bsTypex :filt?.bsTypex);
    const [liabler, setLiabler] = React.useState<any>(save? save.liabler :filt?.liabler);
    const [servu, setServu] = React.useState(save? save.servu : filt?.servu);
    const toast = useToast();
    console.log("任务列表当今页面#sum：", tasks?.length ,"个tasks=",tasks);
    const { barHeight } = useMMenuBarOcup(history.routeData?.isExact);

    async function confirmation() {
        return {
            open, date1, date2, entrust, statusx, bsTypex, liabler, dep, office, servu,
        };
    }
    /*切换到Stack的第二层*/
  function showRelation(idx: number) {
    console.log("点击showRelation？task=", tasks![idx]);
    setTasknow(tasks![idx]!);
    setRelation(tasks![idx]?.id);
    //保存当前任务：在设备列表页面就能直接提取当前任务进行添加设备给当前任务了
    //sessionStorage['当前任务'] =tasks![idx]?.id;    //复合属性对象要序列化JSON.stringify({});
    setIndex(1);
  }


  //这两个useEffect的前后顺序不能颠倒，顺序非常重要，后面的依赖于前面的useEffect更新结果。
  //usersFind=搜索框搜到到的user; , []  可导致副作用的 死循环 !
    useEffect(() => {
        if(save?.open)     preload();
    }, [save?.open, preload]);

    useEffect(() => {
        if(!canceling && called) {
            console.log("取消后端有了应答！-taskId=", relation);
            //同步化处理机制，等待后端真正应答了，才能更新页面，否则继续等待。
            setRelation(null);
            setIndex(0);
            reset();    //setCalled=false,导致不会再次运行上面这段;
        }
        //return () => dispose();
    }, [canceling, relation,called,reset]);

   /* const [refMore, acrossMore] = useInView({threshold: 0});
    useEffect( () => {
          if(acrossMore && hasNext)   loadNext(5)
      },
    [acrossMore,hasNext,loadNext ]);*/
  //上面这个副作用必须 加usersFind，否则无法继续处理后端数据带来的必要的UI反馈变化。
  //控件<Stack 是堆叠式的，像导航条；适用同一个模板显示只需上级给下级参数调整的场景。根据上一叠页面选择触发状态relation给下一叠参数来控制下一级显示；更多嵌套很困难。

    const [tabIndex, setTabIndex] = React.useState(0);

  if(canceling)
      return (
          <div style={{
                  display: "flex",
                  height: '87vh'
              }}
          >
            <Spinner doing={canceling} css={{margin: 'auto'}}/>
          </div>
      );

  return (
   <React.Fragment>
     <Stack className="DeviceListBg"
         css={{
             overflowY: "scroll",
             position: 'unset',
             height: "100%",
         }}
      index={index}
      navHeight={40}
      onIndexChange={i => setIndex(i)}
      items={[
        {
          title: (
            <StackTitle
              contentAfter={
                <>
                    <VerticalMenu>
                        <DdMenuItem label="强制刷新任务列表"
                                    onClick={(e) => {
                                        let filtercomp={twhere: {   ...idfilt , entrust: bool3t(idfilt?.entrust)},
                                            offset:0, first:3,
                                        };
                                        refetch(filtercomp, {fetchPolicy: 'network-only'})
                                    }}/>
                        <DdMenuItem label="添加新的业务任务"
                                    onClick={(e) => {
                                        history.push("/tasks/new");
                                    }}/>
                    </VerticalMenu>
                    <DdMenu label="定制可选参数" tight={true}
                            icon={
                                <MenuItem variant="ghost"  component={"div"}
                                          onClick={() => {
                                              preload();
                                              setOpen(true)
                                          }}
                                >
                                    <IconLayers />
                                </MenuItem>
                            }
                    />
                </>
              }
              title={"当前所有任务单"}
            />
          ),
          content: (
            <StackItem className="AllTsk1Flor" css={{ marginBottom: `${barHeight}`, }}
                         style={{ position: undefined }}
            >
             <div className="DlistInnerF1"
                css={{
                  overflowY: "auto",
                  height:  '100vh',   //【解密】上一级用了<Pager组件包裹导致<StackItem不能上position:‘absolute’跟着引起这个Div必须限制高度才能产生滚动条！
                  //height: "100%",  不能用"100%"
                }}
              >
               <div className="BoundDevices"
                   css={{
                       paddingBottom: '25vh',     //配合上一个Div height:'100vh'，留出滚动到底的空白;
                   }}
               >
                {!isLoadingNext && noUsers && (
                  <Text
                    muted
                    css={{
                      fontSize: theme.fontSizes[0],
                      display: "block",
                      margin: theme.spaces.lg
                    }}
                  >
                    {'您还没有任务'}
                  </Text>
                )}

                <List className="TasksLst">

                  {isLoadingNext && (
                    <React.Fragment>
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "160px" }} />}
                      />
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "200px" }} />}
                      />
                    </React.Fragment>
                  )}

                  {tasks?.map((each,idx) => {
                      const sts= each?.status;
                      const sonLine = (
                          <Text variant="h6" gutter={false}>
                              { (sts==='INIT' || sts==='DEPART')?   each?.dep?.name :
                                  sts==='OFFICE'?  each?.office?.name :
                                      sts==='PERSON'?  each?.office?.name+" "+each?.liabler?.person?.name :
                                          sts==='CANCEL'?  each?.dep?.name+" "+each?.liabler?.person?.name :
                                            each?.liabler?.person?.name
                              }
                          </Text>
                      );
                    return (
                      <ListItem
                        key={each?.id}
                        interactive={ true}
                        onPress={() =>
                          showRelation( idx )
                        }
                        contentBefore={
                            <React.Fragment>
                                <Avatar size="xs" name={ businessCatspMap.get(each?.bsType!) }/>
                                <Avatar size="xs" name={each?.entrust? '委托':'法定'}/>
                            </React.Fragment>
                        }
                        primary={`${each?.date} ${taskStatusMap.get(each?.status!)} ${each?.eqpcnt}`}
                        secondary={each?.servu?.name}
                        contentAfter={
                            <IconChevronRight  color={theme.colors.text.muted} aria-hidden/>
                        }
                      >
                       { sonLine }
                      </ListItem>
                    );
                  })}
                </List>

                  <div
                      css={{
                          textAlign: "center",
                          marginBottom: theme.spaces.md,
                          marginTop: theme.spaces.md
                      }}
                  >
                      { hasNext  &&  (
                          <div>
                              <Button disabled={isLoadingNext} onPress={ () =>{
                                  loadNext(3,{
                                      onComplete: (error) =>  {
                                          if(error){
                                              toast({
                                                  title: "返回了",
                                                  subtitle: ""+error,
                                                  intent: "error"
                                              });
                                          }
                                      }
                                  });
                              } }>
                                  按，拉扯获取更多......
                              </Button>
                          </div>
                      )}
                      {!hasNext  &&　<React.Fragment>
                          <span>嘿，没有更多了</span>
                      </React.Fragment>
                      }
                  </div>
                  {/*<div  ref={refMore}  css={{height: "1px"}}> </div>*/}

                  </div>
              </div>
            </StackItem>
          )
        },
        {
          title: (
            <StackTitle  backTitle={"回退"}
              contentAfter={
                relation && (
                      <DdMenu label="菜单" tight={true}
                              icon={
                                  <IconRefButton variant="ghost"
                                                 icon={<IconMoreVertical />}  label="Options菜单"
                                  />
                              }
                      >
                          {officeItem}
                          {liablerItem}
                          <DdMenuItem label="取消当前这条任务"
                                      onClick={(e) => {
                                          reset();
                                          cancelTaskFunc(relation, "te车dts");
                                      }} />
                          <DdMenuItem label="设定为当前任务"
                                      onClick={(e) => {
                                          sessionStorage['当前任务'] =JSON.stringify(relation);
                                      }} />
                      </DdMenu>
                )
              }
              title={ `该任务下挂前3个设备` }
            />
          ),
          content: (
            <StackItem css={{
                padding: '0.5rem 0'
            }} >
              {relation && (
                  <BoundDevices key={relation} task={tasknow!} id={relation} />
              )}
            </StackItem>
          )
        }
      ]}
    />

   <Dialog open={open} onOpenChange={setOpen}>
       <DialogContent >
           <DialogHeading>
               过滤器参数选择
           </DialogHeading>
           <DialogDescription>
               <React.Suspense fallback="数据准备...">
                   {
                       <div css={{ padding: '0 1rem' }}>
                           <form  method="get"  action="/"  css={{margin: 0, position: "relative" }}>
                               <div>
                                   {panel}
                                   <InputLine label={`责任人:`}>
                                       <OneUserChoose  name={liabler?.person?.name!}   setEditorVar={setLiabler}
                                                       oobj={liabler}  />
                                   </InputLine>
                                   <InputLine label={`任务日期(起):`}>
                                       <Input type='date'  value={ date1  || ''}
                                              onChange={e => setDate1( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`任务日期(终):`}>
                                       <Input type='date'  value={ date2  || ''}
                                              onChange={e => setDate2( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`任务状态(多选):`}>
                                       <Select inputSize="md" divStyle={css`max-width:240px;`} multiple  value={ statusx }
                                               css={{
                                                   minWidth:'140px',
                                                   fontSize:'1rem',
                                                   padding:'0 1rem',
                                                   [theme.mediaQueries.md]: {
                                                       height:'11rem',
                                                   }
                                               }}
                                               onChange={e => {
                                                   setStatusx(mutiSelectedArr(e));
                                               } }
                                       >
                                           { Object.entries(taskStatusObj).map(([key,value],i) => (
                                               <option key={i} value={key}>{value as string}</option>
                                           ))}
                                           <option value={''}></option>
                                       </Select>
                                   </InputLine>
                                   <InputLine label={`是否委托的:`}>
                                       <Select inputSize="md"  value={ entrust || '2'}
                                               onChange={e => setEntrust( e.currentTarget.value || '2' ) } >
                                           { 委托法定s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) } </Select>
                                   </InputLine>
                                   <InputLine label={`业务类型(多选):`}>
                                       <Select inputSize="md"  divStyle={css`max-width:240px;`}  multiple  value={ bsTypex }
                                               css={{
                                                   minWidth:'140px',
                                                   fontSize:'1rem',
                                                   padding:'0 1rem',
                                                   [theme.mediaQueries.md]: {
                                                       height:'7rem',
                                                   }
                                               }}
                                               onChange={e => {
                                                   setBsTypex(mutiSelectedArr(e));
                                               } }
                                       >
                                           { 业务类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                                           <option value={''}></option>
                                       </Select>
                                   </InputLine>
                                   <InputLine label={`服务单位:`}>
                                       <ChooseUnit id={servu?.id} name={servu?.name} field={'servu'}
                                                   autoFocus={field==='servu'}
                                                   onCancel={() => { setServu(undefined) }}
                                                   onDialog={async () => { return await confirmation() } }
                                       />
                                   </InputLine>

                                   <div
                                       css={{
                                           display: "flex",
                                           marginTop: theme.spaces.lg,
                                           justifyContent: "flex-end"
                                       }}
                                   >
                                       <Input  type='reset'  value={'清空过滤'}
                                               style={{margin: 'auto', width: undefined }}  css={{backgroundColor: 'wheat' }}
                                               onClick={async () => {
                                                   setDep(undefined); setOffice(undefined); setDate1(undefined); setDate2(undefined);
                                                   setStatusx([]); setEntrust('2'); setBsTypex([]); setServu(undefined); setLiabler(undefined);
                                               } }
                                       />
                                       <Button intent="primary"
                                               onPress={e => {
                                                   setOpen(false);
                                                   //【第三代方案】直接把修改完的过滤器参数回填给本地sessionStorage存储。不用上下级组件层层传递。
                                                   sessionStorage['任务过滤'] =JSON.stringify({ dep:{id:dep?.id}, office:{id:office?.id}, date1, date2,
                                                       statusx: omitArnull(statusx),entrust, bsTypex: omitArnull(bsTypex), liabler: userIdName(liabler), servu
                                                   });
                                                   history.push("/tasks", {time: Date()} );    //强制刷新！，时间肯定变化。
                                                   console.log(`路由历史state刚刚设置后bsTypex:`, bsTypex);
                                               } }
                                       >
                                           过滤器改完重查
                                       </Button>
                                   </div>

                               </div>
                           </form>
                       </div>
                   }
               </React.Suspense>
           </DialogDescription>
           <DialogClose>关闭</DialogClose>
       </DialogContent>
   </Dialog>

      {officeDlg}
      {liablerDlg}
  </React.Fragment>
  );
};


/* 不能把<Stack的工具条纳入滚动条区域：下沉以后不能定位top=0位置。
 ES系列之WeakSet Set、WeakMap不用担心内存泄漏 Map使用：   https://blog.csdn.net/qq_44810886/article/details/125368509
  onClick={() => setOpenTablist((v) => !v)}
* */
