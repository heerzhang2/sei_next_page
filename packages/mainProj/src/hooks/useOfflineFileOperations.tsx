"use client"

import { useEffect, useState, useCallback } from "react"
import { fileOperationsQueue, type FileOperation } from "@/lib/file-operations-queue"
import { useNetworkStatusContext } from "@/contexts/network-status-context"
import { toast } from "sonner"
import { getAuthToken } from "@/lib/auth-token"

/**
 * Hook to manage offline file operations queue
 * Automatically processes pending operations when online
 */
export function useOfflineFileOperations() {
    const [pendingOperations, setPendingOperations] = useState<FileOperation[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const { isClientOnline, isGraphQLBackendReachable } = useNetworkStatusContext()

    useEffect(() => {
        fileOperationsQueue.getPendingOperations().then(setPendingOperations)
    }, [])

    useEffect(() => {
        const unsubscribe = fileOperationsQueue.onProcessingNeeded((operations) => {
            setPendingOperations(operations)
        })
        return unsubscribe
    }, [])

    const processUpload = useCallback(async (operation: FileOperation): Promise<void> => {
        if (!operation.file || !operation.uploadMeta) {
            throw new Error("Missing upload data")
        }

        const formData = new FormData()
        const blob = new Blob([operation.file.data], { type: operation.file.type })
        const file = new File([blob], operation.file.name, { type: operation.file.type })

        formData.append("files[]", file)
        formData.append("eid", operation.uploadMeta.eid)
        formData.append("liveDays", operation.uploadMeta.liveDays.toString())
        formData.append("business", operation.uploadMeta.business)

        const token = await getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END}/api/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        if (!data.successful || !data.successful[0]) {
            throw new Error("Upload response invalid")
        }

        return data.successful[0]
    }, [])

    const processDelete = useCallback(async (operation: FileOperation): Promise<void> => {
        if (!operation.deleteUrl) {
            throw new Error("Missing delete URL")
        }

        const token = await getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END}/api/oss/delete`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file: operation.deleteUrl,
                key: "eid",
                value: operation.repId,
            }),
        })

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`)
        }

        const result = await response.text()
        return result
    }, [])

    const processQueue = useCallback(async () => {
        if (isProcessing || !isClientOnline || !isGraphQLBackendReachable) {
            return
        }

        const operations = await fileOperationsQueue.getPendingOperations()
        if (operations.length === 0) {
            return
        }

        setIsProcessing(true)
        console.log("[FileQueue] Processing", operations.length, "operations")

        for (const operation of operations) {
            try {
                await fileOperationsQueue.updateOperation(operation.id, { status: "processing" })

                let result: any
                if (operation.type === "upload") {
                    result = await processUpload(operation)
                } else if (operation.type === "delete") {
                    result = await processDelete(operation)
                }

                await fileOperationsQueue.updateOperation(operation.id, {
                    status: "completed",
                    result,
                })

                // Remove completed operation after short delay
                setTimeout(() => {
                    fileOperationsQueue.removeOperation(operation.id)
                }, 5000)

                toast.success(`文件${operation.type === "upload" ? "上传" : "删除"}成功`, {
                    description: operation.file?.name || operation.deleteUrl,
                })
            } catch (error: any) {
                console.error("[FileQueue] Operation failed:", operation.id, error)

                const retryCount = operation.retryCount + 1
                if (retryCount < 3) {
                    await fileOperationsQueue.updateOperation(operation.id, {
                        status: "pending",
                        retryCount,
                        lastError: error.message,
                    })
                } else {
                    await fileOperationsQueue.updateOperation(operation.id, {
                        status: "failed",
                        lastError: error.message,
                    })
                    toast.error(`文件操作失败`, {
                        description: `${operation.file?.name || operation.deleteUrl}: ${error.message}`,
                    })
                }
            }
        }

        setIsProcessing(false)
        const remaining = await fileOperationsQueue.getPendingOperations()
        setPendingOperations(remaining)
    }, [isProcessing, isClientOnline, isGraphQLBackendReachable, processUpload, processDelete])

    useEffect(() => {
        if (isClientOnline && isGraphQLBackendReachable && pendingOperations.length > 0) {
            processQueue()
        }
    }, [isClientOnline, isGraphQLBackendReachable, pendingOperations.length, processQueue])

    return {
        pendingOperations,
        isProcessing,
        processQueue,
    }
}
