import type { Metadata } from "next";
// import "./globals.css";
import { RelayProvider } from "../relay/RelayProvider";
import { ReactNode } from "react";
import SwrConfigClient from "@/action/SwrConfigClient";
import AppStateProvider from "@/action/AppStateProvider";
import { ToastContainer, toast } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';
import GlobalState from "@/action/GlobalState";
import FootBar from "@/component/footbar";

export const metadata: Metadata = {
  title: "Relay Streaming SSR ✨",
};

/*水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
* */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
           <RelayProvider>
               <GlobalState>
                <AppStateProvider>
                    <SwrConfigClient>

                            {children}


                    </SwrConfigClient>
                </AppStateProvider>
               </GlobalState>
                <ToastContainer />
           </RelayProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
