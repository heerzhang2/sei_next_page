import NextAuth from "next-auth"
import type { DefaultSession } from "next-auth"
import { authConfig } from "./auth.config"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user?: {
            id: string
            accessToken?: string
            refreshToken?: string
            accessTokenExpires?: number
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
    }
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(authConfig)
