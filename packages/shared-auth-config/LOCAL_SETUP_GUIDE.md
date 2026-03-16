# 本地引用共享配置包指南

## 方式一：npm link（推荐用于本地开发）

### 步骤 1：在共享包目录链接

```bash
cd d:\home\sei_next_page\packages\shared-auth-config

# 首次需要安装依赖
npm install

# 构建 TypeScript
npm run build

# 创建全局链接
npm link
```

**输出示例：**
```
audited 1 package in 1s
success Linked "@fjsei/shared-auth-config@1.0.0"
```

### 步骤 2：在使用项目（mainProj）中引用

```bash
cd d:\home\sei_next_page\packages\mainProj

# 链接到本地包
npm link @fjsei/shared-auth-config
```

**输出示例：**
```
/Users/xxx/.nvm/versions/node/v20.x/lib/node_modules/@fjsei/shared-auth-config -> d:\home\sei_next_page\packages\shared-auth-config
```

### 步骤 3：验证链接

```bash
cd d:\home\sei_next_page\packages\mainProj

# 查看链接是否成功
npm list @fjsei/shared-auth-config
```

**预期输出：**
```
@fjsei/shared-auth-config@1.0.0 -> d:\home\sei_next_page\packages\shared-auth-config
```

### 步骤 4：修改 package.json（如需要）

检查 `mainProj/package.json` 中的依赖：

```json
{
  "dependencies": {
    "@fjsei/shared-auth-config": "*"
  }
}
```

**注意：**
- 使用 `"*"` 表示接受任何版本（开发阶段）
- 生产环境应改为具体版本号（如 `"^1.0.0"`）

### 步骤 5：使用

```typescript
// src/app/auth.config.ts
import { sharedAuthConfig, hasRole } from "@fjsei/shared-auth-config"

export const authConfig = {
  ...sharedAuthConfig,
  // 项目特定配置
}
```

---

## 方式二：npm workspace（推荐用于 monorepo）

如果使用 npm/yarn/pnpm workspace，更推荐这种方式。

### 步骤 1：配置根 package.json

编辑 `d:\home\sei_next_page\package.json`：

```json
{
  "name": "sei-frontend-monorepo",
  "version": "1.0.0",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

### 步骤 2：配置各子项目

**shared-auth-config/package.json：**
```json
{
  "name": "@fjsei/shared-auth-config",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

**mainProj/package.json：**
```json
{
  "name": "main_proj",
  "dependencies": {
    "@fjsei/shared-auth-config": "workspace:*"
  }
}
```

### 步骤 3：安装依赖

```bash
cd d:\home\sei_next_page

# npm 7+ 自动识别 workspaces
npm install

# 或使用 pnpm
pnpm install

# 或使用 yarn
yarn install
```

### 步骤 4：使用

```bash
# 开发模式（watch shared-auth-config）
cd d:\home\sei_next_page\packages\shared-auth-config
npm run dev

# 另一个终端启动主项目
cd d:\home\sei_next_page\packages\mainProj
npm run dev
```

**优势：**
- ✅ 自动链接，无需 `npm link`
- ✅ 支持热更新
- ✅ 依赖管理更清晰

---

## 方式三：相对路径引用（最简单，但不推荐）

### 步骤 1：直接使用相对路径

**mainProj/package.json：**
```json
{
  "dependencies": {
    "@fjsei/shared-auth-config": "file:../shared-auth-config"
  }
}
```

### 步骤 2：安装

```bash
cd d:\home\sei_next_page\packages\mainProj
npm install
```

**问题：**
- ⚠️ `npm` 会复制代码到 `node_modules`，修改不会立即生效
- ⚠️ 每次修改需要重新 `npm install`
- ⚠️ TypeScript 可能找不到类型定义

**不推荐用于开发阶段。**

---

## 编译注意事项 ⚠️

### 1. 必须先构建共享包

```bash
# 共享包目录
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

# 检查 dist 目录是否存在
ls dist
# 应该看到: index.js, index.d.ts
```

### 2. TypeScript 配置

**shared-auth-config/tsconfig.json：**
```json
{
  "compilerOptions": {
    "declaration": true,        // 生成 .d.ts 类型文件
    "declarationMap": true,     // 生成 .d.ts.map
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,         // 启用项目引用
    "incremental": true        // 增量编译
  }
}
```

### 3. 消除 TypeScript 错误

如果在使用项目（mainProj）中遇到类型错误：

```bash
# 方式 A：重新构建共享包
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

# 方式 B：重启 TypeScript 服务（VSCode）
Ctrl + Shift + P → "TypeScript: Restart TS Server"

# 方式 C：清除缓存
cd d:\home\sei_next_page\packages\mainProj
rm -rf node_modules/.cache
rm -rf .next
npm run dev
```

### 4. Next.js 开发服务器缓存

**问题：** 修改共享包后，Next.js 可能不重新编译

**解决：**

```bash
# 方式 A：重启开发服务器
Ctrl + C
npm run dev

# 方式 B：强制清除缓存
cd d:\home\sei_next_page\packages\mainProj
rm -rf .next
npm run dev

# 方式 C：使用 watch 模式（Turbo）
# turbo.json 中配置
```

### 5. 路径别名问题

如果遇到模块解析问题，检查 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "references": [
    { "path": "../shared-auth-config" }
  ]
}
```

---

## 调试技巧

### 1. 查看实际引用的文件

```bash
cd d:\home\sei_next_page\packages\mainProj

# 查看模块解析路径
npm ls @fjsei/shared-auth-config

# 或使用 tsc 查看编译信息
npx tsc --showConfig
```

### 2. 添加 console.log 调试

**shared-auth-config/src/auth.config.ts：**
```typescript
console.log("[shared-auth-config] Loaded:", __filename)
```

### 3. 使用 source map

**shared-auth-config/tsconfig.json：**
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false
  }
}
```

---

## 团队协作注意事项

### 团队成员首次设置

```bash
# 1. 克隆仓库
git clone <repo>
cd d:\home\sei_next_page

# 2. 安装所有依赖
npm install

# 3. 链接共享包（仅一次）
cd packages/shared-auth-config
npm link

cd ../../packages/mainProj
npm link @fjsei/shared-auth-config

# 4. 启动开发服务器
cd packages/mainProj
npm run dev
```

### 提交代码前

```bash
# 1. 确保共享包已构建
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

# 2. 提交 dist 目录
git add dist
git commit -m "Update shared-auth-config"

# 3. 或添加到 .gitignore（如果不想提交 dist）
# echo "dist/" >> .gitignore
```

### .gitignore 配置

**shared-auth-config/.gitignore：**
```bash
node_modules
*.log

# 开发阶段可以忽略 dist，但 CI/CD 需要构建
dist/
```

---

## 生产环境部署

### 选项 A：发布到 npm（最终方案）

```bash
# 1. 登录 npm
npm login

# 2. 发布
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build
npm publish

# 3. 使用项目修改依赖
cd d:\home\sei_next_page\packages\mainProj
npm install @fjsei/shared-auth-config@1.0.0
```

### 选项 B：Git Submodule（备选）

```bash
# 在主项目中添加子模块
cd d:\home\sei_next_page\packages\mainProj
git submodule add <shared-auth-config-repo> libs/shared-auth-config

# 安装
npm install ../shared-auth-config
```

---

## 推荐配置（开发阶段）

**使用 npm link：**

```bash
# 首次设置（只需一次）
cd d:\home\sei_next_page\packages\shared-auth-config
npm install && npm run build && npm link

cd d:\home\sei_next_page\packages\mainProj
npm link @fjsei/shared-auth-config

# 后续开发
# 1. 修改 shared-auth-config
# 2. cd shared-auth-config && npm run build
# 3. cd mainProj && npm run dev
```

**修改共享包后的快速重启：**

```bash
# 一键脚本
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

cd d:\home\sei_next_page\packages\mainProj
rm -rf .next
npm run dev
```

---

## 故障排查

### 问题 1：找不到模块

```bash
# 检查链接
npm list @fjsei/shared-auth-config

# 重新链接
cd d:\home\sei_next_page\packages\shared-auth-config
npm unlink
npm link

cd d:\home\sei_next_page\packages\mainProj
npm link @fjsei/shared-auth-config
```

### 问题 2：类型错误

```bash
# 重新构建共享包
cd d:\home\sei_next_page\packages\shared-auth-config
npm run build

# 重启 TS Server（VSCode）
Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### 问题 3：Next.js 不更新

```bash
# 清除 Next.js 缓存
cd d:\home\sei_next_page\packages\mainProj
rm -rf .next
npm run dev
```

---

## 总结

| 特性 | npm link | workspace | file: 路径 |
|------|-----------|-----------|-------------|
| 开发便利性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 热更新 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| 配置复杂度 | 中 | 低 | 低 |
| 推荐场景 | 本地开发 | Monorepo | 临时方案 |

**推荐：** 开发阶段使用 `npm link`，成熟后考虑迁移到 `workspace`。
