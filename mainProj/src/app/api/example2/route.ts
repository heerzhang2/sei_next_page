import { type NextRequest, NextResponse } from "next/server"
import { setNoCacheHeaders } from "@/lib/no-cache"

/*来自问题：
npm start 运行生产版本后发现：在电脑的chrome浏览器刷新页面无法获取最新的后端数据，需要chrome手动清理数据后才能更新页面数据。但是iPhone手机chrome浏览器就没有这个毛病。原来npm dev 运行环境情况下也没发现这个问题。
* */
export async function GET(request: NextRequest) {
  // 创建响应
  const response = NextResponse.json({
    message: "This is an example API route",
    timestamp: new Date().toISOString(),
  })

  // 设置禁用缓存的响应头
  setNoCacheHeaders(response.headers)

  return response
}
