import type { Metadata } from "next";
import "./globals.css";
import { RelayProvider } from "@/relay/RelayProvider";
import { ReactNode } from "react";
import SwrConfigClient from "@/action/SwrConfigClient";
import AppStateProvider from "@/action/AppStateProvider";
import { ThemeProvider } from 'next-themes';
import {DEFAULT_THEME} from "@/site/config";
import {Toaster} from "@/component/Toaster";
// import ToasterWithThemes from "@/component/ToasterWithThemes";
import { ToastContainer, toast } from 'react-toastify';

export const metadata: Metadata = {
  title: "Relay Streaming SSR ✨",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="p-10">
        <RelayProvider>
            <AppStateProvider>
                <SwrConfigClient>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme={DEFAULT_THEME}
                    >
                     {children}
                    </ThemeProvider>
                </SwrConfigClient>
            </AppStateProvider>
            <ToastContainer />
        </RelayProvider>
      </body>
    </html>
  );
}
