"use client";

import { useState, useEffect, useCallback } from "react";

// 跟踪的流程实例信息
export interface TrackedProcess {
  processInstanceKey: string;
  title: string; // 用户可识别的标题
  createdAt: string; // 创建时间 ISO 字符串
  status: "running" | "completed" | "failed" | "unknown";
  lastUpdated: string;
  result?: any; // 完成后的结果
  error?: string; // 失败时的错误信息
}

const STORAGE_KEY = "sei-tracked-processes";

export function useTrackedProcesses() {
  const [processes, setProcesses] = useState<TrackedProcess[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProcesses(parsed);
      }
    } catch (e) {
      console.error("[TrackedProcesses] Failed to load from storage:", e);
    }
    setIsLoaded(true);
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
    } catch (e) {
      console.error("[TrackedProcesses] Failed to save to storage:", e);
    }
  }, [processes, isLoaded]);

  // 添加新的流程跟踪
  const addProcess = useCallback((processInstanceKey: string, title: string) => {
    setProcesses((prev) => {
      // 如果已存在，不重复添加
      if (prev.some((p) => p.processInstanceKey === processInstanceKey)) {
        return prev;
      }
      
      const now = new Date().toISOString();
      const newProcess: TrackedProcess = {
        processInstanceKey,
        title,
        createdAt: now,
        status: "running",
        lastUpdated: now,
      };
      
      // 最多保留 50 条记录
      const updated = [newProcess, ...prev].slice(0, 50);
      return updated;
    });
  }, []);

  // 更新流程状态
  const updateProcess = useCallback((processInstanceKey: string, updates: Partial<TrackedProcess>) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.processInstanceKey === processInstanceKey
          ? { ...p, ...updates, lastUpdated: new Date().toISOString() }
          : p
      )
    );
  }, []);

  // 标记为完成
  const markCompleted = useCallback((processInstanceKey: string, result?: any) => {
    updateProcess(processInstanceKey, {
      status: "completed",
      result,
    });
  }, [updateProcess]);

  // 标记为失败
  const markFailed = useCallback((processInstanceKey: string, error?: string) => {
    updateProcess(processInstanceKey, {
      status: "failed",
      error,
    });
  }, [updateProcess]);

  // 删除流程记录
  const removeProcess = useCallback((processInstanceKey: string) => {
    setProcesses((prev) =>
      prev.filter((p) => p.processInstanceKey !== processInstanceKey)
    );
  }, []);

  // 清空所有记录
  const clearAll = useCallback(() => {
    setProcesses([]);
  }, []);

  // 清理已完成/失败的旧记录（超过7天的）
  const cleanupOldProcesses = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    setProcesses((prev) =>
      prev.filter((p) => {
        // 保留运行中的任务
        if (p.status === "running") return true;
        // 保留7天内的已完成/失败任务
        const updatedDate = new Date(p.lastUpdated);
        return updatedDate > sevenDaysAgo;
      })
    );
  }, []);

  // 批量更新流程状态（用于从 Camunda 同步）
  const batchUpdateProcesses = useCallback((updates: Array<{
    processInstanceKey: string;
    status: TrackedProcess["status"];
    error?: string;
  }>) => {
    setProcesses((prev) => {
      const updated = [...prev];
      updates.forEach(({ processInstanceKey, status, error }) => {
        const index = updated.findIndex(p => p.processInstanceKey === processInstanceKey);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            status,
            ...(error && { error }),
            lastUpdated: new Date().toISOString(),
          };
        }
      });
      return updated;
    });
  }, []);

  // 获取运行中的流程数量
  const runningCount = processes.filter((p) => p.status === "running").length;

  // 获取已完成的流程数量
  const completedCount = processes.filter((p) => p.status === "completed").length;

  // 获取失败的流程数量
  const failedCount = processes.filter((p) => p.status === "failed").length;

  return {
    processes,
    isLoaded,
    addProcess,
    updateProcess,
    markCompleted,
    markFailed,
    removeProcess,
    clearAll,
    cleanupOldProcesses,
    batchUpdateProcesses,
    runningCount,
    completedCount,
    failedCount,
  };
}
