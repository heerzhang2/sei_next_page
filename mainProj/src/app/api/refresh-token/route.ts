import { NextResponse } from "next/server";
import {auth} from "@/app/auth";

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
