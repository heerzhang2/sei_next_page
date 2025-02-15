import type { Metadata } from "next";
// import "./globals.css";
import { RelayProvider } from "../relay/RelayProvider";
import {lazy, ReactNode, Suspense} from "react";
import SwrConfigClient from "@/action/SwrConfigClient";
import AppStateProvider from "@/action/AppStateProvider";
import { ToastContainer, toast } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';
import GlobalState from "@/action/GlobalState";
import {MainContent} from "@/app/MainContent";
import {connection} from "next/server";
// import FootBar from "@/component/footbar";

export const metadata: Metadata = {
  title: "Relay Streaming SSR ✨",
};

const FootBar = lazy(() => import("@/component/footbar"));

/*水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
* */
export default async function RootLayout({children}: { children: ReactNode }) {
    await connection();
    return (
        <html>
        <body>
        <SessionProvider>
            <RelayProvider>
                <GlobalState>
                    <AppStateProvider>
                        <SwrConfigClient>

                            {children}

                            <Suspense fallback={<div className="text-yellow-500">Loading56data...</div>}>
                                <MainContent/>
                            </Suspense>
                        </SwrConfigClient>
                    </AppStateProvider>
                </GlobalState>
                <ToastContainer/>
            </RelayProvider>
        </SessionProvider>
        </body>
        </html>
    );
}
