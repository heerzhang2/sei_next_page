/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    Button,
    useTheme,
    useToast,
    LayerLoading,
    Spinner,
    Input,
    TwoHalfRightPanel,
    Container,
    MenuItem,
    MenuList,
    InputLine,
    Select,
    CheckSwitch,
    IconButton,
    IconArrowLeft,
    IconKey,
    VerticalMenu,
    DdMenuItem,
    ButtonRefComp,
    DdMenu,
    IconRefButton,
    IconMoreVertical,
    Itext,
    ListFlexRow,
    Popover,
    PopoverRefer,
    PopoverContent,
    PopoverDescription,
    PopoverClose,
    IconX,
    IconArchive,
    IconTrash2,
    IconZapOff,
    IconCheckSquare, IconMenu, IconCoffee
} from "customize-easy-ui-component";
//import {   useAddToTask } from "../db";
//import { useSession } from "../auth";

//import { Link as RouterLink,  } from "wouter";
import useBuildTaskMutation from "./hook/agreementAddTaskMutation";
import NewDevice from "../device/NewDevice";

import {Link as RouterLink} from "../routing/Link";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
import {ContainerDesignClsTil, getFeeTitleFe} from "../dict/feeTitleFe";

import {ChooseUnit} from "../unit/ChooseUnit";
import {getFormatDate} from "../common/tool";
import {ChooseDevice} from "../device/ChooseDevice";
import {businessTypeMap, 业务类型s,} from "../device/edit/CommnBase";
import RoutingContext from "../routing/RoutingContext";
import { useMainConfig} from "./hook/useMainConfig";
import {ChooseEqps, IEqpEntity} from "../comp/ChooseEqps";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import {AffiliatedTaskQuery} from "./__generated__/AffiliatedTaskQuery.graphql";
import {eqpTypeAllMap} from "../dict/eqpComm";
import {taskStatusMap} from "../task/TaskList";
import useSessionStorageState from "use-session-storage-state";
// import {useMainConfigQuery} from "./hook/__generated__/useMainConfigQuery.graphql";
import { graphql } from "relay-runtime";


interface AgreementConfigProps {
    id?: string;
    prepared: {
        //【特别注意】query路由器若不是提供这个类型的查询AffiliatedTaskQuery，本组件也不会抛出异常！在usePreloadedQuery<AffiliatedTaskQuery>()不报错！
        //【同名字差异】AffiliatedTaskQuery和路由器定义不一样啊  query: loadQuery(environment, AffiliatedTaskQuery,：两个类型实际不同！！!
        query: PreloadedQuery<AffiliatedTaskQuery>;
    }
    children: React.ReactNode;
    routeData: any;
}
/**非代码复用模式的 ：针对性强，没有无用字段数据出现。
 * 缺点是代码专属，relay定义都得单独声明。
 * */
export default function Component(props: AgreementConfigProps) {
    const data = usePreloadedQuery<AffiliatedTaskQuery>(
        graphql`
            query AffiliatedTaskQuery($ptId: ID!) {
                node(id: $ptId)
                {
                    id, __typename
                    ... on Agreement {
                        id,status,ptno,ispu{id name}, servu{id name}, crman{id username},promoter{id username},
                        complDate, charge, mdtime, aux, pttype, 
                        tasks{id date status bsType entrust charge feeOk type eqpcnt dep{id,name} office{id,name} liabler{id,person {
                            id,name
                        }}}
                    }
                }
            }
        `,
        props.prepared.query,
    );
    const { node:agreement, }=data;    //有多个分项报告[SimpleReport]
    // const {agreement} =useMainConfig(props);

  const theme = useTheme();
  const toast = useToast();
    const {user} = useContext(UserContext);
//  const ref = React.useRef(null);
//  const {user,} = useSession();
  //const [loading, setLoading] = React.useState(false);
  //const [editing, setEditing] = React.useState(!readOnly);
  /*const [content, ] = React.useState(() => {
    return defaultDescription
      ? ''
      : null;
  });*/
  //const [image, ] = React.useState(defaultImage);
 // const [title, setTitle] = React.useState(defaultTitle);
  //const [credit, ] = React.useState(defaultCredit);
  //ingredients 原来是[]数组，改成对象。ingredients.length无定义了。
  //const [ingredients, setIngredients] = React.useState<any>( {dep:'二部'　} );

    //不可以直接上Object的，select value=只能简单类型，<option key={i} value={dep}>
    //【兼容考虑】跳转并提供预设参数的模式.PK.弹转伪对话框待返回; save{}有设置默认字段取值的，不一定都算是伪对话框弹起转传递的;可能是跳转并提供预设参数的模式,save字段信息很少的。
    const {save, field}= window.history.state?.state??{};      //通用伪对话框传递格式field=上次跳转目标选择字段。

    //if(save && field)   save[field]= {id, name: unit.name};
    //从跳转伪对话框页面之前做了保存的编辑器恢复数据。
    const [depId, setDepId] = React.useState<any>(save? save.depId : user.dep?.id);
    //const [servu, setServu] = React.useState(save? save.servu : window.history.state?.state?.servu);
    //setServu({id, name}) 单位选择伪对话框，或者预设单位取值的，保存给后端，都是只需要id+name;
    const [servu, setServu] = React.useState(save? save.servu : null);
    // const [meqp, setMeqp] = React.useState(save? save.meqp : null);
    // const [devs, setDevs] = React.useState(save? save.devs : agreement?.devs);
    const defaultBS =agreement?.pttype!=='supervis' ? 'OTHER' : 'INSTA';
    // const [bsType, setBsType] = React.useState(save? save.bsType : agreement?.bsType?? defaultBS);
    const defaultWT =agreement?.pttype!=='supervis';     //默认其它都是委托性质
    // const [entrust, setEntrust] = React.useState(save? save.entrust : agreement?.entrust?? defaultWT);
    let  delayds=31;      //默认任务日期 Default task date延后天数=31天 Delayed days
    const [date, setDate] = React.useState(save&&save.date? save.date : agreement?.complDate);
    console.log("AddTask返回last页面 save=", save,"date=",date);
/*原来嵌套updateRecipe是同步等待的方式： "2018-09-12"
  const {result, submit:updateFunc,  } = useAddToTask({
    dep: ingredients && ingredients.dep,
    devs: id, date:ingredients && ingredients.date,
    });
  */
  const {call:buildTaskFunc,doing,result, called, reset}= useBuildTaskMutation();
    console.log("AddToTask页面刷新result:", result ,"called=",called);
   //const servu=window.history.state?.state?.servu;      //外部注入的参数
    console.log("AddtoTassk其它path传递参数来servu=",window.history.state?.state," servu=",servu);
    /**编辑器正在编辑数据的暂时保留(路由切换切回后还能取回)，从为对话框页面路由返回之后再利用已经修改数据。
     * 多个设备一起挑选 麻烦，这里【限制】保留一个设备meqp的跳转恢复。
     * */
    // async function confirmation() {
    //     const newdat={
    //         depId, servu, date,  bsType, entrust,
    //         devs: devs?.map((eqp: { id: any; }) => eqp.id),
    //     };
    //     return newdat;
    // }
    const { history } = useContext(RoutingContext);
    const commitBlurRef =React.useRef<HTMLDivElement | null>(null);
    //非CANCEL 所有已经明确收费金额的任务收费合计金额：
    const allFeeOk= !agreement?.tasks?.some(a => a?.status!=='CANCEL' && !a?.feeOk);
    //charge: Double类型转成
    const sumFee= allFeeOk && agreement?.tasks?.reduce((pre,cur)=>{
        return (pre + Number(cur?.charge!));
    }, 0);
    const hrefAgr =`/agreement/${props.routeData.params.ptId}/${props.routeData.params.pttype}`;
    const [taskCurSel, setTaskCurSel, ] = useSessionStorageState('当前任务', {
        defaultValue: ''
    });
  //if(doing)  return <Spinner/>;
  return (
        <TwoHalfRightPanel
            back={
                <RouterLink  href="/tasks">
                    <IconButton label="后退"  variant="ghost"
                        size="md"  noBind  icon={<IconArrowLeft />}
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
                    <DdMenuItem label="其他功能"
                                onClick={ () => {
                                }}/>
                </VerticalMenu>
            }
            title={ `协议附属的任务` }
        >
            <Text variant="h5">协议编号：{agreement?.ptno} 关联任务列表</Text>
            { (0===agreement?.tasks?.length) &&
                <Text variant="h6">还没有关联任务，
                    <RouterLink href={hrefAgr+'/addTask'}>
                        请先创建
                    </RouterLink>
                </Text>
            }
            {agreement?.tasks?.map( (one, i) => {
                return (
                    <div key={i}>
                        <ListFlexRow
                                      onPress={(e) => {
                                          history.push('/task/'+one?.id+'/');
                                          //history.push(href, {time: Date()} );   //方式一： 强制刷新！能切换右边页面。
                                          // if(getActivecas!()==0)  setActivecas( 1);  //方式二：若是当前列表项URL正在显示的没有效果!不能切换右边页面。
                                          e?.preventDefault();      //【重复触发调用onPress()】 必须加上，可能两次调用？
                                      }}
                        >
                            <Text>{ one?.date || '?' }</Text>
                            <Itext>{taskStatusMap.get(one?.status!) || '^'}</Itext>
                            <Itext>{businessTypeMap.get(one?.bsType)}</Itext>
                            <Itext>{one?.entrust? '委':'法'}</Itext>
                            <Itext>{ one?.charge || '#'}</Itext>
                            <Itext>{one?.feeOk? '已确认':'未定'}</Itext>
                            <Itext>{eqpTypeAllMap.get(one?.type!) || '@'}</Itext>
                            <Itext>{ one?.eqpcnt +'个'}</Itext>
                            <Itext>{ one?.dep?.name || '/'}</Itext>
                            <Itext>{ one?.office?.name || '\\'}</Itext>
                            <Text>{ one?.liabler?.person?.name || '*'}</Text>
                        </ListFlexRow>
                        <div css={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-evenly',
                        }}>
                            <IconButton variant="ghost" label="设为当前任务" icon={<IconCoffee />}
                                onClick={async () => {
                                    //不能这样：sessionStorage['当前任务']=one?.id;导致实际存储没有加双引号的；后面useStorageState()提取有问题==null;sessionStorage['当前任务']=one?.id as string;也不行
                               //     sessionStorage['当前任务'] =JSON.stringify(one?.id);
                                    await setTaskCurSel( one?.id! );  //不能这样setTaskCurSel( JSON.stringify( one?.id ));这个useStorageState主动做了转换！！
                                    //不能确保当前URL页面内的左边拿一个页面useStorageState能够立刻看见这一次更新！若右半边页面需要立刻感知变化的就只好强制刷新当前页面=硬性切换路由器。
                                    history.push(hrefAgr, {time: Date()} );   //目的：让'当前任务'同步最新的ID, URL强制刷新！
                                }}
                            />
                        </div>
                    </div>
                );
            })}

            <Button intent="primary"  onPress={async () => {
                history.push(hrefAgr);
            }}
            >
             协议申请单细节
            </Button>

            {
                allFeeOk ? <Text variant="h5">协议关联任务金额汇总：{sumFee} (元)</Text> :
                   <Text variant="h5">关联任务还有未确认收费金额的</Text>
            }
          <Spinner doing={doing}/>
        </TwoHalfRightPanel>
  );
};

// export default AddToTask;
