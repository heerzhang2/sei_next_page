"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { withBasePath } from '@/lib/tool'
import { useSession } from "next-auth/react"

// 通知类型
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;    //显示消息
  processInstanceKey?: string;
  timestamp: Date;
  read: boolean;
  data?: any; // 额外数据，目前只处理：进度信息
}

// 进度更新数据
export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
  processInstanceKey?: string;  
}

// SSE 消息类型
export type SSEMessageType = 
  | "connected" 
  | "status" 
  | "progress" 
  | "completed" 
  | "failed" 
  | "notification";

export interface SSEMessage {
  type: SSEMessageType;
  processInstanceKey?: string;
  progress?: ProgressData;
  result?: any;
  error?: string;
  title?: string;
  message?: string;
  notificationType?: "info" | "success" | "warning" | "error";
  timestamp?: string;
  data?: any;
  _timestamp?: number; // Redis 消息的时间戳（用于去重）
  _source?: string; // 消息来源标识
}

// Context 类型
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  
  // 操作方法
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // SSE 控制 - 支持按用户ID连接
  connect: (userId: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // 桌面通知权限
  requestNotificationPermission: () => Promise<boolean>;
  sendDesktopNotification: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 生成唯一 ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 获取 API 基础路径
const getApiBasePath = () => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return basePath ? `${basePath}/api` : "/api";
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const processedMessagesRef = useRef<Set<string>>(new Set()); // 用于去重
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;
  const MESSAGE_DEDUP_WINDOW = 5000; // 5秒内的重复消息视为重复
  
  // 从 session 获取用户名（用于 SSE 连接）
  const userId = session?.user?.name || session?.user?.email || null;

  // 计算未读数量
  const unreadCount = notifications.filter(n => !n.read).length;

  // 请求桌面通知权限
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    } catch (error) {
      console.error("[Notification] 请求通知权限失败:", error);
      return false;
    }
  }, []);

  // 发送桌面通知
  const sendDesktopNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    
    if (notificationPermission === "granted" || Notification.permission === "granted") {
      try {
        new Notification(title, {
          icon: withBasePath("/fjsei-logo.png"),
          badge: withBasePath("/fjsei-logo.png"),
          ...options,
        });
      } catch (error) {
        console.error("[Notification] 发送桌面通知失败:", error);
      }
    }
  }, [notificationPermission]);

  // 添加通知
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // 最多保留 100 条
    
    // 显示 toast 通知
    const toastMessage = notification.message;
    switch (notification.type) {
      case "success":
        toast.success(notification.title, { description: toastMessage });
        break;
      case "error":
        toast.error(notification.title, { description: toastMessage });
        break;
      case "warning":
        toast.warning(notification.title, { description: toastMessage });
        break;
      default:
        toast.info(notification.title, { description: toastMessage });
    }
    
    // 发送桌面通知（如果用户不在当前页面或通知类型重要）
    if (document.hidden || notification.type === "error" || notification.type === "success") {
      sendDesktopNotification(notification.title, {
        body: notification.message,
        tag: notification.processInstanceKey || newNotification.id,
        requireInteraction: notification.type === "error",
      });
    }
  }, [sendDesktopNotification]);

  // 标记为已读
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // 标记全部已读，同时清理 Redis 中已完成的任务状态
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // 获取当前用户ID
    const activeUserId = userId || currentUserId;
    if (!activeUserId) return;
    
    try {
      // 调用 API 清理已完成的任务状态
      const response = await fetch(`${getApiBasePath()}/task-extraction/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId }),
      });
      
      if (response.ok) {
        console.log('[Notification] 已清理 Redis 中已完成的任务状态');
      }
    } catch (error) {
      console.error('[Notification] 清理任务状态失败:', error);
    }
  }, [userId, currentUserId]);

  // 删除通知，同时删除 Redis 中对应的流程实例状态
  const removeNotification = useCallback(async (id: string) => {
    // 先找到要删除的通知，获取其 processInstanceKey
    const notificationToRemove = notifications.find(n => n.id === id);
    
    // 从前端状态移除
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // 如果有对应的流程实例Key，从 Redis 中删除
    if (notificationToRemove?.processInstanceKey) {
      const activeUserId = userId || currentUserId;
      if (activeUserId) {
        try {
          const response = await fetch(`${getApiBasePath()}/task-extraction/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: activeUserId,
              processInstanceKeys: [notificationToRemove.processInstanceKey],
            }),
          });

          if (response.ok) {
            console.log(`[Notification] 已从 Redis 删除流程实例 ${notificationToRemove.processInstanceKey} 的状态`);
          }
        } catch (error) {
          console.error('[Notification] 删除任务状态失败:', error);
        }
      }
    }
  }, [notifications, userId, currentUserId]);

  // 清空所有通知
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 生成消息唯一标识（用于去重）- 基于业务内容而非时间戳
  const getMessageId = (data: SSEMessage): string => {
    // 对于进度消息，使用 processInstanceKey + current + total + percentage
    if (data.type === 'progress' && data.progress) {
      return `progress-${data.progress?.processInstanceKey}-${data.progress.current}-${data.progress.total}-${data.progress.percentage}`;
    }
    // 对于完成消息，使用 processInstanceKey + success + successCount + failedCount
    if (data.type === 'completed' && data.result?.processInstanceKey) {
      const successCount = data.result?.results?.success || 0;
      const failedCount = data.result?.results?.failed || 0;
      return `completed-${data.result?.processInstanceKey}-${successCount}-${failedCount}`;
    }
    // 对于失败消息，使用 processInstanceKey + error
    if (data.type === 'failed' && data.processInstanceKey) {
      return `failed-${data.processInstanceKey}-${data.error || ''}`;
    }
    // 对于通用通知，使用 title + message
    if (data.type === 'notification' && data.title) {
      return `notification-${data.title}-${data.message || ''}`;
    }
    // 默认使用 type + processInstanceKey
    return `${data.type}-${data.processInstanceKey || Date.now()}`;
  };

  // 清理过期的消息 ID（防止内存泄漏）
  const cleanupProcessedMessages = useCallback(() => {
    const now = Date.now();
    const messagesToDelete: string[] = [];
    
    processedMessagesRef.current.forEach((id) => {
      // 提取时间戳（假设格式为 type-timestamp 或 type-key-timestamp）
      const parts = id.split('-');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(timestamp) && now - timestamp > MESSAGE_DEDUP_WINDOW) {
        messagesToDelete.push(id);
      }
    });
    
    messagesToDelete.forEach(id => processedMessagesRef.current.delete(id));
  }, []);

  // 处理 SSE 消息
  const handleSSEMessage = useCallback((data: SSEMessage) => {
    // 消息去重检查
    const messageId = getMessageId(data);
    
    if (processedMessagesRef.current.has(messageId)) {
      console.log("[SSE] 忽略重复消息:", messageId);
      return;
    }
    
    // 记录已处理的消息
    processedMessagesRef.current.add(messageId);
    
    // 定期清理过期消息 ID
    if (processedMessagesRef.current.size > 1000) {
      cleanupProcessedMessages();
    }
    
    console.log("[SSE] 收到消息:", data);
    
    switch (data.type) {
      case "connected":
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
        break;
        
      case "progress":
        if (data.processInstanceKey && data.progress) {
          // 更新或创建进度通知
          const existingIndex = notifications.findIndex(
            n => n.processInstanceKey === data.processInstanceKey && n.type === "info"
          );
          
          if (existingIndex >= 0) {
            setNotifications(prev =>
              prev.map((n, i) =>
                i === existingIndex
                  ? { ...n, data: { ...n.data, progress: data.progress }, message: `进度: ${data.progress!.percentage}% (${data.progress!.current}/${data.progress!.total})` }
                  : n
              )
            );
          } else {
            addNotification({
              type: "info",
              title: "任务提取进行中",
              message: `进度: ${data.progress.percentage}% (${data.progress.current}/${data.progress.total})`,
              processInstanceKey: data.processInstanceKey,
              data: { progress: data.progress },
            });
          }
        }
        break;
        
      case "completed":
        if (data.result?.processInstanceKey) {
          const successCount = data.result?.results?.success || 0;
          const failedCount = data.result?.results?.failed || 0;
          
          addNotification({
            type: "success",
            title: "任务提取完成",
            message: `成功: ${successCount} 个, 失败: ${failedCount} 个`,
            processInstanceKey: data.result.processInstanceKey,
            data: data.result,
          });
        }
        break;
        
      case "failed":
        if (data.processInstanceKey) {
          addNotification({
            type: "error",
            title: "任务提取失败",
            message: data.error || "未知错误",
            processInstanceKey: data.processInstanceKey,
          });
        }
        break;
        
      case "notification":
        // 通用通知消息
        if (data.title && data.message) {
          addNotification({
            type: data.notificationType || "info",
            title: data.title,
            message: data.message,
            processInstanceKey: data.processInstanceKey,
            data: data.data,
          });
        }
        break;
    }
  }, [addNotification, notifications]);

  // 建立 SSE 连接 - 按用户ID连接
  const connect = useCallback((userId: string) => {
    if (typeof window === "undefined") return;
    
    // 如果已经在连接同一个 userId，不重复连接
    if (currentUserId === userId && eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }
    
    // 关闭现有连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setCurrentUserId(userId);
    setConnectionStatus("connecting");
    
    const sseUrl = `${getApiBasePath()}/task-extraction/events?userId=${userId}`;
    console.log("[SSE] 连接到:", sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log("[SSE] 连接已建立");
      setIsConnected(true);
      setConnectionStatus("connected");
      reconnectAttemptsRef.current = 0;
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        handleSSEMessage(data);
      } catch (error) {
        console.error("[SSE] 解析消息失败:", error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error("[SSE] 连接错误:", error);
      setIsConnected(false);
      setConnectionStatus("error");
      
      // 自动重连逻辑
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        console.log(`[SSE] ${RECONNECT_DELAY}ms 后尝试重连 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(userId);
        }, RECONNECT_DELAY);
      } else {
        console.error("[SSE] 达到最大重连次数，停止重连");
        addNotification({
          type: "error",
          title: "通知连接断开",
          message: "无法连接到服务器，请刷新页面重试",
        });
      }
    };
  }, [currentUserId, handleSSEMessage, addNotification]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setCurrentUserId(null);
    reconnectAttemptsRef.current = 0;
  }, []);

  // 重连 - 使用最新的 userId
  const reconnect = useCallback(() => {
    const activeUserId = userId || currentUserId;
    if (activeUserId) {
      console.log("[SSE] 手动重连，用户ID:", activeUserId);
      reconnectAttemptsRef.current = 0;
      connect(activeUserId);
    } else {
      console.warn("[SSE] 重连失败：没有可用的用户ID");
    }
  }, [userId, currentUserId, connect]);

  // 初始化时请求通知权限
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
      
      // 如果权限是 default，自动请求一次
      if (Notification.permission === "default") {
        requestNotificationPermission();
      }
    }
  }, [requestNotificationPermission]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 已处理的流程实例Key集合（用于避免重复生成通知）
  // 使用 localStorage 持久化，避免刷新页面后重复通知
  const PROCESSED_KEYS_STORAGE_KEY = 'sei-notification-processed-keys';
  const processedInstanceKeysRef = useRef<Set<string>>(new Set());
  
  // 从 localStorage 加载已处理的流程实例Key
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(PROCESSED_KEYS_STORAGE_KEY);
      if (stored) {
        const keys = JSON.parse(stored);
        keys.forEach((key: string) => processedInstanceKeysRef.current.add(key));
        console.log(`[Notification] 从 localStorage 加载了 ${keys.length} 个已处理的流程实例`);
      }
    } catch (e) {
      console.error('[Notification] 加载已处理流程实例失败:', e);
    }
  }, []);
  
  // 保存已处理的流程实例Key到 localStorage
  const saveProcessedKeys = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const keys = Array.from(processedInstanceKeysRef.current);
      // 只保留最近100个，避免 localStorage 过大
      const recentKeys = keys.slice(-100);
      localStorage.setItem(PROCESSED_KEYS_STORAGE_KEY, JSON.stringify(recentKeys));
    } catch (e) {
      console.error('[Notification] 保存已处理流程实例失败:', e);
    }
  }, []);
  
  // 标记流程实例为已处理
  const markInstanceAsProcessed = useCallback((instanceKey: string) => {
    processedInstanceKeysRef.current.add(instanceKey);
    saveProcessedKeys();
  }, [saveProcessedKeys]);

  // 查询未读任务状态（用于弥补 SSE 可能丢失的消息）
  // 处理所有未完成的任务，以及已完成的但未通知过的任务
  const checkMissedNotifications = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${getApiBasePath()}/task-extraction/status?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const taskStatuses = result.data;
        console.log(`[Notification] 发现 ${taskStatuses.length} 个任务状态`);
        
        // 遍历所有流程实例状态
        taskStatuses.forEach((taskStatus: any) => {
          const instanceKey = taskStatus.processInstanceKey;
          const isProcessed = processedInstanceKeysRef.current.has(instanceKey);
          
          console.log(`[Notification] 处理流程实例 ${instanceKey} 的状态: ${taskStatus.status}, 已处理: ${isProcessed}`);
          
          // 根据状态处理
          switch (taskStatus.status) {
            case 'processing':
            case 'pending':
              // 运行中的任务总是显示最新进度
              if (taskStatus.progress) {
                handleSSEMessage({
                  type: 'progress',
                  processInstanceKey: instanceKey,
                  progress: taskStatus.progress,
                });
              } else {
                // 没有进度信息，显示进行中通知（只显示一次）
                if (!isProcessed) {
                  addNotification({
                    type: "info",
                    title: "任务提取进行中",
                    message: `流程实例: ${instanceKey}`,
                    processInstanceKey: instanceKey,
                  });
                  markInstanceAsProcessed(instanceKey);
                }
              }
              break;
              
            case 'completed':
              // 已完成的任务，如果未通知过则生成通知
              if (!isProcessed) {
                handleSSEMessage({
                  type: 'completed',
                  result: {
                    processInstanceKey: instanceKey,
                    ...taskStatus.result,
                  },
                });
                markInstanceAsProcessed(instanceKey);
              }
              break;
              
            case 'failed':
              // 失败的任务，如果未通知过则生成通知
              if (!isProcessed) {
                handleSSEMessage({
                  type: 'failed',
                  processInstanceKey: instanceKey,
                  error: taskStatus.error || '任务失败',
                });
                markInstanceAsProcessed(instanceKey);
              }
              break;
          }
        });
      } else {
        console.log("[Notification] 没有未读任务状态");
      }
    } catch (error) {
      console.error("[Notification] 查询未读状态失败:", error);
    }
  }, [handleSSEMessage, addNotification, markInstanceAsProcessed]);

  // 清空通知时同时清空已处理的流程实例记录和 Redis 中的任务状态
  const clearAllNotifications = useCallback(async () => {
    // 获取当前用户ID
    const activeUserId = userId || currentUserId;
    
    if (activeUserId) {
      try {
        // 收集所有通知对应的流程实例Key
        const processInstanceKeys = notifications
          .map(n => n.processInstanceKey)
          .filter((key): key is string => !!key);
        
        // 去重
        const uniqueKeys = [...new Set(processInstanceKeys)];
        
        if (uniqueKeys.length > 0) {
          // 调用 API 删除指定的任务状态
          const response = await fetch(`${getApiBasePath()}/task-extraction/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: activeUserId,
              processInstanceKeys: uniqueKeys 
            }),
          });
          
          if (response.ok) {
            console.log(`[Notification] 已从 Redis 删除 ${uniqueKeys.length} 个任务状态`);
          }
        } else {
          // 没有特定流程实例Key，清理所有已完成的任务
          const response = await fetch(`${getApiBasePath()}/task-extraction/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUserId }),
          });
          
          if (response.ok) {
            console.log('[Notification] 已清理 Redis 中所有已完成的任务状态');
          }
        }
      } catch (error) {
        console.error('[Notification] 删除任务状态失败:', error);
      }
    }
    
    clearAll();
    processedInstanceKeysRef.current.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROCESSED_KEYS_STORAGE_KEY);
    }
  }, [clearAll, userId, currentUserId, notifications]);

  // 页面加载/用户登录后自动建立 SSE 连接
  useEffect(() => {
    // 只有认证完成且获取到用户ID后才连接
    if (sessionStatus === "authenticated" && userId) {
      console.log("[SSE] 检测到用户登录，自动建立连接，用户ID:", userId);
      // 延迟一点连接，确保其他初始化完成
      const timeout = setTimeout(() => {
        connect(userId);
        // 连接后查询未读状态（弥补 SSE 可能丢失的消息）
        checkMissedNotifications(userId);
      }, 500);
      return () => clearTimeout(timeout);
    }
    
    // 如果用户登出，断开连接
    if (sessionStatus === "unauthenticated" && currentUserId) {
      console.log("[SSE] 用户登出，断开连接");
      disconnect();
    }
  }, [sessionStatus, userId, connect, disconnect, currentUserId, checkMissedNotifications]);

  // 页面可见性变化处理 - 改进重连逻辑
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时，检查连接状态
        const activeUserId = userId || currentUserId;
        if (activeUserId && (connectionStatus === "disconnected" || connectionStatus === "error")) {
          console.log("[SSE] 页面重新可见，连接已断开，尝试重连");
          reconnectAttemptsRef.current = 0;
          connect(activeUserId);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, currentUserId, connectionStatus, connect]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll: clearAllNotifications,
    connect,
    disconnect,
    reconnect,
    requestNotificationPermission,
    sendDesktopNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
