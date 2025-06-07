import { NextResponse } from "next/server";
import {auth} from "@/app/auth";


/**API路由
**API路由 = 服务器端：app/api/ xx /route.ts文件中的代码 在 Next.js 服务器上运行!
**API路由中的 localhost 指的是 Next.js 服务器所在的机器;
 * 浏览器直接调用"use server"的代码：实际需要跨越网络执行的，中间通信延迟，尽量不要这么做；React Server Action、表单提交触发的类似。
*/
export async function POST() {
    // 获取服务器端会话
    const session = await auth();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 返回当前有效的访问令牌
    return NextResponse.json({
        accessToken: (session.user as any)?.accessToken
    });
}
