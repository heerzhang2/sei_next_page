import crypto from "crypto";
import { existsSync } from "node:fs";

const revision = crypto.randomUUID();

// 获取 basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// 兼容 .ts 和 .tsx（v0 环境可能自动重命名）
const swSrc = existsSync("src/app/sw.ts") ? "src/app/sw.ts" : "src/app/sw.tsx";

/** @type {import("serwist").SerwistOptions} */
export default {
  swSrc,
  swDest: "public/sw.js",
  reloadOnOnline: false,
  cacheOnNavigation: false,
  register: false, // 禁用自动注册，手动控制作用域
  maximumFileSizeToCacheInBytes: 9000000, // 减小到9MB

  // 添加 basePath 到所有预缓存 URL
  additionalPrecacheEntries: [
    { url: `${basePath}/`, revision },
    { url: `${basePath}/login`, revision },
    { url: `${basePath}/~offline`, revision },
    { url: `${basePath}/offline`, revision },
  ],

  // 添加 basePath 支持到 SW 构建过程
  buildOptions: {
    define: {
      'import.meta.env.BASE_PATH': JSON.stringify(basePath)
    }
  },

  // 排除字体文件从预缓存（字体数量多且变化大，改用 runtime cache）
  globDirectory: "public",
  globPatterns: [
    "**/*.{js,css,html,json,ico,svg,png,jpg,jpeg,webp,avif}",
    "!**/*.woff2",
    "!**/*.woff",
    "!**/*.ttf",
    "!**/*.eot"
  ],
  // 使用 modifyURLPrefix 修正路径前缀
  modifyURLPrefix: {
    '': basePath
  }
};
