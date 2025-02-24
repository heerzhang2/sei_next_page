'use client'

import {
    ssrExchange,
    cacheExchange,
    fetchExchange,
    createClient,
} from '@urql/next';
import {UrqlProvider,} from '@urql/next';
// import { useUrqlClient } from './urql-client'
import { useAccessToken } from './use-access-token'
import {authExchange} from "@urql/exchange-auth";
import {useMemo} from "react";

/*
const ssr = ssrExchange();
const client = createClient({   url: 'https:// trygql. formidable. dev/ graphql/ basic-pokedex',   exchanges: [cacheExchange, ssr, fetchExchange],   suspense: true, });
* */

export function GraphQLProvider({ children }) {
    // const client = useUrqlClient()
    const accessToken = useAccessToken();
    console.log("GraphQLProvider见到的token:{}", accessToken);         //【奇怪】强制刷新时在SSR服务器也会可能打印这个输出啊？我加了'use client'啊！！
    const [client, ssr] = useMemo(() => {
        const ssr = ssrExchange({
            isClient: typeof window !== 'undefined',
        });
        //must be prefixed with NEXT_PUBLIC_.
        const epoint = process.env.NEXT_PUBLIC_BACK_END
        const client = createClient({
            url: `${epoint}/graphql`,
            exchanges: [
                authExchange(async (utils) => {
                    return {
                        addAuthToOperation(operation) {
                            if (!accessToken) return operation

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
                            return null
                        }
                    }
                }),
                cacheExchange, ssr, fetchExchange],
            suspense: true,
        });

        return [client, ssr];
    }, []);

    return (
            <UrqlProvider client={client} ssr={ssr}>
               {children}
            </UrqlProvider>
        )
}
