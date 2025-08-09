import { auth, update } from "@/app/auth"
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

        // 触发 session 更新，这会调用 jwt 回调并可能刷新 token
        const updatedSession = await update({
            user: session.user,
        })

        if (!updatedSession?.user?.accessToken) {
            return NextResponse.json({ error: "Failed to get access token" }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            accessToken: updatedSession.user.accessToken,
        })
    } catch (error) {
        console.error("Refresh token API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
