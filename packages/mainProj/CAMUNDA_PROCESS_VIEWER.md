# Camunda 流程图查看器

在 Next.js 前端集成 Camunda 8 Operate 的流程图展示能力。

## 功能特性

- ✅ 渲染 BPMN 流程图
- ✅ 显示流程实例的节点扭转历史
- ✅ 高亮显示不同状态的节点（已完成、运行中、失败）
- ✅ 显示流程变量
- ✅ 节点耗时统计

## 文件结构

```
packages/mainProj/src/
├── app/
│   ├── api/
│   │   └── camunda/
│   │       └── process-instance/
│   │           └── [processInstanceKey]/
│   │               └── route.ts          # API路由：获取流程实例数据
│   └── camunda/
│       ├── page.tsx                       # 入口页面
│       └── process/
│           └── [processInstanceKey]/
│               └── page.tsx              # 流程实例详情页
└── components/
    └── camunda/
        ├── ProcessDiagramViewer.tsx      # 流程图组件
        ├── FlowNodeList.tsx               # 节点列表组件
        └── ProcessInstanceView.tsx        # 整合视图组件
```

## 使用方法

### 1. 直接访问

访问 `/camunda` 页面，输入流程实例 ID 即可查看。

示例：访问 `http://localhost:3765/camunda/process/2251799814298190`

### 2. 在代码中使用

```tsx
import ProcessDiagramViewer from '@/components/camunda/ProcessDiagramViewer'

function MyComponent() {
    return (
        <ProcessDiagramViewer
            processInstanceKey="2251799814298190"
            height="700px"
        />
    )
}
```

## API 数据结构

### GET /report/api/camunda/process-instance/:processInstanceKey

返回数据结构：

```typescript
{
    success: true,
    data: {
        processInstance: {
            processInstanceKey: string,      // 流程实例ID
            processDefinitionKey: string,   // 流程定义ID
            processDefinitionId: string,     // 流程定义标识
            bpmnProcessId: string,           // BPMN流程ID
            state: string,                   // 流程状态
            startDate: string,              // 开始时间
            endDate: string                  // 结束时间
        },
        bpmnXml: string,                    // BPMN XML
        flowNodes: [                        // 节点历史
            {
                flowNodeInstanceId: string,
                flowNodeId: string,
                flowNodeName: string,
                type: string,
                state: string,              // ACTIVATED, COMPLETED, FAILED, TERMINATED
                startDate: string,
                endDate: string,
                incident?: any
            }
        ],
        variables: Record<string, any>       // 流程变量
    }
}
```

## 节点状态说明

| 状态 | 显示 | 说明 |
|------|------|------|
| COMPLETED | 🟢 绿色边框 | 节点已完成 |
| ACTIVATED | 🔵 蓝色边框+动画 | 节点正在运行 |
| FAILED | 🔴 红色边框 | 节点执行失败 |
| TERMINATED | ⚫ 灰色边框 | 节点已终止 |

## 环境变量配置

在 `.env.local` 中配置 Camunda 连接参数：

```env
# Camunda REST API 地址
CAMUNDA_REST_ADDRESS=http://192.168.171.3:8080

# 认证方式
CAMUNDA_AUTH_STRATEGY=BASIC

# 用户名密码
CAMUNDA_BASIC_AUTH_USERNAME=demo
CAMUNDA_BASIC_AUTH_PASSWORD=demo
```

## 依赖项

已安装：
- `bpmn-js`: BPMN 流程图渲染库
- `@camunda8/orchestration-cluster-api`: Camunda 8 SDK

## 注意事项

1. **服务端渲染限制**：`bpmn-js` 只能在客户端使用，相关组件使用 `'use client'`
2. **权限控制**：API 路由没有添加权限控制，如需限制访问请自行添加
3. **性能考虑**：大量节点时建议使用分页加载
4. **字体加载**：确保 bpmn-font CSS 正确加载，否则图标可能不显示

## 扩展功能

可以进一步扩展的功能：
- 点击节点查看详细信息
- 流程变量编辑功能
- 流程实例重新触发功能
- 导出流程图功能
- 流程对比功能
