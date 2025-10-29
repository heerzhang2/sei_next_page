import { NextResponse } from "next/server"

export async function GET() {
    // 使用构建时间戳作为版本号
    const version = process.env.NEXT_PUBLIC_APP_VERSION || process.env.BUILD_ID || Date.now().toString()

    return NextResponse.json({
        version,
        buildTime: new Date().toISOString(),
    })
}
