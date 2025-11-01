// /app/api/nextLive/route.ts
import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

let cachedBuildInfo: { version: string; } | null = null

function getBuildInfo() {
    if (cachedBuildInfo) {
        return cachedBuildInfo
    }

    try {
        // 尝试从 public 目录读取 build-info.json
        const buildInfoPath = join(process.cwd(), "public", "build-info.json")
        const buildInfoContent = readFileSync(buildInfoPath, "utf-8")
        cachedBuildInfo = JSON.parse(buildInfoContent)
        return cachedBuildInfo
    } catch (error) {
        // 如果文件不存在，返回默认值
        console.warn("build-info.json not found, using fallback version")
        cachedBuildInfo = {
            version: process.env.NEXT_PUBLIC_APP_VERSION || "dev",
        }
        return cachedBuildInfo
    }
}

export async function GET() {
    try {
        const buildInfo = getBuildInfo()

        const healthStatus = {
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: buildInfo?.version,
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