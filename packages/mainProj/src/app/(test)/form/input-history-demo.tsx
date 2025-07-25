"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {BlobInputList} from "@/components/chub";
import {等级评定选} from "@/report/industrial/Periodical/ConcAppendix";
import {Textarea} from "@/components/ui";

export default function Component() {
    const [searchHistory, setSearchHistory] = useState<string[]>([])

    // 从 localStorage 加载搜索历史
    useEffect(() => {
        const saved = localStorage.getItem("searchHistory")
        if (saved) {
            setSearchHistory(JSON.parse(saved))
        }
    }, [])

    // 添加新的搜索记录
    const addToHistory = (value: string) => {
        if (value.trim() && !searchHistory.includes(value)) {
            const newHistory = [value, ...searchHistory.slice(0, 9)] // 保留最近10条
            setSearchHistory(newHistory)
            localStorage.setItem("searchHistory", JSON.stringify(newHistory))
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const searchValue = formData.get("search") as string
        addToHistory(searchValue)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">浏览器输入历史记录方案</h1>
                <p className="text-muted-foreground">展示多种让浏览器记住用户输入的原生方法</p>
            </div>

            {/* 方法1: 浏览器原生自动完成 */}
            <Card>
                <CardHeader>
                    <CardTitle>方法1: 浏览器原生自动完成</CardTitle>
                    <CardDescription>使用 name 属性和 autocomplete，浏览器会自动记住输入历史</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">用户名</Label>
                            <Input
                                id="username"
                                name="NNusername"
                                type="text"
                                placeholder="输入用户名"
                                autoComplete="username"
                                className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">浏览器会自动记住此字段的输入历史</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">邮箱</Label>
                            <Input
                                id="email"
                                name="shanhUemail"
                                type="email"
                                placeholder="输入邮箱"
                                autoComplete="email"
                                className="w-full"
                            />
                        </div>

                        <Button type="submit">提交</Button>
                    </form>
                </CardContent>
            </Card>

            {/* 方法2: 搜索历史 */}
            <Card>
                <CardHeader>
                    <CardTitle>方法2: 搜索输入历史</CardTitle>
                    <CardDescription>搜索框通常会被浏览器自动记住历史</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="othernotI">搜BLOB索</Label>
                            <BlobInputList id="othernotI" datalist={等级评定选}
                                           value={ "4\n和v\n4\nsdfs\nd好、了\r\n多个的" }
                                           rows={20} autoComplete="on"/>
                            <p className="text-sm text-muted-foreground">使用 type="search" 和 name="q"，浏览器通常会记住搜索历史</p>
                        </div>
                        <Button type="submit">搜索</Button>
                    </form>
                    <div className="grid grid-cols-1 gap-1">
                        <div className="space-y-2">
                            <Label htmlFor="page" className="select-text">
                                一部分文字
                            </Label>
                            <Textarea
                                rows={20}
                                id="page"
                                value={ "4\n和v\n4\nsdfs\nd好、了\r\n多个的" }
                                onChange={(e) => updateFormField(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 方法3: datalist 结合 localStorage */}
            <Card>
                <CardHeader>
                    <CardTitle>方法3: datalist + localStorage</CardTitle>
                    <CardDescription>手动管理历史记录，结合 datalist 提供选择</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search-with-history">搜索（带历史记录）</Label>
                            <Input
                                id="search-with-history"
                                name="search"
                                type="text"
                                placeholder="输入搜索关键词"
                                list="search-history"
                                className="w-full"
                            />
                            <datalist id="search-history">
                                {searchHistory.map((item, index) => (
                                    <option key={index} value={item} />
                                ))}
                            </datalist>
                            <p className="text-sm text-muted-foreground">点击输入框或输入时会显示历史记录选项</p>
                        </div>
                        <Button type="submit">搜索并记录</Button>
                    </form>

                    {searchHistory.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">当前历史记录:</h4>
                            <div className="flex flex-wrap gap-2">
                                {searchHistory.map((item, index) => (
                                    <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                    {item}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 方法4: 特定类型的自动完成 */}
            <Card>
                <CardHeader>
                    <CardTitle>方法4: 特定类型的自动完成</CardTitle>
                    <CardDescription>针对不同类型的输入使用相应的 autocomplete 值</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">电话号码</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="输入电话号码" autoComplete="tel" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organization">公司/组织</Label>
                                <Input
                                    id="organization"
                                    name="organization"
                                    type="text"
                                    placeholder="输入公司名称"
                                    autoComplete="organization"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">地址</Label>
                                <Input id="address" name="address" type="text" placeholder="输入地址" autoComplete="street-address" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">网站</Label>
                                <Input id="website" name="website" type="url" placeholder="输入网站URL" autoComplete="url" />
                            </div>
                        </div>
                        <Button type="submit">提交</Button>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* 最佳实践说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>最佳实践总结</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-medium">1. 使用正确的 name 属性</h4>
                            <p className="text-sm text-muted-foreground">浏览器根据 name 属性来识别和记住表单字段</p>
                        </div>

                        <div>
                            <h4 className="font-medium">2. 设置合适的 autocomplete 值</h4>
                            <p className="text-sm text-muted-foreground">
                                使用标准的 autocomplete 值如 "username", "email", "tel" 等
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium">3. 使用正确的 input type</h4>
                            <p className="text-sm text-muted-foreground">type="search" 对搜索框，type="email" 对邮箱等</p>
                        </div>

                        <div>
                            <h4 className="font-medium">4. 结合 datalist 提供更好的用户体验</h4>
                            <p className="text-sm text-muted-foreground">可以手动管理历史记录并通过 datalist 提供选择</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
