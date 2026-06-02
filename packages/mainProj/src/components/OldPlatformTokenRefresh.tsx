'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/tool'

/**
 * 旧平台第三方系统 Token 自动刷新组件
 * - 页面加载时主动检查旧平台 token 有效期
 * - 每 9 分钟检查一次，剩余不足 10 分钟时自动刷新;
 * 旧平台的 brief_token 还没有发挥其用处？
 */
export default function OldPlatformTokenRefresh() {
  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        const res = await fetch(withBasePath("/api/third-party/refresh-token"));
        const data = await res.json();
        if (data.needLogin) {
          console.warn('[OldPlatformTokenRefresh] 旧平台token已失效，请访问"旧平台登录"页面重新登录');
        } else if (data.refreshed) {
          console.log('[OldPlatformTokenRefresh] 旧平台token已自动刷新');
        } else if (data.valid) {
          console.log(`[OldPlatformTokenRefresh] 旧平台token有效，剩余 ${Math.round(data.remaining / 60)} 分钟`);
        }
      } catch (e) {
        console.error('[OldPlatformTokenRefresh] 检查失败:', e);
      }
    };

    // 页面加载时立即检查
    checkAndRefresh();

    // 每 9 分钟检查一次
    const interval = setInterval(checkAndRefresh, 9 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 无 UI 渲染
  return null;
}
