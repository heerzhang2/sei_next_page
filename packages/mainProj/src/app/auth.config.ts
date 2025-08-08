import { NextAuthConfig } from "next-auth"
import "next-auth/jwt"
import { JWT } from "@auth/core/jwt"
import { urqlClient } from "@/auth/urql"
import { gql } from "@urql/core"

// 令牌有效期（秒）=> 毫秒
const TOKEN_EXPIRE_SEC = Number(process.env.NEXT_PUBLIC_TOKEN_EXPIRESEC ?? "3000")
const TOKEN_EXPIRE_MS = isFinite(TOKEN_EXPIRE_SEC) ? TOKEN_EXPIRE_SEC * 1000 : 3000 * 1000
const CLOCK_SKEW_MS = 10 * 1000 // 提前 10s 刷新，避免边界抖动

export const authConfig = {
    pages: { signIn: "/login" },
    providers: [], // 你的 Providers 配置
    session: { strategy: "jwt" },
    callbacks: {
        // 受保护页面路由控制（可按需调整）
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isLoginPage = nextUrl.pathname.startsWith("/login")
            if (!isLoggedIn && !isLoginPage) return false
            return true
        },

        // 每次生成/读取 JWT 时调用，在这里做“过期检查与刷新”
        async jwt({ token, user, trigger, session }) {
            // 初次登录：将后端返回的 tokens 放入 JWT
            if (user) {
                const u = user as any
                token.accessToken = u.accessToken
                token.refreshToken = u.refreshToken
                token.accessTokenExpires = Date.now() + TOKEN_EXPIRE_MS - CLOCK_SKEW_MS
                return token
            }

            // 手动更新会话时可覆盖
            if (trigger === "update" && session) {
                const s = session as any
                if (s.accessToken) token.accessToken = s.accessToken
                if (s.refreshToken) token.refreshToken = s.refreshToken
                return token
            }

            // 访问时：若未过期，直接返回
            if (token.accessToken && typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
                return token
            }

            // 已过期：刷新
            return await refreshAccessToken(token)
        },

        // 将 JWT 中的 accessToken / refreshToken 暴露给 session
        async session({ session, token }) {
            ;(session as any).accessToken = token.accessToken
            ;(session as any).refreshToken = token.refreshToken
            return session
        },
    },
} satisfies NextAuthConfig

const REFRESH_MUTATION = gql`
  mutation refreshToken($refreshToken: String!, $userId: ID) {
    refreshToken(refreshToken: $refreshToken, userId: $userId) {
      accessToken
      refreshToken
      user {
        id
        username
      }
    }
  }
`

async function refreshAccessToken(token: JWT) {
    try {
        if (!token.refreshToken) throw new Error("No refresh token")

        const client = urqlClient(null) // 服务端用，无需客户端 headers 透传
        const resp = await client
            .mutation(REFRESH_MUTATION, {
                refreshToken: token.refreshToken,
                userId: token?.sub,
            })
            .toPromise()

        if (resp.error) throw resp.error
        const payload = (resp.data as any)?.refreshToken
        if (!payload?.accessToken) throw new Error("No access token returned")

        return {
            ...token,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken ?? token.refreshToken,
            accessTokenExpires: Date.now() + TOKEN_EXPIRE_MS - CLOCK_SKEW_MS,
            error: undefined,
        } as JWT
    } catch (err) {
        console.error("refreshAccessToken error:", err)
        // 刷新失败：让前端重登
        return { ...token, error: "RefreshAccessTokenError", accessToken: undefined } as JWT
    }
}

// 扩展类型
declare module "next-auth" {
    interface Session {
        accessToken?: string
        refreshToken?: string
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        error?: string
    }
}
