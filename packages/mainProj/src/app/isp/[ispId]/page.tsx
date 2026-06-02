"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { gql, useQuery, useMutation } from "@urql/next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, ArrowLeft, FilePlus, RotateCcw, XCircle, Star, Plus, X, ExternalLink, Clipboard } from "lucide-react";
import { UserWithPersonFragment } from "@/common/fragments";
import { toast } from "sonner";
import { getSubRepTagList } from "@/report/subRepRegistry";
import { ModelTypeArr } from "@/report/modelConfigs";
import { DeptOfficeUserValue } from "@/components/dept-office-user-select";
import { UserDeptOfficeSelect } from "@/components/user-dept-office-select";

// 报告状态枚举映射（与后端 Procedure_Enum 对应）
const ReportStatusMap: Record<string, string> = {
  'BEGIN': '待初始化',
  'MAKE': '编制',
  'SIGN': '签字',
  'CHECK': '审核',
  'WAITREDO': '等待复检',
  'APPR': '审批',
  'OFFER': '报告发放',
  'END': '终结',
  'CANCEL': '注销',
};

function userName(user: any): string {
  if (!user) return '-';
  return user.person?.name || user.username || '-';
}

function userId(user: any): string | undefined {
  return user?.id;
}

// 获取报告状态的中文名称
function getReportStatusName(status: string | undefined): string {
  if (!status) return '-';
  return ReportStatusMap[status] || status;
}

// 获取模板的中文名称
function getModelTypeName(modeltype: string | undefined): string {
  if (!modeltype) return '-';
  return ModelTypeArr[modeltype]?.name || modeltype;
}

const IspDetailQuery = gql`
  query IspDetail($id: ID!) {
    getISP(id: $id) {
      id
      no
      ispDate
      bsType,entrust,
      dev {
        id cod type,sort,vart,subv
      }
      report {
        id
        stm {
          id
          sta
        }
      }
      ispMen {
        id
        ...UserWithPerson
      }
      reps {
          edges {
            node {
              id
              modeltype,modelversion,
              data
              stm {
                id
                sta
                master {
                  ...UserWithPerson
                }
                reviewer {
                  ...UserWithPerson
                }
                approver {
                  ...UserWithPerson
                }
                authr {
                  ...UserWithPerson
                }
              }
            }
          }
        }
      bus {
        id ident,type,sort,vart
      }
    }
  }
  ${UserWithPersonFragment}
`;

const NewSubReportMutation = gql`
  mutation NewSubReport($isp: ID!, $ispMens: [ID], $reviewer: ID, $modeltype: String!) {
    newSubReport(isp: $isp, ispMens: $ispMens, reviewer: $reviewer, modeltype: $modeltype) {
      id
      modeltype
      modelversion
    }
  }
`;

const FillReportTzFieldsMutation = gql`
  mutation FillReportTzFields($ispId: ID!) {
    fillReportTzFields(ispId: $ispId) {
      id
    }
  }
`;

export default function IspPage() {
  const params = useParams<{ ispId: string }>();
  const ispId = params.ispId;

  const [result, reexecuteQuery] = useQuery({
    query: IspDetailQuery,
    variables: { id: ispId },
  });

  const [newSubRepResult, newSubRep] = useMutation(NewSubReportMutation);

  const [fillReportTzFieldsResult, fillReportTzFields] = useMutation(FillReportTzFieldsMutation);

  // 新增分项报告对话框状态
  const [showNewSubRep, setShowNewSubRep] = useState(false);
  const [selectedSubRepTag, setSelectedSubRepTag] = useState("");

  // 新增分项报告 - 人员选择状态（可编辑）
  const [reviewerUserId, setReviewerUserId] = useState<string>("");
  const [reviewerUserSelect, setReviewerUserSelect] = useState<DeptOfficeUserValue | undefined>();
  const [ispMenUserIds, setIspMenUserIds] = useState<string[]>([]);
  const [ispMenSelects, setIspMenSelects] = useState<DeptOfficeUserValue[]>([]);

  const { data, fetching, error } = result;
  const isp = data?.getISP;
  const mainRepId = isp?.report?.id;

  // 排序：主报告排第一，其余按 modeltype 排序
  const allReports = (isp?.reps?.edges || [])
    .map((e: any) => e.node)
    .sort((a: any, b: any) => {
      if (a.id === mainRepId) return -1;
      if (b.id === mainRepId) return 1;
      return (a.modeltype || '').localeCompare(b.modeltype || '');
    });

  // 主报告对象
  const mainReport = allReports.find((r: any) => r.id === mainRepId);

  // 分项报告模板列表（动态从 config.ts 查找）
  const mainModelType = mainReport?.modeltype || (isp?.report as any)?.modeltype;
  const mainVersion = String(mainReport?.modelversion || "");
  const [subRepTagList, setSubRepTagList] = useState<Array<{tag: string; name: string}>>([]);
  useEffect(() => {
    if (mainModelType) {
      getSubRepTagList(mainModelType, mainVersion).then(setSubRepTagList);
    }
  }, [mainModelType, mainVersion]);

  // 新增分项报告 - 检验人员变更处理
  const handleIspMenChange = (index: number, value: DeptOfficeUserValue) => {
    const newSelects = [...ispMenSelects];
    newSelects[index] = value;
    const newIds = [...ispMenUserIds];
    newIds[index] = value.userId;
    setIspMenSelects(newSelects);
    setIspMenUserIds(newIds);
  };

  const addIspMenMember = () => {
    setIspMenSelects([...ispMenSelects, { depId: "", officeId: "", userId: "" }]);
    setIspMenUserIds([...ispMenUserIds, ""]);
  };

  const removeIspMenMember = (index: number) => {
    setIspMenSelects(ispMenSelects.filter((_, i) => i !== index));
    setIspMenUserIds(ispMenUserIds.filter((_, i) => i !== index));
  };

  // 新增分项报告
  const handleAddSubReport = async () => {
    if (!selectedSubRepTag || !ispId) return;

    const ispMenIds = ispMenUserIds.filter(Boolean);
    const reviewerId = reviewerUserId || undefined;

    const result = await newSubRep({
      isp: ispId,
      ispMens: ispMenIds.length > 0 ? ispMenIds : undefined,
      reviewer: reviewerId || undefined,
      modeltype: selectedSubRepTag,
    });

    if (result.error) {
      toast.error(`新增分项报告失败: ${result.error.message}`);
    } else {
      toast.success(`分项报告 ${selectedSubRepTag} 创建成功`);
      setShowNewSubRep(false);
      setSelectedSubRepTag("");
      reexecuteQuery({ requestPolicy: "network-only" });
    }
  };

  // 基础信息赋值
  const handleFillReportTzFields = async () => {
    if (!ispId) return;

    const result = await fillReportTzFields({
      ispId: ispId,
    });

    if (result.error) {
      toast.error(`基础信息赋值失败: ${result.error.message}`);
    } else {
      toast.success('基础信息赋值成功');
      reexecuteQuery({ requestPolicy: "network-only" });
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/ispTask" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回任务列表
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">设备检验管理</h1>

      {fetching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6 text-red-500">加载失败: {error.message}</CardContent>
        </Card>
      ) : !isp ? (
        <Card>
          <CardContent className="py-6 text-gray-500">未找到该检验记录</CardContent>
        </Card>
      ) : (
        <>
          {/* 基本信息 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">检验编号：</span>{isp.no || '-'}</div>
                <div><span className="text-gray-500">检验日期：</span>{isp.ispDate || '-'}</div>
                <div><span className="text-gray-500">业务类型：</span>{isp.bsType || '-'}</div>
                <div><span className="text-gray-500">任务明细：</span>{isp.bus?.ident || '-'}</div>
              </div>
              {isp.dev && (
                <div className="border-t pt-2 mt-2">
                  <div className="font-medium mb-1">设备信息</div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div>设备代码：{isp.dev.cod || '-'}</div>
                    <div>设备类型：{isp.dev.vart || '-'}{isp.dev.subv ? ` / ${isp.dev.subv}` : ''}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 报告列表 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">报告及独立流转分项列表（共 {allReports.length} 个）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allReports.length === 0 ? (
                <p className="text-sm text-gray-400">暂无报告</p>
              ) : (
                allReports.map((rep: any) => {
                  const isMain = rep.id === mainRepId;
                  return (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-lg border text-sm ${isMain ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isMain && <Star className="w-4 h-4 text-blue-500 fill-blue-500" />}
                          <span className="font-medium">{getModelTypeName(rep.modeltype)}</span>
                          <Badge variant={isMain ? "default" : "secondary"} className="text-[10px] h-4 px-1">
                            {isMain ? '主报告' : '分项报告'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {isMain && (
                            <span className="text-xs text-gray-400">v{rep.modelversion ?? '-'}</span>
                          )}
                          <Link
                            href={
                              isMain
                                ? `/rep/${rep.id}/${rep.modeltype}/${rep.modelversion}`
                                : `/rep/${mainRepId}/${mainReport?.modeltype}/${mainReport?.modelversion}?subrid=${rep.id}&modelkey=${rep.modeltype}`
                            }
                          >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className={`grid ${isMain ? 'grid-cols-3' : 'grid-cols-2'} gap-2 text-xs text-gray-600`}>
                        <div>
                          <span className="text-gray-400">状态：</span>
                          {getReportStatusName(rep.stm?.sta)}
                        </div>
                        <div>
                          <span className="text-gray-400">审核：</span>
                          {userName(rep.stm?.reviewer)}
                        </div>
                        {isMain && (
                          <div>
                            <span className="text-gray-400">审批：</span>
                            {userName(rep.stm?.approver)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="text-gray-400">检验人员：</span>
                        {rep.stm?.authr && rep.stm.authr.length > 0
                          ? rep.stm.authr.map((u: any) => userName(u)).join('、')
                          : '-'}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">操作</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="default"
                className="gap-2"
                disabled={subRepTagList.length === 0}
                onClick={() => {
                  setSelectedSubRepTag("");
                  // 预填默认人员：检验人员取主报告 stm.authr，审核人取主报告 stm.reviewer
                  const reviewerId = userId(mainReport?.stm?.reviewer);
                  setReviewerUserId(reviewerId || "");
                  setReviewerUserSelect(undefined);
                  
                  // 初始化检验人员列表，包含姓名信息
                  const authrList = mainReport?.stm?.authr || [];
                  const authrIds = authrList.map((u: any) => u.id).filter(Boolean);
                  setIspMenUserIds(authrIds);
                  setIspMenSelects(authrList.map((u: any) => ({
                    depId: "",
                    officeId: "",
                    userId: u.id,
                    name: u.person?.name || u.username || "",
                  })));
                  setShowNewSubRep(true);
                }}
              >
                <FilePlus className="w-4 h-4" />
                新增分项目报告
              </Button>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                报告回退
              </Button>
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={handleFillReportTzFields}
                disabled={fillReportTzFieldsResult.fetching}
              >
                {fillReportTzFieldsResult.fetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clipboard className="w-4 h-4" />
                )}
                基础信息赋值
              </Button>
              <Button variant="destructive" className="gap-2">
                <XCircle className="w-4 h-4" />
                检验作废
              </Button>
            </div>
          </div>

          {/* 新增分项报告对话框 */}
          <Dialog open={showNewSubRep} onOpenChange={setShowNewSubRep}>
            <DialogContent 
              className="sm:max-w-2xl"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>新增分项目报告</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>选择分项报告模板</Label>
                  <Select
                    value={selectedSubRepTag}
                    onValueChange={setSelectedSubRepTag}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择分项报告模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {subRepTagList.map((item) => (
                        <SelectItem key={item.tag} value={item.tag}>
                          {item.name} ({item.tag})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 检验人员选择（可编辑） */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>检验人员</Label>
                    <Button type="button" variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={addIspMenMember}>
                      <Plus className="w-3 h-3" />
                      添加
                    </Button>
                  </div>
                  {ispMenSelects.length === 0 ? (
                    <p className="text-xs text-gray-400">暂无检验人员，请添加</p>
                  ) : (
                    <div className="space-y-2">
                      {ispMenSelects.map((select, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="flex-1">
                            <UserDeptOfficeSelect
                              userId={ispMenUserIds[index]}
                              value={select}
                              onChange={(value) => handleIspMenChange(index, value)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 mt-6 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                            onClick={() => removeIspMenMember(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 审核人员选择（可编辑） */}
                <div className="space-y-2">
                  <Label>审核人员</Label>
                  <UserDeptOfficeSelect
                    userId={reviewerUserId}
                    value={reviewerUserSelect}
                    onChange={(value) => {
                      setReviewerUserId(value.userId);
                      setReviewerUserSelect(value);
                    }}
                  />
                </div>

                {/* 当前选择人员显示 */}
                {(ispMenSelects.length > 0 || reviewerUserId) && (
                  <div className="pt-2 border-t bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">当前选择：</p>
                    {ispMenSelects.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 shrink-0">检验人员：</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {ispMenSelects.map((select, idx) => {
                            const name = select.name || select.userId;
                            return name || '-';
                          }).join('、')}
                        </span>
                      </div>
                    )}
                    {reviewerUserId && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-gray-500 shrink-0">审核人员：</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {reviewerUserSelect?.name || reviewerUserId || '-'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewSubRep(false)}>取消</Button>
                <Button
                  disabled={!selectedSubRepTag || newSubRepResult.fetching}
                  onClick={handleAddSubReport}
                >
                  {newSubRepResult.fetching ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : null}
                  确认新增
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </main>
  );
}
