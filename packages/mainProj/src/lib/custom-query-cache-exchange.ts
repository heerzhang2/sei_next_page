import { pipe, share, filter, merge, makeSubject } from "wonka"
import type { Operation, OperationResult, Exchange, ExchangeIO, CombinedError, RequestPolicy } from "@urql/core"
import { makeOperation } from "@urql/core"
import type { CacheExchangeOpts, StorageAdapter } from "@urql/exchange-graphcache"
import { cacheExchange } from "@urql/exchange-graphcache"

const toRequestPolicy = (operation: Operation, policy: RequestPolicy): Operation => {
    return makeOperation(operation.kind, operation, {
        ...operation.context,
        requestPolicy: policy,
    })
}

/** 自定义查询缓存交换器配置选项 */
export interface CustomQueryCacheExchangeOpts extends CacheExchangeOpts {
    /** 离线存储适配器 */
    storage: StorageAdapter
    /** 判断是否为离线错误的函数 */
    isOfflineError?(error: undefined | CombinedError, result: OperationResult): boolean
}

/**
 * 简化的查询缓存交换器
 *
 * 功能：
 * 1. 持久化查询结果到 IndexedDB，页面刷新后仍可用
 * 2. 离线时自动从缓存返回查询结果
 * 3. 不处理 mutation 队列和自动重试
 *
 * 使用场景：
 * - 需要查询缓存在后端宕机时仍然可用
 * - 不需要离线 mutation 队列功能（由 StorageContext 的 IndexedDB 处理）
 */
export const customQueryCacheExchange =
    <C extends CustomQueryCacheExchangeOpts>(opts: C): Exchange =>
        (input) => {
            const { storage } = opts

            const isOfflineError =
                opts.isOfflineError ||
                ((error: undefined | CombinedError) =>
                    error &&
                    error.networkError &&
                    !error.response &&
                    ((typeof navigator !== "undefined" && navigator.onLine === false) ||
                        /request failed|failed to fetch|network\s?error/i.test(error.networkError.message)))

            if (storage && storage.readData && storage.writeData) {
                const { forward: outerForward, client, dispatchDebug } = input
                const { source: reboundOps$, next } = makeSubject<Operation>()

                const forward: ExchangeIO = (ops$) => {
                    return pipe(outerForward(ops$), share)
                }

                const cacheResults$ = cacheExchange({
                    ...opts,
                    storage: {
                        readData: storage.readData,
                        writeData: storage.writeData,
                    },
                })({
                    client,
                    dispatchDebug,
                    forward,
                })

                return (operations$) => {
                    const opsAndRebound$ = merge([reboundOps$, operations$])

                    return pipe(
                        cacheResults$(opsAndRebound$),
                        filter((res) => {
                            if (res.operation.kind === "query") {
                                // 如果是离线错误，尝试从缓存获取
                                if (isOfflineError(res.error, res)) {
                                    next(toRequestPolicy(res.operation, "cache-only"))
                                    return false
                                }
                            }
                            // mutation 直接返回结果（成功或失败），不做队列处理
                            return true
                        }),
                    )
                }
            }

            // 如果没有配置 storage，使用标准 cacheExchange
            return cacheExchange(opts)(input)
        }
