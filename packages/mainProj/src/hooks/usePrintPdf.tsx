"use client"
import {useCallback, useState} from "react"
import useSWRMutation from "swr/mutation"
import {toast} from "sonner";
//直接把本地打印转换服务器的包提取数据类型：
import type { ConfigRoot, FileTransform } from "page2pdf_server/src"
import * as React from "react";
import type { OutlineData } from "@/components/pdf-outline-analyzer"
// 不再使用 Server Action，改用 API 路由


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
 * v0dev会擅自修改变成Server Action: createPrintJobAction(job: ConfigRoot<FileTransform>){fetch(`${}/api/pdf` 我这不需要！我是客户端模式的请求。绝对不能改成那样！！
 * */
export function usePrintPdf(prjob: ConfigRoot<FileTransform>):[boolean, Function?] {
    //方案: 修改SWR请求为HTTPS（需为Next.js配置HTTPS配置）；
    const { trigger, isMutating } = useSWRMutation(`${process.env.NEXT_PUBLIC_PAGE2PDF_URL}/api/pdf`, createPrintJob, {
        onSuccess: (data) => {
            const responseData = data?.data as any
            if(responseData?.result === "Success")
                toast.success(`打印转换器应答`, {
                    description: (
                        <>
                            {data?.data?.result ?? ""}
                            <br />
                            { data?.data?.dir && <>
                                生成Pdf在自己电脑的文书转换器目录的子目录:
                                <br/>{data?.data?.dir}
                             </>
                            }
                        </>
                    ),
                })
            else{
                toast.error(`打印转换器应答`, {
                    description: (
                        <>{responseData?.result ?? ""}<br/></>
                    ),
                })
            }
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

/**
 * 对后端代理转发给打印服务，提取书签信息
 * @param prjob PDF 任务配置
 * @param onSuccess 成功回调函数，用于缓存数据
 */
export function usePageMarkinfo(
    prjob: ConfigRoot<FileTransform>,
    onSuccess: (outlineData: OutlineData) => Promise<void>,
): [boolean, () => Promise<any>] {
    const [isMutating, setIsMutating] = useState(false)
    const handleSubmit = useCallback(
        async function handleSubmit() {
            if (!prjob) return null

            setIsMutating(true)
            try {
                // 使用 API 路由替代 Server Action，避免反向代理验证问题
                const response = await fetch('/api/extract-page-mark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prjob),
                })

                const result = await response.json()

                if(result.success) {
                    const responseData = result.data?.data as any
                    if(responseData?.result === "Success") {
                        toast.success(`服务端提取书签应答`, {
                            description: <>{responseData?.result}</>,
                        })
                        const newOutlineData ={outline: responseData.outline, totalPages: responseData.totalPages }
                        // 调用成功回调函数进行缓存
                        try {
                            await onSuccess(newOutlineData)
                        } catch (cacheError) {
                            console.error("缓存数据失败:", cacheError)
                            // 不影响主流程，只记录错误
                        }
                        return result.data
                    } else {
                        console.error("大纲提取失败:", responseData.result)
                        throw new Error(responseData.result)
                    }
                } else {
                    throw new Error(result.error)
                }
            } catch (error) {
                toast.error("服务端提取书签应答", {
                    description: "文书打印转换器运行错误: " + error,
                })
                throw error
            } finally {
                setIsMutating(false)
            }
        },
        [prjob, onSuccess],
    )

    if (!prjob) {
        return [isMutating, async () => null]
    }
    return [isMutating, handleSubmit]
}

/**提取书签信息 :但是使用浏览器的本机电脑的打印服务程序的；
 *确保同步做刷新页面内容的，因为onSuccess异步的不能立刻更新网页。  setCurrentOutline: React.Dispatch<React.SetStateAction<any>>
 * @param prjob  打印任务
 * @param onSuccess 回调
 * */
export function usePageMarkLocal(prjob: ConfigRoot<FileTransform>, onSuccess: (outlineData: OutlineData) => Promise<void>
): [boolean, Function?]
{
    //方案: 修改SWR请求为HTTPS（需为Next.js配置HTTPS配置）；
    const { trigger, isMutating } = useSWRMutation(`${process.env.NEXT_PUBLIC_PAGE2PDF_URL}/api/pageSeq`, createPrintJob, {
        onSuccess: async (data) => {
            const responseData = data?.data as any
            if (responseData?.result === "Success") {
                const newOutlineData = {outline: responseData.outline, totalPages: responseData.totalPages}
                // 调用成功回调函数进行缓存
                try {
                    await onSuccess(newOutlineData)
                } catch (cacheError) {
                    console.error("缓存数据失败:", cacheError)
                }
                toast.success(`本机提取书签应答`, {
                    description: (
                        <>
                            {responseData?.result ?? ""}<br/>
                            顺带生成Pdf在自己电脑的文书转换器目录的子目录:<br/>
                            {responseData?.dir ?? ""}
                        </>
                    ),
                })
            }
            else{
                toast.error(`本机提取书签应答`, {
                    description: (
                        <>
                            {responseData?.result ?? ""}<br/>
                        </>
                    ),
                })
            }
        },
        onError: (error) => {
            toast.error("本机提取书签应答", { description: "请确认文书打印转换器已经在本机安装并运行" + error })
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
