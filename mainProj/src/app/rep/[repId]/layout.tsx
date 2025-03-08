
import type { Metadata } from "next";
// import "./globals.css";
// import { ServerRelayProvider } from "../relay/ServerRelayProvider";
import React, {ReactNode, Suspense,} from "react";
//UrqlProvider报错createContext only works in Client Components.最后必须加'use client';
import GlobalState from "@/action/GlobalState";
import AppStateProvider from "@/action/AppStateProvider";
import SwrConfigClient from "@/action/SwrConfigClient";
//会导致水和报错
// import {ToastContainer} from "react-toastify";
import ReportMakeable from "@/common/ReportMakeable";
import ReportData from "@/component/rep/report-data";
import {EditStorageContext, useEditStorageContext} from "@/report/StorageContext";


// const FootBar = lazy(() => import("@/component/footbar"));

/*报告和编制都用到的部分：能支持不要用登录看报告。
只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */
export default async function ReportRootLayout({params, children} :
    {   params: Promise<{ repId: string }>,
        children: ReactNode
    }
) {
    //[路由的约束] URL结构必须是 ./modelType/version/repId/
    const { repId } =await params
    //    const { repId } = React.use(params);  // await params
    // await connection();
    console.log("ReportRootLayout: repId=",repId);
    // const session =await auth();
    // if(!session?.user)   redirect('/login')
    const repContext = useEditStorageContext({});
    return (
        <>
            <ReportMakeable />
            <EditStorageContext.Provider value={repContext}>
                <ReportData  repId={repId}>
                    {/*<GlobalState>*/}
                    {/*    <AppStateProvider>*/}
                    {/*        <SwrConfigClient>*/}

                                {children}


                    {/*        </SwrConfigClient>*/}
                    {/*    </AppStateProvider>*/}
                    {/*</GlobalState>*/}

                    {/*<ToastContainer/>*/}
                </ReportData>
            </EditStorageContext.Provider>
        </>
    );
}



// export default function Layout({ children }: React.PropsWithChildren) {
//
//     return (
//         <UrqlProvider client={urqlClient()} ssr={getSsr()}>
//             滑行车类大型游乐设施监督检验的情况如下》》
//             {children}
//         </UrqlProvider>
//     );
// }
