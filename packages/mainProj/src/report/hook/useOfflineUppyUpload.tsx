// useOfflineUppyUpload.tsx
"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import {useUppyUpload, type FileStore, PendingDeleteOperation} from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Clock, Upload, FileText, FolderOpen, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// 检查浏览器是否支持 File System Access API
const isFileSystemAccessSupported = () => {
    return typeof window !== 'undefined' &&
        'showOpenFilePicker' in window
}
// 验证文件权限
async function verifyPermission(fileHandle: FileSystemFileHandle, readWrite: boolean = false) {
    const options: any = { mode: readWrite ? 'readwrite' : 'read' };
    try {
        // 检查当前权限状态
        let permission = await fileHandle.queryPermission(options);
        console.log(`[OfflineUppy] Current permission: ${permission}`);
        if (permission === 'granted') {
            return true;
        }
        // 请求权限
        permission = await fileHandle.requestPermission(options);
        console.log(`[OfflineUppy] Requested permission: ${permission}`);
        return permission === 'granted';
    } catch (error) {
        console.error("[OfflineUppy] Error verifying permission:", error);
        return false;
    }
}

// 选择文件并获取句柄（专门用于文件句柄模式）
const selectFilesWithHandles = async (): Promise<Array<{
    handle: FileSystemFileHandle;
    fileName: string;
    fileType: string;
    size: number;
    lastModified: number;
}> | null> => {
    if (!isFileSystemAccessSupported()) {
        toast.error("浏览器不支持文件系统访问 API")
        return null
    }

    try {
        // 使用 showOpenFilePicker 让用户选择文件
        const handles = await (window as any).showOpenFilePicker({
            multiple: true,
            types: [{
                description: 'All Files',
                accept: { '*/*': [] },
            }],
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
                    lastModified: file.lastModified
                }
            })
        )

        return fileHandles
    } catch (error) {
        // 用户取消选择不是错误
        if (error instanceof DOMException && error.name === 'AbortError') {
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

        // 验证权限
        const hasPermission = await verifyPermission(fileHandleData.handle)
        if (!hasPermission) {
            console.warn("[OfflineUppy] No permission to access saved file handle")
            // 尝试重新请求权限
            try {
                //ds生成的.handle 需改成.fileHandle
                const permission = await fileHandleData.fileHandle.requestPermission({ mode: 'read' })
                if (permission !== 'granted') {
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
const arrayBufferToFile = (arrayBuffer: ArrayBuffer, fileName: string, fileType: string, lastModified?: number): File => {
    const blob = new Blob([arrayBuffer], { type: fileType })
    return new File([blob], fileName, {
        type: fileType,
        lastModified: lastModified || Date.now()
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
const addFilesWithHandlesToUppy = async (uppy: Uppy, repId: string, business: string, liveDays: number): Promise<number> => {
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

            // 创建符合 Uppy 要求的文件对象
            const fileToAdd = {
                id: `file-handle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: fileHandle.fileName,
                type: fileHandle.fileType,
                data: file,
                size: fileHandle.size,
                meta: {
                    fileHandle: fileHandle.handle, // 保存文件句柄
                    relativePath: '',
                    lastModified: fileHandle.lastModified,
                    eid: repId,
                    business,
                    liveDays
                }
            }

            // 使用 Uppy 的 addFile 方法
            const result = uppy.addFile(fileToAdd)

            if (result) {
                addedCount++
                console.log(`[FileHandle] Successfully added file to Uppy:`, fileHandle.fileName)
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
// 生成状态存储的key - 修复版本
const generateStateKey = (params: {
    repId: string
    subrid?: string
    redId?: number
    fieldPath?: string
    hash?: string
}) => {
    const { repId, subrid, redId, fieldPath, hash } = params
    let key = repId
    if (subrid) key += `:${subrid}`
    if (redId) key += `:${redId}`
    if (fieldPath) key += `:${fieldPath}`
    if (hash) key += `:${hash}`
    return key
}

// 获取完整的 stateKey（用于保存和加载）
const getFullStateKey = (params: {
    repId: string
    subrid?: string
    redId?: number
    fieldPath?: string
    hash?: string
}) => {
    return generateStateKey(params)
}

// 获取当前页面URL用于恢复
const getCurrentPageUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.href
    }
    return ''
}

export function useOfflineUppyUpload(params: {
    repId: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, del: boolean) => void
    hash?: string
    id?: string
    business?: string
    modType?: string
    redId?: number
    fieldPath?: string
    subrid?: string
}) {
    const { repId, hash, onFinish, subrid, fieldPath, redId } = params

    // 生成完整的状态key
    const stateKey = getFullStateKey({
        repId,
        subrid,
        redId,
        fieldPath,
        hash
    })

    console.log(`[OfflineUppy] Generated stateKey: ${stateKey}`)

    // 添加状态来存储恢复的待删除操作
    const [restoredPendingDeletes, setRestoredPendingDeletes] = useState<PendingDeleteOperation[]>([]);

    // 检查是否有保存的状态
    const [hasSavedState, setHasSavedState] = useState(false)

    // 检查保存状态的函数
    const checkSavedState = useCallback(async () => {
        try {
            console.log(`[OfflineUppy] Checking saved state for key: ${stateKey}`)
            const snapshot = await fileOperationsQueue.loadUppyState(stateKey)
            console.log(`[OfflineUppy] Found snapshot:`, snapshot ? `yes, ${snapshot.files?.length || 0} files` : 'no')
            setHasSavedState(!!snapshot)

            // 如果有快照，也检查其中的待删除操作
            if (snapshot?.meta?.pendingDeleteOperations) {
                console.log(`[OfflineUppy] Found ${snapshot.meta.pendingDeleteOperations.length} pending delete operations in snapshot`)
            }
        } catch (error) {
            console.error("[OfflineUppy] Failed to check saved state:", error)
        }
    }, [stateKey])

    // 初始化时检查保存状态
    useEffect(() => {
        checkSavedState()
    }, [checkSavedState])

    // 将恢复的待删除操作传递给 useUppyUpload
    const [uploadDom, uppyInstance, pendingDeleteOperations, clearPendingDeletes, delOssFileFunc] = useUppyUpload({
        ...params,
        open: true,
        externalPendingDeletes: restoredPendingDeletes
    });

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

            const files = uppy.getFiles()
            const oldfiles = uppy.getState().oldfiles || []
            const currentPendingDeletes = pendingDeleteOperationsRef.current

            // 如果没有待上传文件、没有已上传文件且没有待删除操作，无需保存
            if (files.length === 0 && oldfiles.length === 0 && currentPendingDeletes.length === 0) {
                toast.info("无需保存", {
                    description: "当前没有需要保存的文件状态",
                })
                return
            }

            toast.info("正在保存文件状态...", {
                duration: 2000,
            })

            const filesWithData = await Promise.all(
                files.map(async (file) => {
                    try {
                        // 检查是否为文件句柄模式
                        const isHandleMode = file.meta?.fileHandle && file.meta?.isHandleMode;

                        if (isHandleMode) {
                            // 文件句柄模式：只保存句柄引用，不保存文件数据
                            return {
                                id: file.id,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                fileHandle: file.meta.fileHandle,
                                lastModified: file.meta.lastModified || file.data.lastModified,
                                progress: file.progress?.percentage || 0,
                                uploadURL: file.uploadURL,
                                isHandleMode: true
                            }
                        } else {
                            // 传统模式：根据文件大小优化存储策略
                            let fileData: ArrayBuffer | File | undefined;
                            let useArrayBuffer = false;

                            if (file.size < 3 * 1024 * 1024) {
                                // 小文件：直接保存 File 对象
                                fileData = file.data;
                            } else if (file.size <= 20 * 1024 * 1024) {
                                // 中等文件：转换为 ArrayBuffer
                                try {
                                    fileData = await fileToArrayBuffer(file.data);
                                    useArrayBuffer = true;
                                } catch (error) {
                                    console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer, falling back to File:", error);
                                    fileData = file.data;
                                }
                            } else {
                                // 大文件：提示用户使用句柄模式
                                console.warn("[OfflineUppy] Large file detected, storing as File:", file.name, file.size);
                                fileData = file.data;
                                toast.warning("大文件存储提示", {
                                    description: `文件 "${file.name}" 较大，建议使用文件句柄模式以获得更好的离线体验`,
                                    duration: 4000,
                                });
                            }

                            return {
                                id: file.id,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: fileData,
                                lastModified: file.data.lastModified,
                                progress: file.progress?.percentage || 0,
                                uploadURL: file.uploadURL,
                                isHandleMode: false,
                                useArrayBuffer
                            }
                        }
                    } catch (error) {
                        console.error("[OfflineUppy] Failed to process file for saving:", file.name, error);
                        toast.error(`处理文件失败: ${file.name}`);
                        return null;
                    }
                })
            ).then(results => results.filter(Boolean)) // 过滤掉处理失败的文件

            // 保存 Uppy 状态到 IndexedDB，包含待删除操作数组
            try {
                const uppyState = {
                    key: stateKey,
                    repId,
                    subrid,
                    hash: hash || "default",
                    timestamp: Date.now(),
                    files: filesWithData,
                    meta: {
                        ...uppy.getState().meta,
                        originalPageUrl: getCurrentPageUrl(),
                        fieldPath: fieldPath,
                        modType: params.modType,
                        redId: params.redId,
                        business: params.business,
                        liveDays: params.liveDays,
                        maxFile: params.maxFile,
                        maxSize: params.maxSize,
                        // 将待删除操作数组保存到 meta 中
                        pendingDeleteOperations: currentPendingDeletes.map(op => ({
                            deleteUrl: op.deleteUrl,
                            deleteIndex: op.deleteIndex,
                            repId: op.repId,
                            hash: op.hash,
                            business: op.business,
                            timestamp: op.timestamp
                        }))
                    },
                    oldfiles: oldfiles,
                }

                console.log(`[OfflineUppy] Saving Uppy state with key: ${stateKey}`, {
                    files: filesWithData.length,
                    oldfiles: oldfiles.length,
                    pendingDeletes: currentPendingDeletes.length
                })

                await fileOperationsQueue.saveUppyState(uppyState)

                const fileCount = filesWithData.length
                const handleModeCount = filesWithData.filter(f => f.isHandleMode).length
                const oldFileCount = oldfiles.length
                const deleteCount = currentPendingDeletes.length

                console.log(`[OfflineUppy] Saved state: ${stateKey}, ${fileCount} pending files (${handleModeCount} with handles), ${oldFileCount} uploaded files, ${deleteCount} pending deletes`)

                toast.success("保存成功", {
                    description: `已保存 ${fileCount} 个待上传文件（${handleModeCount} 个使用文件句柄）、${oldFileCount} 个已上传文件和 ${deleteCount} 个待删除操作的状态`,
                    duration: 3000,
                })

                // 清空本地待删除操作状态（因为已经保存到 Uppy state 中）
                clearPendingDeletes()

                // 更新保存状态
                setHasSavedState(true)

            } catch (error) {
                console.error("[OfflineUppy] Failed to save Uppy state:", error)
                toast.error("保存失败", {
                    description: "无法保存文件状态到本地存储",
                })
            }
        },
        [repId, subrid, fieldPath, hash, clearPendingDeletes, params.modType, params.redId, params.business, params.liveDays, params.maxFile, params.maxSize, stateKey]
    )

    // 取消保存的状态
    const cancelSavedState = useCallback(async () => {
        try {
            console.log(`[OfflineUppy] Removing saved state with key: ${stateKey}`)

            // 删除 Uppy 状态（这会同时删除保存的待删除操作数组）
            await fileOperationsQueue.removeUppyState(stateKey)

            // 清空本地待删除操作
            clearPendingDeletes()

            // 重新检查状态
            await checkSavedState()

            toast.success("状态已清除", {
                description: "已移除所有保存的文件状态和待删除操作",
            })
        } catch (error) {
            console.error("[OfflineUppy] Failed to remove saved state:", error)
            toast.error("清除状态失败")
        }
    }, [stateKey, clearPendingDeletes, checkSavedState])

    // 恢复状态时，从 Uppy state 的 meta 中恢复待删除操作
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
                oldfiles: snapshot.oldfiles?.length,
                pendingDeletes: snapshot.meta?.pendingDeleteOperations?.length
            })

            // 从 snapshot 的 meta 中恢复待删除操作
            if (snapshot.meta?.pendingDeleteOperations) {
                const restoredDeletes: PendingDeleteOperation[] = snapshot.meta.pendingDeleteOperations;
                console.log(`[OfflineUppy] Restoring ${restoredDeletes.length} pending delete operations from snapshot meta`);

                // 更新状态，这样会在 useUppyUpload 初始化时传递过去
                setRestoredPendingDeletes(restoredDeletes);

                if (restoredDeletes.length > 0) {
                    toast.info("恢复待删除文件", {
                        description: `发现 ${restoredDeletes.length} 个文件在待删除队列中`,
                        duration: 3000,
                    });
                }
            }

            // ... 其他恢复逻辑保持不变 ...
            uppyInstanceRef.current.pauseAll()

            // 先设置 meta 数据
            if (snapshot.meta) {
                uppyInstanceRef.current.setMeta(snapshot.meta)
            } else {
                // 设置默认 meta
                uppyInstanceRef.current.setMeta({
                    eid: repId,
                    liveDays: params.liveDays || 2,
                    business: params.business || "rep"
                })
            }

            let restoredCount = 0
            let fromHandleCount = 0
            let handleFailures = 0
            let addFailures = 0
            // 文件恢复逻辑保持不变 ...
            for (const fileData of snapshot.files) {
                try {
                    console.log(`[OfflineUppy] Processing file: ${fileData.name}`, {
                        hasHandle: !!fileData.fileHandle,
                        isHandleMode: fileData.isHandleMode,
                        hasData: !!fileData.data
                    })

                    let fileToRestore: File | null = null

                    // 优先从文件句柄恢复（文件句柄模式）
                    if (fileData.fileHandle && fileData.isHandleMode) {
                        console.log(`[OfflineUppy] Attempting to restore from handle: ${fileData.name}`)

                        try {
                            fileToRestore = await restoreFileFromHandle(fileData)
                            console.log(`[OfflineUppy] Handle restoration result for ${fileData.name}:`, {
                                success: !!fileToRestore,
                                fileType: fileToRestore?.type,
                                fileSize: fileToRestore?.size
                            })
                        } catch (handleError) {
                            console.error(`[OfflineUppy] Handle restoration error for ${fileData.name}:`, handleError)
                            handleFailures++
                            continue
                        }

                        if (fileToRestore) {
                            fromHandleCount++
                            console.log("[OfflineUppy] Successfully restored file from handle:", fileData.name)

                            // 修复：使用与文件句柄添加时相同的文件对象结构
                            const fileToAdd = {
                                id: fileData.id || `file-handle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                name: fileData.name,
                                type: fileData.type,
                                data: fileToRestore,
                                size: fileData.size,
                                meta: {
                                    ...snapshot.meta,
                                    fileHandle: fileData.fileHandle, // 保持文件句柄
                                    relativePath: '',
                                    lastModified: fileData.lastModified || Date.now(),
                                    eid: repId,
                                    business: params.business || "rep",
                                    liveDays: params.liveDays || 2,
                                    isHandleMode: true // 明确标记为句柄模式
                                }
                            }

                            // 使用 Uppy 的 addFile 方法
                            try {
                                const result = uppyInstanceRef.current.addFile(fileToAdd)
                                if (result) {
                                    restoredCount++
                                    console.log(`[OfflineUppy] Successfully added file handle to Uppy: ${fileData.name}`)
                                } else {
                                    console.error(`[OfflineUppy] Uppy addFile returned false for: ${fileData.name}`)
                                    addFailures++
                                }
                            } catch (addError) {
                                console.error(`[OfflineUppy] Failed to add file to Uppy: ${fileData.name}`, addError)
                                addFailures++
                            }
                        } else {
                            console.warn(`[OfflineUppy] File handle restoration returned null for: ${fileData.name}`)
                            handleFailures++
                        }
                    }
                    // 传统模式恢复
                    else if (!fileData.isHandleMode && fileData.data) {
                        console.log(`[OfflineUppy] Attempting traditional restore: ${fileData.name}`)

                        if (fileData.data instanceof File) {
                            fileToRestore = fileData.data
                        } else if (fileData.data instanceof ArrayBuffer) {
                            fileToRestore = arrayBufferToFile(
                                fileData.data,
                                fileData.name,
                                fileData.type,
                                fileData.lastModified
                            )
                        }

                        if (fileToRestore) {
                            const fileToAdd = {
                                id: fileData.id,
                                name: fileData.name,
                                type: fileData.type,
                                data: fileToRestore,
                                size: fileData.size,
                                meta: {
                                    relativePath: '',
                                    lastModified: fileData.lastModified || Date.now(),
                                    ...snapshot.meta
                                }
                            }
                            try {
                                const result = uppyInstanceRef.current.addFile(fileToAdd)
                                if (result) {
                                    restoredCount++
                                    console.log(`[OfflineUppy] Successfully added traditional file to Uppy: ${fileData.name}`)
                                } else {
                                    console.error(`[OfflineUppy] Uppy addFile returned false for traditional file: ${fileData.name}`)
                                    addFailures++
                                }
                            } catch (addError) {
                                console.error(`[OfflineUppy] Failed to add traditional file to Uppy: ${fileData.name}`, addError)
                                addFailures++
                            }
                        }
                    } else {
                        console.warn(`[OfflineUppy] File cannot be restored - no valid data: ${fileData.name}`, {
                            hasHandle: !!fileData.fileHandle,
                            isHandleMode: fileData.isHandleMode,
                            hasData: !!fileData.data
                        })
                    }
                } catch (error) {
                    console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
                }
            }

            if (snapshot.oldfiles) {
                uppyInstanceRef.current.setState({ oldfiles: snapshot.oldfiles })
            }

            console.log(`[OfflineUppy] State restoration completed: ${restoredCount} files restored (${fromHandleCount} from handles)`)
            setHasSavedState(true)

            if (restoredCount > 0) {
                toast.success(`恢复完成`, {
                    description: `已恢复 ${restoredCount} 个上传文件`,
                })
            } else if (snapshot.files.length > 0) {
                toast.error("恢复失败", {
                    description: `无法恢复 ${snapshot.files.length} 个文件，请重新选择文件`,
                })
            }
        }

        // 延迟执行以确保 Uppy 完全初始化
        setTimeout(() => {
            restoreState()
        }, 500)
    }, [repId, hash, params.liveDays, params.business, stateKey])

    const executePendingDeletes = useCallback(async () => {
        if (!pendingDeleteOperations || pendingDeleteOperations.length === 0) {
            toast.info("没有待执行的删除操作");
            return;
        }

        if (!delOssFileFunc) {
            toast.error("删除功能不可用");
            return;
        }

        toast.info(`开始执行 ${pendingDeleteOperations.length} 个待删除操作...`);

        let successCount = 0;
        let failCount = 0;

        // 逐个执行删除操作
        for (const deleteOp of pendingDeleteOperations) {
            try {
                // 调用实际的删除函数
                await new Promise((resolve) => {
                    delOssFileFunc(
                        deleteOp.deleteUrl,
                        deleteOp.deleteIndex,
                        "eid",
                        deleteOp.repId
                    );
                    // 这里需要根据实际的回调机制来处理
                    setTimeout(resolve, 1000); // 简单延迟
                });

                successCount++;

            } catch (error) {
                console.error("删除操作执行失败:", error);
                failCount++;
            }
        }

        // 显示执行结果
        if (failCount === 0) {
            toast.success("删除操作执行完成", {
                description: `成功执行 ${successCount} 个删除操作`,
            });
            // 清空已完成的删除操作
            clearPendingDeletes();
        } else {
            toast.warning("删除操作部分完成", {
                description: `成功: ${successCount} 个, 失败: ${failCount} 个`,
            });
        }
    }, [pendingDeleteOperations, delOssFileFunc, clearPendingDeletes]);

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
            params.liveDays || 2
        )

        if (addedCount > 0) {
            toast.success(`已添加 ${addedCount} 个文件（文件句柄模式）`)
        }
    }, [repId, params.business, params.liveDays])

    const ActionButtons = () => {
        return (
            <div className="flex flex-col gap-2 mt-2">
                {/* 文件添加方式选择 */}
                <div className="border-b pb-2">
                    <p className="text-xs text-gray-500 mb-2">选择文件添加方式：</p>
                    <div className="flex gap-2">
                        {/* 传统方式（Uppy 内置） */}
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">传统方式</p>
                            <p className="text-xs text-gray-400">适合小文件，即时上传</p>
                        </div>

                        {/* 文件句柄方式 */}
                        {isFileSystemAccessSupported() && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFilesWithHandles}
                                className="flex items-center"
                            >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                文件句柄方式添加
                            </Button>
                        )}
                    </div>
                    {isFileSystemAccessSupported() && (
                        <p className="text-xs text-green-600 mt-1">
                            文件句柄方式：节省存储空间，支持大文件，离线后可恢复
                        </p>
                    )}
                </div>

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
                                    setHasSavedState(true)
                                }
                            }}
                            className="flex items-center flex-1"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            保存文件上传和删除状态
                            {pendingDeleteOperations.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {pendingDeleteOperations.length} 待删除
                            </span>
                            )}
                        </Button>

                        {hasSavedState && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={cancelSavedState}
                                className="flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                清除状态
                            </Button>
                        )}
                    </div>

                    {/* 新增：执行待删除操作按钮 */}
                    {pendingDeleteOperations.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={executePendingDeletes}
                                className="flex items-center flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                执行待删除操作 ({pendingDeleteOperations.length})
                            </Button>
                        </div>
                    )}

                    {hasSavedState && (
                        <p className="text-xs text-blue-600">
                            ✓ 有保存的状态，离线后可以恢复
                        </p>
                    )}

                    {pendingDeleteOperations.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs text-orange-600">
                                ⚠ 有 {pendingDeleteOperations.length} 个删除操作等待执行
                            </p>
                            <div className="text-xs text-gray-500">
                                {pendingDeleteOperations.map((op, index) => (
                                    <div key={index} className="truncate">
                                        {op.deleteUrl.split('/').pop()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return [
        <div key="offline-uppy-wrapper">
            {uploadDom}
            <ActionButtons />
        </div>,
        saveUppyState,
        cancelSavedState,
        hasSavedState
    ] as const
}
