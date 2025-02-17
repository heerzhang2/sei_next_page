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
15. 改用 usePreloadedQuery？ 建议不采用useLazyLoadQuery的。

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
使用useLazyLoadQuery有局限的；
