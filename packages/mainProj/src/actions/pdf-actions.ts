"use server"

import type { ConfigRoot, FileTransform } from "page2pdf_server/src"

// 服务器端的认证配置 backend 模式
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:9389"
const PDF_SERVICE_TOKEN = process.env.PDF_SERVICE_TOKEN || "your-secret-token"

//走服务器途径的：都用远端部署的打印转换pdf的服务模式。 Bearer改成 Basic；
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Basic ${PDF_SERVICE_TOKEN}`,   //文书打印转换器backend模式，添加安全认证 (token 已是 Base64 编码)
}

/**
这是在 nextjs 服务器当中才能运行的代码，就不会泄露api接口的密码信息给用户一侧的。
 * #但是：@这里return { success: true, data }必须通过网络传输的，有些局限性，不是任何数据都行的。而非本地同一台电脑系统当中的普通函数之间调用上下文中的情况允许返回传输任意的数据。
 * Server Action: 提取页面书签信息
 * 
 * 注意：权限验证已移至客户端，基于报告的校核人/检验员进行判定
 */
export async function extractPageMarkAction(job: ConfigRoot<FileTransform>) {
    const startTime = Date.now()
    const requestId = `pdf_${startTime}_${Math.random().toString(36).substr(2, 9)}`

    // 审计日志：记录访问尝试（简化版，不再验证角色）
    console.log(`[AUDIT][${requestId}] PDF书签提取请求 | 时间: ${new Date().toISOString()}`)

    // 记录请求详情（脱敏）
    const jobInfo = {
        fileCount: job?.files?.length || 0,
        fileNames: job?.files?.map((f: { name?: string }) => f?.name?.substring(0, 50)).filter(Boolean) || [],
    }

    try {
        const res = await fetch(`${PDF_SERVICE_URL}/api/pageSeq`, {
            method: "POST",
            headers,
            body: JSON.stringify(job),
        })

        const duration = Date.now() - startTime

        if (!res.ok) {
            console.error(`[AUDIT][${requestId}] PDF服务请求失败 | 状态码: ${res.status} | 耗时: ${duration}ms`)
            
            // 处理 401 未授权错误
            if (res.status === 401) {
                return {
                    success: false,
                    error: "用户未登录或登录已过期，请重新登录后再试",
                    code: "UNAUTHORIZED",
                }
            }
            
            // 处理 403 禁止访问错误
            if (res.status === 403) {
                return {
                    success: false,
                    error: "您没有权限执行此操作，请联系管理员",
                    code: "FORBIDDEN",
                }
            }
            
            // 处理 500+ 服务器错误
            if (res.status >= 500) {
                return {
                    success: false,
                    error: "PDF转换服务暂时不可用，请稍后重试",
                    code: "SERVICE_UNAVAILABLE",
                }
            }
            
            return {
                success: false,
                error: `PDF服务请求失败 (HTTP ${res.status})，请稍后重试`,
                code: `HTTP_${res.status}`,
            }
        }

        const data = await res.json()
        console.log(`[AUDIT][${requestId}] PDF书签提取成功 | 耗时: ${duration}ms`)

        return { success: true, data }
    } catch (error) {
        const duration = Date.now() - startTime
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        console.error(`[AUDIT][${requestId}] PDF书签提取异常 | 耗时: ${duration}ms | 错误: ${errorMsg}`)

        return {
            success: false,
            error: "连接PDF转换服务异常，请检查前端服务器",
            code: "NETWORK_ERROR",
        }
    }
}
