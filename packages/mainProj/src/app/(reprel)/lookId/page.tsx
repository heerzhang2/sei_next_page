"use client"

import {useCallback, useState} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toGlobalId, fromGlobalId, generateUUID } from "@/lib/global-id"
import useSWRMutation from "swr/mutation";
import {toast} from "sonner";
import * as React from "react";
import {getAuthToken} from "@/lib/auth-token";

const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
}

// 使用 SWR 的 fetcher 函数
async function createPrintJob(url: string, { arg }: any ) {
    const token = await getAuthToken()
    const res = await fetch(url, {
        method: "POST",
        headers: {
            ...headers,
            ...({
                Authorization: `Bearer ${token}`,
            }),
        },
        credentials: 'include', // 包含cookies
        body: JSON.stringify(arg.job),
    })
    if (!res.ok){
        const ack=await res.json()
        throw new Error(ack.message)
    }
    return await res.json()
}
function usePageMarkLocal(prjob: { type: string, id: string }, onSuccess: (outlineData: string) => Promise<void>
): [boolean, Function?]
{
    //方案: 修改SWR请求为HTTPS（需为Next.js配置HTTPS配置）；
    const { trigger, isMutating } = useSWRMutation(`${process.env.NEXT_PUBLIC_BACK_END}/adminUse/uuid2gid`, createPrintJob, {
        onSuccess: async (data) => {
            if (data?.success) {
                const newOutlineData = ' '
                // 调用成功回调函数进行缓存
                try {
                    await onSuccess(data?.globalId)
                } catch (cacheError) {
                    console.error("缓存数据失败:", cacheError)
                }
                toast.success(`本机提取书签应答`, {
                    description: (
                        <>
                            {data?.result ?? ""}<br/>
                        </>
                    ),
                })
            }
            else{
                toast.error(`本机提取书签应答`, {
                    description: (
                        <>
                            {data?.result ?? ""}<br/>
                        </>
                    ),
                })
            }
        },
        onError: (error) => {
            toast.error("应答", { description: "" + error })
        },
    })

    // 修改为返回一个可以await的异步函数
    const handleSubmit = useCallback(
        async function handleSubmit() {
            if (!prjob) return null
            //createPrintJob传递arg: {  job: prjob }
            return await trigger({ job: prjob } as any)
        },
        [prjob, trigger],
    )

    if (!prjob) return [isMutating, undefined]
    return [isMutating, handleSubmit]
}

export default function GlobalIdConverter() {
    const [type, setType] = useState("Report")
    const [uuid, setUuid] = useState("1234567890123456")
    const [globalId, setGlobalId] = useState("")
    const [parseResult, setParseResult] = useState<{ modelType: string; uuidID: string } | null>(null)
    const [error, setError] = useState("")
    const handleCacheSuccess = async (outlineData: string) => {
            setGlobalId(outlineData)
    }
    const pdf_job={type:type, id:uuid}
    const [localGetMarking, doGenerate] = usePageMarkLocal(pdf_job, handleCacheSuccess)
    const [loading, setLoading] = useState(false)
    const testApi = async (method: string) => {
        setLoading(true)
        try {
            const options: RequestInit = {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            }

            if (method !== "GET" && method !== "DELETE") {
                // options.body = requestBody
            }
            //代理后端接口的做法，#注意！！ 不是直接发请求到java后端的！需传递2个服务端的。
            const res = await fetch(`/report/api/gid2uuid/${globalId}`, options)
            const data = await res.json()
            return data
        } catch (error) {
            return(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }
    const handleGenerate = () => {
        try {
            setError("")
            doGenerate!()
        } catch (err) {
            setError(`生成错误: ${err}`)
        }
    }

    const handleParse = async () => {
        try {
            setError("")
            const result = await testApi("GET")
            setParseResult({ modelType: result?.modelType, uuidID: result?.uuidID })
        } catch (err) {
            setError(`解析错误: ${err}`)
        }
    }

    const handleGenerateUUID = () => {
        setUuid(generateUUID())
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>GraphQL Global ID 转换器</CardTitle>
                    <CardDescription>将类型和UUID转换为GraphQL Global ID，支持编码和解码</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 生成Global ID */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">生成 Global ID</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">类型 (Type)</Label>
                                <Input
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="例如: Teacher, Student"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="uuid">实体的ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="uuid"
                                        value={uuid}
                                        onChange={(e) => setUuid(e.target.value)}
                                        placeholder="Long类型ID，例如：1234567890123456"
                                    />
                                    <Button onClick={handleGenerateUUID} variant="outline" size="sm">
                                        生成
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleGenerate} className="w-full">
                            生成 Global ID
                        </Button>

                        {globalId && (
                            <div className="space-y-2">
                                <Label>生成的 Global ID</Label>
                                <Textarea value={globalId} readOnly className="font-mono text-sm" rows={3} />
                            </div>
                        )}
                    </div>

                    <hr />

                    {/* 解析Global ID */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">解析 Global ID</h3>

                        <div className="space-y-2">
                            <Label htmlFor="parseInput">Global ID</Label>
                            <Textarea
                                id="parseInput"
                                value={globalId}
                                onChange={(e) => setGlobalId(e.target.value)}
                                placeholder="输入要解析的 Global ID"
                                className="font-mono text-sm"
                                rows={3}
                            />
                        </div>

                        <Button onClick={handleParse} className="w-full bg-transparent" variant="outline">
                            解析 Global ID
                        </Button>

                        {parseResult && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>解析出的类型</Label>
                                    <Input value={parseResult.modelType} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label>解析出的ID (Long)</Label>
                                    <Input value={parseResult.uuidID} readOnly />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}

                    {/* 示例说明 */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">编码规则说明</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• 前8字节：Long ID（大端序）</li>
                            <li>• 8-15字节：填充0</li>
                            <li>• 后续字节：类型名称的UTF-8编码</li>
                            <li>• 整体使用Base64编码生成最终的Global ID</li>
                            <li>• 用于GraphQL Relay规范的全局唯一标识符</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
