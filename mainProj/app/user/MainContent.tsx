"use client";

import { MainContentQuery } from "@/__generated__/MainContentQuery.graphql";
import { Suspense, lazy } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const SlowContentLazy = lazy(() => import("@/app/lazy/SlowContent"));

export function MainContent() {
  const data = useLazyLoadQuery<MainContentQuery>(
    graphql`
      query MainContentQuery {
        authUser{
                    id,username, person{id,name}
                    dep{id name} office{id name} 
                    unit{id name dvs{id name} }
                    ispUnits{id,unit{id,name}}
                 }
        ...SlowContent 
      }
    `,
    {}
  );
    const router = useRouter();
    console.log("graphql->authUser", data);
    const {authUser} = data;
    //无需登录的URL
    const isPublic=false;//isPublicAccsess(history.location.pathname);
    if(!authUser)
    {
        if(!isPublic){
            // router.push('/login');
            // if (typeof window === "undefined") { } else { window.location.href = "/login"; }
            return null;
        }
    }

  return (
      <>
          <main className="text-xl text-green-500">Main--122data: {data.authUser?.username}</main>
          <main className="text-xl text-green-500">authUser# Main-GRAPHQL data: {authUser?.username}</main>
          <Suspense fallback={<div className="text-yellow-500">Loading slow data...</div>}>
              <SlowContentLazy queryRef={data}/>
          </Suspense>
      </>
  );
}

//排除 不登录的人也允许访问
/**
 * 所有可以不需要登录就允许访问的URI
 * */
function isPublicAccsess(path: string) {
    if (path === '/' || path.slice(0, 6) === '/free/' || path === '/login')
        return true;
    else
        return false;
}
