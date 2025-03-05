"use client"
import {useEffect, useState} from "react";
import Skelon from "@/app/rep/SLIDING_JJ/1/[repId]/[action]/skelon";
// import dynamic from 'next/dynamic';
//× `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.
// const Skelon = dynamic(() => import('./skelon'), {
//     ssr: false,
// });


export default function Layout({
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
    return (
        <Skelon children={children}/>
    )
}
