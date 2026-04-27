"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  useNotifications, 
  Notification,
  ProgressData 
} from "@/contexts/notification-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/date-utils";

// 进度条组件
function ProgressBar({ progress }: { progress?: ProgressData }) {
  if (!progress) return null;
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{progress.percentage}%</span>
        <span>{progress.current} / {progress.total}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}

// 单个通知项组件
function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onRemove 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case "error":
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
      case "warning":
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
    }
  };

  const progress = notification.data?.progress as ProgressData | undefined;

  return (
    <div 
      className={cn(
        "p-3 hover:bg-muted/50 transition-colors cursor-pointer group",
        !notification.read && "bg-blue-50/50 dark:bg-blue-900/20"
      )}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm font-medium truncate",
              !notification.read && "text-blue-700 dark:text-blue-300"
            )}>
              {notification.title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          {progress && <ProgressBar progress={progress} />}
          <p className="text-xs text-muted-foreground/60 mt-1">
            {formatDistanceToNow(notification.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

// 连接状态指示器
function ConnectionStatus({ 
  status, 
  onReconnect 
}: { 
  status: "connecting" | "connected" | "disconnected" | "error";
  onReconnect: () => void;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: <Wifi className="h-3 w-3 text-green-500" />,
          text: "已连接",
          className: "text-green-600",
        };
      case "connecting":
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin text-yellow-500" />,
          text: "连接中...",
          className: "text-yellow-600",
        };
      case "error":
        return {
          icon: <WifiOff className="h-3 w-3 text-red-500" />,
          text: "连接失败",
          className: "text-red-600",
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3 text-gray-400" />,
          text: "未连接",
          className: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
      <div className={cn("flex items-center gap-1.5 text-xs", config.className)}>
        {config.icon}
        <span>{config.text}</span>
      </div>
      {status === "error" || status === "disconnected" ? (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs"
          onClick={onReconnect}
        >
          重连
        </Button>
      ) : null}
    </div>
  );
}

// 主组件：通知铃铛
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    reconnect,
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <TooltipProvider>
      <div className="relative" ref={dropdownRef}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
              {connectionStatus === "connected" && unreadCount === 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>通知 {unreadCount > 0 ? `(${unreadCount} 条未读)` : ""}</p>
          </TooltipContent>
        </Tooltip>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50">
            {/* 头部 */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h3 className="font-semibold text-sm">通知</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={markAllAsRead}
                    title="全部已读"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={clearAll}
                    title="清空全部"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 连接状态 */}
            <ConnectionStatus status={connectionStatus} onReconnect={reconnect} />

            {/* 通知列表 */}
            {notifications.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onRemove={removeNotification}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无通知</p>
              </div>
            )}

            {/* 底部 */}
            {notifications.length > 0 && (
              <div className="px-3 py-2 border-t text-center">
                <span className="text-xs text-muted-foreground">
                  共 {notifications.length} 条通知
                  {unreadCount > 0 && ` · ${unreadCount} 条未读`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
