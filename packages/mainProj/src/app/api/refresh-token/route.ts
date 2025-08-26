import { auth } from "@/app/auth"
import { NextResponse } from "next/server"
import { refreshAccessToken } from "@/app/auth.config"

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

        try {
            // 构造token对象用于刷新
            const tokenToRefresh = {
                accessToken: session.user.accessToken,
                refreshToken: session.user.refreshToken,
                exp: session.user.accessTokenExpires,
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                },
            }

            console.log("API路由开始刷新token...")
            const refreshedToken = await refreshAccessToken(tokenToRefresh)

            if (refreshedToken.error) {
                console.error("Token刷新失败:", refreshedToken.error)
                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }

            console.log("API路由token刷新成功")
            return NextResponse.json({
                success: true,
                accessToken: refreshedToken.accessToken,
                refreshToken: refreshedToken.refreshToken,
            })
        } catch (refreshError) {
            console.error("Token刷新过程中出错:", refreshError)
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }
    } catch (error) {
        console.error("Refresh token API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
