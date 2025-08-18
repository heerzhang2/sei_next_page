"use client"
import {redirect, } from "next/navigation";
import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import { useSession, } from 'next-auth/react';
import {useNetworkStatus} from "@/hooks/use-network-status";

/*报告编制的页面必须登录用户才能进去：能用编辑器不一定有权限改，真要保存后端还会控制权限。
上一级父组件依旧是服务端SSR的情形下：
报告编制状态的，没登录的就必须要先登录，不能匿名浏览
若服务端登陆过期accessToken失效的，登录前后authjs.session-token=会变长了
* */
const ReportMakeable = () => {
    const session = useSession();
    const searchParams = useSearchParams()
    const [make, setMake] = useState(false)
    const { isClientOnline, isOnline, isGraphQLBackendReachable } = useNetworkStatus()

    useEffect(() => {
        const make = searchParams.get('make')
        setMake(!!make)
    }, [searchParams])
    //文档错了 SessionProvider必须在父辈组件内； #类型不同了session?.status  session?.data?.user
        //若在服务端调用useSession：就报错！
    // if(session && (!(session?.data?.user as any)?.accessToken || !session?.data?.user))   redirect('/login')
    if(isClientOnline && isOnline && isGraphQLBackendReachable) {
        if (!(session?.data?.user as any)?.accessToken || !session?.data?.user)
        {
            console.log("ReportMakeable: 跳转login", session)
            redirect('/login')
        }
    }
    return null;
}

export default ReportMakeable;