"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
    const [userId, setUserId] = useState("user001")
    const [inputValue, setInputValue] = useState("user001")

    const handleChangeUser = () => {
        setUserId(inputValue)
    }

    const quickSelect = (id: string) => {
        setInputValue(id)
        setUserId(id)
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* 用户ID选择器 */}
            <Card>
                <CardHeader>
                    <CardTitle>用户ID选择器</CardTitle>
                    <CardDescription>选择要查看的用户ID，组件会自动从缓存加载对应数据</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="userId">用户ID</Label>
                            <Input
                                id="userId"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="输入用户ID"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleChangeUser}>切换用户</Button>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">快速选择:</span>
                        {["user001", "user002", "user003", "user004", "user005", "user006", "user007", "admin"].map((id) => (
                            <Button
                                key={id}
                                variant={userId === id ? "default" : "outline"}
                                size="sm"
                                onClick={() => quickSelect(id)}
                            >
                                {id}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 缓存组件 */}
        </div>
    )
}
