# Yarn Workspace (Monorepo) 使用指南

## 项目结构

```
sei_next_page/
├── package.json                    # 根配置 (包含 workspaces)
├── turbo.json                     # Turbo 构建配置
├── setup-workspace.bat            # 初始化脚本
├── start-workspace-dev.bat        # 开发启动脚本
├── deploy-workspace-prod.bat      # 生产部署脚本
└── packages/
    ├── mainProj/                  # 主项目
    │   └── package.json           # 依赖: "@fjsei/shared-auth-config": "*"
    └── shared-auth-config/        # 共享认证包
        ├── package.json           # name: "@fjsei/shared-auth-config"
        ├── src/
        │   ├── auth.config.base.ts
        │   └── index.ts
        └── dist/                  # 编译产物
```

## 快速开始

### 1. 初始化 Workspace

```bash
cd d:\home\sei_next_page
setup-workspace.bat
```

### 2. 开发模式

```bash
# 启动所有项目 (共享包 watch + 主项目)
start-workspace-dev.bat

# 或单独启动
cd packages\shared-auth-config
yarn dev          # watch 模式

cd ..\mainProj
yarn dev          # 主项目
```

### 3. 生产部署

```bash
# 一键部署
deploy-workspace-prod.bat

# 或手动部署
yarn install --frozen-lockfile
yarn build
cd packages\mainProj
yarn build
yarn start:pm2
```

## 核心配置

### 根 package.json

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

### mainProj/package.json

```json
{
  "dependencies": {
    "@fjsei/shared-auth-config": "*"
  }
}
```

**注意**: 使用 `*` 而不是 `workspace:*` (Yarn 1.x)

### shared-auth-config/package.json

```json
{
  "name": "@fjsei/shared-auth-config",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "tsc --build --clean"
  }
}
```

## 使用共享包

### 在主项目中导入

```typescript
// packages/mainProj/src/auth/auth.config.shared.ts
import { createServerUrqlClient } from "@/auth/urql"
import { createSharedAuthConfig, AUTHENTICATE_MUTATION } from "@fjsei/shared-auth-config"

async function authorize(credentials: any) {
  const client = createServerUrqlClient(credentials.deviceId)
  const result = await client.mutation(AUTHENTICATE_MUTATION, {
    username: credentials.username,
    password: credentials.password,
  }).toPromise()

  if (!result.data?.authenticate) return null

  const authData = result.data.authenticate
  return {
    id: authData.user.id,
    name: authData.user.name,
    email: authData.user.email,
    accessToken: authData.accessToken,
    refreshToken: authData.refreshToken,
    deviceId: credentials.deviceId,
    authorities: authData.user.authorities,
  }
}

export const authConfig = createSharedAuthConfig({ authorize })
```

### 在 NextAuth 路由中使用

```typescript
// packages/mainProj/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authConfig } from "@/auth/auth.config.shared"

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

## 常用命令

```bash
# 查看所有 workspace 包
yarn workspaces info

# 为所有包添加依赖
yarn workspace "*" add lodash

# 为特定包添加依赖
yarn workspace main_proj add axios
yarn workspace @fjsei/shared-auth-config add typescript

# 在特定包中运行命令
yarn workspace main_proj dev
yarn workspace @fjsei/shared-auth-config build

# 清理并重新安装
rmdir /s /q node_modules
rmdir /s /q packages\*\node_modules
yarn install
```

## 验证 Workspace

```bash
# 查看 workspace 信息
yarn workspaces info

# 应该看到:
# - main_proj 的 workspaceDependencies 包含 "@fjsei/shared-auth-config"
# - mismatchedWorkspaceDependencies 为空数组

# 检查符号链接
dir packages\mainProj\node_modules\@fjsei\
# 应该看到 shared-auth-config 指向 ../../shared-auth-config
```

## 开发流程

### 修改共享包

1. 修改 `packages/shared-auth-config/src/` 中的文件
2. `tsc --watch` 自动重新编译
3. mainProj 自动识别变更(无需重启)

### 修改主项目

1. 修改 `packages/mainProj/` 中的文件
2. Next.js 热重载自动更新

## 故障排查

### shared-auth-config 找不到

```bash
# 检查配置
yarn workspaces info

# 确保已构建
cd packages\shared-auth-config
yarn build

# 重新安装
cd ..\..
yarn install
```

### 修改不生效

```bash
# 确保 watch 模式运行
cd packages\shared-auth-config
yarn dev

# 或手动重新构建
yarn build
```

### 构建失败

```bash
# 清理缓存
rmdir /s /q .turbo
rmdir /s /q packages\shared-auth-config\dist

# 重新构建
yarn build
```

## 优势总结

| 特性 | Yarn Workspace | npm link | file: 路径 | 发布到 npm |
|------|----------------|----------|-----------|-----------|
| 开发便利性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| 自动链接 | ✅ | ❌ | ❌ | ✅ |
| 热更新 | ✅ | ⚠️ | ❌ | ✅ |
| 生产部署 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 版本管理 | ✅ | ❌ | ❌ | ✅ |
| 依赖共享 | ✅ | ❌ | ❌ | ✅ |

**推荐: Yarn Workspace**
