/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    useTheme,
    LayerLoading,
    Text,
    Button,
    IconTruck,
    IconArrowRight,
    Navbar,
    Toolbar,
    IconButton,
    IconArrowLeft,
    DdMenu,
    DdMenuItem,TwoHalfRightPanel,
    useToast, PanelEnlargeCtx,
    VerticalMenu, useMMenuBarOcup
} from "customize-easy-ui-component";
//import {  useLookReportOfIsp } from "./db";

//import { Link as RouterLink, useLocation } from "wouter";
//import { TransparentInput } from "../../comp/base";
import { Link as RouterLink } from "../../routing/Link";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {IspEntranceQuery} from "./__generated__/IspEntranceQuery.graphql";
import useReckonIspFeeMutation from "./useReckonIspFeeMutation";
import useAbandonDetailMutation from "../../inspect/useAbandonDetailMutation";
import {reportStatusMap} from "../DeviceListItem";
import {ModelTypeArr} from "../../report/modelConfigs";
import {taskStatusMap} from "../TaskList";
import {useContext, useRef} from "react";
import RoutingContext from "../../routing/RoutingContext";
//[HOOK限制]按钮点击函数内部直接上toast()或toaster.notify()很可能无法正常显示。而放在函数组件顶层render代码前却能正常。
import { graphql } from "relay-runtime";


interface IspEntranceProps {
    id?: string;   　//来自上级<Route path={"/device/:id/"} component={} />给的:id。
    prepared: {
        query: PreloadedQuery<IspEntranceQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}

//[我的任务列表]底下某设备去点击，首先要到这："/device/:id/device/:taskId"路由来的；　然後setLocation再次路由。
//模型关系修改导致路由表也改成 /device/:id/isp/:id/唯一一个eqp(或者未挂接设备)
//React.FunctionComponent<IspEntranceProps> = ({
 //            params: { id:devId, ispId},      //来自上级<Route path={"/device/:id/addTask"} />路由器给的:id。
  //       }) =>
//1个Task:n个Isp；每1个Isp:n个Report;
/**当前某任务底下的某一条Detail=Isp业务：业务信息修改配置；
 * */
export default function IspEntrance(props: IspEntranceProps) {
    //第一次啊运行吗？
    const mountedRef = React.useRef(0);
    if(!mountedRef.current) {
        mountedRef.current = 1;
    }
    else
        mountedRef.current++;
    const {node} = usePreloadedQuery<IspEntranceQuery>(
        graphql`
            query IspEntranceQuery($id: ID!) {
                node(id: $id) {
                    id,__typename
                    ... on Detail {
                        id,ident,
                        isp{id,no,bsType,entrust,
                            dev{id,cod},
                            report{id,modeltype,stm{id,sta} }
                            reps{
                                edges {
                                    node{id,modeltype,stm{id,sta} }
                                }
                            }
                        },
                        task{id,status,date,dep{id,name},office{id,name}}
                    },
                }
            }
        `,
        props.prepared.query,
    );
    //必须是Detail模型的对象 __typename===''。
    const { isp,task, id:detId } =node!;
    const { reps: reps, } =node?.isp! || {};        //有多个分项报告[SimpleReport]
   // const  item=null;
    console.log("早就跳转页面task:m=", mountedRef.current,";isp=", props.routeData.params.ispId!, "routeData=",props.routeData);
    const theme = useTheme();
    // const [, setLocation] = useLocation();

    let filtercomp={ id:props.routeData.params.ispId};
    // const {call:reckonIspFeeFunc,doing,result, called, reset}= useReckonIspFeeMutation();
  //加载数据后立刻跳转，重定向操作。 要么直接去ISP页面；  要么先去派工吧。
  //用useEffect跳转setLocation，操之过急！，useLookIspOfDevTask后面数据还会更新的，可是这里却早早就跳转页面了，所以逻辑错误！
  //useLookIspOfDevTask实际查询后端比cache慢了1节拍要多一次render，若是cache也算数的立刻setLocation跳转，导致后端查询结果被遗弃，都无法更新cache了。
    const {call:abandonFunc,doing:abandoning, called:abandoned, reset:abandonrest}= useAbandonDetailMutation();
    const toast = useToast();
    const { history, get } = useContext(RoutingContext);
    const routeEntry= get();
    const  urlRef = useRef(history.location.key);
    const {carousel, } = useMMenuBarOcup(false);
    // const {enlarge, setEnlarge,setActivecas,getActivecas} =useContext(PanelEnlargeCtx);
    // React.useEffect(() => {
    //     if(urlRef.current !== history.location.key) {
    //         carousel && setActivecas(1);    //依赖location.key:左边列表点击同一个URL连接的也需要对轮播台切换到右边页面。
    //         urlRef.current = history.location.key;
    //     }
    // }, [routeEntry.location.key, history.location, get,history, carousel])

  return (
      <TwoHalfRightPanel  enlarge={3}
          title={  `${isp? '发现了': '没找到有'}关联的检验信息`
          }
          back={
              <RouterLink href={`/task/${props.routeData.params.taskId!}`}>
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
                  <DdMenuItem label="放弃这个设备的检验"
                              onClick={(e) => {
                                  abandonFunc(detId!, '测试期直接删');
                              }}/>
                  <DdMenuItem label="设定为当前检验业务"
                              onClick={(e) => {
                                  //检验业务: 对应后端的是Detail模型id
                                  sessionStorage['当前检验业务'] =JSON.stringify({task:task?.id,detail:detId});
                              }}/>
                  <DdMenuItem label="其它功能"
                              onClick={(e) => {
                              }}/>
              </VerticalMenu>
          }
      >

          {!isp && <React.Fragment>
              <Text  variant="h6"　css={{ textAlign: 'center' }}>
                  {taskStatusMap.get(task?.status!)} {task?.date}
              </Text>
              <Text  variant="h6"　css={{ textAlign: 'center' }}>
                  {task?.dep?.name} {task?.office?.name}
              </Text>
              <Text  variant="h4"　css={{ textAlign: 'center' }}>
                  该任务检验对象还没找到有关联的业务信息,烦请先去派工！
              </Text><br/>
              <RouterLink href={"/task/"+props.routeData.params.taskId!}>
                  <Button  size="lg" noBind
                      intent="primary"
                      iconBefore={<IconTruck />}
                      iconAfter={<IconArrowRight />}
                  >
                  得先去派工
                  </Button>
              </RouterLink>
          </React.Fragment>
          }
          {isp && <React.Fragment>
              <Text  variant="h6"　css={{ textAlign: 'center' }}>
                  {node?.ident || isp?.dev?.cod} 报告{isp?.no}
              </Text>
              <Text  variant="h6"　css={{ textAlign: 'center' }}>
                  {ModelTypeArr[isp?.report?.modeltype! as keyof typeof ModelTypeArr]?.name} {reportStatusMap.get(isp?.report?.stm?.sta!)} 主
              </Text>
              {
                  reps?.edges?.map(edge => {
                      return(
                          edge?.node?.id!==isp?.report?.id?
                              <Text key={edge?.node?.id} variant="h6" css={{textAlign: 'center'}}>
                                  {ModelTypeArr[edge?.node?.modeltype! as keyof typeof ModelTypeArr]?.name} {reportStatusMap.get(edge?.node?.stm?.sta!)} 分
                              </Text> : null
                      )
                  })
              }
              <RouterLink href={"/inspect/"+isp?.id}>
                  <Button  size="md" noBind
                      intent="primary"
                      iconBefore={<IconTruck />}
                      iconAfter={<IconArrowRight />}
                    css={{
                        width: "100%",
                    }}
                  >
                  查检验报告完成进度
                  </Button>
              </RouterLink>
              <div css={{
                  display:'flex', justifyContent: 'space-around', alignItems:'baseline', margin:'0.3rem 0'
              }}>
                  <RouterLink href={props.routeData.url + "/fee" }>
                      收费情况
                  </RouterLink>

                  <RouterLink href={props.routeData.url + "/config" }>
                      业务信息配置
                  </RouterLink>
                  { isp.dev &&
                      <RouterLink href={"/device/"+isp.dev.id}>
                          设备台账
                      </RouterLink>
                  }
              </div>
          </React.Fragment>
          }

      </TwoHalfRightPanel>
  );
};

