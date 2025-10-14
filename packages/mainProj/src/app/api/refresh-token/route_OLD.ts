import { auth, unstable_update as updateSession } from "@/app/auth"
import { NextResponse } from "next/server"
// import { refreshAccessToken } from "@/app/auth.config"

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
            // const tokenToRefresh = {
            //     accessToken: session.user.accessToken,
            //     refreshToken: session.user.refreshToken,
            //     exp: session.user.accessTokenExpires,
            //     user: {
            //         id: session.user.id,
            //         name: session.user.name,
            //         email: session.user.email,
            //     },
            // }
            //
            // console.log("API路由开始刷新token...")
            // const refreshedToken = await refreshAccessToken(tokenToRefresh)
            //
            // if (refreshedToken.error) {
            //     console.error("Token刷新失败:", refreshedToken.error)
            //     return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            // }
            // const sessionObj={
            //     user: {
            //         ...session.user,
            //         accessToken:   refreshedToken.accessToken,
            //         refreshToken:  refreshedToken.refreshToken,
            //         accessTokenExpires: refreshedToken.accessTokenExpires,
            //     }
            // };

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
        console.error("Refresh token API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
