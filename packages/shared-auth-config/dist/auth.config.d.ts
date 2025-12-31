import type { NextAuthConfig } from "next-auth";
/**
 * 共享的 NextAuth 配置
 * 支持跨项目 SSO（单点登录）
 */
export declare const sharedAuthConfig: NextAuthConfig;
/**
 * 角色检查工具函数
 */
export declare function hasRole(roles: string[], requiredRole: string): boolean;
/**
 * 检查是否有任一角色
 */
export declare function hasAnyRole(roles: string[], requiredRoles: string[]): boolean;
/**
 * 检查是否有所有角色
 */
export declare function hasAllRoles(roles: string[], requiredRoles: string[]): boolean;
//# sourceMappingURL=auth.config.d.ts.map