"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

// 模拟数据类型
interface ProjectItem {
  name: string
  ha?: string
  na?: boolean
  ml?: string
  do?: boolean
  om?: boolean
  dd?: boolean
  zs?: boolean
}

// 初始数据
const initialProjects: ProjectItem[] = [
  { name: "目录", ha: "ProjectList", na: true },
  { name: "综合报告", ml: "一、锅炉安装监督检验综合报告", ha: "Conclusion", do: true },
  { name: "结论报告", ml: "1.1锅炉安装监督检验结论报告", ha: "Conclusion", do: true },
  { name: "锅炉简图", ha: "BoilerDiagram", ml: "1.2锅炉结构简图" },
  { name: "检验过程概述", ha: "Explanatory", ml: "1.3锅炉安装施工及监督检验过程概述" },
  { name: "1.4主要受压元件一览表", ha: "" },
  { name: "二、锅炉安装监督检验分项报告", ha: "" },
  { name: "安装单位审查", ml: "2.1安装单位资源条件审查报告", ha: "" },
]

interface DirectoryEditorProps {
  defaultProjects?: ProjectItem[]
  onSave?: (projects: ProjectItem[]) => void
}

export default function DirectoryEditor({ defaultProjects = initialProjects, onSave }: DirectoryEditorProps) {
  const [projects, setProjects] = React.useState<ProjectItem[]>(defaultProjects)
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = React.useState(false)
  const [editForm, setEditForm] = React.useState<ProjectItem>({
    name: "",
    ha: "",
    ml: "",
    na: false,
    do: false,
    om: false,
    dd: false,
    zs: false,
  })

  // 开始编辑
  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({ ...projects[index] })
    setIsAddingNew(false)
  }

  // 开始新增
  const startAdd = () => {
    setIsAddingNew(true)
    setEditingIndex(null)
    setEditForm({
      name: "",
      ha: "",
      ml: "",
      na: false,
      do: false,
      om: false,
      dd: false,
      zs: false,
    })
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingIndex !== null) {
      const newProjects = [...projects]
      newProjects[editingIndex] = { ...editForm }
      setProjects(newProjects)
      setEditingIndex(null)
    }
  }

  // 保存新增
  const saveAdd = () => {
    setProjects([...projects, { ...editForm }])
    setIsAddingNew(false)
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingIndex(null)
    setIsAddingNew(false)
  }

  // 删除项目
  const deleteProject = (index: number) => {
    const newProjects = projects.filter((_, i) => i !== index)
    setProjects(newProjects)
  }

  // 更新表单字段
  const updateFormField = (field: keyof ProjectItem, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  // 渲染编辑表单
  const renderEditForm = (item: ProjectItem, isNew = false) => (
    <Card className="mt-2 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isNew ? "新增目录项" : "编辑目录项"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">显示名称 *</Label>
            <Input
              id="name"
              value={item.name}
              onChange={(e) => updateFormField("name", e.target.value)}
              placeholder="输入显示名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ha">Hash路由标签</Label>
            <Input
              id="ha"
              value={item.ha || ""}
              onChange={(e) => updateFormField("ha", e.target.value)}
              placeholder="输入路由标签"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ml">目录显示题目</Label>
          <Input
            id="ml"
            value={item.ml || ""}
            onChange={(e) => updateFormField("ml", e.target.value)}
            placeholder="输入在报告目录中的显示题目"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="do"
              checked={item.do || false}
              onCheckedChange={(checked) => updateFormField("do", checked)}
            />
            <Label htmlFor="do" className="text-sm">
              默认有做
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="na"
              checked={item.na || false}
              onCheckedChange={(checked) => updateFormField("na", checked)}
            />
            <Label htmlFor="na" className="text-sm">
              不在附页
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="om"
              checked={item.om || false}
              onCheckedChange={(checked) => updateFormField("om", checked)}
            />
            <Label htmlFor="om" className="text-sm">
              仅记录目录
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="zs"
              checked={item.zs || false}
              onCheckedChange={(checked) => updateFormField("zs", checked)}
            />
            <Label htmlFor="zs" className="text-sm">
              证书类型
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={cancelEdit}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button onClick={isNew ? saveAdd : saveEdit}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            目录列表编辑器
            <Badge variant="secondary">{projects.length} 项</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projects.map((project, index) => (
              <div key={index}>
                {/* 项目展示行 */}
                <div
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    editingIndex === index ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50",
                  )}
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <div className="font-medium text-sm">
                      <span className="text-gray-500 mr-2">#{index + 1}</span>
                      {project.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {project.ml && <span className="bg-gray-100 px-2 py-1 rounded text-xs">{project.ml}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {project.do && (
                        <Badge variant="default" className="text-xs">
                          有做
                        </Badge>
                      )}
                      {project.na && (
                        <Badge variant="secondary" className="text-xs">
                          不在附页
                        </Badge>
                      )}
                      {project.om && (
                        <Badge variant="outline" className="text-xs">
                          仅记录
                        </Badge>
                      )}
                      {project.zs && (
                        <Badge variant="destructive" className="text-xs">
                          证书
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{project.ha && `路由: ${project.ha}`}</div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(index)}
                      disabled={editingIndex !== null || isAddingNew}
                    >
                      <Edit className="w-4 h-4" />
                      修改
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(index)}
                      disabled={editingIndex !== null || isAddingNew}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                </div>

                {/* 编辑表单 */}
                {editingIndex === index && renderEditForm(editForm)}
              </div>
            ))}

            {/* 新增按钮和表单 */}
            <div className="pt-4 border-t">
              {!isAddingNew ? (
                <Button onClick={startAdd} disabled={editingIndex !== null} className="w-full" variant="dashed">
                  <Plus className="w-4 h-4 mr-2" />
                  新增目录项
                </Button>
              ) : (
                renderEditForm(editForm, true)
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作说明 */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>字段说明：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>显示名称：</strong>附录显示名称，需与页面逻辑开关代码保持一致
              </li>
              <li>
                <strong>Hash路由标签：</strong>页面路由标识
              </li>
              <li>
                <strong>目录显示题目：</strong>该分项在报告目录中的文本显示题目
              </li>
              <li>
                <strong>默认有做：</strong>默认包含的分项报告
              </li>
              <li>
                <strong>不在附页：</strong>不在结论报告附页中出现，但出现在目录中
              </li>
              <li>
                <strong>仅记录目录：</strong>仅出现在原始记录目录中
              </li>
              <li>
                <strong>证书类型：</strong>证书类型项目
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
