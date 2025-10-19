import { type NextRequest, NextResponse } from "next/server"
import { auth, unstable_update as updateSession } from "@/app/auth"
import { createServerUrqlClient } from "@/auth/urql"

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
        const session = await auth()
        if (!session?.user?.refreshToken) {
            return NextResponse.json({ error: "未找到刷新令牌" }, { status: 401 })
        }

        try {
            console.log("[API] 开始刷新token，使用refresh_token")

            const deviceId = session.user.deviceId || "server-refresh"
            const client = createServerUrqlClient(deviceId)

            const result = await client
                .mutation(REFRESH_TOKEN_MUTATION, {
                    refreshToken: session.user.refreshToken,
                })
                .toPromise()

            if (result.error) {
                console.error("[API] Token刷新GraphQL错误:", result.error)
                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }

            if (!result.data?.refreshToken) {
                console.error("[API] Token刷新失败：无数据返回")
                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }

            const refreshData = result.data.refreshToken
            console.log("[API] Token刷新成功，更新session")

            const updatedSession = await updateSession({
                ...session,
                user: {
                    ...session.user,
                    accessToken: refreshData.accessToken,
                    refreshToken: refreshData.refreshToken,
                    id: refreshData.user.id,
                    name: refreshData.user.name || refreshData.user.username,
                    email: refreshData.user.email,
                },
            })

            console.log("[API] Session更新完成，新refreshToken已保存")

            return NextResponse.json({
                success: true,
                accessToken: refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
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
