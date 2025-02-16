import 'server-only'
// "use client";

// import { useServerInsertedHTML } from "next/navigation";     //useServerInsertedHTML 依赖于客户端的 React 环境和 DOM，因此它不能在服务器端使用。
import { ReactNode,  } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";


interface RelayProviderProps {
  children: ReactNode;
}
//这个位置改成 async ：就不能算作React组件=里面不能用 #Hooks can only be called inside of the body of a function component.
//不需要水和：仅仅服务器使用的，build阶段:静态网页，增量定时更新的内容，无需鉴别客户的。
export  function ServerRelayProvider({children}: RelayProviderProps) {
  //SSR模式app-*不能用这个的！！ const { data: session } = useSession();
  //ReferenceError: await is not defined  ,也不行的！const session = await auth();
  // const session = await auth();
  // console.log("RelayProvider 2auth=", session);
  const relayEnvironment = createStaticRelayEnvironment();

  return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        {children}
      </RelayEnvironmentProvider>
  );
}
