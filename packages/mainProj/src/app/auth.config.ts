import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@urql/core"
import { fetchExchange } from "urql"

const endpoint = process.env.NEXT_PUBLIC_BACK_END || ""
const url = `${endpoint}/graphql`

// GraphQL mutations
const AUTHENTICATE_MUTATION = `
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        username
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
        name
        email
        username
      }
    }
  }
`

// 创建服务端 URQL 客户端
function createServerClient() {
    return createClient({
        url,
        exchanges: [fetchExchange],
    })
}

// Server-side crypto function
function sha256Sync(data: string): string {
    if (typeof window === "undefined") {
        const { createHash } = require("node:crypto")
        return createHash("sha256").update(data).digest("hex")
    }
    throw new Error("sha256Sync should only be called on server side")
}

// 刷新 access token
async function refreshAccessToken(token: any) {
    try {
        console.log("开始刷新 token...")

        if (!token.refreshToken) {
            throw new Error("No refresh token available")
        }

        const client = createServerClient()
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
        console.log("Token 刷新成功")

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
                    // Hash the password on the server side
                    const hashedPassword = sha256Sync(credentials.password as string)

                    const client = createServerClient()
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
                        accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
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

            // 检查 access token 是否即将过期（提前 5 分钟刷新）
            const shouldRefresh =
                token.accessTokenExpires && Date.now() > (token.accessTokenExpires as number) - 5 * 60 * 1000

            if (shouldRefresh) {
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
                    accessTokenExpires: token.accessTokenExpires as number,
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
