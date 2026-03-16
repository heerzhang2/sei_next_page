# 快速开始 - 统一后端认证 SSO

## 一分钟快速开始

### 1. 后端配置（已完成）

后端已支持跨子域 Cookie，配置环境变量：

```bash
# 生产环境
export SSO_SHARED_DOMAIN=.example.com
```

### 2. 构建共享认证包

```bash
cd d:\home\sei_next_page\packages\shared-auth-config
npm install
npm run build
```

### 3. 在报告项目中使用

#### 方式 A：直接使用（不发布到 npm）

复制配置文件：

```bash
cp d:\home\sei_next_page\packages\shared-auth-config\src\auth.config.for-nextjs.ts \
   d:\home\sei_next_page\packages\mainProj\src\app\auth.config.ts
```

#### 方式 B：通过 npm 安装

```bash
# 本地链接（开发阶段）
cd d:\home\sei_next_page\packages\shared-auth-config
npm link

cd d:\home\sei_next_page\packages\mainProj
npm link @fjsei/shared-auth-config

# 修改 src/app/auth.config.ts
import { authConfig as sharedConfig } from "@fjsei/shared-auth-config"
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
        authorities { name }
      }
    }
  }
`

export const authConfig: NextAuthConfig = {
  ...sharedConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
        deviceId: { label: "设备ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const client = createServerUrqlClient(credentials.deviceId as string)
        const result = await client
          .mutation(AUTHENTICATE_MUTATION, {
            username: credentials.username,
            password: credentials.password as string,
          })
          .toPromise()

        if (result.error || !result.data?.authenticate) return null

        const authData = result.data.authenticate
        return {
          id: authData.user.id,
          name: authData.user.name || authData.user.username,
          email: authData.user.email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          authorities: authData.user.authorities,
          deviceId: credentials.deviceId as string,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
```

### 4. 测试

```bash
cd d:\home\sei_next_page\packages\mainProj
npm run dev
```

访问 `http://192.168.0.100:3765/report/login` 登录测试。

## 角色控制示例

```tsx
import { hasRole } from "@/app/auth.config"

function MyComponent() {
  const { data: session } = useSession()
  const userRoles = session?.user?.authorities?.map((a) => a.name) || []

  return (
    <>
      {hasRole(userRoles, "ADMIN") && <AdminPanel />}
      {hasRole(userRoles, "EDITOR") && <EditorPanel />}
    </>
  )
}
```

## 下一步

- 阅读完整指南：`SSO_IMPLEMENTATION_GUIDE.md`
- 后端配置：`d:\home\sei-rearend\SSO_ENV_CONFIG.md`
- 组件示例：`examples/RoleGuard.tsx.example`
