// import { gql } from '@urql/core';
import { registerUrql } from '@urql/next/rsc';
// import {ssrExchange} from "@urql/next";
import { ssrExchange, cacheExchange, fetchExchange, createClient } from '@urql/next';


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

  return createClient({
    // url: `${epoint}/graphql`,
              url: 'https://graphql-pokeapi.graphcdn.app/',
    exchanges: [cacheExchange, ssr, fetchExchange],

    suspense: true,
  });
};


// const { getClient } = registerUrql(makeClient);
const clientSetup = registerUrql(makeClient);


export function getSsr() {
  return ssrStatic;
}

export const getClient = clientSetup.getClient;
