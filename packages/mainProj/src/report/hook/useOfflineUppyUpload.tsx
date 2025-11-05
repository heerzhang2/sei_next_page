
"use client"

import { useEffect, useCallback, useRef } from "react"
import { useUppyUpload, type FileStore } from "./useUppyUpload"
import { fileOperationsQueue } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import {Button} from "@/components/ui/button"
import { Clock } from "lucide-react"
import { toast } from "sonner"

/**
 * Enhanced useUppyUpload with offline support
 * Persists Uppy state and queues operations for offline processing
 */
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
}) {
    const { repId, hash, onFinish } = params
    const [uploadDom] = useUppyUpload(params)
    const uppyInstanceRef = useRef<Uppy | null>(null)
    const stateKey = `${repId}${hash ? `:${hash}` : ""}`

    const saveUppyState = useCallback(
        async (uppy: Uppy) => {
            if (!uppy) return

            const files = uppy.getFiles()
            if (files.length === 0) return

            const filesWithData = await Promise.all(
                files.map(async (file) => {
                    let data: ArrayBuffer | undefined
                    if (file.data instanceof Blob) {
                        data = await file.data.arrayBuffer()
                    }
                    return {
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data,
                        progress: file.progress?.percentage,
                        uploadURL: file.uploadURL,
                    }
                }),
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

            console.log("[OfflineUppy] Saved state:", stateKey, filesWithData.length, "files")
        },
        [repId, hash, stateKey],
    )

    useEffect(() => {
        const restoreState = async () => {
            const snapshot = await fileOperationsQueue.loadUppyState(repId, undefined, hash)
            if (!snapshot || !uppyInstanceRef.current) return

            console.log("[OfflineUppy] Restoring state:", snapshot.files.length, "files")

            // Restore files to Uppy
            for (const fileData of snapshot.files) {
                if (fileData.data) {
                    const blob = new Blob([fileData.data], { type: fileData.type })
                    const file = new File([blob], fileData.name, { type: fileData.type })

                    try {
                        uppyInstanceRef.current.addFile({
                            name: fileData.name,
                            type: fileData.type,
                            data: file,
                        })
                    } catch (error) {
                        console.error("[OfflineUppy] Failed to restore file:", fileData.name, error)
                    }
                }
            }

            // Restore meta
            if (snapshot.meta) {
                uppyInstanceRef.current.setMeta(snapshot.meta)
            }
        }

        restoreState()
    }, [repId, hash])

    const enhancedOnFinish = useCallback(
        async (file: any, del: boolean) => {
            // Call original onFinish
            if (onFinish) {
                onFinish(file, del)
            }

            // Clear saved state after successful operation
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
