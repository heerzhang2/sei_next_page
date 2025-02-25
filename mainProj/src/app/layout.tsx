import type { Metadata } from "next";
// import "./globals.css";
// import { ServerRelayProvider } from "../relay/ServerRelayProvider";
import {ReactNode, } from "react";
// import SwrConfigClient from "@/action/SwrConfigClient";
// import AppStateProvider from "@/action/AppStateProvider";
// import { ToastContainer, toast } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';
import {auth} from "@/app/auth";
// import GlobalState from "@/action/GlobalState";
// import {connection} from "next/server";
import { Provider } from "jotai";
import {GraphQLProvider} from "@/auth/graphql-component";
import PrintUsed from "@/common/PrintUsed";
// import { CacheProvider } from '@emotion/react'
// import createCache from '@emotion/cache'

// import FootBar from "@/component/footbar";
//不可以用import { Provider } from 'urql';报错createContext only works in Client Components. Add the "use client" directive at the top of the file to use it.

// export const metadata: Metadata = {
//   title: "Relay Streaming SSR ✨",
// };

// const FootBar = lazy(() => import("@/component/footbar"));

/*只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
因为XXProvider：createContext({})只能用use client独立封装组件的{context只能被客户端使用的}。然后这里再用{children}接收服务端组件树。
* */
export default async function RootLayout({children}: { children: ReactNode }) {
    // const cache = createCache({ key: 'css' })
    // await connection();
    const session = await auth();
    return (
        // <CacheProvider value={cache}>
        <html>
        <head>
         <style>
         {`
        body {
            padding: 0;
            margin: 0;
        }
        @page portraitPg {
            size: a4 portrait;
            @top-middle {
                content: "Table of ntentsff3";
            }
        }
        @page landscapePg {
            size: a4 landscape;
            @top-middle {
                content: "Chapte r5sdfg";
            }
        }        
        @media print {
            .WideChapter {
                page: landscapePg;
            }
            .UsualChapter {
                page: portraitPg;
            }
        }
        `}
         </style>
        </head>
        <body>
        <PrintUsed/>

        <SessionProvider session={session}>
            <Provider>
                <GraphQLProvider>
                    {children}
                </GraphQLProvider>
            </Provider>

            {/*<GlobalState>*/}
            {/*    <AppStateProvider>*/}
            {/*        <SwrConfigClient>*/}

            {/*            {children}*/}

            {/*            <Suspense fallback={<div className="text-yellow-500">Loading56data...</div>}>*/}
            {/*                <MainContent/>*/}
            {/*            </Suspense>*/}
            {/*        </SwrConfigClient>*/}
            {/*    </AppStateProvider>*/}
            {/*</GlobalState>*/}
            {/*<ToastContainer/>*/}

        </SessionProvider>
        </body>
        </html>
        // </CacheProvider>
    );
}
