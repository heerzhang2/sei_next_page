"use client"
import {useCallback, useState} from "react"
import useSWRMutation from "swr/mutation"
import {toast} from "sonner";
//直接把本地打印转换服务器的包提取数据类型：
import type { ConfigRoot, FileTransform } from "page2pdf_server/src"
import * as React from "react";
import {OutlineData} from "@/components/pdf-outline-analyzer";


/**对接的打印转换器 客户机上的本地 node js server 服务
 * Chrome 访问localhost【安全告警】的消除办法：
 临时方案：Chrome启动的Command = `chrome.exe --unsafely-treat-insecure-origin-as-secure="${origin}" --user-data-dir=~/chrome-dev-profile`
 配置 Chrome 企业策略（Windows 环境）打开注册表编辑器名称: InsecurePrivateNetworkRequestsAllowed策略生效
 终极方案： 将本地PDF服务迁移到HTTPS**：- 使用自签名证书为本地服务配置HTTPS
 推荐使用Let's Encrypt免费证书： 安装Certbot;
 choco install mkcert # Windows 本地证书工具mkcert： 自定义域名
 生产环境 "dev": "next dev --https-key=key.pem --https-cert=cert.pem --hostname localhost"
 * */
const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
}

// 使用 SWR 的 fetcher 函数
async function createPrintJob(url: string, { arg }: { arg: { job: ConfigRoot<FileTransform> } }) {
    const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(arg.job),
    })

    if (!res.ok) throw new Error(res.statusText)
    return await res.json()
}

/**对接文书打印转换器，web打印构建起最终答应的pdf
 * 本文件名结尾不能使用*.ts 否则toast.success({description: 无法使用正常的组件DOM的。
 * */
export function usePrintPdf(prjob: ConfigRoot<FileTransform>):[boolean, Function?] {
    //方案: 修改SWR请求为HTTPS（需为Next.js配置HTTPS配置）；
    const { trigger, isMutating } = useSWRMutation("http://localhost:9389/api/pdf", createPrintJob, {
        onSuccess: (data) => {
            toast.success(`打印转换器应答`, {
                description: (
                    <>
                        {data?.data?.result ?? ""}
                        <br />
                        生成Pdf在自己电脑的文书转换器目录的子目录:
                        <br />
                        {data?.data?.dir ?? ""}
                    </>
                ),
            })
        },
        onError: (error) => {
            toast.error("打印转换器应答", { description: "请确认文书打印转换器已经在本机安装并运行" + error })
        },
    })

    // 修改为返回一个可以await的异步函数
    const handleSubmit = useCallback(
        async function handleSubmit() {
            if (!prjob) return null
            // 返回trigger的结果，这样外部可以await
            return await trigger({ job: prjob })
        },
        [prjob, trigger],
    )

    if (!prjob) return [isMutating, undefined]
    return [isMutating, handleSubmit]
}

/**对后端代理转发给打印服务，提取书签信息
 * */
export function usePageMarkinfo(prjob: ConfigRoot<FileTransform>)
    :[boolean, () => Promise<any>, OutlineData | null]
{
    const [outlineData, setOutlineData] = useState<OutlineData|null>(null)
    //方案: 修改SWR请求为HTTPS（需为Next.js配置HTTPS配置）； const { data, size, setSize, error, isLoading } = useSWRInfinite(
    const { trigger, isMutating } = useSWRMutation("http://localhost:9389/api/pageSeq", createPrintJob, {
        onSuccess: (data) => {
            const result =data?.data as any
            toast.success(`提取书签应答`, {
                description: (<>
                    {result?.result}
                </>),
            })
            if(result?.result==="Success") {
                setOutlineData(result.outlineData)
            } else {
                console.error("大纲提取失败:", result.result)
            }
        },
        onError: (error) => {
            toast.error("提取书签应答", { description: "文书打印转换器运行" + error })
        },
    })

    // 修改为返回一个可以await的异步函数
    const handleSubmit = useCallback(
        async function handleSubmit() {
            if (!prjob) return null
            // 返回trigger的结果，这样外部可以await
            return await trigger({ job: prjob })
        },
        [prjob, trigger],
    )

    if (!prjob) { // @ts-ignore
        return [isMutating, null, []]
    }
    return [isMutating, handleSubmit, outlineData]
}
