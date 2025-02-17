import { RELAY_WINDOW_KEY } from "@/relay/environment/helpers";
import { QueryResponsePayload } from "@/relay/environment/server";
import { useCallback, useMemo, useRef } from "react";
import { Observer } from "relay-runtime";

//SSR模式的（给客户机页面）；  服务端的login登录也不是走这个途径的。build场景的服务器构建也不能用这个。
export function useStream() {
  const responseStream = useRef<QueryResponsePayload[]>([]);

  const observer = useMemo(
    () =>
      ({
        next: (response) => responseStream.current.push(response),
      } satisfies Observer<QueryResponsePayload>),
    []
  );

  const buildHydrationScript = useCallback(() => {
    const responses = responseStream.current;

    const scriptContent: string[] = [];
    while (responses.length > 0) {
      const payload = responses.shift();

      if (!payload) {
        break;
      }

      const queryId = payload.queryId;
      const serializedResponse = JSON.stringify(payload.response);

      // Ensure there's a wrapper for the query responses on the window.
      scriptContent.push(
        `window["${RELAY_WINDOW_KEY}"] = window["${RELAY_WINDOW_KEY}"] || {};`
      );
  //报错点：queryId字符串： 可能内部已经包含""引号的。 ["${RELAY_WINDOW_KEY}"]["${queryId}"]  目前都改为['${queryId}']
      // Ensure there's an array on the window object for the given queryId.
      scriptContent.push(
        `window["${RELAY_WINDOW_KEY}"]['${queryId}'] = window["${RELAY_WINDOW_KEY}"]['${queryId}'] || [];`
      );
      scriptContent.push(
        `window["${RELAY_WINDOW_KEY}"]['${queryId}'].push(${serializedResponse});`
      );
    }

    if (scriptContent.length === 0) {
      return null;
    }

    return scriptContent.join("");
  }, []);

  return { observer, buildHydrationScript };
}
