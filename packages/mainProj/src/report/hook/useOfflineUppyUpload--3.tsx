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
        'showOpenFilePicker' in window &&
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

// 保存文件句柄到文件系统
const saveFileHandle = async (file: File): Promise<{
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
        // 请求文件保存权限
        const handle = await (window as any).showSaveFilePicker({
            suggestedName: file.name,
            types: [{
                description: 'Upload File',
                accept: { [file.type]: ['.*'] },
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
            if (files.length === 0) return

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
                    let fileHandleData: any = null
                    let arrayBufferData: ArrayBuffer | null = null

                    // 智能存储策略：
                    // - 大文件（≥ 1MB）：优先使用文件句柄
                    // - 小文件（< 1MB）：使用 ArrayBuffer
                    if (fileData.size >= 1024 * 1024) { // 1MB
                        // 尝试使用文件句柄
                        fileHandleData = await saveFileHandle(fileData)

                        if (!fileHandleData) {
                            // 文件句柄失败，回退到 ArrayBuffer（仅限较小的大文件）
                            if (fileData.size <= 10 * 1024 * 1024) { // 10MB 以下
                                console.log("[OfflineUppy] Falling back to ArrayBuffer for file:", file.name)
                                arrayBufferData = await fileToArrayBuffer(fileData)
                            } else {
                                console.warn("[OfflineUppy] File too large for ArrayBuffer fallback:", file.name)
                            }
                        }
                    } else {
                        // 小文件直接使用 ArrayBuffer
                        arrayBufferData = await fileToArrayBuffer(fileData)
                    }

                    return {
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: arrayBufferData,
                        fileHandle: fileHandleData,
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

            const fileHandleCount = filesWithData.filter(f => f.fileHandle).length
            const arrayBufferCount = filesWithData.filter(f => f.data).length

            console.log(`[OfflineUppy] Saved state: ${stateKey}, ${filesWithData.length} files (${fileHandleCount} handles, ${arrayBufferCount} buffers)`)
        },
        [repId, hash, stateKey],
    )

    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) return

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")

            // 先暂停 Uppy 的所有活动
            uppyInstanceRef.current.pauseAll()

            let restoredCount = 0
            let fileHandleCount = 0
            let arrayBufferCount = 0

            for (const fileData of snapshot.files) {
                try {
                    let fileToRestore: File | null = null

                    // 恢复策略：
                    // 1. 优先从文件句柄恢复
                    // 2. 然后从 ArrayBuffer 恢复
                    // 3. 最后尝试其他数据格式

                    if (fileData.fileHandle) {
                        fileToRestore = await restoreFileFromHandle(fileData.fileHandle)
                        if (fileToRestore) {
                            fileHandleCount++
                            console.log("[OfflineUppy] Restored from file handle:", fileData.name)
                        }
                    }

                    // 如果文件句柄恢复失败，尝试从 ArrayBuffer 恢复
                    if (!fileToRestore && fileData.data) {
                        if (fileData.data instanceof ArrayBuffer) {
                            fileToRestore = arrayBufferToFile(
                                fileData.data,
                                fileData.name,
                                fileData.type,
                                fileData.lastModified
                            )
                            arrayBufferCount++
                            console.log("[OfflineUppy] Restored from ArrayBuffer:", fileData.name)
                        } else if (fileData.data instanceof File) {
                            fileToRestore = fileData.data
                            console.log("[OfflineUppy] Restored from File object:", fileData.name)
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

            console.log(`[OfflineUppy] State restoration completed: ${restoredCount}/${snapshot.files.length} files restored (${fileHandleCount} handles, ${arrayBufferCount} buffers)`)

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
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
                if (uppyInstanceRef.current) {
                    await saveUppyState(uppyInstanceRef.current)
                    toast.success("已保存", {
                        description: "文件操作状态已保存，可稍后恢复",
                    })
                }
            }}
            className="mt-2"
        >
            <Clock className="w-4 h-4 mr-2" />
            记住未完成的文件操作
        </Button>
    )

    return [
        <div key="offline-uppy-wrapper">
            {uploadDom}
            <SaveStateButton />
        </div>,
        saveUppyState,
    ] as const
}