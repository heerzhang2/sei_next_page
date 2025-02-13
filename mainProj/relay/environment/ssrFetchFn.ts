import {
  FetchFunction,
  RequestParameters,
  Variables,
  Observable,
  GraphQLResponse, CacheConfig
} from "relay-runtime";
import {ObservableFromValue, Sink} from "relay-runtime/lib/network/RelayObservable";
import {UploadableMap} from "relay-runtime/lib/network/RelayNetworkTypes";
import { connection } from 'next/server'
import {auth} from "@/app/auth";


export type SsrFetchFunction = (
    session: any,   //附加的token
    request: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig,
    uploadables?: UploadableMap | null,
) => ObservableFromValue<GraphQLResponse>;
/**服务器SSR用这个：服务端认证客户角色cockie token。
 * 这个函数输入参数不一定必须配套FetchFunction，return必须是。
 * */
export const ssrFetchFn: SsrFetchFunction = (session, operation, variables, _cacheConfig) => {
  return Observable.create<GraphQLResponse>((sink) => {
    (async () => {
      console.log("execute ssr FetchRelay", operation.name);
      const resp=await  ssrFetchRelay(session, operation, variables, _cacheConfig);
      sink.next(resp);
      sink.complete();
      // await __simulateDeferredResponse(operation, variables, sink);
    })();
  });
};


/**测试用 mock:编造的响应：
 * @deprecated
* */
async function __simulateDeferredResponse(
  operation: RequestParameters,
  variables: Variables,
  sink: Sink<GraphQLResponse>
) {
  if (operation.name === "SlowContentLoaderQuery") {
    await sleep(1500);

    console.log("received lazyContent from Back-End");

    sink.next({
      data: {
        lazyContent: "zu早先是的"+new Date().getTime(),
      },
    });
    sink.complete();
    return;
  }

  await sleep(2000);

  console.log("received mainContent from Back-End");

  // Send the maincontent.
  sink.next({
    data: {
      mainContent: "大船"+new Date().getTime(),
    },
    // @ts-expect-error
    hasNext: true,
  });

  await sleep(2000);

  console.log("received deferred lazyContent from Back-End");

  // Stream in the lazy content.
  sink.next({
    data: {
      lazyContent: "演的"+new Date().getTime(),
    },
    path: [],
    label: "MainContentQuery$defer$SlowContent",
    // @ts-expect-error
    hasNext: false,
  });

  sink.complete();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/** 发请求到： 实际的某种的 后端服务器；
 * Relay requires developers to configure a "fetch" function that tells Relay how to load
 * the results of GraphQL queries from your server (or other data source). See more at
 * https://relay.dev/docs/en/quick-start-guide#relay-environment.
 这个缓存\Relay\react-router-v6-with-relay-hooks-master机制和Modern Store 什么关系的？？
 const oneMinute = 60 * 1000;
 const cache = new QueryResponseCache({ size: 250, ttl: oneMinute });
 应当是两个概念；两个东西都能暂时存储。  像是一级缓存，二级缓存？
 Network层次Cache 是底层的；生存周期时间很短，存储的查询结果条数比较少,是fetchRelay()函数简单缓存。
 Relay层次RelayModernStore 是上层的Relay；存储时间有效期很长久，Environment空间Store存储能力不限制。
 默认设置上不会使用Network层次Cache的；不要用QueryResponseCache()。
 */
async function ssrFetchRelay(
    session3: any,
    params: RequestParameters,
    variables: Variables,
    _cacheConfig: CacheConfig
) {
  const session = await auth();
  console.log("create server-sideWW$ssrFetchRelay={}", session);
  await connection()
  //must be prefixed with NEXT_PUBLIC_.
  const epoint = process.env.NEXT_PUBLIC_BACK_END
  /*
  这个缓存\Relay\react-router-v6-with-relay-hooks-master机制和Modern Store 什么关系的？？
    const queryId = operation.text || '';
    const isMutation = operation.operationKind === 'mutation';
    const isQuery = operation.operationKind === 'query';
    const forceFetch = cacheConfig?.force;
  const fromCache = cache.get(queryId, variables);
  if (isQuery && fromCache !== null && !forceFetch) {
      return fromCache;
  }*/
  //const REACT_APP_GITHUB_AUTH_TOKEN = process.env.REACT_APP_GITHUB_AUTH_TOKEN;
  // Fetch data from GitHub's GraphQL API:
  //很明显只能支持一个的服务端URL，不能允许多个 不同的 graphQL服务模型服务器。
  //若这里接入一个中间件进行分叉，查询变更等的 目的服务器根据什么规则分离？ 分配给不同的graphQL服务器。
  // console.log("REACT_APP_BACK_END是{},process.env={}", epoint, process.env);
  const response = await fetch(`${epoint}/graphql`, {
    method: "POST",
    credentials: "include",
    headers: {
      //不需要Authorization: `Bearer ${REACT_APP_GITHUB_AUTH_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: params.text,
      variables
    })
  });

  // Get the response as JSON
  const json = await response.json();

  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  //数据提前获取，所以还未真正登录完成就发起请求了，服务端返回报错
  if (Array.isArray(json.errors)) {
    const messar= json.errors.map((error:any,i:number)=>error.message);
    throw new Error(
        `${JSON.stringify(messar)}`
    );
  }

  /*这个缓存\Relay\react-router-v6-with-relay-hooks-master机制和Modern Store 什么关系的？？
  if (isQuery && json && queryId !== '') {
      cache.set(queryId, variables, json);
  }
  if (isMutation) {
      cache.clear();
  }*/
  // Otherwise, return the full payload.
  return json;
}

