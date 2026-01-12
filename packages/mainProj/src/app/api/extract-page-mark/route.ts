import type { ConfigRoot } from "page2pdf_server/src"
import { NextResponse } from "next/server"

// 服务器端的认证配置 backend 模式
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:9389"
const PDF_SERVICE_TOKEN = process.env.PDF_SERVICE_TOKEN || "your-secret-token"

// 走服务器途径的：都用远端部署的打印转换pdf的服务模式。 Bearer改成 Basic
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${PDF_SERVICE_TOKEN}`,
}

/**
 * API 路由：提取页面书签信息
 * POST /api/extract-page-mark
 */
export async function POST(request: Request) {
    try {
        const job: ConfigRoot = await request.json()

        const res = await fetch(`${PDF_SERVICE_URL}/api/pageSeq`, {
            method: "POST",
            headers,
            body: JSON.stringify(job),
        })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        return NextResponse.json({
            success: true,
            data,
        })
    } catch (error) {
        console.error("Extract page mark failed:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
