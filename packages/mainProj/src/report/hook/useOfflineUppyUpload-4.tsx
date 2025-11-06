// useOfflineUppyUpload.tsx

"use client"

import { useEffect, useCallback, useRef } from "react"
import { useUppyUpload, type FileStore } from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { toast } from "sonner"

// 检查浏览器是否支持 File System Access API
const isFileSystemAccessSupported = () => {
    return typeof window !== 'undefined' &&
        'showSaveFilePicker' in window
}

// 辅助函数：将 ArrayBuffer 转换回 File 对象
const arrayBufferToFile = (arrayBuffer: ArrayBuffer, fileName: string, fileType: string, lastModified?: number): File => {
    const blob = new Blob([arrayBuffer], { type: fileType })
    return new File([blob], fileName, {
        type: fileType,
        lastModified: lastModified || Date.now()
    })
}

// 保存文件到文件系统并获取句柄
const saveFileWithHandle = async (file: File): Promise<{
    handle: FileSystemFileHandle;
    fileName: string;
    fileType: string;
    size: number;
    lastModified: number
} | null> => {
    if (!isFileSystemAccessSupported()) {
        return null
    }

    try {
        // 使用 showSaveFilePicker 让用户选择保存位置
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: file.name,
            types: [{
                description: 'File',
                accept: { [file.type]: [`.${file.name.split('.').pop()}`] },
            }],
        })

        // 创建可写流并写入文件
        const writable = await handle.createWritable()
        await writable.write(file)
        await writable.close()

        return {
            handle,
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            lastModified: file.lastModified
        }
    } catch (error) {
        console.warn("Failed to save file handle, falling back to data storage:", error)
        return null
    }
}

// 从文件句柄恢复 File 对象
const restoreFileFromHandle = async (fileHandleData: any): Promise<File | null> => {
    if (!fileHandleData?.handle) return null

    try {
        const file = await fileHandleData.handle.getFile()
        return file
    } catch (error) {
        console.error("Failed to restore file from handle:", error)
        return null
    }
}

// 将 File 转换为 ArrayBuffer（用于不支持文件句柄的情况）
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

// 优化的文件存储策略
const optimizeFileStorage = async (file: File): Promise<{
    data?: ArrayBuffer | File;
    fileHandle?: any;
}> => {
    // 存储策略：
    // - 小文件（< 2MB）：直接存储 File 对象（性能最佳）
    // - 中等文件（2MB - 10MB）：存储 ArrayBuffer
    // - 大文件（> 10MB）：警告用户可能无法离线保存

    if (file.size < 2 * 1024 * 1024) {
        // 小文件：直接存储 File 对象
        return { data: file }
    } else if (file.size <= 10 * 1024 * 1024) {
        // 中等文件：存储 ArrayBuffer
        try {
            const arrayBuffer = await fileToArrayBuffer(file)
            return { data: arrayBuffer }
        } catch (error) {
            console.warn("[OfflineUppy] Failed to convert file to ArrayBuffer:", error)
            return { data: file } // 回退到 File 对象
        }
    } else {
        // 大文件：警告用户
        console.warn("[OfflineUppy] Large file detected, offline storage may be limited:", file.name, file.size)
        toast.warning("大文件提示", {
            description: `文件 "${file.name}" 较大，离线存储功能可能受限`,
            duration: 5000,
        })

        // 仍然尝试存储 ArrayBuffer，但用户需知有风险
        try {
            const arrayBuffer = await fileToArrayBuffer(file)
            return { data: arrayBuffer }
        } catch (error) {
            console.warn("[OfflineUppy] Failed to process large file:", error)
            return { data: file } // 回退到 File 对象
        }
    }
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

            // 显示保存提示
            toast.info("正在保存文件状态...", {
                duration: 2000,
            })

            const filesWithData = await Promise.all(
                files.map(async (file) => {
                    // 检查文件数据是否为 File 对象
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

                    // 使用优化的存储策略
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
            const smallFileCount = filesWithData.filter(f => f.data instanceof File).length
            const arrayBufferCount = filesWithData.filter(f => f.data instanceof ArrayBuffer).length

            console.log(`[OfflineUppy] Saved state: ${stateKey}, ${fileCount} files (${smallFileCount} small files, ${arrayBufferCount} buffers)`)

            toast.success("保存成功", {
                description: `已保存 ${fileCount} 个文件的状态`,
            })
        },
        [repId, hash, stateKey],
    )

    // 单独的文件句柄保存函数（在用户手势中直接调用）
    const saveFilesWithHandles = useCallback(async (uppy: Uppy) => {
        if (!uppy) return

        const files = uppy.getFiles()
        if (files.length === 0) return

        toast.info("请选择文件保存位置...", {
            duration: 3000,
        })

        let savedCount = 0

        for (const file of files) {
            if (!(file.data instanceof File)) continue

            try {
                const fileHandleData = await saveFileWithHandle(file.data as File)
                if (fileHandleData) {
                    // 更新存储状态
                    await fileOperationsQueue.updateUppyStateWithHandle(stateKey, file.id, fileHandleData)
                    savedCount++
                }
            } catch (error) {
                console.warn(`Failed to save file handle for ${file.name}:`, error)
            }
        }

        if (savedCount > 0) {
            toast.success(`已保存 ${savedCount} 个文件的本地副本`)
        }
    }, [stateKey])

    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) return

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")

            // 先暂停 Uppy 的所有活动
            uppyInstanceRef.current.pauseAll()

            let restoredCount = 0
            let smallFileCount = 0
            let arrayBufferCount = 0

            for (const fileData of snapshot.files) {
                try {
                    let fileToRestore: File | null = null

                    // 恢复策略：
                    // 1. 优先从文件句柄恢复
                    // 2. 然后从数据恢复（File 对象或 ArrayBuffer）

                    if (fileData.fileHandle) {
                        fileToRestore = await restoreFileFromHandle(fileData.fileHandle)
                        if (fileToRestore) {
                            console.log("[OfflineUppy] Restored from file handle:", fileData.name)
                        }
                    }

                    // 如果文件句柄恢复失败，尝试从数据恢复
                    if (!fileToRestore && fileData.data) {
                        if (fileData.data instanceof File) {
                            fileToRestore = fileData.data
                            smallFileCount++
                            console.log("[OfflineUppy] Restored from File object:", fileData.name)
                        } else if (fileData.data instanceof ArrayBuffer) {
                            fileToRestore = arrayBufferToFile(
                                fileData.data,
                                fileData.name,
                                fileData.type,
                                fileData.lastModified
                            )
                            arrayBufferCount++
                            console.log("[OfflineUppy] Restored from ArrayBuffer:", fileData.name)
                        }
                    }

                    if (!fileToRestore) {
                        console.warn("[OfflineUppy] Cannot restore file, skipping:", fileData.name)
                        continue
                    }

                    const files = uppyInstanceRef.current.getFiles()

                    // 检查文件是否已经存在
                    const fileExists = files.some(file =>
                        file.name === fileData.name &&
                        file.size === fileData.size
                    )

                    if (!fileExists) {
                        const fileToAdd = {
                            name: fileData.name,
                            type: fileData.type,
                            data: fileToRestore,
                            meta: {
                                relativePath: '',
                                lastModified: fileData.lastModified || Date.now()
                            }
                        }

                        uppyInstanceRef.current.addFile(fileToAdd)
                        restoredCount++
                    }
                } catch (error) {
                    console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
                }
            }

            // 恢复元数据
            if (snapshot.meta) {
                uppyInstanceRef.current.setMeta(snapshot.meta)
            }

            // 恢复 oldfiles 状态
            if (snapshot.oldfiles) {
                uppyInstanceRef.current.setState({ oldfiles: snapshot.oldfiles })
            }

            console.log(`[OfflineUppy] State restoration completed: ${restoredCount}/${snapshot.files.length} files restored (${smallFileCount} small files, ${arrayBufferCount} buffers)`)

            if (restoredCount > 0) {
                toast.success(`已恢复 ${restoredCount} 个文件`, {
                    description: "可以继续上传操作",
                })
            } else if (snapshot.files.length > 0) {
                toast.warning("文件恢复失败", {
                    description: "无法恢复已保存的文件状态，请重新选择文件",
                })
            }
        }

        // 延迟恢复状态，确保 Uppy 完全初始化
        setTimeout(() => {
            restoreState()
        }, 100)
    }, [repId, hash])

    const enhancedOnFinish = useCallback(
        async (file: any, del: boolean) => {
            if (onFinish) {
                onFinish(file, del)
            }
            await fileOperationsQueue.removeUppyState(repId, undefined, hash)
        },
        [onFinish, repId, hash],
    )

    const SaveStateButton = () => (
        <div className="flex gap-2 mt-2">
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
                <Clock className="w-4 h-4 mr-2" />
                保存上传状态
            </Button>

            {isFileSystemAccessSupported() && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        if (uppyInstanceRef.current) {
                            await saveFilesWithHandles(uppyInstanceRef.current)
                        }
                    }}
                >
                    <Clock className="w-4 h-4 mr-2" />
                    保存文件到本地
                </Button>
            )}
        </div>
    )

    return [
        <div key="offline-uppy-wrapper">
            {uploadDom}
            <SaveStateButton />
        </div>,
        saveUppyState,
    ] as const
}