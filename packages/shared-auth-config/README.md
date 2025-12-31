# @fjsei/shared-auth-config

统一认证配置包 - 支持跨项目 SSO（单点登录）

## 安装

```bash
npm install @fjsei/shared-auth-config
```

## 使用方法

### 1. 在项目中创建 auth.config.ts

```typescript
import { sharedAuthConfig } from "@fjsei/shared-auth-config"
import { createServerUrqlClient } from "@/auth/urql" // 你的 URQL 客户端
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  ...sharedAuthConfig,

  // 覆盖 authorize 函数以使用项目的 URQL 客户端
  providers: sharedAuthConfig.providers.map((provider) => {
    if (provider.type === "credentials") {
      return {
        ...provider,
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            return null
          }

          try {
            const password = credentials.password as string
            const deviceId = credentials.deviceId as string

            const client = createServerUrqlClient(deviceId)
            const result = await client
              .mutation(
                `
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
              `,
                {
                  username: credentials.username,
                  password: password,
                }
              )
              .toPromise()

            if (result.error || !result.data?.authenticate) {
              return null
            }

            const authData = result.data.authenticate
            return {
              id: authData.user.id,
              name: authData.user.name || authData.user.username,
              email: authData.user.email,
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
              authorities: authData.user.authorities,
              deviceId: deviceId,
            }
          } catch (error) {
            console.error("认证失败:", error)
            return null
          }
        },
      }
    }
    return provider
  }),

  // 项目特定的配置
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
```

### 2. 在 auth.ts 中使用

```typescript
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(authConfig)
```

### 3. 使用角色检查工具

```typescript
import { hasRole, hasAnyRole, hasAllRoles } from "@fjsei/shared-auth-config"

function MyComponent() {
  const { data: session } = useSession()
  const userRoles = session?.user?.authorities?.map((a) => a.name) || []

  // 检查单个角色
  if (hasRole(userRoles, "ADMIN")) {
    return <AdminPanel />
  }

  // 检查多个角色（满足任一即可）
  if (hasAnyRole(userRoles, ["EDITOR", "ADMIN"])) {
    return <EditorPanel />
  }

  // 检查是否拥有所有角色
  if (hasAllRoles(userRoles, ["USER", "VERIFIER"])) {
    return <VerifierPanel />
  }

  return <AccessDenied />
}
```

## 环境变量

各项目需要配置以下环境变量：

```bash
# 后端统一认证地址
NEXT_PUBLIC_BACK_END=https://api.example.com/graphql

# NextAuth 配置
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://your-app.example.com
```

## SSO（单点登录）原理

### 跨子域 Cookie

当多个前端项目部署在同一个主域名的不同子域名下时：

```
report.example.com
admin.example.com
app.example.com
```

后端设置 Cookie 时使用共享域名 `.example.com`，这样所有子域名都能访问同一个 `refresh_token` Cookie，实现单点登录。

### 工作流程

1. **首次登录**
   - 用户在 `report.example.com` 登录
   - 后端验证成功，设置 `refresh_token` Cookie (Domain: `.example.com`)
   - Cookie 在所有子域名下有效

2. **访问其他系统**
   - 用户访问 `admin.example.com`
   - 浏览器自动携带 `refresh_token` Cookie
   - 后端识别已登录用户，直接授权

3. **登出**
   - 用户在任一系统登出
   - 后端清除 `refresh_token` Cookie
   - 所有系统同时登出

## 后端配置

后端需要支持跨子域 Cookie 设置：

```java
// Java 后端配置
ResponseCookie refreshTokenCookie = ResponseCookie.from("refresh_token", refreshToken)
    .domain(".example.com")  // 设置共享域名
    .path("/")
    .httpOnly(true)
    .secure(true)
    .sameSite("None")
    .maxAge(5270400) // 61天
    .build();
```

详见后端 `SSO_ENV_CONFIG.md` 配置说明。

## API

### `sharedAuthConfig`

共享的 NextAuth 配置对象，包含：
- Credentials Provider
- JWT 回调
- Session 回调
- 角色管理

### `hasRole(roles: string[], requiredRole: string): boolean`

检查用户是否拥有指定角色。

```typescript
hasRole(["ROLE_USER", "ROLE_ADMIN"], "ADMIN")  // true
hasRole(["ROLE_USER", "ROLE_ADMIN"], "MANAGER")  // false
```

### `hasAnyRole(roles: string[], requiredRoles: string[]): boolean`

检查用户是否拥有指定角色中的任一角色。

```typescript
hasAnyRole(["ROLE_USER"], ["ADMIN", "MANAGER"])  // false
hasAnyRole(["ROLE_USER", "ROLE_ADMIN"], ["ADMIN", "MANAGER"])  // true
```

### `hasAllRoles(roles: string[], requiredRoles: string[]): boolean`

检查用户是否拥有所有指定角色。

```typescript
hasAllRoles(["ROLE_USER", "ROLE_ADMIN"], ["USER", "ADMIN"])  // true
hasAllRoles(["ROLE_USER"], ["USER", "ADMIN"])  // false
```

## 许可证

MIT
