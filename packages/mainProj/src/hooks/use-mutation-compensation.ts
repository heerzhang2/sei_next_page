"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { mutationCompensationStorage, type CompensationMutationItem } from "@/lib/mutation-compensation-storage"

export interface MutationCompensationManager {
  compensationMutations: CompensationMutationItem[]
  isInitialized: boolean
  statistics: {
    total: number
    pending: number
    retrying: number
    failed: number
  }

  // 操作方法
  refreshCompensationList: () => Promise<void>
  retryCompensationMutation: (id: string) => Promise<void>
  retryAllCompensation: () => Promise<void>
  clearCompensation: () => Promise<void>
  exportCompensationData: () => string
}

export function useMutationCompensation(): MutationCompensationManager {
  const [compensationMutations, setCompensationMutations] = useState<CompensationMutationItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    retrying: 0,
    failed: 0,
  })

  const mountedRef = useRef(true)

  // 刷新补偿列表
  const refreshCompensationList = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      await mutationCompensationStorage.init()
      const mutations = await mutationCompensationStorage.getAllCached()
      const stats = await mutationCompensationStorage.getStatistics()

      setCompensationMutations(mutations)
      setStatistics(stats)

      if (!isInitialized) {
        setIsInitialized(true)
      }
    } catch (error) {
      console.error("[CompensationManager] 刷新补偿列表失败:", error)
    }
  }, [isInitialized])

  // 重试单个补偿mutation
  const retryCompensationMutation = useCallback(
    async (id: string) => {
      try {
        const mutation = compensationMutations.find((m) => m.id === id)
        if (!mutation) {
          toast.error("未找到该mutation")
          return
        }

        // 更新重试信息
        await mutationCompensationStorage.updateRetryInfo(id)

        // 触发URQL重新发送 - 通过添加到localStorage的metadata
        const currentMetadata = localStorage.getItem("urql-metadata")
        const metadata = currentMetadata ? JSON.parse(currentMetadata) : []

        // 检查是否已存在
        const exists = metadata.some(
          (m: any) => m.query === mutation.query && JSON.stringify(m.variables) === JSON.stringify(mutation.variables),
        )

        if (!exists) {
          metadata.push({
            query: mutation.query,
            variables: mutation.variables,
            extensions: mutation.extensions,
          })
          localStorage.setItem("urql-metadata", JSON.stringify(metadata))
        }

        // 触发在线事件让URQL处理
        window.dispatchEvent(new Event("online"))

        toast.success(`正在重试: ${mutation.operationName}`)

        // 刷新列表
        setTimeout(() => refreshCompensationList(), 2000)
      } catch (error) {
        console.error("[CompensationManager] 重试失败:", error)
        toast.error("重试失败")
      }
    },
    [compensationMutations, refreshCompensationList],
  )

  // 重试所有补偿mutation
  const retryAllCompensation = useCallback(async () => {
    try {
      const pendingMutations = await mutationCompensationStorage.getPendingMutations()

      if (pendingMutations.length === 0) {
        toast.info("没有待重试的mutation")
        return
      }

      // 批量添加到URQL metadata
      const currentMetadata = localStorage.getItem("urql-metadata")
      const metadata = currentMetadata ? JSON.parse(currentMetadata) : []

      for (const mutation of pendingMutations) {
        const exists = metadata.some(
          (m: any) => m.query === mutation.query && JSON.stringify(m.variables) === JSON.stringify(mutation.variables),
        )

        if (!exists) {
          metadata.push({
            query: mutation.query,
            variables: mutation.variables,
            extensions: mutation.extensions,
          })
        }

        await mutationCompensationStorage.updateRetryInfo(mutation.id)
      }

      localStorage.setItem("urql-metadata", JSON.stringify(metadata))
      window.dispatchEvent(new Event("online"))

      toast.success(`正在重试 ${pendingMutations.length} 个mutation`)

      setTimeout(() => refreshCompensationList(), 3000)
    } catch (error) {
      console.error("[CompensationManager] 批量重试失败:", error)
      toast.error("批量重试失败")
    }
  }, [refreshCompensationList])

  // 清空补偿列表
  const clearCompensation = useCallback(async () => {
    try {
      await mutationCompensationStorage.clearAll()
      setCompensationMutations([])
      setStatistics({ total: 0, pending: 0, retrying: 0, failed: 0 })
      toast.success("补偿列表已清空")
    } catch (error) {
      console.error("[CompensationManager] 清空失败:", error)
      toast.error("清空失败")
    }
  }, [])

  // 导出补偿数据
  const exportCompensationData = useCallback((): string => {
    const exportData = {
      compensationMutations,
      statistics,
      exportedAt: new Date().toISOString(),
      version: "1.0",
      type: "mutation-compensation",
    }
    return JSON.stringify(exportData, null, 2)
  }, [compensationMutations, statistics])

  // 初始化和定期刷新
  useEffect(() => {
    mountedRef.current = true

    const initialize = async () => {
      await mutationCompensationStorage.init()
      await refreshCompensationList()

      // 清理旧备份
      await mutationCompensationStorage.cleanupOldBackups(7)
    }

    initialize()

    // 每30秒刷新一次
    const interval = setInterval(() => {
      if (mountedRef.current) {
        refreshCompensationList()
      }
    }, 30000)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [refreshCompensationList])

  return {
    compensationMutations,
    isInitialized,
    statistics,
    refreshCompensationList,
    retryCompensationMutation,
    retryAllCompensation,
    clearCompensation,
    exportCompensationData,
  }
}
