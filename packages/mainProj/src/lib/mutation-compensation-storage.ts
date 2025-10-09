import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage"
import type { SerializedRequest } from "@urql/exchange-graphcache"
import { IndexedDBCache, type BaseCacheItem } from "./indexeddb-cache"

/**
 * 补偿备份的mutation项
 * 独立于URQL的metadata存储,用于防止队列丢失
 */
export interface CompensationMutationItem extends BaseCacheItem {
  id: string // 使用 query + variables 的hash作为唯一标识
  query: string
  variables: any
  extensions?: Record<string, any>
  timestamp: number // mutation首次发送时间
  backupTimestamp: number // 写入备份的时间
  operationName: string // 操作名称,便于UI显示
  retryCount: number // 重试次数
  lastRetryTime?: number // 最后一次重试时间
  status: "pending" | "retrying" | "success" | "failed"
}

/**
 * Mutation补偿存储管理器
 * 提供独立的备份机制,防止URQL队列丢失
 */
export class MutationCompensationStorage extends IndexedDBCache<CompensationMutationItem> {
  constructor() {
    super({
      dbName: "mutation-compensation-backup",
      storeName: "compensation-mutations",
      version: 1,
    })
  }

  /**
   * 检查是否为 modifyOriginalRecordData mutation
   */
  private isModifyOriginalRecordDataMutation(query: string): boolean {
    return query.includes('mutation useOriginalDataMutation');
  }

  /**
   * 生成针对 modifyOriginalRecordData 的唯一标识
   */
  private generateModifyRecordKey(variables: any): string {
    if (!variables?.id) return null;
    // 使用 id 和 version 作为唯一标识
    return `modify_${variables.id}_${variables.version || '0'}`;
  }

  /**
   * 生成mutation的唯一ID
   */
  private generateMutationId(query: string, variables: any): string {
    // 针对 modifyOriginalRecordData 使用特殊标识
    const isModifyMutation = this.isModifyOriginalRecordDataMutation(query);
    if (isModifyMutation && variables?.id) {
      // 使用 id + version 作为标识
      const version = variables.version || '0';
      return `modify_${variables.id}_${version}_${Date.now()}`;
    }
    // 其他mutation使用原来的逻辑
    const content = `${query}_${JSON.stringify(variables || {})}`;
    // 简单hash函数
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `mutation_${Math.abs(hash)}_${Date.now()}`;
  }

  /**
   * 提取操作名称
   */
  private extractOperationName(query: string): string {
    const match = query.match(/mutation\s+(\w+)/)
    return match?.[1] || "UnknownMutation"
  }

  /**
   * 智能备份mutation，针对modifyOriginalRecordData只保留最新版本
   * @param query GraphQL mutation查询
   * @param variables 变量
   * @param extensions 扩展信息
   */
  async backupMutation(query: string, variables: any, extensions?: Record<string, any>): Promise<string> {
    await this.init();

    // 检查是否为 modifyOriginalRecordData mutation
    const isModifyMutation = this.isModifyOriginalRecordDataMutation(query);

    if (isModifyMutation && variables?.id) {
      const recordKey = this.generateModifyRecordKey(variables);

      if (recordKey) {
        // 获取所有现有的备份
        const allBackups = await this.getAllCached();

        // 查找同一记录的所有备份
        const existingBackupsForRecord = allBackups.filter(backup => {
          if (!this.isModifyOriginalRecordDataMutation(backup.query)) return false;
          const backupKey = this.generateModifyRecordKey(backup.variables);
          return backupKey && backupKey.startsWith(`modify_${variables.id}_`);
        });

        // 删除同一记录的旧备份
        for (const oldBackup of existingBackupsForRecord) {
          await this.removeMutationBackup(oldBackup.query, oldBackup.variables);
          console.log(`[CompensationBackup] 删除旧版本备份: ${oldBackup.operationName}, ID: ${oldBackup.variables.id}, Version: ${oldBackup.variables.version || '0'}`);
        }

        console.log(`[CompensationBackup] 已清理 ${existingBackupsForRecord.length} 个旧版本备份，保留最新版本`);
      }
    }

    // 添加新备份
    return await this.addMutationBackup(query, variables, extensions);
  }

  /**
   * 添加mutation到补偿备份
   * @param query GraphQL mutation查询
   * @param variables 变量
   * @param extensions 扩展信息
   */
  async addMutationBackup(query: string, variables: any, extensions?: Record<string, any>): Promise<string> {
    const id = this.generateMutationId(query, variables)
    const operationName = this.extractOperationName(query)
    const now = Date.now()

    const item: CompensationMutationItem = {
      id,
      query,
      variables,
      extensions,
      timestamp: now,
      backupTimestamp: now,
      operationName,
      retryCount: 0,
      status: "pending",
    }

    await this.addItem(item, 2000) // 最多保存2000个备份
    console.log(`[CompensationBackup] 已备份mutation: ${operationName} (ID: ${id})`)
    return id
  }

  /**
   * 智能删除补偿备份，针对modifyOriginalRecordData根据id和version精确删除
   */
  async removeBackup(query: string, variables: any): Promise<void> {
    await this.init();

    // 检查是否为 modifyOriginalRecordData mutation
    const isModifyMutation = this.isModifyOriginalRecordDataMutation(query);

    if (isModifyMutation && variables?.id) {
      // 对于 modifyOriginalRecordData，根据 id 和 version 精确删除
      const recordKey = this.generateModifyRecordKey(variables);

      if (recordKey) {
        // 获取所有备份
        const allBackups = await this.getAllCached();

        // 查找完全匹配的备份
        const exactMatchBackup = allBackups.find(backup => {
          if (!this.isModifyOriginalRecordDataMutation(backup.query)) return false;
          const backupKey = this.generateModifyRecordKey(backup.variables);
          return backupKey === recordKey;
        });

        if (exactMatchBackup) {
          await this.removeMutationBackup(exactMatchBackup.query, exactMatchBackup.variables);
          console.log(`[CompensationBackup] 精确删除备份: ${exactMatchBackup.operationName}, ID: ${variables.id}, Version: ${variables.version || '0'}`);
        } else {
          // 如果没有精确匹配，尝试删除同一id的所有备份（fallback）
          const backupsForId = allBackups.filter(backup => {
            if (!this.isModifyOriginalRecordDataMutation(backup.query)) return false;
            return backup.variables?.id === variables.id;
          });

          for (const backup of backupsForId) {
            await this.removeMutationBackup(backup.query, backup.variables);
          }
          console.log(`[CompensationBackup] 删除ID为 ${variables.id} 的所有备份，数量: ${backupsForId.length}`);
        }
      }
    } else {
      // 对于其他mutation，使用原来的逻辑
      await this.removeMutationBackup(query, variables);
    }
  }

  /**
   * 根据query和variables查找备份
   */
  async findMutationBackup(query: string, variables: any): Promise<CompensationMutationItem | null> {
    const allBackups = await this.getAllCached()
    return (
        allBackups.find((item) => {
          return item.query === query && JSON.stringify(item.variables) === JSON.stringify(variables)
        }) || null
    )
  }

  /**
   * 删除成功的mutation备份（原始方法，保持兼容性）
   */
  async removeMutationBackup(query: string, variables: any): Promise<void> {
    const backup = await this.findMutationBackup(query, variables)
    if (backup) {
      await this.deleteCache(backup.id)
      console.log(`[CompensationBackup] 已删除成功的mutation备份: ${backup.operationName}`)
    }
  }

  /**
   * 更新重试信息
   */
  async updateRetryInfo(id: string): Promise<void> {
    const allBackups = await this.getAllCached()
    const backup = allBackups.find((item) => item.id === id)

    if (backup) {
      const updatedBackup: CompensationMutationItem = {
        ...backup,
        retryCount: backup.retryCount + 1,
        lastRetryTime: Date.now(),
        status: "retrying",
      }

      await this.deleteCache(id)
      await this.addItem(updatedBackup, 200)
      console.log(`[CompensationBackup] 更新重试信息: ${backup.operationName}, 重试次数: ${updatedBackup.retryCount}`)
    }
  }

  /**
   * 标记mutation为成功
   */
  async markAsSuccess(id: string): Promise<void> {
    await this.deleteCache(id)
  }

  /**
   * 标记mutation为失败
   */
  async markAsFailed(id: string): Promise<void> {
    const allBackups = await this.getAllCached()
    const backup = allBackups.find((item) => item.id === id)

    if (backup) {
      const updatedBackup: CompensationMutationItem = {
        ...backup,
        status: "failed",
      }

      await this.deleteCache(id)
      await this.addItem(updatedBackup, 200)
    }
  }

  /**
   * 获取所有待处理的mutation
   */
  async getPendingMutations(): Promise<CompensationMutationItem[]> {
    const allBackups = await this.getAllCached()
    return allBackups.filter((item) => item.status === "pending" || item.status === "retrying")
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<{
    total: number
    pending: number
    retrying: number
    failed: number
  }> {
    const allBackups = await this.getAllCached()
    return {
      total: allBackups.length,
      pending: allBackups.filter((item) => item.status === "pending").length,
      retrying: allBackups.filter((item) => item.status === "retrying").length,
      failed: allBackups.filter((item) => item.status === "failed").length,
    }
  }

  /**
   * 清理旧的备份 (超过7天的)
   */
  async cleanupOldBackups(daysToKeep = 7): Promise<number> {
    const allBackups = await this.getAllCached()
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    let cleanedCount = 0

    for (const backup of allBackups) {
      if (backup.backupTimestamp < cutoffTime) {
        await this.deleteCache(backup.id)
        cleanedCount++
      }
    }

    console.log(`[CompensationBackup] 清理了 ${cleanedCount} 个旧备份`)
    return cleanedCount
  }

  /**
   * 获取所有备份（getAllCached的别名，保持向后兼容）
   */
  async getAllBackups(): Promise<CompensationMutationItem[]> {
    return this.getAllCached()
  }
    /**
     * 将补偿存储恢复到URQL metadata队列 - 安全版本
     */
    async restoreToMetadata(): Promise<number> {
        await this.init()
        const backups = await this.getAllCached()

        if (backups.length === 0) {
            console.log("[CompensationBackup] 没有备份需要恢复")
            return 0
        }

        try {
            // 设置恢复标记，防止URQL自动清空
            localStorage.setItem("isRestoringMetadata", "true")

            const restoredCount = await this.directWriteToUrqlMetadata(backups)

            console.log(`[CompensationBackup] 成功恢复 ${restoredCount} 个mutation到metadata队列`)

            // 不立即触发online事件，等待用户手动触发
            console.log("[CompensationBackup] 恢复完成，等待用户手动重试队列")

            // 清除恢复标记（设置短暂延迟确保URQL操作完成）
            setTimeout(() => {
                localStorage.removeItem("isRestoringMetadata")
            }, 3000)

            return restoredCount

        } catch (error) {
            console.error("[CompensationBackup] 恢复metadata失败:", error)
            localStorage.removeItem("isRestoringMetadata")
            // 尝试降级方案
            return await this.restoreToMetadataFallback(backups)
        }
    }

    /**
     * 安全触发队列处理（不立即清空metadata）
     */
    async triggerSafeQueueProcessing(): Promise<void> {
        // 设置标记防止清空
        localStorage.setItem("isRestoringMetadata", "true")

        // 触发online事件，但metadata不会被清空
        window.dispatchEvent(new Event("online"))

        // 5秒后清除标记
        setTimeout(() => {
            localStorage.removeItem("isRestoringMetadata")
            console.log("[CompensationBackup] 安全处理完成，清除恢复标记")
        }, 5000)
    }

  /**
   * 直接写入到 URQL 的 metadata 存储 - 修复版本
   */
  private async directWriteToUrqlMetadata(backups: CompensationMutationItem[]): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("graphcache-sei", 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        const db = request.result

        if (!db.objectStoreNames.contains("metadata")) {
          console.warn("[CompensationBackup] URQL metadata store not found, creating...")
          // 如果不存在，创建 metadata 存储
          db.createObjectStore("metadata")
        }

        const transaction = db.transaction(["metadata"], "readwrite")
        const store = transaction.objectStore("metadata")

        // 读取现有的 metadata
        const getRequest = store.get("metadata")

        getRequest.onsuccess = () => {
          try {
            let existingMetadata: SerializedRequest[] = []

            // 处理现有 metadata 数据
            if (getRequest.result) {
              if (Array.isArray(getRequest.result)) {
                existingMetadata = getRequest.result
              } else if (typeof getRequest.result === 'object') {
                // 如果是对象，尝试转换为数组
                existingMetadata = [getRequest.result]
              }
            }

            console.log(`[CompensationBackup] 现有metadata数量: ${existingMetadata.length}`)

            const seen = new Map<string, boolean>()
            let restoredCount = 0

            // 构建现有请求的标识映射
            for (const request of existingMetadata) {
              const key = this.generateRequestKey(request)
              seen.set(key, true)
            }

            // 添加备份的 mutation
            const requestsToAdd: SerializedRequest[] = []
            for (const backup of backups) {
              const request: SerializedRequest = {
                query: backup.query,
                variables: backup.variables,
                extensions: backup.extensions,
              }

              const key = this.generateRequestKey(request)

              // 检查是否已存在相同的请求
              if (!seen.has(key)) {
                requestsToAdd.push(request)
                seen.set(key, true)
                restoredCount++
                console.log(`[CompensationBackup] 准备恢复mutation: ${backup.operationName}`, request.variables)
              }
            }

            // 合并现有和新的请求
            const updatedMetadata = [...existingMetadata, ...requestsToAdd]
            console.log(`[CompensationBackup] 更新后metadata总数: ${updatedMetadata.length}`)

            // 写入更新后的 metadata
            const putRequest = store.put(updatedMetadata, "metadata")

            putRequest.onsuccess = () => {
              console.log(`[CompensationBackup] 成功写入metadata到IndexedDB，总数: ${updatedMetadata.length}`)

              // 验证写入是否成功
              const verifyRequest = store.get("metadata")
              verifyRequest.onsuccess = () => {
                const verifiedData = verifyRequest.result
                console.log(`[CompensationBackup] 验证写入结果:`,
                    Array.isArray(verifiedData) ? `数组长度: ${verifiedData.length}` : `类型: ${typeof verifiedData}`
                )

                // 更新 UI 显示
                this.updateMetadataDisplay(updatedMetadata.length, restoredCount)
                resolve(restoredCount)
              }
              verifyRequest.onerror = () => {
                console.error("[CompensationBackup] 验证写入失败:", verifyRequest.error)
                resolve(restoredCount) // 即使验证失败也返回成功计数
              }
            }

            putRequest.onerror = () => {
              console.error("[CompensationBackup] 写入metadata失败:", putRequest.error)
              reject(putRequest.error)
            }

          } catch (error) {
            console.error("[CompensationBackup] 处理metadata时出错:", error)
            reject(error)
          }
        }

        getRequest.onerror = () => {
          console.error("[CompensationBackup] 读取metadata失败:", getRequest.error)
          reject(getRequest.error)
        }

        transaction.oncomplete = () => {
          console.log("[CompensationBackup] 事务完成")
        }

        transaction.onerror = () => {
          console.error("[CompensationBackup] 事务失败:", transaction.error)
        }
      }

      request.onupgradeneeded = (event) => {
        console.log("[CompensationBackup] 数据库升级需要")
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("metadata")) {
          console.log("[CompensationBackup] 创建metadata对象存储")
          db.createObjectStore("metadata")
        }
      }
    })
  }

  /**
   * 触发 URQL 队列处理
   */
  private triggerUrqlQueueProcessing(): void {
    // 方法1: 触发 online 事件
    window.dispatchEvent(new Event("online"))

    // 方法2: 触发自定义事件
    window.dispatchEvent(new CustomEvent("urql:metadata-updated"))

    // 方法3: 直接调用 URQL 的重试机制（如果可用）
    if (typeof (window as any).__urql_client__ !== 'undefined') {
      // 这里可以根据你的 URQL 客户端实例进行调整
      console.log("[CompensationBackup] 检测到 URQL 客户端，触发重试")
    }

    // 方法4: 短暂离线再在线，强制刷新网络状态
    setTimeout(() => {
      window.dispatchEvent(new Event("offline"))
      setTimeout(() => {
        window.dispatchEvent(new Event("online"))
      }, 100)
    }, 500)
  }

  /**
   * 更新 metadata 显示
   */
  private updateMetadataDisplay(totalCount: number, restoredCount: number): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
          "urql-metadata",
          JSON.stringify({
            length: totalCount,
            timestamp: new Date().toLocaleString(),
            restoredFromCompensation: restoredCount,
            lastRestore: new Date().toISOString(),
          })
      )
    }
  }


  /**
   * 生成请求的唯一标识（用于去重）
   */
  private generateRequestKey(request: SerializedRequest): string {
    const { query, variables } = request
    if (variables?.id) {
      return `${query}-${variables.id}-${variables?.opType || ""}`
    }
    return `${query}-${JSON.stringify(variables || {})}`
  }

  /**
   * 降级方案：使用localStorage存储metadata
   */
  private async restoreToMetadataFallback(backups: CompensationMutationItem[]): Promise<number> {
    try {
      // 读取现有的localStorage metadata
      const currentMetadataStr = localStorage.getItem("urql-metadata-queue")
      const currentMetadata = currentMetadataStr ? JSON.parse(currentMetadataStr) : []

      let restoredCount = 0
      const seen = new Map<string, boolean>()

      // 构建已存在请求的标识映射
      for (const request of currentMetadata) {
        const key = this.generateRequestKey(request)
        seen.set(key, true)
      }

      // 添加备份的mutation
      for (const backup of backups) {
        const request: SerializedRequest = {
          query: backup.query,
          variables: backup.variables,
          extensions: backup.extensions,
        }

        const key = this.generateRequestKey(request)

        if (!seen.has(key)) {
          currentMetadata.push(request)
          seen.set(key, true)
          restoredCount++
        }
      }

      // 保存到localStorage
      localStorage.setItem("urql-metadata-queue", JSON.stringify(currentMetadata))

      // 更新metadata计数显示
      localStorage.setItem(
          "urql-metadata",
          JSON.stringify({
            length: currentMetadata.length,
            timestamp: new Date().toLocaleString(),
            restoredFromCompensation: restoredCount,
            usingFallback: true,
          })
      )

      console.log(`[CompensationBackup] 使用fallback方案恢复 ${restoredCount} 个mutation`)

      // 触发online事件
      window.dispatchEvent(new Event("online"))

      return restoredCount

    } catch (fallbackError) {
      console.error("[CompensationBackup] Fallback恢复也失败:", fallbackError)
      throw new Error("恢复补偿存储失败，两种方案都不可用")
    }
  }
  /**
   * 获取当前URQL metadata队列状态
   */
  async getMetadataStatus(): Promise<{
    compensationCount: number
    metadataCount: number
    usingFallback: boolean
  }> {
    await this.init()
    const backups = await this.getAllCached()

    let metadataCount = 0
    let usingFallback = false

    try {
      // 尝试从IndexedDB获取metadata计数
      const defaultStorage = makeDefaultStorage({
        idbName: "graphcache-sei",
        maxAge: 7,
      })
      const metadata = await defaultStorage.readMetadata() || []
      metadataCount = metadata.length
    } catch (error) {
      // 降级到localStorage
      const metadataStr = localStorage.getItem("urql-metadata-queue")
      const metadata = metadataStr ? JSON.parse(metadataStr) : []
      metadataCount = metadata.length
      usingFallback = true
    }

    return {
      compensationCount: backups.length,
      metadataCount,
      usingFallback,
    }
  }
    /**
     * 获取特定repId的相关备份
     */
    async getBackupsByRepId(repId: string): Promise<CompensationMutationItem[]> {
        await this.init()
        const allBackups = await this.getAllCached()

        return allBackups.filter(backup => {
            const isModifyMutation = this.isModifyOriginalRecordDataMutation(backup.query)
            const matchesRepId = backup.variables?.id === repId
            return isModifyMutation && matchesRepId
        })
    }
    /**
     * 批量恢复备份到metadata
     */
    async restoreBackupsToMetadata(backups: CompensationMutationItem[]): Promise<number> {
        const requests: SerializedRequest[] = backups.map(backup => ({
            query: backup.query,
            variables: backup.variables,
            extensions: backup.extensions,
        }))

        return await this.directWriteToUrqlMetadata(requests)
    }

}

// 创建单例实例
export const mutationCompensationStorage = new MutationCompensationStorage()
