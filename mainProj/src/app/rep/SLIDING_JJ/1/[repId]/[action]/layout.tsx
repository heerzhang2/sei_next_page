"use client"
import {useEffect, useState} from "react";
import Editors from "@/app/rep/SLIDING_JJ/1/[repId]/[action]/editors";
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

    return (
        <Editors children={children}/>
    )
}
