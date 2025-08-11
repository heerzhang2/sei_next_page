import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Client, cacheExchange, fetchExchange } from "@urql/core"
import {gql} from "@urql/core";

// Server-side crypto function
function sha256Sync(data: string): string {
    const { createHash } = require("node:crypto")
    return createHash("sha256").update(data).digest("hex")
}

const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken,refreshToken, user{id } }
    }
`;

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/user")
            const isOnProfile = nextUrl.pathname.startsWith("/profile")
            const isOnRep = nextUrl.pathname.startsWith("/rep")

            if (isOnDashboard || isOnProfile || isOnRep) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return true
            }

            return true
        },
        jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.accessTokenExpires = user.accessTokenExpires
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string,
                    accessTokenExpires: token.accessTokenExpires as number,
                }
            }
            return session
        },
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }

                try {
                    // Hash the password on the server side
                    const hashedPassword = sha256Sync(credentials.password as string)
                    const endpoint = process.env.NEXT_PUBLIC_BACK_END || "http://localhost:8673"
                    const url = `${endpoint}/graphql`
                    const client = new Client({
                        url: url,
                        exchanges: [cacheExchange, fetchExchange],
                    })

                    console.log("Attempting GraphQL authentication with:", {
                        username: credentials.username,
                        hashedPassword: hashedPassword,
                    })

                    const result = await client
                        .mutation(LOGIN_MUTATION, {
                            username: credentials.username,
                            password: hashedPassword,
                        })
                        .toPromise()

                    console.log("GraphQL authentication result:", result)

                    if (result.error) {
                        console.error("GraphQL authentication error:", result.error)
                        return null
                    }

                    if (result.data?.authenticate) {
                        const { accessToken, refreshToken, user } = result.data.authenticate

                        return {
                            id: user.id,
                            name: user.name || user.username,
                            email: user.email,
                            accessToken,
                            refreshToken,
                            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
                        }
                    }

                    return null
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
} satisfies NextAuthConfig
