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
        return <div>未登录啊</div>;
    }

  return (
      <>
          <main className="text-xl text-green-500">M需要鉴别身份的路径钱全2data:
              <div>{session.user.name?.[0] ?? session.user.email?.[0]}</div>
              <Link href="/"> Home __</Link>
          </main>
      </>
  );
}
