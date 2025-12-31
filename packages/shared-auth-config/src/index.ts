/**
 * 统一认证配置包导出
 *
 * 提供:
 * - 基础认证配置工厂函数 (createSharedAuthConfig)
 * - GraphQL 认证 Mutation 常量 (AUTHENTICATE_MUTATION)
 * - 角色检查工具函数 (hasRole, hasAnyRole, hasAllRoles)
 * - TypeScript 类型定义
 */

export {
  createSharedAuthConfig,
  AUTHENTICATE_MUTATION,
  type AuthorizeFunction,
  type AuthUser,
} from "./auth.config.base"

export { hasRole, hasAnyRole, hasAllRoles } from "./auth.config.base"

// 导出类型定义文件
export type { NextAuthConfig } from "next-auth"
