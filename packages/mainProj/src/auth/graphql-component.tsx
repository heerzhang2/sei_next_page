"use client"

import { ssrExchange, fetchExchange, createClient, errorExchange } from "@urql/next"
import { UrqlProvider } from "@urql/next"
import { useAccessToken } from "./use-access-token"
import { authExchange } from "@urql/exchange-auth"
import { type ReactNode, useMemo } from "react"
//离线保存支持的：
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import schema from "./urql-schema.json"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { toast } from "sonner"
import type { Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, map } from "wonka"

// 创建网络状态管理:全局的。
const networkStatus = {
    isOnline: true,
    lastError: null as Error | null,
    listeners: new Set<(status: { isOnline: boolean; lastError: Error | null }) => void>(),
}

// 网络状态监听器
export const subscribeToNetworkStatus = (
    callback: (status: { isOnline: boolean; lastError: Error | null }) => void,
) => {
    networkStatus.listeners.add(callback)
    return () => networkStatus.listeners.delete(callback)
}

// 获取当前网络状态
export const getNetworkStatus = () => ({
    isOnline: networkStatus.isOnline,
    lastError: networkStatus.lastError,
})

// 更新网络状态
const updateNetworkStatus = (isOnline: boolean, error: Error | null = null) => {
    networkStatus.isOnline = isOnline
    networkStatus.lastError = error
    networkStatus.listeners.forEach((callback) => callback({ isOnline, lastError: error }))
}

// 检查是否为网络错误
const isNetworkError = (error: any): boolean => {
    if (!error) return false

    const errorMessage = error.message?.toLowerCase() || ""
    const networkErrorKeywords = [
        "network error",
        "fetch failed",
        "connection refused",
        "timeout",
        "network request failed",
        "failed to fetch",
        "err_connection_refused",
        "err_network",
        "err_internet_disconnected",
    ]

    return (
        networkErrorKeywords.some((keyword) => errorMessage.includes(keyword)) ||
        (error.name === "TypeError" && errorMessage.includes("fetch"))
    )
}

// 自定义网络错误处理 Exchange
const networkErrorExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            forward,
            tap((result: OperationResult) => {
                if (result.error) {
                    const hasNetworkError =
                        result.error.networkError ||
                        result.error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                        isNetworkError(result.error)

                    if (hasNetworkError) {
                        console.error("网络错误检测到:", result.error)
                        updateNetworkStatus(false, result.error)

                        // 确保错误能被 useQuery 捕获
                        result.error.isNetworkError = true
                    } else {
                        // 如果有成功的响应，说明网络恢复了
                        if (result.data && !networkStatus.isOnline) {
                            console.log("网络已恢复")
                            updateNetworkStatus(true)
                        }
                    }
                } else if (result.data) {
                    // 成功获取数据，网络正常
                    if (!networkStatus.isOnline) {
                        console.log("网络已恢复")
                        updateNetworkStatus(true)
                    }
                }
            }),
        )
    }
}

//20250715用v0dev生成的。pipe看来同类的样子代码，setTimeout不知为何如何让timeoutId如何传递的。
// 自定义 fetch exchange 来更好地处理网络错误
const customFetchExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            map((operation: Operation) => {
                // 为每个操作添加超时和错误处理
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

                return {
                    ...operation,
                    context: {
                        ...operation.context,
                        fetchOptions: {
                            ...operation.context.fetchOptions,
                            signal: controller.signal,
                        },
                    },
                }
            }),
            forward,
            tap((result: OperationResult) => {
                // 清理超时
                if (result.operation.context.fetchOptions?.signal) {
                    clearTimeout(result.operation.context.timeoutId)
                }
            }),
        )
    }
}

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
export function GraphQLProvider({ children }: { children: ReactNode }) {
    // const client = useUrqlClient()
    const accessToken = useAccessToken()
    //console.log("GraphQLProvider见到的token:{}", accessToken);【奇怪】强制刷新时在SSR服务器也会可能打印这个输出啊？我加了'use client'啊！！

    const [client, ssr] = useMemo(() => {
        //离线保存支持的：只在客户端代码中使用 indexedDB。
        let storage
        if (typeof window !== "undefined") {
            storage = makeDefaultStorage({
                idbName: "graphcache-v3", // The name of the IndexedDB database
                maxAge: 7, // The maximum age of the persisted data in days
            })
        } else {
            //[避免报错] 在SSR服务器端， 用 空存储或内存存储
            storage = {
                writeData: (data: any) => Promise.resolve(),
                readData: () => Promise.resolve(null),
                writeMetadata: (data: any) => Promise.resolve(),
                readMetadata: () => Promise.resolve(null),
            }
        }

        const cache = offlineExchange({
            logger(severity: "debug" | "error" | "warn", message: string) {
                console.log("offlineExchange:", severity, "消息", message)
            },
            schema,
            keys: {
                RepLink: () => null, //不需要生成缓存键
            },
            storage: {
                ...storage,
                // 覆盖DefaultStorage writeMetadata方法： 进来就是重复的队列，不需要做storage.readMetadata!().then(existing;
                writeMetadata: (json: SerializedRequest[]) => {
                    if (json?.length !== 0) {
                        const newMetadata = [...(json || [])]
                        const thisIndex = newMetadata.length - 1 //[假设前提]最后一条是最新发送失败的变更mutation操作。
                        if (thisIndex > 0) {
                            //删除所有同样接口的未成功的pending操作（按操作类型）？不是同一份的检验报告 +json[thisIndex].variables id &&条件? 来区分吗。业务层面事务性锁定的。
                            newMetadata.forEach(({ query }, index) => {
                                if (index !== thisIndex && query === json[thisIndex].query) {
                                    delete newMetadata[index]
                                }
                            })
                        }
                        const out = [...newMetadata.filter((a) => a !== undefined)]
                        storage.writeMetadata!(out)
                    } else storage.writeMetadata!(json)
                },
            } as any,
            // 修改 offlineExchange 配置，确保网络错误能正确传播
            resolverExchange: false, // 禁用解析器交换，让网络错误能够传播
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
                        __typename: "Report",
                        id: args.id,
                        data: args.data,
                    }
                },
            },
        })

        const ssr = ssrExchange({
            isClient: typeof window !== "undefined",
        })

        //must be prefixed with NEXT_PUBLIC_.
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                // 错误处理 exchange 应该在最前面
                errorExchange({
                    onError: (error, operation) => {
                        console.error("GraphQL 错误:", error)

                        // 检查是否为网络错误
                        const hasNetworkError =
                            error.networkError ||
                            error.graphQLErrors?.some((err: any) => isNetworkError(err)) ||
                            isNetworkError(error)

                        if (hasNetworkError) {
                            console.error("网络连接错误:", error)
                            updateNetworkStatus(false, error)

                            // 显示用户友好的错误提示
                            if (typeof window !== "undefined") {
                                toast.error("网络连接失败", {
                                    description: "后端服务器无法连接，正在使用缓存数据",
                                    duration: 5000,
                                })
                            }
                        }
                    },
                }),
                cache,
                authExchange(async (utils) => {
                    return {
                        addAuthToOperation(operation) {
                            if (!accessToken) {
                                //console.warn("addAuthToOperation:accessToken空的", accessToken);居然是在服务端环境中运行的。
                                return operation
                            }
                            return utils.appendHeaders(operation, {
                                Authorization: `Bearer ${accessToken}`,
                            })
                        },
                        didAuthError(error) {
                            return error.graphQLErrors.some((e) => e.extensions?.code === "UNAUTHORIZED")
                        },
                        async refreshAuth() {
                            // 如果需要，实现令牌刷新逻辑
                            console.warn("addAuthToOperation:未实现？的", accessToken)
                        },
                    }
                }),
                networkErrorExchange, // 自定义网络错误处理
                ssr,
                customFetchExchange, // 自定义 fetch exchange
                fetchExchange,
            ],
            suspense: true,
            fetchOptions: () => {
                return {
                    headers: {
                        authorization: accessToken ? `Bearer ${accessToken}` : "",
                    },
                }
            },
        })

        return [client, ssr]
    }, [accessToken])

    return (
        <UrqlProvider client={client} ssr={ssr}>
            {children}
        </UrqlProvider>
    )
}
