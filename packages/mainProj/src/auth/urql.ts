import { createClient, fetchExchange } from "@urql/core"
import { cacheExchange } from "@urql/exchange-graphcache"
import schema from "./urql-schema.json" // 确保你的 schema.json 路径正确
import { registerUrql } from "@urql/next/rsc"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

// 服务端 URQL 客户端工厂函数
export const { get } = registerUrql(() => {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                schema,
                keys: {
                    RepLink: () => null, // 不需要生成缓存键
                },
            }),
            // 服务端不需要 authExchange 来刷新 token，因为 session 已经在 NextAuth 层面处理
            // 但如果需要传递 token，可以在 fetchOptions 中处理
            fetchExchange,
        ],
        fetchOptions: () => {
            // 在服务端，如果需要，可以从 headers 或其他上下文获取 token
            // 但对于 NextAuth 的 jwt 回调，我们直接在回调中处理 token
            return {}
        },
    })
})

// 可选：如果你需要在服务端组件中使用 URQL（比如匿名查看报告）
export function createServerUrqlClient(accessToken?: string | null) {
    return createClient({
        url,
        exchanges: [
            cacheExchange({
                keys: {
                    RepLink: () => null, // 不需要生成缓存键
                },
            }),
            fetchExchange,
        ],
        fetchOptions: {
            headers: {
                authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
        },
        // 服务端不需要 suspense
        suspense: false,
    })
}

// 客户端 URQL 客户端（仅用于类型提示，实际客户端在 graphql-component.tsx 中创建）
// export const urqlClient = (accessToken: string | null) => {
//   return createClient({
//     url,
//     exchanges: [
//       cacheExchange({
//         schema,
//         keys: {
//           RepLink: () => null,
//         },
//       }),
//       authExchange({
//         getAuth: async ({ authState }) => {
//           if (!accessToken) return null;
//           return { token: accessToken };
//         },
//         addAuthToOperation: ({ operation, authState }) => {
//           if (!authState || !(authState as any).token) {
//             return operation;
//           }
//           const fetchOptions =
//             typeof operation.context.fetchOptions === 'function'
//               ? operation.context.fetchOptions()
//               : operation.context.fetchOptions || {};
//           return {
//             ...operation,
//             context: {
//               ...operation.context,
//               fetchOptions: {
//                 ...fetchOptions,
//                 headers: {
//                   ...fetchOptions.headers,
//                   Authorization: `Bearer ${(authState as any).token}`,
//                 },
//               },
//             },
//           };
//         },
//         didAuthError: ({ error }) => {
//           return error.graphQLErrors.some(e => e.extensions?.code === 'UNAUTHENTICATED');
//         },
//         refreshAuth: async () => {
//           // 客户端刷新逻辑
//         },
//       }),
//       fetchExchange,
//     ],
//   });
// };
