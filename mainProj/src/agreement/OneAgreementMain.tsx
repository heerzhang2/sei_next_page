/** @jsxImportSource @emotion/react */
import {  css } from "@emotion/react";
import * as React from "react";
import {
    useTheme,TwoHalfFrame, Text
} from "customize-easy-ui-component";

//import { useSession,  useSignOut } from "../auth";
import { Link as RouterLink } from "../routing/Link";
//import { Link as RouterLink, useRoute, useLocation, Switch, Route } from "wouter";
//import { TaskList } from "./task/TaskList";
//import { DeviceList } from "./DeviceList";
//import { useCountOfTask } from "./db";
import {UserContext} from "../routing/UserContext";
import useLogoutMutation from "../common/useLogoutMutation";
import {useCallback, useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
import {PreloadedQuery, usePreloadedQuery, useRefetchableFragment} from "react-relay/hooks";
import { OneAgreementMainQuery } from "./__generated__/OneAgreementMainQuery.graphql";
//import { DeviceList } from "./DeviceList";
//import {TaskList} from "../task/TaskList";
//import {useParams, useRouteMatch} from "react-router";
//找不到类型定义！ @types/babel-plugin-relay 没提供TS支持
//import {graphql} from 'relay-runtime';  //实际数据可以发起并获得到，可惜babel报错，纯粹不允许？
//import { match, } from 'path-to-regexp';
import {OneAgreementWraper} from "./OneAgreementWraper";
import {OneAgreementMain$key} from "./__generated__/OneAgreementMain.graphql";
// import {TwoHalfFrame} from "../../UiDebugSave/sample/TwoHalfFrame";
const graphql = require("babel-plugin-relay/macro");    //编译器解析graphql文本代码。

/**更为通用的HOOK Relay查询。
 * 依赖类型 OneAgreementMainQuery是和文件名字有关的。 OneAgreementMainProps是路由器Main页面组件通用的类型接口。
 * 规定参数有 props.prepared.query, $modId:ID! 都是来自路由器发起的查询,
 * 通用输出 data,
 * 复用组件正常代码复用 #应该是采用agreement,而不是采用data,的输出。
 * 提前获取数据的复用代码做法和正常的Relay片段放在儿子组件的两个模式实际上可以共同交叉使用。
 * 这里必须内省定义上pttype，左边页面有用到该字段。
 * */
export function useOneAgreement(props: OneAgreementMainProps)
{
    //【问题】要想复用组件每一个实际包容引入的页面能够用useFragment(来接收数据的就只能在这里都要分别的为每一个实际页面单独定义片段...ViewMain声明的。否则不能用Ref$Key来接收数据，只能提前强制声明数据类型接收后传递给下级组件。
    //既然是代码复用：干脆改成这里明确定义内省字段，而不是...OneAgreementWraper这样的片段声明形式，直接提取data，提前但是data的数据类型也就提前约束和确定死了，后续复用代码必须按照这里约束类型来引用数据data，就失去Relay自由片段特性。
    //缺点就是：不能像正常Relay应该用的useFragment( OneAgreementMainQuery$data;)来到最终子组件来接收数据。只能提前层层传递已经data提取的有特定类型约束的数据对象了，和普通Relay相比有点怪。
    const data = usePreloadedQuery<OneAgreementMainQuery>(
        graphql`
            query OneAgreementMainQuery(
                $modId:ID!,
            ) {
                node(id: $modId){
                    id, __typename,
                    ... on Agreement {
                        id,ptno,status,servu{id,name},ispu{id,name}
                        dispatcher{id,dep{id,name},office{id,name},person{id,name}},
                        crman{id,person{id,name}}
                        complDate,aux,pttype
                        ...AgreementBoundDevices
                    }
                }
                ...OneAgreementMain
            }
        `,
        props.prepared.query,
    );
    const { node:agreement0, }=data;     //通常接收方式
    //实际上 输出数据类型被下面替换掉了！
    //直接跟随：可是通常应该放入儿子组件当中的。
    const [datanode, refetch] = useRefetchableFragment(
        graphql`
            fragment OneAgreementMain on Query
            @refetchable(queryName: "OneAgreementMainRefetchQuery") {
                node(id: $modId)
                {
                    id, __typename,
                    ... on Agreement {
                        id,ptno,status,servu{id,name},ispu{id,name}
                        dispatcher{id,dep{id,name},office{id,name},person{id,name,phone}}
                        crman{id,person{id,name}},complDate,aux,
                        bsType,charge,mdtime,pttype,
                        devs {
                            id,type,oid,cod,sort,vart,address,vlg{id,name},ad{id,town{id,name},county{id,name}}
                            used,titl,plno,lpho,useu{id,name},address,
                        }
                        ...AgreementBoundDevices
                    }
                }
            }
        `,
        data as OneAgreementMain$key,
    );
    //上面的data必须再次声明类型的 as OneAgreementMain$key,。依赖于Relay编译器生成代码。
    //为了支持refetch引进： 必须再一次接收数据datanode。
    //上面的"OneAgreementMainRefetchQuery")必须直接声明devs{}若使用...AgreementBoundDevices来声明的很可能无法提取出来devs,复用缺点@必须一致的提前声称字段。
    const { node:agreement, }=datanode;

    //【注意】代码复用，只能是强类型的agreement对象只好事先就声明字段Relay不能事后才声明内省字段的，上面的graphql`必须就地声称字段不能用片段形式...ViewMain的。
    return {
        agreement,
        refetch,     //这样组件props多传递参数模式：就能支持复用代码都能支持refetch不用多个地方都需定义useRefetchableFragment()。
        //【鱼和熊掌】若返回这个 data, 然后走正常的Relay片段在儿子组件接收模式的，就没必要去传递refetch,参数的。缺点就是不能通用复用，需要每一个都要声明定能够以声明片段。
        agreement0,
    };
}


interface OneAgreementMainProps {
    prepared: {
        query: PreloadedQuery<OneAgreementMainQuery>;
    }
    children: React.ReactNode;
    id?: string;
    routeData: any;
}
/**协议申请单的左半边内容：有点奇怪，右半边是主题主体内容，左半边是辅助的列表附属显示，这里有点怪异。#左半边通常是列表和上一级导航父辈页面内容。
* */
export default function OneAgreementMain(props: OneAgreementMainProps) {
  const theme = useTheme();
  //const {user} = useSession();
    const {user, setUser} =useContext(UserContext);
  // const isLarge = useMedia({ minWidth: "768px" });
 // const qs = queryString.parse(window.location.search);
 //  const {filter:devfl, } =React.useContext(DevfilterContext);
 // const [, params] = useRoute("/device/:recipe*");
    const { isExact }=props.routeData;      //二级路由层次，下面没有分支路由
    const {history } = useContext(RoutingContext);
  let rightLayerKey =history.location.pathname;
    /*let { taskId } = useParams<any>(); let match = useRouteMatch("/task/:slug")全部无法使用，自定义路由Context没对上。
    //折腾获取路由taskId参数,不见得都有。
    const matchpath = match("/task/:taskId/isp/:ispId", { decode: decodeURIComponent });
    var mparams= matchpath(history.location.pathname);
    let paaas= mparams&& mparams.params;
    let seeTaskId=(paaas as any)['taskId'];
    */

  // const [activeTab, setActiveTab] = React.useState(0);
  // const renderList = isLarge || isExact;  　//大屏或者小屏但是没有显示具体明细页的场合就显示列表组件。
   //为何这一行执行好多边？幸亏子组件不会执行多边。
  console.log("TaskMain金准history",props.routeData.params.taskId,"props.routeData",props.routeData,"rightLayerKey:",rightLayerKey);
  const { call:signOut } = useLogoutMutation();
    //必须把下面的挂接片段的参数集中放在这里引入的。参数按照出现顺序排列：参数在3个地方出现。
    //前端必选after参数为空的：也会送到后端再后端抛异常 Object required to be not null; 参数定义了却没用到也会编译报错！
    //【小心阻碍点】下层Fragment嵌入带来的参数也必须在这里定义啊，不能放在下层定义参数，需提前声明参数。一个graphQL请求包只能套一个query,不允许多个query{}存在的！约束啊。
   //这里不能和下层次共同定义一个同名字参数的，编译报错。最后办法：除非后端提供接口能够接受两个参数充当同一个实际参数功能，奇怪！。
   //Relay要求的提前汇聚加载数据的模式只能这样了；需提前定义参数名以及提早赋予参数数值。
    /*底下这个Relay编译之后实际生成：
      query: "query OneAgreementMainQuery() {
                    routenode() { id }
                    ...OneTaskWraper
            }
            fragment BoundDevices on Task {   ...DeviceListItem }
            fragment DeviceListItem on Detail { }
            fragment OneTaskWraper on Query {
                    routenode() {   ...BoundDevices }
            }  ”
      实际只会有一个查询语句,全部放在routenode当中的。看起来有两次的routenode(id,routeVal一样的)调用，实际graphQL协议中间件上执行一次就行了。
     */
    const {agreement, refetch} = useOneAgreement(props);
  // const data = usePreloadedQuery<OneAgreementMainQuery>(
  //     graphql`
  //         query OneAgreementMainQuery(
  //             $modId:ID!,
  //         ) {
  //             node(id: $modId){ id }
  //              ...OneAgreementWraper
  //           }
  //     `,
  //     props.prepared.query,
  // );
  //   const { node:task, }=data;
    if(!agreement)  return <RouterLink href="/"><Text variant="h3">找不到该协议或审请单,回首页</Text></RouterLink>;

    //右半边页面来自路由器的注入props.children；另外必须有的左边的列表页面。
  return (
          <TwoHalfFrame rightPanel={agreement && props.children} >
              <OneAgreementWraper agreement={agreement} refetch={refetch}/>
          </TwoHalfFrame>
  );
};

