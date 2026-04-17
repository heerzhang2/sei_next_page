import type { Metadata } from "next";
// import "./globals.css";
// import { ServerRelayProvider } from "../relay/ServerRelayProvider";
import {lazy, ReactNode, Suspense} from "react";
import SwrConfigClient from "@/contexts/SwrConfigClient";
import { ToastContainer, toast } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';
import {connection} from "next/server";
import GlobalState from "@/contexts/GlobalState";
// import FootBar from "@/component/footbar";

export const metadata: Metadata = {
  title: "✨用户",
};

// const FootBar = lazy(() => import("@/component/footbar"));

/*只提供静态化（保障SessionProvider不提供客户端user也能Build的情形），不考虑鉴别用户context认证才能使用的。
水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
next-auth:SessionProvider是服务器端内部可用的。 但是RelayEnvironmentProvider正常是只能用于客户端的(水和/SSR除外)。
* */
export default async function SPALayout({children}: { children: ReactNode }) {
    await connection();
    return (
        <>
            <GlobalState>
                <SwrConfigClient>
                    {children}
                </SwrConfigClient>
            </GlobalState>
            <ToastContainer/>
        </>
    );
}
