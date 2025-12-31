import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerUrqlClient } from "@/auth/urql"
import { cookies } from "next/headers"

// GraphQL mutations - 移除 deviceId 参数
const AUTHENTICATE_MUTATION = `
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password, setCookie: false) {
      accessToken
      refreshToken
      user {
        id
      }
    }
  }
`

export const authConfig: NextAuthConfig = {
    // trustHost: true, // 信任 X-Forwarded-Host 头，允许子路径部署
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "用户名", type: "text" },
                password: { label: "密码", type: "password" },
                deviceId: { label: "设备ID", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    const hashedPassword = credentials.password as string
                    const deviceId = credentials.deviceId as string
                    console.log("服务端认证请求，设备ID:", deviceId)
                    const client = createServerUrqlClient(deviceId)
                    const result = await client
                        .mutation(AUTHENTICATE_MUTATION, {
                            username: credentials.username,
                            password: hashedPassword,
                        })
                        .toPromise()

                    if (result.error) {
                        console.error("Authentication GraphQL error:", result.error)
                        // 返回一个特殊的错误对象，让 NextAuth 知道是认证失败
                        return null
                    }

                    if (!result.data?.authenticate) {
                        console.error("Authentication failed: no data returned")
                        return null
                    }

                    const authData = result.data.authenticate

                    const cookieStore = await cookies()
                    cookieStore.set("refreshToken", authData.refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "lax",
                        maxAge: 60 * 60 * 24 * 60, // 60 days
                        path: "/api/refresh-token",
                    })
                    console.log("[Login] refreshToken cookie已设置")

                    return {
                        id: authData.user.id,
                        name: authData.user.name || authData.user.username,
                        email: authData.user.email,
                        accessToken: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        accessTokenExpires: authData.accessTokenExpires,
                        deviceId: deviceId,
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Token refresh is now handled exclusively by client-side urql authExchange

            // 初次登录时，将用户信息保存到 token
            if (user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    accessTokenExpires: user.accessTokenExpires,
                    deviceId: user.deviceId,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                }
            }

            if (trigger === "update" && session?.user) {
                console.log("[next-auth JWT] 接收更新的token，合并新的refreshToken")
                return {
                    ...token,
                    accessToken: session.user.accessToken || token.accessToken,
                    refreshToken: session.user.refreshToken || token.refreshToken,
                    accessTokenExpires: session.user.accessTokenExpires || token.accessTokenExpires,
                    user: {
                        ...token.user,
                        id: session.user.id || token.user?.id,
                        name: session.user.name || token.user?.name,
                        email: session.user.email || token.user?.email,
                    },
                }
            }

            // If token is expired, client-side urql will handle the refresh
            return token
        },
        async session({ session, token }) {
            // 将 token 信息传递给 session
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.user?.id as string,
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string,
                    accessTokenExpires: token.exp as number,
                    deviceId: token.deviceId as string,
                }
                if (token.error) {
                    ;(session as any).error = token.error
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        // error: "/login", // 登录错误时重定向回登录页
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, //7天
    },
    secret: process.env.NEXTAUTH_SECRET,
}
