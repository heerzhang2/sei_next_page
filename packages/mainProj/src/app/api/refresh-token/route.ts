import { auth } from "@/app/auth"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // 检查是否有刷新错误
        if ((session as any).error === "RefreshAccessTokenError") {
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }

        // NextAuth 5.0 中，token 刷新在 jwt 回调中自动处理
        // 这里只需要返回当前的 accessToken
        if (!session.user.accessToken) {
            return NextResponse.json({ error: "No access token available" }, { status: 401 })
        }
        console.log("Refresh token user=", session.user)
        return NextResponse.json({
            success: true,
            accessToken: session.user.accessToken,
        })
    } catch (error) {
        console.error("Refresh token API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
