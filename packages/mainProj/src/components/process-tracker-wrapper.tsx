"use client";

import { useProcessTracker } from "@/hooks/use-process-tracker";

/**
 * 流程跟踪包装组件
 * 在应用根布局中使用，自动监听通知并更新流程跟踪状态
 */
export function ProcessTrackerWrapper({ children }: { children: React.ReactNode }) {
  useProcessTracker();
  return <>{children}</>;
}
