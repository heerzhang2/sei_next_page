"use client";

import {
  createServerSideRelayEnvironment,
  createClientSideRelayEnvironment,
} from "@/relay/environment";
import { useStream } from "@/relay/useStream";
import { useServerInsertedHTML } from "next/navigation";     //useServerInsertedHTML 依赖于客户端的 React 环境和 DOM，因此它不能在服务器端使用。
import { ReactNode, useRef, useMemo } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { useSession } from "next-auth/react"
import {auth} from "@/app/auth";


interface RelayProviderProps {
  children: ReactNode;
}
//这个位置改成 async ：就不能算作React组件=里面不能用 #Hooks can only be called inside of the body of a function component.
export  function RelayProvider({children}: RelayProviderProps) {
  const {observer, buildHydrationScript} = useStream();
  //SSR模式app-*不能用这个的！！ const { data: session } = useSession();
  //ReferenceError: await is not defined  ,也不行的！const session = await auth();
  // const session = await auth();
  // console.log("RelayProvider 2auth=", session);
  const relayEnvironment = useMemo(() => {
    if (typeof window === "undefined") {
      return createServerSideRelayEnvironment(observer);
    } else {
      return createClientSideRelayEnvironment();
    }
  }, []);

  const scriptIndex = useRef(0);

// 这个钩子来自 Next.js，每次有内容取消挂起时都会执行回调函数，
// 但在取消挂起的内容流式传输到客户端之前执行。
// 回调函数返回的内容将作为 HTML 插入到响应流中。
// 我们的方法是在 HTML 中插入脚本标签，这些标签将把我们在服务器上接收到的 GraphQL 响应
// 推送到全局 window 对象上。
// 当客户端在 hydration（水合）过程中重新执行查询时，它可以从 window 对象读取
// 属于特定查询的响应，并将它们重放到 Relay 存储中。
  useServerInsertedHTML(() => {
    const hydrationScript = buildHydrationScript();

    if (!hydrationScript) {
      return null;
    }

    return (
        <script
            key={scriptIndex.current++}
            dangerouslySetInnerHTML={{
              __html: hydrationScript,
            }}
        />
    );
  });

  return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        {children}
      </RelayEnvironmentProvider>
  );
}
