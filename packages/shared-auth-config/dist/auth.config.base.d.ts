import type { NextAuthConfig } from "next-auth";
/**
 * 统一认证 GraphQL Mutation
 */
export declare const AUTHENTICATE_MUTATION = "\n  mutation Authenticate($username: String!, $password: String!) {\n    authenticate(username: $username, password: $password, setCookie: false) {\n      accessToken\n      refreshToken\n      user {\n        id\n        username\n        name\n        email\n        authorities {\n          name\n        }\n      }\n    }\n  }\n";
/**
 * 扩展的用户类型 - 用于 authorize 函数返回值
 */
export interface AuthUser {
    id: string;
    name: string | null;
    email: string | null;
    accessToken: string;
    refreshToken: string;
    deviceId: string;
    authorities: Array<{
        name: string;
    }>;
}
/**
 * 授权函数类型 - 由使用此配置的项目实现
 */
export type AuthorizeFunction = (credentials: {
    username?: string | null;
    password?: string | null;
    deviceId?: string | null;
}) => Promise<AuthUser | null>;
/**
 * 基础共享认证配置 - 不包含具体的 authorize 实现
 * 项目需要覆盖 authorize 函数
 */
export declare function createSharedAuthConfig(options: {
    authorize: AuthorizeFunction;
    baseUrl?: string;
}): NextAuthConfig;
/**
 * 角色检查工具函数
 */
export declare function hasRole(roles: string[], requiredRole: string): boolean;
export declare function hasAnyRole(roles: string[], requiredRoles: string[]): boolean;
export declare function hasAllRoles(roles: string[], requiredRoles: string[]): boolean;
//# sourceMappingURL=auth.config.base.d.ts.map