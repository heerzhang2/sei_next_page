import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerUrqlClient } from "@/auth/urql"
import { canRefreshToken, markRefreshStarted } from "@/lib/token-refresh-lock"

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

const REFRESH_MUTATION = `
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

// 刷新 access token
export async function refreshAccessToken(token: any) {
    try {
        if (!canRefreshToken()) {
            console.log("[next-auth] Token刷新被跳过，距离上次刷新时间过短，防止重复刷新")
            return token // Return existing token without refreshing
        }

        if (!token.refreshToken) {
            throw new Error("No refresh token available")
        }

        markRefreshStarted()
        console.log("[next-auth] 开始刷新token")

        // 使用带设备ID的客户端
        const client = createServerUrqlClient(token.deviceId)
        const result = await client
            .mutation(REFRESH_MUTATION, {
                refreshToken: token.refreshToken,
                //不通过参数传递 deviceId，而是通过请求头传递
            })
            .toPromise()

        if (result.error) {
            console.error("Token refresh GraphQL error:", result.error)
            throw new Error("Token refresh failed")
        }
        if (!result.data?.refreshToken) {
            throw new Error("No refresh token data returned")
        }

        const refreshData = result.data.refreshToken
        console.log("[next-auth] Token 刷新成功")
        return {
            ...token,
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, //实际有效期是java后端决定的！
            user: {
                ...token.user,
                ...refreshData.user,
            },
        }
    } catch (error) {
        console.error("refreshAccessToken error:", error)
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "用户名", type: "text" },
                password: { label: "密码", type: "password" },
                deviceId: { label: "设备ID", type: "text" }, // 添加设备ID字段
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    const hashedPassword = credentials.password as string
                    const deviceId = credentials.deviceId as string

                    console.log("服务端认证请求，设备ID:", deviceId)

                    // 使用带设备ID的客户端
                    const client = createServerUrqlClient(deviceId)
                    const result = await client
                        .mutation(AUTHENTICATE_MUTATION, {
                            username: credentials.username,
                            password: hashedPassword,
                            // 不再通过参数传递 deviceId，而是通过请求头
                        })
                        .toPromise()

                    if (result.error) {
                        console.error("Authentication GraphQL error:", result.error)
                        return null
                    }

                    if (!result.data?.authenticate) {
                        return null
                    }

                    const authData = result.data.authenticate
                    return {
                        id: authData.user.id,
                        name: authData.user.name || authData.user.username,
                        email: authData.user.email,
                        accessToken: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        accessTokenExpires: authData.accessTokenExpires,
                        deviceId: deviceId, // 保存设备ID到token
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, profile }) {
            // 初次登录时，将用户信息保存到 token
            if (user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    accessTokenExpires: user.accessTokenExpires,
                    deviceId: user.deviceId, // 保存设备ID
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                }
            }
            // 检查 access token 是否即将过期（提前 1 分钟刷新）
            const { accessToken, exp, deviceId } = token
            //主动刷新的
            // const shouldRefresh = exp && Date.now() > ((exp as number) - 1 * 60) * 1000
            if (trigger === "update" || !accessToken) {
                if (!canRefreshToken()) {
                    console.log("[next-auth JWT] Token刷新被跳过，防止与urql的刷新冲突")
                    return token // Return existing token
                }

                if (!accessToken) console.log("[next-auth JWT] Token 即将过期，开始刷新... 设备ID:", deviceId)
                else console.log("[next-auth JWT] trigger==update...刷新token=> 设备ID:", deviceId)

                const refreshedToken = await refreshAccessToken(token)
                if (refreshedToken.error) {
                    console.error("Token刷新失败:", refreshedToken.error)
                    return null
                }

                const newJwt = {
                    user: {
                        ...token.user,
                    },
                    accessToken: refreshedToken.accessToken,
                    refreshToken: refreshedToken.refreshToken,
                    accessTokenExpires: refreshedToken.accessTokenExpires,
                    deviceId: token.deviceId, // 保持设备ID不变
                }
                return newJwt
            }
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
                    deviceId: token.deviceId as string, // 传递设备ID到session
                }
                // 如果有刷新错误，也传递给 session
                if (token.error) {
                    ;(session as any).error = token.error
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, //7天
    },
    secret: process.env.NEXTAUTH_SECRET,
}
