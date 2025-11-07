// useOfflineUppyUpload.tsx
"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useUppyUpload, type FileStore } from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Clock, Upload, FileText, FolderOpen } from "lucide-react"
import { toast } from "sonner"

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

// 优化的文件存储策略（用于 Uppy 文件的保存）
const optimizeFileStorage = async (file: File): Promise<{
    data?: ArrayBuffer | File;
    fileHandle?: any;
}> => {
    if (file.size < 2 * 1024 * 1024) {
        return { data: file }
    } else if (file.size <= 10 * 1024 * 1024) {
        try {
            const arrayBuffer = await fileToArrayBuffer(file)
            return { data: arrayBuffer }
        } catch (error) {
            console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer:", error)
            return { data: file }
        }
    } else {
        console.warn("[OfflineUppy] Large file detected, offline storage may be limited:", file.name, file.size)
        toast.warning("大文件提示", {
            description: `文件 "${file.name}" 较大，离线存储功能可能受限`,
            duration: 5000,
        })

        try {
            const arrayBuffer = await fileToArrayBuffer(file)
            return { data: arrayBuffer }
        } catch (error) {
            console.warn("[OfflineUppy] Failed to process large file:", error)
            return { data: file }
        }
    }
}

// 专门通过文件句柄方式添加文件到 Uppy
const addFilesWithHandlesToUppy = async (uppy: Uppy, repId: string, business: string, liveDays: number): Promise<number> => {
    if (!isFileSystemAccessSupported()) {
        toast.error("浏览器不支持文件系统访问 API")
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
// 删除 selectOfflineFiles 函数
// 删除 transferOfflineFilesToUppy 函数
// 删除 offlineFiles 状态及相关逻辑
// 简化 ActionButtons 组件

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
    redId?: string
    fieldPath?: string
}) {
    const { repId, hash, onFinish } = params
    const [uploadDom, uppyInstance] = useUppyUpload({...params, open: true})
    const uppyInstanceRef = useRef<Uppy | null>(null)
    const stateKey = `${repId}${hash ? `:${hash}` : ""}`

    useEffect(() => {
        if (uppyInstance) {
            uppyInstanceRef.current = uppyInstance
        }
    }, [uppyInstance])

    // 保存 Uppy 当前状态（正常上传模式）
    const saveUppyState = useCallback(
        async (uppy: Uppy) => {
            if (!uppy) return

            const files = uppy.getFiles()
            if (files.length === 0) {
                toast.info("无需保存", {
                    description: "当前没有待上传的文件",
                })
                return
            }

            toast.info("正在保存文件状态...", {
                duration: 2000,
            })

            const filesWithData = await Promise.all(
                files.map(async (file) => {
                    // 检查是否有文件句柄（文件句柄模式）
                    if (file.meta.fileHandle) {
                        console.log(`[FileHandle] Saving file with handle: ${file.name}`)
                        return {
                            id: file.id, // 确保保存文件ID
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: null,
                            fileHandle: file.meta.fileHandle,
                            lastModified: file.data.lastModified,
                            progress: file.progress?.percentage,
                            uploadURL: file.uploadURL,
                            isHandleMode: true, // 确保标记为文件句柄模式
                        }
                    }
                    // 传统模式：保存文件数据
                    if (!(file.data instanceof File)) {
                        console.warn("[OfflineUppy] File data is not a File object:", file.name)
                        return {
                            id: file.id,
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: null,
                            fileHandle: null,
                            lastModified: undefined,
                            progress: file.progress?.percentage,
                            uploadURL: file.uploadURL,
                        }
                    }

                    const fileData = file.data as File
                    const storageResult = await optimizeFileStorage(fileData)

                    return {
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: storageResult.data,
                        fileHandle: storageResult.fileHandle,
                        lastModified: fileData.lastModified,
                        progress: file.progress?.percentage,
                        uploadURL: file.uploadURL,
                    }
                })
            )

            await fileOperationsQueue.saveUppyState({
                key: stateKey,
                repId,
                hash: hash || "default",
                timestamp: Date.now(),
                files: filesWithData,
                meta: uppy.getState().meta,
                oldfiles: uppy.getState().oldfiles,
            })

            const fileCount = filesWithData.length
            const handleModeCount = filesWithData.filter(f => f.isHandleMode).length
            console.log(`[OfflineUppy] Saved state: ${stateKey}, ${fileCount} files (${handleModeCount} with handles)`)

            toast.success("保存成功", {
                description: `已保存 ${fileCount} 个文件的状态（${handleModeCount} 个使用文件句柄）`,
            })
        },
        [repId, hash, stateKey],
    )

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

    // 恢复状态（包括正常文件和离线文件）
    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) {
                console.log("[OfflineUppy] No snapshot or Uppy instance available")
                return
            }

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")
            console.log("[OfflineUppy] Snapshot details:", {
                files: snapshot.files.map(f => ({
                    name: f.name,
                    hasHandle: !!f.fileHandle,
                    isHandleMode: f.isHandleMode,
                    hasData: !!f.data
                }))
            })

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
            console.log(`[OfflineUppy] Restoration failures - handles: ${handleFailures}, adds: ${addFailures}`)

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
        }, 500) // 增加延迟时间
    }, [repId, hash, params.liveDays, params.business])

    const enhancedOnFinish = useCallback(
        async (file: any, del: boolean) => {
            if (onFinish) {
                onFinish(file, del)
            }
            await fileOperationsQueue.removeUppyState(repId, undefined, hash)
        },
        [onFinish, repId, hash],
    )

    const ActionButtons = () => (
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

            {/* 正常上传模式操作 */}
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
                >
                    <Upload className="w-4 h-4 mr-2" />
                    保存上传状态
                </Button>
            </div>
        </div>
    )

    return [
        <div key="offline-uppy-wrapper">
            {uploadDom}
            <ActionButtons />
        </div>,
        saveUppyState,
    ] as const
}
