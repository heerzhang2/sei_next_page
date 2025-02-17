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
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import { OneTaskMainQuery } from "./__generated__/OneTaskMainQuery.graphql";
//import { DeviceList } from "./DeviceList";
//import {TaskList} from "../task/TaskList";
//import {useParams, useRouteMatch} from "react-router";
//找不到类型定义！ @types/babel-plugin-relay 没提供TS支持
//import {graphql} from 'relay-runtime';  //实际数据可以发起并获得到，可惜babel报错，纯粹不允许？
//import { match, } from 'path-to-regexp';
import {OneTaskWraper} from "./OneTaskWraper";
// import {TwoHalfFrame} from "../../UiDebugSave/sample/TwoHalfFrame";
const graphql = require("babel-plugin-relay/macro");    //编译器解析graphql文本代码。


interface OneTaskMainProps {
    prepared: {
        query: PreloadedQuery<OneTaskMainQuery>;
    }
    children: React.ReactNode;
    id?: string;
    routeData: any;
}


export default function OneTaskMain(props: OneTaskMainProps) {
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
      query: "query OneTaskMainQuery() {
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
  const data = usePreloadedQuery<OneTaskMainQuery>(
      graphql`
          query OneTaskMainQuery(
              $taskId:ID!, $afterdl:String,$first:Int=30,
                $orderBydl:String, $wheredl:TaskDetailInput
          ) {
              node(id: $taskId){ id }
               ...OneTaskWraper    
            }
      `,
      props.prepared.query,
  );
    const { node:task, }=data;
    if(!task)  return <RouterLink href="/"><Text variant="h3">找不到该任务,回首页</Text></RouterLink>;

    //右半边页面来自路由器的注入props.children；另外必须有的左边的列表页面。
  return (
          <TwoHalfFrame rightPanel={task && props.children} >
              <OneTaskWraper task={data}/>
          </TwoHalfFrame>
  );
};

