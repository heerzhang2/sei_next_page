import { registerUrql } from '@urql/next/rsc';
import {Client, ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next';
//离线保存支持的：
import {offlineExchange, SerializedEntries} from '@urql/exchange-graphcache';
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage';
import { authExchange } from '@urql/exchange-auth';
import { auth } from '@/app/auth';
import schema from './urql-schema.json';

const epoint = process.env.NEXT_PUBLIC_BACK_END;
const url=`${epoint}/graphql`;
const ssr = ssrExchange({
  isClient: typeof window !== 'undefined',
});

let storage;
if (typeof window !== 'undefined') {
  // 客户端使用 IndexedDB 存储，与 PWA 协调
  storage = makeDefaultStorage({
    idbName: 'graphcache-v3', // 与 PWA 使用不同的数据库名避免冲突
    maxAge: 7, // The maximum age of the persisted data in days
  });
} else {
  // [避免报错] 在SSR服务器端， 用 空存储或内存存储
  const some: SerializedEntries={};
  storage = {
    writeData: (data:any) => Promise.resolve(),
    readData: () => Promise.resolve(some),
    writeMetadata: (data:any) => Promise.resolve(),
    readMetadata: () => Promise.resolve(null),
  };
}

const cache = offlineExchange({
  schema,
  storage,
  // 与 Service Worker 协调的错误处理
  resolverExchange: false, // 让网络错误能够传播到 Service Worker
  updates: {
    Mutation: {
      // 处理变更操作的缓存更新
      modifyOriginalRecordData: (result, args, cache, info) => {
        console.log('URQL 缓存更新:', result, args);
        // 通知 Service Worker 有数据更新
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'DATA_UPDATED',
            data: { result, args }
          });
        }
      },
    },
  },
  optimistic: {
    modifyOriginalRecordData(args, cache, info) {
      // 乐观更新
      return {
        __typename: "Report",
        id: args.id,
        data: args.data,
      }
    },
  },
});

/*全局使用的：SSR服务端可用的。不需要"use client"客户端的use context就能使用的模式的=不需要在UrqlProvider组件包裹之下的就能使用。
没有考虑到hydrating的。
In a server component we registerUrql  import from @urql/next/rsc
   只考虑是在服务端SSR场合下的API请求：
服务端的也用？ const cache = offlineExchange({schema,storage,}) ？不是客户端才有特性吗。
* */
export function urqlClient(accessToken:string|null) {
  const makeClient = () => {
    return createClient({
      url,
      exchanges: [
        cache,
        ssr,
        // 添加错误处理，与 Service Worker 协调
        fetchExchange
      ],
      suspense: true,
      fetchOptions: () => {
        return {
          headers: {authorization: accessToken ? `Bearer ${accessToken}` : ''},
        };
      },
    });
  };
  //因为用registerUrql的，所以必须再次运行clientSetup.getClient()获取最终的client;
  const clientSetup = registerUrql(makeClient);
  return clientSetup.getClient();
}

/*
在urql中，通常需要将fragments和查询定义在一起，因为GraphQL服务器需要知道fragments的上下文
（即它们应用于哪个类型）。因此，在上面的示例中，我们将userFields fragment与查询一起定义在了一个字符串模板中
* */
