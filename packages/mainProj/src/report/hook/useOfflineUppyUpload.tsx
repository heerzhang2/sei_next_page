//src\report\hook\useOfflineUppyUpload.tsx
"use client"
import { useEffect, useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useUppyUpload, type FileStore, type PendingDeleteOperation } from "./useUppyUpload"
import { fileOperationsQueue, generateUppyStateKey, type UppyStateSnapshot } from "@/lib/file-operations-queue"
import type Uppy from "@uppy/core"
import { Button } from "@/components/ui/button"
import { Upload, FolderOpen, Trash2, RotateCcw, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// 检查浏览器是否支持 File System Access API
const isFileSystemAccessSupported = () => {
    return typeof window !== "undefined" && "showOpenFilePicker" in window
}
// 验证文件权限
export async function verifyPermission(fileHandle: FileSystemFileHandle, readWrite = false) {
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
            toast.error(`添加失败: ${fileHandle.fileName}；`+error)
        }
    }
    return addedCount
}
// 获取当前页面URL用于恢复
const getCurrentPageUrl = () => {
    if (typeof window !== "undefined") {
        // 返回已经去除了协议和域名的路径
        return window.location.pathname + window.location.search + window.location.hash
    }
    return ""
}

/*支持报告的文件离线操作能力：句柄方式添加对离线状态存储的才有意义。
@param onSaveState: 单线图情况特别的，需确保storeObj不是空的对象！避免上级数组序号丢失状态不一致
 * */
export function useOfflineUppyUpload(params: {
    repId: string
    hash: string
    storeObj: FileStore | FileStore[]
    maxFile?: number
    liveDays?: number
    maxSize?: number
    onFinish?: (file: any, newUpload: boolean) => void
    id?: string
    business?: string
    modType?: string
    redId?: number
    subrid?: string
    onSaveState?: (key: string, fileCount: number, delCount: number) => void
}) {
    const router = useRouter()
    const { repId, subrid, redId, hash, onFinish, onSaveState } = params
    const stateKey = generateUppyStateKey(repId, subrid, redId, hash)
    console.log(`[OfflineUppy] Generated stateKey: ${stateKey}`)
    const [pendingDeleteOperations, setPendingDeleteOperations] = useState<PendingDeleteOperation[]>([])
    // 检查是否有保存的状态
    const [hasSavedState, setHasSavedState] = useState(false)
    // 检查是否应该开启 uppy 面板
    const [shouldOpenUppy, setShouldOpenUppy] = useState(false)
    // 检查是否有下一条待处理操作
    const [hasNextPendingOperation, setHasNextPendingOperation] = useState(false)
    // 状态恢复加载状态
    const [isRestoringState, setIsRestoringState] = useState(true)
    const [preloadedSnapshot, setPreloadedSnapshot] = useState<UppyStateSnapshot | null>(null)
    const [isPreloaded, setIsPreloaded] = useState(false)
    // 使用 ref 来存储最新的 storeObj 值，避免闭包问题
    const latestStoreObjRef = useRef<FileStore | FileStore[]>(params.storeObj)
    const currentStateKeyRef = useRef<string>(stateKey)
    const prevStateKeyRef = useRef<string>(stateKey)
    // 添加一个 ref 来跟踪当前是否正在检查状态，防止异步的竞态条件
    // const isCheckingRef = useRef<boolean>(false)
    // const checkingStateKeyRef = useRef<string>("")
    const uppyInstanceRef = useRef<Uppy | null>(null)
    const pendingDeleteOperationsRef = useRef<any[]>([])

    useEffect(() => {
        const prevKey = currentStateKeyRef.current
        currentStateKeyRef.current = stateKey
        if (prevKey !== stateKey) {
            console.log(`[OfflineUppy] stateKey changed from ${prevKey} to ${stateKey}, starting preload`)
            prevStateKeyRef.current = stateKey
            // 重置状态
            setIsPreloaded(false)
            setPreloadedSnapshot(null)
            setHasSavedState(false)
            setHasNextPendingOperation(false)
            setShouldOpenUppy(false)
            setPendingDeleteOperations([])
            setIsRestoringState(true)
        }
    }, [stateKey])

    useEffect(() => {
        let isCancelled = false
        const capturedStateKey = stateKey
        const preloadState = async () => {
            console.log(`[OfflineUppy] Preloading state START for key: ${capturedStateKey}`)
            try {
                // 最早的前提动作：从 IndexedDB 加载状态
                const snapshot = await fileOperationsQueue.loadUppyState(capturedStateKey)
                // 检查是否已取消或 stateKey 已变化
                if (isCancelled || currentStateKeyRef.current !== capturedStateKey) {
                    console.log(`[capturedStateKey] Preload CANCELLED for key: ${capturedStateKey}, current key: ${currentStateKeyRef.current}`)
                    return
                }
                if (snapshot) {
                    console.log(`[OfflineUppy] Preloaded snapshot for key: ${capturedStateKey}`, {
                        files: snapshot.files?.length || 0,
                        pendingDeletes: snapshot.meta?.pendingDeleteOperations?.length || 0,
                    })
                    setPreloadedSnapshot(snapshot)
                    setHasSavedState(true)
                    // 从 snapshot 中恢复待删除操作
                    if (snapshot.meta?.pendingDeleteOperations) {
                        setPendingDeleteOperations(snapshot.meta.pendingDeleteOperations)
                    }
                } else {
                    console.log(`[OfflineUppy] No saved state for key: ${capturedStateKey}`)
                    setPreloadedSnapshot(null)
                    setHasSavedState(false)
                }
                // 标记预加载完成
                setIsPreloaded(true)
                // 检查是否有下一条待处理操作
                checkNextPendingOperation()
            } catch (error) {
                console.error(`[OfflineUppy] Preload FAILED for key: ${capturedStateKey}`, error)
                if (!isCancelled && currentStateKeyRef.current === capturedStateKey) {
                    setIsPreloaded(true)
                    setPreloadedSnapshot(null)
                }
            }
        }
        preloadState()
        return () => {
            isCancelled = true      //管道单线图居然都会执行到此！
        }
    }, [stateKey])

    // 更新 ref 当 storeObj 变化时
    useEffect(() => {
        latestStoreObjRef.current = params.storeObj
    }, [params.storeObj])

    // 检查是否有下一条待处理操作（循环逻辑）
    const checkNextPendingOperation = useCallback(async () => {
        try {
            const allGroups = await fileOperationsQueue.getGroupedUppyStates()
            // 找到当前分组
            const currentGroup = allGroups.find(
                (group) => group.repId === repId && (group.subrid === subrid || (!group.subrid && !subrid)),
            )
            // 只有唯一一条时才没有下一条，否则总是有下一条（循环）
            if (!currentGroup || currentGroup.snapshots.length <= 1) {
                setHasNextPendingOperation(false)
                return
            }
            // 只要有超过1条，就肯定有下一条（循环逻辑）
            setHasNextPendingOperation(true)
        } catch (error) {
            console.error("[OfflineUppy] Failed to check next pending operation:", error)
            setHasNextPendingOperation(false)
        }
    }, [repId, subrid]) // 移除 stateKey 依赖，使用 ref 代替

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
            // 如果还有文件未上传完成，直接返回
            if (hasIncompleteFiles) {
                console.log(`[OfflineUppy] CheckState: Has incomplete files, skipping clear.`)
                return
            }
            // 检查待删除操作
            if (pendingDeleteOperations.length > 0) {
                console.log(`[OfflineUppy] CheckState: Has pending deletes, skipping clear.`)
                return
            }
            // 执行清理
            console.log(`[OfflineUppy] CheckState: All clear (No incomplete files, no pending deletes). Clearing DB...`)
            await fileOperationsQueue.removeUppyState(stateKey)
            setHasSavedState(false)
            setPendingDeleteOperations([])
            toast.info("状态已自动清理", {
                description: "所有上传和删除操作均已完成",
            })
        } catch (error) {
            console.error("[OfflineUppy] CheckState error:", error)
        }
    }, [stateKey, pendingDeleteOperations])

    // 检查特定文件是否在待删除队列中
    const isFilePendingDelete = useCallback(
        (fileUrl: string) => {
            return pendingDeleteOperations.some((op) => op.deleteUrl === fileUrl)
        },
        [pendingDeleteOperations],
    )
    //取消删除的函数
    const cancelPendingDelete = useCallback((fileUrl: string) => {
        setPendingDeleteOperations((prev) => prev.filter((op) => op.deleteUrl !== fileUrl))
        toast.success("已取消删除操作", {
            description: "文件已从待删除队列中移除",
            duration: 2000,
        })
    }, [])
    const addPendingDelete = useCallback(
        (operation: PendingDeleteOperation) => {
            setPendingDeleteOperations((prev) => {
                // 避免重复添加同一个 deleteUrl
                if (prev.some((op) => op.deleteUrl === operation.deleteUrl)) {
                    return prev
                }
                return [...prev, operation]
            })
        },
        [pendingDeleteOperations],
    )
    const onFinishNew = useCallback(
        (file: any, newUpload: boolean) => {
            // 调用原始的 onFinish
            if (onFinish) {
                onFinish(file, newUpload)
            }
            // 延迟执行检查，确保状态更新
            setTimeout(() => {
                checkAndClearState()
            }, 500)
        },
        [onFinish, checkAndClearState],
    )
    //将恢复的待删除操作传递给 父类hook：useUppyUpload
    const { uploadDom, uppyInstance, delOssFileFunc } = useUppyUpload({
        id: params.id,
        storeObj: params.storeObj,
        hash: params.hash,
        maxFile: params.maxFile,
        liveDays: params.liveDays,
        maxSize: params.maxSize,
        business: params.business,
        eid: repId,
        stateKey,
        onFinish: onFinishNew,
        open: shouldOpenUppy,
        isFilePendingDelete,
        cancelPendingDelete,
        addPendingDelete,
        preloadedSnapshot: isPreloaded ? preloadedSnapshot : undefined,
        isPreloaded,
    })

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
            // 如果没有待上传文件且没有待删除操作，清理 IndexedDB
            if (files.length === 0 && currentPendingDeletes.length === 0) {
                try {
                    // 清理 IndexedDB 中的状态数据
                    await fileOperationsQueue.removeUppyState(stateKey)
                    console.log(`[OfflineUppy] Cleared IndexedDB state for key: ${stateKey}`)
                    setHasSavedState(false)
                    setPendingDeleteOperations([])

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
                } as UppyStateSnapshot

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
                // 保存后立即重新检查状态，确保 pendingDeleteOperations 更新
                // await checkSavedState()
                // 更新保存状态
                setHasSavedState(true)
                //记住状态时的避免空对象，利用回调，保存数据库的 upfile="__keepEmptyObj"
                if(onSaveState)  onSaveState(stateKey,fileCount,deleteCount)
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
        ],
    )

    // 获取 basePath，用于处理链接
    const basePath = "/report";
    
    // 处理链接，移除重复的 basePath 前缀
    const normalizeUrl = (url: string) => {
        if (!url) return url;
        // 如果 URL 已经以 basePath 开头，则移除它
        if (url.startsWith(basePath)) {
            return url.slice(basePath.length);
        }
        return url;
    };
    
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
            const currentSnapshotIndex = sortedSnapshots.findIndex((snapshot) => snapshot.key === stateKey)
            // 获取下一个快照（循环逻辑）
            const nextIndex = (currentSnapshotIndex + 1) % sortedSnapshots.length
            const nextSnapshot = sortedSnapshots[nextIndex]

            if (nextSnapshot.meta?.originalPageUrl) {
                // 使用 normalizeUrl 处理 URL，移除重复的 basePath 前缀
                router.push(normalizeUrl(nextSnapshot.meta.originalPageUrl))
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
            setPendingDeleteOperations([])
            // 6. 更新保存状态
            setHasSavedState(false)
            toast.success("状态已清除", {
                description: "已移除所有保存的文件状态和待删除操作",
            })
        } catch (error) {
            console.error("[OfflineUppy] Failed to remove saved state:", error)
            toast.error("清除状态失败")
        }
    }, [stateKey, repId, params.liveDays, params.business])
    // 恢复状态时，从Uppy state恢复
    useEffect(() => {
        // 只有在预加载完成后才执行恢复
        if (!isPreloaded) {
            console.log(`[OfflineUppy] Waiting for preload to complete for key: ${stateKey}`)
            return
        }
        const capturedStateKey = stateKey
        const restoreState = async () => {
            console.log(`[OfflineUppy] Restoring state for key: ${capturedStateKey}`)
            // 检查 stateKey 是否已变化
            if (currentStateKeyRef.current !== capturedStateKey) {
                console.log(
                    `[OfflineUppy] Restore CANCELLED - stateKey changed from ${capturedStateKey} to ${currentStateKeyRef.current}`,
                )
                return
            }
            // 使用预加载的快照，而不是重新加载
            const snapshot = preloadedSnapshot
            if (!snapshot || !uppyInstanceRef.current) {
                console.log("[OfflineUppy] No snapshot or Uppy instance available", {
                    hasSnapshot: !!snapshot,
                    hasUppy: !!uppyInstanceRef.current,
                })
                if (!snapshot) {
                    setIsRestoringState(false)
                    setPendingDeleteOperations([])
                    // 清理现有文件
                    if (uppyInstanceRef.current) {
                        const currentFiles = uppyInstanceRef.current.getFiles()
                        if (currentFiles.length > 0) {
                            console.log(`[OfflineUppy] Clearing ${currentFiles.length} existing files from Uppy instance`)
                            currentFiles.forEach((file) => {
                                uppyInstanceRef.current?.removeFile(file.id)
                            })
                        }
                    }
                    setHasSavedState(false)
                }
                return
            }
            console.log("[OfflineUppy] Restoring state:", {
                key: snapshot.key,
                files: snapshot.files.length,
                pendingDeletes: snapshot.meta?.pendingDeleteOperations?.length,
            })

            // 从 snapshot 的 meta 中恢复待删除操作
            if (snapshot.meta?.pendingDeleteOperations) {
                console.log(
                    `[OfflineUppy] Found ${snapshot.meta.pendingDeleteOperations.length} pending delete operations in snapshot`,
                )
                setPendingDeleteOperations(snapshot.meta.pendingDeleteOperations)
            } else {
                console.log(`[OfflineUppy] No pending delete operations in snapshot, clearing pendingDeleteOperations`)
                setPendingDeleteOperations([])
            }
            // 注意：文件恢复逻辑已经移到 useUppyUpload 中通过 preloadedSnapshot 处理
            // 这里只需要处理待删除操作的恢复
            setIsRestoringState(false)
            setHasSavedState(true)
        }
        // 等待 Uppy 实例就绪后执行恢复
        const waitForUppy = () => {
            if (uppyInstanceRef.current) {
                restoreState()
            } else {
                // 如果 Uppy 还没准备好，等待一下
                setTimeout(waitForUppy, 100)
            }
        }
        waitForUppy()
    }, [isPreloaded, preloadedSnapshot, stateKey])

    // 执行待删除操作 - 使用动态回调版本
    const executePendingDeletes = useCallback(async () => {
        const operationsToExecute = pendingDeleteOperations
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
                        toast.warning("删除操作", {description: `服务器应答: ${result}`,})
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

                // 从 pendingDeleteOperations 状态中移除成功的操作
                setPendingDeleteOperations((prev) => prev.filter((op) => !successfulDeleteUrls.includes(op.deleteUrl)))

                // 同步清理 useUppyUpload 中的 pendingDeleteOperations
                // removePendingDeleteOperations(successfulDeleteUrls)

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
                const actualPendingDeletes = pendingDeleteOperations.length - successfulOperations.length
                const hasPendingDeletes = actualPendingDeletes > 0

                // 如果没有不完整的文件（即所有文件都已完成，或者没有文件）且没有待删除操作，清理 IndexedDB
                if (!hasIncompleteFiles && !hasPendingDeletes) {
                    await fileOperationsQueue.removeUppyState(stateKey)
                    console.log(`[OfflineUppy] Cleared IndexedDB state after delete operations: ${stateKey}`)
                    setHasSavedState(false)
                    setPendingDeleteOperations([])

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
                // await checkSavedState()
                console.log(`isAllUploaded: ${isAllUploaded} 需清理`)
            }
        } catch (error) {
            console.error("[OfflineUppy] Error executing pending deletes:", error)
            toast.error("执行删除操作时发生错误")
        }
    }, [pendingDeleteOperations, delOssFileFunc, onFinish, params.maxFile, params.storeObj])
    //[离线场景增强]通过文件句柄方式添加文件到 Uppy，避免占用缓存空间
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
        return (
            <div className="flex flex-col gap-2 mt-2 relative">
                {/* 加载状态遮罩 */}
                {isRestoringState && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-600">正在恢复状态...</p>
                        </div>
                    </div>
                )}
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
                                    disabled={isRestoringState}
                                    className="flex items-center bg-transparent"
                                >
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    句柄方式添加到上传面板中
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-green-600 mt-1">文件句柄方式添加：节省存储空间，文件未上传的可被替换</p>
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
                            disabled={isRestoringState}
                            className="flex items-center flex-1"
                        >
                            <Upload className="w-4 h-4" />
                            记住文件操作状态
                            {pendingDeleteOperations.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {pendingDeleteOperations.length} 待删
                </span>
                            )}
                        </Button>
                        
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="flex items-center"
                            title="刷新当前页面"
                        >
                          刷 新
                        </Button>

                        {hasSavedState && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    await cancelSavedState()
                                }}
                                disabled={isRestoringState}
                                className="flex items-center"
                            >
                                <Trash2 className="w-4 h-4" />
                                清除状态
                            </Button>
                        )}
                    </div>
                    { hasNextPendingOperation && (
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
                    {pendingDeleteOperations.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={executePendingDeletes}
                                disabled={!(pendingDeleteOperations.length > 0) || isRestoringState}
                                className="flex items-center flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                执行待删除操作 ({pendingDeleteOperations.length})
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
