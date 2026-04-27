/**
 * 日期工具函数
 * 使用 date-fns 进行日期格式化
 */

import { formatDistanceToNow as formatDistanceToNowFns, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化相对时间（如：2分钟前、1小时前）
 */
export function formatDistanceToNow(date: Date | string | number): string {
  try {
    const targetDate = new Date(date);
    return formatDistanceToNowFns(targetDate, { 
      addSuffix: true,
      locale: zhCN 
    });
  } catch (error) {
    console.error('[DateUtils] formatDistanceToNow error:', error);
    return String(date);
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string | number): string {
  try {
    const targetDate = new Date(date);
    return format(targetDate, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch (error) {
    console.error('[DateUtils] formatDateTime error:', error);
    return String(date);
  }
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number): string {
  try {
    const targetDate = new Date(date);
    return format(targetDate, 'yyyy-MM-dd', { locale: zhCN });
  } catch (error) {
    console.error('[DateUtils] formatDate error:', error);
    return String(date);
  }
}

/**
 * 格式化时间为相对时间（简化版）
 * 如：刚刚、5分钟前、2小时前、昨天、3天前
 */
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const targetDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
    
    if (diffInSeconds < 10) {
      return '刚刚';
    }
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} 秒前`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} 分钟前`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} 小时前`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return '昨天';
    }
    
    if (diffInDays < 7) {
      return `${diffInDays} 天前`;
    }
    
    // 超过一周显示具体日期
    return format(targetDate, 'MM-dd HH:mm', { locale: zhCN });
  } catch (error) {
    console.error('[DateUtils] formatRelativeTime error:', error);
    return String(date);
  }
}
