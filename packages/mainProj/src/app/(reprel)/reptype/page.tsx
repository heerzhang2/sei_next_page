"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ChromeGuidePage() {
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState("")

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const chromeCommand = `chrome.exe --unsafely-treat-insecure-origin-as-secure="${origin}" --user-data-dir=~/chrome-dev-profile`

    const handleCopy = () => {
        navigator.clipboard.writeText(chromeCommand)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">目前支持的模板类型</h1>

            <p className="mb-6">
                由于Chrome的安全策略，从非HTTPS网站访问本地服务（如localhost）会被阻止。
                以下是几种解决方法，请选择最适合您的方案。
            </p>

            <Tabs defaultValue="elevator">
                <TabsList className="mb-4">
                    <TabsTrigger value="amusement">游乐设施</TabsTrigger>
                    <TabsTrigger value="boiler">锅炉</TabsTrigger>
                    <TabsTrigger value="elevator">电梯</TabsTrigger>
                </TabsList>

                <TabsContent value="amusement">
                    <Card>
                        <CardHeader>
                            <CardTitle>使用特殊启动参数</CardTitle>
                            <CardDescription>这是最简单的临时解决方案，适用于开发环境</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal pl-5 space-y-4">
                                <li>
                                  <Link href="/rep/KQcbgDF9RO21DsI92H3tTVJlcG9ydA/SLIDING_JJ/1">查阅样本报告</Link>
                                </li>
                                <li>
                                    <p>使用以下命令启动Chrome:</p>
                                    <div className="bg-slate-100 p-3 rounded-md mt-2 flex items-center justify-between">
                                        <code className="text-sm break-all">{chromeCommand}</code>
                                        <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-2 flex-shrink-0">
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </li>
                                <li>在新打开的Chrome窗口中访问您的应用</li>
                            </ol>
                        </CardContent>
                        <CardFooter>
                            <p className="text-sm text-muted-foreground">
                                注意：此方法每次都需要使用命令行启动Chrome，但不需要管理员权限；
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="boiler">
                    <Card>
                        <CardHeader>
                            <CardTitle>使用Chrome标志</CardTitle>
                            <CardDescription>通过Chrome的实验性标志禁用安全限制</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal pl-5 space-y-4">
                                <li>
                                    在Chrome地址栏中输入: <code>chrome://flags/#block-insecure-private-network-requests</code>
                                </li>
                                <li>
                                    将该选项设置为 <strong>Disabled</strong>
                                </li>
                                <li>
                                    点击底部的 <strong>Relaunch</strong> 按钮重启Chrome
                                </li>
                                <li>重新访问您的应用</li>
                            </ol>
                        </CardContent>
                        <CardFooter>
                            <p className="text-sm text-muted-foreground">
                                注意：Chrome标志可能会在未来版本中被移除，这是一个临时解决方案
                            </p>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="elevator">
                    <Card>
                        <CardHeader>
                            <CardTitle>使用企业策略</CardTitle>
                            <CardDescription>适用于企业环境的长期解决方案</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">管理员可以配置以下Chrome企业策略来允许私有网络请求:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong>InsecurePrivateNetworkRequestsAllowed</strong> - 允许所有网站
                                </li>
                                <li>
                                    <strong>InsecurePrivateNetworkRequestsAllowedForUrls</strong> - 允许特定网站
                                </li>
                            </ul>
                            <div className="mt-4">
                                <Link
                                    href="https://chromeenterprise.google/policies/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    查看Chrome企业策略文档
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <p className="text-sm text-muted-foreground">注意：此方法需要管理员权限，适合企业环境</p>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">最佳长期解决方案</h2>
                <p>最佳的长期解决方案是将您的应用迁移到HTTPS。如果您需要访问本地服务， 可以考虑以下方案:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>使用HTTPS开发环境</li>
                    <li>将本地服务也配置为使用HTTPS</li>
                    <li>使用纯前端PDF生成库替代本地服务</li>
                </ul>
            </div>

            <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                    返回应用
                </Button>
            </div>
        </div>
    )
}
