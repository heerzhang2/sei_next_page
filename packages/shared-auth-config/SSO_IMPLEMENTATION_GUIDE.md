# 统一后端认证 SSO 实施指南

## 概述

本指南说明如何使用 `@fjsei/shared-auth-config` 实现跨项目的单点登录（SSO）。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                统一后端认证服务 (Java)                   │
│  Port: 8673 / https://api.example.com/graphql           │
│  - authenticate mutation                                  │
│  - refreshToken mutation                                 │
│  - logout mutation                                       │
│  - 用户和角色统一存储在数据库                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ GraphQL / JWT
                         ↓
        ┌──────────────────────────────────────┐
        │     共享 Cookie Domain               │
        │     .example.com                   │
        │     refresh_token (HttpOnly)        │
        └──────────────────────────────────────┘
    ┌─────────┬─────────┬─────────┬─────────┐
    │         │         │         │         │
┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│报告项目│ │管理后台│ │其他项目│ │移动端  │
│report │ │admin │ │app   │ │m.    │
│.com   │ │.com  │ │.com  │ │.com  │
└───────┘ └──────┘ └──────┘ └──────┘
```

## 实施步骤

### 步骤 1：后端改造

#### 1.1 修改 Cookie 设置支持跨子域

已在 `BaseMutation.java` 中完成：
- `setRefreshTokenCookie()` 支持共享域名
- `determineSharedDomain()` 自动解析域名
- 支持 `SSO_SHARED_DOMAIN` 环境变量配置

#### 1.2 配置环境变量

```bash
# 生产环境：多子域名部署
export SSO_SHARED_DOMAIN=.example.com

# 开发环境：IP 地址或 localhost（不设置，自动处理）
# export SSO_SHARED_DOMAIN=
```

#### 1.3 重新构建并部署后端

```bash
cd d:\home\sei-rearend
gradlew build
# 部署到生产环境
```

### 步骤 2：创建共享认证配置包

已在 `d:\home\sei_next_page\packages\shared-auth-config` 中创建：

```
shared-auth-config/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── auth.config.ts
│   └── auth.config.for-nextjs.ts
└── examples/
    ├── auth.config.ts.example
    └── RoleGuard.tsx.example
```

#### 2.1 构建共享包

```bash
cd d:\home\sei_next_page\packages\shared-auth-config
npm install
npm run build
```

#### 2.2 发布到 npm（可选）或本地链接

```bash
# 方式 1：发布到 npm registry
npm publish

# 方式 2：本地链接（开发阶段）
cd d:\home\sei_next_page\packages\shared-auth-config
npm link

# 在使用项目中链接
cd d:\home\sei_next_page\packages\mainProj
npm link @fjsei/shared-auth-config
```

### 步骤 3：前端项目集成

#### 3.1 安装依赖

```bash
cd d:\home\sei_next_page\packages\mainProj
npm install @fjsei/shared-auth-config
```

#### 3.2 替换 auth.config.ts

```bash
# 备份现有配置
cp src/app/auth.config.ts src/app/auth.config.ts.backup

# 使用共享配置（复制示例文件）
cp ../shared-auth-config/examples/auth.config.ts.example src/app/auth.config.ts
```

或者手动修改 `src/app/auth.config.ts`：

```typescript
import { authConfig as sharedConfig, hasRole, hasAnyRole, hasAllRoles } from "@fjsei/shared-auth-config"
import { createServerUrqlClient } from "@/auth/urql"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

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
`

export const authConfig: NextAuthConfig = {
  ...sharedConfig,

  providers: [
    CredentialsProvider({
      // ... 使用项目的 URQL 客户端
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export { hasRole, hasAnyRole, hasAllRoles }
```

#### 3.3 添加角色守卫组件

```bash
# 复制示例
cp ../shared-auth-config/examples/RoleGuard.tsx.example src/components/RoleGuard.tsx
```

#### 3.4 配置环境变量

```bash
# .env.local
NEXT_PUBLIC_BACK_END=https://api.example.com/graphql
NEXT_PUBLIC_APP_WEB=https://report.example.com

NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://report.example.com
```

#### 3.5 重启开发服务器

```bash
cd d:\home\sei_next_page\packages\mainProj
npm run dev
```

### 步骤 4：新项目集成

对于新的前端项目（如管理后台），重复步骤 3：

```bash
# 新项目：admin-frontend
cd d:\home\sei_next_page\packages\admin-frontend
npm install @fjsei/shared-auth-config

# 复制配置
cp ../shared-auth-config/examples/auth.config.ts.example src/app/auth.config.ts
cp ../shared-auth-config/examples/RoleGuard.tsx.example src/components/RoleGuard.tsx

# 配置环境变量（注意 NEXTAUTH_URL 不同）
echo "NEXT_PUBLIC_BACK_END=https://api.example.com/graphql" > .env.local
echo "NEXT_PUBLIC_APP_WEB=https://admin.example.com" >> .env.local
echo "NEXTAUTH_SECRET=your-secret-key-min-32-chars" >> .env.local
echo "NEXTAUTH_URL=https://admin.example.com" >> .env.local
```

## 使用角色控制

### 在组件中使用

```tsx
import { useSession } from "next-auth/react"
import { hasRole, hasAnyRole } from "@fjsei/shared-auth-config"

function ReportPage() {
  const { data: session } = useSession()
  const userRoles = session?.user?.authorities?.map((a) => a.name) || []

  return (
    <div>
      {hasRole(userRoles, "ADMIN") && (
        <Button onClick={deleteReport}>删除报告</Button>
      )}

      {hasAnyRole(userRoles, ["EDITOR", "ADMIN"]) && (
        <Button onClick={editReport}>编辑报告</Button>
      )}

      <Button onClick={viewReport}>查看报告</Button>
    </div>
  )
}
```

### 使用 RoleGuard 组件

```tsx
import { RoleGuard, AdminOnly } from "@/components/RoleGuard"

function ReportPage() {
  return (
    <div>
      <h1>报告详情</h1>

      <RoleGuard roles={["EDITOR", "ADMIN"]}>
        <Button>编辑</Button>
      </RoleGuard>

      <AdminOnly>
        <Button>删除</Button>
      </AdminOnly>

      <RoleGuard
        roles={["VERIFIER", "ADMIN"]}
        requireAll={true}
        fallback={<p>需要验证权限</p>}
      >
        <Button>批准</Button>
      </RoleGuard>
    </div>
  )
}
```

## SSO 测试

### 测试场景

1. **登录流程**
   ```
   1. 访问 report.example.com/login
   2. 输入用户名密码登录
   3. 登录成功后，访问 admin.example.com
   4. 应该自动处于登录状态（无需再次登录）
   ```

2. **登出流程**
   ```
   1. 在 report.example.com 点击登出
   2. 访问 admin.example.com
   3. 应该需要重新登录
   ```

3. **Token 刷新**
   ```
   1. 登录后等待 3 分钟（accessToken 过期）
   2. 执行需要认证的操作
   3. 应该自动刷新 token，操作成功
   ```

### Cookie 检查

打开浏览器开发者工具 → Application → Cookies：

```
Name: refresh_token
Domain: .example.com  （关键：共享域名）
Path: /
HttpOnly: ✓
Secure: ✓
SameSite: None
```

## 故障排查

### 问题 1：登录后其他系统仍需登录

**原因：** Cookie domain 未设置或设置错误

**检查：**
1. 后端日志中查看 `设置cookie - 请求来源`
2. 浏览器 Cookie 检查 `refresh_token` 的 `Domain` 属性
3. 确认环境变量 `SSO_SHARED_DOMAIN` 已正确配置

### 问题 2：Cookie 无法跨域传递

**原因：** SameSite 或 Secure 配置问题

**检查：**
1. 确保使用 HTTPS（Secure: true 需要 HTTPS）
2. SameSite 设置为 "None"
3. 检查 CORS 配置

### 问题 3：权限检查不生效

**原因：** 角色名称不匹配或未正确传递

**检查：**
1. 后端 GraphQL 返回的 `authorities` 数组
2. 前端 session 中的 `user.authorities`
3. 确保角色名称格式一致（`ROLE_USER` vs `USER`）

## 安全建议

1. **必须使用 HTTPS**
   - 生产环境强制 HTTPS
   - Cookie Secure: true 需要 HTTPS

2. **定期轮换 NEXTAUTH_SECRET**

3. **监控异常登录**
   - 记录登录 IP、设备 ID
   - 实现异常登录告警

4. **实现登录失败限制**
   - 防止暴力破解
   - 5 次失败后锁定账户

5. **Token 过期策略**
   - AccessToken: 3 分钟（已实现）
   - RefreshToken: 61 天（可调整）

## 扩展计划

### 短期
- [ ] 添加登录失败次数限制
- [ ] 添加多因素认证（MFA）
- [ ] 实现审计日志

### 长期
- [ ] 集成 Keycloak
- [ ] 支持 OAuth2（微信、企业微信等）
- [ ] 细粒度权限控制（数据权限）

## 参考文档

- 后端配置：`d:\home\sei-rearend\SSO_ENV_CONFIG.md`
- 共享包文档：`d:\home\sei_next_page\packages\shared-auth-config\README.md`
- NextAuth 文档：https://authjs.dev/
