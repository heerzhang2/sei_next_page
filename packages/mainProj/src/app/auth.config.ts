import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createServerUrqlClient } from "@/auth/urql"

// GraphQL mutations
const AUTHENTICATE_MUTATION = `
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
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
        console.log("开始刷新 token...")

        if (!token.refreshToken) {
            throw new Error("No refresh token available")
        }

        const client = createServerUrqlClient()
        const result = await client
            .mutation(REFRESH_MUTATION, {
                refreshToken: token.refreshToken,
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
        console.log("Token 刷新成功=", refreshData)
        return {
            ...token,
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
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
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                try {
                    const hashedPassword = credentials.password as string

                    const client = createServerUrqlClient()
                    const result = await client
                        .mutation(AUTHENTICATE_MUTATION, {
                            username: credentials.username,
                            password: hashedPassword,
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
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // 初次登录时，将用户信息保存到 token
            if (user) {
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    accessTokenExpires: user.accessTokenExpires,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                }
            }
            // 检查 access token 是否即将过期（提前 5 分钟刷新）  token里面没有accessTokenExpires字段，而是用exp替代的
            const {accessToken, exp }=token
            //accessToken是JWT字符串； 该如何提取accessToken有效期的？
            const shouldRefresh = exp && Date.now() > ((exp as number) - 5 * 60) * 1000
            if (shouldRefresh || !accessToken) {
                console.log("Token 即将过期，开始刷新...")
                return await refreshAccessToken(token)
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
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
}
