'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Database,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import type { MigrationTask, MigrationProgress, MigrationConfig } from '@/lib/migration/types';

interface TaskWithProgress extends MigrationTask {
  progress?: MigrationProgress;
}

export default function MigrationPage() {
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 创建表单状态
  const [formData, setFormData] = useState({
    name: '',
    sourceUrl: '',
    targetTable: '',
    batchSize: 100,
    fieldMapping: '[\n  {\n    "sourceField": "id",\n    "targetField": "external_id",\n    "dataType": "string",\n    "required": true\n  },\n  {\n    "sourceField": "name",\n    "targetField": "name",\n    "dataType": "string"\n  }\n]',
  });

  // 获取所有任务
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/migration');
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchTasks();
    // 每 5 秒刷新一次
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  // 创建任务
  const handleCreateTask = async () => {
    if (!formData.name || !formData.sourceUrl || !formData.targetTable) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      
      let fieldMapping;
      try {
        fieldMapping = JSON.parse(formData.fieldMapping);
      } catch {
        toast.error('字段映射 JSON 格式错误');
        return;
      }

      const config: MigrationConfig = {
        sourceType: 'api',
        sourceUrl: formData.sourceUrl,
        targetTable: formData.targetTable,
        fieldMapping,
        batchSize: formData.batchSize,
      };

      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, config }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('迁移任务创建成功');
        setShowCreateForm(false);
        setFormData({
          name: '',
          sourceUrl: '',
          targetTable: '',
          batchSize: 100,
          fieldMapping: formData.fieldMapping,
        });
        fetchTasks();
      } else {
        toast.error(result.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建任务时发生错误');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 启动任务
  const handleStartTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/migration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action: 'start' }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('迁移任务已启动');
        fetchTasks();
      } else {
        toast.error(result.error || '启动失败');
      }
    } catch (error) {
      toast.error('启动任务时发生错误');
      console.error(error);
    }
  };

  // 取消任务
  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/migration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action: 'cancel' }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('迁移任务已取消');
        fetchTasks();
      } else {
        toast.error(result.error || '取消失败');
      }
    } catch (error) {
      toast.error('取消任务时发生错误');
      console.error(error);
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;

    try {
      const response = await fetch(`/api/migration?taskId=${taskId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('迁移任务已删除');
        fetchTasks();
      } else {
        toast.error(result.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除任务时发生错误');
      console.error(error);
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: MigrationTask['status']) => {
    const configs = {
      pending: { variant: 'secondary' as const, icon: Clock, label: '待执行' },
      running: { variant: 'default' as const, icon: RefreshCw, label: '执行中' },
      completed: { variant: 'default' as const, icon: CheckCircle2, label: '已完成' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: '失败' },
      cancelled: { variant: 'outline' as const, icon: AlertCircle, label: '已取消' },
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            数据迁移管理
          </h1>
          <p className="text-muted-foreground mt-1">
            从外部 API 导入数据到 TiDB 数据库
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建迁移任务
        </Button>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">任务列表</TabsTrigger>
          <TabsTrigger value="help">使用帮助</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>创建新迁移任务</CardTitle>
                <CardDescription>配置数据源和目标表信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">任务名称 *</Label>
                    <Input
                      id="name"
                      placeholder="例如：用户数据迁移"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetTable">目标表名 *</Label>
                    <Input
                      id="targetTable"
                      placeholder="例如：migrated_users"
                      value={formData.targetTable}
                      onChange={(e) => setFormData({ ...formData, targetTable: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">数据源 URL *</Label>
                  <Input
                    id="sourceUrl"
                    placeholder="https://api.example.com/data"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">批处理大小</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={formData.batchSize}
                    onChange={(e) => setFormData({ ...formData, batchSize: parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldMapping">字段映射 (JSON) *</Label>
                  <textarea
                    id="fieldMapping"
                    className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background font-mono text-sm"
                    value={formData.fieldMapping}
                    onChange={(e) => setFormData({ ...formData, fieldMapping: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    配置源字段到目标字段的映射关系，支持嵌套路径如 &quot;user.name&quot;
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateTask} disabled={loading}>
                    {loading ? '创建中...' : '创建任务'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>迁移任务列表</CardTitle>
              <CardDescription>共 {tasks.length} 个任务</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>任务名称</TableHead>
                    <TableHead>目标表</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>记录数</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        暂无迁移任务，点击上方按钮创建
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {task.targetTable}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell className="w-48">
                          {task.status === 'running' && (
                            <div className="space-y-1">
                              <Progress 
                                value={task.progress?.percentage || 0} 
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                {task.progress?.percentage || 0}% 
                                ({task.processedRecords}/{task.totalRecords})
                              </p>
                            </div>
                          )}
                          {task.status === 'completed' && (
                            <span className="text-xs text-green-600">
                              ✓ {task.processedRecords} 条成功
                              {task.failedRecords > 0 && `, ${task.failedRecords} 条失败`}
                            </span>
                          )}
                          {task.status === 'failed' && (
                            <span className="text-xs text-red-600" title={task.errorMessage}>
                              ✗ {task.errorMessage?.substring(0, 20)}...
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>总计: {task.totalRecords}</div>
                            <div className="text-green-600">成功: {task.processedRecords}</div>
                            {task.failedRecords > 0 && (
                              <div className="text-red-600">失败: {task.failedRecords}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(task.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartTask(task.id)}
                                title="启动"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {task.status === 'running' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelTask(task.id)}
                                title="取消"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTask(task.id)}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. 配置数据源</h3>
                <p className="text-sm text-muted-foreground">
                  输入外部 API 的 URL，系统会自动获取数据。支持常见的响应格式（数组、data/list/items 包装）。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. 字段映射</h3>
                <p className="text-sm text-muted-foreground">
                  使用 JSON 格式配置源字段到目标字段的映射。支持嵌套路径（如 user.name）。
                  支持的数据类型：string、number、boolean、date、json。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. 自动建表</h3>
                <p className="text-sm text-muted-foreground">
                  如果目标表不存在，系统会根据字段映射自动创建表结构。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. 批处理</h3>
                <p className="text-sm text-muted-foreground">
                  数据分批插入，默认每批 100 条。可根据数据量调整批处理大小。
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">字段映射示例</h4>
                <pre className="text-xs overflow-x-auto">
{`[
  {
    "sourceField": "id",
    "targetField": "external_id",
    "dataType": "string",
    "required": true
  },
  {
    "sourceField": "user.name",
    "targetField": "username",
    "dataType": "string"
  },
  {
    "sourceField": "created_at",
    "targetField": "create_time",
    "dataType": "date"
  }
]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
