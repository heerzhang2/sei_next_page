/** @jsxImportSource @emotion/react */
"use client"
//You're importing a component that needs `useEffect`. This React hook only works in a client component. To fix, mark the file (or its parent) with the `"use client"` directive.
import * as React from "react";
import {css} from "@emotion/react";
import {
    List,
    ListItem,
    Avatar,
    MenuItem,
    Text,
    Stack,
    StackTitle,
    StackItem,
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
    useMMenuBarOcup,
    DialogContent,
    DialogHeading,
    DialogDescription,
    DialogClose,
    DdMenu,
    DdMenuItem,
    VerticalMenu,
    CommitInput,
    CheckSwitch,
    IconButton,
    IconArchive,
    IconCpu
} from "customize-easy-ui-component";

import {usePaginationFragment} from "react-relay/hooks";
import {AgreementList$data, AgreementList$key} from "./__generated__/AgreementList.graphql";
import {SyntheticEvent, useContext, useEffect, } from "react";
import { AgreementBoundDevices } from "./AgreementBoundDevices";
import useDispatchToOfficeMutation from "../task/useDispatchToOfficeMutation";
import useDispatchToLiablerMutation from "../task/useDispatchToLiablerMutation";
import useDispatchTaskToMutation from "../task/useDispatchTaskToMutation";
import useCancellationTaskMutation from "../task/useCancellationTaskMutation";
import RoutingContext from "../routing/RoutingContext";
// import {BoundDevices$key} from "./__generated__/BoundDevices.graphql";
import {TaskLikeData, useLiablerDialogMenu, useOfficeDialogMenu} from "../task/useHelpers";
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
import {协议类型s} from "./AddToAgreement";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
// import {useInView} from "react-intersection-observer";
// import {Stack, StackTitle, StackItem,} from "../../UiDebugSave/sample/Stack";


//只能在内容的顶部下拉，才能触发的，还是需要快捷的按钮。 淘汰掉，鸡勒了也不好用告警。
//import { PullDownContent, PullToRefresh, RefreshContent, ReleaseContent } from "react-js-pull-to-refresh";
//import { BoundDevices } from "./BoundDevices";
//import { useDeleteReport } from "../../inspect/report/db";
import { graphql } from "relay-runtime";
//后端enum ProtocolSta_Enum
const agreementStatusObj = {'INIT':'新的', 'SUBMIT':'已提交申请单', 'CHECK':'审核之中', 'SIGNING':'签名之中',
        'SIGNED':'协议生效','END':'已结束','CANCEL':'已作废'
};
export const agreementStatusMap = new Map(Object.entries(agreementStatusObj));        //不能用WeakMap()

//后端enum BusinessCat_Enum  类似语义 业务类型s ； 专门针对图标单个字符显示的
const businessCatspObj = {'REGUL':'定期', 'ANNUAL':'年度', 'INSTA':'安装', 'FIRST':'首检', 'TEST':'测','DELIVERY':'收',
    'ESTIMATE':'评估','EXPERIMENT':'试验', 'IDENTIFIC':'鉴定','MANUFACT':'制造','PRESSURE':'耐压','PRODUCT':'产品',
    'REFORM':'改造','REPAIR':'大修','SAFETYINS':'进口','THERMAL':'热效', 'TYPETST':'型式','OTHER':'它'
};
export const businessCatspMap = new Map(Object.entries(businessCatspObj));
//三态逻辑转映射 false=0， true=1， ANY=2等于Java的null不明确的？;  两态的Bool不够用了。
// export const 委托法定s=[['2','全部'],['0','法定'],['1','委托']];




export interface AgreementListProps {
    tasks: AgreementList$key;
}

/*协议列表
 注意graphql‘’里面缺少内省字段可能也不会报错的@ts-ignore导致的！  ,dep{id,name},office{id,name}
* */
export const AgreementList: React.FunctionComponent<
    AgreementListProps
> = props => {
    //【问题】可复用...BoundDevices要求的接口参数$after和上层这里findAllTaskFilter的参数用相同名字，导致注入同一个值。
    const { data, refetch , loadNext,hasNext,isLoadingNext} = usePaginationFragment(
        graphql`
            fragment AgreementList on Query
            @refetchable(queryName: "AgreementList_RefetchQuery") {
                findAgreementFilter(where: $twhere,after:$after,first:$first,orderBy:$orderBy,asc:$asc)
                @connection(key: "Query__findAgreementFilter") {
                    edges {
                        __id
                        node {
                            id,ptno,status,pttype,bsType,entrust,mdtime,servu{id,name}
                            auditor{id,person{id,name}},crman{id,person{id,name}},dispatcher{id,person{id,name}}
                            ...AgreementBoundDevices
                        }
                    }
                }
            }
        `,
        props.tasks,
    );
    const { findAgreementFilter:list, }=data;
    const tasks = list?.edges?.map(edge => edge?.node);
    //const tasks = list?.edges?.map((edge: { node }) => edge?.node);
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
    const filt= JSON.parse(sessionStorage['协议过滤']??'{}');
    const idfilt= fromObjToInput(filt,'dep','office','dispatcher','servu');     //dispatcher代替'liabler'但ispu特别；
    const [open, setOpen] = React.useState(save? save.open :false);
    // const [depId, setDepId] = React.useState<any>(  filt?.dep?.id );
    // const [office, setOffice] = React.useState<any>(filt?.office);
    const {dep, office, panel, preload, setDep,setOffice}= useUserDepOffice(save? save.dep : filt?.dep, save? save.office : filt?.office,
                     "责任人所属部门","责任人所属科室");
    const [date1, setDate1] = React.useState<any>(save? save.date1 : filt?.date1);
    const [date2, setDate2] = React.useState<any>(save? save.date2 : filt?.date2);
    const [qdate1, setQdate1] = React.useState<any>(save? save.qdate1 : filt?.qdate1);
    const [qdate2, setQdate2] = React.useState<any>(save? save.qdate2 : filt?.qdate2);
    const [statusx, setStatusx] = React.useState<string[]>(save? save.statusx :filt?.statusx);
    const [pttype, setPttype] = React.useState(save? save.pttype : filt?.pttype);
    const [ptno, setPtno] = React.useState<any>(save? save.ptno : filt?.ptno);
    //【不考虑】 devs 关联设备, 多台；单独选定一台台账设备找出关联协议。
    // const [bsTypex, setBsTypex] = React.useState<string[]>(save? save.bsTypex :filt?.bsTypex);
    const [dispatcher, setDispatcher] = React.useState<any>(save? save.dispatcher :filt?.dispatcher);
    const [servu, setServu] = React.useState(save? save.servu : filt?.servu);
    const defaultIspu= localStorage['默认检验机构']? JSON.parse(localStorage['默认检验机构']) : undefined;
    const [ispu, setIspu] = React.useState(save? save.ispu : filt?.ispu || defaultIspu);
    const [mecrman, setMecrman] = React.useState<boolean>(save? save.mecrman : filt?.mecrman || false);    //只需查询自己创建的

    const toast = useToast();
    console.log("任务列表当今页面#sum：", tasks?.length ,"个tasks=",tasks);
    const { barHeight } = useMMenuBarOcup(history.routeData?.isExact);

    async function confirmation() {
        return {
            open, date1, date2, pttype, statusx, ptno, dispatcher, dep, office, servu,
            qdate1, qdate2, ispu, mecrman
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
                        <DdMenuItem label="更新申请单列表"
                                    onClick={(e) => {
                                        let filtercomp={twhere: {   ...idfilt },
                                            offset:0, first:3,
                                        };
                                        refetch(filtercomp, {fetchPolicy: 'network-only'})
                                    }}/>
                        <DdMenuItem label="增加新申请单"
                                    onClick={(e) => {
                                        history.push("/agreements/new");
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
              title={"所有协议受理申请单"}
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
                    {'没有啊'}
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

                  {tasks?.map((each :any, idx:number) => {
                      const sonLine = (
                          <div css={{
                              display: 'flex',
                              justifyContent: 'space-between',
                          }}>
                              <Text variant="h6" gutter={false}>
                                  {  (each?.crman?.person?.name??'?')+" -> "
                                  }
                              </Text>
                              <Text variant="h6" gutter={false}>
                                  {  (each?.auditor?.person?.name??'?')+" -> "
                                  }
                              </Text>
                              <Text variant="h6" gutter={false}>
                                  {  each?.dispatcher?.person?.name??'?'
                                  }
                              </Text>
                          </div>
                      );
                    return (
                      <ListItem
                        key={each?.id}
                        interactive={ true}
                        onPress={() =>{
                            history.push("/agreement/"+each?.id+'/'+each?.pttype);
                        }}
                        contentBefore={
                            <React.Fragment>
                                <Avatar size="xs" name={ businessCatspMap.get(each?.bsType!) }/>
                                <Avatar size="xs" name={each?.pttype==='supervis'? '监检':'技术'}/>
                            </React.Fragment>
                        }
                        primary={`${each?.mdtime?.substring(0,10)} ${agreementStatusMap.get(each?.status!)} `+each?.ptno}
                        secondary={each?.servu?.name}
                        contentAfter={
                            <VerticalMenu>
                                <DdMenuItem label="编制审核"
                                            onClick={(e) => {
                                                history.push("/agreement/"+each?.id+'/'+each?.pttype);
                                            }}/>
                                <DdMenuItem label="协议书"
                                            onClick={(e) => {
                                                history.push("/agreementView/"+each?.id+'/'+each?.pttype);
                                            }}/>
                            </VerticalMenu>
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
                                   <InputLine label={`最后责任人:`}>
                                       <div css={{
                                           //试验<InputLine 直接再套一层Div,避免进入<OneUserChoose 子组件再去定做样式css={"div:has(&).SuffixInput_Top": {}。 @哪一种定做模式更舒服？
                                           display: 'flex',
                                       }}>
                                           <OneUserChoose  name={dispatcher?.person?.name!}   setEditorVar={setDispatcher}
                                                           oobj={dispatcher}  />
                                           <IconButton  variant="ghost"  icon={<IconCpu />}  label="我自己"
                                                        onClick={async (e) => {
                                                             await setDispatcher(user);
                                                        } }
                                           />
                                       </div>
                                   </InputLine>
                                   <InputLine label={`服务任务截止日(起):`}>
                                       <Input type='date'  value={ date1  || ''}
                                              onChange={e => setDate1( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`服务任务截止日(终):`}>
                                       <Input type='date'  value={ date2  || ''}
                                              onChange={e => setDate2( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`签订或变更日期(起):`}>
                                       <Input type='date'  value={ qdate1  || ''}
                                              onChange={e => setQdate1( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`签订或变更日期(终):`}>
                                       <Input type='date'  value={ qdate2  || ''}
                                              onChange={e => setQdate2( e.currentTarget.value||undefined ) } />
                                   </InputLine>
                                   <InputLine label={`协议类型:`}>
                                       <Select inputSize="md"  value={ pttype || ''}
                                               onChange={e => setPttype( e.currentTarget.value || '') } >
                                           <option value={''}></option>
                                           { 协议类型s.map(([enumv,title],i) => (<option key={i} value={enumv}>{title}</option> )) }
                                       </Select>
                                   </InputLine>
                                   <InputLine label={`协议编号:`}>
                                       <CommitInput  value={ ptno || ''}  onSave={txt => setPtno( txt || undefined) } />
                                   </InputLine>
                                   <InputLine label={`任务状态(多选):`}>
                                       <Select inputSize="md" divStyle={css`max-width:240px;`} multiple  value={ statusx }
                                               css={{
                                                   minWidth:'140px',
                                                   fontSize:'1rem',
                                                   padding:'0 1rem',
                                                   [theme.mediaQueries.md]: {
                                                       height:'9.3rem',
                                                   }
                                               }}
                                               onChange={e => {
                                                   setStatusx(mutiSelectedArr(e));
                                               } }
                                       >
                                           <option value={''}></option>
                                           { Object.entries(agreementStatusObj).map(([key,value],i) => (
                                               <option key={i} value={key}>{value as string}</option>
                                           ))}
                                       </Select>
                                   </InputLine>

                                   <InputLine label={`服务单位:`}>
                                       <ChooseUnit id={servu?.id} name={servu?.name} field={'servu'}
                                                   autoFocus={field==='servu'}
                                                   onCancel={() => { setServu(undefined) }}
                                                   onDialog={async () => { return await confirmation() } }
                                       />
                                   </InputLine>
                                   <InputLine label={`检验检测机构:`}>
                                       <Select inputSize="md"
                                               css={{
                                                   minWidth:'230px',
                                               }}
                                               defaultValue={ispu}
                                               onChange={e =>{
                                                   //defaultValue跟恰当的：报错controlled or uncontrolled;去掉 value={ ispu || defaultIspu || ''}
                                                   setIspu( e.currentTarget.value || '');
                                                   localStorage['默认检验机构'] =JSON.stringify(e.currentTarget.value || '');
                                               } } >
                                           <option key={0} value={''}></option>
                                           { user?.ispUnits.map((agency: any, i: number) => (<option key={i+1} value={agency.unit.id}>{agency.unit.name}</option> )) }
                                       </Select>
                                   </InputLine>
                                   <InputLine label={`仅限本人创建:`}>
                                       <CheckSwitch checked={mecrman} onChange={e => setMecrman(!mecrman)}/>
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
                                                   //注意 <单选的Select />  一定要把空的放在第一个。否则reset表现不一致！  ispu特殊@
                                                   setIspu(defaultIspu); setPtno(undefined);
                                                   setDep(undefined); setOffice(undefined); setDate1(undefined); setDate2(undefined);
                                                   setQdate1(undefined); setQdate2(undefined); setMecrman(false);
                                                   setStatusx([]); setPttype(undefined);  setServu(undefined); setDispatcher(undefined);
                                               } }
                                       />
                                       <Button intent="primary"
                                               onPress={ async (e )=> {
                                                   setOpen(false);
                                                   //【第三代方案】直接把修改完的过滤器参数回填给本地sessionStorage存储。不用上下级组件层层传递。
                                                   sessionStorage['协议过滤'] =JSON.stringify({ dep:{id:dep?.id}, office:{id:office?.id}, date1, date2,
                                                       statusx: omitArnull(statusx), pttype, dispatcher: userIdName(dispatcher), servu, ispu,
                                                       qdate1, qdate2, ptno, mecrman
                                                   });
                                                   history.push("/agreements", {time: Date()} );    //强制刷新！，时间肯定变化。
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


