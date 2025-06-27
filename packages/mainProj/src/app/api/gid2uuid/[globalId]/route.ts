import { type NextRequest, NextResponse } from "next/server"
import {auth} from "@/app/auth";

const BACKEND_BASE_URL =`${process.env.NEXT_PUBLIC_BACK_END}/teacher/globalId`

/**
这个是代理后端接口的做法。{二传手复制的模式}：第二代前端不能直接访问该后端api了
* */
export async function GET(request: NextRequest, { params }: { params: { globalId: string } }) {
    try {
        const { globalId } = params
        const url = `${BACKEND_BASE_URL}/${globalId}`
        //不能直接用const token = await getAuthToken() 它只能在浏览器端用的，服务端不能调用自己本机api？ fetch('/api/refresh-token'；
        const session = await auth();
        // 返回当前有效的访问令牌
        const token = (session?.user as any)?.accessToken
        if(!session?.user || !token) {
            return NextResponse.json(
                { error: "没登token", status: 401 },
                { status: 401 },
            )
        }
        // 转发请求到后端
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // 转发原始请求的一些头部信息
                ...({
                    Authorization: `Bearer ${token}`,
                }),
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: "Backend request failed", status: response.status },
                { status: response.status },
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("API proxy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
