"use client"
import { useCallback } from "react"
import useSWRMutation from "swr/mutation"
import {toast} from "sonner";
//直接把本地打印转换服务器的包提取数据类型：
import type { ConfigRoot, FileTransform } from "page2pdf_server/src"
import * as React from "react";
import {tail测仪器} from "@/report/common/view";

/**对接的打印转换器 客户机上的本地 node js server 服务
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
export function usePrintPdf(prjob: ConfigRoot<FileTransform>) {
    // 使用 useSWRMutation 代替 useMutation
    const { trigger, isMutating } = useSWRMutation("http://localhost:9389/api/pdf", createPrintJob, {
        onSuccess: (data) => {
            toast.success(`打印转换器应答`, {
                description: <>{data?.data?.result??''}<br/>生成Pdf在自己电脑的文书转换器目录的子目录:<br/>{data?.data?.dir??''}</>
                })
        },
        onError: (error) => {
         toast.error("打印转换器应答", {description: "" + error})
        },
    })
    const handleSubmit = useCallback(
        function handleSubmit() {
            if(!prjob) return
            trigger({ job: prjob })
        },
        [prjob, trigger],
    )
    if (!prjob) return [undefined]
    return [handleSubmit]
}
