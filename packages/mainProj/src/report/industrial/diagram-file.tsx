//src/report/industrial/diagram-file.tsx
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
import {useOfflineUppyUpload} from "@/report/hook/useOfflineUppyUpload";

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
    // 添加一个 ref 来跟踪上次的 lineIndex，用于检测变化
    const prevLineIndexRef = useRef<string | null>(null)

    // 强制更新计数器 - 用于解决上传后显示问题
    const [forceRerender, setForceRerender] = useState<number>(0)
    // 获取当前单线图列表 - 使用 useMemo 确保引用稳定
    const currentDiagrams: LineDiagramItem[] = useMemo(() => {
        return storage.单图表 || []
    }, [storage.单图表]) // 添加 forceRerender 作为依赖以在需要时强制更新
    // }, [storage.单图表, forceRerender]) // 添加 forceRerender 作为依赖

    // 编辑表单状态
    const [editForm, setEditForm] = useState<{ m: string; }>({ m: "", })
    // 保存初始值用于重置
    const [initialMemo, setInitialMemo] = useState<string>("")

    // 根据lineIndex参数确定编辑模式
    useEffect(() => {
        if (lineIndexParam !== null) {
            const index = Number.parseInt(lineIndexParam, 10)
            // 检查 lineIndex 是否发生变化，如果是，则需要重置状态
            if (prevLineIndexRef.current !== lineIndexParam) {
                // lineIndex 发生变化，需要重置组件状态
                setForceRerender(prev => prev + 1) // 触发重新渲染
                prevLineIndexRef.current = lineIndexParam
            }

            if (index >= 0 && index < currentDiagrams.length) {
                // 编辑现有单线图
                setSelectedIndex(index)
                setIsNewMode(false)
                const currentItem = currentDiagrams[index]
                const memoText = currentItem?.m || ""
                setEditForm({ m: memoText, })
                setInitialMemo(memoText)
                // console.log(`编辑现有单线图: 序号${index + 1}`)
            } else if (index >= 0) {
                // 新增单线图模式，因为新加单线图点击进入必须初始化空对象【毛病】强制提醒已修改，临时对象单线图多一个的导致折叠区可能多一个。
                setSelectedIndex(currentDiagrams.length)
                setIsNewMode(true)
                setEditForm({ m: "", })
                setInitialMemo("")
                // console.log(`新增单线图: 序号${index + 1}`)
            } else {
                // console.warn(`无效的单线图索引: ${index}`)
                toast.error(`无效的单线图序号: ${index + 1}`)
                setSelectedIndex(-1)
                setIsNewMode(false)
            }
        } else {
            // 没有指定索引，默认显示列表或提示
            setSelectedIndex(-1)
            setIsNewMode(false)
            setEditForm({ m: "",  })
            setInitialMemo("")
        }
    }, [lineIndexParam, currentDiagrams.length])    // 添加 currentDiagrams.length 作为依赖

    // 在现有的 useEffect 后添加一个新的 useEffect 来处理对象初始化
    useEffect(() => {
        if (selectedIndex >= 0) {
            const currentDiagrams = storage.单图表 || []
            // 如果选中的索引超出当前数组长度，或者对应位置没有对象，则初始化
            if (selectedIndex >= currentDiagrams.length || !currentDiagrams[selectedIndex]) {
                setStorage((prevStorage: any) => {
                    const newDiagrams = [...(prevStorage.单图表 || [])]
                    // 确保数组有足够的长度，并初始化空对象
                    while (newDiagrams.length <= selectedIndex) {
                        newDiagrams.push({ m: "", })
                    }
                    // 如果对应位置是 null 或 undefined，初始化为空对象
                    if (!newDiagrams[selectedIndex]) {
                        newDiagrams[selectedIndex] = { m: "", }
                    }
                    // console.log(`初始化单线图对象 ${selectedIndex + 1}:`, newDiagrams[selectedIndex])

                    return {
                        ...prevStorage,
                        单图表: newDiagrams,
                    }
                })
                // 标记为已修改
                if (!modified)  setModified!(true)
            }
        }
    }, [selectedIndex, setStorage, modified, setModified, storage.单图表])

    // 更新说明字段
    const updateMemoField = useCallback((value: string) => {
        setEditForm((prev) => ({ ...prev, m: value }))
    }, [])

    // 文件上传完成回调 - 优化状态更新逻辑
    const onFinish = useCallback(
        async (upfile: any, newUpload: boolean) => {
            if (selectedIndex < 0) {
                toast.error("请先选择要编辑的单线图")
                return
            }
            setStorage((prevStorage: any) => {
                const currentDiagrams = prevStorage.单图表 || []
                const newDiagrams = [...currentDiagrams]
                // 确保数组有足够的长度（新增模式）
                while (newDiagrams.length <= selectedIndex) {
                    newDiagrams.push({ m: "", })
                }
                // 更新指定索引的文件，保持说明文字和文本高度
                const existingItem = newDiagrams[selectedIndex] || {}
                newDiagrams[selectedIndex] = {
                    ...existingItem,
                    _FILE_: upfile,
                    // 如果是新增模式，同时保存当前的说明文字和文本高度
                    m: isNewMode ? editForm.m || existingItem.m : existingItem.m,
                }

                return {
                    ...prevStorage,
                    单图表: newDiagrams,
                }
            })
            // 强制触发重新渲染
            // setForceRerender((prev) => prev + 1)
            if (!modified)  setModified!(true)
            if (newUpload) {
                toast.success(`文件上传成功到单线图 ${selectedIndex + 1}`)
            }
        },
        [selectedIndex, isNewMode, editForm.m, modified, setStorage, setModified],
    )
    //【汇集编辑后的状态】 计算保存到 storage 的表单数据
    const saveForm = useMemo(() => {
        if (selectedIndex < 0) return {}
        const currentDiagrams = storage.单图表 || []
        const newDiagrams = [...currentDiagrams]
        // 确保数组有足够的长度（新增模式）
        while (newDiagrams.length <= selectedIndex) {
            newDiagrams.push({ m: "", })
        }
        // 更新指定索引的说明文字和文本高度，保持文件不变
        const existingItem = newDiagrams[selectedIndex] || {}
        newDiagrams[selectedIndex] = {
            ...existingItem,
            m: editForm.m || undefined,
        }

        return {
            单图表: newDiagrams,
        }
    }, [editForm.m, storage.单图表, selectedIndex])

    // 重置函数 - 重置说明字段和文本高度，不重置文件
    const onReset = useCallback(() => {
        setEditForm({ m: initialMemo, })
    }, [initialMemo, ])

    // 修改 curDiagram 的 useMemo
    const curDiagram = useMemo(() => {
        const diagrams = storage.单图表 || []
        return selectedIndex >= 0 ? diagrams[selectedIndex] : undefined
    }, [selectedIndex, storage.单图表, forceRerender])
    // }, [selectedIndex, storage.单图表, forceRerender])

    // 为 useUppyUpload 准备文件对象 - 使用 useMemo 确保引用稳定
    const storeObj = useMemo(() => {
        const file = curDiagram?._FILE_
        // 确保返回一个稳定的对象引用
        return file ? { name: file.name, url: file.url,mimeType: file.mimeType} : ({} as FileStore)
    }, [curDiagram?._FILE_, forceRerender])
    // }, [curDiagram?._FILE_, forceRerender])

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

    // 添加调试日志
    console.log(`[DiagramFile] selectedIndex: ${selectedIndex}, lineIndexParam: ${lineIndexParam}, currentDiagrams.length: ${currentDiagrams.length}`)
    
    // 修复：当 lineIndex 变化时，使用 forceRerender 来重新创建 hook 实例
    // 只有当 selectedIndex 有效时才使用 hook
    const [uploadDom] = useOfflineUppyUpload({
        repId: rep?.id!,
        hash: `LineDiagram_${selectedIndex}`,
        id: `LineDiagram_${selectedIndex}-${rep?.id}`,
        storeObj,
        maxFile: 1,
        liveDays: 10,
        // hash: `LineDiagram_${selectedIndex}_${forceRerender}`,
        business: "rep",
        onFinish,
    })

    const [render] = useFrameEditorBar({
        rep,
        transformValues: () => ({ ...saveForm }),
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
        <CollapsibleFormSection
            title={label!}
            defaultOpen={show}
            key={`linediagram-${lineIndexParam}`} // 添加 key 以在 lineIndex 变化时重新创建整个组件
        >
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
                                        onChange={(val) => updateMemoField(val as unknown as string)}
                                        placeholder="输入单线图的说明文字..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        {/* 文件上传区域 */}
                        <div key={`LineDiagram_${lineIndexParam}-${rep?.id}`} className="space-y-2">
                            <span>单线图文件：</span>
                            {uploadDom}
                        </div>

                        {/* 当前状态显示 */}
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• 文件状态: {curDiagram?._FILE_?.name ? `已上传 ${curDiagram._FILE_.name}` : "未上传"}</p>
                        </div>
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <p>注意：</p>
                            <p>• 文件上传不能用重置按钮撤销，需手动删除</p>
                            <p>• 重置按钮会重置说明文字，不会影响已上传的文件</p>
                            <p>• 保存按钮会同时保存说明文字、和确认文件上传</p>
                        </div>
                        {children}
                    </CardContent>
                    <CardFooter className="flex flex-col justify-end border-t px-2 !pt-1 gap-2">{render()}</CardFooter>
                </Card>
            </div>
        </CollapsibleFormSection>
    )
}