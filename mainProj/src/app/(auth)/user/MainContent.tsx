// "use client";

import { Suspense, lazy } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
// import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { auth } from '@/app/auth';
import Link from "next/link";


const SlowContentLazy = lazy(() => import("@/app/(auth)/lazy/SlowContent"));

export async function MainContent() {
    const session = await auth();

    if (!session?.user) {
        return <div>还未成功登录!</div>;
    }
//【问题】session?.user是存在的，也不代表用户登录到了真正后端服务器，仅代表前端服务器有连接信息的。
  return (
      <>
          <main className="text-xl text-green-500">登录后获取当前用户信息:
              用户id={session?.user.id}
              <div>用户名是： {session.user.name ?? session.user.email}</div>
              <Link href="/">回首页</Link>
          </main>
      </>
  );
}
