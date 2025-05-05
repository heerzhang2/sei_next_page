import React, {ReactNode, } from "react";
import {StorageProvider } from "@/report/StorageContext";

export default async function ReportRootLayout({params, children} :
    {   params: Promise<{ repId: string }>,
        children: ReactNode
    }
) {
    return (
        <div>
           <StorageProvider>
                   {children}
           </StorageProvider>
        </div>
    );
}
