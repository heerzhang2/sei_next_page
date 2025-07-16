"use client"
import { useSearchParams } from "next/navigation"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Label } from "@/components/ui"
import { BlobInputList, CollapsibleFormSection } from "@/components/chub"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { type FileStore, useUppyUpload } from "@/report/hook/useUppyUpload"

// 单线图对象类型
interface LineDiagramItem {
    _FILE_?: {
        name: string
        url: string
    }
    m?: string // 说明文字
}

// 编辑区域功能独立出来：避免混乱。只做图片上传的。
export const LineDiagramFile = ({ rep, children, show = false, label = "单线图-文件上传" }: InternalItemProps) => {
    const searchParams = useSearchParams()
    const lineIndexParam = searchParams?.get("lineIndex") // 从URL获取单线图序号
    const { storage, setStorage, modified, setModified } = useStorage()

    // 当前选中的单线图索引
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    // 是否为新增模式
    const [isNewMode, setIsNewMode] = useState<boolean>(false)
    // 强制更新计数器 - 用于解决上传后显示问题
    const [forceUpdate, setForceUpdate] = useState<number>(0)
    // 用于跟踪上传状态的 ref
    const uploadingRef = useRef<boolean>(false)
    // 用于跟踪最新的文件状态
    const latestFileRef = useRef<any>(null)

    // 获取当前单线图列表 - 使用 useMemo 确保引用稳定
    const currentDiagrams: LineDiagramItem[] = useMemo(() => {
        return storage.单图表 || []
    }, [storage.单图表])

    // 编辑表单状态
    const [editForm, setEditForm] = useState<{ m: string }>({ m: "" })
    // 保存初始值用于重置
    const [initialMemo, setInitialMemo] = useState<string>("")

    // 根据lineIndex参数确定编辑模式
    useEffect(() => {
        if (lineIndexParam !== null) {
            const index = Number.parseInt(lineIndexParam, 10)

            if (index >= 0 && index < currentDiagrams.length) {
                // 编辑现有单线图
                setSelectedIndex(index)
                setIsNewMode(false)
                const currentItem = currentDiagrams[index]
                const memoText = currentItem?.m || ""
                setEditForm({ m: memoText })
                setInitialMemo(memoText)
                // 更新最新文件引用
                latestFileRef.current = currentItem?._FILE_
                console.log(`编辑现有单线图: 序号${index + 1}`)
            } else if (index >= 0) {
                // 新增单线图模式
                setSelectedIndex(index) // 使用传入的索引，而不是 currentDiagrams.length
                setIsNewMode(true)
                setEditForm({ m: "" })
                setInitialMemo("")
                latestFileRef.current = null
                console.log(`新增单线图: 序号${index + 1}`)
            } else {
                console.warn(`无效的单线图索引: ${index}`)
                toast.error(`无效的单线图序号: ${index + 1}`)
                setSelectedIndex(-1)
                setIsNewMode(false)
            }
        } else {
            // 没有指定索引，默认显示列表或提示
            setSelectedIndex(-1)
            setIsNewMode(false)
            setEditForm({ m: "" })
            setInitialMemo("")
            latestFileRef.current = null
        }
    }, [lineIndexParam]) // 移除 currentDiagrams.length 作为依赖

    // 更新说明字段
    const updateMemoField = useCallback((value: string) => {
        setEditForm({ m: value })
    }, [])

    // 文件上传完成回调 - 修复问题1
    const onFinish = useCallback(
        async (upfile: any, del: boolean) => {
            if (selectedIndex < 0) {
                toast.error("请先选择要编辑的单线图")
                return
            }

            console.log(`开始处理文件${del ? "删除" : "上传"}:`, {
                selectedIndex,
                isNewMode,
                upfile,
                currentMemo: editForm.m,
            })

            uploadingRef.current = true

            // 更新最新文件引用
            latestFileRef.current = del ? null : upfile

            setStorage((prevStorage: any) => {
                const currentDiagrams = prevStorage.单图表 || []
                const newDiagrams = [...currentDiagrams]

                // 确保数组有足够的长度（新增模式）
                while (newDiagrams.length <= selectedIndex) {
                    newDiagrams.push({ m: "" })
                }

                // 更新指定索引的文件和说明文字
                const existingItem = newDiagrams[selectedIndex] || {}
                newDiagrams[selectedIndex] = {
                    ...existingItem,
                    _FILE_: del ? undefined : upfile,
                    // 保存当前的说明文字
                    m: editForm.m || existingItem.m || undefined,
                }

                console.log(`${del ? "删除" : "上传"}文件到单线图 ${selectedIndex + 1}:`, {
                    file: upfile,
                    memo: newDiagrams[selectedIndex].m,
                    isNewMode,
                    newDiagrams: newDiagrams[selectedIndex],
                })

                return {
                    ...prevStorage,
                    单图表: newDiagrams,
                }
            })

            // 延迟触发强制更新，确保 storage 更新完成
            setTimeout(() => {
                setForceUpdate((prev) => prev + 1)
                uploadingRef.current = false

                if (!modified) setModified(true)

                if (!del) {
                    toast.success(`文件上传成功到单线图 ${selectedIndex + 1}`)
                }
            }, 100)
        },
        [selectedIndex, isNewMode, editForm.m, modified, setStorage, setModified],
    )

    // 计算保存到 storage 的表单数据
    const saveForm = useMemo(() => {
        if (selectedIndex < 0) return {}

        const currentDiagrams = storage.单图表 || []
        const newDiagrams = [...currentDiagrams]

        // 确保数组有足够的长度（新增模式）
        while (newDiagrams.length <= selectedIndex) {
            newDiagrams.push({ m: "" })
        }

        // 更新指定索引的说明文字，保持文件不变
        const existingItem = newDiagrams[selectedIndex] || {}
        newDiagrams[selectedIndex] = {
            ...existingItem,
            m: editForm.m || undefined,
        }

        return {
            单图表: newDiagrams,
        }
    }, [editForm.m, storage.单图表, selectedIndex])

    // 重置函数 - 只重置说明字段，不重置文件
    const onReset = useCallback(() => {
        setEditForm({ m: initialMemo })
    }, [initialMemo])

    // 获取当前编辑的单线图数据 - 修复问题1：优先使用最新的文件状态
    const currentDiagram = useMemo(() => {
        if (selectedIndex < 0) return undefined

        const storageItem = currentDiagrams[selectedIndex]

        // 如果正在上传，使用最新的文件引用
        if (uploadingRef.current && latestFileRef.current) {
            return {
                ...storageItem,
                _FILE_: latestFileRef.current,
            }
        }

        return storageItem
    }, [selectedIndex, currentDiagrams, forceUpdate])

    // 为 useUppyUpload 准备文件对象 - 修复问题1
    const storeObj = useMemo(() => {
        // 优先使用最新的文件状态
        const file = uploadingRef.current ? latestFileRef.current : currentDiagram?._FILE_

        console.log("计算 storeObj:", {
            selectedIndex,
            isUploading: uploadingRef.current,
            latestFile: latestFileRef.current,
            currentFile: currentDiagram?._FILE_,
            finalFile: file,
            forceUpdate,
        })

        // 确保返回一个稳定的对象引用
        return file ? { name: file.name, url: file.url } : ({} as FileStore)
    }, [currentDiagram?._FILE_, forceUpdate, selectedIndex])

    // 验证函数
    const onVerify = useCallback(
        (values: any) => {
            if (selectedIndex < 0) return false

            const currentDiagrams = values.单图表 || []
            const obj = currentDiagrams[selectedIndex] || {}

            if (!obj.m && !obj._FILE_) {
                toast.warning(`该序号单线图对象即将删除${selectedIndex + 1}，但请注意：编辑器自动切换新排序的序号的内容`)
            }
            return true
        },
        [selectedIndex],
    )

    // 使用 useUppyUpload - 修复问题1：确保每次状态变化都重新创建
    const [uploadDom] = useUppyUpload({
        repId: rep?.id!,
        maxFile: 1,
        onFinish,
        storeObj,
        liveDays: 10,
        hash: `LineDiagram_${selectedIndex}_${forceUpdate}_${Date.now()}`, // 添加时间戳确保唯一性
        id: `LineDiagram_${selectedIndex}_${forceUpdate}_${Date.now()}`,
    })

    const [render] = useFrameEditorBar({
        rep,
        values: { ...saveForm },
        onVerify,
        onReset,
    })

    // 如果没有选择单线图，显示提示
    if (selectedIndex < 0) {
        return (
            <CollapsibleFormSection title={label!} defaultOpen={show}>
                <Card className="py-4">
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">要指定要编辑的单线图序号，才能用</p>
                        <p className="text-sm text-muted-foreground mt-2">当前共有 {currentDiagrams.length} 个单线图</p>
                    </CardContent>
                </Card>
            </CollapsibleFormSection>
        )
    }

    return (
        <CollapsibleFormSection title={label!} defaultOpen={show}>
            <div className="w-full m-auto">
                <Card className="py-1 gap-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
              <span>
                {isNewMode ? "新增" : "编辑"}单线图 #{selectedIndex + 1}
              </span>
                        </CardTitle>
                        {isNewMode && <p className="text-sm text-muted-foreground">这是一个新的单线图，上传文件后将自动创建</p>}
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        {/* 说明字段编辑 */}
                        <Card className="mt-1 border-l-4 border-l-blue-500 gap-1 py-1">
                            <CardContent className="space-y-2 px-2">
                                <div className="space-y-2">
                                    <Label htmlFor="memojt" className="select-text">
                                        说明文字：
                                    </Label>
                                    <BlobInputList
                                        className="w-full min-h-[8rem] resize-y"
                                        id="memojt"
                                        value={editForm.m || ""}
                                        onChange={(val) => updateMemoField(val)}
                                        placeholder="输入单线图的说明文字..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 文件上传区域 */}
                        <div className="space-y-2">
                            <Label>单线图文件：</Label>
                            {uploadDom}
                        </div>

                        {/* 当前状态显示 */}
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• 文件状态: {currentDiagram?._FILE_?.name ? `已上传 ${currentDiagram._FILE_.name}` : "未上传"}</p>
                            <p>• 模式: {isNewMode ? "新增模式" : "编辑模式"}</p>
                            <p>• 更新计数: {forceUpdate}</p>
                            <p>• 正在上传: {uploadingRef.current ? "是" : "否"}</p>
                            <p>• 最新文件: {latestFileRef.current?.name || "无"}</p>
                        </div>

                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <p>注意：</p>
                            <p>• 文件上传不能用重置按钮撤销，需手动删除</p>
                            <p>• 重置按钮只会重置说明文字，不会影响已上传的文件</p>
                            <p>• 保存按钮会同时保存说明文字和确认文件上传</p>
                        </div>

                        {children}
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
            </div>
        </CollapsibleFormSection>
    )
}
