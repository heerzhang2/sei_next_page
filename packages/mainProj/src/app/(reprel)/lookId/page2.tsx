"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**@Deprecated
 * 后台维护工具 gid转换，使用后端api的方式。
* */
export default function ApiTestPage() {
    const [globalId, setGlobalId] = useState("ajHsj9GMRL6wzZ-QJAz7zElzcA")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)
    const [requestBody, setRequestBody] = useState("{}")

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
                options.body = requestBody
            }

            const res = await fetch(`/api/gid2uuid/${globalId}`, options)
            const data = await res.json()
            setResponse(JSON.stringify(data, null, 2))
        } catch (error) {
            setResponse(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const testListApi = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/teacher")
            const data = await res.json()
            setResponse(JSON.stringify(data, null, 2))
        } catch (error) {
            setResponse(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Next.js API 代理测试</CardTitle>
                    <CardDescription>测试转发到后端 API 的请求</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="globalId">Global ID</Label>
                        <Input
                            id="globalId"
                            value={globalId}
                            onChange={(e) => setGlobalId(e.target.value)}
                            placeholder="输入 Global ID"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requestBody">请求体 (JSON)</Label>
                        <Textarea
                            id="requestBody"
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            placeholder="输入 JSON 请求体"
                            rows={4}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => testApi("GET")} disabled={loading} variant="outline">
                            GET 请求
                        </Button>
                        <Button onClick={() => testApi("POST")} disabled={loading} variant="outline">
                            POST 请求
                        </Button>
                        <Button onClick={() => testApi("PUT")} disabled={loading} variant="outline">
                            PUT 请求
                        </Button>
                        <Button onClick={() => testApi("DELETE")} disabled={loading} variant="outline">
                            DELETE 请求
                        </Button>
                        <Button onClick={testListApi} disabled={loading} variant="default">
                            获取列表
                        </Button>
                    </div>

                    {loading && <div className="text-center text-muted-foreground">请求中...</div>}

                    {response && (
                        <div className="space-y-2">
                            <Label>响应结果</Label>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{response}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
