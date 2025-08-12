# Camunda 8 Worker Monorepo

这是一个使用Yarn Workspaces的Monorepo项目，包含一个Camunda 8 Worker服务。

## 项目结构

\`\`\`
camunda-worker-monorepo/
├── packages/
│   └── camunda-worker/     # Camunda 8 Worker服务
├── package.json            # 根项目配置
└── turbo.json              # Turborepo配置
\`\`\`

## 安装

\`\`\`bash
# 安装所有依赖
yarn install
\`\`\`

## 配置

在`packages/camunda-worker`目录下创建一个`.env`文件，参考`.env.example`文件进行配置。

## 开发

\`\`\`bash
# 启动开发模式
yarn dev
\`\`\`
[package.json](../../temp/250416/Tuborepo/package.json)
## 构建

\`\`\`bash
# 构建所有包
yarn build
\`\`\`

## 运行

\`\`\`bash
# 构建后运行
cd packages/camunda-worker
yarn start
\`\`\`

## Camunda 8 Worker

Worker服务会连接到Camunda 8流程引擎，等待类型为`pdf-generation-task`的任务。当收到任务时，它会：

1. 从任务变量中获取数据
2. 发送HTTP请求到`http://localhost:9389/api/pdf`
3. 等待响应
4. 完成任务并返回结果
5. 继续等待下一个任务

确保在Camunda 8中创建的服务任务使用`pdf-generation-task`作为任务类型。

为Next.js配置HTTPS本地开发 + 使用自签名证书启动Next.js应用：；

在本地Node服务器中显式声明允许私有网络访问：
//改page2PdfServer -Node.js服务器的代码：
const cors = require('cors');
app.use(cors({
origin: ['http://localhost:3000', 'https://localhost:3000'], // 允许HTTP和HTTPS
methods: ['GET', 'POST'],
credentials: true
}));

升级Next.js和Node服务到HTTPS
【表格打印调整】  JSON.parse(orc?._tblFixed??'[]')  ; 编辑器3段式窗口总宽度1595px；
**生产服务器部署：**
```shellscript
# 1. 构建应用
yarn build
# 2. 使用 PM2 启动生产环境
pm2 start ecosystem.config.js --env production
# 3. 设置开机自启
pm2 startup
pm2 save
```
