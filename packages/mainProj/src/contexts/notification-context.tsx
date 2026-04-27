"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

// 通知类型
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  processInstanceKey?: string;
  timestamp: Date;
  read: boolean;
  data?: any; // 额外数据，如进度信息
}

// 进度更新数据
export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
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
}

// Context 类型
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  currentUserId: string | null;
  
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

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
          icon: "/fjsei-logo.png",
          badge: "/fjsei-logo.png",
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

  // 标记全部已读
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // 删除通知
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // 清空所有通知
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // 处理 SSE 消息
  const handleSSEMessage = useCallback((data: SSEMessage) => {
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
        if (data.processInstanceKey) {
          const successCount = data.result?.results?.success || 0;
          const failedCount = data.result?.results?.failed || 0;
          
          addNotification({
            type: "success",
            title: "任务提取完成",
            message: `成功: ${successCount} 个, 失败: ${failedCount} 个`,
            processInstanceKey: data.processInstanceKey,
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

  // 重连
  const reconnect = useCallback(() => {
    if (currentUserId) {
      reconnectAttemptsRef.current = 0;
      connect(currentUserId);
    }
  }, [currentUserId, connect]);

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

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUserId && connectionStatus === "disconnected") {
        // 页面重新可见时，如果连接断开则自动重连
        reconnect();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUserId, connectionStatus, reconnect]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
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
