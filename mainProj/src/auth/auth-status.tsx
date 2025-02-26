"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthStatus() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError") {
            // If we have a refresh token error, sign the user out
            router.push("/api/auth/signout")
        }
    }, [session, router])

    if (!session) {
        return <div>@-#     Not signed in</div>
    }

    return (
        <div>
            @-#  Signed in as {session.user?.email}
            <br />
            Access Token: {session.accessToken?.slice(0, 20)}...
        </div>
    )
}
