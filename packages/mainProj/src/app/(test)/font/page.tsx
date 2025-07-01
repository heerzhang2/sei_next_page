"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import React, {useCallback, useState} from "react"
import {ProjectListFormField, } from "@/component/project-list-form";

// 模拟项目数据
const mockProjects = {
  1: { title: "用户认证系统", description: "实现用户登录注册功能" },
  2: { title: "数据库设计", description: "设计用户和权限表结构" },
  3: { title: "API 接口开发", description: "开发 RESTful API" },
  4: { title: "前端界面", description: "React 组件开发" },
  5: { title: "测试用例", description: "单元测试和集成测试" },
  6: { title: "部署配置", description: "Docker 和 CI/CD 配置" },
  7: { title: "文档编写", description: "API 文档和用户手册" },
  8: { title: "性能优化", description: "数据库和前端性能优化" },
  9: { title: "安全加固", description: "安全漏洞检查和修复" },
  10: { title: "监控告警", description: "系统监控和告警配置" },
}

export default function ProjectListEditorDemo() {
  const [modelredos, setModelredos] = useState<number[]>([2, 4, 6])
  const [formData, setFormData] = useState({ projectId: modelredos });
  // 渲染项目标题
  const renderProjectTitle = (index: number) => {
    const project = mockProjects[index as keyof typeof mockProjects]
    if (!project) return `项目 ${index}`

    return (
        <div>
          <div className="font-medium">{project.title}</div>
          <div className="text-sm text-gray-500">{project.description}</div>
        </div>
    )
  }
  // 获取项目链接
  const getProjectLink = (index: number) => {
    return `/project/${index}`
  }
  // 处理项目点击
  const handleProjectClick = (index: number) => {
    console.log(`点击了项目 ${index}`)
    // 这里可以实现路由跳转或其他逻辑
  }
  // 模拟表单提交
  const handleSubmit = async (e) => {
      e.preventDefault()
      // setFormData({ ...formData, projectId: modelredos });
      console.log("提交的项目索引:", formData, "旧的",modelredos )
      // alert(`提交成功！项目索引: [${formData.join(", ")}]`)
  };
  const onItemChanged = useCallback((ids: any) => {
    setFormData({ ...formData, projectId: ids })
  }, [setFormData])
  //renderTitle={function(index: number): React.ReactNode {
  //                       throw new Error("Function not implemented."+index)
  //                   } }
  return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">分项项目列表编辑器</h1>
          <p className="text-gray-600">支持增删改查、拖拽排序、点击跳转的项目管理组件</p>
        </div>
        <form  className="mt-8 space-y-6">
          {/* 表单集成示例 */}
          <Card>
            <CardHeader>
              <CardTitle>表单集成示例</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectListFormField  name={"testajhde"}
                  renderTitle={renderProjectTitle}
                  value={formData.projectId}
                  onChange={onItemChanged}
                  availableProjects={Object.keys(mockProjects).map(Number)}
              />
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">已选择 个项目</div>
                <Button onClick={handleSubmit} >
                  提交表单
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">基础功能:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 添加/删除项目</li>
                  <li>• 上移/下移项目</li>
                  <li>• 点击跳转链接</li>
                  <li>• 清空所有项目</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">高级功能:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 拖拽排序 (可选)</li>
                  <li>• 自定义标题渲染</li>
                  <li>• 最大项目数限制</li>
                  <li>• 表单数据集成</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
