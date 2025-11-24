// useOfflineUppyUpload.tsx
"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useUppyUpload, type FileStore, type PendingDeleteOperation } from "./useUppyUpload"
import { fileOperationsQueue, generateUppyStateKey } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Upload, FolderOpen, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { stripOrigin } from "@/lib/utils"

// 检查浏览器是否支持 File System Access API
const isFileSystemAccessSupported = () => {
    return typeof window !== "undefined" && "showOpenFilePicker" in window
}
// 验证文件权限
async function verifyPermission(fileHandle: FileSystemFileHandle, readWrite = false) {
    const options: any = { mode: readWrite ? "readwrite" : "read" }
    try {
        // 检查当前权限状态
        let permission = await fileHandle.queryPermission(options)
        console.log(`[OfflineUppy] Current permission: ${permission}`)
        if (permission === "granted") {
            return true
        }
        // 请求权限
        permission = await fileHandle.requestPermission(options)
        console.log(`[OfflineUppy] Requested permission: ${permission}`)
        return permission === "granted"
    } catch (error) {
        console.error("[OfflineUppy] Error verifying permission:", error)
        return false
    }
}

// 选择文件并获取句柄（专门用于文件句柄模式）
const selectFilesWithHandles = async (): Promise<Array<{
    handle: FileSystemFileHandle
    fileName: string
    fileType: string
    size: number
    lastModified: number
}> | null> => {
    if (!isFileSystemAccessSupported()) {
        toast.error("浏览器不支持文件系统访问 API")
        return null
    }

    try {
        // 使用 showOpenFilePicker 让用户选择文件
        const handles = await (window as any).showOpenFilePicker({
            multiple: true,
            types: [
                {
                    description: "All Files",
                    accept: { "*/*": [] },
                },
            ],
        })

        if (handles.length === 0) {
            return null
        }

        const fileHandles = await Promise.all(
            handles.map(async (handle: FileSystemFileHandle) => {
                // 验证权限
                const hasPermission = await verifyPermission(handle, false)
                if (!hasPermission) {
                    throw new Error("用户未授予文件访问权限")
                }

                const file = await handle.getFile()
                return {
                    handle,
                    fileName: file.name,
                    fileType: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                }
            }),
        )

        return fileHandles
    } catch (error) {
        // 用户取消选择不是错误
        if (error instanceof DOMException && error.name === "AbortError") {
            console.log("用户取消了文件选择")
        } else {
            console.warn("Failed to select files with handles:", error)
            toast.error("选择文件失败", {
                description: "无法访问所选文件，请确保授予了必要的权限",
            })
        }
        return null
    }
}

// 从文件句柄恢复 File 对象
const restoreFileFromHandle = async (fileHandleData: any): Promise<File | null> => {
    //ds自动生成的.handle 有缺陷啊，需改成.fileHandle
    if (!fileHandleData?.fileHandle) {
        console.warn("[OfflineUppy] No file handle provided")
        return null
    }
    try {
        console.log("[OfflineUppy] Verifying file handle permissions...")

        // 验证权限 ds重复犯同一个错误:自动生成的.handle 需改成.fileHandle
        const hasPermission = await verifyPermission(fileHandleData.fileHandle)
        if (!hasPermission) {
            console.warn("[OfflineUppy] No permission to access saved file handle")
            // 尝试重新请求权限
            try {
                //ds生成的.handle 需改成.fileHandle
                const permission = await fileHandleData.fileHandle.requestPermission({ mode: "read" })
                if (permission !== "granted") {
                    console.warn("[OfflineUppy] User denied permission after re-request")
                    return null
                }
            } catch (permissionError) {
                console.error("[OfflineUppy] Error requesting permission:", permissionError)
                return null
            }
        }
        console.log("[OfflineUppy] Getting file from handle...")
        const file = await fileHandleData.fileHandle.getFile()
        if (!file) {
            console.warn("[OfflineUppy]句柄恢复无效的？")
            return null
        }
        console.log("[OfflineUppy] Successfully restored file from handle:", file.name, file.size, file.type)
        return file
    } catch (error) {
        console.error("[OfflineUppy] Failed to restore file from handle:", error)
        return null
    }
}

// 辅助函数：将 ArrayBuffer 转换回 File 对象
const arrayBufferToFile = (
    arrayBuffer: ArrayBuffer,
    fileName: string,
    fileType: string,
    lastModified?: number,
): File => {
    const blob = new Blob([arrayBuffer], { type: fileType })
    return new File([blob], fileName, {
        type: fileType,
        lastModified: lastModified || Date.now(),
    })
}

// 将 File 转换为 ArrayBuffer
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}
// 专门通过文件句柄方式添加文件到 Uppy
const addFilesWithHandlesToUppy = async (
    uppy: Uppy,
    repId: string,
    business: string,
    liveDays: number,
): Promise<number> => {
    if (!isFileSystemAccessSupported()) {
        toast.error("浏览器不支持文件系统访问API、句柄方式添加文件")
        return 0
    }
    const fileHandles = await selectFilesWithHandles()
    if (!fileHandles || fileHandles.length === 0) return 0

    let addedCount = 0

    for (const fileHandle of fileHandles) {
        try {
            const file = await fileHandle.handle.getFile()

            // 创建符合 Uppy 要求的文件对象 - 修复：添加 isHandleMode 字段
            const fileToAdd = {
                id: `file-handle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                name: fileHandle.fileName,
                type: fileHandle.fileType,
                data: file,
                size: fileHandle.size,
                meta: {
                    fileHandle: fileHandle.handle, // 保存文件句柄
                    relativePath: "",
                    lastModified: fileHandle.lastModified,
                    eid: repId,
                    business,
                    liveDays,
                    isHandleMode: true, //句柄模式
                },
            }

            // 使用 Uppy 的 addFile 方法
            const result = uppy.addFile(fileToAdd)

            if (result) {
                addedCount++
                console.log(`[FileHandle] Successfully added file to Uppy:`, fileHandle.fileName, {
                    isHandleMode: true, // 确认标记成功
                })
            } else {
                console.error(`[FileHandle] Failed to add file to Uppy:`, fileHandle.fileName)
                toast.error(`添加文件失败: ${fileHandle.fileName}`)
            }
        } catch (error) {
            console.error("Failed to add file with handle:", fileHandle.fileName, error)
            toast.error(`添加文件失败: ${fileHandle.fileName}`)
        }
    }

    return addedCount
}
// 获取当前页面URL用于恢复
const getCurrentPageUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.href
    }
    return ""
}
// 提取的文件恢复逻辑函数
const restoreFileFromSnapshot = async (
    fileData: any,
    uppyInstance: Uppy,
    repId: string,
    business: string,
    liveDays: number,
    snapshotMeta: any,
): Promise<{ restored: boolean; fromHandle: boolean }> => {
    try {
        console.log(`[OfflineUppy] Processing file: ${fileData.name}`, {
            hasHandle: !!fileData.fileHandle,
            isHandleMode: fileData.isHandleMode,
            hasData: !!fileData.data,
            hasFileMeta: !!fileData.meta,
        })

        // 加强重复检查
        const existingFiles = uppyInstance.getFiles()
        const isDuplicate = existingFiles.some(
            (file) =>
                file.name === fileData.name &&
                file.size === fileData.size &&
                // 额外检查：如果文件已经成功上传，则视为重复
                (file.progress?.uploadComplete || file.progress?.percentage === 100),
        )

        if (isDuplicate) {
            console.log(`[OfflineUppy] 跳过重复文件（已成功上传）: ${fileData.name}`)
            toast.warning("跳过重复文件", {
                description: `文件 "${fileData.name}" 已成功上传，跳过恢复`,
            })
            return { restored: false, fromHandle: false }
        }

        let fileToRestore: File | null = null
        let fromHandle = false

        // 优先从文件句柄恢复（文件句柄模式）
        if (fileData.fileHandle && fileData.isHandleMode) {
            console.log(`[OfflineUppy] Attempting to restore from handle: ${fileData.name}`)

            try {
                fileToRestore = await restoreFileFromHandle(fileData)
                console.log(`[OfflineUppy] Handle restoration result for ${fileData.name}:`, {
                    success: !!fileToRestore,
                    fileType: fileToRestore?.type,
                    fileSize: fileToRestore?.size,
                })
            } catch (handleError) {
                console.error(`[OfflineUppy] Handle restoration error for ${fileData.name}:`, handleError)
                return { restored: false, fromHandle: false }
            }

            if (fileToRestore) {
                fromHandle = true
                console.log("[OfflineUppy] Successfully restored file from handle:", fileData.name)

                // 修复：使用文件自身的 meta，不展开 snapshotMeta（避免包含 pendingDeleteOperations）
                const fileMeta = fileData.meta || {}
                const fileToAdd = {
                    id: fileData.id || `file-handle-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    name: fileData.name,
                    type: fileData.type,
                    data: fileToRestore,
                    size: fileData.size,
                    meta: {
                        // 只使用文件自身的 meta，不包含快照的顶层 meta
                        ...fileMeta,
                        fileHandle: fileData.fileHandle, // 保持文件句柄
                        relativePath: fileMeta.relativePath || "",
                        lastModified: fileMeta.lastModified || fileData.lastModified || Date.now(),
                        eid: fileMeta.eid || repId,
                        business: fileMeta.business || business,
                        liveDays: fileMeta.liveDays || liveDays,
                        isHandleMode: true, // 明确标记为句柄模式
                        // 不包含 pendingDeleteOperations
                    },
                }

                try {
                    // 先检查是否已存在相同文件
                    const existingFiles = uppyInstance.getFiles()
                    const isDuplicate = existingFiles.some((file) => file.name === fileData.name && file.size === fileData.size)
                    if (isDuplicate) {
                        console.log(`文件已存在列表中: ${fileData.name}`)
                        return { restored: false, fromHandle: true }
                    }
                    const result = uppyInstance.addFile(fileToAdd)
                    if (result) {
                        console.log(`[OfflineUppy] Successfully added file handle to Uppy: ${fileData.name}`)
                        return { restored: true, fromHandle: true }
                    } else {
                        console.error(`[OfflineUppy] Uppy addFile returned false for: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                } catch (addError: any) {
                    // 捕获 Uppy 的重复文件错误
                    if (addError.message && addError.message.includes("不允许添加")) {
                        console.warn(`[OfflineUppy] Duplicate file detected: ${fileData.name}`)
                        toast.warning("重复文件", {
                            description: `文件 "${fileData.name}" 已存在，跳过恢复`,
                        })
                        return { restored: false, fromHandle: true }
                    }
                    console.error(`[OfflineUppy] Failed to add file to Uppy: ${fileData.name}`, addError)
                    return { restored: false, fromHandle: false }
                }
            } else {
                console.warn(`[OfflineUppy] File handle restoration returned null for: ${fileData.name}`)
                return { restored: false, fromHandle: false }
            }
        }
        // 传统模式恢复
        else if (!fileData.isHandleMode && fileData.data) {
            console.log(`[OfflineUppy] Attempting traditional restore: ${fileData.name}`)

            if (fileData.data instanceof File) {
                fileToRestore = fileData.data
            } else if (fileData.data instanceof ArrayBuffer) {
                try {
                    fileToRestore = arrayBufferToFile(fileData.data, fileData.name, fileData.type, fileData.lastModified)
                } catch (error) {
                    console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer, falling back to File:", error)
                    fileToRestore = fileData.data
                }
            }

            if (fileToRestore) {
                // 修复：使用文件自身的 meta
                const fileMeta = fileData.meta || {}
                const fileToAdd = {
                    id: fileData.id,
                    name: fileData.name,
                    type: fileData.type,
                    data: fileToRestore,
                    size: fileData.size,
                    meta: {
                        // 只使用文件自身的 meta
                        ...fileMeta,
                        relativePath: fileMeta.relativePath || "",
                        lastModified: fileMeta.lastModified || fileData.lastModified || Date.now(),
                        eid: fileMeta.eid || repId,
                        business: fileMeta.business || business,
                        liveDays: fileMeta.liveDays || liveDays,
                        isHandleMode: false,
                        // 不包含 pendingDeleteOperations
                    },
                }
                try {
                    const existingFiles = uppyInstance.getFiles()
                    const isDuplicate = existingFiles.some((file) => file.name === fileData.name && file.size === fileData.size)
                    if (isDuplicate) {
                        console.log(`文件已存在列表中: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                    const result = uppyInstance.addFile(fileToAdd)
                    if (result) {
                        console.log(`[OfflineUppy] Successfully added traditional file to Uppy: ${fileData.name}`)
                        return { restored: true, fromHandle: false }
                    } else {
                        console.error(`[OfflineUppy] Uppy addFile returned false for traditional file: ${fileData.name}`)
                        return { restored: false, fromHandle: false }
                    }
                } catch (addError: any) {
                    // 捕获 Uppy 的重复文件错误
                    if (addError.message && addError.message.includes("不允许添加")) {
                        console.warn(`[OfflineUppy] Duplicate file detected: ${fileData.name}`)
                        toast.warning("重复文件", {
                            description: `文件 "${fileData.name}" 已存在，跳过恢复`,
                        })
                        return { restored: false, fromHandle: false }
                    }
                    console.error(`[OfflineUppy] Failed to add traditional file to Uppy: ${fileData.name}`, addError)
                    return { restored: false, fromHandle: false }
                }
            }
        } else {
            console.warn(`[OfflineUppy] File cannot be restored - no valid data: ${fileData.name}`, {
                hasHandle: !!fileData.fileHandle,
                isHandleMode: fileData.isHandleMode,
                hasData: !!fileData.data,
                hasMeta: !!fileData.meta,
            })
        }
    } catch (error) {
        console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
    }

    return { restored: false, fromHandle: false }
}

export function useOfflineUppyUpload(params: {
    repId: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, newUpload: boolean) => void
    hash?: string
    id?: string
    business?: string
    modType?: string
    redId?: number
    subrid?: string
}) {
    const { repId, subrid, redId, hash, onFinish } = params
    const stateKey = generateUppyStateKey(repId, subrid, redId, hash)
    console.log(`[OfflineUppy] Generated stateKey: ${stateKey}`)

    // 添加状态来存储恢复的待删除操作
    const [restoredPendingDeletes, setRestoredPendingDeletes] = useState<PendingDeleteOperation[]>([])

    // 检查是否有保存的状态
    const [hasSavedState, setHasSavedState] = useState(false)

    // 检查是否应该开启 uppy 面板
    const [shouldOpenUppy, setShouldOpenUppy] = useState(false)

    // 检查是否有下一条待处理操作
    const [hasNextPendingOperation, setHasNextPendingOperation] = useState(false)

    // 使用 ref 来存储最新的 storeObj 值，避免闭包问题
    const latestStoreObjRef = useRef<FileStore | FileStore[]>(params.storeObj)

    // 更新 ref 当 storeObj 变化时
    useEffect(() => {
        latestStoreObjRef.current = params.storeObj
    }, [params.storeObj])

    // 检查保存状态的函数
    const checkSavedState = useCallback(async () => {
        try {
            console.log(`[OfflineUppy] Checking saved state for key: ${stateKey}`)
            const snapshot = await fileOperationsQueue.loadUppyState(stateKey)
            console.log(`[OfflineUppy] Found snapshot:`, snapshot ? `yes, ${snapshot.files?.length || 0} files` : "no")
            setHasSavedState(!!snapshot)

            // 如果有快照，检查并恢复其中的待删除操作（排除已成功处理的）
            if (snapshot?.meta?.pendingDeleteOperations) {
                console.log(
                    `[OfflineUppy] Found ${snapshot.meta.pendingDeleteOperations.length} pending delete operations in snapshot`,
                )
                // 过滤掉可能已经成功处理的删除操作
                // 这里我们保守地恢复所有操作，让用户手动处理重复的情况
                // 因为无法从 IndexedDB 中得知哪些操作已经成功执行
                setRestoredPendingDeletes(snapshot.meta.pendingDeleteOperations)
            } else {
                setRestoredPendingDeletes([])
            }

            // 检查是否应该开启 uppy 面板
            if (snapshot?.files && snapshot.files.length > 0) {
                const hasIncompleteUploads = snapshot.files.some(
                    (file) => !(file.progress?.uploadComplete || file.progress?.percentage === 100),
                )
                console.log(
                    `[OfflineUppy] Uppy panel should open: ${hasIncompleteUploads} (${snapshot.files.length} files, ${hasIncompleteUploads ? "some incomplete" : "all complete"})`,
                )
                setShouldOpenUppy(hasIncompleteUploads)
            } else {
                console.log(`[OfflineUppy] Uppy panel should open: false (no files in snapshot)`)
                setShouldOpenUppy(false)
            }

            // 检查是否有下一条待处理操作
            await checkNextPendingOperation()
        } catch (error) {
            console.error("[OfflineUppy] Failed to check saved state:", error)
            setShouldOpenUppy(false)
            setHasNextPendingOperation(false)
        }
    }, [stateKey, checkNextPendingOperation])

    // 初始化时检查保存状态
    useEffect(() => {
        checkSavedState()
    }, [checkSavedState])

    // 只有当：1. 所有待删除操作已完成 2. 所有文件上传已完成 时，才清理状态
    const checkAndClearState = useCallback(async () => {
        try {
            // 获取当前的 Uppy 实例和文件状态
            const uppy = uppyInstanceRef.current
            if (!uppy) return

            const currentFiles = uppy.getFiles()
            // 检查是否有未完成的文件
            const hasIncompleteFiles = currentFiles.some(
                (file) => !(file.progress?.uploadComplete || file.progress?.percentage === 100),
            )

            // 获取当前的待删除操作
            // 注意：这里需要检查 restoredPendingDeletes 和 pendingDeleteOperationsRef (如果能访问到的话)
            // 由于 pendingDeleteOperations 是从 useUppyUpload 返回的，我们可以直接使用它
            // 但为了安全起见，我们假设如果 restoredPendingDeletes 为空，且 pendingDeleteOperations 也为空（或者我们认为已同步）

            // 在 executePendingDeletions 中，我们会更新 restoredPendingDeletes
            // 在 onFinishWrapped 中，我们会调用此函数

            // 我们需要一个方式来获取最新的 pendingDeleteOperations，这里依赖于组件重渲染时的值
            // 或者我们可以传入 overrideDeletes 参数

            // 简单起见，我们检查 restoredPendingDeletes，因为这是离线模块主要关心的
            // 如果用户正在操作，useUppyUpload 的 pendingDeleteOperations 也会同步更新

            // 实际上，executePendingDeletions 的逻辑是：优先使用 restoredPendingDeletes，如果没有则使用 pendingDeleteOperations
            // 只要这两者之一还有值，就不应该清理

            // 我们不能直接访问 pendingDeleteOperations 的最新值（在闭包中），除非我们使用 ref
            // 但我们可以检查 hasSavedState，如果 database 里有记录，我们需要谨慎

            // 重新读取一次数据库状态可能最准确，但这有性能开销
            // 这里我们主要依赖内存状态：

            // 如果还有文件未上传完成，直接返回
            if (hasIncompleteFiles) {
                console.log(`[OfflineUppy] CheckState: Has incomplete files, skipping clear.`)
                return
            }

            // 检查待删除操作
            // 如果我们刚执行完删除，restoredPendingDeletes 应该已经更新（或者即将更新）
            // 这里我们做一个稍微宽松的检查：如果当前组件状态认为没有待删除操作
            if (restoredPendingDeletes.length > 0) {
                console.log(`[OfflineUppy] CheckState: Has restored pending deletes, skipping clear.`)
                return
            }

            // 执行清理
            console.log(`[OfflineUppy] CheckState: All clear (No incomplete files, no pending deletes). Clearing DB...`)
            await fileOperationsQueue.removeUppyState(stateKey)
            setHasSavedState(false)
            setRestoredPendingDeletes([])
            toast.info("状态已自动清理", {
                description: "所有上传和删除操作均已完成",
            })
        } catch (error) {
            console.error("[OfflineUppy] CheckState error:", error)
        }
    }, [stateKey, restoredPendingDeletes])

    //将恢复的待删除操作传递给 父类hook：useUppyUpload
    const {
        uploadDom,
        uppyInstance,
        pendingDeleteOperations,
        delOssFileFunc,
        cancelPendingOperations,
        removePendingDeleteOperations,
    } = useUppyUpload({
        ...params,
        onFinish: (file, newUpload) => {
            // 调用原始的 onFinish
            if (onFinish) {
                onFinish(file, newUpload)
            }

            // 延迟执行检查，确保状态更新
            setTimeout(() => {
                checkAndClearState()
            }, 500)
        },
        open: shouldOpenUppy,
        stateKey,
        externalPendingDeletes: restoredPendingDeletes,
    })

    const uppyInstanceRef = useRef<Uppy | null>(null)
    const pendingDeleteOperationsRef = useRef<any[]>([])

    // 更新 ref 以获取最新的 pendingDeleteOperations
    useEffect(() => {
        pendingDeleteOperationsRef.current = pendingDeleteOperations
    }, [pendingDeleteOperations])

    useEffect(() => {
        if (uppyInstance) {
            uppyInstanceRef.current = uppyInstance
        }
    }, [uppyInstance])
    // 保存 Uppy 当前状态（统一的手动保存），确保包含当前的待删除操作
    const saveUppyState = useCallback(
        async (uppy: Uppy) => {
            if (!uppy) {
                toast.error("Uppy 实例未初始化")
                return
            }

            // 获取所有文件
            const allFiles = uppy.getFiles()

            // 待删除的文件应该被保留，因为它们不属于已完成上传的范畴
            const files = allFiles.filter((file) => {
                // 检查多种完成标记，确保正确识别已完成的文件
                const isCompletedByProgress =
                    file.progress?.uploadComplete && file.progress?.percentage === 100 && file.response?.uploadURL

                // 检查特殊标记（优先级更高，因为这是上传成功后立即标记的）
                const isCompletedByMark = file.meta?.uploadCompletedMark === true

                // 只要任一条件满足就认为已完成
                const isCompleted = isCompletedByProgress || isCompletedByMark

                if (isCompleted) {
                    const reason = isCompletedByMark ? "特殊标记" : "进度检查"
                    console.log(`[OfflineUppy] 排除已成功上传文件: ${file.name} (${reason})`)
                }
                return !isCompleted // 只排除已完成的，待删除的文件会被保留
            })

            const currentPendingDeletes = pendingDeleteOperationsRef.current

            // 如果没有待上传文件且没有待删除操作，清理 IndexedDB 状态
            if (files.length === 0 && currentPendingDeletes.length === 0) {
                try {
                    // 清理 IndexedDB 中的状态数据
                    await fileOperationsQueue.removeUppyState(stateKey)
                    console.log(`[OfflineUppy] Cleared IndexedDB state for key: ${stateKey}`)
                    setHasSavedState(false)
                    setRestoredPendingDeletes([])

                    toast.info("状态已清理", {
                        description: "当前没有需要保存的文件状态，已清理本地存储",
                    })
                } catch (error) {
                    console.error("[OfflineUppy] Failed to clear IndexedDB state:", error)
                    toast.error("清理失败", {
                        description: "无法清理本地存储状态",
                    })
                }
                return
            }

            // 修改：在提示信息中显示排除的文件数量
            const excludedCount = allFiles.length - files.length
            if (excludedCount > 0) {
                toast.info(`排除了 ${excludedCount} 个已成功上传的文件`)
            }
            const filesWithData = await Promise.all(
                files.map(async (file) => {
                    try {
                        // 关键修复：优先检查文件是否原本就是句柄模式
                        const isHandleMode = file.meta?.fileHandle && file.meta?.isHandleMode
                        if (isHandleMode) {
                            // 文件句柄模式：保存句柄引用
                            return {
                                id: file.id,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                fileHandle: file.meta.fileHandle, // 保存文件句柄
                                lastModified: file.meta.lastModified || file.data?.lastModified,
                                progress: file.progress?.percentage || 0,
                                uploadURL: file.uploadURL,
                                isHandleMode: true, // 明确标记为句柄模式
                                // 修复：只保存文件自身的 meta，不包含 pendingDeleteOperations
                                meta: {
                                    fileHandle: file.meta.fileHandle,
                                    lastModified: file.meta.lastModified,
                                    eid: file.meta.eid,
                                    business: file.meta.business,
                                    liveDays: file.meta.liveDays,
                                    isHandleMode: true,
                                    // 不包含 pendingDeleteOperations
                                },
                            }
                        } else {
                            // 传统模式：根据文件大小优化存储策略
                            let fileData: ArrayBuffer | File | undefined
                            let useArrayBuffer = false

                            if (file.size < 3 * 1024 * 1024) {
                                fileData = file.data
                            } else if (file.size <= 20 * 1024 * 1024) {
                                try {
                                    fileData = await fileToArrayBuffer(file.data)
                                    useArrayBuffer = true
                                } catch (error) {
                                    console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer, falling back to File:", error)
                                    fileData = file.data
                                }
                            } else {
                                fileData = file.data
                            }

                            return {
                                id: file.id,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: fileData,
                                lastModified: file.data?.lastModified,
                                progress: file.progress?.percentage || 0,
                                uploadURL: file.uploadURL,
                                isHandleMode: false, // 明确标记为非句柄模式
                                useArrayBuffer,
                                // 修复：只保存必要的文件 meta
                                meta: {
                                    lastModified: file.data?.lastModified,
                                    eid: file.meta?.eid,
                                    business: file.meta?.business,
                                    liveDays: file.meta?.liveDays,
                                    isHandleMode: false,
                                    // 不包含 pendingDeleteOperations
                                },
                            }
                        }
                    } catch (error) {
                        console.error("[OfflineUppy] Failed to process file for saving:", file.name, error)
                        toast.error(`处理文件失败: ${file.name}`)
                        return null
                    }
                }),
            ).then((results) => results.filter(Boolean))

            // 保存 Uppy 状态到 IndexedDB，包含待删除操作数组
            try {
                // 修复：确保 files 是数组类型
                const filesArrayForSave = Array.isArray(filesWithData) ? filesWithData : Object.values(filesWithData)

                const uppyState = {
                    key: stateKey,
                    repId,
                    subrid,
                    hash: hash || "default",
                    timestamp: Date.now(),
                    files: filesArrayForSave, // 确保是数组
                    meta: {
                        // 只保存顶层的 meta，不包含文件级别的 meta
                        originalPageUrl: getCurrentPageUrl(),
                        modType: params.modType,
                        redId: params.redId,
                        business: params.business,
                        liveDays: params.liveDays,
                        maxFile: params.maxFile,
                        maxSize: params.maxSize,
                        // 更新待删除操作数组，移除 deleteIndex
                        pendingDeleteOperations: currentPendingDeletes.map((op) => ({
                            deleteUrl: op.deleteUrl,
                            repId: op.repId,
                            hash: op.hash,
                            business: op.business,
                            timestamp: op.timestamp,
                        })),
                    },
                }

                console.log(`[OfflineUppy] Saving Uppy state with key: ${stateKey}`, {
                    files: filesArrayForSave.length,
                    filesType: Array.isArray(filesArrayForSave) ? "array" : typeof filesArrayForSave,
                    pendingDeletes: currentPendingDeletes.length,
                    excludedCompleted: excludedCount,
                })

                await fileOperationsQueue.saveUppyState(uppyState)

                const fileCount = filesArrayForSave.length
                const handleModeCount = filesArrayForSave.filter((f) => f.isHandleMode).length
                const deleteCount = currentPendingDeletes.length

                console.log(
                    `[OfflineUppy] Saved state: ${stateKey}, ${fileCount} pending files (${handleModeCount} with handles), ${deleteCount} pending deletes, ${excludedCount} completed files excluded`,
                )

                toast.success("保存成功", {
                    description: `已保存 ${fileCount} 个待上传文件（${handleModeCount} 个使用文件句柄）、${deleteCount} 个待删除操作的状态，排除了 ${excludedCount} 个已成功上传的文件`,
                    duration: 3000,
                })

                // 重要：保存后立即重新检查状态，确保 restoredPendingDeletes 更新
                await checkSavedState()

                // 更新保存状态
                setHasSavedState(true)
            } catch (error) {
                console.error("[OfflineUppy] Failed to save Uppy state:", error)
                toast.error("保存失败", {
                    description: "无法保存文件状态到本地存储",
                })
            }
        },
        [
            repId,
            subrid,
            hash,
            params.modType,
            params.redId,
            params.business,
            params.liveDays,
            params.maxFile,
            params.maxSize,
            stateKey,
            checkSavedState,
        ],
    )

    // 检查是否有下一条待处理操作
    const checkNextPendingOperation = useCallback(async () => {
        try {
            const allGroups = await fileOperationsQueue.getGroupedUppyStates()
            
            // 找到当前分组
            const currentGroup = allGroups.find(
                (group) => group.repId === repId && (group.subrid === subrid || (!group.subrid && !subrid)),
            )

            if (!currentGroup || currentGroup.snapshots.length <= 1) {
                setHasNextPendingOperation(false)
                return
            }

            // 按时间戳排序，找到当前快照的下一个
            const sortedSnapshots = currentGroup.snapshots.sort((a, b) => a.timestamp - b.timestamp)
            
            // 找到当前快照的索引（基于时间戳匹配）
            const currentSnapshotIndex = sortedSnapshots.findIndex(
                (snapshot) => snapshot.key === stateKey
            )

            if (currentSnapshotIndex === -1) {
                setHasNextPendingOperation(false)
                return
            }

            // 检查是否有下一个快照
            const nextIndex = currentSnapshotIndex + 1
            setHasNextPendingOperation(nextIndex < sortedSnapshots.length)
        } catch (error) {
            console.error("[OfflineUppy] Failed to check next pending operation:", error)
            setHasNextPendingOperation(false)
        }
    }, [repId, subrid, stateKey])

    //跳转到下一条待处理离线操作
    const navigateToNextPendingOperation = useCallback(async () => {
        try {
            const allGroups = await fileOperationsQueue.getGroupedUppyStates()
            
            // 找到当前分组
            const currentGroup = allGroups.find(
                (group) => group.repId === repId && (group.subrid === subrid || (!group.subrid && !subrid)),
            )

            if (!currentGroup) {
                toast.error("找不到当前分组")
                return
            }

            // 按时间戳排序，找到当前快照的下一个
            const sortedSnapshots = currentGroup.snapshots.sort((a, b) => a.timestamp - b.timestamp)
            
            // 找到当前快照的索引（基于时间戳匹配）
            const currentSnapshotIndex = sortedSnapshots.findIndex(
                (snapshot) => snapshot.key === stateKey
            )

            if (currentSnapshotIndex === -1) {
                toast.error("当前状态不在分组中")
                return
            }

            // 获取下一个快照
            const nextIndex = currentSnapshotIndex + 1
            const nextSnapshot = sortedSnapshots[nextIndex]
            
            if (nextSnapshot.meta?.originalPageUrl) {
                // 使用 stripOrigin 保持一致性
                const cleanUrl = stripOrigin(nextSnapshot.meta.originalPageUrl)
                window.location.href = cleanUrl
            } else {
                toast.warning("下一条操作无有效跳转链接")
            }
        } catch (error) {
            console.error("[OfflineUppy] Failed to navigate to next pending operation:", error)
            toast.error("跳转失败", { description: "无法加载下一条操作" })
        }
    }, [repId, subrid, stateKey])
    // 取消保存的状态
    const cancelSavedState = useCallback(async () => {
        try {
            console.log(`[OfflineUppy] Removing saved state for key: ${stateKey}`)

            // 1. 删除 IndexedDB 中的 Uppy 状态
            await fileOperationsQueue.removeUppyState(stateKey)

            // 2. 清空 Uppy 实例中的文件状态
            if (uppyInstanceRef.current) {
                // 暂停所有上传
                uppyInstanceRef.current.pauseAll()

                // 获取当前所有文件并逐个移除
                const currentFiles = uppyInstanceRef.current.getFiles()
                currentFiles.forEach((file) => {
                    try {
                        uppyInstanceRef.current?.removeFile(file.id)
                    } catch (error) {
                        console.warn(`[OfflineUppy] Failed to remove file ${file.id}:`, error)
                    }
                })

                // 重置 meta 数据
                uppyInstanceRef.current.setMeta({
                    eid: repId,
                    liveDays: params.liveDays || 2,
                    business: params.business || "rep",
                })

                console.log(`[OfflineUppy] Cleared ${currentFiles.length} files from Uppy instance`)
            }

            // 3. 清空恢复的待删除操作
            setRestoredPendingDeletes([])

            // 4. 清空 useUppyUpload 中的待删除操作
            if (cancelPendingOperations) {
                cancelPendingOperations()
            }

            // 5. 重新检查状态
            await checkSavedState()

            // 6. 更新保存状态
            setHasSavedState(false)

            toast.success("状态已清除", {
                description: "已移除所有保存的文件状态和待删除操作",
            })
        } catch (error) {
            console.error("[OfflineUppy] Failed to remove saved state:", error)
            toast.error("清除状态失败")
        }
    }, [stateKey, checkSavedState, cancelPendingOperations, repId, params.liveDays, params.business])
    // 恢复状态时，从Uppy state恢复
    useEffect(() => {
        const restoreState = async () => {
            console.log(`[OfflineUppy] Restoring state for key: ${stateKey}`)
            const snapshot = await fileOperationsQueue.loadUppyState(stateKey)

            if (!snapshot || !uppyInstanceRef.current) {
                console.log("[OfflineUppy] No snapshot or Uppy instance available")
                setHasSavedState(false)
                return
            }

            console.log("[OfflineUppy] Restoring state:", {
                key: snapshot.key,
                files: snapshot.files.length,
                pendingDeletes: snapshot.meta?.pendingDeleteOperations?.length,
            })

            // 从 snapshot 的 meta 中恢复待删除操作
            if (snapshot.meta?.pendingDeleteOperations) {
                const restoredDeletes: PendingDeleteOperation[] = snapshot.meta.pendingDeleteOperations
                console.log(`[OfflineUppy] Restoring ${restoredDeletes.length} pending delete operations from snapshot meta`)

                // 更新状态，这样会在 useUppyUpload 初始化时传递过去
                setRestoredPendingDeletes(restoredDeletes)

                if (restoredDeletes.length > 0) {
                    toast.info("恢复待删除文件", {
                        description: `发现 ${restoredDeletes.length} 个文件在待删除队列中`,
                        duration: 3000,
                    })
                }
            } else {
                // 如果没有待删除操作，确保清空状态
                setRestoredPendingDeletes([])
            }

            uppyInstanceRef.current.pauseAll()

            // 先设置 meta 数据
            if (snapshot.meta) {
                uppyInstanceRef.current.setMeta(snapshot.meta)
            } else {
                // 设置默认 meta
                uppyInstanceRef.current.setMeta({
                    eid: repId,
                    liveDays: params.liveDays || 2,
                    business: params.business || "rep",
                })
            }
            // 在 restoreState 函数中更新恢复计数逻辑
            let restoredCount = 0
            let fromHandleCount = 0
            let handleFailures = 0
            let addFailures = 0
            let duplicateFiles = 0
            for (const fileData of snapshot.files) {
                const result = await restoreFileFromSnapshot(
                    fileData,
                    uppyInstanceRef.current,
                    repId,
                    params.business || "rep",
                    params.liveDays || 2,
                    snapshot.meta,
                )

                if (result.restored) {
                    restoredCount++
                    if (result.fromHandle) {
                        fromHandleCount++
                    }
                } else {
                    if (fileData.fileHandle && fileData.isHandleMode) {
                        handleFailures++
                    } else {
                        addFailures++
                    }
                    // 检查是否是重复文件导致的失败
                    const existingFiles = uppyInstanceRef.current.getFiles()
                    const isDuplicate = existingFiles.some((file) => file.name === fileData.name && file.size === fileData.size)
                    if (isDuplicate) {
                        duplicateFiles++
                    }
                }
            }
            console.log(
                `[OfflineUppy] State restoration completed: ${restoredCount} files restored (${fromHandleCount} from handles), ${duplicateFiles} duplicates skipped`,
            )
            if (restoredCount > 0) {
                toast.success(`恢复完成`, {
                    description: `已恢复 ${restoredCount} 个上传文件${duplicateFiles > 0 ? `，跳过 ${duplicateFiles} 个重复文件` : ""}`,
                })
            } else if (snapshot.files.length > 0) {
                if (duplicateFiles > 0) {
                    toast.info("恢复完成", {
                        description: `所有文件已在上传列表中，无需重复恢复`,
                        duration: 9000,
                    })
                } else {
                    toast.error("恢复失败", {
                        description: `无法恢复 ${snapshot.files.length} 个文件，请重新选择文件`,
                    })
                }
            }
        }

        // 延迟执行以确保 Uppy 完全初始化
        setTimeout(() => {
            restoreState()
        }, 500)
    }, [repId, hash, params.liveDays, params.business, stateKey])
    // 新增：只更新待删除操作的状态
    const updatePendingDeletesState = useCallback(
        async (updatedDeletes: PendingDeleteOperation[]) => {
            try {
                const snapshot = await fileOperationsQueue.loadUppyState(stateKey)
                if (snapshot) {
                    const updatedState = {
                        ...snapshot,
                        meta: {
                            ...snapshot.meta,
                            pendingDeleteOperations: updatedDeletes,
                        },
                        timestamp: Date.now(),
                    }
                    await fileOperationsQueue.saveUppyState(updatedState)
                    console.log(`[OfflineUppy] Updated pending deletes state: ${updatedDeletes.length} operations`)
                }
            } catch (error) {
                console.error("[OfflineUppy] Failed to update pending deletes state:", error)
            }
        },
        [stateKey],
    )
    // 执行待删除操作 - 使用动态回调版本
    const executePendingDeletes = useCallback(async () => {
        const operationsToExecute = restoredPendingDeletes.length > 0 ? restoredPendingDeletes : pendingDeleteOperations
        if (!operationsToExecute || operationsToExecute.length === 0) {
            toast.info("没有待执行的删除操作")
            return
        }
        toast.info(`开始执行 ${operationsToExecute.length} 个待删除操作...`)
        // 使用 Promise 包装每个删除操作，以便跟踪完成状态
        const deletePromises = operationsToExecute.map((deleteOp) => {
            return new Promise<{ success: boolean; operation: PendingDeleteOperation; result?: any }>((resolve) => {
                // 为每个操作创建专门的回调
                const operationCallback = (result: any, fileUrl: string) => {
                    console.log(`[OfflineUppy] Delete operation result for ${fileUrl}:`, result)

                    if (result === "成功" || result === "文件不存在") {
                        console.log(`[OfflineUppy] Delete successful for ${fileUrl}`)
                        resolve({ success: true, operation: deleteOp, result })
                    } else {
                        console.log(`[OfflineUppy] Delete failed for ${fileUrl}:`, result)
                        resolve({ success: false, operation: deleteOp, result })
                    }
                }

                // 调用删除函数，传递专门的回调
                try {
                    delOssFileFunc(deleteOp.deleteUrl, "eid", deleteOp.repId, operationCallback)
                } catch (error) {
                    console.error(`[OfflineUppy] Failed to execute delete for ${deleteOp.deleteUrl}:`, error)
                    resolve({ success: false, operation: deleteOp, result: error })
                }
            })
        })

        try {
            const results = await Promise.all(deletePromises)

            const successfulOperations: PendingDeleteOperation[] = []
            const failedOperations: PendingDeleteOperation[] = []

            results.forEach((result) => {
                if (result.success) {
                    successfulOperations.push(result.operation)
                } else {
                    failedOperations.push(result.operation)
                }
            })

            if (successfulOperations.length > 0 && onFinish) {
                const successfulDeleteUrls = successfulOperations.map((op) => op.deleteUrl)
                console.log(`[OfflineUppy] Batch updating storeObj, removing ${successfulDeleteUrls.length} files`)

                if (params.maxFile === 1) {
                    // 单文件模式
                    const currentStoreObj = latestStoreObjRef.current as FileStore
                    if (currentStoreObj && successfulDeleteUrls.includes(currentStoreObj.url)) {
                        onFinish(undefined, false)
                    }
                } else {
                    // 多文件模式
                    const currentStoreObj = Array.isArray(latestStoreObjRef.current) ? [...latestStoreObjRef.current] : []
                    const newStoreObj = currentStoreObj.filter((file: FileStore) => !successfulDeleteUrls.includes(file.url))

                    // 只有当文件数量发生变化时才调用 onFinish
                    if (newStoreObj.length !== currentStoreObj.length) {
                        console.log(`[OfflineUppy] Updating storeObj: ${currentStoreObj.length} -> ${newStoreObj.length}`)
                        onFinish(newStoreObj, false)
                    }
                }
            }

            // 清理成功的操作（只更新内存状态，不保存到 IndexedDB）
            if (successfulOperations.length > 0) {
                const successfulDeleteUrls = successfulOperations.map((op) => op.deleteUrl)

                // 从 restoredPendingDeletes 状态中移除成功的操作
                setRestoredPendingDeletes((prev) => prev.filter((op) => !successfulDeleteUrls.includes(op.deleteUrl)))

                // 同步清理 useUppyUpload 中的 pendingDeleteOperations
                removePendingDeleteOperations(successfulDeleteUrls)

                console.log(
                    `[OfflineUppy] Successfully executed ${successfulOperations.length} delete operations, synced UI state (no IndexedDB save)`,
                )
            }

            // 这里我们直接使用当前已知的最新状态进行判断，比依赖 effect 更及时
            try {
                // 从父辈hook的内存状态读取最新的文件列表
                const currentFiles = uppyInstanceRef.current?.getFiles() || []
                const hasIncompleteFiles = currentFiles.some(
                    (file) => !(file.progress?.uploadComplete || file.progress?.percentage === 100),
                )
                const hasFiles = currentFiles.length > 0

                // 计算剩余的待删除操作数量（当前状态减去成功删除的操作）
                const actualPendingDeletes = restoredPendingDeletes.length - successfulOperations.length
                const hasPendingDeletes = actualPendingDeletes > 0

                // 如果没有不完整的文件（即所有文件都已完成，或者没有文件）且没有待删除操作，清理 IndexedDB
                if (!hasIncompleteFiles && !hasPendingDeletes) {
                    await fileOperationsQueue.removeUppyState(stateKey)
                    console.log(`[OfflineUppy] Cleared IndexedDB state after delete operations: ${stateKey}`)
                    setHasSavedState(false)
                    setRestoredPendingDeletes([])

                    toast.info("状态已清理", {
                        description: "所有文件和删除操作已完成，已清理本地存储状态",
                    })
                } else {
                    console.log(
                        `[OfflineUppy] State check: ${currentFiles.length} files (${hasIncompleteFiles ? "has incomplete" : "all complete"}), ${actualPendingDeletes} pending deletes remaining`,
                    )
                }
            } catch (error) {
                console.error("[OfflineUppy] Failed to check/clear IndexedDB state after deletes:", error)
            }

            if (failedOperations.length === 0) {
                // 全部成功，只更新内存状态，不自动保存到 IndexedDB
                toast.success("删除操作执行完成", {
                    description: `成功执行 ${successfulOperations.length} 个删除操作，请手动保存状态以持久化更改`,
                })
            } else {
                // 部分成功，只更新内存状态，不自动保存到 IndexedDB
                toast.warning("删除操作部分完成", {
                    description: `成功: ${successfulOperations.length} 个, 失败: ${failedOperations.length} 个，请手动保存状态以持久化更改`,
                })
            }
            // 触发 checkSavedState 以便检查是否需要清理 DB（因为状态已经改变）
            const finalFiles = uppyInstanceRef.current?.getFiles() || []
            const isAllUploaded = finalFiles.every((f) => f.progress?.uploadComplete)

            if (isAllUploaded) {
                await checkSavedState()
            }
        } catch (error) {
            console.error("[OfflineUppy] Error executing pending deletes:", error)
            toast.error("执行删除操作时发生错误")
        }
    }, [
        restoredPendingDeletes,
        pendingDeleteOperations,
        delOssFileFunc,
        checkSavedState,
        onFinish,
        params.maxFile,
        params.storeObj,
        removePendingDeleteOperations,
    ])

    // 通过文件句柄方式添加文件到 Uppy
    const addFilesWithHandles = useCallback(async () => {
        if (!uppyInstanceRef.current) {
            toast.error("Uppy 实例未初始化")
            return
        }

        const addedCount = await addFilesWithHandlesToUppy(
            uppyInstanceRef.current,
            repId,
            params.business || "rep",
            params.liveDays || 2,
        )

        if (addedCount > 0) {
            toast.success(`已添加 ${addedCount} 个文件（文件句柄模式）`)
        }
    }, [repId, params.business, params.liveDays])

    const ActionButtons = () => {
        const displayPendingDeletes = restoredPendingDeletes.length > 0 ? restoredPendingDeletes : pendingDeleteOperations
        return (
            <div className="flex flex-col gap-2 mt-2">
                {isFileSystemAccessSupported() && (
                    <div className="border-b pb-2">
                        <div className="flex gap-2">
                            {/* 文件句柄方式 */}
                            {isFileSystemAccessSupported() && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFilesWithHandles}
                                    className="flex items-center bg-transparent"
                                >
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    句柄方式添加到上传面板中
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-green-600 mt-1">文件句柄方式：节省存储空间，支持大文件，离线后可恢复</p>
                    </div>
                )}
                {/* 状态管理操作 */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                if (uppyInstanceRef.current) {
                                    await saveUppyState(uppyInstanceRef.current)
                                }
                            }}
                            className="flex items-center flex-1"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            保存上传和删除状态
                            {displayPendingDeletes.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {displayPendingDeletes.length} 待删
                </span>
                            )}
                        </Button>

                        {hasSavedState && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    await cancelSavedState()
                                }}
                                className="flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                清除状态
                            </Button>
                        )}
                    </div>
                    {hasSavedState && hasNextPendingOperation && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={navigateToNextPendingOperation}
                            className="flex items-center justify-center bg-transparent"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            下一条待处理离线文件操作
                        </Button>
                    )}
                    {/* 新增：执行待删除操作按钮 */}
                    {displayPendingDeletes.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={executePendingDeletes}
                                disabled={!(displayPendingDeletes.length > 0)}
                                className="flex items-center flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                执行待删除操作 ({displayPendingDeletes.length})
                            </Button>
                        </div>
                    )}
                    {hasSavedState && <p className="text-xs text-blue-600">✓ 保存状态，后端OSS恢复后可以继续做</p>}
                </div>
            </div>
        )
    }

    return [
        <div key="offline-uppy-wrapper">
            {uploadDom}
            <ActionButtons />
        </div>,
    ] as const
}
