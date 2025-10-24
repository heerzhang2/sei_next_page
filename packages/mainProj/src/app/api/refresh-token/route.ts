import { type NextRequest, NextResponse } from "next/server"
import { auth, unstable_update as updateSession } from "@/app/auth"
import { createServerUrqlClient } from "@/auth/urql"
import { appendFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
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

const maskToken = (token: string): string => {
    if (!token || token.length < 8) return "***"
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

const logRefreshTokenUsageToFile = async (
    oldToken: string,
    newToken: string | null,
    action: string,
    success: boolean,
    error?: string,
) => {
    try {
        const logDir = path.join(process.cwd(), "logs")
        const logFile = path.join(logDir, "refresh-token-usage.log")

        // Create logs directory if it doesn't exist
        if (!existsSync(logDir)) {
            await mkdir(logDir, { recursive: true })
        }

        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            timestampMs: Date.now(),
            action,
            success,
            oldToken: maskToken(oldToken),
            oldTokenHash: oldToken.substring(0, 8),
            newToken: newToken ? maskToken(newToken) : null,
            newTokenHash: newToken ? newToken.substring(0, 8) : null,
            error: error || null,
        }

        const logLine = `${timestamp} | ${action} | Success: ${success} | Old: ${logEntry.oldTokenHash} | New: ${logEntry.newTokenHash || "N/A"} | Error: ${error || "None"}\n`

        await appendFile(logFile, logLine, "utf-8")
        console.log(`[ServerTokenLog] Logged to file:`, logEntry)
    } catch (error) {
        console.error("[ServerTokenLog] Failed to write log file:", error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const refreshTokenFromCookie = cookieStore.get("refreshToken")?.value
        const session = await auth()
        //增强方案：Use cookie value if available, otherwise use session value,避免session还用旧的refreshToken情况出现！
        const currentRefreshToken = refreshTokenFromCookie || session?.user?.refreshToken

        if (!currentRefreshToken) {
            console.error("[API] 未找到刷新令牌 (cookie和session都没有)")
            await logRefreshTokenUsageToFile("", null, "刷新失败-无token", false, "未找到刷新令牌")
            return NextResponse.json({ error: "未找到刷新令牌" }, { status: 401 })
        }
        if(refreshTokenFromCookie !==session?.user?.refreshToken)
            console.error("cookie和session不一致的：",refreshTokenFromCookie, session?.user?.refreshToken)
        const oldRefreshToken = currentRefreshToken
        console.log("[API] 开始刷新token，使用refresh_token:", maskToken(oldRefreshToken))
        console.log("[API] Token来源:", refreshTokenFromCookie ? "Cookie" : "Session")

        await logRefreshTokenUsageToFile(oldRefreshToken, null, "发送刷新请求到Java后端", true)

        try {
            const deviceId = session?.user?.deviceId || "server-refresh"
            const client = createServerUrqlClient(deviceId)

            console.log("[API] 发送refreshToken mutation到后端")
            const mutationStartTime = Date.now()

            const result = await client
                .mutation(REFRESH_TOKEN_MUTATION, {
                    refreshToken: oldRefreshToken,
                })
                .toPromise()

            console.log(`[API] refreshToken mutation响应时间: ${Date.now() - mutationStartTime}ms`)

            if (result.error) {
                console.error("[API] Token刷新GraphQL错误:", result.error)
                if (result.error.message?.includes("refresh") || result.error.message?.includes("token")) {
                    console.error("[API] 可能是refresh token已被使用或无效")
                }

                await logRefreshTokenUsageToFile(oldRefreshToken, null, "刷新失败-GraphQL错误", false, result.error.message)

                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }

            if (!result.data?.refreshToken) {
                console.error("[API] Token刷新失败：无数据返回")

                await logRefreshTokenUsageToFile(oldRefreshToken, null, "刷新失败-无数据返回", false, "无数据返回")

                return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
            }

            const refreshData = result.data.refreshToken
            const newRefreshToken = refreshData.refreshToken

            console.log("[API] Token刷新成功，收到新token:")
            console.log("  - 新accessToken:", maskToken(refreshData.accessToken))
            console.log("  - 新refreshToken:", maskToken(newRefreshToken))
            console.log("  - 旧refreshToken:", maskToken(oldRefreshToken))

            await logRefreshTokenUsageToFile(oldRefreshToken, newRefreshToken, "刷新成功-收到新token", true)

            console.log("[API] 立即将新refreshToken保存到Cookie")
            //不同于：java后端在nextjs服务器离线模式下也有做个类似的 refresh_token cookie的。
            cookieStore.set("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 60,
                path: "/api/refresh-token",
            })

            console.log("[API] 开始更新session")
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

            console.log("[API] 新refreshToken已保存到Cookie和Session")

            await new Promise((resolve) => setTimeout(resolve, 100))
            console.log("[API] 持久化延迟完成")

            await logRefreshTokenUsageToFile(oldRefreshToken, newRefreshToken, "Cookie和Session更新完成", true)

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
            if (refreshError instanceof Error) {
                console.error("[API] 错误详情:", refreshError.message)
                console.error("[API] 错误堆栈:", refreshError.stack)

                await logRefreshTokenUsageToFile(oldRefreshToken, null, "刷新过程异常", false, refreshError.message)
            }
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
        }
    } catch (error) {
        console.error("[API] Token刷新API错误:", error)

        if (error instanceof Error) {
            await logRefreshTokenUsageToFile("", null, "API错误", false, error.message)
        }

        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
