import type { Metadata } from "next";
import "./globals.css";
import { RelayProvider } from "@/relay/RelayProvider";
import { ReactNode } from "react";
import SwrConfigClient from "@/action/SwrConfigClient";
import AppStateProvider from "@/action/AppStateProvider";
import { ThemeProvider } from 'next-themes';
import {DEFAULT_THEME} from "@/site/config";

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
            {children}

        </RelayProvider>
      </body>
    </html>
  );
}
