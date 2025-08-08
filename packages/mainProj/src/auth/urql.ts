import { createClient } from "@urql/core"
import { fetchExchange } from "urql"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

// 纯服务端 URQL 客户端（用于 NextAuth jwt 回调、API 路由等）
export function urqlClient(accessToken: string | null) {
    return createClient({
        url,
        exchanges: [fetchExchange],
        fetchOptions: {
            headers: {
                authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
        },
    })
}

// 可选：如果你需要在服务端组件中使用 URQL（比如匿名查看报告）
export function createServerUrqlClient(accessToken?: string | null) {
    return createClient({
        url,
        exchanges: [fetchExchange],
        fetchOptions: {
            headers: {
                authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
        },
        // 服务端不需要 suspense
        suspense: false,
    })
}
