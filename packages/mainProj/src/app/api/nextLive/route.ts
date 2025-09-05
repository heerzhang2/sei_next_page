import { NextResponse } from "next/server"

// export const dynamic = "force-static"
// export const revalidate = false

export async function GET() {
    try {
        // 这里可以添加更复杂的健康检查逻辑
        // 比如检查数据库连接、外部服务状态等

        const healthStatus = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || "1.0.0",
            environment: process.env.NODE_ENV || "development",
        }

        return NextResponse.json(healthStatus, {
            status: 200,
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        })
    } catch (error) {
        console.error("Health check failed:", error)

        return NextResponse.json(
            {
                status: "error",
                message: "Health check failed",
                timestamp: new Date().toISOString(),
            },
            {
                status: 503,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                },
            },
        )
    }
}
