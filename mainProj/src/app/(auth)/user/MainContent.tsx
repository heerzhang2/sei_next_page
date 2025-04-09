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
        return <div>未登录啊!session?.user!session?.user</div>;
    }
//【问题】session?.user是存在的，也不代表用户登录到了真正后端服务器，仅代表前端服务器有连接信息的。
  return (
      <>
          <main className="text-xl text-green-500">M需要鉴别身份的路径钱全2data:
              为啥【{session?.user.id}】有吗
              <div>用户名{session.user.name ?? session.user.email}</div>
              <Link href="/"> Home __</Link>
          </main>
      </>
  );
}
