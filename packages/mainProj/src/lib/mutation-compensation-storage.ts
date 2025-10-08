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
   * 生成mutation的唯一ID
   */
  private generateMutationId(query: string, variables: any): string {
    // 针对 modifyOriginalRecordData 使用特殊标识
    const isModifyMutation =query.includes('mutation modifyOriginalRecordData');
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

    await this.addItem(item, 200) // 最多保存200个备份
    console.log(`[CompensationBackup] 已备份mutation: ${operationName} (ID: ${id})`)
    return id
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
   * 删除成功的mutation备份
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
}

// 创建单例实例
export const mutationCompensationStorage = new MutationCompensationStorage()
