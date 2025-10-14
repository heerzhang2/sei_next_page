import { NextRequest, NextResponse } from 'next/server';
import { auth, unstable_update as updateSession } from "@/app/auth"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.refreshToken) {
            return NextResponse.json({ error: '未找到刷新令牌' }, { status: 401 });
        }

        try {
            //会触发执行auth.config.ts里面的async jwt({ token, user, trigger, profile }：：trigger: "update"但是token还是旧的数据？
            const newsession = await updateSession(session)
            console.log("API路由token刷新session",session,"New:",newsession)
            return NextResponse.json({
                success:  newsession!==null,
                accessToken: newsession?.user?.accessToken,
                refreshToken: newsession?.user?.refreshToken,
            })
        } catch (refreshError) {
            console.error("Token刷新过程中出错:", refreshError)
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }

    } catch (error) {
        console.error('Token刷新API错误:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}
