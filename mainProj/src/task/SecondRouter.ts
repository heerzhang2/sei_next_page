import loadable from '@loadable/component';
import {loadQuery, } from "react-relay/hooks";
import {Environment} from "relay-runtime";
import  TaskMainQuery  from "./__generated__/TaskMainQuery.graphql";
import  OneTaskMainQuery  from "./__generated__/OneTaskMainQuery.graphql";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
//import queryString from "querystring";
import IspEntranceQuery from "./device/__generated__/IspEntranceQuery.graphql";
import FeeEntranceQuery from "./fee/__generated__/FeeEntranceQuery.graphql";

import FeeEntrance from "./fee/FeeEntrance";
import DetailConfigQuery from "./detail/__generated__/DetailConfigQuery.graphql";
import TaskFeeSummQuery from "./fee/__generated__/TaskFeeSummQuery.graphql";
import {bool3t, fromObjToInput} from "../common/tool";

//import {PreloadableConcreteRequest} from "react-relay/relay-hooks/EntryPointTypes";
//import  DetailedGuideQuery  from "./__generated__/DetailedGuideQuery.graphql";

import queryString from "query-string";
/**
 * 【特别！】实际返回的是两个二级路由器合体版，实际应该看成一级路由层次的分体了,/tasks和/task是两个路由主分支，并不属同一个二级路由。
路由分层：prepare: (params) => {}每一层次的入口组件=Container预定义relay数据Query，每层路由独立的graphql请求包。
 一般任务Task是后台独立管理程序主动生成的，并非前端的事情；但是非普通任务是前端新加的。
 /task目录做:检验业务初期的页面(配置业务信息Detail热数据)和报告无关的; 报告流转和编制开始后的(冷数据Isp)操作页面放在/inspect目录：
 * */
export default function secondRouter(environment: Environment) {
    //这里#没法用 const {user, setUser} =useContext(UserContext);
    //若不想动态加载数据的话： & 无法利用context!只能上URL参数:来传递过滤器参数给Link/跳转的。
   //注意特别的prepare: (params:any, user:any) => {} 直接跨越路由切换在路由器层面把context User注入给准备页面数据的代码。
    //const qs= queryString.parse(window.location.search);
    //const field =qs && !!qs.土建施单;   //json{} URL编码 ?

  return (
      [
          {
              path: '/tasks',
              component: loadable(() => import('./TaskMain')),
              prepare: (params:any, user:any) => {
                  if(!user)   window.location.href = "/login";
                  //底下这个请求完全可以合并成一个请求包的：从graphql定义入手归并。||{dep:"88909",first:123}
                  //const {dep ,first}=window.history.state?.myQuery;

                  const filt= JSON.parse(sessionStorage['任务过滤']??'{}');
                  //有些是ID携带Name的选择项，需要剔除xxxName部分。后端只需要ID，前端揭示需要名字。组件传递参数2个都要的。
                  const idfilt= fromObjToInput(filt,'dep','office','liabler','servu');
                  console.log(`路由tasks/由params:`,params,"user=",user,"state",window.history.state?.state);
                  let vars={
                      twhere: {
                          ...idfilt, entrust: bool3t(idfilt?.entrust),
                      }, first:2,orderBy:"date"
                  };
                  console.log(`loadQuery路由前面:vars=`, vars,"myQuery=",window.history.state?.state?.myQuery);
                  //提前加载数据汇聚graphQL模式：只能在这里就要预备好各个接口函数所有的参数和数值。
                  //假如这一层次路由组件的数据需求不一样，导致分解graphql请求体文件定义，无法合并成一个graphql请求包，需多个loadQuery多次发送请求：
                  return {
                      query: loadQuery(
                          environment as any,
                          TaskMainQuery as any,
                          vars,
                          { fetchPolicy: 'store-or-network' },
                      )
                  };
              },
              routes:[
                  {
                      path: '/tasks/new',   //第二级路由分解层次
                      exact: true,
                      component: loadable(() => import('./AddToTask')),
                  },
              ],


          },
          //多个二级路由层次的情况,合体版本[];尽量依据URI路径名字来配对路由器层级关系和路由嵌套组合，相关性聚合树状分解路由组装一起。
          {
              path: '/task/:taskId',    //第一级路由分解层次
              //exact: true,
              component: loadable( () => import('./OneTaskMain')),
              prepare: (params:any) => {
                  //底下这个请求完全可以合并成一个请求包的：从graphql定义入手归并。||{dep:"88909",first:123}
                  //const {dep ,first}=window.history.state?.myQuery;
                  let myobj=sessionStorage['myQuery']&&JSON.parse(sessionStorage['myQuery']);
                  console.log(`多个二级合体版本secondRouter路由params:`,params,"state",window.history.state?.state);

                  let vars={
                      taskId: params.taskId,
                      where: {sort:"chushi001"}, after:null, first:6,
                      twhere: {},
                      ...myobj,
                  };
                  console.log(`loadQuery路由前面:vars=`, vars,"myQuery=",window.history.state?.state?.myQuery);
                  //提前加载数据汇聚graphQL模式：只能在这里就要预备好各个接口函数所有的参数和数值。
                  //假如这一层次路由组件的数据需求不一样，导致分解graphql请求体文件定义，无法合并成一个graphql请求包，需多个loadQuery多次发送请求：
                  return {
                      query: loadQuery(
                          environment as any,
                          OneTaskMainQuery as any,  //这个参数假如填错了不会报错，也能运行发送请求。
                          vars,
                          { fetchPolicy: 'store-or-network' },
                      )
                  };
              },
              routes:[
                  {      //单个Task底下单一个业务Eqp;     URI路径 isp/ 等价于 detail/ 的含义;detail/:detId
                      path: '/task/:taskId/detail/:detId',
                      exact: true,
                      component: loadable( () => import('./device/IspEntrance')),
                      prepare: (params:any) => {
                          console.log(`路由历史state7-点击路由params:`, params, window.history.state);
                          return {
                              query: loadQuery(
                                  environment as any,
                                  IspEntranceQuery as any,
                                  {
                                      id: params.detId,
                                  },
                                  { fetchPolicy: 'store-or-network' },
                              ),
                          };
                      },
                  },
                  {
                      path: '/task/:taskId/detail/:detId/fee',
                      exact: true,          //【特殊】本路径/detail/:detId/同时支持Isp或Detail的ID作为detId来处理。
                      component: loadable( () => import('./fee/FeeEntrance')),
                      prepare: (params:any) => {
                          console.log(`路由历史state7-点击路由params:`, params, window.history.state);
                          return {
                              query: loadQuery(
                                  environment as any,
                                  FeeEntranceQuery as any,
                                  {
                                      detId: params.detId,
                                  },
                                  { fetchPolicy: 'store-or-network' },
                              ),
                          };
                      },
                  },
                  {
                      path: '/task/:taskId/detail/:detId/config',
                      exact: true,
                      component: loadable( () => import('./detail/DetailConfig')),
                      prepare: (params:any) => ( {
                              query: loadQuery(environment as any, DetailConfigQuery as any,
                                  { detId: params.detId, },
                              )
                      } ),
                  },
                  {
                      path: '/task/:taskId/sumfee',
                      exact: true,
                      component: loadable( () => import('./fee/TaskFeeSumm')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, TaskFeeSummQuery as any,
                              { taskId: params.taskId, },
                          )
                      } ),
                  },
              ],
          }
      ]

  );
}

