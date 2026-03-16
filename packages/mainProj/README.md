This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel
打印 lay: {
head: [
'<div style="position: relative; width:100%; text-align:center; border-bottom: 1pt solid #eeeeee; margin: 3.5mm 0px 10px; font-size: 10pt">',
`<div style="position: absolute; width:100%; text-align:left; bottom: 5px; left: 50px;">报告No: ${rep?.isp?.no}</div></div>`
],
foot: [
'<div style="position: relative; width: 100%; text-align: left; border-top: 1pt solid #eeeeee; margin:  10px 0px 1.5mm; font-size: 8pt;">',
'<div style="position: absolute; width: 100%; text-align: center; top: 5px;">共<span>~pageNumber~</span>页 / 第<span>~totalPages~</span>页</div></div>'
],
},

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
确保Server Action只返回必要的数据，不包含任何口令凭证;在Server Action中添加用户认证=限制哪些用户可以启动特定流程;
使用`"use server"`指令的文件中的代码在构建时会被分离;客户端代码只能调用这些函数，但看不到其实现细节;
如何配置思源字体系列并确保跨平台兼容性。核心配置要点：
字体优先级设置：

优先使用 Noto Sans SC (思源黑体)
回退到系统内置中文字体
避免商业字体如微软雅黑
Tailwind CSS 4.1 配置：

使用新的 @theme inline 语法
配置 CSS 变量进行字体管理
支持响应式字体大小
跨平台兼容性：

Windows: 自动下载 Google Fonts
macOS: 回退到 PingFang SC
Linux: 使用 Noto 字体
移动设备: 系统内置字体
性能优化：

使用 next/font/google 优化加载
字体预加载和 display: swap
减少字体闪烁 (FOUT)
渲染优化：

抗锯齿和字体平滑
合适的行高和字间距
中英文混排优化
这个配置确保了在所有主流操作系统上都能获得一致的显示效果，同时避免了商业字体的版权问题。
# 开发和传统部署 需要 `node_modules` 和项目文件部署使用 `next start` 启动
yarn build && yarn start
# PWA 优化（实际上与build构建相同）
yarn build:pwa
# Docker 容器化部署
yarn build:standalone
# 启动生产服务器
yarn start:cluster
# 或使用HTTPS本机测试环境的
yarn start:https

# 更新 shadcn 组件到最新版本有以下几种方法：
# 或者更新多个组件
npx shadcn@latest add button card textarea --overwrite
## 更新所有已安装的组件
npx shadcn@latest add accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input input-otp label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toggle toggle-group tooltip --overwrite
**检查依赖**：更新后可能需要更新相关依赖包
npm update @radix-ui/react-* class-variance-authority clsx tailwind-merge
yarn upgrade-interactive --latest
shadcn/ui 的设计理念是：**不是传统的 npm 包** - 它不会从 `node_modules` 导入组件,而是复制代码到src\components\ui目录的，允许自主修改和扩展组件。
