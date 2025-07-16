"use client"
import { useSearchParams } from "next/navigation"
import type { InternalItemProps } from "../common/base"
import { useStorage } from "@/report/StorageContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Label } from "@/components/ui"
import { BlobInputList, CollapsibleFormSection } from "@/components/chub"
import { useFrameEditorBar } from "@/report/hook/useFormFramework"
import {useCallback, useState, useEffect, useMemo} from "react"
import { toast } from "sonner"
import {FileStore, useUppyUpload} from "@/report/hook/useUppyUpload"

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

    // 获取当前单线图列表
    const currentDiagrams: LineDiagramItem[] = storage.单图表 || []
    // 编辑表单状态
    const [editForm, setEditForm] = useState<{ m: string }>({ m: "" })
    //【简易， 单一字段，特例！】 保存初始值用于重置
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
                console.log(`编辑现有单线图: 序号${index + 1}`)
            } else if (index >= 0) {
                // 新增单线图模式：
                setSelectedIndex(currentDiagrams.length)
                setIsNewMode(true)
                setEditForm({ m: "" })
                setInitialMemo("")
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
        }
    }, [lineIndexParam])

    //【特例：只有单一个字段的，没用复合结构的状态对象】 更新说明字段
    const updateMemoField = useCallback(
        (value: any ) => {
            setEditForm({ m: value })
        },
        [],
    )

    // 文件上传完成回调
    const onFinish = useCallback(
        async (upfile: any, del: boolean) => {
            if (selectedIndex < 0) {
                toast.error("请先选择要编辑的单线图")
                return
            }
            setStorage((prevStorage: any) => {
                const currentDiagrams = prevStorage.单图表 || []
                const newDiagrams = [...currentDiagrams]
                if (isNewMode) {
                    // 新增模式：确保数组有足够的长度
                    while (newDiagrams.length <= selectedIndex) {
                        newDiagrams.push({ m: "" })
                    }
                }
                // 更新指定索引的文件
                if (newDiagrams[selectedIndex]) {
                    newDiagrams[selectedIndex] = {
                        ...newDiagrams[selectedIndex],
                        _FILE_: del ? undefined : upfile,
                    }
                } else {
                    // 如果索引位置不存在，创建新对象
                    newDiagrams[selectedIndex] = {
                        _FILE_: del ? undefined : upfile,
                        m: editForm.m || "",
                    }
                }
                // console.log(`${del ? "删除" : "上传"}文件到单线图 ${selectedIndex + 1}:`, upfile)
                return {
                    ...prevStorage,
                    单图表: newDiagrams,
                }
            })

            if (!modified) setModified(true)
            if (!del) {
                toast.success(`文件上传成功到单线图 ${selectedIndex + 1}`)
            }
        },
        [selectedIndex, isNewMode, editForm.m, modified, setStorage, setModified],
    )
    // const saveMemoToStorage = useCallback(() => {
    //     setStorage((prevStorage: any) => {
    //         const currentDiagrams = prevStorage.单图表 || []
    //         const newDiagrams = [...currentDiagrams]
    //         if (isNewMode) {
    //         return {
    //             ...prevStorage,
    //             单图表: newDiagrams,
    //         }
    //     })
    // }, [editForm.m, selectedIndex, isNewMode])

    //【表当中某一行】的编辑操作，没有使用useForm做法的：表格的某一行必须在这里做变更控制的setEditForm那些字段。
    const saveForm = useMemo(() => {
        if(selectedIndex < 0) return
        const currentDiagrams = storage.单图表 || []
        const newDiagrams = [...currentDiagrams]
        if (isNewMode) {
            // 新增模式：确保数组有足够的长度
            while (newDiagrams.length <= selectedIndex) {
                newDiagrams.push({ m: "" })
            }
        }
        // 更新指定索引的： 修改旧数据
        if (newDiagrams[selectedIndex]) {
            newDiagrams[selectedIndex] = {
                ...newDiagrams[selectedIndex],
                m: editForm.m || undefined,
            }
        } else {
            // 如果索引位置不存在，创建新对象
            newDiagrams[selectedIndex] = {
                m: editForm.m || undefined,
            }
        }

        return {
            //...prevStorage, 更多变量
            单图表: newDiagrams,
        }
    }, [editForm.m, storage.单图表, selectedIndex, isNewMode])

    // 重置函数 - 只重置说明字段，不重置文件
    const onReset = useCallback(() => {
        setEditForm({ m: initialMemo })
        // toast.info("已重置说明字段")
    }, [initialMemo])

    // 获取当前编辑的单线图数据
    const currentDiagram = selectedIndex >= 0 && !isNewMode ? currentDiagrams[selectedIndex] : undefined
    const currentFile = currentDiagram?._FILE_
    // 为 useUppyUpload 准备文件对象
    const storeObj = currentFile || {}  as FileStore
    const [uploadDom] = useUppyUpload({
        repId: rep?.id!,
        maxFile: 1,
        onFinish,
        storeObj,
        liveDays: 10,
        hash: `LineDiagram_${selectedIndex}`,
        id: `LineDiagram_${selectedIndex}`,
    })
    const onVerify = useCallback((values: any) => {
        if(selectedIndex < 0)   return false
        const currentDiagrams = values.单图表 || []
        const obj=currentDiagrams[selectedIndex] || {}
        if(!obj.m && !obj._FILE_) {
            toast.warning(`该序号单线图对象即将删除${selectedIndex + 1}，但请注意：编辑器自动切换新排序的序号的内容`)
        }
        return true
    }, [selectedIndex, editForm.m, isNewMode])

    //【很特别】针对表格一行的编辑：删除空行？
    const [render] = useFrameEditorBar({rep, values: { ...saveForm },onVerify, onReset,})

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
                                        onChange={(val) => updateMemoField(val ) }
                                        placeholder="输入单线图的说明文字..."
                                    />
                                </div>
                            {/*       <Button type="button" variant="outline" size="sm" onClick={saveMemoToStorage}>
                                    保存说明
                                </Button>*/}
                            </CardContent>
                        </Card>

                        {/* 文件上传区域 */}
                        <div className="space-y-2">
                            <Label>单线图文件：</Label>
                            {uploadDom}
                        </div>
                        {/* 当前状态显示 */}
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• 文件状态: {currentFile?.name ? `已上传 ${currentFile.name}` : "未上传"}</p>
                            <p>• 模式: {isNewMode ? "新增模式" : "编辑模式"}</p>
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
