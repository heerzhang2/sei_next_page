"use client";

import { NotificationBell } from "./notification-bell";

/**
 * 全局通知铃铛组件
 * 固定在页面右上角，独立于导航栏
 */
export function GlobalNotificationBell() {
  return (
    <div className="fixed top-2 right-2 z-50 print:hidden">
      <NotificationBell />
    </div>
  );
}
