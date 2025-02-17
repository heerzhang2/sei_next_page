import loadable from '@loadable/component';
import {loadQuery, } from "react-relay/hooks";
import {Environment} from "relay-runtime";
//import queryString from "querystring";
import UnitMainQuery from "./__generated__/UnitMainQuery.graphql";
import EachUnitMainQuery from "./__generated__/EachUnitMainQuery.graphql";

import queryString from "query-string";
/**
 * 多层次的路由器。
 * require（）目录文件无效的不报错，但是路由secondRouter会运行出错加载父文件export失败
 * third layer
 * 如果localStrorage()来存储查询的过滤参数，路由器这里回头读取数据接口的过滤参数：有问题！不可能把URL分享给别人还能看见同一个内容的。
 * */
export default function secondRouter(environment: Environment) {
    //没法用 const {user, setUser} =useContext(UserContext);
    //若不想动态加载数据的话： & 无法利用context!只能上URL参数:来传递过滤器参数给Link/跳转的。
  //React Hook "useContext" is called in function "secondRouter" that is neither a React function component nor a custom React Hook function.
    const qs= queryString.parse(window.location.search);
    const field =qs && !!qs.土建施单;   //json{} URL编码 ?

  return (
      {
        path: '/unit',
        component: loadable(() => import('./UnitMain')),
        prepare: (params:any) => {
           //公司和个人的列表：分开的预加载参数配置，从Storage恢复出来参数。最好浏览器支持记住输入内容的组合框;
            //福州设备单位  name:"bfdv"
            let myobj=sessionStorage['单位选择']&&JSON.parse(sessionStorage['单位选择']);
            let vars={
                status: "",
                uwhere: {name:'', ...myobj}, after:null, first:2,
            };
            //console.log(`路由历史stateUnit点击路由:myobj`,myobj);
      //特别情况！ UnitMain内部组件用了2次：两个UnitList页面,共同使用同一个的查询...UnitList只能够满足一个页面的需求。
      //解决思路：办法1=要2个loadQuery才行。办法2=把<UnitList>复制改名不要用同一个fragment UnitList重复名字+再嵌套一层共通功能组件<InnerUnitList>。办法3=改成动态获取数据。
          return {
              query: loadQuery(
                  environment as any,
                  UnitMainQuery as any,
                  vars,
                  { fetchPolicy: 'store-or-network' },
              ),
              company: myobj?.company,
          };
        },
        routes:[
            {
                path: '/unit/new',
                exact: true,
                component: loadable(() => import('./AddUnit')),
                prepare: (params:any) => {
                    console.log("路由准备 AddUnit 新设备=",params);
                },
            },
            {
                path: '/unit/:unitId/:cpType',     //这里unitId依照企业还是个人=cpType参数区分是companyEs.id,personEs,id。
                exact: true,
                component: loadable( () => import('./EachUnitMain')),
                prepare: (params:any) => {
                    return {
                        query: loadQuery(
                            environment as any,
                            EachUnitMainQuery as any,
                            {
                                id: params.unitId,
                                company: params.cpType==='company',
                            },
                            { fetchPolicy: 'store-or-network' },
                        ),
                    };
                },
            },
            {
                path: '/unit/:unitId/',      //直接用Unit.ID匹配的方式
                exact: true,
                component: loadable( () => import('./EachUnitMain')),
                prepare: (params:any) => {
                    return {
                        query: loadQuery(
                            environment as any,
                            EachUnitMainQuery as any,
                            {
                                id: params.unitId,
                                company: params.cpType==='company',
                            },
                            { fetchPolicy: 'store-or-network' },
                        ),
                    };
                },
            },
        ],
      }
  );
}

