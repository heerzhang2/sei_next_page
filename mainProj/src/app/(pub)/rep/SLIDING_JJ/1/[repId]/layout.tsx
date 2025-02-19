'use client';
import type { Metadata } from "next";
// import "./globals.css";
// import { ServerRelayProvider } from "../relay/ServerRelayProvider";
import {lazy, ReactNode, Suspense} from "react";
import { useMemo } from 'react';
//UrqlProvider报错createContext only works in Client Components.最后必须加'use client';
import {
    UrqlProvider,
    ssrExchange,
    cacheExchange,
    fetchExchange,
    createClient,
} from '@urql/next';



// const FootBar = lazy(() => import("@/component/footbar"));

/*只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */
// export default async function RootLayout({children}: { children: ReactNode }) {
//     // await connection();
//     return (
//         <div>
//             滑行车类大型游乐设施监督检验的情况如下》》
//                            {children}
//         </div>
//     );
// }
export default function Layout({ children }: React.PropsWithChildren) {
    const [client, ssr] = useMemo(() => {
        const ssr = ssrExchange({
            isClient: typeof window !== 'undefined',
        });
        const client = createClient({
            url: 'https://graphql-pokeapi.graphcdn.app/',
            exchanges: [cacheExchange, ssr, fetchExchange],
            suspense: true,
        });

        return [client, ssr];
    }, []);

    return (
        <UrqlProvider client={client} ssr={ssr}>
            滑行车类大型游乐设施监督检验的情况如下》》
            {children}
        </UrqlProvider>
    );
}
