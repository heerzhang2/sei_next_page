import NextAuth from "next-auth"
import type { DefaultSession } from "next-auth"
import { authConfig } from "./auth.config"

// Server-side only crypto function
export function sha256Sync(data: string): string {
    // This will only work on the server side
    if (typeof window === "undefined") {
        const { createHash } = require("node:crypto")
        return createHash("sha256").update(data).digest("hex")
    }
    // For client-side, we'll handle this differently
    throw new Error("sha256Sync should only be called on server side")
}

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
