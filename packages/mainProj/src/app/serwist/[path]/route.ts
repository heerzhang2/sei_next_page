import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// 如果使用的 Next.js 版本低于 15.0.0，请添加
// `nextConfig` 选项，以便 Serwist 可以根据你的配置
// 选项来配置服务工作线程。Serwist 10 及更高版本
// 将仅支持 Next.js 15.0.0 及以上版本。
// import nextConfig from "$cwd/next.config.mjs";

// 这是可选的！
// revision（修订号）有助于 Serwist 对预缓存的页面进行版本控制。
// 这可以避免使用过时的预缓存响应。然而，使用
// `git rev-parse HEAD` 可能不是确定修订号的最高效方式。
// 你可能更倾向于使用你预缓存的每个额外文件的哈希值。
const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() || crypto.randomUUID();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// 在构建前注入 basePath 到 sw.ts 源文件
// 尝试 sw.ts 和 sw.tsx（v0 环境自动重命名为 .tsx）
const swTsPath = join(process.cwd(), "src/app/sw.ts");
const swTsxPath = join(process.cwd(), "src/app/sw.tsx");

let swSrcPath = swTsPath;
try {
  readFileSync(swTsPath, "utf-8");
} catch {
  swSrcPath = swTsxPath;
}

try {
  let swContent = readFileSync(swSrcPath, "utf-8");
  // 替换占位符
  swContent = swContent.replace(
    /__NEXT_PUBLIC_BASE_PATH__\s*=\s*"[^"]*"/,
    `__NEXT_PUBLIC_BASE_PATH__ = "${basePath}"`
  );
  writeFileSync(swSrcPath, swContent, "utf-8");
} catch (error) {
  console.warn("Failed to inject basePath into sw source:", error);
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [
    { url: `${basePath}/`, revision },
    { url: `${basePath}/login`, revision },
    { url: `${basePath}/~offline`, revision },
    { url: `${basePath}/offline`, revision },
  ],
  swSrc: swSrcPath.includes(".tsx") ? "src/app/sw.tsx" : "src/app/sw.ts", // 指向你编写的服务工作线程源文件（兼容 .ts 和 .tsx）
  // nextConfig, // 在 Next.js < 15 时使用
  // 如果设置为 `false`，Serwist 将尝试使用 `esbuild-wasm`。
  useNativeEsbuild: true,
});
