"use client"

import { ProjectListEditorMobile } from "@/components/project-list-editor-mobile"
import { TouchDragDemo } from "@/components/touch-drag-demo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

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
  const [formData, setFormData] = useState<number[]>([])

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
  const handleSubmit = () => {
    console.log("提交的项目索引:", formData)
    alert(`提交成功！项目索引: [${formData.join(", ")}]`)
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">移动端友好的拖拽列表</h1>
          <p className="text-gray-600">支持桌面端鼠标拖拽和移动端触摸拖拽</p>
        </div>

        {/* 拖拽演示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">简单拖拽演示</h2>
            <TouchDragDemo />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">项目列表编辑器</h2>
            <ProjectListEditorMobile
                title="支持触摸拖拽"
                initialIndexes={[1, 3, 5]}
                availableProjects={Object.keys(mockProjects).map(Number)}
                renderTitle={renderProjectTitle}
                onProjectClick={handleProjectClick}
                dragEnabled={true}
                maxProjects={8}
            />
          </div>
        </div>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle>移动端拖拽优化</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">桌面端支持:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 鼠标拖拽 (mousedown/mousemove/mouseup)</li>
                  <li>• 悬停效果</li>
                  <li>• 精确的拖拽控制</li>
                  <li>• 小尺寸按钮</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">移动端优化:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 触摸拖拽 (touchstart/touchmove/touchend)</li>
                  <li>• 更大的触摸目标 (44px+)</li>
                  <li>• 触摸反馈</li>
                  <li>• 防止页面滚动冲突</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 技术实现</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 统一的事件处理：同时监听鼠标和触摸事件</li>
                <li>• 设备检测：根据设备类型调整UI和交互</li>
                <li>• 拖拽阈值：防止意外触发拖拽</li>
                <li>• 视觉反馈：拖拽时的浮动元素和目标高亮</li>
                <li>• 性能优化：使用 passive 事件监听器</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
