import { IndexedDBCache, type BaseCacheItem } from "./indexeddb-cache"

// 备份的mutation请求项
export interface MutationBackupItem extends BaseCacheItem {
    id: string // 使用operation.key作为唯一标识
    query: string
    variables: any
    extensions?: Record<string, any>
    timestamp: number // 发送时间
    retryCount: number // 重试次数
    nextRetryTime: number // 下次允许重试的时间戳
}

// Mutation备份存储管理器
export class MutationBackupStorage extends IndexedDBCache<MutationBackupItem> {
    private readonly BASE_TIMEOUT_MS = 30 * 1000 // 基础超时30秒
    private readonly RETRY_INCREMENT_MS = 30 * 1000 // 每次重试增加30秒
    private checkInterval: NodeJS.Timeout | null = null

    constructor() {
        super({
            dbName: "mutation-backup-storage",
            storeName: "pending-mutations",
            version: 1,
        })
    }

    private calculateNextRetryDelay(retryCount: number): number {
        // 第一次发送后等待30秒
        // 第一次重试（retryCount=1）等待60秒 (30 + 30*1)
        // 第二次重试（retryCount=2）等待90秒 (30 + 30*2)
        // 第三次重试（retryCount=3）等待120秒 (30 + 30*3)
        return this.BASE_TIMEOUT_MS + this.RETRY_INCREMENT_MS * retryCount
    }

    // 生成requestId的辅助方法
    private getRequestId(query: string, variables: any, extensions?: Record<string, any>): string {
        return `${query}_${JSON.stringify(variables || {})}_${JSON.stringify(extensions || {})}`
    }

    // 根据requestId查询是否存在该mutation
    async getMutationByRequestId(requestId: string): Promise<MutationBackupItem | null> {
        const allMutations = await this.getAllCached()
        const found = allMutations.find((item) => {
            const itemRequestId = this.getRequestId(item.query, item.variables, item.extensions)
            return itemRequestId === requestId
        })
        return found || null
    }

    // 获取所有mutation
    async getAllMutations(): Promise<MutationBackupItem[]> {
        return await this.getAllCached()
    }

    // 添加mutation到备份存储
    async addMutation(key: number, query: string, variables: any, extensions?: Record<string, any>): Promise<void> {
        const requestId = this.getRequestId(query, variables, extensions)
        const existing = await this.getMutationByRequestId(requestId)

        if (existing) {
            console.log(`[MutationBackup] mutation已存在于备份存储中，跳过添加: ${key}`)
            return
        }

        const now = Date.now()
        const item: MutationBackupItem = {
            id: String(key),
            query,
            variables,
            extensions,
            timestamp: now,
            retryCount: 0,
            nextRetryTime: now + this.BASE_TIMEOUT_MS, // 30秒后可以第一次重试
        }
        console.log(
            `[MutationBackup] 添加mutation到备份存储: ${key}, 下次重试时间: ${new Date(item.nextRetryTime).toLocaleTimeString()}`,
        )
        await this.addItem(item, 100) // 最多保存100个待处理的mutation
    }

    // 从备份存储中移除mutation（收到应答后）
    async removeMutation(key: number): Promise<void> {
        const id = String(key)
        console.log(`[MutationBackup] 从备份存储中移除mutation: ${key}`)
        await this.deleteCache(id)
    }

    async getRetryableMutations(): Promise<MutationBackupItem[]> {
        const allMutations = await this.getAllCached()
        const now = Date.now()

        // 筛选出已经到达重试时间的mutation
        const retryableMutations = allMutations.filter((item) => now >= item.nextRetryTime)

        if (retryableMutations.length > 0) {
            console.log(
                `[MutationBackup] 检查可重试mutation: 总数=${allMutations.length}, 可重试=${retryableMutations.length}`,
            )
            retryableMutations.forEach((item) => {
                const waitedTime = Math.floor((now - item.timestamp) / 1000)
                const nextRetryDelay = this.calculateNextRetryDelay(item.retryCount + 1) / 1000
                console.log(
                    `[MutationBackup] - ID: ${item.id}, 重试次数: ${item.retryCount}, 已等待: ${waitedTime}秒, 下次重试需等待: ${nextRetryDelay}秒`,
                )
            })
        }

        return retryableMutations
    }

    async updateRetryInfo(key: number): Promise<void> {
        const id = String(key)
        const allMutations = await this.getAllCached()
        const mutation = allMutations.find((item) => item.id === id)

        if (mutation) {
            const newRetryCount = mutation.retryCount + 1
            const nextRetryDelay = this.calculateNextRetryDelay(newRetryCount)
            const nextRetryTime = Date.now() + nextRetryDelay

            // 更新重试信息
            const updatedMutation: MutationBackupItem = {
                ...mutation,
                retryCount: newRetryCount,
                nextRetryTime: nextRetryTime,
            }

            console.log(
                `[MutationBackup] 更新重试信息: ${key}, 重试次数: ${newRetryCount}, 下次重试时间: ${new Date(nextRetryTime).toLocaleTimeString()}, 需等待: ${nextRetryDelay / 1000}秒`,
            )

            // 删除旧的，添加新的
            await this.deleteCache(id)
            await this.addItem(updatedMutation, 100)
        }
    }

    // 启动定期检查超时的mutation
    startTimeoutCheck(onTimeout: (mutations: MutationBackupItem[]) => void): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
        }

        console.log("[MutationBackup] 启动超时检查，间隔30秒")

        // 每30秒检查一次
        this.checkInterval = setInterval(async () => {
            try {
                const retryableMutations = await this.getRetryableMutations()
                if (retryableMutations.length > 0) {
                    console.log(`[MutationBackup] 发现${retryableMutations.length}个可重试mutation，触发回调`)
                    onTimeout(retryableMutations)

                    for (const mutation of retryableMutations) {
                        await this.updateRetryInfo(Number(mutation.id))
                    }
                }
            } catch (error) {
                console.error("[MutationBackup] 检查超时mutation失败:", error)
            }
        }, 30000) // 30秒检查一次
    }

    // 停止超时检查
    stopTimeoutCheck(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
            console.log("[MutationBackup] 停止超时检查")
        }
    }

    // 获取所有待处理的mutation数量
    async getPendingCount(): Promise<number> {
        const allMutations = await this.getAllCached()
        return allMutations.length
    }
}

// 创建单例实例
export const mutationBackupStorage = new MutationBackupStorage()
