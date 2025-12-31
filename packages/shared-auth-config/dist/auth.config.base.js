import CredentialsProvider from "next-auth/providers/credentials";
/**
 * 统一认证 GraphQL Mutation
 */
export const AUTHENTICATE_MUTATION = `
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
 * 基础共享认证配置 - 不包含具体的 authorize 实现
 * 项目需要覆盖 authorize 函数
 */
export function createSharedAuthConfig(options) {
    const { authorize, baseUrl } = options;
    return {
        trustHost: true,
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
                        const user = await authorize({
                            username: String(credentials.username),
                            password: password,
                            deviceId: deviceId,
                        });
                        if (!user) {
                            console.warn("[Shared Auth] 授权失败");
                            return null;
                        }
                        console.log("[Shared Auth] 认证成功 - userId:", user.id);
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            accessToken: user.accessToken,
                            refreshToken: user.refreshToken,
                            authorities: user.authorities,
                            deviceId: user.deviceId,
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
            async jwt({ token, user, trigger, session }) {
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
        pages: {
            signIn: "/login",
            error: "/login",
        },
        session: {
            strategy: "jwt",
            maxAge: 7 * 24 * 60 * 60,
        },
        secret: process.env.NEXTAUTH_SECRET,
    };
}
/**
 * 角色检查工具函数
 */
export function hasRole(roles, requiredRole) {
    const rolePattern = requiredRole.startsWith("ROLE_") ? requiredRole : `ROLE_${requiredRole}`;
    return roles.includes(rolePattern) || roles.includes(requiredRole);
}
export function hasAnyRole(roles, requiredRoles) {
    return requiredRoles.some((role) => hasRole(roles, role));
}
export function hasAllRoles(roles, requiredRoles) {
    return requiredRoles.every((role) => hasRole(roles, role));
}
