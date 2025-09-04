'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TokenRefreshDemo() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleRefreshToken = async () => {
        setLoading(true);
        setResult(null);

        try {
            // 1. 调用刷新API
            const response = await fetch('/api/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setResult({ success: true, message: 'Token刷新成功' });

                // 2. 手动更新session - 这是关键步骤！
               const newsession= await update({
                    ...session,
                    user: {
                        ...session?.user,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    },
                });

                console.log('Session已更新',newsession,"OLD=",session);
            } else {
                setResult({ success: false, message: data.error || 'Token刷新失败' });
            }
        } catch (error) {
            console.error('刷新token时出错:', error);
            setResult({ success: false, message: '请求失败' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 px-6 py-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">NextAuth Token刷新演示</h1>
                    <p className="text-indigo-100">理解并解决token刷新后session不更新的问题</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">当前Session信息</h2>
                        <div className="bg-gray-800 p-4 rounded text-white font-mono text-sm overflow-x-auto">
                            <pre>{JSON.stringify(session, null, 2)}</pre>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h2 className="text-lg font-semibold text-yellow-800 mb-2">问题说明</h2>
                        <p className="text-yellow-700">
                            您的API路由成功刷新了token，但NextAuth的session没有自动更新。
                            这是因为API返回的新token不会自动合并到session中。
                        </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h2 className="text-lg font-semibold text-green-800 mb-2">解决方案</h2>
                        <p className="text-green-700 mb-3">
                            调用刷新API后，必须手动更新session：
                        </p>
                        <div className="bg-gray-800 p-4 rounded text-white font-mono text-sm overflow-x-auto">
              <pre>{`// 调用刷新API
const response = await fetch('/api/refresh-token', { method: 'POST' });
const data = await response.json();

if (data.success) {
  // 手动更新session
  await update({
    ...session,
    user: {
      ...session.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    },
  });
}`}</pre>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleRefreshToken}
                            disabled={loading}
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    刷新中...
                                </>
                            ) : (
                                '刷新Token并更新Session'
                            )}
                        </button>

                        {result && (
                            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'}`}>
                                {result.success ? (
                                    <p>✅ {result.message}</p>
                                ) : (
                                    <p>❌ {result.message}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">完整解决方案</h2>
                        <p className="text-gray-700 mb-3">
                            对于生产环境，建议实现自动token刷新机制：
                        </p>
                        <div className="bg-gray-800 p-4 rounded text-white font-mono text-sm overflow-x-auto">
              <pre>{`// lib/auth.ts - 自动刷新token的示例
import { jwtDecode } from "jwt-decode";

export const refreshAuthToken = async () => {
  const { data: session, update } = useSession();
  
  if (!session?.user?.accessToken) return null;
  
  // 检查token是否即将过期
  const decoded = jwtDecode(session.user.accessToken);
  const now = Date.now() / 1000;
  const buffer = 300; // 提前5分钟刷新
  
  if (decoded.exp && decoded.exp - now < buffer) {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 更新session
        await update({
          ...session,
          user: {
            ...session.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
        });
        
        return data.accessToken;
      }
    } catch (error) {
      console.error('自动刷新token失败:', error);
    }
  }
  
  return session.user.accessToken;
};`}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
