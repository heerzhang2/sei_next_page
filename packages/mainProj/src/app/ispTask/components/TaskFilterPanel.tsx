"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DeptOfficeUserSelect,
  DeptOfficeUserValue,
} from "@/components/dept-office-user-select";

// 本地定义类型，匹配后端 TaskInput 接口
export interface TaskInput {
  ptno?: string;
  entrust?: boolean; // Boolean 类型
  statusx?: TaskState_Enum[]; // 状态数组
  dep?: string; // 责任部门ID
  office?: string; // 办公室ID
  liabler?: string; // 责任人ID
  servu?: string; // 服务单位ID
  date1?: string; // 开始日期
  date2?: string; // 结束日期
  bsTypex?: string[]; // 业务类型数组
  [key: string]: any;
}

// 匹配后端 Java TaskState_Enum 枚举
export enum TaskState_Enum {
  INIT = "INIT",
  DEPART = "DEPART",
  OFFICE = "OFFICE",
  PERSON = "PERSON",
  DISP = "DISP",
  HANGUP = "HANGUP",
  DONE = "DONE",
  CANCEL = "CANCEL",
}

// 状态显示名称映射（简短描述）
export const TaskStateLabels: Record<TaskState_Enum, string> = {
  [TaskState_Enum.INIT]: "初始",
  [TaskState_Enum.DEPART]: "部门已定",
  [TaskState_Enum.OFFICE]: "科室已定",
  [TaskState_Enum.PERSON]: "责任人已定",
  [TaskState_Enum.DISP]: "已派工",
  [TaskState_Enum.HANGUP]: "挂起/等待复检",
  [TaskState_Enum.DONE]: "已完成",
  [TaskState_Enum.CANCEL]: "已作废",
};

interface TaskFilterPanelProps {
  filters: TaskInput;
  onApply: (filters: TaskInput) => void;
  onClear: () => void;
}

export function TaskFilterPanel({ filters, onApply, onClear }: TaskFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<TaskInput>(filters);

  const handleChange = useCallback((field: keyof TaskInput, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  }, []);

  const handleApply = useCallback(() => {
    // 过滤掉空值
    const cleanedFilters: TaskInput = {};
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        (cleanedFilters as any)[key] = value;
      }
    });
    onApply(cleanedFilters);
  }, [localFilters, onApply]);

  const handleClear = useCallback(() => {
    setLocalFilters({});
    onClear();
  }, [onClear]);

  return (
    <div className="space-y-4">
      {/* 协议编号 */}
      <div className="space-y-2">
        <Label htmlFor="ptno">协议编号</Label>
        <Input
          id="ptno"
          placeholder="请输入协议编号"
          value={localFilters.ptno || ""}
          onChange={(e) => handleChange("ptno", e.target.value)}
        />
      </div>

      {/* 委托单位 - 布尔类型，用复选框表示 */}
      <div className="space-y-2">
        <Label htmlFor="entrust">是否委托</Label>
        <Select
          value={localFilters.entrust === undefined ? "all" : localFilters.entrust ? "yes" : "no"}
          onValueChange={(value) => {
            const boolValue = value === "all" ? undefined : value === "yes";
            handleChange("entrust", boolValue);
          }}
        >
          <SelectTrigger id="entrust">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="yes">是</SelectItem>
            <SelectItem value="no">否</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 任务状态 - 多选 */}
      <div className="space-y-2">
        <Label>任务状态</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TaskStateLabels).map(([value, label]) => {
            const enumValue = value as TaskState_Enum;
            const isSelected = localFilters.statusx?.includes(enumValue);
            return (
              <Badge
                key={value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 select-none"
                onClick={() => {
                  const current = localFilters.statusx || [];
                  if (isSelected) {
                    handleChange(
                      "statusx",
                      current.filter((s) => s !== enumValue)
                    );
                  } else {
                    handleChange("statusx", [...current, enumValue]);
                  }
                }}
              >
                <Checkbox
                  checked={isSelected}
                  className="mr-1 h-3 w-3 border-current"
                />
                {label}
              </Badge>
            );
          })}
        </div>
        {localFilters.statusx && localFilters.statusx.length > 0 && (
          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleChange("statusx", undefined)}
            >
              清除选择
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() =>
                handleChange("statusx", Object.values(TaskState_Enum))
              }
            >
              全选
            </Button>
          </div>
        )}
      </div>

      {/* 部门/科室/人员三级联动选择 */}
      <div className="space-y-2">
        <Label>责任部门/科室/人员</Label>
        <DeptOfficeUserSelect
          value={
            localFilters.dep
              ? {
                  depId: localFilters.dep,
                  officeId: localFilters.office || "",
                  userId: localFilters.liabler || "",
                }
              : undefined
          }
          onChange={(value: DeptOfficeUserValue) => {
            setLocalFilters((prev) => {
              // 规则：有人员就不发科室和部门，有科室就不发部门
              if (value.userId) {
                return {
                  ...prev,
                  dep: undefined,
                  office: undefined,
                  liabler: value.userId,
                };
              }
              if (value.officeId) {
                return {
                  ...prev,
                  dep: undefined,
                  office: value.officeId,
                  liabler: undefined,
                };
              }
              return {
                ...prev,
                dep: value.depId || undefined,
                office: undefined,
                liabler: undefined,
              };
            });
          }}
        />
      </div>

      {/* 服务单位 */}
      <div className="space-y-2">
        <Label htmlFor="servu">服务单位ID</Label>
        <Input
          id="servu"
          placeholder="请输入服务单位ID"
          value={localFilters.servu || ""}
          onChange={(e) => handleChange("servu", e.target.value)}
        />
      </div>

      {/* 按钮组 */}
      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1">
          应用筛选
        </Button>
        <Button variant="outline" onClick={handleClear}>
          清除
        </Button>
      </div>
    </div>
  );
}
