'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { gql, useClient } from '@urql/next';
import {
  Play, StopCircle, RefreshCw, Database, Building2, User,
  ShieldCheck, Wrench, Pipette, Loader2, AlertTriangle, CheckCircle2,
  Wrench as WrenchIcon
} from 'lucide-react';

// ==================== GraphQL ====================

const StartEsIndexMutation = gql`
  mutation StartEsIndex($entityName: String!) {
    startEsIndex(entityName: $entityName) {
      running entityName progress beginTime completeTime message
    }
  }
`;

const GetEsIndexStatusMutation = gql`
  mutation GetEsIndexStatus {
    getEsIndexStatus {
      running entityName progress beginTime completeTime message
    }
  }
`;

const CancelEsIndexMutation = gql`
  mutation CancelEsIndex {
    cancelEsIndex
  }
`;

// ==================== 类型 ====================

interface EsIndexTask {
  running: boolean;
  entityName: string | null;
  progress: number;
  beginTime: string | null;
  completeTime: string | null;
  message: string | null;
}

interface EntityOption {
  id: string;
  name: string;
  icon: typeof Database;
  description: string;
}

const ENTITY_OPTIONS: EntityOption[] = [
  { id: 'Company', name: '企业单位', icon: Building2, description: 'company-read 索引' },
  { id: 'Person', name: '个人用户', icon: User, description: 'person-read 索引' },
  { id: 'Isp', name: '检验记录', icon: ShieldCheck, description: 'isp-read 索引' },
  { id: 'Eqp', name: '设备台账', icon: Wrench, description: 'eqp-read 索引（含全部子类）' },
  { id: 'PipingUnit', name: '管道单元', icon: Pipette, description: 'pipingunit-read 索引' },
];

// ==================== Tab: ES 索引同步 ====================

function EsIndexTab() {
  const client = useClient();

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [task, setTask] = useState<EsIndexTask | null>(null);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleEntity = useCallback((id: string) => {
    setSelectedEntities((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await client.mutation(GetEsIndexStatusMutation, {}).toPromise();
      const data = result.data?.getEsIndexStatus as EsIndexTask | undefined;
      if (data) {
        setTask(data);
        if (!data.running) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          if (data.message === '已完成') {
            toast.success('ES 索引重建已完成');
          }
        }
      }
    } catch { /* 静默 */ }
  }, [client]);

  const handleStart = useCallback(async () => {
    if (selectedEntities.length === 0) {
      toast.error('请至少选择一个实体类型');
      return;
    }
    const entityName = selectedEntities.join(',');
    setStarting(true);
    try {
      const result = await client.mutation(StartEsIndexMutation, { entityName }).toPromise();
      const data = result.data?.startEsIndex as EsIndexTask | undefined;
      if (data) {
        setTask(data);
        if (data.running) {
          toast.success(data.message || '索引重建已调度');
          if (pollingRef.current) clearInterval(pollingRef.current);
          fetchStatus();
          pollingRef.current = setInterval(fetchStatus, 3000);
        } else {
          toast.error(data.message || '启动失败');
        }
      }
    } catch (e: any) {
      toast.error('启动失败: ' + (e.message || '未知错误'));
    } finally {
      setStarting(false);
    }
  }, [client, selectedEntities, fetchStatus]);

  const handleCancel = useCallback(async () => {
    setCancelling(true);
    try {
      await client.mutation(CancelEsIndexMutation, {}).toPromise();
      toast.success('已取消');
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setTask(null);
    } catch (e: any) {
      toast.error('取消失败: ' + (e.message || '未知错误'));
    } finally {
      setCancelling(false);
    }
  }, [client]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const isRunning = task?.running ?? false;
  const progressPercent = task ? Math.round((task.progress || 0) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">ES 索引同步</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            从数据库重建 Elasticsearch 搜索索引
          </p>
        </div>
        <Badge variant={isRunning ? 'default' : 'secondary'} className="text-sm px-3 py-1">
          {isRunning ? '运行中' : '空闲'}
        </Badge>
      </div>

      {/* 实体选择 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">选择要同步的实体表</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ENTITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const checked = selectedEntities.includes(opt.id);
              return (
                <label key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}
                    ${isRunning ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleEntity(opt.id)} disabled={isRunning} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{opt.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setSelectedEntities(['Company', 'Person'])} disabled={isRunning}>
              单位索引（Company+Person）
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedEntities(ENTITY_OPTIONS.map(e => e.id))} disabled={isRunning}>
              全部重建
            </Button>
            {selectedEntities.length > 0 && !isRunning && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntities([])}>清除选择</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 操作区 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">同步操作</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleStart} disabled={isRunning || starting || selectedEntities.length === 0}>
                {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {starting ? '调度中...' : '启动同步'}
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={!isRunning || cancelling}>
                {cancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <StopCircle className="w-4 h-4 mr-2" />}
                {cancelling ? '取消中...' : '取消同步'}
              </Button>
              <Button variant="outline" onClick={fetchStatus} disabled={!isRunning}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {task ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{task.entityName || '-'}</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">状态</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isRunning ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /><span className="text-blue-600">同步中</span></>
                    ) : task.message === '已完成' ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">已完成</span></>
                    ) : (
                      <><AlertTriangle className="w-3.5 h-3.5 text-yellow-500" /><span className="text-yellow-600">{task.message || '未知'}</span></>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">开始时间</span>
                  <div className="mt-0.5 font-mono text-xs">{task.beginTime ? new Date(task.beginTime).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">完成时间</span>
                  <div className="mt-0.5 font-mono text-xs">{task.completeTime ? new Date(task.completeTime).toLocaleString() : '-'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">消息</span>
                  <div className="mt-0.5">{task.message || '-'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无进行中的索引同步任务</p>
              <p className="text-xs mt-1">选择上方实体后点击「启动同步」</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 说明 */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">说明</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>ES 索引同步使用 Hibernate Search 从数据库读取数据并重建 Elasticsearch 搜索索引。</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Company+Person</strong>：单位搜索组件的数据源，推荐经常同步</li>
            <li><strong>Eqp</strong>：设备台账搜索，包含全部子类（电梯、锅炉等）</li>
            <li><strong>Isp</strong>：检验记录搜索</li>
            <li><strong>PipingUnit</strong>：管道单元搜索</li>
            <li>同步期间不影响前端查询（<code>purgeAllOnStart=false</code>）</li>
            <li>多选时用逗号分隔一并提交，Hibernate Search 内部串行处理</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Tab 占位 ====================

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <WrenchIcon className="w-12 h-12 mb-4 opacity-30" />
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}

// ==================== 主页面 ====================

export default function MaintenancePage() {
  return (
    <div className="p-6 max-w-4xl">
      <Tabs defaultValue="es-index">
        <TabsList>
          <TabsTrigger value="es-index">ES 同步</TabsTrigger>
          <TabsTrigger value="placeholder1" disabled>待扩展</TabsTrigger>
          <TabsTrigger value="placeholder2" disabled>待扩展</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="es-index">
            <EsIndexTab />
          </TabsContent>
          <TabsContent value="placeholder1">
            <PlaceholderTab title="功能开发中" description="更多维护功能即将上线" />
          </TabsContent>
          <TabsContent value="placeholder2">
            <PlaceholderTab title="功能开发中" description="更多维护功能即将上线" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
