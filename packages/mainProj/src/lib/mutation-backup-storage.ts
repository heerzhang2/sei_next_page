import { IndexedDBCache, type BaseCacheItem } from "./indexeddb-cache"

// 备份的mutation请求项
export interface MutationBackupItem extends BaseCacheItem {
    id: string // 使用operation.key作为唯一标识
    query: string
    variables: any
    extensions?: Record<string, any>
    timestamp: number // 发送时间
    retryCount: number // 重试次数
}

// Mutation备份存储管理器
export class MutationBackupStorage extends IndexedDBCache<MutationBackupItem> {
    private readonly TIMEOUT_MS = 3 * 60 * 1000 // 3分钟超时
    private checkInterval: NodeJS.Timeout | null = null

    constructor() {
        super({
            dbName: "mutation-backup-storage",
            storeName: "pending-mutations",
            version: 1,
        })
    }

    // 添加mutation到备份存储
    async addMutation(key: number, query: string, variables: any, extensions?: Record<string, any>): Promise<void> {
        const item: MutationBackupItem = {
            id: String(key),
            query,
            variables,
            extensions,
            timestamp: Date.now(),
            retryCount: 0,
        }
        console.log(`[MutationBackup] 添加mutation到备份存储: ${key}`)
        await this.addItem(item, 100) // 最多保存100个待处理的mutation
    }

    // 从备份存储中移除mutation（收到应答后）
    async removeMutation(key: number): Promise<void> {
        const id = String(key)
        console.log(`[MutationBackup] 从备份存储中移除mutation: ${key}`)
        await this.deleteCache(id)
    }

    // 获取所有超时的mutation
    async getTimeoutMutations(): Promise<MutationBackupItem[]> {
        const allMutations = await this.getAllCached()
        const now = Date.now()
        const timeoutMutations = allMutations.filter((item) => now - item.timestamp > this.TIMEOUT_MS)
        console.log(`[MutationBackup] 检查超时mutation: 总数=${allMutations.length}, 超时=${timeoutMutations.length}`)
        return timeoutMutations
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
                const timeoutMutations = await this.getTimeoutMutations()
                if (timeoutMutations.length > 0) {
                    console.log(`[MutationBackup] 发现${timeoutMutations.length}个超时mutation，触发回调`)
                    onTimeout(timeoutMutations)

                    // 从备份存储中移除这些超时的mutation
                    for (const mutation of timeoutMutations) {
                        await this.deleteCache(mutation.id)
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
