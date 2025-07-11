"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, Settings } from "lucide-react"
import { useDisplayMode } from "@/hooks/use-display-mode"

const FIELD_OPTIONS = [
    { key: "code", label: "单元编号", category: "基础" },
    { key: "rno", label: "监察编码", category: "基础" },
    { key: "name", label: "管道名称", category: "基础" },
    { key: "start", label: "起点", category: "位置" },
    { key: "stop", label: "终点", category: "位置" },
    { key: "leng", label: "长度", category: "参数" },
    { key: "proj", label: "项目", category: "基础" },
    { key: "useu", label: "使用单位", category: "基础" },
    { key: "pipe", label: "管道装置", category: "基础" },
    { key: "ust", label: "使用状态", category: "状态" },
    { key: "reg", label: "注册状态", category: "状态" },
    { key: "nxtd1", label: "下次检验日期1", category: "检验" },
    { key: "nxtd2", label: "下次检验日期2", category: "检验" },
    { key: "crDate", label: "创建日期", category: "其他" },
]

const DISPLAY_PRESETS = [
    {
        name: "基础信息",
        fields: ["code", "rno", "name", "useu", "pipe"],
    },
    {
        name: "详细信息",
        fields: ["code", "rno", "name", "start", "stop", "leng", "proj", "useu", "pipe"],
    },
    {
        name: "检验相关",
        fields: ["code", "name", "ust", "reg", "nxtd1", "nxtd2"],
    },
    {
        name: "全部字段",
        fields: FIELD_OPTIONS.map((f) => f.key),
    },
]

export function DisplayModeSelector() {
    const { displayMode, setDisplayMode, visibleFields, setVisibleFields } = useDisplayMode()
    const [selectedPreset, setSelectedPreset] = useState("基础信息")

    const handlePresetChange = (presetName: string) => {
        const preset = DISPLAY_PRESETS.find((p) => p.name === presetName)
        if (preset) {
            setVisibleFields(preset.fields)
            setSelectedPreset(presetName)
        }
    }

    const handleFieldToggle = (fieldKey: string, checked: boolean) => {
        if (checked) {
            setVisibleFields([...visibleFields, fieldKey])
        } else {
            setVisibleFields(visibleFields.filter((f) => f !== fieldKey))
        }
        // 如果手动修改了字段，清除预设选择
        setSelectedPreset("")
    }

    const groupedFields = FIELD_OPTIONS.reduce(
        (acc, field) => {
            if (!acc[field.category]) {
                acc[field.category] = []
            }
            acc[field.category].push(field)
            return acc
        },
        {} as Record<string, typeof FIELD_OPTIONS>,
    )

    return (
        <div className="flex items-center gap-2">
            {/* 显示模式切换 */}
            <div className="flex items-center border rounded-md">
                <Button
                    variant={displayMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDisplayMode("list")}
                    className="rounded-r-none"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant={displayMode === "card" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDisplayMode("card")}
                    className="rounded-l-none"
                >
                    <Grid className="h-4 w-4" />
                </Button>
            </div>

            {/* 字段显示设置 */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        显示字段
                        <Badge variant="secondary" className="ml-2">
                            {visibleFields.length}
                        </Badge>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">预设模式</label>
                            <Select value={selectedPreset} onValueChange={handlePresetChange}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="选择预设模式" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DISPLAY_PRESETS.map((preset) => (
                                        <SelectItem key={preset.name} value={preset.name}>
                                            {preset.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-4">
                            <label className="text-sm font-medium mb-3 block">自定义字段</label>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {Object.entries(groupedFields).map(([category, fields]) => (
                                    <div key={category}>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">{category}</div>
                                        <div className="space-y-2 ml-2">
                                            {fields.map((field) => (
                                                <div key={field.key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={field.key}
                                                        checked={visibleFields.includes(field.key)}
                                                        onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                                                    />
                                                    <label htmlFor={field.key} className="text-sm font-normal cursor-pointer">
                                                        {field.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
