import { registerUrql } from "@urql/next/rsc"
import { createClient, ssrExchange } from "@urql/next"
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import { retryExchange } from "@urql/exchange-retry"
import { fetchExchange } from "@urql/core"
import { pipe, tap } from "wonka"
import { type Exchange, type CombinedError } from "urql"
// 注意：你的 introspection schema JSON 应已存在于该路径
import schema from "./urql-schema.json"

const endpoint = process.env.NEXT_PUBLIC_BACK_END
const url = `${endpoint}/graphql`

const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
})

// 仅在浏览器使用 IndexedDB 持久化，SSR 用内存空存储
const storage =
    typeof window !== "undefined"
        ? makeDefaultStorage({
          idbName: "graphcache-v3",
          maxAge: 7,
        })
        : {
          writeData: async (_d: unknown) => {},
          readData: async () => ({}),
          writeMetadata: async (_d: unknown) => {},
          readMetadata: async () => null,
        }

// 自定义错误/离线上报 exchange：配合 ServiceWorker 返回的 extensions.offline
const networkStatusExchange: Exchange = ({ forward }) => (ops$) =>
    pipe(
        forward(ops$),
        tap((result) => {
          const err = result.error as CombinedError | undefined
          if (!err) return
          const hasOfflineFlag =
              !!err.networkError ||
              err.graphQLErrors.some((ge) => (ge.extensions as any)?.offline === true)
          if (hasOfflineFlag && typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("urql:offline", {
                  detail: { error: { message: err.message } },
                })
            )
          }
        })
    )

// 轻量重试（仅在线时对网络错误进行退避重试）
const retry = retryExchange({
  initialDelayMs: 500,
  maxDelayMs: 10_000,
  randomDelay: true,
  maxNumberAttempts: 5,
  retryIf: (err) => {
    if (!err) return false
    const online = typeof navigator !== "undefined" ? navigator.onLine : true
    const isNetwork = !!err.networkError
    return online && isNetwork
  },
})

const graphcache = offlineExchange({
  schema,
  storage,
  updates: {
    // 根据你的 mutation 名称定制更新
    Mutation: {
      modifyOriginalRecordData: (_result, _args, _cache, _info) => {
        // 可触发 UI 或跨 tab 通知
        if (typeof window !== "undefined" && navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "DATA_UPDATED",
          })
        }
      },
    },
  },
  optimistic: {
    modifyOriginalRecordData(args) {
      return {
        __typename: "Report",
        id: (args as any).id,
        data: (args as any).data,
      }
    },
  },
})

export function urqlClient(accessToken: string | null) {
  const makeClient = () =>
      createClient({
        url,
        // 注意顺序：graphcache -> 自定义错误/离线 -> 重试 -> ssr -> fetch
        exchanges: [graphcache, networkStatusExchange, retry, ssr, fetchExchange],
        fetchOptions: () => ({
          headers: {
            authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }),
        suspense: true,
      })

  const setup = registerUrql(makeClient)
  return setup.getClient()
}
