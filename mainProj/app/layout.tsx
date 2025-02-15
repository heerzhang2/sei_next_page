import type { Metadata } from "next";
import "./globals.css";
import { RelayProvider } from "@/relay/RelayProvider";
import { ReactNode } from "react";
import SwrConfigClient from "@/action/SwrConfigClient";
import AppStateProvider from "@/action/AppStateProvider";
import { ToastContainer, toast } from 'react-toastify';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: "Relay Streaming SSR ✨",
};

/*水和报错：Avoid Hydration Mismatch: 舍弃{ ThemeProvider } from 'next-themes'的。
* */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="p-10">
        <SessionProvider>
           <RelayProvider>
                <AppStateProvider>
                    <SwrConfigClient>

                            {children}

                    </SwrConfigClient>
                </AppStateProvider>
                <ToastContainer />
           </RelayProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
