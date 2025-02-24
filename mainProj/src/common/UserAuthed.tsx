/** @jsxImportSource @emotion/react */

import {redirect, } from "next/navigation";
import {auth} from "@/app/auth";

/*必须登录用户，否则不能用
【服务端SSR】情形下的：
* */
const UserAuthed = async () => {
    const session = await auth();
    if (!session?.user) redirect('/login')
    return null;
};

export default UserAuthed;