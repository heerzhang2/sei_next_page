/** @jsxImportSource @emotion/react */
"use client"
import {redirect, } from "next/navigation";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import { useSession, } from 'next-auth/react';


/*上一级父组件依旧是服务端SSR的情形下：
报告编制状态的，没登录的就必须要先登录，不能匿名浏览
针对 URL?make=1 进入编辑前提的！
* */
const ReportMakeable = () => {
    const session = useSession();
    const searchParams = useSearchParams()
    const [make, setMake] = useState(false)
    useEffect(() => {
        const make = searchParams.get('make')
        setMake(!!make)
    }, [searchParams])
    //文档错了 SessionProvider必须在父辈组件内； #类型不同了session?.status  session?.data?.user
    if(session?.status!=="loading") {
        //若在服务端调用useSession：就报错！
        if(make && (!session?.data?.user?.accessToken || !session?.data?.user))   redirect('/login')
    }
    return null;
}


export default ReportMakeable;