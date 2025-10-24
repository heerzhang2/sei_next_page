import { type NextRequest, NextResponse } from "next/server"
import { auth, unstable_update as updateSession } from "@/app/auth"
import { createServerUrqlClient } from "@/auth/urql"
import { cookies } from "next/headers"

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        id
      }
    }
  }
`

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const refreshTokenFromCookie = cookieStore.get("refreshToken")?.value
        const session = await auth()
        //增强方案：Use cookie value if available, otherwise use session value,避免session还用旧的refreshToken情况出现！
        const currentRefreshToken = refreshTokenFromCookie || session?.user?.refreshToken
        if (!currentRefreshToken) {
            console.error("[API] 未找到刷新令牌 (cookie和session都没有)")
            return NextResponse.json({ error: "未找到刷新令牌" }, { status: 401 })
        }
        //【罪魁祸首】这里的session?.user?.refreshToken很坑，有可能用上次用过的，最终java误认是攻击的！只好上cookie了;
        if(refreshTokenFromCookie !==session?.user?.refreshToken)
        {
            console.log("cookie和session不一致")
        }
        const oldRefreshToken = currentRefreshToken
        try {
            const deviceId = session?.user?.deviceId || "server-refresh"
            const client = createServerUrqlClient(deviceId)
            const result = await client
                .mutation(REFRESH_TOKEN_MUTATION, {
                    refreshToken: oldRefreshToken,
                })
                .toPromise()

            if (result.error) {
                console.error("[API] Token刷新GraphQL错误:", result.error)
                if (result.error.message?.includes("refresh") || result.error.message?.includes("token")) {
                    console.error("[API] 可能是refresh token已被使用或无效")
                }
                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }
            if (!result.data?.refreshToken) {
                console.error("[API] Token刷新失败：无数据返回")
                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }
            const refreshData = result.data.refreshToken
            const newRefreshToken = refreshData.refreshToken
            //不同于：java后端在nextjs服务器离线模式下也有做个类似的 refresh_token cookie的。
            cookieStore.set("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 60,
                path: "/api/refresh-token",
            })
            const sessionUpdateStartTime = Date.now()
            if (session) {
                const updatedSession = await updateSession({
                    ...session,
                    user: {
                        ...session.user,
                        accessToken: refreshData.accessToken,
                        refreshToken: newRefreshToken,
                        id: refreshData.user.id,
                        name: refreshData.user.name || refreshData.user.username,
                        email: refreshData.user.email,
                    },
                })
                console.log(`[API] Session更新完成，耗时: ${Date.now() - sessionUpdateStartTime}ms`)
            } else {
                console.log("[API] 无session，仅使用Cookie存储token")
            }
            await new Promise((resolve) => setTimeout(resolve, 100))
            return NextResponse.json({
                success: true,
                accessToken: refreshData.accessToken,
                refreshToken: newRefreshToken,
                user: {
                    id: refreshData.user.id,
                    name: refreshData.user.name || refreshData.user.username,
                    email: refreshData.user.email,
                },
            })
        } catch (refreshError) {
            console.error("[API] Token刷新过程中出错:", refreshError)
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }
    } catch (error) {
        console.error("[API] Token刷新API错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
