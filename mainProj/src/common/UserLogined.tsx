/** @jsxImportSource @emotion/react */
'use client';

import { useSession } from 'next-auth/react';
import {redirect, } from "next/navigation";

/*必须登录用户，否则不能用
* */
const UserLogined = () => {
    const {data: session}=useSession();
    if(!session?.user)   redirect('/login')
    return null;
};

export default UserLogined;