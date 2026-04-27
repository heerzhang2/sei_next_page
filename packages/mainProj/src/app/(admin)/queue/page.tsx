'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Trash2, RefreshCw, Plus, Database, FileText, Activity, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

const QUEUES = [
  { id: 'data-migration', name: '数据迁移', icon: Database },
  { id: 'report-generation', name: '报表生成', icon: FileText },
  { id: 'batch-operation', name: '批量操作', icon: Activity },
  { id: 'scheduled-task', name: '定时任务', icon: Clock },
];

export default function QueuePage() {
  const [stats, setStats] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(false);

  const getApiBasePath = () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return basePath ? `${basePath}/api` : '/api';
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBasePath()}/queue?action=stats`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const i = setInterval(fetchStats, 5000);
    return () => clearInterval(i);
  }, [fetchStats]);

  const action = async (queue: string, act: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBasePath()}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, queueName: queue }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchStats();
      } else toast.error(data.error);
    } catch {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const submitJob = async () => {
    try {
      const res = await fetch(`${getApiBasePath()}/queue/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue: 'data-migration',
          jobType: 'division-migration',
          priority: 'high',
          data: { unitId: '2738188573441261569' },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`任务已提交: ${data.data.jobId}`);
        fetchStats();
      }
    } catch {
      toast.error('提交失败');
    }
  };

  // 部门配置数据（与 division-data.ts 保持一致）
  const DIVISION_LIST = [
    { id: '1', name: '机电设备检验中心' },
    { id: '2', name: '福州检验二部' },
    { id: '3', name: '福州检验三部' },
    { id: '4', name: '电站锅炉检验中心' },
    { id: '5', name: '福州检验一部' },
    { id: '8', name: '厂车检测中心' },
    { id: '9', name: '节能中心' },
    { id: '10', name: '宁德分院' },
    { id: '11', name: '南平分院' },
    { id: '12', name: '三明分院' },
    { id: '13', name: '龙岩分院' },
    { id: '14', name: '漳州分院' },
    { id: '15', name: '泉州分院' },
    { id: '16', name: '莆田分院' },
    { id: '18', name: '纪律检查室' },
    { id: '20', name: '党办' },
    { id: '21', name: '考试评审部' },
    { id: '22', name: '技术质量管理部' },
    { id: '40', name: '办公室' },
    { id: '41', name: '人力资源部' },
    { id: '42', name: '财务部' },
    { id: '52', name: '业务管理与发展部' },
    { id: '55', name: '高新技术研究所' },
    { id: '62', name: '容器管道检验中心' },
    { id: '63', name: '石化设备检验中心' },
    { id: '64', name: '国家阀门中心' },
    { id: '65', name: '数智中心' },
    { id: '67', name: '科研管理部' },
    { id: '122', name: '院领导' },
    { id: '165', name: '技术检查中心' },
    { id: '262', name: '国家工锅中心' },
    { id: '264', name: '国家机器人中心' },
    { id: '709', name: '新技术开发中心' },
    { id: '1006', name: '古雷检验中心' },
    { id: '3824', name: '市场部' },
  ];

  const submitUserSyncJob = async () => {
    // 询问是否使用环境变量自动登录
    const useEnvAuth = confirm(
      `将为 ${DIVISION_LIST.length} 个部门创建批量用户同步任务。\n\n` +
      `使用环境变量中的凭证自动登录第三方系统？\n\n` +
      `点击"确定"：使用服务器端配置的凭证（推荐）\n` +
      `点击"取消"：手动输入 accessToken`
    );

    let accessToken: string | undefined;

    if (!useEnvAuth) {
      // 从 Cookie 获取 accessToken
      const cookies = document.cookie.split(';');
      const adminToken = cookies.find(c => c.trim().startsWith('Admin-Token='));
      accessToken = adminToken ? adminToken.split('=')[1] : undefined;

      if (!accessToken) {
        // 提示用户手动输入
        const manualToken = prompt('请输入 Admin-Token:');
        if (!manualToken) {
          toast.error('未提供 accessToken');
          return;
        }
        accessToken = manualToken;
      }
    }

    setLoading(true);

    try {
      // 创建一个批量任务，包含所有部门
      const res = await fetch(`${getApiBasePath()}/queue/user-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisions: DIVISION_LIST,  // 传递所有部门列表
          ...(accessToken && { accessToken }),
          unitId: '2738188573441261569',
          priority: 3,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`批量用户同步任务已提交: ${data.data.jobId}，将处理 ${DIVISION_LIST.length} 个部门`);
        fetchStats();
      } else {
        toast.error(data.error || '提交失败');
      }
    } catch (e) {
      toast.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const totalActive = Object.values(stats).reduce((a, s) => a + (s?.active || 0), 0);
  const totalFailed = Object.values(stats).reduce((a, s) => a + (s?.failed || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">任务队列管理</h1>
        <div className="flex gap-2">
          <Button onClick={submitJob} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />新建部门迁移
          </Button>
          <Button onClick={submitUserSyncJob} disabled={loading} variant="outline">
            <Users className="w-4 h-4 mr-2" />同步部门用户
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalActive}</div>
            <div className="text-sm text-gray-500">执行中任务</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-gray-500">失败任务</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(stats).reduce((a, s) => a + (s?.completed || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">已完成</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(stats).reduce((a, s) => a + (s?.waiting || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">等待中</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUEUES.map((q) => {
          const s = stats[q.id] || { waiting: 0, active: 0, completed: 0, failed: 0, total: 0 };
          const Icon = q.icon;
          return (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <CardTitle className="text-lg">{q.name}</CardTitle>
                  </div>
                  <Badge variant={s.active > 0 ? 'default' : 'secondary'}>
                    {s.active > 0 ? '运行中' : '空闲'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                  <div className="bg-yellow-50 rounded p-2">
                    <div className="text-xl font-bold text-yellow-600">{s.waiting}</div>
                    <div className="text-xs text-gray-500">等待</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xl font-bold text-blue-600">{s.active}</div>
                    <div className="text-xs text-gray-500">执行</div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-xl font-bold text-green-600">{s.completed}</div>
                    <div className="text-xs text-gray-500">完成</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-xl font-bold text-red-600">{s.failed}</div>
                    <div className="text-xs text-gray-500">失败</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => action(q.id, 'pause')} disabled={loading}>
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => action(q.id, 'resume')} disabled={loading}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => action(q.id, 'clean')} disabled={loading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={fetchStats}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
