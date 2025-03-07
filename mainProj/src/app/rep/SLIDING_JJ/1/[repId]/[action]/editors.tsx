"use client"
import React, {useEffect, useState} from "react";
import Skeleton from "@/app/rep/SLIDING_JJ/1/[repId]/[action]/skeleton";
import ReportOrRecord from "@/component/reportOrRecord";
import Sidebar from "@/app/rep/SLIDING_JJ/1/[repId]/sidebar";
import {tableOfContentsItems} from "@/app/rep/SLIDING_JJ/1/[repId]/page";
// import dynamic from 'next/dynamic';
//× `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
// const Skelon = dynamic(() => import('./skelon'), {
//     ssr: false,
// });


export default function Editors({
                                   children,
                               }: Readonly<{
    children: React.ReactNode
}>) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    // Server and initial client render - must match exactly
    if (!isClient) {
        return <div className="skelon-placeholder">Loading...</div>;
    }
    // After hydration, render the full component
    return (<>
        <div className="flex-1 overflow-auto">
            <div className="mx-auto px-0 py-8">
                <div  className="flex flex-col min-h-screen">
                    <header className="border-b">
                        <div className="container flex items-center justify-between h-14">
                            <h1 className="text-xl font-bold">Split View Demo</h1>

                        </div>
                    </header>
                    <Skeleton children={children}/>
                </div>
            </div>
        </div>
        <Sidebar items={tableOfContentsItems}/>
    </>
    )
}
