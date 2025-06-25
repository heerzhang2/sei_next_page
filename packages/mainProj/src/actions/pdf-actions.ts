"use server"

import type { ConfigRoot, FileTransform } from "page2pdf_server/src"

// 服务器端的认证配置
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:9389"
const PDF_SERVICE_TOKEN = process.env.PDF_SERVICE_TOKEN || "your-secret-token"

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${PDF_SERVICE_TOKEN}`, // 在服务器端安全地添加认证
}

// Server Action: 创建打印任务
export async function createPrintJobAction(job: ConfigRoot<FileTransform>) {
    try {
        const res = await fetch(`${PDF_SERVICE_URL}/api/pdf`, {
            method: "POST",
            headers,
            body: JSON.stringify(job),
        })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error("Print job failed:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}

// Server Action: 提取页面书签信息
export async function extractPageMarkAction(job: ConfigRoot<FileTransform>) {
    try {
        const res = await fetch(`${PDF_SERVICE_URL}/api/pageSeq`, {
            method: "POST",
            headers,
            body: JSON.stringify(job),
        })

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        return { success: true, data }
    } catch (error) {
        console.error("Extract page mark failed:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}
