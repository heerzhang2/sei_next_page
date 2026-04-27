'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Send
} from 'lucide-react';
import { useNotifications } from '@/contexts/notification-context';
import { toast } from 'sonner';

export default function NotificationDemoPage() {
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    addNotification,
    markAllAsRead,
    clearAll,
    connect,
    disconnect,
    reconnect,
    requestNotificationPermission,
  } = useNotifications();

  const [testTitle, setTestTitle] = useState('测试通知');
  const [testMessage, setTestMessage] = useState('这是一条测试通知消息');
  const [processKey, setProcessKey] = useState('demo-process-123');

  // 发送测试通知
  const sendTestNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    addNotification({
      type,
      title: testTitle,
      message: testMessage,
      processInstanceKey: processKey,
    });
    toast.success('测试通知已发送');
  };

  // 模拟进度通知
  const simulateProgress = async () => {
    const total = 10;
    const key = `progress-demo-${Date.now()}`;
    
    // 先连接 SSE
    connect(key);
    
    for (let i = 1; i <= total; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 发送进度通知
      addNotification({
        type: 'info',
        title: '进度更新',
        message: `正在处理... ${i}/${total} (${i * 10}%)`,
        processInstanceKey: key,
        data: {
          progress: {
            current: i,
            total,
            percentage: i * 10,
          },
        },
      });
    }
    
    // 完成通知
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: '处理完成',
        message: `成功处理 ${total} 个项目`,
        processInstanceKey: key,
        data: {
          result: {
            success: total,
            failed: 0,
            total,
          },
        },
      });
    }, 600);
  };

  // 请求桌面通知权限
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('已获取桌面通知权限');
    } else {
      toast.error('未获得桌面通知权限，请在浏览器设置中允许');
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><Wifi className="w-3 h-3 mr-1" />已连接</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800"><Wifi className="w-3 h-3 mr-1 animate-pulse" />连接中</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><WifiOff className="w-3 h-3 mr-1" />连接失败</Badge>;
      default:
        return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />未连接</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">通知系统演示</h1>
          <p className="text-muted-foreground mt-1">
            测试全局 EventSource 通知系统的各项功能
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} 未读</Badge>
          )}
        </div>
      </div>

      {/* 连接控制 */}
      <Card>
        <CardHeader>
          <CardTitle>连接控制</CardTitle>
          <CardDescription>管理 SSE 连接状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => connect('demo-connection')}
              disabled={connectionStatus === 'connected'}
            >
              <Wifi className="w-4 h-4 mr-2" />
              连接 SSE
            </Button>
            <Button 
              variant="outline" 
              onClick={disconnect}
              disabled={connectionStatus === 'disconnected'}
            >
              <WifiOff className="w-4 h-4 mr-2" />
              断开连接
            </Button>
            <Button 
              variant="outline" 
              onClick={reconnect}
              disabled={connectionStatus === 'connected'}
            >
              <Wifi className="w-4 h-4 mr-2" />
              重新连接
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            当前状态: <span className="font-medium">{connectionStatus}</span>
            {isConnected && ' - 可以接收实时通知'}
          </div>
        </CardContent>
      </Card>

      {/* 桌面通知权限 */}
      <Card>
        <CardHeader>
          <CardTitle>桌面通知权限</CardTitle>
          <CardDescription>允许浏览器在后台显示通知</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRequestPermission}>
            <Bell className="w-4 h-4 mr-2" />
            请求桌面通知权限
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            获取权限后，即使页面在后台也能收到通知提醒
          </p>
        </CardContent>
      </Card>

      {/* 发送测试通知 */}
      <Card>
        <CardHeader>
          <CardTitle>发送测试通知</CardTitle>
          <CardDescription>测试不同类型的通知消息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>通知标题</Label>
              <Input 
                value={testTitle} 
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="输入通知标题"
              />
            </div>
            <div className="space-y-2">
              <Label>通知内容</Label>
              <Input 
                value={testMessage} 
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="输入通知内容"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => sendTestNotification('info')}>
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              发送信息通知
            </Button>
            <Button variant="outline" onClick={() => sendTestNotification('success')}>
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              发送成功通知
            </Button>
            <Button variant="outline" onClick={() => sendTestNotification('warning')}>
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              发送警告通知
            </Button>
            <Button variant="outline" onClick={() => sendTestNotification('error')}>
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              发送错误通知
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={simulateProgress} className="w-full md:w-auto">
              <Send className="w-4 h-4 mr-2" />
              模拟进度通知序列
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              模拟一个完整的任务处理过程，包含进度更新和完成通知
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 通知列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>通知历史</CardTitle>
            <CardDescription>共 {notifications.length} 条通知</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              全部已读
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              清空全部
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>暂无通知</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />}
                    {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                    {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.data?.progress && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${notification.data.progress.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.data.progress.current} / {notification.data.progress.total}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                        {notification.processInstanceKey && ` · ${notification.processInstanceKey}`}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">未读</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. 全局通知：</strong>通知系统通过 Context 在全局维护，无论您在哪个页面都能接收通知。</p>
          <p><strong>2. 桌面通知：</strong>获取权限后，即使浏览器在后台也能收到重要通知。</p>
          <p><strong>3. 实时连接：</strong>SSE 连接保持实时通信，支持自动重连。</p>
          <p><strong>4. 通知铃铛：</strong>页面右上角的通知铃铛显示未读数量，点击可查看历史通知。</p>
          <p><strong>5. 进度跟踪：</strong>支持带进度条的通知，适用于长时间运行的任务。</p>
        </CardContent>
      </Card>
    </div>
  );
}
