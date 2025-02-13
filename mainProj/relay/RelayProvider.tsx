"use client";

import {
  createServerSideRelayEnvironment,
  createClientSideRelayEnvironment,
} from "@/relay/environment";
import { useStream } from "@/relay/useStream";
import { useServerInsertedHTML } from "next/navigation";
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

  // This hook comes from Next.js and will execute the callback everytime,
  // something unsuspends, BUT before the piece that unsuspends is streamed to the client.
  // Whatever the callback returns will be inserted as HTML into the response stream.
  //
  // Our approach here is to insert script tags into the HTML that will push the GraphQL responses
  // we received on the server onto the global window object.
  // When the client is re-executing a query during hydration, it can then read the responses
  // belonging to a particular query form the window object and replay them into the Relay store.
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
