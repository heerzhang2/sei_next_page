"use client"

import { UrqlProvider } from "@urql/next"
import { useMemo } from "react"
import { ssrExchange, createClient } from "@urql/next"
import { fetchExchange, type CombinedError, type Exchange, type OperationResult } from "urql"
import { authExchange } from "@urql/exchange-auth"
import { offlineExchange } from "@urql/exchange-graphcache"
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import { pipe, tap } from "wonka"
import { useAccessToken } from "./use-access-token"
// 可选：如果有 schema.json 可以启用
// import schema from "./urql-schema.json"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

// 网络状态广播（可供你的 UI 监听）
const networkStatusExchange: Exchange = ({ forward }) => (ops$) =>
    pipe(
        forward(ops$),
        tap((result: OperationResult) => {
            const err = result.error as CombinedError | undefined
            if (!err) return
            const offline =
                !!err.networkError ||
                err.graphQLErrors.some((ge) => (ge.extensions as any)?.offline === true)
            if (offline && typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("urql:offline", { detail: { message: err.message } }))
            }
        })
    )

// 检测“未授权”并在客户端发起刷新
function makeAuthExchange(getAccessToken: () => string | null) {
    return authExchange(async (utils) => {
        let token = getAccessToken()

        return {
            addAuthToOperation(operation) {
                const accessToken = token || getAccessToken()
                if (!accessToken) return operation
                return utils.appendHeaders(operation, { Authorization: `Bearer ${accessToken}` })
            },

            didAuthError(error) {
                // 1) GraphQL 层：扩展码
                const hasUnauthCode = error.graphQLErrors.some((e) => {
                    const code = (e.extensions as any)?.code
                    return code === "UNAUTHENTICATED" || code === "FORBIDDEN" || code === "UNAUTHORIZED"
                })
                // 2) 网络层：HTTP 状态
                const status = (error as any)?.response?.status
                const has401 = status === 401 || status === 403
                return hasUnauthCode || has401
            },

            async refreshAuth() {
                // 通过 Next.js API 调用服务端 session 刷新（jwt 回调会自动尝试 refresh）
                try {
                    const resp = await fetch("/api/refresh-token", {
                        method: "POST",
                        credentials: "include",
                    })
                    if (!resp.ok) throw new Error(`refresh failed: ${resp.status}`)
                    const data = await resp.json()
                    if (data?.accessToken) {
                        token = data.accessToken
                        return
                    }
                    throw new Error("No accessToken in response")
                } catch (e) {
                    // 刷新失败，通知 UI 跳转登录
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("urql:unauthorized"))
                    }
                }
            },
        }
    })
}

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
    const accessToken = useAccessToken()

    const [client, ssr] = useMemo(() => {
        const storage =
            typeof window !== "undefined"
                ? makeDefaultStorage({ idbName: "graphcache-v3", maxAge: 7 })
                : {
                    writeData: async (_d: unknown) => {},
                    readData: async () => ({}),
                    writeMetadata: async (_d: unknown) => {},
                    readMetadata: async () => null,
                }

        const graphcache = offlineExchange({
            // schema,
            storage,
            optimistic: {},
            updates: {},
        })

        const ssr = ssrExchange({ isClient: typeof window !== "undefined" })

        const client = createClient({
            url,
            suspense: false, // 避免 SSR/CSR hydration 抖动
            requestPolicy: "cache-and-network",
            exchanges: [graphcache, makeAuthExchange(() => accessToken), networkStatusExchange, ssr, fetchExchange],
            fetchOptions: () => ({
                headers: {
                    authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
            }),
        })
        return [client, ssr]
    }, [accessToken])

    return <UrqlProvider client={client} ssr={ssr}>{children}</UrqlProvider>
}
