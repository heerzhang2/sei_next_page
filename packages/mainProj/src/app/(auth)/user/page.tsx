"use client"

import React, { useState } from "react";
import { useQuery } from "@urql/next";
import { AuthCompQuery } from "@/component/header-wrapper";
import { withBasePath } from "@/lib/tool";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UserPage() {
  const router = useRouter();
  const [refreshingRoles, setRefreshingRoles] = useState(false);

  const handleRefreshRoles = async () => {
    setRefreshingRoles(true);
    try {
      const res = await fetch(withBasePath('/api/user/clear-role-cache'), { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('角色缓存已清除，正在重新加载...');
        reexecuteQuery({ requestPolicy: 'network-only' });
      } else {
        toast.error('清除角色缓存失败: ' + (data.error || '未知错误'));
      }
    } catch (e: any) {
      toast.error('请求失败: ' + e.message);
    } finally {
      setRefreshingRoles(false);
    }
  };

  const [result, reexecuteQuery] = useQuery({
    query: AuthCompQuery,
    variables: {},
    requestPolicy: "network-only",
  });

  const { data, error, fetching } = result;
  const userInfo = data?.authUser;
  
  // 如果未登录，显示登录提示
  if (!fetching && !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">您还未登录</h2>
            <p className="text-yellow-700 mb-4">请先登录以查看您的账户信息和权限详情</p>
            <Link href="/login" className="inline-flex items-center px-6 py-3 bg-blue-100 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors shadow-md">
              前往登录
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 获取详细的用户信息
  
  // 如果正在加载，显示加载状态
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载用户信息...</p>
          </div>
        </div>
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">加载失败</h2>
            <p className="text-red-700 mb-4">{error.message || "获取用户信息失败，请稍后重试"}</p>
            <button 
              onClick={() => reexecuteQuery({ requestPolicy: "network-only" })}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '未知';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">用户信息</h1>
          <p className="mt-2 text-gray-600">查看您的账户信息和权限详情</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 基本信息卡片 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              基本信息
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">用户ID</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{userInfo?.id || '未设置'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">用户名</span>
                  <span className="font-medium text-gray-900">{userInfo?.username || '未设置'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">认证名</span>
                  <span className="font-medium text-gray-900">{userInfo?.authName || '未设置'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">姓名</span>
                  <span className="font-medium text-gray-900">{userInfo?.person?.name || '未设置'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">登录时间</span>
                  <span className="text-sm text-gray-600">{formatDate(Date.now())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 组织机构信息 */}
        {userInfo && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                组织机构
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500">所属单位</span>
                    <span className="font-medium text-gray-900">{userInfo.unit?.name || '未设置'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500">部门</span>
                    <span className="font-medium text-gray-900">{userInfo.dep?.name || '未设置'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-500">科室</span>
                    <span className="font-medium text-gray-900">{userInfo.office?.name || '未设置'}</span>
                  </div>
                  {userInfo.ispUnits && userInfo.ispUnits.length > 0 && (
                    <div className="border-b border-gray-100 pb-3">
                      <span className="text-gray-500 block mb-2">检验单位</span>
                      <div className="flex flex-wrap gap-2">
                        {userInfo.ispUnits.map((ispUnit) => (
                          <span key={ispUnit.id} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {ispUnit.unit.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 权限信息 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              权限信息
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <span className="text-gray-600">
                {userInfo?.authorities && userInfo.authorities.length > 0
                  ? '您拥有以下权限角色：'
                  : '暂无权限信息'}
              </span>
              <div className="flex items-center gap-2">
                {userInfo?.authorities && userInfo.authorities.length > 0 && (
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    共 {userInfo.authorities.length} 个角色
                  </span>
                )}
                <button
                  onClick={handleRefreshRoles}
                  disabled={refreshingRoles}
                  className="inline-flex items-center px-3 py-1 text-xs rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 mr-1 ${refreshingRoles ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshingRoles ? '刷新中...' : '刷新角色'}
                </button>
              </div>
            </div>
            {userInfo?.authorities && userInfo.authorities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {userInfo.authorities.map((authority) => (
                  <div 
                    key={authority.id} 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-900 block truncate">{authority.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{authority.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href={"/"} 
            className="inline-flex items-center px-6 py-3 bg-blue-200 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回首页
          </Link>

          <Link 
            href={"/user/change-password"} 
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            修改密码
          </Link>
        </div>
      </div>
    </div>
  );
}
