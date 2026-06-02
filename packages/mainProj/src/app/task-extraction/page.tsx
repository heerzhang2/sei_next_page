'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  RefreshCw, 
  Download, 
  Play,
  Calendar,
  Bell,
  Users,
  ListTodo,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/notification-context';
import { useTrackedProcesses } from '@/hooks/use-tracked-processes';
import Link from 'next/link';
import { gql, useQuery } from '@urql/next';

interface Task {
  id: string;
  taskName: string;
  taskNo: string;
  taskDate: string;
  taskSta: string;
  taskStaName: string;
  taskAlloStaName: string;
  busiType: string;
  busiTypeName: string;
  opeTypeName: string;
  repTypeName: string;
  deptName: string;
  useUntName: string;
  mantOrBuildUntName: string;
  buildName: string;
  eqpAreaName: string;
  createBy: string;
  createTime: string;
  remark?: string;
  // 子任务统计
  taskCount: number;
  taskIds: string[];
}

interface ExtractionJob {
  processInstanceKey: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: { current: number; total: number; percentage: number };
  result?: any;
}

interface Office {
  id: string;
  name: string;
  users: User[];
}

interface User {
  id: string;
  username: string;
  authName: string | null;
  personName: string | null;
  personId: string;
}

interface Division {
  id: string;
  name: string;
  offices: Office[];
  staff: User[];
}

// 获取当前用户基本信息的 GraphQL 查询（轻量级）
const CurrentUserQuery = gql`
  query CurrentUserQuery {
    authUser {
      id
      username
      authName
      person {
        id
        name
      }
      dep {
        id
        name
      }
      office {
        id
        name
      }
      unit {
        id
        name
        dvs {
          id
          name
        }
      }
    }
  }
`;

// 获取科室列表的 GraphQL 查询
const DivisionOfficesQuery = gql`
  query DivisionOfficesQuery($divisionId: ID!) {
    division(id: $divisionId) {
      id
      name
      offices {
        id
        name
      }
      staff {
        id
        username
        authName
        person {
          id
          name
        }
      }
    }
  }
`;

// 获取科室人员的 GraphQL 查询
const OfficeStaffQuery = gql`
  query OfficeStaffQuery($officeId: ID!) {
    office(id: $officeId) {
      id
      name
      staff {
        id
        username
        authName
        person {
          id
          name
        }
      }
    }
  }
`;

export default function TaskExtractionPage() {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [offices, setOffices] = useState<Office[]>([]);
  const [noOfficeUsers, setNoOfficeUsers] = useState<User[]>([]);
  const [officeUsers, setOfficeUsers] = useState<User[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [loadingOfficeUsers, setLoadingOfficeUsers] = useState(false);
  const [taskDateStart, setTaskDateStart] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [taskDateEnd, setTaskDateEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  // 过滤条件状态
  const [filterTaskSta, setFilterTaskSta] = useState<string[]>([]);
  const [filterBusiType, setFilterBusiType] = useState<string>('');
  const [filterTaskAlloSta, setFilterTaskAlloSta] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  // 使用 Map 存储选中的任务，key 为任务显示ID，value 为子任务ID数组
  const [selectedTasks, setSelectedTasks] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(false);
  // 分页状态
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState<ExtractionJob | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // 使用全局通知系统 - 只使用需要的方法，SSE 连接由 NotificationProvider 自动管理
  const { requestNotificationPermission } = useNotifications();
  
  // 使用流程跟踪
  const { addProcess, runningCount } = useTrackedProcesses();

  // 获取当前用户基本信息（轻量级）
  const [userResult] = useQuery({
    query: CurrentUserQuery,
  });

  const currentUser = userResult.data?.authUser;

  // 构建部门列表（仅从 unit.dvs 获取基本信息）
  const divisions = useMemo<Division[]>(() => {
    if (!currentUser?.unit?.dvs) return [];
    return currentUser.unit.dvs.map((dv: any) => ({
      id: dv.id,
      name: dv.name,
      offices: [],
      staff: [],
    }));
  }, [currentUser]);

  // 页面初始化：设置默认部门
  useEffect(() => {
    if (!currentUser || divisions.length === 0) return;
    if (selectedDept) return; // 只初始化一次

    const userDepId = currentUser.dep?.id;
    if (userDepId) {
      const divisionExists = divisions.find(d => d.id === userDepId);
      if (divisionExists) {
        setSelectedDept(userDepId);
      }
    }
  }, [currentUser, divisions, selectedDept]);

  // 当部门改变时，动态查询科室列表
  useEffect(() => {
    if (!selectedDept) {
      setOffices([]);
      setNoOfficeUsers([]);
      setSelectedOffice('');
      setSelectedUser('');
      return;
    }

    const fetchDivisionData = async () => {
      setLoadingOffices(true);
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query DivisionOffices($divisionId: ID!) {
                division(id: $divisionId) {
                  id
                  name
                  offices {
                    id
                    name
                  }
                  staff {
                    id
                    username
                    authName
                    person {
                      id
                      name
                    }
                  }
                }
              }
            `,
            variables: { divisionId: selectedDept },
          }),
        });
        const result = await response.json();
        
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          toast.error('获取科室列表失败: ' + result.errors[0]?.message);
          return;
        }
        
        if (result.data?.division) {
          const division = result.data.division;
          setOffices((division.offices || []).map((o: any) => ({
            id: o.id,
            name: o.name,
            users: [],
          })));
          setNoOfficeUsers((division.staff || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            authName: u.authName,
            personName: u.person?.name,
            personId: u.person?.id,
          })));

          // 如果是当前用户的部门，尝试设置默认科室
          if (currentUser?.dep?.id === selectedDept && currentUser?.office?.id) {
            const userOffice = division.offices?.find((o: any) => o.id === currentUser.office.id);
            if (userOffice) {
              setSelectedOffice(currentUser.office.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch division offices:', error);
        toast.error('获取科室列表失败');
      } finally {
        setLoadingOffices(false);
      }
    };

    fetchDivisionData();
  }, [selectedDept, currentUser]);

  // 当科室改变时，动态查询科室人员
  useEffect(() => {
    if (!selectedOffice || selectedOffice === 'none') {
      setOfficeUsers([]);
      setSelectedUser('');
      return;
    }

    const fetchOfficeStaff = async () => {
      setLoadingOfficeUsers(true);
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query OfficeStaff($officeId: ID!) {
                office(id: $officeId) {
                  id
                  name
                  staff {
                    id
                    username
                    authName
                    person {
                      id
                      name
                    }
                  }
                }
              }
            `,
            variables: { officeId: selectedOffice },
          }),
        });
        const result = await response.json();
        
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          toast.error('获取人员列表失败: ' + result.errors[0]?.message);
          return;
        }
        
        if (result.data?.office) {
          const users = (result.data.office.staff || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            authName: u.authName,
            personName: u.person?.name,
            personId: u.person?.id,
          }));
          setOfficeUsers(users);

          // 如果是当前用户的科室，尝试设置默认人员为当前用户
          if (currentUser?.office?.id === selectedOffice) {
            const currentUserInList = users.find(
              (u: User) => u.id === currentUser.id || u.authName === currentUser.authName
            );
            if (currentUserInList) {
              setSelectedUser(currentUserInList.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch office staff:', error);
        toast.error('获取人员列表失败');
      } finally {
        setLoadingOfficeUsers(false);
      }
    };

    fetchOfficeStaff();
  }, [selectedOffice, currentUser]);

  const getApiBasePath = () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    return basePath ? `${basePath}/api` : '/api';
  };

  // 获取当前选中科室的所有人员
  const getCurrentOfficeUsers = (): User[] => {
    if (selectedOffice === 'none') {
      return noOfficeUsers;
    }
    return officeUsers;
  };

  // 获取选中的项目负责人信息
  const getSelectedProjectLeader = () => {
    if (selectedOffice === 'none') {
      return noOfficeUsers.find(u => u.id === selectedUser);
    }
    return officeUsers.find(u => u.id === selectedUser);
  };

  // 获取任务列表
  const fetchTasks = useCallback(async (targetPage: number = 1) => {
    if (!selectedDept) {
      toast.error('请先选择部门');
      return;
    }

    setLoading(true);
    try {
      const projectLeader = getSelectedProjectLeader();
      let url = `${getApiBasePath()}/task-extraction/old-tasks?`;
      if (projectLeader) {
        url += `projUserIds=${encodeURIComponent(projectLeader.authName || projectLeader.id)}&`;
      }
      url += `taskDateStart=${taskDateStart}` +
        `&taskDateEnd=${taskDateEnd}` +
        `&pageNum=${targetPage}` +
        `&pageSize=${pageSize}`;
      
      // 添加过滤条件
      if (filterTaskSta.length > 0) {
        url += `&taskSta=${encodeURIComponent(filterTaskSta.join(','))}`;
      }
      if (filterBusiType && filterBusiType !== 'all') {
        url += `&busiType=${encodeURIComponent(filterBusiType)}`;
      }
      if (filterTaskAlloSta && filterTaskAlloSta !== '') {
        url += `&taskAlloSta=${encodeURIComponent(filterTaskAlloSta)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setTasks(data.data.tasks);
        setTotal(data.data.total);
        setPageNum(data.data.pageNum);
        setSelectedTasks(new Map()); // 清空选择
        toast.success(`获取到 ${data.data.total} 个任务分组，当前第 ${data.data.pageNum} 页`);
      } else {
        toast.error(data.error || '获取任务列表失败');
      }
    } catch (error) {
      toast.error('获取任务列表失败');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, selectedUser, selectedOffice, noOfficeUsers, officeUsers, taskDateStart, taskDateEnd, pageSize, filterTaskSta, filterBusiType, filterTaskAlloSta]);

  // 翻页控制
  const handlePrevPage = () => {
    if (pageNum > 1) {
      fetchTasks(pageNum - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNum * pageSize < total) {
      fetchTasks(pageNum + 1);
    }
  };

  // 提交任务提取
  const submitExtraction = async () => {
    if (selectedTasks.size === 0) {
      toast.error('请至少选择一个任务');
      return;
    }

    if (!selectedDept) {
      toast.error('请先选择部门');
      return;
    }

    setSubmitting(true);
    setExtractionProgress(0);
    
    try {
      const deptName = divisions.find((d: Division) => d.id === selectedDept)?.name || selectedDept;
      
      // 构建任务分组数据，保持分组关系
      // selectedTasks 是 Map<groupId, taskIds[]>
      const taskGroups: { groupId: string; taskIds: string[] }[] = [];
      selectedTasks.forEach((taskIds, groupId) => {
        taskGroups.push({ groupId, taskIds });
      });
      
      const projectLeader = getSelectedProjectLeader();
      const body: Record<string, any> = {
        taskGroups,
        deptId: selectedDept,
        deptName,
        officeId: selectedOffice === 'none' ? null : selectedOffice,
      };
      if (projectLeader) {
        body.projUserIds = [projectLeader.authName || projectLeader.id];
      }
      const res = await fetch(`${getApiBasePath()}/task-extraction/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (data.success) {
        const job: ExtractionJob = {
          processInstanceKey: data.data.processInstanceKey,
          status: 'pending',
        };
        setCurrentJob(job);
        
        // 添加到流程跟踪列表
        const title = `任务提取 - ${selectedTasks.size}个分组`;
        addProcess(data.data.processInstanceKey, title);
        
        toast.success(`任务提取已提交，Job ID: ${data.data.jobId}`);
        
        // 注意：SSE 连接由全局 NotificationProvider 管理
        // 页面刷新或用户登录后会自动建立连接，不需要手动连接
        // 请求桌面通知权限（如果还没有）
        requestNotificationPermission();
      } else {
        toast.error(data.error || '提交失败');
      }
    } catch (error) {
      toast.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 切换任务选择
  const toggleTaskSelection = (task: Task) => {
    const newSelected = new Map(selectedTasks);
    if (newSelected.has(task.id)) {
      newSelected.delete(task.id);
    } else {
      // 存储任务显示ID和对应的子任务ID数组
      newSelected.set(task.id, task.taskIds || [task.id]);
    }
    setSelectedTasks(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Map());
    } else {
      const newSelected = new Map<string, string[]>();
      tasks.forEach(task => {
        newSelected.set(task.id, task.taskIds || [task.id]);
      });
      setSelectedTasks(newSelected);
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">等待中</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">处理中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">已完成</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">旧平台任务提取</h1>
        <div className="flex items-center gap-3">
          <Link href="/third-party-login">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              旧平台登录
            </Button>
          </Link>
          <Link href="/tracked-processes">
            <Button variant="outline" size="sm">
              <ListTodo className="w-4 h-4 mr-2" />
              流程跟踪
              {runningCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {runningCount}
                </Badge>
              )}
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span>通知将在全局显示，离开页面也能接收</span>
          </div>
        </div>
      </div>

      {/* 查询条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">查询条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* 部门选择 */}
            <div className="space-y-2">
              <Label>选择部门</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {divisions.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 科室选择 */}
            <div className="space-y-2">
              <Label>选择科室</Label>
              <Select 
                value={selectedOffice} 
                onValueChange={setSelectedOffice}
                disabled={!selectedDept || userResult.fetching}
              >
                <SelectTrigger>
                  <SelectValue placeholder={userResult.fetching ? '加载中...' : '请选择科室'} />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {offices.map(office => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                  {noOfficeUsers.length > 0 && (
                    <SelectItem value="none">无所属科室</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 项目负责人选择 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>项目负责人</Label>
                {selectedUser && (
                  <button onClick={() => setSelectedUser('')} className="text-gray-400 hover:text-red-500 transition-colors p-0.5" title="清除负责人">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Select 
                value={selectedUser} 
                onValueChange={setSelectedUser}
                disabled={!selectedOffice && noOfficeUsers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择负责人（可选）" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {getCurrentOfficeUsers().map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.personName || user.username}
                      {user.authName && <span className="text-muted-foreground ml-1">({user.authName})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedUser && (
                <p className="text-xs text-muted-foreground">不选择负责人将获取部门全部任务</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>任务日期开始</Label>
              <Input
                type="date"
                value={taskDateStart}
                onChange={(e) => setTaskDateStart(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>任务日期结束</Label>
              <Input
                type="date"
                value={taskDateEnd}
                onChange={(e) => setTaskDateEnd(e.target.value)}
              />
            </div>

            {/* 任务状态过滤（多选） */}
            <div className="space-y-2">
              <Label>任务状态（可多选）</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '0', label: '未派工' },
                  { value: '1', label: '已派工' },
                  { value: '2', label: '等待复检' },
                  { value: '3', label: '等待整改反馈' },
                  { value: '4', label: '已完成' },
                  { value: '5', label: '作废' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                      filterTaskSta.includes(option.value)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      value={option.value}
                      checked={filterTaskSta.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterTaskSta([...filterTaskSta, option.value]);
                        } else {
                          setFilterTaskSta(filterTaskSta.filter(v => v !== option.value));
                        }
                      }}
                    />
                    <span>{option.label}</span>
                    {filterTaskSta.includes(option.value) && (
                      <span className="ml-1.5 text-blue-600">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 业务类型过滤 */}
            <div className="space-y-2">
              <Label>业务类型</Label>
              <Select value={filterBusiType} onValueChange={setFilterBusiType}>
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="1">法定业务</SelectItem>
                  <SelectItem value="2">委托业务</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 任务分配状态过滤（单选） */}
            <div className="space-y-2">
              <Label>分配状态</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '', label: '全部' },
                  { value: '0', label: '部门分配' },
                  { value: '1', label: '科室分配' },
                  { value: '2', label: '责任人派工' },
                  { value: '3', label: '分配派工完成' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${
                      filterTaskAlloSta === option.value
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="taskAlloSta"
                      value={option.value}
                      checked={filterTaskAlloSta === option.value}
                      onChange={(e) => {
                        setFilterTaskAlloSta(e.target.value);
                      }}
                    />
                    <span>{option.label}</span>
                    {filterTaskAlloSta === option.value && (
                      <span className="ml-1.5 text-blue-600">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-end md:col-span-2">
              <Button 
                onClick={() => fetchTasks(1)} 
                disabled={loading || !selectedDept}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                获取任务列表
              </Button>
            </div>
          </div>

          {/* 当前选中信息 */}
          {getSelectedProjectLeader() && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm">
                项目负责人: <strong>{getSelectedProjectLeader()?.personName || getSelectedProjectLeader()?.username}</strong>
                {getSelectedProjectLeader()?.authName && (
                  <span className="text-muted-foreground ml-1">(第三方ID: {getSelectedProjectLeader()?.authName})</span>
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提取进度 - 仅在当前页面显示 */}
      {currentJob && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              提取进度
              {getStatusBadge(currentJob.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Job ID: {currentJob.processInstanceKey}</span>
              <span>
                {currentJob.progress ? 
                  `${currentJob.progress.current} / ${currentJob.progress.total}` : 
                  '准备中...'
                }
              </span>
            </div>
            <Progress value={extractionProgress} className="h-2" />
            <div className="text-sm text-gray-600">
              {currentJob.status === 'pending' && '等待 Camunda Worker 处理...'}
              {currentJob.status === 'processing' && `正在提取任务... ${extractionProgress}%`}
              {currentJob.status === 'completed' && '任务提取完成！'}
              {currentJob.status === 'failed' && '任务提取失败，请查看日志'}
            </div>
            <div className="text-xs text-muted-foreground">
              提示：您可以离开此页面，通过右上角的通知铃铛查看进度
            </div>
            
            {currentJob.result && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">提取结果</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {currentJob.result.results?.success || 0}
                    </div>
                    <div className="text-gray-600">成功</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {currentJob.result.results?.failed || 0}
                    </div>
                    <div className="text-gray-600">失败</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-600">
                      {currentJob.result.results?.total || 0}
                    </div>
                    <div className="text-gray-600">总计</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 任务列表 - 卡片布局 */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">
              任务列表 (共 {total} 个分组，当前 {tasks.length} 个)
              {selectedTasks.size > 0 && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  已选择 {selectedTasks.size} 个
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedTasks.size === tasks.length ? '取消全选' : '全选'}
              </Button>
              <Button 
                size="sm" 
                onClick={submitExtraction}
                disabled={submitting || selectedTasks.size === 0}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                提取选中任务 ({selectedTasks.size})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 卡片网格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                    selectedTasks.has(task.id) 
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-200' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                  onClick={() => toggleTaskSelection(task)}
                >
                  {/* 卡片头部 - 选择框和日期 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-muted-foreground">{task.taskDate}</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {task.taskCount} 个子任务
                    </Badge>
                  </div>
                  
                  {/* 状态行 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {task.taskAlloStaName}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${
                      task.taskStaName?.includes('完成') ? 'bg-green-50 text-green-700' :
                      task.taskStaName?.includes('进行') ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {task.taskStaName}
                    </Badge>
                    {task.reIsp === '1' && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                        复检
                      </Badge>
                    )}
                    {task.busiType === '2' && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                        委托
                      </Badge>
                    )}
                  </div>
                  
                  {/* 检验类型和报告类型 */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-900">{task.opeTypeName}</div>
                    <div className="text-xs text-muted-foreground">{task.repTypeName}</div>
                  </div>
                  
                  {/* 单位信息 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">使用单位:</span>
                      <span className="text-xs text-gray-700 line-clamp-2">{task.useUntName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">维保/施工:</span>
                      <span className="text-xs text-gray-700 line-clamp-2">{task.mantOrBuildUntName}</span>
                    </div>
                  </div>
                  
                  {/* 位置和楼盘 */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {task.buildName && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        {task.buildName}
                      </span>
                    )}
                    {task.eqpAreaName && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {task.eqpAreaName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 分页控制 */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t gap-4">
              <div className="text-sm text-muted-foreground">
                第 {pageNum} 页，共 {Math.ceil(total / pageSize)} 页，每页 {pageSize} 条，总计 {total} 条
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pageNum <= 1 || loading}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pageNum * pageSize >= total || loading}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && !loading && selectedDept && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无任务数据</p>
            <p className="text-sm mt-1">请调整查询条件后重新获取</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
