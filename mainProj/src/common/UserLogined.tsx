'use client';

import { useSession } from 'next-auth/react';
import {redirect, } from "next/navigation";
import { useState, useEffect } from 'react'

/*必须登录用户，否则不能用
【客户端浏览器】情形下的：
* */
const UserLogined = () => {
    const [isClient, setIsClient] = useState(false)
    const {data: session}=useSession();
    useEffect(() => {
        setIsClient(true)
    }, [])

    if(isClient && !session?.user)   redirect('/login')
    return null;
};

export default UserLogined;