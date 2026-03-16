# PWA 缓存策略 - 避免不必要的重新缓存

## 问题背景

Next.js 使用代码分割（code-splitting），每次 build 会生成带 hash 的 chunk 文件（如 `1701-8b66dffca0bcde26.js`）。

**你的疑问：** 即使模板代码没变，重新 build 后是否需要重新缓存？

**答案：不需要！** 你已经有了 `changeTime` 机制来解决这个问题。

## 你的现有配置（已经很好！）

\`\`\`typescript
// src/app/rep/[repId]/INDPL_DJ/1/config.ts
import {registerUrl} from "@/report/industrial/Periodical/indPipelineO1";
export const cacheUrls: string[] = registerUrl("INDPL_DJ","1")
export const changeTime: number = new Date("2025-09-03 17:00:00").getTime();
\`\`\`

\`\`\`typescript
// src/app/rep/[repId]/SLIDING_JJ/1/config.ts
import {registerUrl} from "@/report/industrial/Periodical/indPipelineO1";
export const cacheUrls: string[] = registerUrl("SLIDING_JJ","1")
export const changeTime: number = new Date("2025-09-19 11:09:00").getTime();
\`\`\`

## 工作原理

### 场景 A：只是重新 build，代码没变

\`\`\`bash
# 1. 重新 build
npm run build

# 2. 启动服务器
npm run start:https

# 3. 访问 /pwa 页面
# 结果：系统检查 changeTime，发现没有变化
# 显示："已是最新" ✓
# 操作：无需任何操作！
\`\`\`

**为什么不需要重新缓存？**
- 旧的 HTML/RSC 响应仍在缓存中（30天有效期）
- 旧的 chunks 仍在缓存中（90天有效期，2000条目容量）
- 即使 build 生成了新的 chunks，旧页面仍然使用旧 chunks
- 离线时完全可以正常工作

### 场景 B：代码实际修改了

\`\`\`bash
# 1. 修改模板代码
vim src/app/rep/[repId]/INDPL_DJ/1/[action]/page.tsx

# 2. 更新 changeTime（重要！）
vim src/app/rep/[repId]/INDPL_DJ/1/config.ts
# 修改为: export const changeTime: number = new Date("2025-01-15 10:00:00").getTime();

# 3. Build
npm run build

# 4. 访问 /pwa 页面
# 结果：系统检查 changeTime，发现已更新
# 显示："需要更新" ⚠️
# 操作：点击"自动更新"按钮（只更新这个模板）
\`\`\`

### 场景 C：服务器突然宕机

\`\`\`
用户访问报告 → Service Worker 从缓存加载
→ HTML 引用旧 chunks → 旧 chunks 在缓存中
→ 页面正常显示 ✓
\`\`\`

## 缓存策略详解

### 1. Chunks 缓存（已优化）

\`\`\`typescript
{
cacheName: "next-chunks",
strategy: CacheFirst,
maxEntries: 2000,        // 可以保存多个版本的 chunks
maxAgeSeconds: 90天,     // 长期保留
maxAgeFrom: "last-used"  // 基于最后使用时间
}
\`\`\`

**关键特性：**
- 旧 chunks 不会立即删除
- 可以同时保存多个 build 版本的 chunks
- 只要页面还在使用，就不会过期

### 2. 报告页面缓存

\`\`\`typescript
{
cacheName: "report-pages-normalized",
strategy: NetworkFirst,
maxAgeSeconds: 30天,
maxAgeFrom: "last-used"
}
\`\`\`

### 3. 缓存验证机制

PWA 页面的 `validateTemplateCacheFromSerwist` 函数会：

\`\`\`typescript
1. 读取模板的 changeTime
2. 检查 IndexedDB 中的缓存时间戳
3. 比较：cacheTimestamp < templateChangeTime ?
4. 如果过期 → 显示"需要更新"
5. 如果未过期 → 显示"已是最新"
   \`\`\`

## 最佳实践

### ✅ 正确做法

\`\`\`typescript
// 只在代码实际修改时更新 changeTime
export const changeTime: number = new Date("2025-01-15 10:00:00").getTime();
\`\`\`

**规则：**
- 修改了模板代码 → 更新 changeTime
- 只是重新 build → 不要改 changeTime
- 修改了依赖的组件 → 更新 changeTime
- 只是修改了注释 → 不需要更新 changeTime

### ❌ 错误做法

\`\`\`typescript
// 不要每次 build 都自动更新
export const changeTime: number = Date.now(); // ❌ 错误！
\`\`\`

## 实际操作流程

### 日常开发（代码没变）

\`\`\`bash
1. npm run build
2. npm run start:https
3. 访问 /pwa 页面
4. 看到所有模板显示"已是最新" ✓
5. 完成！无需任何操作
   \`\`\`

### 修改了某个模板

\`\`\`bash
1. 修改 INDPL_DJ 模板代码
2. 更新 src/app/rep/[repId]/INDPL_DJ/1/config.ts 的 changeTime
3. npm run build
4. npm run start:https
5. 访问 /pwa 页面
6. 看到 INDPL_DJ 显示"需要更新" ⚠️
7. 点击"自动更新"按钮
8. 只有 INDPL_DJ 会被重新缓存，其他模板不受影响 ✓
   \`\`\`

### 想强制更新所有模板

\`\`\`bash
1. 访问 /pwa 页面
2. 点击"重新预缓存"按钮（不是"自动更新"）
3. 所有模板都会被重新缓存
   \`\`\`

## 故障排除

### Q: 为什么显示"需要更新"，但我没改代码？

**A:** 检查 `config.ts` 中的 `changeTime` 是否被错误更新了。

\`\`\`bash
# 查看 git 历史
git log -p src/app/rep/[repId]/INDPL_DJ/1/config.ts

# 如果 changeTime 被错误更新，改回去
git checkout HEAD~1 src/app/rep/[repId]/INDPL_DJ/1/config.ts
\`\`\`

### Q: 离线时页面报错 "no-response"

**A:** 某些 chunks 从未被缓存。

\`\`\`bash
1. 在线访问 /pwa 页面
2. 点击"重新预缓存"
3. 等待完成
   \`\`\`

### Q: 想清理旧的 chunks

**A:** Service Worker 会自动管理：
- 超过 90 天未使用的 chunks 会被删除
- 超过 2000 条目时，最旧的会被删除
- 你也可以在 /pwa 页面点击"完全重置"

## 技术细节

### changeTime 的作用

\`\`\`typescript
// PWA 页面检查逻辑
const templateChangeTime = templateModule.changeTime; // 从 config.ts 读取
const cacheTimestamp = // 从 IndexedDB 读取上次缓存时间

if (cacheTimestamp < templateChangeTime) {
// 模板已更新，需要重新缓存
status.needsUpdate = true;
} else {
// 缓存仍然有效
status.needsUpdate = false;
}
\`\`\`

### 为什么旧 chunks 仍然可用？

\`\`\`
Build 1:
HTML → 引用 chunk-abc123.js
Cache: HTML + chunk-abc123.js

Build 2 (代码没变):
HTML → 引用 chunk-def456.js
Cache: HTML(旧) + chunk-abc123.js(旧) + HTML(新) + chunk-def456.js(新)

离线访问:
加载 HTML(旧) → 引用 chunk-abc123.js → 从缓存加载 ✓
\`\`\`

因为 `changeTime` 没变，PWA 页面不会强制更新缓存，旧的 HTML 和 chunks 继续工作。

## 总结

**核心答案：**

1. ✅ **代码没变 + changeTime 没变 = 不需要重新缓存**
2. ✅ **代码修改 + 更新 changeTime = 只更新这个模板**
3. ✅ **旧 chunks 保留 90 天，确保离线可用**
4. ✅ **你的系统已经配置正确，只需正确使用 changeTime**

**关键规则：**
- 只在代码实际修改时更新 `changeTime`
- 重新 build 不等于需要重新缓存
- 使用"自动更新"而不是"重新预缓存"
- 让系统自动检测哪些模板需要更新
