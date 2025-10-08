// lib/manual-retry-exchange.ts
import { pipe, tap } from 'wonka'
import type { Exchange, Operation } from '@urql/core'

/**
 * 手动重试 Exchange
 * 监听 graphql-manual-retry 事件并触发离线队列重试
 */
export const manualRetryExchange: Exchange = ({ forward, client }) => {
  // 在客户端环境下设置事件监听器
  if (typeof window !== 'undefined') {
    const handleManualRetry = ((event: CustomEvent) => {
      const { requestId, retryAll } = event.detail
      console.log(`[manualRetryExchange] 收到手动重试请求:`, { requestId, retryAll })
      
      if (retryAll) {
        // 触发所有离线请求的重试 - 通过触发 online 事件让 URQL 处理
        console.log('[manualRetryExchange] 触发所有离线请求重试')
        window.dispatchEvent(new Event('online'))
      } else if (requestId) {
        // 对于单个请求重试，同样触发 online 事件
        console.log(`[manualRetryExchange] 触发单个请求重试: ${requestId}`)
        window.dispatchEvent(new Event('online'))
      }
    }) as EventListener

    window.addEventListener('graphql-manual-retry', handleManualRetry)
    
    // 清理函数
    const cleanup = () => {
      window.removeEventListener('graphql-manual-retry', handleManualRetry)
    }
    
    // 在页面卸载时清理
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanup)
    }
  }

  return ops$ => {
    return pipe(
      ops$,
      forward,
      // 可以在这里添加重试结果的处理逻辑
      tap(result => {
        // 可选：处理重试成功的情况
        if (result.operation.kind === 'mutation' && !result.error) {
          console.log('[manualRetryExchange] Mutation 执行成功:', result.operation.query.definitions[0]?.name?.value)
        }
      })
    )
  }
}