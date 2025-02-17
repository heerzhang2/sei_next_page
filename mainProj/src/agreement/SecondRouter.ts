import loadable from '@loadable/component'

import {loadQuery, } from "react-relay/hooks";
import {Environment} from "relay-runtime";
//import  TaskMainQuery  from "./__generated__/TaskMainQuery.graphql";
import  OneAgreementMainQuery  from "./__generated__/OneAgreementMainQuery.graphql";
import {useContext} from "react";
import UserContext from "../routing/UserContext";
//import queryString from "querystring";
import * as React from "react";
// import ViewReportMainQuery from "./__generated__/ViewReportMainQuery.graphql";
// import OriginalRecordMainQuery from "./__generated__/OriginalRecordMainQuery.graphql";
import  AgreementMainQuery  from "./__generated__/AgreementMainQuery.graphql";

import JSResource from "../JSResource";
import {bool3t, fromObjToInput} from "../common/tool";
//import IspEntranceQuery from "./device/__generated__/IspEntranceQuery.graphql";
//import {PreloadableConcreteRequest} from "react-relay/relay-hooks/EntryPointTypes";
//import  DetailedGuideQuery  from "./__generated__/DetailedGuideQuery.graphql";
import useMainConfigQuery from "./hook/__generated__/useMainConfigQuery.graphql";
import ModelConfigs from "../report/modelConfigs";
// import {useMainConfigQuery} from "./hook/__generated__/useMainConfigQuery.graphql";
import AffiliatedTaskQuery from "./__generated__/AffiliatedTaskQuery.graphql";


import queryString from "query-string";

export default function secondRouter(environment: Environment) {
    //这里是全局JS环境，并非Hook和组件函数场合。配置里面的prepare:()=>{}是按点击<Link>触发的代码。
    //上下级的路由都难于共享数据的。
  return (
      [
          //编辑模式的：OriginalRecordMain提供了<EditStorageContext.Provider value={{ storage, setStorage }}>这样低下RecordStarter子路由页面要用的;同时Mount等于一个路由页面。
          {
              path: '/agreements',
              component: loadable(() => import('./AgreementMain')),
              prepare: (params:any, user:any) => {
                  const filt= JSON.parse(sessionStorage['协议过滤']??'{}');
                  //有些是ID携带Name的选择项，需要剔除xxxName部分。后端只需要ID，前端揭示需要名字。组件传递参数2个都要的。而ispu特殊直接ID显示也没用到Name;
                  const idfilt= fromObjToInput(filt,'dep','office','dispatcher','servu');
                  console.log(`路由tasks/由params:`,params,"user=",user,"state",window.history.state?.state);
                  let vars={
                      twhere: {
                          ...idfilt,
                      }, first:5,orderBy:"mdtime",asc:false
                  };
                  console.log(`loadQuery路由前面:vars=`, vars,"myQuery=",window.history.state?.state?.myQuery);
                  //提前加载数据汇聚graphQL模式：只能在这里就要预备好各个接口函数所有的参数和数值。
                  //假如这一层次路由组件的数据需求不一样，导致分解graphql请求体文件定义，无法合并成一个graphql请求包，需多个loadQuery多次发送请求：
                  return {
                      query: loadQuery(
                          environment as any,
                          AgreementMainQuery as any,
                          vars,
                          { fetchPolicy: 'store-or-network' },
                      )
                  };
              },
              routes:[
                  {
                      path: '/agreements/new',   //第二级路由分解层次
                      exact: true,
                      component: loadable(() => import('./AddToAgreement')),
                  },
              ],

          },
          {
              path: '/agreement/:ptId/:pttype',
              component: loadable(() => import('./OneAgreementMain')),
              prepare: (params:any) => {
                  //底下这个请求完全可以合并成一个请求包的：从graphql定义入手归并。||{dep:"88909",first:123}
                  //const {dep ,first}=window.history.state?.myQuery;
                  let myobj=sessionStorage['myQuery']&&JSON.parse(sessionStorage['myQuery']);
                  console.log(`多个二级合体版本secondRouter路由params:`,params,"state",window.history.state?.state);

                  let vars={
                      modId: params.ptId,
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
                          OneAgreementMainQuery as any,  //这个参数假如填错了不会报错，也能运行发送请求。
                          vars,
                          { fetchPolicy: 'store-or-network' },
                      ),
                      pttype: params.pttype,
                  };
              },
              routes:[
                  {
                      path: '/agreement/:ptId/:pttype/flowSelect',
                      exact: true,
                      component: loadable( () => import('./FlowSelect')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, useMainConfigQuery as any,
                              { ptId: params.ptId, },
                          )
                      } ),
                  },
                  {
                      path: '/agreement/:ptId/technical',
                      exact: true,
                      component: loadable( () => import('./technical/Main')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, useMainConfigQuery as any,
                              { ptId: params.ptId, },
                          )
                      } ),
                  },
                  {
                      path: '/agreement/:ptId/supervis',
                      exact: true,
                      component: loadable( () => import('./supervis/Main')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, useMainConfigQuery as any,
                              { ptId: params.ptId, },
                          )
                      } ),
                  },
                  {
                      path: '/agreement/:ptId/:pttype/addTask',
                      exact: true,
                      component: loadable( () => import('./AddToTask')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, useMainConfigQuery as any,
                              { ptId: params.ptId, },
                          )
                      } ),
                  },
                  {
                      path: '/agreement/:ptId/:pttype/tasks',
                      exact: true,
                      component: loadable( () => import('./AffiliatedTask')),
                      prepare: (params:any) => ( {
                          query: loadQuery(environment as any, AffiliatedTaskQuery,
                              { ptId: params.ptId, },
                          )
                      } ),
                  },
              ],

          },
          {
              path: '/agreementView/:ptId/technical',
              exact: true,
              component: loadable(() => import('./technical/ViewMain')),
              prepare: (params:any) => {
                  return {
                      query: loadQuery(
                          environment as any,
                          OneAgreementMainQuery as any,
                          {modId: params.ptId,},
                          { fetchPolicy: 'store-or-network' },
                      ),
                  };
              }
          },
          {
              path: '/agreementView/:ptId/supervis',
              exact: true,
              component: loadable(() => import('./supervis/ViewMain')),
              prepare: (params:any) => {
                  return {
                      query: loadQuery(
                          environment as any,
                          OneAgreementMainQuery as any,
                          {modId: params.ptId,},
                          { fetchPolicy: 'store-or-network' },
                      ),
                  };
              }
          },
      ]

  );
}

