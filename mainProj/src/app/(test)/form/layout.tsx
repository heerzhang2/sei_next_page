import React, {ReactNode, Suspense,} from "react";
import {StorageProvider } from "@/report/StorageContext";

export default async function ReportRootLayout({params, children} :
    {   params: Promise<{ repId: string }>,
        children: ReactNode
    }
) {
    return (
        <>
           <StorageProvider>
                   {children}
           </StorageProvider>
        </>
    );
}
