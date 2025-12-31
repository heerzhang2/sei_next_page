import CredentialsProvider from "next-auth/providers/credentials";
/**
 * 统一认证 GraphQL Mutation
 */
const AUTHENTICATE_MUTATION = `
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(username: $username, password: $password, setCookie: false) {
      accessToken
      refreshToken
      user {
        id
        username
        name
        email
        authorities {
          name
        }
      }
    }
  }
`;
/**
 * 创建服务端 URQL 客户端
 * 注意：此函数需要在各项目中根据实际情况实现
 */
function createServerUrqlClient(deviceId) {
    // 这里需要从使用此配置的项目中导入
    // 例如: return createServerUrqlClient(deviceId)
    throw new Error("createServerUrqlClient 需要由使用此配置包的项目实现。请在 auth.config.ts 中覆盖 authorize 函数。");
}
/**
 * 共享的 NextAuth 配置
 * 支持跨项目 SSO（单点登录）
 */
export const sharedAuthConfig = {
    trustHost: true, // 信任 X-Forwarded-Host 头，允许子路径部署
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "用户名", type: "text" },
                password: { label: "密码", type: "password" },
                deviceId: { label: "设备ID", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    console.warn("[Shared Auth] 缺少用户名或密码");
                    return null;
                }
                try {
                    const password = credentials.password;
                    const deviceId = credentials.deviceId;
                    console.log("[Shared Auth] 认证请求 - username:", credentials.username, "deviceId:", deviceId);
                    // 注意：createServerUrqlClient 需要由各项目实现
                    const client = createServerUrqlClient(deviceId);
                    const result = await client
                        .mutation(AUTHENTICATE_MUTATION, {
                        username: credentials.username,
                        password: password, // 发送明文密码，后端使用 BCrypt 验证
                    })
                        .toPromise();
                    if (result.error) {
                        console.error("[Shared Auth] GraphQL 认证失败:", result.error);
                        return null;
                    }
                    if (!result.data?.authenticate) {
                        console.error("[Shared Auth] 认证响应为空");
                        return null;
                    }
                    const authData = result.data.authenticate;
                    console.log("[Shared Auth] 认证成功 - userId:", authData.user.id);
                    // 返回用户信息（NextAuth 会自动处理 JWT 和 Session）
                    return {
                        id: authData.user.id,
                        name: authData.user.name || authData.user.username,
                        email: authData.user.email,
                        accessToken: authData.accessToken,
                        refreshToken: authData.refreshToken,
                        authorities: authData.user.authorities,
                        deviceId: deviceId,
                    };
                }
                catch (error) {
                    console.error("[Shared Auth] 认证过程中出错:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        /**
         * JWT 回调
         * - 初次登录时保存用户信息到 token
         * - 支持 update trigger 更新 token（用于 token 刷新）
         */
        async jwt({ token, user, trigger, session }) {
            // 初次登录
            if (user) {
                console.log("[Shared Auth] 初次登录 - 保存 token 信息");
                return {
                    ...token,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    deviceId: user.deviceId,
                    authorities: user.authorities,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                };
            }
            // Token 更新（由客户端 authExchange 触发）
            if (trigger === "update" && session?.user) {
                console.log("[Shared Auth] 更新 token - 合并新的 token 信息");
                return {
                    ...token,
                    accessToken: session.user.accessToken || token.accessToken,
                    refreshToken: session.user.refreshToken || token.refreshToken,
                    user: {
                        ...token.user,
                        id: session.user.id || token.user?.id,
                        name: session.user.name || token.user?.name,
                        email: session.user.email || token.user?.email,
                    },
                };
            }
            return token;
        },
        /**
         * Session 回调
         * - 将 token 信息传递给客户端 session
         */
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.user?.id,
                    name: token.user?.name,
                    email: token.user?.email,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    authorities: token.authorities,
                    deviceId: token.deviceId,
                };
            }
            return session;
        },
    },
    /**
     * 自定义页面
     * - signIn: 登录页面
     * - error: 错误页面（默认重定向到登录页）
     */
    pages: {
        signIn: "/login",
        error: "/login",
    },
    /**
     * Session 配置
     */
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7天
    },
    /**
     * JWT 密钥
     */
    secret: process.env.NEXTAUTH_SECRET,
};
/**
 * 角色检查工具函数
 */
export function hasRole(roles, requiredRole) {
    // 支持 ROLE_ 前缀和纯角色名
    const rolePattern = requiredRole.startsWith("ROLE_") ? requiredRole : `ROLE_${requiredRole}`;
    return roles.includes(rolePattern) || roles.includes(requiredRole);
}
/**
 * 检查是否有任一角色
 */
export function hasAnyRole(roles, requiredRoles) {
    return requiredRoles.some((role) => hasRole(roles, role));
}
/**
 * 检查是否有所有角色
 */
export function hasAllRoles(roles, requiredRoles) {
    return requiredRoles.every((role) => hasRole(roles, role));
}
