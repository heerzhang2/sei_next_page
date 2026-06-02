'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, Shield, Home } from 'lucide-react';
import { toast } from 'sonner';
import { withBasePath } from '@/lib/tool';

export default function ThirdPartyLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(withBasePath('/api/third-party/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('您已经在旧的系统做了第三方验证，成功表明身份了，启用本系统账户，即将跳转到首页');
        setResult(data.data);
        // 2秒后自动跳转到首页
        setTimeout(() => {
          window.location.href = withBasePath("/");
        }, 5000);
      } else {
        setError(data.error || '登录失败');
        toast.error(data.error || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '登录请求失败');
      toast.error('登录请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到第三方系统
  const jumpToThirdParty = () => {
    // 第三方系统地址
    const thirdPartyUrl = 'https://36.212.134.165:10443';
    window.open(thirdPartyUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-lg font-semibold text-gray-900">第三方系统登录</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = withBasePath("/")}
              className="text-blue-600 hover:text-blue-700"
            >
              <Home className="w-4 h-4 mr-1" />
              返回首页
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">请在旧系统账户登录以表明您的身份</h1>
          <p className="text-sm text-gray-500 mt-2">
            使用 SM2 国密算法加密登录
          </p>
        </div>

        {/* 登录表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              安全登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">旧系统账户</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">旧系统密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 登录结果 */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 text-base">登录成功</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">             
              <Button
                variant="outline"
                className="w-full"
                onClick={jumpToThirdParty}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                跳转到旧的平台
              </Button>
              {result.userInfo && (
                <div className="mt-4 p-3 bg-white rounded border text-xs">
                  <pre className="overflow-auto">
                    成功获取用户信息，并启用账户
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 说明 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">加密说明</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 使用 SM2 国密算法加密密码</li>
              <li>• 密钥长度: 256 位椭圆曲线</li>
            </ul>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
