/** @jsxImportSource @emotion/react */
import {  css } from "@emotion/react";
import * as React from "react";
import {
  Toolbar,
  Navbar,
  useTheme,
  IconButton,
  Button,
  Tabs,
  Tab,
  Layer,
  TabPanel,
  MenuList,
  MenuItem,
  Tooltip,
  IconChevronDown,
  IconPlus,
  DarkMode,
  LightMode,TwoHalfFrame,
  Pager, IconArchive, ButtonRefComp, DarkRefMode
} from "customize-easy-ui-component";

//import { useSession,  useSignOut } from "../auth";
import { Link as RouterLink } from "../routing/Link";
//import { Link as RouterLink, useRoute, useLocation, Switch, Route } from "wouter";
import { useMedia } from "use-media";
// import { Layout } from "./Layout";
//import { TaskList } from "./task/TaskList";
//import { DeviceList } from "./DeviceList";
//import { useCountOfTask } from "./db";
import {UserContext} from "../routing/UserContext";
import useLogoutMutation from "../common/useLogoutMutation";
import queryString from "query-string";
import {useCallback, useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
import {PreloadedQuery, usePreloadedQuery} from "react-relay/hooks";
import { AgreementMainQuery } from "./__generated__/AgreementMainQuery.graphql";
//import { DeviceList } from "./DeviceList";
import {AgreementList} from "./AgreementList";        //动态加载报错Cannot find module './'
//import {useParams, useRouteMatch} from "react-router";
//找不到类型定义！ @types/babel-plugin-relay 没提供TS支持
//import {graphql} from 'relay-runtime';  //实际数据可以发起并获得到，可惜babel报错，纯粹不允许？
import { match, } from 'path-to-regexp';
import {UserTaskList} from "../inspect/UserTaskList";
import { graphql } from "relay-runtime";    //编译器解析graphql文本代码。


interface AgreementMainProps {
    prepared: {
        query: PreloadedQuery<AgreementMainQuery>;
    }
    children: React.ReactNode;
    id?: string;
    routeData: any;
}


export default function AgreementMain(props: AgreementMainProps) {
  const theme = useTheme();
  //const {user} = useSession();
    const {user, setUser} =useContext(UserContext);
  const isLarge = useMedia({ minWidth: "768px" });
 // const qs = queryString.parse(window.location.search);
 //  const {filter:devfl, } =React.useContext(DevfilterContext);
 // const [, params] = useRoute("/device/:recipe*");
    const { isExact }=props.routeData;      //二级路由层次，下面没有分支路由
    const {history } = useContext(RoutingContext);
  let rightLayerKey =history.location.pathname;
    //let { taskId } = useParams<any>(); let match = useRouteMatch("/task/:slug")全部无法使用，自定义路由Context没对上。
   //折腾获取路由taskId参数,不见得都有。
    const matchpath = match("/task/:taskId/detail/:ispId", { decode: decodeURIComponent });
    var mparams= matchpath(history.location.pathname);
    let paaas= mparams&& mparams.params;
    let seeTaskId=(paaas as any)['taskId'];
  let initTab= props.routeData.params.taskId? 1 : 0;

  const [activeTab, setActiveTab] = React.useState(initTab);

  const renderList = isLarge || isExact;  　//大屏或者小屏但是没有显示具体明细页的场合就显示列表组件。
   //为何这一行执行好多边？幸亏子组件不会执行多边。
  console.log("AgreementMain金准history",seeTaskId,"props.routeData",props.routeData,"rightLayerKey:",rightLayerKey);
  const { call:signOut } = useLogoutMutation();
    //必须把下面的挂接片段的参数集中放在这里引入的。参数按照出现顺序排列：参数在3个地方出现。
    //前端必选after参数为空的：也会送到后端再后端抛异常 Object required to be not null; 参数定义了却没用到也会编译报错！
    //【小心阻碍点】下层Fragment嵌入带来的参数也必须在这里定义啊，不能放在下层定义参数，需提前声明参数。一个graphQL请求包只能套一个query,不允许多个query{}存在的！约束啊。
   //这里不能和下层次共同定义一个同名字参数的，编译报错。最后办法：除非后端提供接口能够接受两个参数充当同一个实际参数功能，奇怪！。
   //Relay要求的提前汇聚加载数据的模式只能这样了；需提前定义参数名以及提早赋予参数数值。
  const data = usePreloadedQuery<AgreementMainQuery>(
      graphql`
          query AgreementMainQuery($after:String,$first:Int=10,$orderBy:String="mdtime",$asc:Boolean=true,
              $twhere:AgreementInput
          ) {
          ...AgreementList    
        }
      `,
      props.prepared.query,
  );

    //自带一个<Pager轮播的。 框架+手机也有一个<Pager。
  return (
      <TwoHalfFrame rightPanel={!props.routeData?.isExact && props.children}
                leftStyle={{
                    marginBottom: 'unset',
                }}
      >
          <AgreementList tasks={data}/>
      </TwoHalfFrame>
  );
};


/* 组件<Stack >下层沉下去超2次，就很麻烦了，要多个状态变量和组件树状层叠的数组表达&安排具体的显示组件。
最后，用<Tabs/<Tab配合上<Stack/ </StackItem>的组件装配：就像自定义静态路由器一样的，配置具体组件对应哪一个位置的index号码。
滑动轮播组件react-page-controller：<Pager> 实际根基于 react-gesture-responder #拖拽能力的# 这个包的。
而且 react-gesture-view 实际类似这个 react-page-controller包的。
import GestureView from "react-gesture-view"; 实际类似于<Pager>的。
function TabContent() {
      const [index, setIndex] = React.useState(0);
      const ref = React.useRef();
  function focusCurrentIndex() {        #外部手动触发的。 定位到第几个index;
    ref.current.focus();    @这是组件主动暴露的操作接口来自   React.useImperativeHandle(ref, () => ({ focus: (i?: number) => {});
  }
  return (
   #实际声明const Pager: React.RefForwardingComponent<PagerHandles, PagerProps> = (可以传递Ref的模式定义组件的。
    <GestureView ref={ref} value={index} onRequestChange={i => setIndex(i)} >
      <div>First panel</div>
      <div>Second panel</div>
      <div>Third panel</div>
    </GestureView>
  );
}
* */
