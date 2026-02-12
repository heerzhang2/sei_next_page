import crypto from "crypto";

const revision = crypto.randomUUID();

// 获取 basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import("serwist").SerwistOptions} */
export default {
  swSrc: "src/sw.ts",
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
  }
};
