import { NextResponse } from "next/server"
import { auth } from "@/app/auth"

// 依赖 NextAuth jwt 回调自动刷新。如已过期，会在 auth() 内触发 refresh。
export async function POST() {
    const session = await auth()

    if (!session?.user || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ accessToken: (session as any).accessToken })
}
