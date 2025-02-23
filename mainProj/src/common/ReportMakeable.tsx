/** @jsxImportSource @emotion/react */
'use client';

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
// import {auth} from "@/app/auth";
import { useSession } from 'next-auth/react';
// import { getSession } from 'next-auth/react';
import {redirect, } from "next/navigation";

/*报告编制状态的，没登录的就必须要先登录，不能匿名浏览
针对 URL?make=1 进入编辑前提的！
* */
const ReportMakeable = () => {
    const {data: session}=useSession();
    // const session = await auth();
    const searchParams = useSearchParams()
    const [make, setMake] = useState(false)
    useEffect(() => {
        const make = searchParams.get('make')
        setMake(!!make)
    }, [searchParams])
    if(make && !session?.user)   redirect('/login')
    return null;
};

export default ReportMakeable;