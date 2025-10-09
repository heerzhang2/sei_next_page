// lib/prevent-duplicate-exchange.ts
import { Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, filter } from "wonka"

// 存储正在进行的操作
const pendingOperations = new Map<string, boolean>()

// 生成操作唯一标识
function generateOperationKey(operation: Operation): string {
    const { query, variables } = operation
    const queryString = typeof query === 'string' ? query : query.loc?.source.body || ''

    // 针对 modifyOriginalRecordData 使用特殊标识
    if (queryString.includes('mutation useOriginalDataMutation') && variables?.id) {
        return `modify_${variables.id}_${variables.version || '0'}`
    }

    // 通用标识
    return `${queryString}_${JSON.stringify(variables || {})}`
}

/**
 * 防止重复发送的 Exchange
 * 在网络不可达时，确保每个 mutation 只发送一次
 */
export const preventDuplicateExchange: Exchange = ({ forward }) => {
    return (operations$) => {
        return pipe(
            operations$,
            filter((operation: Operation) => {
                // 只对 mutation 进行重复检查
                if (operation.kind !== "mutation") return true

                const operationKey = generateOperationKey(operation)

                // 如果操作已经在进行中，则过滤掉
                if (pendingOperations.has(operationKey)) {
                    console.log(`[PreventDuplicate] 跳过重复的 mutation: ${operationKey}`)
                    return false
                }

                // 标记操作为进行中
                pendingOperations.set(operationKey, true)
                console.log(`[PreventDuplicate] 开始处理 mutation: ${operationKey}`)
                return true
            }),
            forward,
            tap((result: OperationResult) => {
                const operation = result.operation

                if (operation.kind === "mutation") {
                    const operationKey = generateOperationKey(operation)

                    // 无论成功还是失败，都清除进行中标记
                    // 对于网络错误，我们依赖离线队列机制，不立即重试
                    pendingOperations.delete(operationKey)
                    console.log(`[PreventDuplicate] 完成处理 mutation: ${operationKey}`,
                        result.error ? '失败' : '成功')
                }
            })
        )
    }
}