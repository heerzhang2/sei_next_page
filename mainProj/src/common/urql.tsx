import { registerUrql } from '@urql/next/rsc';
import {Client, ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next';
// import { Client } from '@urql/core';
//离线保存支持的：
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage';
import schema from './urql-schema.json';


let ssrStatic=null;

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
  ssrStatic= ssr;

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
      writeData:(data)=> Promise.resolve(),
      readData: () => Promise.resolve(null),
      writeMetadata:(data)=> Promise.resolve(),
      readMetadata: () => Promise.resolve(null),
    };
  }
  //clear: () => Promise.resolve(),

  const cache = offlineExchange({
    schema,
    storage,
    updates: {

    },
    optimistic: {

    },
  });

  return createClient({
    url: `${epoint}/graphql`,
          // url: 'https://graphql-pokeapi.graphcdn.app/',
    exchanges: [cache,  ssr, fetchExchange],
    suspense: true,
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
