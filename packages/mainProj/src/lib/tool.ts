/**
 * 为 API 路径添加 basePath 前缀
 * @example withBasePath('/api/nextLive') => '/report/api/nextLive'
 *为静态资源路径添加 basePath 前缀
 * @example withAssetPath('/images/seal.png') => '/report/images/seal.png'
 */
export function withBasePath(path: string): string {
  const basePath =process.env.NEXT_PUBLIC_BASE_PATH || ""
  if (!basePath) return path
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
