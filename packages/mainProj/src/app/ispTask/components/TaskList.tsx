"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronRight, FilePlus, RefreshCw, Edit2, Copy, Check, X } from "lucide-react";
import { businessCatspMap } from "@/common/sei";
import { withBasePath } from "@/lib/tool";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gql, useMutation } from "@urql/next";
import { toast } from "sonner";
import { getReportModelTypes, getValidVersions, ModelTypeArr } from "@/report/modelConfigs";
import { DeptOfficeUserValue } from "@/components/dept-office-user-select";
import { UserDeptOfficeSelect } from "@/components/user-dept-office-select";

// 本地定义 TaskState_Enum，与后端 Java 枚举对应
export enum TaskState_Enum {
  INIT = "INIT",           // 初始状态，未定部门
  DEPART = "DEPART",       // 部门已指定，科室未指定
  OFFICE = "OFFICE",       // 科室已指定，人员未指定
  PERSON = "PERSON",       // 责任人已确定，等待派工
  DISP = "DISP",           // 已派工，检验进行中
  HANGUP = "HANGUP",       // 挂起/暂停，等待整改反馈
  DONE = "DONE",           // 已完成
  CANCEL = "CANCEL",       // 作废
}

// 状态中文描述映射
export const TaskState_Label: Record<TaskState_Enum, string> = {
  [TaskState_Enum.INIT]: "初始状态",
  [TaskState_Enum.DEPART]: "待分配科室",
  [TaskState_Enum.OFFICE]: "待分配人员",
  [TaskState_Enum.PERSON]: "待派工",
  [TaskState_Enum.DISP]: "检验进行中",
  [TaskState_Enum.HANGUP]: "挂起/整改中",
  [TaskState_Enum.DONE]: "已完成",
  [TaskState_Enum.CANCEL]: "已作废",
};

// 创建报告的 GraphQL Mutation (使用旧平台数据初始化)
const NewReportMutation = gql`
  mutation InitReportFromOldPt(
    $isp: ID!
    $ispMens: [ID]
    $reviewer: ID
    $approver: ID
    $modeltype: String!
    $modelversion: Int!
    $reportCod: String!
    $ispDate: Date
  ) {
    initReportFromOldPt(
      isp: $isp
      ispMens: $ispMens
      reviewer: $reviewer
      approver: $approver
      modeltype: $modeltype
      modelversion: $modelversion
      reportCod: $reportCod
      ispDate: $ispDate
    ) {
      id
      modeltype
      modelversion
      stm {
        id
        sta
      }
    }
  }
`;

interface Device {
  id: string;
  cod: string;
  oid: string | null;
  sort: string;
  vart: string;
  subv: string | null;
}

// 旧平台检验情况记录（新API格式，用户数据为映射后的对象）
interface OldPlatformIspRecord {
  taskId?: string;
  chkUser?: { oldPtUserId?: string; found: boolean; localUserId?: string };
  apprUser?: { oldPtUserId?: string; found: boolean; localUserId?: string };
  jyMenUsers?: Array<{ oldName?: string; found: boolean; localUserId?: string }>;
  ispDate?: string;
  reportCod?: string;
  exceptions?: string[];  // 用户映射失败信息
  [key: string]: any;
}

// 编辑后的检验记录数据（包含本地用户ID）
interface EditedIspRecord {
  reportCod: string;
  ispDate: string;
  chkUserId: string;      // 本地用户ID
  apprUserId: string;     // 本地用户ID
  jyMenIds: string[];     // 本地用户ID列表
  modeltype: string;      // 报告模板类型
  modelversion: number;   // 报告模板版本
  // 人员选择器的值
  chkUserSelect?: DeptOfficeUserValue;
  apprUserSelect?: DeptOfficeUserValue;
  jyMenSelects?: DeptOfficeUserValue[];
}

interface Detail {
  id: string;
  ident: string | null;
  outerId?: string | null;
  extra?: string | null;
  sort?: string | null;
  vart?: string | null;
  isp: {
    id: string;
    no: string | null;
    dev: Device | null;
    report: {
      id: string;
      modeltype: string;
      modelversion: number;
      stm: {
        id: string;
        sta: string;
      };
    } | null;
  };
}

interface Task {
  id: string;
  date?: string;
  status?: TaskState_Enum;
  bsType?: string;
  entrust?: boolean;
  eqpcnt?: number;
  origd?: string;
  dep?: {
    id: string;
    name?: string;
  };
  office?: {
    id: string;
    name?: string;
  };
  liabler?: {
    id: string;
    username?: string;
    familyName?: string;
    givenName?: string;
    person?: {
      id: string;
      name: string;
    };
  };
  servu?: {
    id: string;
    name?: string;
  };
  crman?: {
    id: string;
    username?: string;
    familyName?: string;
    givenName?: string;
  };
  agreement?: {
    id: string;
    ptno?: string;
  };
  dets?: Detail[];
}

interface TaskListProps {
  tasks: Task[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

// 获取状态显示文本和颜色
function getStatusDisplay(status?: TaskState_Enum): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (!status) {
    return { text: "未知", variant: "outline" };
  }

  const text = TaskState_Label[status] || "未知";

  switch (status) {
    case TaskState_Enum.INIT:
      return { text, variant: "outline" };
    case TaskState_Enum.DEPART:
      return { text, variant: "secondary" };
    case TaskState_Enum.OFFICE:
      return { text, variant: "secondary" };
    case TaskState_Enum.PERSON:
      return { text, variant: "default" };
    case TaskState_Enum.DISP:
      return { text, variant: "default" };
    case TaskState_Enum.HANGUP:
      return { text, variant: "destructive" };
    case TaskState_Enum.DONE:
      return { text, variant: "outline" };
    case TaskState_Enum.CANCEL:
      return { text, variant: "destructive" };
    default:
      return { text: "未知", variant: "outline" };
  }
}

// 格式化日期
function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN");
  } catch {
    return dateStr;
  }
}

// 获取设备显示名称
function getDeviceDisplay(detail: Detail): string {
  if (detail.isp?.dev?.cod) {
    return detail.isp.dev.cod;
  }
  if (detail.ident) {
    return detail.ident;
  }
  return "未命名设备";
}

// 获取设备可用的报告模板列表
function getAvailableModels(det: Detail, task: Task): Array<{ type: string; name: string; versions: string[] }> {
  const dev = det.isp?.dev;
  // 非标准设备（dev为空）时，从 Detail.sort / Detail.vart 读取
  const sort = dev?.sort || det.sort || "";
  const vart = dev?.vart || det.vart || "";
  const subvart = dev?.subv || "";
  const bsType = task.bsType || "";
  const entrust = task.entrust || false;

  console.log('[getAvailableModels] Params:', { sort, vart, subvart, bsType, entrust, devId: dev?.id, detId: det.id });

  // 获取匹配的模板类型列表
  const modelTypes = getReportModelTypes(sort, vart, subvart, bsType, entrust);
  console.log('[getAvailableModels] Matched modelTypes:', modelTypes);

  // 转换为带有名称和版本信息的列表
  return modelTypes
    .map((type) => {
      const config = ModelTypeArr[type];
      if (!config) return null;
      
      const validVersions = getValidVersions(type);
      if (validVersions.length === 0) return null;

      return {
        type,
        name: config.name || type,
        versions: validVersions,
      };
    })
    .filter((item): item is { type: string; name: string; versions: string[] } => item !== null);
}

// 旧平台记录编辑器组件
interface OldRecordEditorProps {
  record: OldPlatformIspRecord;   // 初始化设备检验数据
  editedRecord?: EditedIspRecord;
  availableModels: Array<{ type: string; name: string; versions: string[] }>;
  onChange: (editedRecord: EditedIspRecord) => void;
  onSave: () => void;
  onCancel: () => void;
  onCopy: () => void;
}

function OldRecordEditor({
  record,
  editedRecord,
  availableModels,
  onChange,
  onSave,
  onCancel,
  onCopy,
}: OldRecordEditorProps) {
  // 确保有编辑数据，localUserId 即为 User 模型的 GlobalID
  const currentData: EditedIspRecord = editedRecord || {
    reportCod: record.reportCod || '',
    ispDate: record.ispDate || '',
    chkUserId: record.chkUser?.localUserId || '',
    apprUserId: record.apprUser?.localUserId || '',
    jyMenIds: (record.jyMenUsers || []).map(u => u.localUserId).filter((id): id is string => !!id),
    modeltype: availableModels.length > 0 ? availableModels[0].type : '',
    modelversion: availableModels.length > 0 ? parseInt(availableModels[0].versions[0] || '1', 10) : 1,
    jyMenSelects: (record.jyMenUsers ?? [])
      .filter(u => u.localUserId)
      .map(u => ({
        userId: u.localUserId,
        name: u.localPersonName || u.oldName || '',
        depId: '',
        officeId: '',
      })),
  };

  // 处理检验人员选择变化
  const handleChkUserChange = (value: DeptOfficeUserValue) => {
    onChange({
      ...currentData,
      chkUserId: value.userId,
      chkUserSelect: value,
    });
  };

  // 处理审核人员选择变化
  const handleApprUserChange = (value: DeptOfficeUserValue) => {
    onChange({
      ...currentData,
      apprUserId: value.userId,
      apprUserSelect: value,
    });
  };

  // 添加检验人员列表成员
  const addJyMenMember = () => {
    const newSelects = [...(currentData.jyMenSelects || []), { depId: '', officeId: '', userId: '' }];
    onChange({
      ...currentData,
      jyMenSelects: newSelects,
    });
  };

  // 移除检验人员列表成员
  const removeJyMenMember = (index: number) => {
    const newSelects = [...(currentData.jyMenSelects || [])];
    newSelects.splice(index, 1);
    const newIds = [...currentData.jyMenIds];
    newIds.splice(index, 1);
    onChange({
      ...currentData,
      jyMenSelects: newSelects,
      jyMenIds: newIds,
    });
  };

  // 处理检验人员列表成员变化
  const handleJyMenMemberChange = (index: number, value: DeptOfficeUserValue) => {
    const newSelects = [...(currentData.jyMenSelects || [])];
    newSelects[index] = value;
    const newIds = [...currentData.jyMenIds];
    newIds[index] = value.userId;
    onChange({
      ...currentData,
      jyMenSelects: newSelects,
      jyMenIds: newIds,
    });
  };

  // 获取当前选中模板的版本列表
  const currentModelVersions = availableModels.find(m => m.type === currentData.modeltype)?.versions || [];

  return (
    <div className="space-y-3">
      {/* 报告模板和版本号 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">报告模板 <span className="text-red-500">*</span></Label>
          <Select
            value={currentData.modeltype}
            onValueChange={(value) => {
              const selectedModel = availableModels.find(m => m.type === value);
              onChange({
                ...currentData,
                modeltype: value,
                modelversion: selectedModel ? parseInt(selectedModel.versions[0] || '1', 10) : 1,
              });
            }}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="请选择模板" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.type} value={model.type} className="text-xs">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">版本号 <span className="text-red-500">*</span></Label>
          <Select
            value={String(currentData.modelversion)}
            onValueChange={(value) => onChange({ ...currentData, modelversion: parseInt(value, 10) })}
            disabled={!currentData.modeltype}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="请选择版本" />
            </SelectTrigger>
            <SelectContent>
              {currentModelVersions.map((version) => (
                <SelectItem key={version} value={version} className="text-xs">
                  版本 {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 报告编号和检验日期 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">报告编号</Label>
          <Input
            type="text"
            value={currentData.reportCod}
            onChange={(e) => onChange({ ...currentData, reportCod: e.target.value })}
            placeholder="请输入报告编号"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">检验日期</Label>
          <Input
            type="date"
            value={currentData.ispDate}
            onChange={(e) => onChange({ ...currentData, ispDate: e.target.value })}
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* 审核人员选择 */}
      <div className="space-y-1">
        <Label className="text-xs">审核人员</Label>
        <UserDeptOfficeSelect
          userId={currentData.chkUserId}
          value={currentData.chkUserSelect}
          onChange={handleChkUserChange}
        />
      </div>

      {/* 审批人员选择 */}
      <div className="space-y-1">
        <Label className="text-xs">审批人员</Label>
        <UserDeptOfficeSelect
          userId={currentData.apprUserId}
          value={currentData.apprUserSelect}
          onChange={handleApprUserChange}
        />
      </div>

      {/* 检验人员列表 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">检验人员列表</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={addJyMenMember}
          >
            + 添加人员
          </Button>
        </div>
        {(currentData.jyMenSelects || []).map((select, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <UserDeptOfficeSelect
                userId={currentData.jyMenIds[index]}
                value={select}
                onChange={(value) => handleJyMenMemberChange(index, value)}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-red-500"
              onClick={() => removeJyMenMember(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {(currentData.jyMenSelects || []).length === 0 && (
          <p className="text-xs text-gray-400">暂无检验人员</p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={onCopy}
        >
          <Copy className="w-3 h-3 mr-1" />
          复制
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={onCancel}
        >
          <X className="w-3 h-3 mr-1" />
          取消
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onSave}
        >
          <Check className="w-3 h-3 mr-1" />
          保存
        </Button>
      </div>
    </div>
  );
}

// 任务卡片组件
function TaskCard({ task }: { task: Task }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDets, setSelectedDets] = useState<Set<string>>(new Set());
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [modelType, setModelType] = useState("");
  const [modelVersion, setModelVersion] = useState("");
  const [currentIspId, setCurrentIspId] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{ type: string; name: string; versions: string[] }>>([]);
  
  // 旧平台检验情况数据
  const [oldPlatformData, setOldPlatformData] = useState<Record<string, OldPlatformIspRecord[]>>({});
  const [syncingDevices, setSyncingDevices] = useState<Set<string>>(new Set());
  // 旧平台登录重定向对话框
  const router = useRouter();
  const [loginRedirectOpen, setLoginRedirectOpen] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startLoginRedirectCountdown = useCallback(() => {
    setCountdown(60);
    setLoginRedirectOpen(true);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 监听倒计时归零后自动跳转
  useEffect(() => {
    if (countdown === 0 && loginRedirectOpen) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setLoginRedirectOpen(false);
      window.location.href = withBasePath("/third-party-login");
    }
  }, [countdown, loginRedirectOpen]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // 编辑状态
  const [editingDetId, setEditingDetId] = useState<string | null>(null);
  const [editingRecordIndex, setEditingRecordIndex] = useState<number>(0);
  const [editedRecords, setEditedRecords] = useState<Record<string, EditedIspRecord>>({});
  const [copyBuffer, setCopyBuffer] = useState<EditedIspRecord | null>(null);
  // 编辑前快照（取消时恢复到打开编辑器时刻的状态，而非删除全部编辑历史）
  const editSnapshotRef = useRef<Record<string, EditedIspRecord>>({});
  // 记录已被成功初始化报告的 Isp ID（用于在缓存更新前让 UI 立即响应）
  const [initializedIspIds, setInitializedIspIds] = useState<Set<string>>(new Set());

  const [newReportResult, newReport] = useMutation(NewReportMutation);

  const statusDisplay = getStatusDisplay(task.status);
  const liablerName = task.liabler?.person?.name || "-";
  const crmanName = task.crman
    ? `${task.crman.familyName || ""}${task.crman.givenName || ""}`.trim() || task.crman.username
    : "-";

  // 切换明细选中状态
  const toggleDetSelection = (detId: string) => {
    setSelectedDets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(detId)) {
        newSet.delete(detId);
      } else {
        newSet.add(detId);
      }
      return newSet;
    });
  };

  // 同步旧平台检验情况
  const syncOldPlatformData = async (det: Detail) => {
    let eqpCod = det.isp?.dev?.cod;
    // 非标准设备 taskDatabase=2 的场景：从 extra JSON 中提取 eqpCod
    let taskDatabase = '1'; // 默认标准设备
    if (!eqpCod && det.extra) {
      try {
        const extraData = JSON.parse(det.extra);
        if (extraData.eqpCod) eqpCod = extraData.eqpCod;
        taskDatabase = '2';
      } catch (_) {}
    }
    if (!eqpCod) {
      toast.error("设备代码不存在，无法同步");
      return;
    }

    setSyncingDevices((prev) => new Set(prev).add(det.id));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_WEB}/api/old-platform/isp-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eqpCod, taskDatabase }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 提取需要的字段（新API格式：用户数据为映射后的对象）
        const allRecords: OldPlatformIspRecord[] = result.data.map((item: any) => ({
          taskId: item.originalData?.taskId,
          chkUser: item.chkUser,              // { oldPtUserId, found, localUserId }
          apprUser: item.apprUser,             // { oldPtUserId, found, localUserId }
          jyMenUsers: item.jyMenUsers,         // [{ oldName, found, localUserId }, ...]
          ispDate: item.originalData?.ispDate,
          reportCod: item.originalData?.reportCod,
          exceptions: item.exceptions || [],    // 包含用户映射失败信息
        }));
        // 只保留与当前设备明细 outerId 匹配的记录（即属于当前任务卡片的检验记录）
        const records = det.outerId
          ? allRecords.filter(r => r.taskId === det.outerId)
          : allRecords;
        if (det.outerId && allRecords.length > 0 && records.length === 0) {
          console.warn(`[sync] 无匹配的检验记录: det.outerId=${det.outerId}, taskId列表=${allRecords.map(r=>r.taskId).join(',')}`);
        }

        setOldPlatformData((prev) => ({
          ...prev,
          [det.id]: records,
        }));

        // 检查是否有异常信息
        const totalExceptions = records.reduce((sum, r) => sum + (r.exceptions?.length || 0), 0);
        if (totalExceptions > 0) {
          toast.warning(`同步完成，找到 ${records.length} 条记录，但有 ${totalExceptions} 个用户映射失败`);
        } else if (records.length > 0){
          toast.success(`同步成功，找到 ${records.length} 条检验记录`);
        }
        else toast.success(`同步成功，但旧平台不存在检验记录，请到旧平台先处理后再来`);
      } else if (result.error?.includes('旧平台的接口无法访问')) {
        startLoginRedirectCountdown();
      } else {
        toast.error(result.error || "同步失败");
      }
    } catch (error: any) {
      toast.error(`同步失败: ${error.message}`);
    } finally {
      setSyncingDevices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(det.id);
        return newSet;
      });
    }
  };

  // ========== 旧平台记录编辑功能 ==========

  // 开始编辑记录
  const startEditRecord = (det: Detail, recordIndex: number) => {
    const detId = det.id;
    setEditingDetId(detId);
    setEditingRecordIndex(recordIndex);
    
    // 保存当前 editedRecord 的快照（取消时恢复到此刻的状态）
    const editKey = `${detId}_${recordIndex}`;
    if (editedRecords[editKey]) {
      editSnapshotRef.current[editKey] = JSON.parse(JSON.stringify(editedRecords[editKey]));
    }
    
    // 初始化编辑数据
    const oldRecords = oldPlatformData[detId];
    if (oldRecords && oldRecords[recordIndex]) {
      const record = oldRecords[recordIndex];
      
      // 如果还没有编辑过，初始化编辑记录
      // localUserId 即为 User 模型的 GlobalID，与 DeptOfficeUserSelect 返回值一致
      if (!editedRecords[editKey]) {
        const models = getAvailableModels(det, task);
        const chkUserId = record.chkUser?.localUserId || '';
        const apprUserId = record.apprUser?.localUserId || '';
        const jyMenIds = (record.jyMenUsers || [])
          .map(u => u.localUserId)
          .filter((id): id is string => !!id);
        setEditedRecords(prev => ({
          ...prev,
          [editKey]: {
            reportCod: record.reportCod || '',
            ispDate: record.ispDate || '',
            chkUserId,
            apprUserId,
            jyMenIds,
            modeltype: models.length > 0 ? models[0].type : '',
            modelversion: models.length > 0 ? parseInt(models[0].versions[0] || '1', 10) : 1,
            jyMenSelects: (record.jyMenUsers ?? [])
              .filter(u => u.localUserId)
              .map(u => ({
                userId: u.localUserId,
                name: u.localPersonName || u.oldName || '',
                depId: '',
                officeId: '',
              })),
          }
        }));
      }
    }
  };

  // 更新编辑的记录
  const updateEditedRecord = (detId: string, recordIndex: number, newEditedRecord: EditedIspRecord) => {
    const editKey = `${detId}_${recordIndex}`;
    setEditedRecords(prev => ({
      ...prev,
      [editKey]: newEditedRecord
    }));
  };

  // 保存编辑的记录
  const saveEditedRecord = (detId: string, recordIndex: number) => {
    setEditingDetId(null);
    setEditingRecordIndex(0);
    toast.success("记录已保存");
  };

  // 取消编辑（恢复到打开编辑器时的快照，而非删除全部编辑历史）
  const cancelEditRecord = (detId: string, recordIndex: number) => {
    setEditingDetId(null);
    setEditingRecordIndex(0);
    const editKey = `${detId}_${recordIndex}`;
    const snapshot = editSnapshotRef.current[editKey];
    if (snapshot) {
      // 有快照 → 恢复到打开编辑器时的状态（保留之前已保存的修改）
      setEditedRecords(prev => ({ ...prev, [editKey]: snapshot }));
      delete editSnapshotRef.current[editKey];
    } else {
      // 无快照（从未保存过）→ 删除编辑记录
      setEditedRecords(prev => {
        const next = { ...prev };
        delete next[editKey];
        return next;
      });
    }
  };

  // 复制记录到剪贴板（不包含报告编号）
  const copyRecordToBuffer = (detId: string, recordIndex: number) => {
    const editKey = `${detId}_${recordIndex}`;
    const editedRecord = editedRecords[editKey];
    
    if (editedRecord) {
      const { reportCod, ...copyData } = editedRecord;
      setCopyBuffer(copyData);
      toast.success("记录已复制（包含模板和版本号），可以粘贴到其他设备");
    } else {
      // 如果没有编辑过，提示先编辑
      toast.error('请先点击"编辑"按钮配置报告信息后再复制');
    }
  };

  // 粘贴记录到设备（保留原有 reportCod，不覆盖）
  const pasteRecordToDevice = (detId: string) => {
    if (!copyBuffer) return;
    
    // 找到该设备的第一个记录进行粘贴
    const oldRecords = oldPlatformData[detId];
    if (oldRecords && oldRecords.length > 0) {
      const editKey = `${detId}_0`;
      setEditedRecords(prev => {
        const existing = prev[editKey];
        const oldRecord = oldRecords[0];
        // 保留原有 reportCod：优先从已有编辑记录取，其次从旧平台记录取
        const existingReportCod = existing?.reportCod || oldRecord?.reportCod || '';
        return {
          ...prev,
          [editKey]: { ...copyBuffer, reportCod: existingReportCod }
        };
      });
      toast.success("记录已粘贴");
    }
  };

  // 初始化报告（单设备）- 直接使用编辑后的数据
  const initReportForDevice = async (ispId: string, det: Detail) => {
    // 检查是否已编辑记录
    const editKey = `${det.id}_0`;
    const editedRecord = editedRecords[editKey];
    
    if (!editedRecord) {
      toast.error('请先点击"编辑"按钮配置报告信息');
      return;
    }
    
    if (!editedRecord.modeltype) {
      toast.error("请选择报告模板");
      return;
    }

    try {
      const params = buildReportParams(ispId, det.id);
      const result = await newReport(params);

      if (result.error) {
        toast.error(`创建报告失败: ${result.error.message}`);
      } else {
        toast.success("报告初始化成功");
        setInitializedIspIds((prev) => new Set(prev).add(ispId));
      }
    } catch (error: any) {
      toast.error(`创建报告失败: ${error.message}`);
    }
  };

  // 批量初始化报告 - 直接使用各设备编辑后的数据
  const handleBatchInitReports = async () => {
    const selectedDetIds = Array.from(selectedDets);
    const selectedDetsList = task.dets?.filter(d => selectedDetIds.includes(d.id)) || [];
    
    // 检查所有设备是否都已编辑
    const uneditedDets = selectedDetsList.filter(det => {
      const editKey = `${det.id}_0`;
      return !editedRecords[editKey];
    });
    
    if (uneditedDets.length > 0) {
      toast.error(`有 ${uneditedDets.length} 个设备未配置报告信息，请先点击"编辑"按钮配置`);
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    const newInitialized = new Set(initializedIspIds);

    for (const det of selectedDetsList) {
      if (!det.isp?.report && !newInitialized.has(det.isp?.id || '')) {
        try {
          const params = buildReportParams(
            det.isp.id,
            det.id
          );
          const result = await newReport(params);

          if (result.error) {
            failCount++;
            console.error(`创建报告失败 (${det.isp.id}):`, result.error);
          } else {
            successCount++;
            if (det.isp?.id) newInitialized.add(det.isp.id);
          }
        } catch (error: any) {
          failCount++;
          console.error(`创建报告失败 (${det.isp.id}):`, error);
          toast.error(`设备 ${det.isp.dev?.cod || det.isp.id}: ${error.message}`);
        }
      }
    }

    setInitializedIspIds(newInitialized);

    if (successCount > 0) {
      toast.success(`成功创建 ${successCount} 个报告${failCount > 0 ? `，${failCount} 个失败` : ""}`);
    } else {
      toast.error("所有报告创建失败");
    }
    
    setSelectedDets(new Set());
  };

  // 辅助函数：构建 GraphQL 参数（过滤掉 null 值）
  const buildReportParams = (
    ispId: string,
    detId: string
  ): Record<string, any> => {
    // 优先使用编辑后的数据
    const editKey = `${detId}_0`;
    const editedRecord = editedRecords[editKey];
    
    if (!editedRecord) {
      throw new Error("请先编辑并保存报告信息");
    }
    
    const params: Record<string, any> = {
      isp: ispId,
      modeltype: editedRecord.modeltype,
      modelversion: editedRecord.modelversion,
    };

    // 使用编辑后的数据
    params.reportCod = editedRecord.reportCod || "";
    if (editedRecord.ispDate) {
      params.ispDate = editedRecord.ispDate;
    }
    // 添加人员信息（过滤 null 值）
    if (editedRecord.chkUserId) {
      params.reviewer = editedRecord.chkUserId;  // 检验人员作为审核人
    }
    if (editedRecord.apprUserId) {
      params.approver = editedRecord.apprUserId;
    }
    if (editedRecord.jyMenIds && editedRecord.jyMenIds.length > 0) {
      params.ispMens = editedRecord.jyMenIds;
    }

    return params;
  };

  // 辅助函数：构建 GraphQL 参数（兼容旧逻辑，从原始数据获取）
  const buildReportParamsFromOriginal = (
    ispId: string,
    detId: string,
    modelType: string,
    versionNum: number
  ): Record<string, any> => {
    const params: Record<string, any> = {
      isp: ispId,
      modeltype: modelType,
      modelversion: versionNum,
    };

    // 从原始旧平台数据中获取
    const oldRecords = oldPlatformData[detId];
    if (oldRecords && oldRecords.length > 0) {
      const record = oldRecords[0];
      
      // 添加 reportCod（必填）
      params.reportCod = record.reportCod || "";
      
      // 添加 ispDate（可选）
      if (record.ispDate) {
        params.ispDate = record.ispDate;
      }
    } else {
      // 没有旧平台数据时，reportCod 传空字符串
      params.reportCod = "";
    }

    return params;
  };

  // 提交报告初始化
  const handleCreateReport = async () => {
    if (!modelType.trim()) {
      toast.error("请选择报告模板");
      return;
    }

    const versionNum = parseInt(modelVersion, 10);
    if (isNaN(versionNum) || versionNum < 1) {
      toast.error("请选择有效的版本号");
      return;
    }

    if (isBatchMode) {
      // 批量创建报告
      const selectedDetIds = Array.from(selectedDets);
      const selectedDetsList = task.dets?.filter(d => selectedDetIds.includes(d.id)) || [];
      
      let successCount = 0;
      let failCount = 0;
      const newInitialized = new Set(initializedIspIds);

      for (const det of selectedDetsList) {
        if (!det.isp?.report && !newInitialized.has(det.isp?.id || '')) {
          try {
            const params = buildReportParams(
              det.isp.id,
              det.id
            );
            const result = await newReport(params);

            if (result.error) {
              failCount++;
              console.error(`创建报告失败 (${det.isp.id}):`, result.error);
            } else {
              successCount++;
              if (det.isp?.id) newInitialized.add(det.isp.id);
            }
          } catch (error: any) {
            failCount++;
            console.error(`创建报告失败 (${det.isp.id}):`, error);
            toast.error(`设备 ${det.isp.dev?.cod || det.isp.id}: ${error.message}`);
          }
        }
      }

      setInitializedIspIds(newInitialized);

      if (successCount > 0) {
        toast.success(`成功创建 ${successCount} 个报告${failCount > 0 ? `，${failCount} 个失败` : ""}`);
      } else {
        toast.error("所有报告创建失败");
      }
      
      setReportDialogOpen(false);
      setSelectedDets(new Set());
    } else {
      // 单设备创建报告
      if (!currentIspId) {
        toast.error("缺少ISP ID");
        return;
      }

      // 找到当前选中的 det
      const currentDet = task.dets?.find(d => d.isp?.id === currentIspId);
      if (!currentDet) {
        toast.error("找不到当前设备信息");
        return;
      }

      try {
        const params = buildReportParams(
          currentIspId,
          currentDet.id
        );
        const result = await newReport(params);

        if (result.error) {
          toast.error(`创建报告失败: ${result.error.message}`);
        } else {
          toast.success("报告初始化成功");
          setInitializedIspIds((prev) => new Set(prev).add(currentIspId));
          setReportDialogOpen(false);
        }
      } catch (error: any) {
        toast.error(`创建报告失败: ${error.message}`);
      }
    }
  };

  // 检查是否有需要初始化报告的设备
  const hasUninitializedReports = task.dets?.some((det) => !det.isp?.report && !initializedIspIds.has(det.isp?.id || ''));

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CollapsibleTrigger asChild>
            <CardContent className="p-4 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* 第一行：协议编号 + 状态 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {task.agreement?.ptno || "-"}
                    </span>
                    <Badge variant={statusDisplay.variant}>{statusDisplay.text}</Badge>
                    {hasUninitializedReports && (
                      <Badge variant="secondary" className="text-xs">
                        待初始化报告
                      </Badge>
                    )}
                  </div>

                  {/* 第二行：服务单位 */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    服务单位：{task.servu?.name || "-"}
                  </p>

                  {/* 第三行：设备数量 + 检验日期 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>设备数量：{task.eqpcnt ?? 0} 台</span>
                    <span>检验日期：{formatDate(task.date)}</span>
                  </div>

                  {/* 第四行：责任部门 + 责任人 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>责任部门：{task.dep?.name || "-"}</span>
                    <span>责任人：{liablerName}</span>
                  </div>

                  {/* 第五行：业务类型 + 业务人员 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>业务类型：{businessCatspMap.get(task.bsType || "") || task.bsType || "-"}</span>
                    <span>业务人员：{crmanName}</span>
                  </div>
                </div>

                {/* 展开/折叠图标 */}
                <div className="flex items-center text-gray-400">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t bg-gray-50/50 dark:bg-gray-800/50">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    设备明细 ({task.dets?.length || 0})
                  </h4>
                </div>

                {/* 设备列表 */}
                <div className="space-y-3">
                  {task.dets?.map((det, index) => {
                    const deviceName = getDeviceDisplay(det);
                    const hasReport = !!det.isp?.report || initializedIspIds.has(det.isp?.id || '');
                    const oldRecords = oldPlatformData[det.id] || [];
                    const isSyncing = syncingDevices.has(det.id);

                    return (
                      <div
                        key={det.id}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border"
                      >
                        {/* 设备基本信息行 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                            <Checkbox
                              checked={selectedDets.has(det.id)}
                              onCheckedChange={() => toggleDetSelection(det.id)}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {deviceName}
                              </p>
                              {det.isp?.no && (
                                <p className="text-xs text-gray-500">
                                  检验编号：{det.isp.no}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* 同步旧平台按钮 */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => syncOldPlatformData(det)}
                              disabled={isSyncing}
                              title="同步旧平台检验情况"
                            >
                              {isSyncing ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3 mr-1" />
                              )}
                              同步旧平台
                            </Button>
                            {!hasReport ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => initReportForDevice(det.isp.id, det)}
                                disabled={newReportResult.fetching}
                              >
                                {newReportResult.fetching ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <FilePlus className="w-3 h-3 mr-1" />
                                )}
                                初始化报告
                              </Button>
                            ) : (
                              <Link
                                href={`/isp/${det.isp.id}`}
                                className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded-md border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                管理报告
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* 旧平台检验情况显示 */}
                        {oldRecords.length > 0 && (
                          <div className="mt-3 pl-9 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                旧平台检验记录：
                              </p>
                              <div className="flex items-center gap-1">
                                {/* 粘贴按钮 */}
                                {copyBuffer && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => pasteRecordToDevice(det.id)}
                                    title="粘贴已复制的记录"
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    粘贴
                                  </Button>
                                )}
                                {/* 编辑按钮 */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => startEditRecord(det, 0)}
                                  disabled={editingDetId === det.id}
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  编辑
                                </Button>
                              </div>
                            </div>
                            {oldRecords.map((record, idx) => {
                              const editKey = `${det.id}_${idx}`;
                              const editedRecord = editedRecords[editKey];
                              const isEditing = editingDetId === det.id && editingRecordIndex === idx;
                              
                              return (
                                <div
                                  key={idx}
                                  className={`text-xs p-2 rounded border ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'bg-gray-50 dark:bg-gray-700'}`}
                                >
                                  {/* 编辑模式 */}
                                  {isEditing ? (
                                    <OldRecordEditor
                                      record={record}
                                      editedRecord={editedRecord}
                                      availableModels={getAvailableModels(det, task)}
                                      onChange={(newEditedRecord: EditedIspRecord) => updateEditedRecord(det.id, idx, newEditedRecord)}
                                      onSave={() => saveEditedRecord(det.id, idx)}
                                      onCancel={() => cancelEditRecord(det.id, idx)}
                                      onCopy={() => copyRecordToBuffer(det.id, idx)}
                                    />
                                  ) : (
                                    /* 显示模式 */
                                    <>
                                      {/* 显示已编辑标记 */}
                                      {editedRecord && (
                                        <div className="mb-2 pb-2 border-b border-green-200">
                                          <span className="text-green-600 font-medium">✓ 已编辑</span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 px-1 ml-2 text-xs text-gray-500"
                                            onClick={() => copyRecordToBuffer(det.id, idx)}
                                          >
                                            <Copy className="w-3 h-3 mr-1" />
                                            复制
                                          </Button>
                                        </div>
                                      )}
                                      {/* 显示模板和版本号 */}
                                      {editedRecord?.modeltype && (
                                        <div className="mb-2 pb-2 border-b border-blue-200">
                                          <span className="text-blue-600 font-medium">
                                            模板：{getAvailableModels(det, task).find(m => m.type === editedRecord.modeltype)?.name || editedRecord.modeltype} / 版本：{editedRecord.modelversion}
                                          </span>
                                        </div>
                                      )}
                                      {/* 异常信息（用户映射失败）显示在最前面 */}
                                      {record.exceptions && record.exceptions.length > 0 && (
                                        <div className="mb-2 pb-2 border-b border-amber-200">
                                          <div className="space-y-1">
                                            {record.exceptions.map((exception, eidx) => (
                                              <div
                                                key={eidx}
                                                className="flex items-start gap-1 text-amber-700"
                                              >
                                                <span className="text-amber-500 mt-0.5">⚠</span>
                                                <span>{exception}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-2">
                                        <span className="text-gray-600">
                                          检验日期：{editedRecord?.ispDate || record.ispDate || '-'}
                                        </span>
                                        <span className="text-gray-600">
                                          报告编号：{editedRecord?.reportCod || record.reportCod || '-'}
                                        </span>
                                        <span className="text-gray-600">
                                          审核人员：{editedRecord?.chkUserSelect !== undefined
                                            ? (editedRecord.chkUserSelect.userId ? (editedRecord.chkUserSelect.name || '-') : '-')
                                            : (record.chkUser?.localPersonName || '-')}
                                        </span>
                                        <span className="text-gray-600">
                                          审批人员：{editedRecord?.apprUserSelect !== undefined
                                            ? (editedRecord.apprUserSelect.userId ? (editedRecord.apprUserSelect.name || '-') : '-')
                                            : (record.apprUser?.localPersonName || '-')}
                                        </span>
                                        <span className="text-gray-600 col-span-2">
                                          检验人员列表：
                                          {editedRecord?.jyMenSelects !== undefined
                                            ? (editedRecord.jyMenSelects.length > 0
                                              ? editedRecord.jyMenSelects.map((s, idx) => {
                                                  const fallbackName = record.jyMenUsers?.[idx]?.localPersonName || record.jyMenUsers?.[idx]?.oldName;
                                                  return s.name || fallbackName || s.userId || '-';
                                                }).join('、')
                                              : (editedRecord.jyMenIds?.length ? `(已选择 ${editedRecord.jyMenIds.length} 人)` : '-'))
                                            : (record.jyMenUsers && record.jyMenUsers.length > 0
                                              ? record.jyMenUsers.map(u => u.localPersonName || u.oldName || '-').join('、')
                                              : (editedRecord?.jyMenIds?.length
                                                ? `(已选择 ${editedRecord.jyMenIds.length} 人)`
                                                : '-'))}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 批量操作按钮 */}
                {selectedDets.size > 0 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600">
                      已选择 {selectedDets.size} 个设备
                    </span>
                    <Button
                      size="sm"
                      onClick={handleBatchInitReports}
                      disabled={newReportResult.fetching}
                    >
                      {newReportResult.fetching ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        "批量初始化报告"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 报告初始化对话框 */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBatchMode ? `批量初始化报告 (${selectedDets.size} 个设备)` : "初始化报告"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableModels.length === 0 ? (
              <div className="text-center py-4 text-amber-600">
                未找到匹配的报告模板，请检查设备类型和业务类型配置
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="modeltype">
                    报告模板 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={modelType}
                    onValueChange={(value) => {
                      setModelType(value);
                      // 自动选择该模板的第一个可用版本
                      const selectedModel = availableModels.find(m => m.type === value);
                      if (selectedModel && selectedModel.versions.length > 0) {
                        setModelVersion(selectedModel.versions[0]);
                      }
                    }}
                  >
                    <SelectTrigger id="modeltype">
                      <SelectValue placeholder="请选择报告模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.type} value={model.type}>
                          {model.name} ({model.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelversion">
                    版本号 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={modelVersion}
                    onValueChange={setModelVersion}
                  >
                    <SelectTrigger id="modelversion">
                      <SelectValue placeholder="请选择版本号" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels
                        .find(m => m.type === modelType)
                        ?.versions.map((version) => (
                          <SelectItem key={version} value={version}>
                            版本 {version}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(false)}
              disabled={newReportResult.fetching}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={newReportResult.fetching || availableModels.length === 0 || !modelType}
            >
              {newReportResult.fetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                isBatchMode ? "批量创建" : "确认创建"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 旧平台登录重定向对话框 */}
      <Dialog open={loginRedirectOpen} onOpenChange={setLoginRedirectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              旧平台登录已过期
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              旧平台的接口无法访问，请重新登录旧平台账户以继续操作。
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{countdown} 秒后自动跳转到登录页面...</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLoginRedirectOpen(false); if (countdownRef.current) clearInterval(countdownRef.current); }}>
              稍后再说
            </Button>
            <Button onClick={() => { setLoginRedirectOpen(false); if (countdownRef.current) clearInterval(countdownRef.current); router.push("/third-party-login"); }}>
              立即登录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TaskList({ tasks, hasMore, isLoadingMore, onLoadMore }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无任务数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                加载中...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                加载更多
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
