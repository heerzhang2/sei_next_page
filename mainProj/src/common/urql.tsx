import { registerUrql } from '@urql/next/rsc';
import {Client, ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next';
// import { Client } from '@urql/core';
//离线保存支持的：
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage';
import { authExchange } from '@urql/exchange-auth';
import { auth } from '@/app/auth';
// import { cookies } from 'next/headers'

import schema from '../auth/urql-schema.json';


let ssrStatic=null;

// let session=null;
// if (typeof window !== 'undefined') {
//   (async () => {
//     // const cookieStore = await cookies();
//     // 异步操作，如等待一个 Promise 解析
//     session = await auth();
//   })();
// } else {
//   //服务端啊
// }


/*全局使用的：SSR服务端可用的。不需要"use client"客户端的use context就能使用的模式的=不需要在UrqlProvider组件包裹之下的就能使用。
没有考虑到hydrating的。
In a server component we registerUrql  import from @urql/next/rsc
* */
const makeClient = () => {
  //must be prefixed with NEXT_PUBLIC_.
  const epoint = process.env.NEXT_PUBLIC_BACK_END
  // url: 'https://graphql-pokeapi.graphcdn.app/',
  // exchanges: [cacheExchange, ssr, fetchExchange],

  //【非官方做法吗】
  const ssr = ssrExchange({
    isClient: typeof window !== 'undefined',
  });
  ssrStatic = ssr;

  //离线保存支持的：只在客户端代码中使用 indexedDB。
  let storage;
  if (typeof window !== 'undefined') {
    storage = makeDefaultStorage({
      idbName: 'graphcache-v3', // The name of the IndexedDB database
      maxAge: 7, // The maximum age of the persisted data in days
    });
  } else {
    //[避免报错] 在SSR服务器端， 用 空存储或内存存储
    storage = {
      writeData: (data) => Promise.resolve(),
      readData: () => Promise.resolve(null),
      writeMetadata: (data) => Promise.resolve(),
      readMetadata: () => Promise.resolve(null),
    };
  }
  //clear: () => Promise.resolve(),

  const cache = offlineExchange({
    schema,
    storage,
    updates: {},
    optimistic: {},
  });

  // const authExc=authExchange(async utils => {
  //   const token = localStorage.getItem('token');
  //   const refreshToken = localStorage.getItem('refreshToken');
  //
  //   return {
  //     addAuthToOperation: function(operation) {
  //       return auth().then(session => {
  //         // 注意：这里假设 session 对象中有一个 token 属性，但你的原始代码使用了未定义的 token 变量
  //         // 我假设你应该从 session 中获取 token
  //         const token = session?.user?.token; // 假设 session 对象有一个 token 属性
  //         return utils.appendHeaders(operation, {
  //           Authorization: `Bearer ${token}`,
  //         });
  //       });
  //     },
  //     didAuthError(error, _operation) {
  //       return error.graphQLErrors.some(e => e.extensions?.code === 'FORBIDDEN');
  //     },
  //     async refreshAuth() {
  //       const result = await utils.mutate(REFRESH, { refreshToken });
  //
  //       if (result.data?.refreshLogin) {
  //         // Update our local variables and write to our storage
  //         token2 = result.data.refreshLogin.token;
  //         refreshToken2 = result.data.refreshLogin.refreshToken;
  //         localStorage.setItem('token', token2);
  //         localStorage.setItem('refreshToken', refreshToken2);
  //       } else {
  //         // This is where auth has gone wrong and we need to clean up and redirect to a login page
  //         localStorage.clear();
  //         logout();
  //       }
  //     },
  //   };
  // });
//authExc,



  return createClient({
    url: `${epoint}/graphql`,
    // url: 'https://graphql-pokeapi.graphcdn.app/',
    exchanges: [cache, ssr, fetchExchange],
    suspense: true,
    fetchOptions: () => {
      let accessToken='eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJoZXJ6aGFuZyIsImlhdCI6MTc0MDM4MzYxMSwiZXhwIjoxNzQwMzg5MDExfQ.-hDtd-fxbsAvPmxaJUG8n1X4cTJ1mfMYgD5dspROFeU5XDwti581OIPK5uC_38yXTjSI7wbwErYfikhbCw_9ZQ';

          // let session=null;
      // if (typeof window !== 'undefined') {
      //   (async () => {
      //     // const cookieStore = await cookies();
      //     // 异步操作，如等待一个 Promise 解析
      //     session = await auth();
      //   })();
      // } else {
      //   //服务端啊 session?.user?.accessToken
      // }

      const token =(typeof window !== 'undefined')? accessToken : "gggreedfgd4444";
      return {
        headers: {authorization: token ? `Bearer ${token}` : ''},
      };
    },
  });
};



// const { getClient } = registerUrql(makeClient);
const clientSetup = registerUrql(makeClient);


export function getSsr() {
  return ssrStatic;
}

const getClient = clientSetup.getClient;


//执行() 直接获取
let clientOfUrql: Client | null = null;

export function urqlClient() {
  if (clientOfUrql) {
    return clientOfUrql;
  }
  //因为用registerUrql的，所以必须再次运行clientSetup.getClient()获取最终的client;
  clientOfUrql ||= getClient();
  return clientOfUrql;
}


/*
在urql中，通常需要将fragments和查询定义在一起，因为GraphQL服务器需要知道fragments的上下文
（即它们应用于哪个类型）。因此，在上面的示例中，我们将userFields fragment与查询一起定义在了一个字符串模板中
* */
