// lib/prevent-duplicate-exchange.ts
import { Exchange, Operation, OperationResult } from "@urql/core"
import { pipe, tap, filter } from "wonka"

// 存储正在进行的操作和对应的超时定时器
const pendingOperations = new Map<string, boolean>()
const pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// 5分钟超时自动清除pending标记（兜底保护）
const PENDING_TIMEOUT = 5 * 60 * 1000

// 监听清除pending标记的事件（在客户端初始化时）
if (typeof globalThis.window !== 'undefined') {
    globalThis.window.addEventListener('graphql:clear-pending-mutation', ((event: CustomEvent) => {
        const { operationId } = event.detail || {}
        if (operationId) {
            // 查找并清除匹配的pending操作
            for (const [key] of pendingOperations.entries()) {
                if (key.includes(operationId)) {
                    console.log(`[PreventDuplicate] 收到清除事件，清除pending标记: ${key}`)
                    clearPendingOperation(key)
                }
            }
        }
    }) as EventListener)
}

// 生成操作唯一标识
function generateOperationKey(operation: Operation): string {
    const { query, variables } = operation
    const queryString = typeof query === 'string' ? query : (query as any).loc?.source?.body || ''

    // 针对 modifyOriginalRecordData 使用特殊标识
    if (queryString.includes('mutation useOriginalDataMutation') && variables?.id) {
        return `modify_${variables.id}_${variables.version || '0'}`
    }

    // 通用标识
    return `${queryString}_${JSON.stringify(variables || {})}`
}

/**
 * 清除pending标记和超时定时器
 */
function clearPendingOperation(operationKey: string) {
    pendingOperations.delete(operationKey)
    const timeout = pendingTimeouts.get(operationKey)
    if (timeout) {
        clearTimeout(timeout)
        pendingTimeouts.delete(operationKey)
    }
}

/**
 * 设置pending标记和自动超时清除
 */
function setPendingOperation(operationKey: string) {
    pendingOperations.set(operationKey, true)
    
    // 清除已有的超时定时器
    const existingTimeout = pendingTimeouts.get(operationKey)
    if (existingTimeout) {
        clearTimeout(existingTimeout)
    }
    
    // 设置新的超时定时器，5分钟后自动清除（兜底保护）
    const timeout = setTimeout(() => {
        console.log(`[PreventDuplicate] mutation 超时自动清除: ${operationKey}`)
        clearPendingOperation(operationKey)
    }, PENDING_TIMEOUT)
    
    pendingTimeouts.set(operationKey, timeout)
}

/**
 * 检查错误是否是被取消的请求（AbortError）
 */
function isAbortError(error: any): boolean {
    if (!error) return false
    
    // 检查各种可能的AbortError形式
    const errorName = error.name || ''
    const errorMessage = error.message || ''
    const errorStr = String(error)
    
    const isAbort = 
        errorName === 'AbortError' || 
        errorMessage.includes('Aborted') ||
        errorMessage.includes('abort') ||
        errorStr.includes('AbortError') ||
        errorStr.includes('Aborted')
    
    if (isAbort) {
        console.log(`[PreventDuplicate] 检测到AbortError:`, { name: errorName, message: errorMessage })
    }
    
    return isAbort
}

/**
 * 检查是否是认证错误（401/403）
 */
function isAuthError(error: any): boolean {
    if (!error) return false
    
    // 检查HTTP状态码
    if (error.response?.status === 401 || error.response?.status === 403) {
        return true
    }
    
    // 检查GraphQL错误码
    if (error.graphQLErrors?.some((e: any) => 
        e.extensions?.code === 'UNAUTHORIZED' || 
        e.extensions?.code === 'UNAUTHENTICATED' ||
        e.extensions?.httpStatusCode === 401
    )) {
        return true
    }
    
    return false
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

                // 标记操作为进行中，并设置超时自动清除
                setPendingOperation(operationKey)
                console.log(`[PreventDuplicate] 开始处理 mutation: ${operationKey}`)
                return true
            }),
            forward,
            tap((result: OperationResult) => {
                const operation = result.operation

                if (operation.kind === "mutation") {
                    const operationKey = generateOperationKey(operation)

                    // 检查是否是被取消的请求
                    if (isAbortError(result.error)) {
                        console.log(`[PreventDuplicate] mutation 被取消，立即清除pending标记: ${operationKey}`)
                        clearPendingOperation(operationKey)
                        return
                    }

                    // 检查是否是认证错误（401/403）
                    // 认证错误会触发authExchange的refreshAuth，之后会自动重试
                    // 所以我们需要立即清除pending标记，让重试请求能通过
                    if (isAuthError(result.error)) {
                        console.log(`[PreventDuplicate] mutation 遇到认证错误，立即清除pending标记以允许authExchange重试: ${operationKey}`)
                        clearPendingOperation(operationKey)
                        return
                    }

                    // 无论成功还是失败，都清除进行中标记
                    clearPendingOperation(operationKey)
                    console.log(`[PreventDuplicate] 完成处理 mutation: ${operationKey}`,
                        result.error ? '失败' : '成功')
                }
            })
        )
    }
}