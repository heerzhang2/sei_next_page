// useOfflineUppyUpload.tsx

"use client"

import { useEffect, useCallback, useRef } from "react"
import { useUppyUpload, type FileStore } from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { toast } from "sonner"

// 辅助函数：将 ArrayBuffer 转换回 File 对象
const arrayBufferToFile = (arrayBuffer: ArrayBuffer, fileName: string, fileType: string, lastModified?: number): File => {
    const blob = new Blob([arrayBuffer], { type: fileType })
    return new File([blob], fileName, {
        type: fileType,
        lastModified: lastModified || Date.now()
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

            // 保存时保留 File 对象，而不是转换为 ArrayBuffer
            const filesWithData = files.map((file) => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                data: file.data, // 直接保存 File 对象
                lastModified: file.data instanceof File ? file.data.lastModified : undefined,
                progress: file.progress?.percentage,
                uploadURL: file.uploadURL,
            }))

            await fileOperationsQueue.saveUppyState({
                key: stateKey,
                repId,
                hash: hash || "default",
                timestamp: Date.now(),
                files: filesWithData,
                meta: uppy.getState().meta,
                oldfiles: uppy.getState().oldfiles,
            })

            console.log("[OfflineUppy] Saved state:", stateKey, filesWithData.length, "files")
        },
        [repId, hash, stateKey],
    )

    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) return

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")
            console.log("[OfflineUppy] File data types:", snapshot.files.map(f => ({
                name: f.name,
                dataType: f.data?.constructor?.name,
                isFile: f.data instanceof File,
                isArrayBuffer: f.data instanceof ArrayBuffer
            })))

            // 先暂停 Uppy 的所有活动
            uppyInstanceRef.current.pauseAll()

            let restoredCount = 0

            for (const fileData of snapshot.files) {
                try {
                    let fileToRestore: File | null = null

                    if (fileData.data instanceof File) {
                        // 如果已经是 File 对象，直接使用
                        fileToRestore = fileData.data
                    } else if (fileData.data instanceof ArrayBuffer) {
                        // 如果是 ArrayBuffer，转换为 File
                        fileToRestore = arrayBufferToFile(
                            fileData.data,
                            fileData.name,
                            fileData.type,
                            fileData.lastModified
                        )
                    } else if (fileData.data) {
                        // 其他类型的数据，尝试处理
                        console.warn("[OfflineUppy] Unexpected data type:", fileData.data.constructor?.name)
                        continue
                    } else {
                        console.warn("[OfflineUppy] No file data available for:", fileData.name)
                        continue
                    }

                    const files = uppyInstanceRef.current.getFiles()

                    // 检查文件是否已经存在
                    const fileExists = files.some(file =>
                        file.name === fileData.name &&
                        file.size === fileData.size
                    )

                    if (!fileExists && fileToRestore) {
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
                        console.log("[OfflineUppy] Restored file:", fileData.name)
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

            console.log(`[OfflineUppy] State restoration completed: ${restoredCount}/${snapshot.files.length} files restored`)

            if (restoredCount > 0) {
                toast.success(`已恢复 ${restoredCount} 个文件`, {
                    description: "可以继续上传操作",
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