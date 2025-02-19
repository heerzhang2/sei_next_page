import type { Metadata } from "next";
// import "./globals.css";
// import { ServerRelayProvider } from "../relay/ServerRelayProvider";
import {lazy, ReactNode, Suspense} from "react";
import {RelayProvider} from "@/relay/RelayProvider";
import GlobalState from "@/action/GlobalState";
import AppStateProvider from "@/action/AppStateProvider";
import SwrConfigClient from "@/action/SwrConfigClient";
import {ToastContainer} from "react-toastify";
// import FootBar from "@/component/footbar";

export const metadata: Metadata = {
  title: "滑行车类大型游乐设施监督检验",
};


/*只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */

// export default async function RootLayout({children}: { children: ReactNode }) {
//     // await connection();
//     return (
//         <div>
//                 {children}
//                 福建特检验的 脚注通用的；尾巴》》
//         </div>
//     );
// }


export default async function RootLayout({children}: { children: ReactNode }) {
    return (
        <div>
            滑行车类大型游乐设施监督检验的情--22-况如下》》
            <GlobalState>
                <AppStateProvider>
                    <SwrConfigClient>

                        {children}

                    </SwrConfigClient>
                </AppStateProvider>
            </GlobalState>
            <ToastContainer/>
        </div>
    );
}
