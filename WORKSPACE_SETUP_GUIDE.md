# Workspace（Monorepo）设置指南

## 为什么推荐 Workspace？

| 特性 | 优势 |
|------|------|
| 开发体验 | 修改共享包立即生效，无需重新链接 |
| 生产部署 | `npm install` 自动处理，无需额外步骤 |
| 版本管理 | 统一管理，易于追溯 |
| 依赖共享 | 自动去重，减少 node_modules 体积 |

---

## 设置步骤

### 步骤 1：配置根 package.json

编辑 `d:\home\sei_next_page\package.json`：

```json
{
  "name": "sei-frontend-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

### 步骤 2：配置 turbo.json

创建 `d:\home\sei_next_page\turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 步骤 3：配置 mainProj 的 package.json

编辑 `d:\home\sei_next_page\packages\mainProj\package.json`：

```json
{
  "name": "main_proj",
  "dependencies": {
    "@fjsei/shared-auth-config": "workspace:*"
  }
}
```

**关键：** 使用 `"workspace:*"` 而不是 `"*"` 或具体版本号。

### 步骤 4：配置 shared-auth-config 的 package.json

编辑 `d:\home\sei_next_page\packages\shared-auth-config\package.json`：

```json
{
  "name": "@fjsei/shared-auth-config",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  }
}
```

### 步骤 5：重新安装依赖

```bash
cd d:\home\sei_next_page

# 清理旧的 node_modules
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf .turbo

# 重新安装（workspace 会自动链接）
npm install

# 或使用 pnpm（更快）
# pnpm install
```

### 步骤 6：验证 workspace

```bash
cd d:\home\sei_next_page

# 查看 workspace 结构
npm workspaces list

# 应该看到：
# - main_proj
# - @fjsei/shared-auth-config
```

---

## 开发流程

### 启动所有项目（并行）

```bash
cd d:\home\sei_next_page

# 启动所有项目的 dev 模式
npm run dev
```

### 启动单个项目

```bash
# 只启动 shared-auth-config 的 watch 模式
cd packages/shared-auth-config
npm run dev

# 只启动 mainProj（在另一个终端）
cd packages/mainProj
npm run dev
```

### 修改共享包

```bash
# 1. 修改 packages/shared-auth-config/src/auth.config.ts
# 2. tsc --watch 会自动重新编译
# 3. mainProj 会自动识别变更（无需重启！）
```

---

## 生产部署

### 部署脚本示例

**deploy-prod.sh**

```bash
#!/bin/bash

set -e

echo "========================================="
echo "部署主项目（Production）"
echo "========================================="

# 1. 进入项目目录
cd /path/to/production/sei-frontend-monorepo

# 2. 拉取最新代码
git pull origin main

# 3. 拉取子模块（如果使用）
git submodule update --remote --merge

# 4. 安装依赖（workspace 自动处理）
echo "[1/4] 安装依赖..."
npm ci

# 5. 构建所有包
echo "[2/4] 构建项目..."
npm run build

# 6. 构建主项目（生产版本）
echo "[3/4] 构建生产版本..."
cd packages/mainProj
npm run build

# 7. 启动服务
echo "[4/4] 启动服务..."
pm2 restart main-prod

echo "========================================="
echo "部署完成！"
echo "========================================="
```

---

## 验证 Workspace 是否生效

### 检查 node_modules

```bash
cd d:\home\sei_next_page\packages\mainProj

# 查看 shared-auth-config 是否是符号链接
ls -la node_modules/@fjsei/

# 应该看到：
# shared-auth-config -> ../../shared-auth-config
```

### 检查依赖

```bash
cd d:\home\sei_next_page

# 查看所有 workspace 的依赖关系
npm workspaces list --json
```

---

## 迁移现有项目

### 从 npm link 迁移到 workspace

```bash
# 1. 取消现有的 npm link
cd d:\home\sei_next_page\packages\mainProj
npm unlink @fjsei/shared-auth-config

cd ../shared-auth-config
npm unlink

# 2. 配置 workspace（如上所述）

# 3. 重新安装依赖
cd d:\home\sei_next_page
npm install
```

---

## 故障排查

### 问题 1：shared-auth-config 找不到

**解决方案：**

```bash
# 检查 workspace 配置
cat package.json | grep workspaces

# 清理并重新安装
rm -rf node_modules
rm -rf packages/*/node_modules
npm install
```

### 问题 2：修改共享包不生效

**解决方案：**

```bash
# 确认共享包在 watch 模式
cd packages/shared-auth-config
npm run dev  # 使用 watch 模式

# 或手动重新构建
npm run build
```

### 问题 3：构建失败

**解决方案：**

```bash
# 清理 turbo 缓存
rm -rf .turbo

# 清理所有构建产物
npm run clean

# 重新构建
npm run build
```

---

## 优势总结

| 特性 | Workspace | npm link | file: 路径 |
|------|-----------|-----------|------------|
| 开发便利性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| 自动链接 | ✅ | ❌ | ❌ |
| 热更新 | ✅ | ⚠️ | ❌ |
| 生产部署 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 版本管理 | ✅ | ❌ | ❌ |
| 依赖共享 | ✅ | ❌ | ❌ |

**推荐：Workspace（Monorepo）**
