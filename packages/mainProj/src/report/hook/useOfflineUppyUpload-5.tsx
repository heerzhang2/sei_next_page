// useOfflineUppyUpload.tsx

"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { useUppyUpload, type FileStore } from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Clock, Upload, FileText } from "lucide-react"
import { toast } from "sonner"

// 检查浏览器是否支持 File System Access API
const isFileSystemAccessSupported = () => {
    return typeof window !== 'undefined' &&
        'showOpenFilePicker' in window
}

// 验证文件权限
async function verifyPermission(fileHandle: FileSystemFileHandle, readWrite: boolean = false) {
    const options: any = {};
    // 检查是否已经获得权限
    if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
    }
    // 请求权限
    if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
    }
    // 用户未授予权限
    return false;
}

// 选择文件并获取句柄（离线准备模式）
const selectFilesForOffline = async (): Promise<Array<{
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
                const hasPermission = await verifyPermission(handle, true)
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
            console.warn("Failed to select files for offline:", error)
            toast.error("选择文件失败", {
                description: "无法访问所选文件，请确保授予了必要的权限",
            })
        }
        return null
    }
}

// 从文件句柄恢复 File 对象
const restoreFileFromHandle = async (fileHandleData: any): Promise<File | null> => {
    if (!fileHandleData?.handle) return null

    try {
        // 验证权限
        const hasPermission = await verifyPermission(fileHandleData.handle)
        if (!hasPermission) {
            console.warn("没有权限访问保存的文件句柄")
            return null
        }

        const file = await fileHandleData.handle.getFile()
        return file
    } catch (error) {
        console.error("Failed to restore file from handle:", error)
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
    const [offlineFiles, setOfflineFiles] = useState<any[]>([])
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
            console.log(`[OfflineUppy] Saved state: ${stateKey}, ${fileCount} files`)

            toast.success("保存成功", {
                description: `已保存 ${fileCount} 个文件的状态`,
            })
        },
        [repId, hash, stateKey],
    )
    // 选择文件用于离线模式
    const selectOfflineFiles = useCallback(async () => {
        const fileHandles = await selectFilesForOffline()
        if (!fileHandles || fileHandles.length === 0) return

        // 获取现有的 meta 数据
        const currentState = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
        const existingMeta = currentState?.meta || {}

        // 如果没有 meta 数据，创建默认的 meta
        const defaultMeta = {
            eid: repId,
            liveDays: params.liveDays || 2,
            business: params.business || "rep"
        }
        const finalMeta = { ...defaultMeta, ...existingMeta }

        // 保存离线文件句柄到 IndexedDB
        const offlineFilesData = fileHandles.map((fileHandle, index) => ({
            id: `offline-${Date.now()}-${index}`,
            name: fileHandle.fileName,
            type: fileHandle.fileType,
            size: fileHandle.size,
            data: null,
            fileHandle: fileHandle,
            lastModified: fileHandle.lastModified,
            progress: 0,
            uploadURL: '',
            isOffline: true, // 标记为离线文件
            // 添加必要的 Uppy 文件属性
            meta: {
                name: fileHandle.fileName,
                type: fileHandle.fileType,
                size: fileHandle.size,
                lastModified: fileHandle.lastModified,
                relativePath: ''
            }
        }))

        const existingFiles = currentState?.files || []

        await fileOperationsQueue.saveUppyState({
            key: stateKey,
            repId,
            hash: hash || "default",
            timestamp: Date.now(),
            files: [...existingFiles, ...offlineFilesData],
            meta: finalMeta, // 使用正确的 meta 数据
            oldfiles: currentState?.oldfiles || [],
        })

        setOfflineFiles(prev => [...prev, ...offlineFilesData])

        toast.success("离线文件已保存", {
            description: `已添加 ${fileHandles.length} 个文件到离线队列`,
        })
    }, [repId, hash, stateKey, params.liveDays, params.business])

    // 将离线文件转移到 Uppy 进行上传;
    const transferOfflineFilesToUppy = useCallback(async () => {
        if (!uppyInstanceRef.current || offlineFiles.length === 0) return

        let transferredCount = 0

        // 获取当前的 meta 数据
        const currentMeta = uppyInstanceRef.current.getState().meta || {}

        for (const offlineFile of offlineFiles) {
            try {
                const file = await restoreFileFromHandle(offlineFile.fileHandle)
                if (file) {
                    const fileToAdd = {
                        name: offlineFile.name,
                        type: offlineFile.type,
                        data: file,
                        meta: {
                            relativePath: '',
                            lastModified: offlineFile.lastModified || Date.now(),
                            ...currentMeta
                        }
                    }

                    uppyInstanceRef.current.addFile(fileToAdd)
                    transferredCount++

                    console.log(`[OfflineUppy] Transferred offline file to Uppy:`, offlineFile.name)
                }
            } catch (error) {
                console.error("Failed to transfer offline file to Uppy:", offlineFile.name, error)
            }
        }

        if (transferredCount > 0) {
            // 从状态中移除已转移的离线文件
            const currentState = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (currentState) {
                const updatedFiles = currentState.files.filter(f => !f.isOffline)
                await fileOperationsQueue.saveUppyState({
                    ...currentState,
                    files: updatedFiles,
                })
            }

            setOfflineFiles([])
            toast.success(`已转移 ${transferredCount} 个文件到上传队列`)

            // Uppy 会自动处理文件添加和显示，不需要手动刷新
            console.log(`[OfflineUppy] Successfully transferred ${transferredCount} files to Uppy`)
        }
    }, [offlineFiles, repId, hash])

// 恢复状态（包括正常文件和离线文件）
    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) return

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")
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
            const offlineFilesList: any[] = []

            for (const fileData of snapshot.files) {
                try {
                    let fileToRestore: File | null = null

                    // 优先从文件句柄恢复
                    if (fileData.fileHandle) {
                        fileToRestore = await restoreFileFromHandle(fileData.fileHandle)
                        if (fileToRestore) {
                            fromHandleCount++
                            console.log("[OfflineUppy] Restored from file handle:", fileData.name)

                            // 如果是离线文件，保存到状态中
                            if (fileData.isOffline) {
                                offlineFilesList.push(fileData)
                            }
                        }
                    }

                    // 如果文件句柄恢复失败，尝试从数据恢复（仅限正常文件）
                    if (!fileToRestore && fileData.data && !fileData.isOffline) {
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
                    }

                    if (!fileToRestore) {
                        console.warn("[OfflineUppy] Cannot restore file, skipping:", fileData.name)
                        continue
                    }

                    // 只将正常文件添加到 Uppy，离线文件保持独立
                    if (!fileData.isOffline) {
                        const files = uppyInstanceRef.current.getFiles()
                        const fileExists = files.some(file =>
                            file.name === fileData.name && file.size === fileData.size
                        )

                        if (!fileExists) {
                            const fileToAdd = {
                                name: fileData.name,
                                type: fileData.type,
                                data: fileToRestore,
                                meta: {
                                    relativePath: '',
                                    lastModified: fileData.lastModified || Date.now(),
                                    // 包含必要的 meta 数据
                                    ...snapshot.meta
                                }
                            }
                            uppyInstanceRef.current.addFile(fileToAdd)
                            restoredCount++
                        }
                    }
                } catch (error) {
                    console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
                }
            }

            // 更新离线文件状态
            setOfflineFiles(offlineFilesList)

            if (snapshot.oldfiles) {
                uppyInstanceRef.current.setState({ oldfiles: snapshot.oldfiles })
            }

            console.log(`[OfflineUppy] State restoration completed: ${restoredCount} files restored (${fromHandleCount} from handles), ${offlineFilesList.length} offline files`)

            if (restoredCount > 0 || offlineFilesList.length > 0) {
                toast.success(`恢复完成`, {
                    description: `已恢复 ${restoredCount} 个上传文件，${offlineFilesList.length} 个离线文件`,
                })
            }
        }

        setTimeout(() => {
            restoreState()
        }, 100)
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

            {/* 离线准备模式操作 */}
            <div className="border-t pt-2">
                <p className="text-xs text-gray-500 mb-2">离线准备模式：</p>
                <div className="flex gap-2">
                    {isFileSystemAccessSupported() && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={selectOfflineFiles}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            选择离线文件
                        </Button>
                    )}

                    {offlineFiles.length > 0 && (
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={transferOfflineFilesToUppy}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            开始上传离线文件 ({offlineFiles.length})
                        </Button>
                    )}
                </div>

                {offlineFiles.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                        已准备 {offlineFiles.length} 个离线文件等待上传
                    </div>
                )}
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