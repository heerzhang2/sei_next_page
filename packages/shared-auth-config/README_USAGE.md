# @fjsei/shared-auth-config - 使用说明

## 快速开始（3分钟）

### 方式一：使用自动化脚本（推荐）

```bash
# Windows: 双击运行
setup-local-link.bat
```

**脚本会自动完成：**
1. ✅ 安装共享包依赖
2. ✅ 构建共享包
3. ✅ 创建全局链接
4. ✅ 链接到主项目

### 方式二：手动设置

```bash
# 1. 构建共享包
cd d:\home\sei_next_page\packages\shared-auth-config
npm install
npm run build

# 2. 创建全局链接
npm link

# 3. 链接到主项目
cd d:\home\sei_next_page\packages\mainProj
npm link @fjsei/shared-auth-config
```

---

## 使用

### 在 auth.config.ts 中使用

```typescript
import { sharedAuthConfig, hasRole, hasAnyRole, hasAllRoles } from "@fjsei/shared-auth-config"
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
  ...sharedAuthConfig,

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

export { hasRole, hasAnyRole, hasAllRoles }
```

---

## 编译注意事项 ⚠️

### 修改共享包后必须重新构建

```bash
# 每次修改 shared-auth-config 后
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build
```

### 快速重启主项目

```bash
# Windows: 双击运行
restart-with-shared.bat

# 或手动
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

cd d:\home\sei_next_page\packages\mainProj
rm -rf .next  # Windows: rmdir /s /q .next
npm run dev
```

### TypeScript 类型不生效

```bash
# 重启 TypeScript Server（VSCode）
Ctrl + Shift + P → "TypeScript: Restart TS Server"

# 或清除缓存
cd d:\home\sei_next_page\packages\mainProj
rm -rf node_modules/.cache
npm run dev
```

---

## 验证链接

```bash
cd d:\home\sei_next_page\packages\mainProj
npm list @fjsei/shared-auth-config
```

**预期输出：**
```
@fjsei/shared-auth-config@1.0.0 -> d:\home\sei_next_page\packages\shared-auth-config
```

---

## 取消链接

```bash
# Windows: 双击运行
cleanup-local-link.bat

# 或手动
cd d:\home\sei_next_page\packages\mainProj
npm unlink @fjsei/shared-auth-config

cd d:\home\sei_next_page\packages\shared-auth-config
npm unlink
```

---

## 常见问题

### Q1: 修改共享包后，主项目不更新

**A:** 需要重新构建共享包：

```bash
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build
```

然后重启主项目的开发服务器。

### Q2: 找不到 @fjsei/shared-auth-config 模块

**A:** 检查链接是否成功：

```bash
npm list @fjsei/shared-auth-config
```

如果未链接，重新运行 `setup-local-link.bat`。

### Q3: TypeScript 报错：找不到类型定义

**A:**

1. 确保共享包已构建：`npm run build`
2. 检查 `dist/index.d.ts` 是否存在
3. 重启 TypeScript Server：`Ctrl + Shift + P → Restart TS Server`

### Q4: Next.js 开发服务器不更新

**A:** 清除 `.next` 缓存：

```bash
cd d:\home\sei_next_page\packages\mainProj
rm -rf .next  # Windows: rmdir /s /q .next
npm run dev
```

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 快速开始 | `QUICKSTART.md` | 3步快速集成 |
| 完整指南 | `SSO_IMPLEMENTATION_GUIDE.md` | 详细的实施步骤 |
| 本地设置 | `LOCAL_SETUP_GUIDE.md` | 本地引用的详细说明 |
| 示例代码 | `examples/` | 使用示例 |

---

## 可用脚本

| 脚本 | 位置 | 说明 |
|------|------|------|
| setup-local-link.bat | `d:\home\sei_next_page\` | 首次设置本地链接 |
| cleanup-local-link.bat | `d:\home\sei_next_page\` | 取消本地链接 |
| restart-with-shared.bat | `d:\home\sei_next_page\` | 修改后快速重启 |

---

## 下一步

1. ✅ 运行 `setup-local-link.bat` 设置链接
2. ✅ 修改 `src/app/auth.config.ts` 使用共享配置
3. ✅ 启动开发服务器：`npm run dev`
4. ✅ 测试登录功能

遇到问题？查看：
- `LOCAL_SETUP_GUIDE.md` - 详细设置说明
- `SSO_IMPLEMENTATION_GUIDE.md` - 完整实施指南
