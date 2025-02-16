import 'server-only'

// import { useServerInsertedHTML } from "next/navigation";     //useServerInsertedHTML 依赖于客户端的 React 环境和 DOM，因此它不能在服务器端使用。
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";


/*无法使用 <RelayEnvironmentProvider environment={relayEnvironment}>的：
* */
export const staticRelayEnvironment = createStaticRelayEnvironment();
