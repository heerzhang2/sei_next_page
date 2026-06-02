"use client";

import { useEffect } from "react";
import { useNotifications } from "@/contexts/notification-context";
import { useTrackedProcesses } from "./use-tracked-processes";

/**
 * 流程跟踪集成 Hook
 * 监听通知上下文中的 SSE 消息，自动更新流程跟踪状态
 */
export function useProcessTracker() {
  const { notifications } = useNotifications();
  const { markCompleted, markFailed, updateProcess } = useTrackedProcesses();

  useEffect(() => {
    // 遍历通知，查找流程相关的完成/失败通知
    notifications.forEach((notification) => {
      if (!notification.processInstanceKey) return;

      switch (notification.type) {
        case "success":
          // 任务提取完成
          if (notification.title === "任务提取完成") {
            markCompleted(notification.processInstanceKey, notification.data);
          }
          break;

        case "error":
          // 任务提取失败
          if (notification.title === "任务提取失败") {
            markFailed(notification.processInstanceKey, notification.message);
          }
          break;

        case "info":
          // 进度更新
          if (notification.title === "任务提取进行中" && notification.data?.progress) {
            updateProcess(notification.processInstanceKey, {
              status: "running",
            });
          }
          break;
      }
    });
  }, [notifications, markCompleted, markFailed, updateProcess]);
}
