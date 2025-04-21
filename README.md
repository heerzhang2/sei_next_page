# 特检院前端  报告模板等
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
relay+next.js整合例子 https://github.com/tobias-tengler/nextjs-relay-streaming-ssr
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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
3. 安装 Node.js 和 PM2（可选，如果使用服务器渲染）
   如果你使用的是 Next.js 的服务器渲染功能，你需要在服务器上安装 Node.js 和 PM2（一个进程管理工具）
4. npm run build  # 如果你使用的是服务器渲染：
   npm run export  # 如果你使用的是静态生成；
5. 配置 Nginx；
6. next.js的文档 https://nextjs.org/docs/app/examples 例子https://github.com/ixartz/Next-js-Boilerplate
7. yarn失败清除： yarn cache clean
8. 开发工具yarn global add react-devtools 其它@clerk/nextjs登录验证,@percy/playwright测试快照，@sentry/nextjs错误监控,vite构建，vitest测试。
   react-hook-form包@hookform/resolvers=表单。  Drizzle ORM数据库; react-icons图标扩展。 use-debounce抖重;
   nextjs+approuter   app目录的路由规则名 [[...sign-in]] ; 正则表达式字面量/relation "photos" does not exist/i.test(e.message)
9. 例子 https://github.com/sambecker/exif-photo-blog Nodejs环境/next-auth是服务端的。 ？根目录/middleware.ts；
   publicRuntimeConfig ; server rendering: Static, Dynamic, and Streaming.默认是Static Rendering显然不行啊；
   await connection()局部做动态的；
10. lucide-react图标库 react-icons; Authentication四大流派：选择题：用OAuth提供程序来替代基于密码的身份验证，还是继续用传统的用户密码直接认证方式？OAuth协议的核心思想就是
    避免用户直接将用户名和密码交给应用程序。 全栈情况next-auth+@prisma/client+CRDB;
11. nextjs-w-app-router-starter-main的认证更接近！ next-auth-example-main扩2个session+JWT/keycloak;
    "autoprefixer": "^10.4.16",
12. useOptimistic useActionState useFormStatus is a React hook and therefore must be used in a Client Component.
13. const rawFormData = Object.fromEntries(formData)。需要注意的是，formData 中会包含额外的 $ACTION_ 属性。
14. <button formAction={save}>Save draft</button>  #授权访问 treat Server Actions like public HTTP endpoints.
15. 改用 usePreloadedQuery？ 建议不采用useLazyLoadQuery的。 nextjs不能直接将服务器端(async)组件作为子组件嵌入到客户端组件中;
    默认app/page.tsx is a Server Component.使用async await 提取/API-数据; export default [文件隔离];
16. 路由包next/navigation: useRouter(), usePathname()  useSearchParams() 'use client'；  并非老版的next/router；
17. 使用Relay进行服务器端渲染可能很复杂! 对Relay组件使用'use client'指令; Next.js官方用useLazyLoadQuery();
    #挑战：Relay 的 loadQuery 和 usePreloadedQuery 通常是为了与 Relay 的环境紧密集成而设计的，它们期望数据是通过 Relay 的网络层获取的。
    在 Next.js 的服务器端渲染上下文中直接使用它们可能会有些棘手，因为你需要模拟 Relay 的网络请求环境。
18. @urql/next 替换Relay?  Urql graphql查询列表时 Cursor 模式分页的例子，详细说明 参数 https://github.com/urql-graphql/urql
    当数据在应用程序中被广泛使用时，@urql建议不要将其作为服务器组件的一部分进行渲染，以便您能够利用客户端缓存的优势。https://commerce.nearform.com/open-source/urql/docs/advanced/server-side-rendering/
19. https://github.com/urql-graphql/urql/tree/main/examples 但urql的Provider也是只能用在client的。
    await getClient().query()可行；
    带'use client'的Layout.tsx可以配合异步的page.tsx; 带"use client"的tsx文件就不能再用ansyc函数组件的。
20. Parallel Route路由app/@modal/(.)photos路由结构：只能传递segment-[(await params).id]，Soft Navigation刷新URL Hard Navigation内容不一致。<Link passHref>
21. 不能在客户端组件中import导入服务器组件;但是支持从上一级组件中child嵌套做法（多绕一层/提前在client组件的父辈组件中的导入嵌套）。将交互逻辑移到一个客户端组件中，保持layout为服务器组件。
22. {children}</ThemeProvider> 'use client';所有客户端组件都能够使用这个上下文。树结构中更深层次使用“use client” ; #使用 Suspense
23. 使用 URL 查询参数或全局状态管理可能是最简单和最直接的方法。router.push(`/first-component-url?result=${encodeURIComponent(data)}`);useEffect(() => { const queryResult = router.query.result
    import { useHydrateAtoms } from 'jotai/utils' jotai;useAtom/useHydrateAtoms客户端用的；useHydrateAtoms()第二个参数是服务端初始化的(第一个参数不限制)；跨路由页面的状态管理
24. page.tsx默认是服务端可改为客户端模式:其参数获取做法不一样！React.use(params) 对比的 async：(await params)；
25. 并行+拦截路由app/@modal/(.)photos/[id]/page.tsx；没太多好处。只有{id}:slug是相等的，内容都不一样，【特点】导航前进后退可以恢复对话框@(奇怪强刷新后退见到@team不正常)。强制刷新后是单独一个页面路由。
    还必须依赖于@modal并发的引入才行：并发路由{@modal}组件装配用处包裹对话框(.)photos拦截路由。
    app/@modal并行路由：用于组合dashboard页面;【特点】(1) @标记并行路由组合：可用上一级的page.tsx来装配；(2)可以Tabs模式局部更新替换URL；不是SPA状态变量方式的。@analytics底下/visitors同类/的Tabs路由形式：
    若强制刷新导致layout.tsx中children会被并行路由底下的子路由/visitors替换掉，前后页面不一致：没强刷新之前的页面是layout.tsx中children也同时显示的，同时URL也同步切换文字的。【不一致】的观感？
    浏览器后退可能导致代码中没输出显示的team并行路由居然主动显示出来了，同时children却没有显示出，古怪啊！。
26. 为何舍弃Relay的：Relay只能采用useLazyLoadQuery，只能use client端用; useFragment只能拆成上下两个组件来组装的接收数据。Relay遇见SSR出现水和报错。
27. 优先用 Tailwind CSS 或 CSS Modules;若需要运行时样式，Emotion 是最推荐的 - 避免用styled-components。
28. 何时不使用服务器组件：交互式 UI 元素/具有客户端交互性的组件/useState/useEffect状态管理/onClick/onChange事件监听处理/class Component在这种情况用客户端组件。
29. React客户端(加了use client的组件)在两种环境中都会运行（在浏览器中管理 DOM，在Server环境中生成初始 HTML /build?）。
30. Cannot import a Server Component into a Client Component:[嵌套多一层分解拼装]在一个父级服务器组件中，你可以同时导入<ClientComponent>和<ServerComponent>，
    并将<ServerComponent>作为<ClientComponent>的子元素传递客户端组件改造为{children=服务端组件}拼装。这情况子组件<ServerComponent>在服务器渲染，远早于<ClientComponent>在客户端渲染。
31. break-after: page;两层CSS引用。[data-print="paged"] > .chapter { page: chapter; }动态切换分页打印横的竖的<article data-print="paged"><section className="chapter">
32. Cookie太长了authjs.session-token:926字符。
33. UI css库？  https://tailwindui.com/components
34. 报告编辑形态重新组织。TwoFrame框架放弃，不用左右滑动切换的/改成手机模态重叠/编辑器默认大屏右边小屏幕弹出框。UI库转用不用css in js。 
35. 基础布局：sticky父元素overflow-y: scroll;父元素height:100vh小于儿子=实际启动滚动;另外兄弟元素高度须足够大，sticky自己高度相对比较小的。只能直接上下级关系的div才有效。
36. 三大问题：Link手机之直接跳编辑。右边导航手机展示。切换8s定时器仅仅在URL切换才有用{刷新也没启动}。
37. @radix-ui/react-tabs 遵循模式非活动的 Tabcontent内容组件都会被卸载的/无法保留状态。
    import { Auth } from "@auth/ core"
    import Credentials from "@auth/ core/ providers/ credentials"
    const request = new Request("https:// example. com")
    const response = await AuthHandler(request, {
    providers: [     Credentials({   
    credentials: {         username: { label: "Username" },         password: {  label: "Password", type: "password" }   
    },   
    async authorize({ request }) {     
    const response = await fetch(request)      
    if(!response. ok) return null         return await response. json() ?? null       }     })   ],   secret: "...",   trustHost: true, })

// 使用会话中的令牌向后端 API 发送请求
const apiUrl = 'https://your-backend-api.com/data';
const apiHeaders = {
Authorization: `Bearer ${session.accessToken}`,
};

try {
const response = await axios.get(apiUrl, { headers: apiHeaders });
const data = response.data;

https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#passing-additional-arguments
https://react.dev/reference/rsc/use-server
可能需要 relay清空
function commitCommentCreateLocally( environment: Environment, feedbackID: string,
) {
return commitLocalUpdate(environment, store => { store.invalidateStore(); }
}); }
import type {NewsfeedQuery as NewsfeedQueryType} from './__generated__/NewsfeedQuery.graphql';
function Newsfeed({}) {
const data = useLazyLoadQuery
<NewsfeedQueryType>
(NewsfeedQuery, {});
...
}
import { graphql } from 'relay-runtime';
const NewsfeedQuery = graphql`
  query NewsfeedQuery {
    topStory {
      title
    }
  }
`;
使用 useLazyLoadQuery 有局限的；预加载数据=另一种防止瀑布流（指一系列依赖请求按顺序执行导致的延迟）的方法是使用预加载模式
Next.js的路由Link点击并没有提供独立的数据加载的纯函数，只有整个路由组件函数的提前加载的功能。不一样概念。<Suspense> 包裹异步preload数据执行代码的异步服务端组件。
<Link href={`/post/${post.id}`} prefetch={true} // 自动预取此链接
https://commerce.nearform.com/open-source/urql/docs/advanced/authentication/
Turbopack 用于 `dev` 环境是稳定的，而用于 `build` 的支持仍处于 alpha 阶段。
