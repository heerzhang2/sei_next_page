import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

let cachedBuildInfo: { version: string; buildTime: string } | null = null

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
            buildTime: new Date().toISOString(),
        }
        return cachedBuildInfo
    }
}

export async function GET() {
    const buildInfo = getBuildInfo()

    return NextResponse.json({
        version: buildInfo.version,
        buildTime: buildInfo.buildTime,
    })
}
