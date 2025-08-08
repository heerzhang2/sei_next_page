import { NextRequest, NextResponse } from "next/server"
import { auth, update } from "@/app/auth"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // 如果 session 中有错误标记，说明刷新已经失败了
        if ((session as any)?.error === "RefreshAccessTokenError") {
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }

        // 触发 session 更新，这会调用 NextAuth 的 jwt 回调
        // jwt 回调会检查 token 是否过期并自动刷新
        const updatedSession = await update({})

        if (!updatedSession || (updatedSession as any)?.error) {
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }

        return NextResponse.json({
            accessToken: (updatedSession as any)?.accessToken,
            refreshToken: (updatedSession as any)?.refreshToken,
        })
    } catch (error) {
        console.error("Refresh token error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
