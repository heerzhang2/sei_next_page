// hooks/use-auto-restore-mutations.ts
import { useEffect, useCallback } from "react"
import { mutationCompensationStorage } from "@/lib/mutation-compensation-storage"
import { toast } from "sonner"

interface UseAutoRestoreMutationsProps {
    repId: string
    enabled?: boolean
}

export function useAutoRestoreMutations({ repId, enabled = true }: UseAutoRestoreMutationsProps) {
    const checkAndRestoreMutations = useCallback(async () => {
        if (!repId || repId === "*" || !enabled) return

        try {
            console.log(`[AutoRestore] 开始检查补偿存储，repId: ${repId}`)

            // 初始化补偿存储
            await mutationCompensationStorage.init()

            // 获取所有补偿备份
            const allBackups = await mutationCompensationStorage.getAllCached()

            // 过滤出当前repId对应的modifyOriginalRecordData变更
            const relevantBackups = allBackups.filter(backup => {
                const isModifyMutation = backup.query.includes('mutation useOriginalDataMutation')
                const matchesRepId = backup.variables?.id === repId
                return isModifyMutation && matchesRepId
            })

            if (relevantBackups.length === 0) {
                console.log(`[AutoRestore] 未找到repId ${repId} 的相关备份`)
                return
            }

            console.log(`[AutoRestore] 找到 ${relevantBackups.length} 个相关备份`)

            // 获取当前URQL metadata队列
            const currentMetadata = await getCurrentUrqlMetadata()
            console.log(`[AutoRestore] 当前metadata队列数量: ${currentMetadata.length}`)

            let needsRestore = false
            const backupsToRestore = []

            // 检查每个相关备份是否需要恢复
            for (const backup of relevantBackups) {
                const shouldRestore = await shouldRestoreBackup(backup, currentMetadata)
                if (shouldRestore) {
                    needsRestore = true
                    backupsToRestore.push(backup)
                    console.log(`[AutoRestore] 需要恢复备份: ${backup.id}`, backup.variables)
                }
            }

            if (needsRestore && backupsToRestore.length > 0) {
                console.log(`[AutoRestore] 开始恢复 ${backupsToRestore.length} 个备份到metadata队列`)

                // 设置恢复标记，防止metadata被清空
                localStorage.setItem("isAutoRestoring", "true")

                // 恢复备份到metadata队列
                const restoredCount = await restoreBackupsToMetadata(backupsToRestore, currentMetadata)

                console.log(`[AutoRestore] 成功恢复 ${restoredCount} 个mutation`)

                if (restoredCount > 0) {
                    toast.success(`已恢复 ${restoredCount} 个未保存的变更`, {
                        description: "页面将刷新以同步最新数据",
                        duration: 3000,
                    })

                    // 短暂延迟后刷新页面
                    setTimeout(() => {
                        console.log("[AutoRestore] 自动刷新页面以同步数据")
                        window.location.reload()
                    }, 2000)
                }

                // 清除恢复标记
                setTimeout(() => {
                    localStorage.removeItem("isAutoRestoring")
                }, 3000)
            } else {
                console.log("[AutoRestore] 无需恢复，所有备份已在metadata队列中")
            }

        } catch (error) {
            console.error("[AutoRestore] 自动恢复失败:", error)
            localStorage.removeItem("isAutoRestoring")
        }
    }, [repId, enabled])

    useEffect(() => {
        if (enabled && repId && repId !== "*") {
            // 延迟执行，确保页面加载完成
            const timer = setTimeout(() => {
                checkAndRestoreMutations()
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [repId, enabled, checkAndRestoreMutations])

    return { checkAndRestoreMutations }
}

// 获取当前URQL metadata队列
async function getCurrentUrqlMetadata(): Promise<any[]> {
    return new Promise((resolve) => {
        const request = indexedDB.open("graphcache-sei", 1)

        request.onsuccess = () => {
            const db = request.result
            if (!db.objectStoreNames.contains("metadata")) {
                resolve([])
                return
            }

            const transaction = db.transaction(["metadata"], "readonly")
            const store = transaction.objectStore("metadata")
            const getRequest = store.get("metadata")

            getRequest.onsuccess = () => {
                const metadata = getRequest.result || []
                resolve(Array.isArray(metadata) ? metadata : [metadata])
            }

            getRequest.onerror = () => {
                resolve([])
            }
        }

        request.onerror = () => {
            resolve([])
        }
    })
}

// 判断是否需要恢复备份
async function shouldRestoreBackup(backup: any, currentMetadata: any[]): Promise<boolean> {
    // 检查metadata中是否存在相同的mutation
    const existsInMetadata = currentMetadata.some(metadata => {
        // 基本匹配：相同的query和repId
        const basicMatch = metadata.query === backup.query &&
            metadata.variables?.id === backup.variables?.id

        if (!basicMatch) return false

        // 精确匹配：检查data变量是否完全一致
        const metadataData = JSON.stringify(metadata.variables?.data || {})
        const backupData = JSON.stringify(backup.variables?.data || {})

        return metadataData === backupData
    })

    // 如果metadata中不存在，或者存在但data不一致，都需要恢复
    return !existsInMetadata
}

// 恢复备份到metadata队列
async function restoreBackupsToMetadata(backups: any[], existingMetadata: any[]): Promise<number> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("graphcache-sei", 1)

        request.onsuccess = () => {
            const db = request.result

            if (!db.objectStoreNames.contains("metadata")) {
                db.createObjectStore("metadata")
            }

            const transaction = db.transaction(["metadata"], "readwrite")
            const store = transaction.objectStore("metadata")

            // 读取现有metadata
            const getRequest = store.get("metadata")

            getRequest.onsuccess = () => {
                try {
                    let currentMetadata: any[] = []

                    if (getRequest.result) {
                        currentMetadata = Array.isArray(getRequest.result) ? getRequest.result : [getRequest.result]
                    }

                    const seen = new Map<string, boolean>()
                    let restoredCount = 0

                    // 构建现有请求的标识映射
                    for (const request of currentMetadata) {
                        const key = generateRequestKey(request)
                        seen.set(key, true)
                    }

                    // 添加备份的mutation（去重）
                    for (const backup of backups) {
                        const request = {
                            query: backup.query,
                            variables: backup.variables,
                            extensions: backup.extensions,
                        }

                        const key = generateRequestKey(request)

                        if (!seen.has(key)) {
                            currentMetadata.push(request)
                            seen.set(key, true)
                            restoredCount++
                            console.log(`[AutoRestore] 添加备份到metadata: ${backup.operationName}`, backup.variables)
                        }
                    }

                    // 写入更新后的metadata
                    const putRequest = store.put(currentMetadata, "metadata")

                    putRequest.onsuccess = () => {
                        console.log(`[AutoRestore] 成功写入metadata，总数: ${currentMetadata.length}`)

                        // 更新localStorage显示
                        if (typeof window !== "undefined") {
                            localStorage.setItem(
                                "urql-metadata",
                                JSON.stringify({
                                    length: currentMetadata.length,
                                    timestamp: new Date().toLocaleString(),
                                    autoRestored: restoredCount,
                                    lastAutoRestore: new Date().toISOString(),
                                })
                            )
                        }

                        resolve(restoredCount)
                    }

                    putRequest.onerror = () => {
                        reject(putRequest.error)
                    }

                } catch (error) {
                    reject(error)
                }
            }

            getRequest.onerror = () => {
                reject(getRequest.error)
            }
        }

        request.onerror = () => {
            reject(request.error)
        }
    })
}

// 生成请求的唯一标识
function generateRequestKey(request: any): string {
    const { query, variables } = request
    if (variables?.id) {
        const dataHash = JSON.stringify(variables.data || {})
        return `${query}-${variables.id}-${dataHash}`
    }
    return `${query}-${JSON.stringify(variables || {})}`
}
