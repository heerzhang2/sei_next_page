'use client'

import { Client, ssrExchange, cacheExchange, fetchExchange, createClient,} from '@urql/next';
import {UrqlProvider,} from '@urql/next';
import { useAccessToken } from './use-access-token'
import {authExchange} from "@urql/exchange-auth";
import {ReactNode, useMemo} from "react";
import { registerUrql } from '@urql/next/rsc';
//离线保存支持的：
import { offlineExchange } from '@urql/exchange-graphcache';
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage';
import schema from './urql-schema.json';
import { Logger, SerializedRequest } from "@urql/exchange-graphcache";

/*这个Context.Provider模式的是客户端组件的；儿子确实可以是服务端组件的，前提是需要在直接父辈（必须也是服务端组件）内部进行{children}拼装。服务端组件render时间实际发生在更前的，网络序列化传递Props的。
const ssr = ssrExchange();
const client = createClient({   url: 'https:// trygql. formidable. dev/ graphql/ basic-pokedex',   exchanges: [cacheExchange, ssr, fetchExchange],   suspense: true, });
【注意】exchanges: []的配置项的顺序 关系。  UrqlProvider也有关系一个UrqlProvider对应一个系统缓存的？。
底下独立的配置项fetchOptions: () => {authorization: }加上后才能确保离线恢复再访问的API可授权。
【还未增加SSR】a server component import { registerUrql } from '@urql/next/rsc';
https://commerce.nearform.com/open-source/urql/docs/advanced/server-side-rendering/
@urql/next and urql
【测试阶段】手动清理indexedDB删除：为何遗留旧的？
* */
export function GraphQLProvider({children}: { children: ReactNode }) {
    // const client = useUrqlClient()
    const accessToken = useAccessToken();
    console.log("GraphQLProvider见到的token:{}", accessToken);         //【奇怪】强制刷新时在SSR服务器也会可能打印这个输出啊？我加了'use client'啊！！

    const [client, ssr] = useMemo(() => {
        //离线保存支持的：只在客户端代码中使用 indexedDB。
        let storage;
        if (typeof window !== 'undefined') {
            storage = makeDefaultStorage({
                idbName: 'graphcache-v3', // The name of the IndexedDB database
                maxAge: 7, // The maximum age of the persisted data in days
            });
        } else {      //[避免报错] 在SSR服务器端， 用 空存储或内存存储
            storage = {
                writeData: (data:any) => Promise.resolve(),
                readData: () => Promise.resolve(null),
                writeMetadata: (data:any) => Promise.resolve(),
                readMetadata: () => Promise.resolve(null),
            };
        }
        const cache = offlineExchange({
            logger(severity: 'debug' | 'error' | 'warn', message: string){
                console.log("offlineExchange:",severity,"消息",message)
            },
            schema,
            storage:{
                ...storage,
                // 覆盖DefaultStorage writeMetadata方法： 进来就是重复的队列，不需要做storage.readMetadata!().then(existing;
                writeMetadata: (json: SerializedRequest[]) => {
                    if(json?.length!==0){
                        const newMetadata = [...(json ||[])];
                        const thisIndex=newMetadata.length-1;       //[假设前提]最后一条是最新发送失败的变更mutation操作。
                        if(thisIndex>0){
                            //删除所有同样接口的未成功的pending操作（按操作类型）？不是同一份的检验报告 +json[thisIndex].variables id &&条件? 来区分吗。业务层面事务性锁定的。
                            newMetadata.forEach(({query},index) => {
                                if(index!==thisIndex && query===(json[thisIndex].query)) {
                                    delete newMetadata[index];
                                }
                            });
                        }
                        let out=[...newMetadata.filter(a=>a!==undefined)];
                        storage.writeMetadata!(out);
                    }
                    else storage.writeMetadata!(json);
                }
            } as any,
            // updates: {
            //     Mutation: {
            //         modifyOriginalRecordData: (result, args, cache, info) => {
            //             console.log("变更缓存:",result,"args=",args,"cache",cache,"info=",info)
            //         },
            //     },
            // },
            optimistic: {
                modifyOriginalRecordData(args, cache, info) {
                    //没断网情况也会执行。
                    return {
                        __typename: 'Report',
                        id: args.id,
                        data: args.data,
                    };
                },
            },
        });


        const ssr = ssrExchange({
            isClient: typeof window !== 'undefined',
        });
        //must be prefixed with NEXT_PUBLIC_.
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                cache,
                authExchange(async (utils) => {
                    return {
                        addAuthToOperation(operation) {
                            if (!accessToken){
                                console.warn("addAuthToOperation:accessToken空的", accessToken);
                                return operation
                            }
                            return utils.appendHeaders(operation, {
                                Authorization: `Bearer ${accessToken}`
                            })
                        },
                        didAuthError(error) {
                            return error.graphQLErrors.some(
                                (e) => e.extensions?.code === 'UNAUTHORIZED'
                            )
                        },
                        async refreshAuth() {
                            // 如果需要，实现令牌刷新逻辑
                            console.warn("addAuthToOperation:未实现？的", accessToken);
                        }
                    }
                }),
                ssr, fetchExchange],
            suspense: true,
            fetchOptions: () => {
                return {
                    headers: {
                        authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                };
            },
        });

        return [client, ssr];
    }, [accessToken]);

    return (
            <UrqlProvider client={client} ssr={ssr}>
               {children}
            </UrqlProvider>
        )
}
