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

const maskToken = (token: string): string => {
    if (!token || token.length < 8) return "***"
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.refreshToken) {
            console.error("[API] 未找到刷新令牌")
            return NextResponse.json({ error: "未找到刷新令牌" }, { status: 401 })
        }

        console.log("[API] 开始刷新token，使用refresh_token:", maskToken(session.user.refreshToken))

        try {
            const deviceId = session.user.deviceId || "server-refresh"
            const client = createServerUrqlClient(deviceId)

            console.log("[API] 发送refreshToken mutation到后端")
            const mutationStartTime = Date.now()

            const result = await client
                .mutation(REFRESH_TOKEN_MUTATION, {
                    refreshToken: session.user.refreshToken,
                })
                .toPromise()

            console.log(`[API] refreshToken mutation响应时间: ${Date.now() - mutationStartTime}ms`)

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

            console.log("[API] Token刷新成功，收到新token:")
            console.log("  - 新accessToken:", maskToken(refreshData.accessToken))
            console.log("  - 新refreshToken:", maskToken(refreshData.refreshToken))
            console.log("  - 旧refreshToken:", maskToken(session.user.refreshToken))

            console.log("[API] 开始更新session")
            const sessionUpdateStartTime = Date.now()

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

            console.log(`[API] Session更新完成，耗时: ${Date.now() - sessionUpdateStartTime}ms`)
            console.log("[API] 新refreshToken已保存到session")

            await new Promise((resolve) => setTimeout(resolve, 100))
            console.log("[API] Session持久化延迟完成")

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
            if (refreshError instanceof Error) {
                console.error("[API] 错误详情:", refreshError.message)
                console.error("[API] 错误堆栈:", refreshError.stack)
            }
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }
    } catch (error) {
        console.error("[API] Token刷新API错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
